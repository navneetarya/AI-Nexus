// lib/pricing-data.ts  (Phase 4, task 4.3)
//
// Typed access to the pricing snapshot and change log for the pricing tracker page.
// Data files: data/pricing/latest.json (copy of the newest snapshot, written by
// scripts/pricing-snapshot.mjs) and data/pricing/history.json (see data/pricing/README.md).
// Everything here is pure and deterministic (no Date.now), so the prerendered page and
// the live page produce identical markup.

import LATEST from '../data/pricing/latest.json';
import HISTORY from '../data/pricing/history.json';
import { formatPrice } from './vendor-facts';

export interface SnapshotPlan {
  id: string;
  name: string;
  isFree: boolean;
  priceMonthly: number | null;
  priceMonthlyBilledAnnually: number | null;
  oneTimePrice: number | null;
  customPricing: boolean;
  allowance: string | null;
  commercialUse: boolean | null;
}

export interface SnapshotTool {
  slug: string;
  name: string;
  category: string | null;
  currency: string;
  pricingPageUrl: string;
  verifiedISO: string;
  freeAccess: 'free-plan' | 'trial-only' | 'none';
  trialDays: number | null;
  startsAtMonthly: number | null;
  startsAtMonthlyBilledAnnually: number | null;
  plans: SnapshotPlan[];
}

export interface PricingSnapshot {
  schemaVersion: number;
  snapshotISO: string;
  toolCount: number;
  tools: SnapshotTool[];
}

export interface HistoryEntry {
  id: string;
  dateISO: string;
  slug: string;
  tool: string;
  kind: string;
  planId: string | null;
  field: string | null;
  from: unknown;
  to: unknown;
  currency: string;
  sourceUrl: string;
  summary: string;
  fromSnapshot: string;
  toSnapshot: string;
}

export const PRICING_SNAPSHOT = LATEST as unknown as PricingSnapshot;
export const PRICING_HISTORY = (HISTORY as unknown as { entries: HistoryEntry[] }).entries;

/** An entry counts as "recent" when it is at most this many days before the snapshot date. */
export const CHANGED_WITHIN_DAYS = 30;

const DAY = 86_400_000;
const toMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);

/** History entries per slug that are within CHANGED_WITHIN_DAYS of the snapshot date. Newest first. */
export function recentChanges(
  snapshot: PricingSnapshot = PRICING_SNAPSHOT,
  history: HistoryEntry[] = PRICING_HISTORY,
): Map<string, HistoryEntry[]> {
  const end = toMs(snapshot.snapshotISO);
  const out = new Map<string, HistoryEntry[]>();
  for (const e of history) {
    if (e.kind === 'correction') continue; // corrections fix a past mistake; they are not a vendor price change
    const age = (end - toMs(e.dateISO)) / DAY;
    if (!(age >= 0 && age <= CHANGED_WITHIN_DAYS)) continue;
    const list = out.get(e.slug) ?? [];
    list.push(e);
    out.set(e.slug, list);
  }
  for (const list of out.values()) list.sort((a, b) => (a.dateISO < b.dateISO ? 1 : -1));
  return out;
}

export type SortKey = 'name' | 'category' | 'startsAt' | 'annual' | 'verified';
export type SortDir = 'asc' | 'desc';

/** Unverified (null) prices always sort last, in both directions. */
export function sortTools(tools: SnapshotTool[], key: SortKey, dir: SortDir): SnapshotTool[] {
  const sign = dir === 'asc' ? 1 : -1;
  const val = (t: SnapshotTool): string | number | null =>
    key === 'name' ? t.name.toLowerCase()
    : key === 'category' ? (t.category ?? '').toLowerCase()
    : key === 'startsAt' ? t.startsAtMonthly
    : key === 'annual' ? t.startsAtMonthlyBilledAnnually
    : t.verifiedISO;
  return [...tools].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    if (va === null && vb === null) return a.name.localeCompare(b.name);
    if (va === null) return 1;
    if (vb === null) return -1;
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return a.name.localeCompare(b.name);
  });
}

export function categoriesOf(tools: SnapshotTool[]): string[] {
  return [...new Set(tools.map((t) => t.category).filter((c): c is string => !!c))].sort();
}

/** "$6/mo", or null when not verified. */
export function perMonth(amount: number | null, currency: string): string | null {
  return amount === null ? null : `${formatPrice(amount, currency)}/mo`;
}

export function freeAccessText(t: SnapshotTool): string {
  if (t.freeAccess === 'free-plan') return 'Free plan';
  if (t.freeAccess === 'trial-only') return typeof t.trialDays === 'number' ? `No free plan, ${t.trialDays}-day trial` : 'No free plan, free trial';
  return 'No free plan or trial';
}

/** "22 Oct 2026" */
export function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** "October 2026" for a YYYY-MM-DD date. */
export function monthLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

/** Vendor changes dated in the same calendar month as the snapshot ("this month"). Newest first. */
export function changesThisMonth(
  snapshot: PricingSnapshot = PRICING_SNAPSHOT,
  history: HistoryEntry[] = PRICING_HISTORY,
): HistoryEntry[] {
  const month = snapshot.snapshotISO.slice(0, 7);
  return history
    .filter((e) => e.kind !== 'correction' && e.dateISO.slice(0, 7) === month)
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));
}

/** Published corrections to our own data (kind "correction"). Newest first. */
export function corrections(history: HistoryEntry[] = PRICING_HISTORY): HistoryEntry[] {
  return history
    .filter((e) => e.kind === 'correction')
    .sort((a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0));
}
