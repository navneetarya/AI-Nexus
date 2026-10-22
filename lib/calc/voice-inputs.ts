// lib/calc/voice-inputs.ts  (Phase 5, task 5.1)
//
// Numeric inputs for the voice cost calculator: prices, allowances and units for
// ElevenLabs and Murf AI, plus the conversion assumptions that turn "characters per month"
// into each vendor's own unit. The selection logic lives in lib/calc/voice.ts.
//
// WHERE THE NUMBERS COME FROM
//  - ElevenLabs: prices, credits and commercial use are READ from lib/vendor-facts.data.json
//    (verified against elevenlabs.io/pricing on 2026-10-22), so they cannot drift from the
//    pricing tracker. Only the cloning tier and the credit conversion are added here, taken
//    from the same official pricing page (checked 2026-10-22).
//  - Murf AI: murf.ai/pricing could not be opened when this was written. These figures are the
//    CONSENSUS of several independent pages that republish Murf's Studio plans (checked
//    2026-10-22). Every Murf plan is therefore tagged confidence "secondary", and
//    MURF_CONFIRMATION_NOTE must be shown next to Murf results until someone confirms the
//    numbers on murf.ai and flips the tag to "vendor-page".
//
// RULES (same as lib/vendor-facts.ts)
//  - null means "not verified", never "no". The selection code treats null as "do not rely on it".
//  - Promotions are never stored (for example ElevenLabs' discounted first month of Creator).
//  - Nothing is estimated except the two labelled ASSUMPTIONS below, which the UI shows and
//    lets the reader change.

import { getVerifiedFacts } from '../vendor-facts';

export type VoiceVendorId = 'elevenlabs' | 'murf-ai';

/** Where a plan's numbers were checked. "secondary" = not read from the vendor's own page. */
export type Confidence = 'vendor-page' | 'secondary';

export type CloningLevel = 'none' | 'instant' | 'professional';

/** Cloning tiers ordered by capability, so a plan can be compared to a requirement. */
export const CLONING_RANK: Record<CloningLevel, number> = { none: 0, instant: 1, professional: 2 };

/** ElevenLabs bills credits per month. Murf bills audio time, which depends on the billing period. */
export type Capacity =
  | { kind: 'credits'; creditsPerMonth: number }
  | {
      kind: 'audio-minutes';
      /** Minutes of generated audio per year on annual billing. null = not verified. */
      perYearOnAnnual: number | null;
      /** Minutes of generated audio per month on monthly billing. null = not verified. */
      perMonthOnMonthly: number | null;
      /** Total minutes that are never renewed (a free trial pool). null = none. */
      oneTime: number | null;
    }
  | { kind: 'custom' };

export interface VoicePlan {
  id: string;
  name: string;
  isFree: boolean;
  /** List price per month, billed monthly. null = not published / not verified. */
  priceMonthly: number | null;
  /** Effective price per month when billed annually. null = no annual option or not verified. */
  priceMonthlyBilledAnnually: number | null;
  /** "Contact sales" plan: no price, no fixed allowance. */
  custom: boolean;
  capacity: Capacity;
  /** true = vendor says allowed, false = vendor says not allowed, null = not verified. */
  commercialUse: boolean | null;
  /** Highest cloning tier included. null = not verified. */
  cloning: CloningLevel | null;
  /** A taster, not a plan to work on (for example Murf Free: 10 minutes in total, no downloads). */
  trialOnly: boolean;
  confidence: Confidence;
  /** Short reader-facing notes: limits, disputes between sources. */
  notes: string[];
}

