// tests/voice-calculator.test.tsx  (Phase 5, task 5.5)
//
// Renders the calculator on the server (the same path the prerender uses) for the scenarios the plan
// boundary tests pin, and checks the page shows the right plan, price and caveats.

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_VOICE_SCENARIO,
  VoiceCalculator,
  comparisonSentence,
  fmtMoney,
  makeMoney,
  parseCharacters,
  usageText,
} from '../components/VoiceCalculator';
import { FX_CONFIRMATION_NOTE, USD_INR_REFERENCE } from '../lib/calc/fx';
import { compareVoiceVendors, evaluatePlan, type VoiceScenario } from '../lib/calc/voice';
import { MURF_INPUTS } from '../lib/calc/voice-inputs';

const html = (initialScenario: Partial<VoiceScenario> = {}, props: Partial<React.ComponentProps<typeof VoiceCalculator>> = {}) =>
  renderToStaticMarkup(<VoiceCalculator initialScenario={initialScenario} {...props} />);
const text = (h: string) => h.replace(/<[^>]*>/g, ' ').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');

describe('parseCharacters', () => {
  it.each([
    ['50000', 50_000],
    ['50,000', 50_000],
    ['50 000', 50_000],
    ['  50k ', 50_000],
    ['50K', 50_000],
    ['1.5m', 1_500_000],
    ['1.1k', 1_100],
    ['0', 0],
    ['.5k', 500],
    ['-5', -5],
  ])('reads %j as %i', (raw, n) => expect(parseCharacters(raw)).toBe(n));

  it.each([[''], ['  '], ['abc'], ['--5'], ['5k5'], ['1,2,3x'], ['1e3'], ['50 k m']])('rejects %j', (raw) =>
    expect(Number.isNaN(parseCharacters(raw))).toBe(true),
  );
});

describe('formatting', () => {
  it('shows whole dollars without cents and fractions with two decimals', () => {
    expect(fmtMoney(0)).toBe('$0');
    expect(fmtMoney(220)).toBe('$220');
    expect(fmtMoney(11_880)).toBe('$11,880');
    expect(fmtMoney(120.48)).toBe('$120.48');
  });

  it('words usage in the unit the vendor uses', () => {
    const s = (o: Partial<VoiceScenario>): VoiceScenario => ({ ...DEFAULT_VOICE_SCENARIO, ...o });
    const creator = MURF_INPUTS.plans.find((p) => p.id === 'creator')!;
    expect(usageText(evaluatePlan(creator, s({ monthlyCharacters: 54_000, billing: 'annual' })))).toBe(
      'about 12 hours of 24 hours audio a year',
    );
    expect(usageText(evaluatePlan(creator, s({ monthlyCharacters: 54_000, billing: 'monthly' })))).toBe(
      'about 60 minutes of 2 hours audio a month',
    );
  });
});

describe('default scenario (50,000 characters, commercial, annual)', () => {
  const h = html();
  const t = text(h);

  it('renders both result cards without a browser', () => {
    expect(h).toContain('data-calc-result="elevenlabs"');
    expect(h).toContain('data-calc-result="murf-ai"');
  });

  it('recommends ElevenLabs Creator at $220 and Murf Creator at $228 a year', () => {
    // 50,000 credits is over Starter's 30,000, so Creator. Murf: 50,000/900 x 12 = 667 min of 1,440.
    expect(t).toContain('ElevenLabs Creator is the cheapest plan that fits');
    expect(t).toContain('$220 a year');
    expect(t).toContain('Murf AI Creator is the cheapest plan that fits');
    expect(t).toContain('$228 a year');
    expect(t).toContain('ElevenLabs Creator is cheaper by $8 a year');
  });

  it('shows the Murf confirmation notice and the not-confirmed badge', () => {
    expect(t).toMatch(/not from murf\.ai itself/);
    expect(t).toContain('Not yet confirmed on the vendor page');
    expect(t).toContain('Read from the vendor page');
    expect(t).toContain('have not yet been confirmed on murf.ai');
  });

  it('lists every plan that was checked, with reasons', () => {
    expect(t).toContain('How each ElevenLabs plan was checked');
    expect(t).toContain('Commercial use is not allowed on this plan.');
    expect(t).toContain('This is a trial allowance');
  });

  it('shows no affiliate wording or sponsored links when none are passed', () => {
    expect(h).not.toContain('sponsored');
    expect(t).not.toContain('affiliate links');
  });

  it('links to the official pricing pages without sponsored attributes', () => {
    expect(h).toContain('href="https://elevenlabs.io/pricing"');
    expect(h).toContain('href="https://murf.ai/pricing"');
  });
});

