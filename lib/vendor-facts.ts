// lib/vendor-facts.ts
//
// SINGLE SOURCE OF TRUTH for verified vendor facts (prices, allowances, free-plan
// limits, commercial-use rights) shown by the verdict card, the pricing tracker,
// the cost calculators and the "Find my AI tool" matcher.
//
// WHY THIS EXISTS
// Plan 1-3 all repeat the same facts. If each feature carried its own copy, they
// would drift apart and one stale number would damage trust everywhere at once.
// The data lives in lib/vendor-facts.data.json (plain JSON so prerender.mjs and the
// validators can read it with JSON.parse, the same way blog/answer-blocks.json is
// read). This file holds the types and the small pure helpers that turn facts
// into display strings.
//
// THE RULES (enforced by validate_vendor_facts.py, task 1.12)
//   1. null means "not verified". It never means "no". Use false only when the
//      vendor's own page states the thing is not included.
//   2. An entry with status "pending" is never shown to readers. getVerifiedFacts()
//      returns null for it, so UI code cannot leak unverified numbers.
//   3. status "verified" requires an https pricingPageUrl on the vendor's own
//      domain and a verifiedISO date (YYYY-MM-DD).
//   4. If a value cannot be verified from an official page, leave it null/empty
//      and the UI omits that row. Never estimate.
//   5. Card text (bestFor / skipIf) is condensed from existing site copy. It must
//      not introduce new claims. Word limits live in "rules" in the JSON file.
//   6. slug must match the slug of the same tool in constants.ts.
//
// TEMPLATE for a verified entry (placeholders only, not real figures):
//   {
//     "slug": "<same slug as constants.ts>",
//     "name": "<vendor name>",
//     "status": "verified",
//     "pricingPageUrl": "https://<vendor-domain>/<pricing-page>",
//     "verifiedISO": "YYYY-MM-DD",
//     "currency": "USD",
//     "freeAccess": "free-plan",            // "free-plan" | "trial-only" | "none"
//     "trial": null,                        // or { "days": <n|null>, "cardRequired": <true|false|null> }
//     "plans": [
//       {
//         "id": "free", "name": "<vendor's plan name>", "isFree": true,
//         "priceMonthly": 0, "priceMonthlyBilledAnnually": null, "oneTimePrice": null,
//         "customPricing": false,
//         "allowance": { "amount": <n>, "unit": "credits", "period": "month", "label": "<n> credits/month" },
//         "commercialUse": false,
//         "highlights": ["<short, vendor-stated feature>"],
//         "notes": null
//       }
//     ],
//     "card": { "bestFor": "<=12 words", "skipIf": "<=15 words" },
//     "indiaNote": null,                    // only if the vendor documents payment/GST/UPI details
//     "sources": [{ "label": "Terms of service", "url": "https://<vendor-domain>/terms" }]
//   }

import RAW from './vendor-facts.data.json';

export const VENDOR_FACTS_SCHEMA_VERSION = 1;

export type AllowanceUnit =
  | 'characters' | 'credits' | 'minutes' | 'hours' | 'words' | 'tasks'
  | 'operations' | 'prompts' | 'images' | 'videos' | 'slides' | 'seats' | 'other';

export type AllowancePeriod = 'day' | 'month' | 'year' | 'one-time';

export interface Allowance {
  /** Numeric amount, or null when the vendor states it only in words ("unlimited"). */
  amount: number | null;
  unit: AllowanceUnit;
  /** Vendor's own word when unit is 'other' (for example "AI generations"). */
  unitLabel?: string;
  period: AllowancePeriod;
  /** Display text, for example "10,000 credits/month". Keep it close to the vendor's wording. */
  label: string;
}

