// tests/verdict-card.fixtures.ts  (Phase 2, task 2.1)
//
// Fixtures for rendering <VerdictCard /> in isolation. Nothing in the site imports
// this file. The synthetic fixtures use made-up values on purpose: they exist to
// exercise layout (long text, missing rows) and are never shown to readers.
import type { ToolFacts } from '../lib/vendor-facts';

const base: ToolFacts = {
  slug: 'fixture-tool',
  name: 'Fixture Tool',
  status: 'verified',
  pricingPageUrl: 'https://example.com/pricing',
  verifiedISO: '2026-10-22',
  currency: 'USD',
  freeAccess: 'free-plan',
  trial: null,
  plans: [
    {
      id: 'free', name: 'Free', isFree: true, priceMonthly: 0, priceMonthlyBilledAnnually: null,
      oneTimePrice: null, customPricing: false,
      allowance: { amount: 1000, unit: 'credits', period: 'month', label: '1,000 credits/month' },
      commercialUse: false, highlights: [], notes: null,
    },
    {
      id: 'pro', name: 'Pro', isFree: false, priceMonthly: 10, priceMonthlyBilledAnnually: 8,
      oneTimePrice: null, customPricing: false, allowance: null,
      commercialUse: true, highlights: [], notes: null,
    },
  ],
  card: { bestFor: 'Solo creators who want quick results', skipIf: 'You need team seats or enterprise controls' },
  indiaNote: null,
  sources: [],
};

/** Typical card: free plan, annual price lower than monthly. */
export const fixtureFull: ToolFacts = base;

/** No free plan, trial only. */
export const fixtureTrialOnly: ToolFacts = {
  ...base,
  slug: 'fixture-trial',
  name: 'Trial Tool',
  freeAccess: 'trial-only',
  trial: { days: 7, cardRequired: null },
  plans: [base.plans[1]],
};

/** Nothing priced and no card text: only the CTA, date and disclosure should remain. */
export const fixtureMinimal: ToolFacts = {
  ...base,
  slug: 'fixture-minimal',
  name: 'Minimal Tool',
  freeAccess: null,
  plans: [{ ...base.plans[1], priceMonthly: null, priceMonthlyBilledAnnually: null }],
  card: null,
};

/** Long unbroken text and a long tool name, for overflow checks at 375px. */
export const fixtureLongText: ToolFacts = {
  ...base,
  slug: 'fixture-long',
  name: 'An Unreasonably Long Product Name Platform',
  freeAccess: 'free-plan',
  plans: [
    {
      ...base.plans[0],
      allowance: {
        amount: 1000, unit: 'credits', period: 'month',
        label: '1,000,000,000 AI-generation-credits/month-with-an-extremelylongunbrokenwordthatcouldoverflow',
      },
    },
    base.plans[1],
  ],
  card: {
    bestFor: 'Supercalifragilisticexpialidocious_unbrokenstring creators and agencies',
    skipIf: 'You need anything beyond the extraordinarily-hyphenated-and-wordy-limit here',
  },
};

export const verdictCardFixtures = { fixtureFull, fixtureTrialOnly, fixtureMinimal, fixtureLongText };
