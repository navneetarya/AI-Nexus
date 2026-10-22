// lib/calc/voice.ts  (Phase 5, task 5.2)
//
// Plan selection for the voice cost calculator. Pure functions only: no Date, no randomness,
// no DOM, so the prerendered page and the live page always agree and the tests (task 5.3) can
// pin every plan boundary.
//
// FOUR INPUTS (VoiceScenario)
//   monthlyCharacters  characters of script generated in a typical month
//   commercialUse      will the audio be published or sold? (true = a plan must allow it)
//   cloning            the cloning tier needed: "none" | "instant" | "professional"
//   billing            "monthly" or "annual"
//
// HOW A PLAN IS CHOSEN
//   1. A plan is ELIGIBLE only if every requirement is verified as met. An unverified (null)
//      value never counts as a yes.
//   2. Of the eligible self-serve plans, the cheapest per year wins. Ties go to the smaller plan.
//   3. If no self-serve plan fits, a "contact sales" plan is offered, with its price left empty.
//   4. A trial-only plan (for example Murf Free) is shown as considered but never recommended.
//
// Units: ElevenLabs is compared in credits per month; Murf in minutes of audio, per year on
// annual billing and per month on monthly billing. See lib/calc/voice-inputs.ts for where each
// number comes from and for the two stated conversion assumptions.

import {
  CLONING_RANK,
  DEFAULT_ASSUMPTIONS,
  ELEVENLABS_SCOPE_NOTES,
  MURF_CONFIRMATION_NOTE,
  MURF_SCOPE_NOTES,
  getVoiceVendorInputs,
  type CloningLevel,
  type Confidence,
  type ConversionAssumptions,
  type VoicePlan,
  type VoiceVendorId,
  type VoiceVendorInputs,
} from './voice-inputs';

export type BillingPeriod = 'monthly' | 'annual';

export interface VoiceScenario {
  monthlyCharacters: number;
  commercialUse: boolean;
  cloning: CloningLevel;
  billing: BillingPeriod;
}

export const MAX_MONTHLY_CHARACTERS = 1_000_000_000;

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

/** Returns reader-facing problems. An empty array means the scenario can be evaluated. */
export function validateScenario(
  s: VoiceScenario,
  a: ConversionAssumptions = DEFAULT_ASSUMPTIONS,
): string[] {
  const problems: string[] = [];
  if (typeof s.monthlyCharacters !== 'number' || !Number.isFinite(s.monthlyCharacters)) {
    problems.push('Enter the characters you generate per month as a number.');
  } else if (s.monthlyCharacters < 0) {
    problems.push('Characters per month cannot be negative.');
  } else if (s.monthlyCharacters > MAX_MONTHLY_CHARACTERS) {
    problems.push(`Characters per month is above ${fmtInt(MAX_MONTHLY_CHARACTERS)}. Ask the vendor for a quote.`);
  }
  if (typeof s.commercialUse !== 'boolean') problems.push('Say whether the audio is for commercial use.');
  if (!(s.cloning in CLONING_RANK)) problems.push('Choose a cloning option.');
  if (s.billing !== 'monthly' && s.billing !== 'annual') problems.push('Choose monthly or annual billing.');
  if (!Number.isFinite(a.creditsPerCharacter) || a.creditsPerCharacter <= 0 || a.creditsPerCharacter > 10) {
    problems.push('Credits per character must be above 0 and at most 10.');
  }
  if (!Number.isFinite(a.charactersPerMinute) || a.charactersPerMinute <= 0 || a.charactersPerMinute > 10_000) {
    problems.push('Characters per minute must be above 0 and at most 10,000.');
  }
  return problems;
}

// ─────────────────────────────────────────────────────────────────────────────
// Unit conversion and money helpers
// ─────────────────────────────────────────────────────────────────────────────

/** ElevenLabs credits needed for a month of text-to-speech. */
export function creditsNeeded(monthlyCharacters: number, a: ConversionAssumptions = DEFAULT_ASSUMPTIONS): number {
  return monthlyCharacters * a.creditsPerCharacter;
}

/** Minutes of finished audio per month, from the stated characters-per-minute assumption. */
export function minutesNeeded(monthlyCharacters: number, a: ConversionAssumptions = DEFAULT_ASSUMPTIONS): number {
  return monthlyCharacters / a.charactersPerMinute;
}

/**
 * 12 x a per-month price, snapped to a whole dollar when vendor rounding put it a few cents off
 * (for example ElevenLabs lists Creator as $18.33 a month on annual billing, which is $220 a year).
 */
