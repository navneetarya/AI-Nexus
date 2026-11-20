import { describe, expect, it } from 'vitest';
import { getActiveDeal, isDealActive, isExpired, isStale, type Deal } from '../lib/deals';

const base: Deal = {
  tool: 'elevenlabs',
  code: null,
  discount: 'Up to 55% off',
  source: 'https://elevenlabs.io/pricing',
  verifiedISO: '2026-11-20',
  expiresISO: '2026-12-01',
};

const NOW = new Date('2026-11-25T00:00:00Z');

describe('isExpired', () => {
  it('is false for an expiry date in the future', () => {
    expect(isExpired(base, NOW)).toBe(false);
  });
  it('is true the day after expiresISO', () => {
    expect(isExpired({ ...base, expiresISO: '2026-11-24' }, NOW)).toBe(true);
  });
  it('is false on the expiry day itself (still valid through end of day)', () => {
    expect(isExpired({ ...base, expiresISO: '2026-11-25' }, NOW)).toBe(false);
  });
  it('is false for an open-ended offer (no expiresISO)', () => {
    expect(isExpired({ ...base, expiresISO: null }, NOW)).toBe(false);
  });
  it('fails closed (treated as expired) for an unparseable expiresISO', () => {
    expect(isExpired({ ...base, expiresISO: 'not-a-date' }, NOW)).toBe(true);
  });
});

describe('isStale', () => {
  it('is false within the 30-day window', () => {
    expect(isStale(base, NOW)).toBe(false); // verified 5 days before NOW
  });
  it('is true after 30 days', () => {
    expect(isStale({ ...base, verifiedISO: '2026-10-01' }, NOW)).toBe(true);
  });
  it('is true when verifiedISO is missing or invalid', () => {
    expect(isStale({ ...base, verifiedISO: '' }, NOW)).toBe(true);
  });
});

describe('isDealActive / getActiveDeal', () => {
  it('is active only when not expired and not stale', () => {
    expect(isDealActive(base, NOW)).toBe(true);
  });
  it('is inactive once expired, even if recently verified', () => {
    expect(isDealActive({ ...base, expiresISO: '2026-11-20' }, NOW)).toBe(false);
  });
  it('is inactive once stale, even if not yet expired', () => {
    expect(isDealActive({ ...base, verifiedISO: '2026-09-01', expiresISO: '2027-01-01' }, NOW)).toBe(false);
  });
  it('getActiveDeal returns null for a tool with no deal entry', () => {
    expect(getActiveDeal('some-tool-with-no-deal', NOW)).toBeNull();
  });
});