export interface PlanFact {
  /** Stable key inside the tool, for example "free" or "starter". */
  id: string;
  /** The vendor's own plan name. */
  name: string;
  isFree: boolean;
  /** List price per month when billed monthly, in the tool's currency. null = unknown / not published. */
  priceMonthly: number | null;
  /** Effective price per month when billed annually. null = no annual option or unknown. */
  priceMonthlyBilledAnnually: number | null;
  /** One-off or lifetime price. null = not applicable or unknown. */
  oneTimePrice: number | null;
  /** True when the vendor only offers "contact sales" pricing. */
  customPricing: boolean;
  allowance: Allowance | null;
  /** true = vendor states commercial use is allowed, false = states it is not, null = unverified. */
  commercialUse: boolean | null;
  /** Short, vendor-stated features. Keep to a few lines. */
  highlights: string[];
  notes: string | null;
}

export type FreeAccess = 'free-plan' | 'trial-only' | 'none';

export interface TrialFact {
  /** Trial length in days, or null when the vendor does not state it. */
  days: number | null;
  /** true = card needed to start, false = no card needed, null = unverified. */
  cardRequired: boolean | null;
}

export interface CardText {
  /** At most rules.bestForMaxWords words. */
  bestFor: string;
  /** At most rules.skipIfMaxWords words. */
  skipIf: string;
}

export interface SourceLink {
  label: string;
  url: string;
}

export type FactStatus = 'pending' | 'verified';

export interface ToolFacts {
  /** Must match Tool.slug in constants.ts. */
  slug: string;
  name: string;
  status: FactStatus;
  /** The official pricing page the numbers were checked against (https, vendor domain). */
  pricingPageUrl: string | null;
  /** Date the numbers were checked, YYYY-MM-DD. */
  verifiedISO: string | null;
  /** ISO 4217 code that every price in this entry is expressed in. */
  currency: string;
  freeAccess: FreeAccess | null;
  trial: TrialFact | null;
  plans: PlanFact[];
  card: CardText | null;
  /** Payment, GST or UPI notes, only when the vendor documents them. */
  indiaNote: string | null;
  /** Other official pages used (terms, FAQ, licensing). */
  sources: SourceLink[];
}

export interface VendorFactsRules {
  bestForMaxWords: number;
  skipIfMaxWords: number;
  /** After this many days a verified entry counts as stale (warn, do not fail the build). */
  staleAfterDays: number;
}

export interface VendorFactsFile {
  schemaVersion: number;
  /** Date the file was last edited, YYYY-MM-DD. null until the first verified batch lands. */
  updatedISO: string | null;
  rules: VendorFactsRules;
  tools: ToolFacts[];
}

const FILE = RAW as unknown as VendorFactsFile;

export const VENDOR_FACTS_RULES: VendorFactsRules = FILE.rules;
export const ALL_TOOL_FACTS: readonly ToolFacts[] = FILE.tools;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Any entry for this slug, verified or not. Use for tooling, not for reader-facing UI. */
export function getToolFacts(slug: string): ToolFacts | null {
  return ALL_TOOL_FACTS.find((t) => t.slug === slug) ?? null;
}

/**
 * Reader-facing guard. Returns the entry only when it is verified AND complete
 * enough to show: https source, valid date, at least one plan. Everything that
 * renders facts to readers must go through this function.
 */
export function getVerifiedFacts(slug: string): ToolFacts | null {
  const f = getToolFacts(slug);
  return f && isShowable(f) ? f : null;
}

export function isShowable(f: ToolFacts): boolean {
  return (
    f.status === 'verified' &&
    typeof f.pricingPageUrl === 'string' &&
    f.pricingPageUrl.startsWith('https://') &&
    typeof f.verifiedISO === 'string' &&
    ISO_DATE.test(f.verifiedISO) &&
    f.plans.length > 0
  );
}

