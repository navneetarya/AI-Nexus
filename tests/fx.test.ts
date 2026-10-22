// tests/fx.test.ts  (Phase 5, task 5.6)
//
// The INR view's rate helpers (lib/calc/fx.ts). Rupee amounts are worked out by hand.

import { describe, expect, it } from 'vitest';
import {
  FX_CONFIRMATION_NOTE,
  INDIA_GENERAL_NOTES,
  NO_INDIA_NOTE,
  USD_INR_REFERENCE,
  fmtInr,
  fxDateLabel,
  getIndiaNote,
  parseRate,
  usdToInr,
  validateRate,
} from '../lib/calc/fx';

describe('reference rate', () => {
  it('is a dated, usable USD/INR figure with an https source', () => {
    const r = USD_INR_REFERENCE;
    expect(r.pair).toBe('USD/INR');
    expect(validateRate(r.rate)).toBeNull();
    expect(r.rateDateISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.checkedISO).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(r.checkedISO >= r.rateDateISO).toBe(true);
    expect(r.sourceUrl.startsWith('https://')).toBe(true);
    expect(['official', 'secondary']).toContain(r.confidence);
  });

  it('carries a confirmation note while it is secondary', () => {
    expect(FX_CONFIRMATION_NOTE).toMatch(/fbil\.org\.in/);
  });
});

describe('validateRate', () => {
  it('accepts the limits', () => {
    expect(validateRate(1)).toBeNull();
    expect(validateRate(94.7145)).toBeNull();
    expect(validateRate(1000)).toBeNull();
  });
  it.each([[0], [0.99], [1000.01], [-5], [Number.NaN], [Number.POSITIVE_INFINITY]])('rejects %s', (n) => {
    expect(validateRate(n)).not.toBeNull();
  });
});

describe('parseRate', () => {
  it.each([
    ['94.71', 94.71],
    [' 94.7145 ', 94.7145],
    ['₹94.71', 94.71],
    ['100', 100],
    ['1,000', 1000],
    ['.5', 0.5],
  ])('reads %j as %d', (raw, n) => expect(parseRate(raw)).toBe(n));

  it.each([[''], ['  '], ['abc'], ['-5'], ['94.7.1'], ['9 4'], ['1e2']])('rejects %j', (raw) =>
    expect(Number.isNaN(parseRate(raw))).toBe(true),
  );

  it('reads a comma used as a decimal point as a huge number, which validateRate then refuses', () => {
    expect(validateRate(parseRate('94,71'))).not.toBeNull();
  });
});

describe('conversion and formatting', () => {
  it('rounds to the nearest whole rupee', () => {
    expect(usdToInr(220, 94.7145)).toBe(20_837); // 20,837.19
    expect(usdToInr(228, 94.7145)).toBe(21_595); // 21,594.906
    expect(usdToInr(18.33, 94.7145)).toBe(1_736); // 1,736.1
    expect(usdToInr(0, 94.7145)).toBe(0);
    expect(usdToInr(1, 100)).toBe(100);
  });

  it('groups digits the Indian way', () => {
    expect(fmtInr(0)).toBe('\u20B90');
    expect(fmtInr(999)).toBe('\u20B9999');
    expect(fmtInr(1000)).toBe('\u20B91,000');
    expect(fmtInr(20_837)).toBe('\u20B920,837');
    expect(fmtInr(100_000)).toBe('\u20B91,00,000');
    expect(fmtInr(937_674)).toBe('\u20B99,37,674');
    expect(fmtInr(12_34_567)).toBe('\u20B912,34,567');
    expect(fmtInr(-1500)).toBe('-\u20B91,500');
  });

  it('formats dates in a fixed English form', () => {
    expect(fxDateLabel('2026-10-21')).toBe('21 Oct 2026');
    expect(fxDateLabel('2026-01-05')).toBe('5 Jan 2026');
    expect(fxDateLabel('not a date')).toBe('not a date');
    expect(fxDateLabel('2026-13-01')).toBe('2026-13-01');
  });
});

describe('India notes', () => {
  it('uses the verified ElevenLabs note, which says UPI is not listed', () => {
    expect(getIndiaNote('elevenlabs')).toMatch(/UPI is not listed/);
  });

  it('has no Murf note on file, so the page says so instead of using older unverified text', () => {
    expect(getIndiaNote('murf-ai')).toBeNull();
    expect(NO_INDIA_NOTE).toMatch(/verified/);
  });

  it('states that the rupee figure is a conversion and excludes bank charges and tax', () => {
    const t = INDIA_GENERAL_NOTES.join(' ');
    expect(t).toMatch(/conversion/);
    expect(t).toMatch(/GST/);
    expect(t).toMatch(/exchange margin/);
  });
});
