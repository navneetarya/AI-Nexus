// lib/subid-tracking.ts
//
import type { MouseEvent } from 'react';
//
// PartnerStack SubID tracking (GA audit fix, Sep 2026) ──────────────────────
//
// PROBLEM: PartnerStack's dashboard and GA4 are two islands. PartnerStack
// shows clicks and commissions; GA4 shows sessions, sources, and on-site
// behavior. There was no shared ID between them, so a signup in PartnerStack
// could never be traced back to which page, session, or traffic source
// produced it in GA4 — making it impossible to tell which content actually
// converts.
//
// FIX: PartnerStack lets any referral link carry a `sid` query param that is
// captured at click time and shown against the resulting commission in the
// PartnerStack dashboard (see: support.partnerstack.com — "Tracking
// conversions via Sub IDs", article 360044949774). We use the visitor's GA4
// Client ID as that Sub ID — it's already unique per browser (set by gtag.js
// in the standard `_ga` cookie), free, and needs no extra library.
//
// FLOW THIS ENABLES:
//   1. Visitor clicks an affiliate CTA → trackAffiliateClick() reads their
//      existing GA4 Client ID from the `_ga` cookie and rewrites the link's
//      href to append `sid=<client_id>` before the browser navigates.
//   2. The same Client ID is sent as a custom `sid` param on the
//      affiliate_click GA4 event, so GA4 and PartnerStack now share one join
//      key for that click.
//   3. When a signup/commission later appears in PartnerStack, its Sub ID
//      column shows that same Client ID. Cross-reference it in GA4 (Explore
//      report → filter by that Client ID as a dimension) to see the exact
//      session, landing page, and traffic source that produced it.
//
// CAVEAT — confirmed directly from PartnerStack's own docs: "Sub IDs may not
// work for all companies you are partnered with." Before relying on this for
// real attribution, click through with `sid` present in the URL, wait for it
// to register, then check the PartnerStack dashboard's Detailed Commissions
// Breakdown to confirm the sid value actually shows up for the ElevenLabs and
// Murf AI programs specifically. If it doesn't appear after a real
// conversion, contact support@partnerstack.com — some individual company
// programs disable Sub ID capture on their end.

/**
 * Reads the GA4 Client ID from the `_ga` cookie that gtag.js sets
 * automatically on every page. Cookie value format is `GA1.1.<part1>.<part2>`
 * — the Client ID itself is `<part1>.<part2>`.
 * Returns null if gtag.js hasn't run yet (extremely rare after the first
 * pageview) or if the visitor blocks analytics cookies — callers must
 * degrade gracefully when this is null (see appendSubId below).
 */
export function getGaClientId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)_ga=([^;]+)/);
  if (!match) return null;
  const parts = match[1].split('.');
  if (parts.length < 4) return null;
  return `${parts[2]}.${parts[3]}`;
}

/** Affiliate networks each use their own Sub ID query param. Sending the
 *  wrong one means the value is silently dropped and attribution is lost.
 *
 *  - PartnerStack  → `sid`     (ElevenLabs, Murf AI, etc.)
 *  - impact.com    → `subId1`  (InVideo, Lovable, Creao AI, Flowith, Wegic,
 *                               Transkriptor, PopAi Sheets — all Impact)
 *                    Confirmed: help.impact.com "Sub ID & Shared ID
 *                    Parameters Explained for Partners" — the documented
 *                    format is `...?subId1=<value>`. Impact ignores `sid`.
 *
 *  Impact issues each brand its own vanity tracking domain, so detection is
 *  by known Impact domain suffix rather than by a single hostname. */
const IMPACT_TRACKING_DOMAINS = [
  'sjv.io',
  'pxf.io',
  'ojrq.net',
  '7eer.net',
  'evyy.net',
  'ojmp.net',
  'prf.hn',
];

export function getSubIdParam(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    const isImpact = IMPACT_TRACKING_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`)
    );
    return isImpact ? 'subId1' : 'sid';
  } catch {
    return 'sid';
  }
}

/** Appends the network-correct Sub ID param to a URL, respecting any existing
 *  query string (e.g. `https://gamma.app?via=ainexus` becomes
 *  `https://gamma.app?via=ainexus&sid=...`, while
 *  `https://invideo.sjv.io/k42zM3` becomes
 *  `https://invideo.sjv.io/k42zM3?subId1=...`). */
export function appendSubId(url: string, clientId: string): string {
  const separator = url.includes('?') ? '&' : '?';
  const param = getSubIdParam(url);
  return `${url}${separator}${param}=${encodeURIComponent(clientId)}`;
}

interface TrackArgs {
  toolName: string;
  ctaPosition: string;
  /** Blog post slug, when the click originated from inside blog content. */
  postSlug?: string;
}

/**
 * Core tracking logic, shared by both call shapes below. Mutates the given
 * anchor element's href in place to carry the SubID (so PartnerStack
 * captures it on landing) and fires the affiliate_click GA4 event with the
 * same value, so GA4 and PartnerStack can be cross-referenced by `sid`
 * later. Safe to call even if gtag isn't loaded (ad blockers) — the href
 * rewrite still happens so PartnerStack's own tracking isn't affected
 * either way.
 */
function applyTracking(link: HTMLAnchorElement, args: TrackArgs): void {
  const clientId = getGaClientId();
  const finalUrl = clientId ? appendSubId(link.href, clientId) : link.href;
  link.href = finalUrl;
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'affiliate_click', {
      tool_name: args.toolName,
      link_url: finalUrl,
      cta_position: args.ctaPosition,
      sid: clientId || 'unavailable',
      sid_param: getSubIdParam(link.href),
      ...(args.postSlug ? { post_slug: args.postSlug } : {}),
      page_path: window.location.pathname,
    });
  }
}

/**
 * Use this directly as a React `onClick` on any affiliate `<a>` tag rendered
 * by JSX (ToolPage.tsx, CompareArticlePage.tsx). Since preventDefault() is
 * never called, the browser completes navigation using whatever href value
 * is on the element at the moment the click handler finishes — which is why
 * mutating e.currentTarget.href here still works.
 *
 *   <a href={tool.affiliateLink} target="_blank" rel="sponsored nofollow noopener noreferrer"
 *     onClick={(e) => trackAffiliateClick(e, { toolName: tool.name, ctaPosition: 'hero' })}>
 */
export function trackAffiliateClick(
  e: MouseEvent<HTMLAnchorElement>,
  args: TrackArgs
): void {
  applyTracking(e.currentTarget, args);
}

/**
 * Use this from a native/delegated DOM click handler instead of a React
 * onClick — specifically BlogPostPage.tsx's delegated listener on
 * dangerouslySetInnerHTML content, where the affiliate links are raw HTML
 * strings with no React event handlers of their own.
 */
export function trackAffiliateClickOnElement(
  link: HTMLAnchorElement,
  args: TrackArgs
): void {
  applyTracking(link, args);
}
