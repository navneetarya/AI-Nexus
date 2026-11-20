// lib/deals.ts
//
// C6 (Nov 2026): data-access helpers for data/deals.json, mirroring lib/vendor-facts.ts's
// pattern — plain JSON as the source of truth, validated by a standalone Python script
// (validate_deals.py) so the shape stays enforceable without a TS build step, plus pure
// helpers here that the UI (components/DealBox.tsx) and the SSR mirror both call, so
// there is exactly one place that decides whether a deal is currently showable.
//
// THE RULE: a deal is active only when it has NOT expired (expiresISO is in the future
// or absent) AND it was verified within the last 30 days. Both conditions matter — an
// unexpired deal with a stale verifiedISO is just as untrustworthy as an expired one,
// since nobody has re-checked whether the vendor quietly pulled the offer.

import RAW from '../data/deals.json';

export interface Deal {
  /** Must be a key of AFFILIATE_LINKS (lib/affiliate-links.ts). */
  tool: string;
  /** The literal coupon/promo code a buyer enters at checkout, or null when the discount
   *  is automatic (applied on the linked landing page, no code required). Never a placeholder. */
  code: string | null;
  discount: string;
  /** The exact vendor page this discount was read from. */
  source: string;
  verifiedISO: string;
  /** ISO date the offer stops being valid, or null for an open-ended offer. */
  expiresISO: string | null;
}

interface DealsFile {
  _readme: string;
  deals: Deal[];
}

const FILE = RAW as unknown as DealsFile;

export const ALL_DEALS: readonly Deal[] = FILE.deals;

export const DEAL_RULES = { staleAfterDays: 30 } as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseISODateUTC(iso: string | null): Date | null {
  if (!iso || !ISO_DATE.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Whole days since the deal was verified, or null if it has no valid date. */
export function daysSinceVerified(deal: Deal, now: Date = new Date()): number | null {
  const d = parseISODateUTC(deal.verifiedISO);
  if (!d) return null;
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}

export function isExpired(deal: Deal, now: Date = new Date()): boolean {
  if (!deal.expiresISO) return false;
  const d = parseISODateUTC(deal.expiresISO);
  // An unparseable expiry date is treated as expired — fail closed, never show an unverifiable claim.
  if (!d) return true;
  return now.getTime() >= d.getTime() + 86_400_000; // end of the expiry day, UTC
}

export function isStale(deal: Deal, now: Date = new Date()): boolean {
  const days = daysSinceVerified(deal, now);
  return days === null || days > DEAL_RULES.staleAfterDays;
}

/** Reader-facing guard: true only when the deal hasn't expired AND was verified recently. */
export function isDealActive(deal: Deal, now: Date = new Date()): boolean {
  return !isExpired(deal, now) && !isStale(deal, now);
}

/** The active deal for a tool slug, or null when there isn't one, it expired, or it's stale.
 *  Everything that renders a deal to readers (DealBox, its SSR mirror) must go through this. */
export function getActiveDeal(toolSlug: string, now: Date = new Date()): Deal | null {
  const deal = ALL_DEALS.find((d) => d.tool === toolSlug);
  return deal && isDealActive(deal, now) ? deal : null;
}
