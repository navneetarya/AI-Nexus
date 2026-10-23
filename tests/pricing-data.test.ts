import { describe, expect, it } from 'vitest';
import { freeAccessText, type SnapshotTool } from '../lib/pricing-data';

const base: SnapshotTool = {
  slug: 'x', name: 'X', category: null, currency: 'USD', pricingPageUrl: 'https://x.example/pricing',
  verifiedISO: '2026-10-23', freeAccess: 'free-plan', trialDays: null,
  startsAtMonthly: null, startsAtMonthlyBilledAnnually: null, plans: [],
};

describe('freeAccessText', () => {
  it('describes each verified state', () => {
    expect(freeAccessText(base)).toBe('Free plan');
    expect(freeAccessText({ ...base, freeAccess: 'trial-only', trialDays: 7 })).toBe('No free plan, 7-day trial');
    expect(freeAccessText({ ...base, freeAccess: 'none' })).toBe('No free plan or trial');
  });
  it('never says "no free plan" when free access is unverified', () => {
    expect(freeAccessText({ ...base, freeAccess: null })).toBe('Not verified');
  });
});
