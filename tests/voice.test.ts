// tests/voice.test.ts  (Phase 5, task 5.3)
//
// Pins every plan boundary of the voice cost calculator (lib/calc/voice.ts).
// Expected values are worked out by hand from the vendor figures, not copied from the output:
//
//   ElevenLabs (credits per month, 1 credit per character)
//     Free 10,000 | Starter 30,000 ($6, $5 annual) | Creator 121,000 ($22, $18.33 annual)
//     Pro 600,000 ($99, $82.50) | Scale 1,800,000 ($299, $249.17) | Business 6,000,000 ($990, $825)
//   Murf AI (secondary-source figures; 900 characters per minute of audio)
//     Creator 24 h a year annual = 1,440 min = 108,000 characters a month; $29 monthly, $19 annual
//       monthly billing: 2 h a month = 120 min = 108,000 characters
//     Business 96 h a year annual = 5,760 min = 432,000 characters a month; $99 monthly, $66 annual
//       monthly billing: 8 h a month = 480 min = 432,000 characters
//
// Run: npm test

import { describe, expect, it } from 'vitest';
import {
  compareVoiceVendors,
  creditsNeeded,
  evaluatePlan,
  minutesNeeded,
  selectPlan,
  validateScenario,
  yearlyFromMonthly,
  type VoiceScenario,
} from '../lib/calc/voice';
import {
  DEFAULT_ASSUMPTIONS,
  MURF_INPUTS,
  buildElevenLabsInputs,
  getVoiceVendor,
  getVoiceVendorInputs,
  type VoicePlan,
  type VoiceVendorInputs,
} from '../lib/calc/voice-inputs';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const base: VoiceScenario = { monthlyCharacters: 1000, commercialUse: true, cloning: 'none', billing: 'monthly' };
const sc = (o: Partial<VoiceScenario> = {}): VoiceScenario => ({ ...base, ...o });

const eleven = (): VoiceVendorInputs => {
  const v = buildElevenLabsInputs();
  if (!v) throw new Error('ElevenLabs facts are not showable');
  return v;
};
const murf = (): VoiceVendorInputs => MURF_INPUTS;

/** Plan name chosen for a vendor, or the status when no self-serve plan is chosen. */
const pick = (v: VoiceVendorInputs, o: Partial<VoiceScenario>): string => {
  const r = selectPlan(v, sc(o));
  return r.status === 'recommended' ? (r.plan as { planName: string }).planName : r.status;
};

/** A minimal plan for fixtures. Numbers are made up and never shown to readers. */
const fixturePlan = (o: Partial<VoicePlan>): VoicePlan => ({
  id: 'x',
  name: 'X',
  isFree: false,
  priceMonthly: 10,
  priceMonthlyBilledAnnually: null,
  custom: false,
  capacity: { kind: 'credits', creditsPerMonth: 1000 },
  commercialUse: true,
  cloning: 'none',
  trialOnly: false,
  confidence: 'vendor-page',
  notes: [],
  ...o,
});
const fixtureVendor = (plans: VoicePlan[]): VoiceVendorInputs => ({
  vendor: 'elevenlabs',
  name: 'Fixture',
  currency: 'USD',
  pricingPageUrl: 'https://example.com/pricing',
  checkedISO: '2026-10-22',
  plans,
});

// ─────────────────────────────────────────────────────────────────────────────
// Input data
// ─────────────────────────────────────────────────────────────────────────────