export interface VoiceVendorInputs {
  vendor: VoiceVendorId;
  name: string;
  currency: 'USD';
  pricingPageUrl: string;
  /** Date the numbers were checked (YYYY-MM-DD). */
  checkedISO: string;
  plans: VoicePlan[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Conversion assumptions (stated, never hidden)
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversionAssumptions {
  /**
   * ElevenLabs credits consumed per text character. VENDOR-STATED: 1 credit per character for the
   * V1 and V2 Multilingual models. The Flash/Turbo models cost 0.5 to 1 credit per character on
   * the API, "depending on the model", and the rate for the newer v3/v4 models is not stated, so
   * the calculator uses 1 (the conservative figure) unless the reader changes it.
   */
  creditsPerCharacter: number;
  /**
   * Characters of script per minute of finished speech. OUR ASSUMPTION, not a vendor figure:
   * about 150 spoken words a minute x 6 characters per word (letters, space and punctuation)
   * = 900. Murf bills audio TIME, so this is the only way to translate a script length into
   * Murf's allowance. Real speed varies with voice, pace and language.
   */
  charactersPerMinute: number;
}

export const DEFAULT_ASSUMPTIONS: ConversionAssumptions = {
  creditsPerCharacter: 1,
  charactersPerMinute: 900,
};

export const ASSUMPTION_TEXT = {
  creditsPerCharacter:
    'ElevenLabs charges 1 credit per character on its standard Multilingual models. Flash and Turbo models cost 0.5 to 1 credit per character through the API, so a Flash-only workload can need fewer credits. The rate for v3 and v4 is not published, so 1 is used.',
  charactersPerMinute:
    'Murf measures audio time, not characters. This calculator assumes 900 characters of script per minute of audio (about 150 words a minute). That is our estimate, not a Murf figure. Slower voices and pauses use more minutes per character.',
} as const;

/** Shown next to every Murf result while the figures are not confirmed on murf.ai. */
export const MURF_CONFIRMATION_NOTE =
  'Murf plan figures come from several independent pages that republish Murf\u2019s Studio pricing, not from murf.ai itself. Confirm the price and hours on murf.ai/pricing before you buy.';

/** Stated once, applies to ElevenLabs results. */
export const ELEVENLABS_SCOPE_NOTES: readonly string[] = [
  'Credits roll over for up to two months on a paid plan. The calculator ignores rollover and compares one month of use with one month of credits.',
  'Add-on credits and overage prices are not verified, so they are not included.',
  'Credits are shared by every ElevenLabs product (speech-to-text, music, dubbing, sound effects). The calculator counts text-to-speech only.',
];

export const MURF_SCOPE_NOTES: readonly string[] = [
  'Murf\u2019s Studio plans are metered in hours of generated audio. Annual billing gives a yearly pool, so the calculator compares 12 months of your use with the yearly hours.',
  'Murf\u2019s separate API is pay-as-you-go per character and is not part of these Studio plans.',
];

// ─────────────────────────────────────────────────────────────────────────────
// ElevenLabs: read from vendor-facts, annotate with cloning
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cloning tier per ElevenLabs plan id, from the official pricing page's plan lists:
 * Starter lists "Instant Voice Cloning", Creator adds "Professional Voice Cloning", and
 * higher plans are "everything in Creator, plus". Free lists neither. Enterprise is custom
 * and not itemised, so it is left null.
 */
const ELEVENLABS_CLONING: Record<string, CloningLevel | null> = {
  free: 'none',
  starter: 'instant',
  creator: 'professional',
  pro: 'professional',
  scale: 'professional',
  business: 'professional',
  enterprise: null,
};

export function buildElevenLabsInputs(): VoiceVendorInputs | null {
  const facts = getVerifiedFacts('elevenlabs');
  if (!facts || facts.currency !== 'USD' || !facts.pricingPageUrl || !facts.verifiedISO) return null;

  const plans: VoicePlan[] = facts.plans.map((p) => {
    const a = p.allowance;
    const capacity: Capacity =
      p.customPricing || !a || a.unit !== 'credits' || a.period !== 'month' || a.amount === null
        ? { kind: 'custom' }
        : { kind: 'credits', creditsPerMonth: a.amount };
    return {
      id: p.id,
      name: p.name,
      isFree: p.isFree,
      priceMonthly: p.priceMonthly,
      priceMonthlyBilledAnnually: p.priceMonthlyBilledAnnually,
      custom: p.customPricing,
      capacity,
      commercialUse: p.commercialUse,
      cloning: p.id in ELEVENLABS_CLONING ? ELEVENLABS_CLONING[p.id] : null,
      trialOnly: false,
      confidence: 'vendor-page' as const,
      notes: p.notes ? [p.notes] : [],
    };
  });

  return {
    vendor: 'elevenlabs',
    name: facts.name,
    currency: 'USD',
    pricingPageUrl: facts.pricingPageUrl,
    checkedISO: facts.verifiedISO,
    plans,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Murf AI: consensus of secondary sources (see header)
// ─────────────────────────────────────────────────────────────────────────────

const HOUR = 60;

export const MURF_INPUTS: VoiceVendorInputs = {
  vendor: 'murf-ai',
  name: 'Murf AI',
  currency: 'USD',
  pricingPageUrl: 'https://murf.ai/pricing',
  checkedISO: '2026-10-22',
  plans: [
    {
      id: 'free',
      name: 'Free',
      isFree: true,
      priceMonthly: 0,
      priceMonthlyBilledAnnually: null,
      custom: false,
      // 10 minutes of voice generation in total, not per month.
      capacity: { kind: 'audio-minutes', perYearOnAnnual: null, perMonthOnMonthly: null, oneTime: 10 },
      commercialUse: false,
      cloning: 'none',
      trialOnly: true,
      confidence: 'secondary',
      notes: ['10 minutes of voice generation in total, not per month. No downloads and no commercial rights.'],
    },
    {
      id: 'creator',
      name: 'Creator',
      isFree: false,
      priceMonthly: 29,
      priceMonthlyBilledAnnually: 19,
      custom: false,
      // 24 hours per year on annual billing; on monthly billing the same plan is reported as about 2 hours a month.
      capacity: { kind: 'audio-minutes', perYearOnAnnual: 24 * HOUR, perMonthOnMonthly: 2 * HOUR, oneTime: null },
      commercialUse: true,
      cloning: 'none',
      trialOnly: false,
      confidence: 'secondary',
      notes: [
        'One page lists 48 hours a year; most list 24. The calculator uses 24.',
        'Annual billing is a yearly pool of hours; monthly billing is reported as a monthly one.',
      ],
    },
    {
      id: 'business',
      name: 'Business',
      isFree: false,
      priceMonthly: 99,
      priceMonthlyBilledAnnually: 66,
      custom: false,
      // 96 hours per year on annual billing; monthly billing reported as 8 hours a month by most pages.
      capacity: { kind: 'audio-minutes', perYearOnAnnual: 96 * HOUR, perMonthOnMonthly: 8 * HOUR, oneTime: null },
      commercialUse: true,
      cloning: 'none',
      trialOnly: false,
      confidence: 'secondary',
      notes: [
        'Sources disagree on monthly billing: most say 8 hours a month, a few say 20. The calculator uses 8, the lower figure.',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      isFree: false,
      priceMonthly: null,
      priceMonthlyBilledAnnually: null,
      custom: true,
      capacity: { kind: 'custom' },
      commercialUse: true,
      // Pages say voice cloning is an Enterprise feature but do not say which type.
      cloning: null,
      trialOnly: false,
      confidence: 'secondary',
      notes: ['Custom pricing. Unlimited voice generation and voice cloning are reported as Enterprise features.'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Entry point used by lib/calc/voice.ts
// ─────────────────────────────────────────────────────────────────────────────

/** All vendors the calculator can show. A vendor whose facts are not showable is left out. */
export function getVoiceVendorInputs(): VoiceVendorInputs[] {
  const eleven = buildElevenLabsInputs();
  return eleven ? [eleven, MURF_INPUTS] : [MURF_INPUTS];
}

/** Plans of one vendor, or null when that vendor is unavailable. */
export function getVoiceVendor(vendor: VoiceVendorId): VoiceVendorInputs | null {
  return getVoiceVendorInputs().find((v) => v.vendor === vendor) ?? null;
}