describe('scenarios from the plan boundary tests', () => {
  it('30,000 characters, commercial, monthly: ElevenLabs Starter at $72 a year', () => {
    const t = text(html({ monthlyCharacters: 30_000, billing: 'monthly' }));
    expect(t).toContain('ElevenLabs Starter is the cheapest plan that fits');
    expect(t).toContain('$72 a year');
    expect(t).toContain('0% left over');
  });

  it('30,001 characters moves ElevenLabs up to Creator', () => {
    expect(text(html({ monthlyCharacters: 30_001, billing: 'monthly' }))).toContain('ElevenLabs Creator is the cheapest plan that fits');
  });

  it('5,000 characters, not commercial: ElevenLabs Free covers it for free', () => {
    const t = text(html({ monthlyCharacters: 5000, commercialUse: false }));
    expect(t).toContain('ElevenLabs Free covers this for free');
    expect(t).toContain('Free plan');
  });

  it('432,000 characters, annual: Murf Business at $792 beats ElevenLabs Pro at $990', () => {
    const t = text(html({ monthlyCharacters: 432_000, billing: 'annual' }));
    expect(t).toContain('Murf AI Business is cheaper by $198 a year');
    expect(t).toContain('$792 a year');
    expect(t).toContain('$990 a year');
  });

  it('700,000 characters: Murf goes to contact sales and no price comparison is made', () => {
    const t = text(html({ monthlyCharacters: 700_000, billing: 'annual' }));
    expect(t).toContain('Contact sales');
    expect(t).toContain('No price is published, so none is shown.');
    expect(t).toContain('Only ElevenLabs has a plan with a published price');
  });

  it('cloning on Murf falls to contact sales and tells the reader to confirm with the vendor', () => {
    const t = text(html({ monthlyCharacters: 5000, cloning: 'professional' }));
    expect(t).toContain('Confirm with the vendor');
    expect(t).toContain('ElevenLabs Creator is the cheapest plan that fits');
  });

  it('labels contact-sales plans as unpriced rather than ruled out', () => {
    const t = text(html({ monthlyCharacters: 5000 }));
    expect(t).toContain('Enterprise · Contact sales, not priced here');
    expect(t).not.toContain('Enterprise · Ruled out');
  });

  it('shows annual savings on annual billing only', () => {
    expect(text(html({ monthlyCharacters: 20_000, billing: 'annual' }))).toContain('annual billing saves $12 a year');
    expect(text(html({ monthlyCharacters: 20_000, billing: 'monthly' }))).not.toContain('annual billing saves');
  });
});

describe('invalid input', () => {
  it('shows the validator message and no results', () => {
    const h = html({ monthlyCharacters: -1 });
    expect(h).toContain('role="alert"');
    expect(text(h)).toContain('Characters per month cannot be negative.');
    expect(h).not.toContain('data-calc-result');
  });

  it('shows a message for a bad assumption', () => {
    const h = renderToStaticMarkup(<VoiceCalculator initialAssumptions={{ creditsPerCharacter: 0, charactersPerMinute: 900 }} />);
    expect(text(h)).toContain('Credits per character must be above 0');
    expect(h).not.toContain('data-calc-result');
  });
});

describe('affiliate links', () => {
  const links = { elevenlabs: 'https://example.com/e', 'murf-ai': 'https://example.com/m' };
  const h = html({}, { affiliateLinks: links });

  it('marks affiliate links as sponsored and discloses them', () => {
    expect(h).toContain('href="https://example.com/e"');
    expect(h).toContain('rel="sponsored nofollow noopener noreferrer"');
    expect(text(h)).toContain('Some links on this page are affiliate links');
    expect(text(h)).toContain('do not change which plan the calculator recommends');
  });

  it('does not change the recommendation', () => {
    const plain = text(html());
    const withLinks = text(h);
    for (const phrase of ['ElevenLabs Creator is the cheapest plan that fits', '$220 a year', '$228 a year']) {
      expect(plain).toContain(phrase);
      expect(withLinks).toContain(phrase);
    }
  });
});