describe('vendor inputs', () => {
  it('reads ElevenLabs credits and prices from the verified vendor facts', () => {
    const v = eleven();
    const byId = Object.fromEntries(v.plans.map((p) => [p.id, p]));
    expect(byId.free.capacity).toEqual({ kind: 'credits', creditsPerMonth: 10_000 });
    expect(byId.starter.capacity).toEqual({ kind: 'credits', creditsPerMonth: 30_000 });
    expect(byId.creator.capacity).toEqual({ kind: 'credits', creditsPerMonth: 121_000 });
    expect(byId.pro.capacity).toEqual({ kind: 'credits', creditsPerMonth: 600_000 });
    expect(byId.scale.capacity).toEqual({ kind: 'credits', creditsPerMonth: 1_800_000 });
    expect(byId.business.capacity).toEqual({ kind: 'credits', creditsPerMonth: 6_000_000 });
    expect(byId.starter.priceMonthly).toBe(6);
    expect(byId.creator.priceMonthlyBilledAnnually).toBe(18.33);
    expect(byId.enterprise.custom).toBe(true);
  });

  it('lists plans from smallest to largest, which the tie-break relies on', () => {
    const credits = eleven()
      .plans.filter((p) => p.capacity.kind === 'credits')
      .map((p) => (p.capacity.kind === 'credits' ? p.capacity.creditsPerMonth : 0));
    expect(credits).toEqual([...credits].sort((a, b) => a - b));
  });

  it('tags every Murf plan as secondary-source and every ElevenLabs plan as vendor-page', () => {
    expect(murf().plans.every((p) => p.confidence === 'secondary')).toBe(true);
    expect(eleven().plans.every((p) => p.confidence === 'vendor-page')).toBe(true);
  });

  it('returns both vendors, ElevenLabs first', () => {
    expect(getVoiceVendorInputs().map((v) => v.vendor)).toEqual(['elevenlabs', 'murf-ai']);
    expect(getVoiceVendor('murf-ai')?.name).toBe('Murf AI');
  });

  it('uses the stated default assumptions', () => {
    expect(DEFAULT_ASSUMPTIONS).toEqual({ creditsPerCharacter: 1, charactersPerMinute: 900 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Money and unit helpers
// ─────────────────────────────────────────────────────────────────────────────

describe('helpers', () => {
  it('snaps vendor-rounded annual prices to whole dollars', () => {
    expect(yearlyFromMonthly(18.33)).toBe(220); // 219.96
    expect(yearlyFromMonthly(249.17)).toBe(2990); // 2990.04
    expect(yearlyFromMonthly(5)).toBe(60);
    expect(yearlyFromMonthly(82.5)).toBe(990);
    expect(yearlyFromMonthly(825)).toBe(9900);
  });

  it('keeps a genuine fraction of a dollar', () => {
    expect(yearlyFromMonthly(10.5)).toBe(126);
    expect(yearlyFromMonthly(10.04)).toBe(120.48);
  });

  it('converts characters to credits and minutes', () => {
    expect(creditsNeeded(30_000)).toBe(30_000);
    expect(creditsNeeded(30_000, { creditsPerCharacter: 0.5, charactersPerMinute: 900 })).toBe(15_000);
    expect(minutesNeeded(900)).toBe(1);
    expect(minutesNeeded(108_000)).toBe(120);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

describe('validateScenario', () => {
  it('accepts a normal scenario and the edge values 0 and the maximum', () => {
    expect(validateScenario(sc())).toEqual([]);
    expect(validateScenario(sc({ monthlyCharacters: 0 }))).toEqual([]);
    expect(validateScenario(sc({ monthlyCharacters: 1_000_000_000 }))).toEqual([]);
  });

  it.each([
    ['negative characters', { monthlyCharacters: -1 }],
    ['one above the maximum', { monthlyCharacters: 1_000_000_001 }],
    ['NaN', { monthlyCharacters: Number.NaN }],
    ['Infinity', { monthlyCharacters: Number.POSITIVE_INFINITY }],
    ['a string', { monthlyCharacters: '5000' as unknown as number }],
    ['a non-boolean commercial flag', { commercialUse: 'yes' as unknown as boolean }],
    ['an unknown cloning level', { cloning: 'studio' as unknown as VoiceScenario['cloning'] }],
    ['an unknown billing period', { billing: 'weekly' as unknown as VoiceScenario['billing'] }],
  ])('rejects %s', (_label, override) => {
    expect(validateScenario(sc(override as Partial<VoiceScenario>)).length).toBeGreaterThan(0);
  });

  it('rejects out-of-range assumptions at both ends', () => {
    const ok = { creditsPerCharacter: 1, charactersPerMinute: 900 };
    expect(validateScenario(sc(), { ...ok, creditsPerCharacter: 0 }).length).toBe(1);
    expect(validateScenario(sc(), { ...ok, creditsPerCharacter: 10.01 }).length).toBe(1);
    expect(validateScenario(sc(), { ...ok, creditsPerCharacter: 10 })).toEqual([]);
    expect(validateScenario(sc(), { ...ok, charactersPerMinute: 0 }).length).toBe(1);
    expect(validateScenario(sc(), { ...ok, charactersPerMinute: 10_001 }).length).toBe(1);
    expect(validateScenario(sc(), { ...ok, charactersPerMinute: 10_000 })).toEqual([]);
    expect(validateScenario(sc(), { ...ok, creditsPerCharacter: Number.NaN }).length).toBe(1);
  });

  it('makes selectPlan and compareVoiceVendors throw on invalid input', () => {
    expect(() => selectPlan(eleven(), sc({ monthlyCharacters: -5 }))).toThrow(RangeError);
    expect(() => compareVoiceVendors(sc({ billing: 'weekly' as never }))).toThrow(RangeError);
    expect(() => compareVoiceVendors(sc(), { creditsPerCharacter: 0, charactersPerMinute: 900 })).toThrow(RangeError);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ElevenLabs boundaries (commercial use needed)
// ─────────────────────────────────────────────────────────────────────────────

describe('ElevenLabs plan boundaries, commercial use needed', () => {
  // Free has 10,000 credits but is non-commercial, so with commercial use the ladder starts at Starter.
  it.each([
    [0, 'Starter'],
    [1, 'Starter'],
    [29_999, 'Starter'],
    [30_000, 'Starter'], // exactly the Starter allowance still fits
    [30_001, 'Creator'], // one credit over
    [120_999, 'Creator'],
    [121_000, 'Creator'],
    [121_001, 'Pro'],
    [599_999, 'Pro'],
    [600_000, 'Pro'],
    [600_001, 'Scale'],
    [1_799_999, 'Scale'],
    [1_800_000, 'Scale'],
    [1_800_001, 'Business'],
    [5_999_999, 'Business'],
    [6_000_000, 'Business'],
    [6_000_001, 'contact-sales'], // above every self-serve plan: Enterprise is quoted, no price shown
  ])('%i characters a month -> %s', (chars, expected) => {
    expect(pick(eleven(), { monthlyCharacters: chars, commercialUse: true })).toBe(expected);
  });

  it('prices each plan correctly on monthly billing', () => {
    const cost = (chars: number) => selectPlan(eleven(), sc({ monthlyCharacters: chars })).plan?.yearlyCost;
    expect(cost(30_000)).toBe(72); // $6 x 12
    expect(cost(121_000)).toBe(264); // $22 x 12
    expect(cost(600_000)).toBe(1188); // $99 x 12
    expect(cost(1_800_000)).toBe(3588); // $299 x 12
    expect(cost(6_000_000)).toBe(11_880); // $990 x 12
  });

  it('prices each plan correctly on annual billing', () => {
    const cost = (chars: number) =>
      selectPlan(eleven(), sc({ monthlyCharacters: chars, billing: 'annual' })).plan?.yearlyCost;
    expect(cost(30_000)).toBe(60);
    expect(cost(121_000)).toBe(220);
    expect(cost(600_000)).toBe(990);
    expect(cost(1_800_000)).toBe(2990);
    expect(cost(6_000_000)).toBe(9900);
  });

  it('reports the annual saving against monthly billing', () => {
    const save = (chars: number) =>
      selectPlan(eleven(), sc({ monthlyCharacters: chars, billing: 'annual' })).plan?.annualSavings;
    expect(save(30_000)).toBe(12); // 72 - 60
    expect(save(121_000)).toBe(44); // 264 - 220
    expect(save(600_000)).toBe(198); // 1188 - 990
    expect(selectPlan(eleven(), sc({ monthlyCharacters: 30_000, billing: 'monthly' })).plan?.annualSavings).toBeNull();
  });

  it('reports headroom as the share of the allowance left over', () => {
    const head = (chars: number) => selectPlan(eleven(), sc({ monthlyCharacters: chars })).plan?.headroomPercent;
    expect(head(30_000)).toBe(0); // exactly full
    expect(head(15_000)).toBe(50);
    expect(head(0)).toBe(100);
    expect(head(30_001)).toBeCloseTo(((121_000 - 30_001) / 121_000) * 100, 0); // moved up to Creator
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ElevenLabs without commercial use
// ─────────────────────────────────────────────────────────────────────────────

describe('ElevenLabs, commercial use not needed', () => {
  it.each([
    [0, 'Free'],
    [10_000, 'Free'], // exactly the Free allowance
    [10_001, 'Starter'], // one credit over
    [30_000, 'Starter'],
    [30_001, 'Creator'],
  ])('%i characters -> %s', (chars, expected) => {
    expect(pick(eleven(), { monthlyCharacters: chars, commercialUse: false })).toBe(expected);
  });

  it('says the free plan covers the need, at $0', () => {
    const r = selectPlan(eleven(), sc({ monthlyCharacters: 5000, commercialUse: false }));
    expect(r.plan?.yearlyCost).toBe(0);
    expect(r.headline).toMatch(/for free/);
  });

  it('rules Free out by the vendor when commercial use is needed, with a reason', () => {
    const free = selectPlan(eleven(), sc({ monthlyCharacters: 5000 })).considered.find((e) => e.planId === 'free')!;
    expect(free.eligible).toBe(false);
    expect(free.ruledOutByVendor).toBe(true);
    expect(free.reasons.join(' ')).toMatch(/Commercial use is not allowed/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cloning
// ─────────────────────────────────────────────────────────────────────────────

describe('voice cloning', () => {
  it('ElevenLabs: instant cloning starts at Starter, professional at Creator', () => {
    expect(pick(eleven(), { monthlyCharacters: 5000, cloning: 'instant', commercialUse: false })).toBe('Starter');
    expect(pick(eleven(), { monthlyCharacters: 5000, cloning: 'professional', commercialUse: false })).toBe('Creator');
    expect(pick(eleven(), { monthlyCharacters: 5000, cloning: 'none', commercialUse: false })).toBe('Free');
  });

  it('ElevenLabs: professional cloning moves the Starter boundary up to Creator', () => {
    expect(pick(eleven(), { monthlyCharacters: 30_000, cloning: 'professional' })).toBe('Creator');
    expect(pick(eleven(), { monthlyCharacters: 30_000, cloning: 'instant' })).toBe('Starter');
  });

  it('ElevenLabs: higher plans still count as professional cloning', () => {
    expect(pick(eleven(), { monthlyCharacters: 500_000, cloning: 'professional' })).toBe('Pro');
  });

  it('Murf: no self-serve plan lists cloning, so a cloning need falls to contact sales', () => {
    const r = selectPlan(murf(), sc({ monthlyCharacters: 5000, cloning: 'instant' }));
    expect(r.status).toBe('contact-sales');
    expect(r.plan?.planName).toBe('Enterprise');
    expect(r.plan?.monthlyPrice).toBeNull();
    expect(r.plan?.yearlyCost).toBeNull();
    // Creator and Business are ruled out by Murf's own figures, not by missing data.
    const creator = r.considered.find((e) => e.planId === 'creator')!;
    expect(creator.ruledOutByVendor).toBe(true);
    expect(creator.reasons.join(' ')).toMatch(/cloning is not included/i);
  });

  it('Murf: the contact-sales caveat tells the reader to confirm cloning with the vendor', () => {
    const r = selectPlan(murf(), sc({ monthlyCharacters: 5000, cloning: 'professional' }));
    expect(r.caveats.some((c) => /Confirm with the vendor/.test(c))).toBe(true);
    expect(r.caveats.some((c) => /no price is shown/.test(c))).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Murf boundaries (900 characters per minute)
// ─────────────────────────────────────────────────────────────────────────────

describe('Murf plan boundaries, annual billing', () => {
  it.each([
    [0, 'Creator'],
    [108_000, 'Creator'], // 1,440 minutes a year = exactly the 24 hours
    [108_001, 'Business'], // a fraction of a minute over
    [432_000, 'Business'], // 5,760 minutes a year = exactly the 96 hours
    [432_001, 'contact-sales'],
  ])('%i characters a month -> %s', (chars, expected) => {
    expect(pick(murf(), { monthlyCharacters: chars, billing: 'annual' })).toBe(expected);
  });

  it('prices Creator and Business at 12 x the annual per-month price', () => {
    expect(selectPlan(murf(), sc({ monthlyCharacters: 108_000, billing: 'annual' })).plan?.yearlyCost).toBe(228);
    expect(selectPlan(murf(), sc({ monthlyCharacters: 432_000, billing: 'annual' })).plan?.yearlyCost).toBe(792);
  });

  it('reports the annual saving', () => {
    expect(selectPlan(murf(), sc({ monthlyCharacters: 1, billing: 'annual' })).plan?.annualSavings).toBe(120); // 348 - 228
    expect(selectPlan(murf(), sc({ monthlyCharacters: 432_000, billing: 'annual' })).plan?.annualSavings).toBe(396); // 1188 - 792
  });
});

describe('Murf plan boundaries, monthly billing', () => {
  it.each([
    [0, 'Creator'],
    [108_000, 'Creator'], // 120 minutes a month = exactly the 2 hours
    [108_001, 'Business'],
    [432_000, 'Business'], // 480 minutes a month = exactly the 8 hours
    [432_001, 'contact-sales'],
  ])('%i characters a month -> %s', (chars, expected) => {
    expect(pick(murf(), { monthlyCharacters: chars, billing: 'monthly' })).toBe(expected);
  });

  it('prices at the monthly list price', () => {
    expect(selectPlan(murf(), sc({ monthlyCharacters: 108_000 })).plan?.yearlyCost).toBe(348);
    expect(selectPlan(murf(), sc({ monthlyCharacters: 432_000 })).plan?.yearlyCost).toBe(1188);
  });

  it('uses the lower, cautious Business figure (8 hours, not 20)', () => {
    // 20 hours a month would be 1,080,000 characters; the calculator must not accept that on Business.
    expect(pick(murf(), { monthlyCharacters: 1_080_000, billing: 'monthly' })).toBe('contact-sales');
  });
});

describe('Murf Free is a trial and is never recommended', () => {
  it('is skipped even when no commercial use is needed and usage is tiny', () => {
    const r = selectPlan(murf(), sc({ monthlyCharacters: 100, commercialUse: false }));
    expect(r.plan?.planName).toBe('Creator');
    const free = r.considered.find((e) => e.planId === 'free')!;
    expect(free.eligible).toBe(false);
    expect(free.trialOnly).toBe(true);
    expect(free.reasons.join(' ')).toMatch(/trial/i);
  });

  it('shows no usage or headroom for a trial plan', () => {
    const free = selectPlan(murf(), sc({ monthlyCharacters: 100, commercialUse: false })).considered.find(
      (e) => e.planId === 'free',
    )!;
    expect(free.usage).toBeNull();
    expect(free.headroomPercent).toBeNull();
  });
});

describe('assumptions change the Murf boundary', () => {
  it('a slower voice (600 characters a minute) moves the Creator limit down to 72,000 characters', () => {
    const a = { creditsPerCharacter: 1, charactersPerMinute: 600 };
    const pickWith = (chars: number) => {
      const r = selectPlan(murf(), sc({ monthlyCharacters: chars, billing: 'annual' }), a);
      return r.status === 'recommended' ? r.plan?.planName : r.status;
    };
    expect(pickWith(72_000)).toBe('Creator'); // 1,440 minutes a year exactly
    expect(pickWith(72_001)).toBe('Business');
  });

  it('half a credit per character doubles the ElevenLabs boundary', () => {
    const a = { creditsPerCharacter: 0.5, charactersPerMinute: 900 };
    const pickWith = (chars: number) => {
      const r = selectPlan(eleven(), sc({ monthlyCharacters: chars }), a);
      return r.plan?.planName;
    };
    expect(pickWith(60_000)).toBe('Starter'); // 30,000 credits exactly
    expect(pickWith(60_001)).toBe('Creator');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Selection rules (fixture vendors; the numbers are made up)
// ─────────────────────────────────────────────────────────────────────────────

describe('selection rules', () => {
  it('picks the cheapest eligible plan even when a larger plan is listed first', () => {
    const v = fixtureVendor([
      fixturePlan({ id: 'big', name: 'Big', priceMonthly: 50, capacity: { kind: 'credits', creditsPerMonth: 10_000 } }),
      fixturePlan({ id: 'small', name: 'Small', priceMonthly: 10, capacity: { kind: 'credits', creditsPerMonth: 5000 } }),
    ]);
    expect(pick(v, { monthlyCharacters: 100 })).toBe('Small');
  });

  it('breaks a price tie in favour of the plan listed first (the smaller plan)', () => {
    const v = fixtureVendor([
      fixturePlan({ id: 'a', name: 'Smaller', priceMonthly: 20, capacity: { kind: 'credits', creditsPerMonth: 1000 } }),
      fixturePlan({ id: 'b', name: 'Larger', priceMonthly: 20, capacity: { kind: 'credits', creditsPerMonth: 9000 } }),
    ]);
    expect(pick(v, { monthlyCharacters: 500 })).toBe('Smaller');
  });

  it('compares yearly cost, so a cheaper annual price can beat a cheaper monthly price', () => {
    const v = fixtureVendor([
      fixturePlan({ id: 'a', name: 'A', priceMonthly: 10, priceMonthlyBilledAnnually: null }),
      fixturePlan({ id: 'b', name: 'B', priceMonthly: 12, priceMonthlyBilledAnnually: 8 }),
    ]);
    expect(pick(v, { billing: 'monthly' })).toBe('A'); // 120 vs 144
    expect(pick(v, { billing: 'annual' })).toBe('B'); // 120 vs 96
  });

  it('falls back to the monthly price when no annual price exists, and says so', () => {
    const v = fixtureVendor([fixturePlan({ priceMonthly: 10, priceMonthlyBilledAnnually: null })]);
    const r = selectPlan(v, sc({ billing: 'annual' }));
    expect(r.plan?.billingUsed).toBe('monthly');
    expect(r.plan?.yearlyCost).toBe(120);
    expect(r.caveats.some((c) => /no published annual price/.test(c))).toBe(true);
  });

  it('never counts an unverified (null) commercial-use value as a yes', () => {
    const v = fixtureVendor([fixturePlan({ commercialUse: null })]);
    const r = selectPlan(v, sc({ commercialUse: true }));
    expect(r.status).toBe('no-match');
    const e = r.considered[0];
    expect(e.eligible).toBe(false);
    expect(e.ruledOutByVendor).toBe(false); // unknown, not "no"
    expect(e.reasons.join(' ')).toMatch(/not verified/);
  });

  it('does not need commercial-use data when commercial use is not required', () => {
    const v = fixtureVendor([fixturePlan({ commercialUse: null })]);
    expect(pick(v, { commercialUse: false })).toBe('X');
  });

  it('never counts an unverified (null) cloning value as a yes', () => {
    const v = fixtureVendor([fixturePlan({ cloning: null })]);
    expect(selectPlan(v, sc({ cloning: 'instant' })).status).toBe('no-match');
    expect(pick(v, { cloning: 'none' })).toBe('X');
  });

  it('never counts an unverified price as eligible', () => {
    const v = fixtureVendor([fixturePlan({ priceMonthly: null, priceMonthlyBilledAnnually: null })]);
    const r = selectPlan(v, sc());
    expect(r.status).toBe('no-match');
    expect(r.considered[0].yearlyCost).toBeNull();
  });

  it('never counts an unverified Murf-style allowance as eligible', () => {
    const noAnnual = fixturePlan({
      capacity: { kind: 'audio-minutes', perYearOnAnnual: null, perMonthOnMonthly: 600, oneTime: null },
    });
    const noMonthly = fixturePlan({
      capacity: { kind: 'audio-minutes', perYearOnAnnual: 7200, perMonthOnMonthly: null, oneTime: null },
    });
    expect(selectPlan(fixtureVendor([noAnnual]), sc({ billing: 'annual' })).status).toBe('no-match');
    expect(selectPlan(fixtureVendor([noAnnual]), sc({ billing: 'monthly' })).status).toBe('recommended');
    expect(selectPlan(fixtureVendor([noMonthly]), sc({ billing: 'monthly' })).status).toBe('no-match');
    expect(selectPlan(fixtureVendor([noMonthly]), sc({ billing: 'annual' })).status).toBe('recommended');
  });

  it('offers a contact-sales plan only when the vendor does not rule it out', () => {
    const custom = fixturePlan({
      id: 'ent',
      name: 'Enterprise',
      custom: true,
      priceMonthly: null,
      capacity: { kind: 'custom' },
      commercialUse: false,
    });
    const v = fixtureVendor([fixturePlan({ capacity: { kind: 'credits', creditsPerMonth: 100 } }), custom]);
    // Needs more than the self-serve plan has, and the vendor says Enterprise is non-commercial: no fallback.
    expect(selectPlan(v, sc({ monthlyCharacters: 5000, commercialUse: true })).status).toBe('no-match');
    // Without the commercial requirement the contact-sales plan is offered, with no price.
    const r = selectPlan(v, sc({ monthlyCharacters: 5000, commercialUse: false }));
    expect(r.status).toBe('contact-sales');
    expect(r.plan?.yearlyCost).toBeNull();
    expect(r.plan?.usage).toBeNull();
    expect(r.plan?.headroomPercent).toBeNull();
  });

  it('prefers a priced plan over contact sales whenever one fits', () => {
    const custom = fixturePlan({ id: 'ent', name: 'Enterprise', custom: true, priceMonthly: null, capacity: { kind: 'custom' } });
    const v = fixtureVendor([fixturePlan({}), custom]);
    expect(pick(v, { monthlyCharacters: 10 })).toBe('X');
  });

  it('treats a $0 monthly price as free and never reports a saving for it', () => {
    const v = fixtureVendor([fixturePlan({ isFree: true, priceMonthly: 0 })]);
    const r = selectPlan(v, sc({ commercialUse: false, billing: 'annual' }));
    expect(r.plan?.yearlyCost).toBe(0);
    expect(r.plan?.annualSavings).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Both vendors
// ─────────────────────────────────────────────────────────────────────────────

describe('compareVoiceVendors', () => {
  it('says ElevenLabs is cheaper for a small commercial script on annual billing', () => {
    // ElevenLabs Starter $60 vs Murf Creator $228.
    const c = compareVoiceVendors(sc({ monthlyCharacters: 20_000, billing: 'annual' }));
    expect(c.cheaper).toBe('elevenlabs');
    expect(c.yearlyDifference).toBe(168);
  });

  it('says Murf is cheaper where its plan is cheaper (432,000 characters a month, annual)', () => {
    // ElevenLabs Pro $990 (600,000 credits) vs Murf Business $792.
    const c = compareVoiceVendors(sc({ monthlyCharacters: 432_000, billing: 'annual' }));
    expect(c.cheaper).toBe('murf-ai');
    expect(c.yearlyDifference).toBe(198);
  });

  it('flags every comparison that touches Murf as resting on unconfirmed figures', () => {
    expect(compareVoiceVendors(sc()).involvesUnconfirmedFigures).toBe(true);
  });

  it('returns no winner when only one vendor has a priced recommendation', () => {
    // 700,000 characters: ElevenLabs Scale fits; Murf has nothing above 432,000 so it is contact sales.
    const c = compareVoiceVendors(sc({ monthlyCharacters: 700_000, billing: 'annual' }));
    expect(c.results.find((r) => r.vendor === 'murf-ai')?.status).toBe('contact-sales');
    expect(c.cheaper).toBeNull();
    expect(c.yearlyDifference).toBeNull();
  });

  it('puts the Murf confirmation note first in the Murf caveats', () => {
    const m = compareVoiceVendors(sc()).results.find((r) => r.vendor === 'murf-ai')!;
    expect(m.caveats[0]).toMatch(/independent pages/);
    const e = compareVoiceVendors(sc()).results.find((r) => r.vendor === 'elevenlabs')!;
    expect(e.caveats.some((c) => /independent pages/.test(c))).toBe(false);
  });

  it('does not change the inputs it is given', () => {
    const s = sc({ monthlyCharacters: 50_000 });
    const copy = { ...s };
    compareVoiceVendors(s);
    expect(s).toEqual(copy);
  });

  it('is deterministic', () => {
    const s = sc({ monthlyCharacters: 250_000, billing: 'annual' });
    expect(JSON.stringify(compareVoiceVendors(s))).toBe(JSON.stringify(compareVoiceVendors(s)));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// evaluatePlan: the pieces the result cards read
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluatePlan', () => {
  it('reports usage in the right unit for each billing mode', () => {
    const creator = murf().plans.find((p) => p.id === 'creator')!;
    const annual = evaluatePlan(creator, sc({ monthlyCharacters: 54_000, billing: 'annual' }));
    expect(annual.usage).toEqual({ unit: 'minutes per year', needed: 720, included: 1440 });
    expect(annual.headroomPercent).toBe(50);
    const monthly = evaluatePlan(creator, sc({ monthlyCharacters: 54_000, billing: 'monthly' }));
    expect(monthly.usage).toEqual({ unit: 'minutes per month', needed: 60, included: 120 });
    expect(monthly.headroomPercent).toBe(50);
  });

  it('is eligible with exactly zero headroom, and floors headroom at 0 when over', () => {
    const starter = eleven().plans.find((p) => p.id === 'starter')!;
    const exact = evaluatePlan(starter, sc({ monthlyCharacters: 30_000 }));
    expect(exact.eligible).toBe(true);
    expect(exact.headroomPercent).toBe(0);
    const over = evaluatePlan(starter, sc({ monthlyCharacters: 30_001 }));
    expect(over.eligible).toBe(false);
    expect(over.headroomPercent).toBe(0);
    expect(over.reasons.join(' ')).toMatch(/Needs 30,001 credits a month; the plan includes 30,000/);
  });

  it('does not accumulate floating-point error at the boundary', () => {
    // 0.1 credits per character x 300,000 characters = 30,000.000000000004 in floating point.
    const starter = eleven().plans.find((p) => p.id === 'starter')!;
    const a = { creditsPerCharacter: 0.1, charactersPerMinute: 900 };
    expect(evaluatePlan(starter, sc({ monthlyCharacters: 300_000 }), a).eligible).toBe(true);
  });

  it('gives a contact-sales plan no price, usage or headroom', () => {
    const ent = eleven().plans.find((p) => p.id === 'enterprise')!;
    const e = evaluatePlan(ent, sc());
    expect(e.eligible).toBe(false);
    expect(e.custom).toBe(true);
    expect(e.monthlyPrice).toBeNull();
    expect(e.yearlyCost).toBeNull();
    expect(e.usage).toBeNull();
  });
});
