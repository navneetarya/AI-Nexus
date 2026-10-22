// lib/calc/fx.ts  (Phase 5, task 5.6)
//
// INR view for the voice cost calculator: one dated reference rate, conversion helpers and the
// India payment notes. Pure functions only (no Date.now, no network), so the prerendered page and
// the live page always agree.
//
// WHERE THE RATE COMES FROM
//  The official reference is the FBIL reference rate for USD/INR. Financial Benchmarks India Ltd
//  (FBIL) computes it each Mumbai business day at about 13:30 IST and the Reserve Bank of India shows
//  the same figure on its website. fbil.org.in and rbi.org.in load their rates with JavaScript, so
//  the number could not be read from them directly when this was written (2026-10-22). It is the
//  21 Oct 2026 figure, 94.7145, as republished by two independent pages (lawnut.com, and the
//  previous-day value in ceicdata.com's RBI series), so it is tagged "secondary" and
//  FX_CONFIRMATION_NOTE is shown next to it until someone reads it on fbil.org.in and flips the tag
//  to "official".
//
// REFRESHING IT
//  Change USD_INR_REFERENCE below (rate, rateDateISO, checkedISO) and rebuild. A reference rate is
//  not a price: readers can overwrite it in the calculator, and the page says it excludes bank
//  exchange margins, card fees and GST.

import { getVerifiedFacts } from '../vendor-facts';
import type { VoiceVendorId } from './voice-inputs';

export type FxConfidence = 'official' | 'secondary';

export interface FxReference {
  pair: 'USD/INR';
  /** Rupees per 1 US dollar. */
  rate: number;
  /** Date the rate was published for (YYYY-MM-DD). */
  rateDateISO: string;
  /** Date this value was looked up (YYYY-MM-DD). */
  checkedISO: string;
  source: string;
  sourceUrl: string;
  confidence: FxConfidence;
}

export const USD_INR_REFERENCE: FxReference = {
  pair: 'USD/INR',
  rate: 94.7145,
  rateDateISO: '2026-10-21',
  checkedISO: '2026-10-22',
  source: 'the FBIL reference rate, which the Reserve Bank of India also shows',
  sourceUrl: 'https://www.fbil.org.in/',
  confidence: 'secondary',
};

/** Shown next to the default rate while it has not been read from fbil.org.in. */
export const FX_CONFIRMATION_NOTE =
  'This rate was copied from independent pages that republish the FBIL figure, not read from fbil.org.in itself. Check the current rate there, or type your own.';

export const FX_MIN_RATE = 1;
export const FX_MAX_RATE = 1000;

/** Reader-facing problem with a rate, or null when it can be used. */
export function validateRate(rate: number): string | null {
  if (typeof rate !== 'number' || !Number.isFinite(rate)) {
    return 'Enter the exchange rate as rupees per US dollar, for example 94.71.';
  }
  if (rate < FX_MIN_RATE || rate > FX_MAX_RATE) {
    return `The exchange rate must be between ${FX_MIN_RATE} and ${FX_MAX_RATE.toLocaleString('en-US')} rupees per US dollar.`;
  }
  return null;
}

/** Reads a typed rate such as "94.71" or "₹94.71". Returns NaN when it is not a number. */
export function parseRate(raw: string): number {
  const t = raw.trim().replace(/,/g, '').replace(/^₹/, '');
  if (!/^(\d+(?:\.\d+)?|\.\d+)$/.test(t)) return Number.NaN;
  return Number(t);
}

/** Dollars to rupees, rounded to the nearest whole rupee. */
export function usdToInr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

/** Rupees with Indian digit grouping: ₹1,23,456. */
export function fmtInr(rupees: number): string {
  const sign = rupees < 0 ? '-' : '';
  return `${sign}\u20B9${Math.abs(Math.round(rupees)).toLocaleString('en-IN')}`;
}

/** "21 Oct 2026". Fixed English format so the server and the browser agree. */
export function fxDateLabel(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[Number(m[2]) - 1];
  return month ? `${Number(m[3])} ${month} ${m[1]}` : iso;
}

// ─────────────────────────────────────────────────────────────────────────────
// India payment notes
// ─────────────────────────────────────────────────────────────────────────────

/** Notes that apply to both vendors. Kept to what is true of any dollar-priced subscription. */
export const INDIA_GENERAL_NOTES: readonly string[] = [
  'Both vendors list prices in US dollars. The rupee figures are a conversion at the rate above, not a price you will be quoted.',
  'Your bank\u2019s exchange margin, card fees and any GST or other tax are not included.',
];

/**
 * The vendor's own payment or tax note from the verified vendor facts, or null when none is on file.
 * Never falls back to the older indiaPricing text in constants.ts, which is not verified.
 */
export function getIndiaNote(vendor: VoiceVendorId): string | null {
  const note = getVerifiedFacts(vendor)?.indiaNote;
  return typeof note === 'string' && note.trim() !== '' ? note.trim() : null;
}

export const NO_INDIA_NOTE = 'No payment-method or tax details are verified for this vendor yet.';