function parseISODateUTC(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Whole days since the entry was verified, or null if it has no valid date. */
export function daysSinceVerified(f: ToolFacts, now: Date = new Date()): number | null {
  if (!f.verifiedISO) return null;
  const d = parseISODateUTC(f.verifiedISO);
  if (!d) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

export function isStale(f: ToolFacts, now: Date = new Date()): boolean {
  const days = daysSinceVerified(f, now);
  return days === null || days > VENDOR_FACTS_RULES.staleAfterDays;
}

/** "Prices verified 22 Oct 2026". Returns null when there is no valid date. */
export function verifiedLabel(f: ToolFacts): string | null {
  if (!f.verifiedISO) return null;
  const d = parseISODateUTC(f.verifiedISO);
  if (!d) return null;
  const text = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(d);
  return `Prices verified ${text}`;
}

/** "$6", "$8.17", "₹1,000". Whole numbers show no decimals. */
export function formatPrice(amount: number, currency: string): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Lowest-priced paid plan that has a published price, or null. */
export function cheapestPaidPlan(f: ToolFacts): PlanFact | null {
  let best: PlanFact | null = null;
  let bestPrice = Infinity;
  for (const p of f.plans) {
    if (p.isFree) continue;
    const prices = [p.priceMonthly, p.priceMonthlyBilledAnnually].filter(
      (n): n is number => typeof n === 'number',
    );
    if (prices.length === 0) continue;
    const lowest = Math.min(...prices);
    if (lowest < bestPrice) {
      best = p;
      bestPrice = lowest;
    }
  }
  return best;
}

/**
 * "From $6/month", "From $8.17/month, billed annually", "$99 one-time",
 * "Custom pricing". Returns null when nothing is published, so the UI omits the row.
 */
export function startsAtLabel(f: ToolFacts): string | null {
  const plan = cheapestPaidPlan(f);
  if (plan) {
    const monthly = plan.priceMonthly;
    const annual = plan.priceMonthlyBilledAnnually;
    if (typeof monthly === 'number' && (typeof annual !== 'number' || monthly <= annual)) {
      return `From ${formatPrice(monthly, f.currency)}/month`;
    }
    if (typeof annual === 'number') {
      return `From ${formatPrice(annual, f.currency)}/month, billed annually`;
    }
  }
  const oneTime = f.plans.find((p) => !p.isFree && typeof p.oneTimePrice === 'number');
  if (oneTime && typeof oneTime.oneTimePrice === 'number') {
    return `${formatPrice(oneTime.oneTimePrice, f.currency)} one-time`;
  }
  if (f.plans.some((p) => !p.isFree && p.customPricing)) return 'Custom pricing';
  return null;
}

/**
 * One line for the card's "Free plan" row, for example
 * "10,000 credits/month, not for commercial use" or "No free plan, 7-day trial".
 * Returns null when free access has not been verified.
 */
export function freePlanLabel(f: ToolFacts): string | null {
  if (f.freeAccess === 'free-plan') {
    const free = f.plans.find((p) => p.isFree);
    if (!free) return null;
    const parts: string[] = [];
    if (free.allowance?.label) parts.push(free.allowance.label);
    if (free.commercialUse === false) parts.push('not for commercial use');
    if (free.commercialUse === true) parts.push('commercial use allowed');
    return parts.length > 0 ? parts.join(', ') : 'Free plan available';
  }
  if (f.freeAccess === 'trial-only') {
    const days = f.trial?.days;
    return typeof days === 'number' ? `No free plan, ${days}-day trial` : 'No free plan, free trial available';
  }
  if (f.freeAccess === 'none') return 'No free plan or trial';
  return null;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Human-readable problems with the card text; empty array means it passes. */
export function cardTextProblems(card: CardText | null): string[] {
  if (!card) return ['card text missing'];
  const problems: string[] = [];
  const { bestForMaxWords, skipIfMaxWords } = VENDOR_FACTS_RULES;
  if (!card.bestFor.trim()) problems.push('bestFor is empty');
  else if (wordCount(card.bestFor) > bestForMaxWords) problems.push(`bestFor is over ${bestForMaxWords} words`);
  if (!card.skipIf.trim()) problems.push('skipIf is empty');
  else if (wordCount(card.skipIf) > skipIfMaxWords) problems.push(`skipIf is over ${skipIfMaxWords} words`);
  return problems;
}