export function yearlyFromMonthly(perMonth: number): number {
  const raw = Math.round(perMonth * 12 * 100) / 100;
  const whole = Math.round(raw);
  return Math.abs(raw - whole) <= 0.05 ? whole : raw;
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** One decimal at most: "2 hours", "1.5 hours". */
function fmtMinutes(min: number): string {
  if (min >= 120) {
    const h = Math.round((min / 60) * 10) / 10;
    return `${h.toLocaleString('en-US')} hours`;
  }
  const m = Math.round(min * 10) / 10;
  return `${m.toLocaleString('en-US')} minutes`;
}

/** Tolerance so that 108,000 characters at 900 per minute is exactly 120 minutes, not 120.0000001. */
const EPS = 1e-9;
const fits = (needed: number, included: number): boolean => needed <= included * (1 + EPS);

// ─────────────────────────────────────────────────────────────────────────────
// One plan
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanUsage {
  /** What the allowance is measured in. */
  unit: 'credits per month' | 'minutes per month' | 'minutes per year';
  needed: number;
  included: number;
}

export interface PlanEvaluation {
  planId: string;
  planName: string;
  /** true = every requirement is verified as met and the plan has a price. */
  eligible: boolean;
  /** Why the plan was ruled out (empty when eligible). Reader-facing sentences. */
  reasons: string[];
  /** true when the vendor's own figures say a requirement is NOT met (as opposed to "not verified"). */
  ruledOutByVendor: boolean;
  custom: boolean;
  trialOnly: boolean;
  confidence: Confidence;
  /** Billing the price below is for. Falls back to "monthly" if no annual price is published. */
  billingUsed: BillingPeriod;
  /** Effective price per month for billingUsed. null for contact-sales or unverified prices. */
  monthlyPrice: number | null;
  /** Cost for 12 months. null for contact-sales or unverified prices. */
  yearlyCost: number | null;
  /** Yearly saving from annual billing versus paying monthly. null when it does not apply. */
  annualSavings: number | null;
  usage: PlanUsage | null;
  /** Share of the allowance left over, 0 to 100. null when there is no fixed allowance. */
  headroomPercent: number | null;
  notes: string[];
}

export function evaluatePlan(
  plan: VoicePlan,
  scenario: VoiceScenario,
  a: ConversionAssumptions = DEFAULT_ASSUMPTIONS,
): PlanEvaluation {
  const reasons: string[] = [];
  let ruledOutByVendor = false;
  const notes = [...plan.notes];

  // ── Price for the chosen billing period ───────────────────────────────────
  let billingUsed: BillingPeriod = scenario.billing;
  let monthlyPrice: number | null = null;
  let yearlyCost: number | null = null;
  let annualSavings: number | null = null;

  if (!plan.custom) {
    if (plan.isFree || plan.priceMonthly === 0) {
      monthlyPrice = 0;
      yearlyCost = 0;
    } else if (scenario.billing === 'annual' && plan.priceMonthlyBilledAnnually !== null) {
      monthlyPrice = plan.priceMonthlyBilledAnnually;
      yearlyCost = yearlyFromMonthly(plan.priceMonthlyBilledAnnually);
      if (plan.priceMonthly !== null) {
        const saving = yearlyFromMonthly(plan.priceMonthly) - yearlyCost;
        annualSavings = saving > 0 ? Math.round(saving * 100) / 100 : null;
      }
    } else if (plan.priceMonthly !== null) {
      if (scenario.billing === 'annual') {
        billingUsed = 'monthly';
        notes.push('No annual discount is published for this plan, so the monthly price is used.');
      }
      monthlyPrice = plan.priceMonthly;
      yearlyCost = yearlyFromMonthly(plan.priceMonthly);
    } else {
      reasons.push('The price is not verified.');
    }
  }

  // ── Requirements ──────────────────────────────────────────────────────────
  if (plan.trialOnly) {
    ruledOutByVendor = true;
    reasons.push('This is a trial allowance, not a plan to work on.');
  }

  if (scenario.commercialUse) {
    if (plan.commercialUse === false) {
      ruledOutByVendor = true;
      reasons.push('Commercial use is not allowed on this plan.');
    }
    else if (plan.commercialUse === null) reasons.push('Commercial use is not verified for this plan.');
  }

  if (scenario.cloning !== 'none') {
    const have = plan.cloning;
    if (have === null) {
      reasons.push('Voice cloning is not itemised for this plan.');
    } else if (CLONING_RANK[have] < CLONING_RANK[scenario.cloning]) {
      ruledOutByVendor = true;
      reasons.push(
        have === 'none'
          ? 'Voice cloning is not included.'
          : `Only ${have} voice cloning is included; you need ${scenario.cloning}.`,
      );
    }
  }

  // ── Allowance ─────────────────────────────────────────────────────────────
  let usage: PlanUsage | null = null;
  let headroomPercent: number | null = null;
  const cap = plan.capacity;

  if (cap.kind === 'credits') {
    const needed = creditsNeeded(scenario.monthlyCharacters, a);
    usage = { unit: 'credits per month', needed, included: cap.creditsPerMonth };
    if (!fits(needed, cap.creditsPerMonth)) {
      ruledOutByVendor = true;
      reasons.push(`Needs ${fmtInt(needed)} credits a month; the plan includes ${fmtInt(cap.creditsPerMonth)}.`);
    }
  } else if (cap.kind === 'audio-minutes') {
    const perMonth = minutesNeeded(scenario.monthlyCharacters, a);
    if (!plan.trialOnly) {
      if (scenario.billing === 'annual') {
        if (cap.perYearOnAnnual === null) {
          reasons.push('The yearly allowance is not verified.');
        } else {
          const needed = perMonth * 12;
          usage = { unit: 'minutes per year', needed, included: cap.perYearOnAnnual };
          if (!fits(needed, cap.perYearOnAnnual)) {
            ruledOutByVendor = true;
            reasons.push(`Needs about ${fmtMinutes(needed)} of audio a year; the plan includes ${fmtMinutes(cap.perYearOnAnnual)}.`);
          }
        }
      } else if (cap.perMonthOnMonthly === null) {
        reasons.push('The monthly-billing allowance is not verified.');
      } else {
        usage = { unit: 'minutes per month', needed: perMonth, included: cap.perMonthOnMonthly };
        if (!fits(perMonth, cap.perMonthOnMonthly)) {
          ruledOutByVendor = true;
          reasons.push(`Needs about ${fmtMinutes(perMonth)} of audio a month; the plan includes ${fmtMinutes(cap.perMonthOnMonthly)}.`);
        }
      }
    }
  }

  if (usage && usage.included > 0) {
    headroomPercent = Math.max(0, Math.round(((usage.included - usage.needed) / usage.included) * 1000) / 10);
  }

  // Contact-sales plans have no price and no fixed allowance, so they are "eligible" only as a
  // fallback (see selectPlan). Their `reasons` hold only requirements the vendor states are NOT met.
  const eligible = !plan.custom && reasons.length === 0;

  return {
    planId: plan.id,
    planName: plan.name,
    eligible,
    reasons,
    ruledOutByVendor,
    custom: plan.custom,
    trialOnly: plan.trialOnly,
    confidence: plan.confidence,
    billingUsed,
    monthlyPrice,
    yearlyCost,
    annualSavings,
    usage,
    headroomPercent,
    notes,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// One vendor
// ─────────────────────────────────────────────────────────────────────────────

export type SelectionStatus =
  /** A self-serve plan fits every requirement. */
  | 'recommended'
  /** No self-serve plan fits; the vendor's contact-sales plan might. */
  | 'contact-sales'
  /** Nothing fits (for example a trial-only free plan is all that is left, or a requirement is ruled out). */
  | 'no-match';

export interface VendorResult {
  vendor: VoiceVendorId;
  name: string;
  status: SelectionStatus;
  /** The chosen plan (self-serve), or the contact-sales plan. null when status is "no-match". */
  plan: PlanEvaluation | null;
  /** Every plan, in the vendor's order, with the reasons each one was ruled out. */
  considered: PlanEvaluation[];
  /** Worst confidence among the figures that decided the result. */
  confidence: Confidence;
  /** One sentence for the result card header. */
  headline: string;
  /** Caveats the page must show with this result. */
  caveats: string[];
  pricingPageUrl: string;
  checkedISO: string;
}

/** A contact-sales plan is a fallback only if the vendor does not state a requirement is unmet. */
function contactSalesFits(plan: VoicePlan, e: PlanEvaluation): boolean {
  return plan.custom && !e.ruledOutByVendor;
}

export function selectPlan(
  vendor: VoiceVendorInputs,
  scenario: VoiceScenario,
  a: ConversionAssumptions = DEFAULT_ASSUMPTIONS,
): VendorResult {
  const problems = validateScenario(scenario, a);
  if (problems.length) throw new RangeError(`Invalid voice scenario: ${problems.join(' ')}`);

  const evals = vendor.plans.map((p) => evaluatePlan(p, scenario, a));

  // Cheapest eligible self-serve plan; ties keep the earlier (smaller) plan.
  let best: PlanEvaluation | null = null;
  for (const e of evals) {
    if (!e.eligible || e.yearlyCost === null) continue;
    if (best === null || e.yearlyCost < (best.yearlyCost as number)) best = e;
  }

  let status: SelectionStatus = 'no-match';
  let chosen: PlanEvaluation | null = null;
  if (best) {
    status = 'recommended';
    chosen = best;
  } else {
    const idx = vendor.plans.findIndex((p, i) => contactSalesFits(p, evals[i]));
    if (idx !== -1) {
      status = 'contact-sales';
      chosen = evals[idx];
    }
  }

  // ── Caveats ──────────────────────────────────────────────────────────────
  const caveats: string[] = [];
  if (vendor.vendor === 'elevenlabs') caveats.push(...ELEVENLABS_SCOPE_NOTES);
  if (vendor.vendor === 'murf-ai') caveats.push(...MURF_SCOPE_NOTES);

  const anySecondary = vendor.plans.some((p) => p.confidence === 'secondary');
  if (anySecondary) caveats.unshift(MURF_CONFIRMATION_NOTE);

  if (status === 'contact-sales' && chosen) {
    caveats.push(`No ${vendor.name} plan with a published price fits these needs. ${chosen.planName} is quoted by the vendor, so no price is shown.`);
    for (const r of chosen.reasons) caveats.push(`Confirm with the vendor: ${r}`);
  }
  if (status === 'recommended' && chosen?.billingUsed === 'monthly' && scenario.billing === 'annual') {
    caveats.push('This plan has no published annual price, so its monthly price is shown.');
  }

  const headline =
    status === 'recommended' && chosen
      ? chosen.yearlyCost === 0
        ? `${vendor.name} ${chosen.planName} covers this for free.`
        : `${vendor.name} ${chosen.planName} is the cheapest plan that fits.`
      : status === 'contact-sales'
        ? `No ${vendor.name} plan with a published price fits.`
        : `No ${vendor.name} plan fits these needs.`;

  const confidence: Confidence = chosen ? chosen.confidence : anySecondary ? 'secondary' : 'vendor-page';

  return {
    vendor: vendor.vendor,
    name: vendor.name,
    status,
    plan: chosen,
    considered: evals,
    confidence,
    headline,
    caveats,
    pricingPageUrl: vendor.pricingPageUrl,
    checkedISO: vendor.checkedISO,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Both vendors
// ─────────────────────────────────────────────────────────────────────────────

export interface VoiceComparison {
  scenario: VoiceScenario;
  assumptions: ConversionAssumptions;
  results: VendorResult[];
  /**
   * Vendor with the lower yearly cost among self-serve recommendations.
   * "tie" = equal cost. null = fewer than two vendors have a priced recommendation.
   */
  cheaper: VoiceVendorId | 'tie' | null;
  /** Yearly difference between the two recommendations (always >= 0), or null when `cheaper` is null. */
  yearlyDifference: number | null;
  /** true when the comparison rests on a figure that was not read from the vendor's own page. */
  involvesUnconfirmedFigures: boolean;
}

export function compareVoiceVendors(
  scenario: VoiceScenario,
  a: ConversionAssumptions = DEFAULT_ASSUMPTIONS,
): VoiceComparison {
  const problems = validateScenario(scenario, a);
  if (problems.length) throw new RangeError(`Invalid voice scenario: ${problems.join(' ')}`);

  const results = getVoiceVendorInputs().map((v) => selectPlan(v, scenario, a));

  const priced = results.filter((r) => r.status === 'recommended' && r.plan?.yearlyCost != null);
  let cheaper: VoiceComparison['cheaper'] = null;
  let yearlyDifference: number | null = null;
  if (priced.length >= 2) {
    const [x, y] = priced;
    const cx = x.plan!.yearlyCost as number;
    const cy = y.plan!.yearlyCost as number;
    yearlyDifference = Math.round(Math.abs(cx - cy) * 100) / 100;
    cheaper = cx === cy ? 'tie' : cx < cy ? x.vendor : y.vendor;
  }

  return {
    scenario,
    assumptions: a,
    results,
    cheaper,
    yearlyDifference,
    involvesUnconfirmedFigures: results.some((r) => r.confidence === 'secondary'),
  };
}