describe('comparisonSentence', () => {
  it('names a tie', () => {
    const c = compareVoiceVendors({ ...DEFAULT_VOICE_SCENARIO });
    expect(comparisonSentence(c.results, 'tie', 0)).toMatch(/Both vendors come to \$\d+/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// INR view (task 5.6). Reference rate 94.7145; every rupee figure is worked out by hand.
//   ElevenLabs Creator $220 a year -> 20,837   Murf Creator $228 -> 21,595   gap 758
//   $18.33 a month -> 1,736   $19 -> 1,800   annual savings $44 -> 4,167   $120 -> 11,366
// ─────────────────────────────────────────────────────────────────────────────

describe('INR view', () => {
  const h = html({}, { initialCurrency: 'INR' });
  const t = text(h);

  it('is off by default: the prerendered page is in dollars with no rate box', () => {
    const d = html();
    expect(d).not.toContain('data-calc-fx');
    expect(text(d)).not.toContain('Paying from India');
    expect(text(d)).toContain('$220 a year');
  });

  it('shows rupee prices with Indian digit grouping and the list price beside them', () => {
    expect(t).toContain('\u20B920,837 a year');
    expect(t).toContain('\u20B921,595 a year');
    expect(t).toContain('List price $220 a year, converted at \u20B994.7145 per US dollar');
    expect(t).toContain('\u20B91,736 a month, billed annually');
    expect(t).toContain('annual billing saves \u20B94,167 a year');
    expect(t).toContain('annual billing saves \u20B911,366 a year');
  });

  it('words the comparison from the rupee figures shown, so the gap always matches', () => {
    expect(t).toContain('ElevenLabs Creator is cheaper by \u20B9758 a year (\u20B920,837 against \u20B921,595 for Murf AI Creator)');
  });

  it('shows the dated reference rate, its source and the confirmation note', () => {
    expect(t).toContain('Default rate: \u20B994.7145 per US dollar');
    expect(t).toContain('for 21 Oct 2026');
    expect(t).toContain(FX_CONFIRMATION_NOTE);
    expect(h).toContain('href="https://www.fbil.org.in/"');
  });

  it('drops the confirmation note once the rate is marked official', () => {
    const o = text(html({}, { initialCurrency: 'INR', fxReference: { ...USD_INR_REFERENCE, confidence: 'official' } }));
    expect(o).not.toContain(FX_CONFIRMATION_NOTE);
  });

  it('shows the verified ElevenLabs payment note and says plainly when Murf has none', () => {
    expect(t).toContain('Paying from India: Priced in USD, taxes extra.');
    expect(t).toContain('UPI is not listed');
    expect(t).toContain('Paying from India: No payment-method or tax details are verified for this vendor yet.');
  });

  it('never repeats the older unverified indiaPricing text from constants.ts', () => {
    expect(t).not.toContain('UPI + Indian debit');
    expect(t).not.toContain('Bronze');
    expect(t).not.toContain('1,250');
  });

  it('states that bank margin, card fees and GST are not included', () => {
    expect(t).toContain('exchange margin, card fees and any GST');
  });

  it('uses a custom rate exactly', () => {
    const c = text(html({}, { initialCurrency: 'INR', fxReference: { ...USD_INR_REFERENCE, rate: 100 } }));
    expect(c).toContain('\u20B922,000 a year');
    expect(c).toContain('\u20B922,800 a year');
    expect(c).toContain('cheaper by \u20B9800 a year');
  });

  it('groups lakhs correctly on a large plan', () => {
    // ElevenLabs Business annual: $9,900 x 94.7145 = 937,673.55
    const big = text(html({ monthlyCharacters: 6_000_000, billing: 'annual' }, { initialCurrency: 'INR' }));
    expect(big).toContain('\u20B99,37,674 a year');
  });

  it('falls back to dollars with a message when the rate is unusable', () => {
    const bad = html({}, { initialCurrency: 'INR', fxReference: { ...USD_INR_REFERENCE, rate: 0 } });
    expect(bad).toContain('role="alert"');
    expect(text(bad)).toContain('must be between 1 and 1,000 rupees per US dollar');
    expect(text(bad)).toContain('Prices are shown in US dollars until it is fixed.');
    expect(text(bad)).toContain('$220 a year');
    expect(text(bad)).not.toContain('List price $220');
  });
});

describe('makeMoney', () => {
  it('formats dollars and rupees', () => {
    expect(makeMoney('USD', 90).show(220)).toBe('$220');
    expect(makeMoney('INR', 90).show(220)).toBe('\u20B919,800');
    expect(makeMoney('INR', 90).conv(0.5)).toBe(45);
  });
});
