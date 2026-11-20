// lib/launch-kit.ts
//
// C4 (Nov 2026 growth plan): a reusable "Launch Kit" box for posts about building/launching a
// site — a domain registrar, an SSL certificate provider and an AI site builder in one box, so a
// reader doesn't have to hunt through separate CTAs scattered across the post.
//
// N2 (affiliate-account verification) confirmed only these two Impact programs as real, live
// accounts as of Nov 2026: Spaceship and SSLs.com. BigRock, Domain.com, Network Solutions,
// SITE123, Readdy and WordToSite are NOT yet confirmed, so they are deliberately left out here —
// add them only once N2 confirms the account. Alf Website Studio is Spaceship's own AI site
// builder (same spaceship.sjv.io Impact account, just a different deep-linked landing page), so
// it covers the "builder" slot without needing a separate, unconfirmed program.
//
// Usage: import { getLaunchKitHtml } from '../lib/launch-kit' in a blog/*.ts post and interpolate
// it directly into the `content` template literal, e.g. `${getLaunchKitHtml()}`.

import { AFFILIATE_LINKS } from './affiliate-links';

interface LaunchKitItem {
  label: string;
  role: string;
  tool: 'spaceship' | 'alf-website-studio' | 'ssls';
  cta: string;
}

const ITEMS: LaunchKitItem[] = [
  { label: 'Domain', role: 'Register your .com with free privacy', tool: 'spaceship', cta: 'Search a domain at Spaceship →' },
  { label: 'SSL', role: 'Add a certificate if your host doesn\u2019t include one', tool: 'ssls', cta: 'Compare SSLs.com certificates →' },
  { label: 'Builder', role: 'Build the site itself with an AI assistant', tool: 'alf-website-studio', cta: 'Try Alf Website Studio →' },
];

/**
 * Returns the Launch Kit box as an HTML string: one card per item (domain, SSL, builder), each
 * with a teal CTA button carrying the correct `rel`, `data-link-type="affiliate"` (so
 * lib/subid-tracking.ts classifies it correctly even if its query params don't match the usual
 * heuristics) and a disclosure line.
 */
export function getLaunchKitHtml(): string {
  const cards = ITEMS.map(
    (item) => `
  <div style="flex:1 1 220px;background:rgba(13,148,136,.05);border:1px solid rgba(13,148,136,.15);border-radius:12px;padding:16px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#0f766e;margin-bottom:6px;">${item.label}</div>
    <p style="margin:0 0 12px;font-size:13px;line-height:1.5;">${item.role}</p>
    <a href="${AFFILIATE_LINKS[item.tool]}" target="_blank" rel="sponsored nofollow noopener noreferrer" data-link-type="affiliate" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:9px 14px;border-radius:9px;font-weight:700;font-size:13px;text-decoration:none;">${item.cta}</a>
  </div>`
  ).join('');

  return `
<div style="margin:24px 0;">
  <h3 style="margin:0 0 4px;font-size:17px;">Launch kit: domain, SSL and builder in one place</h3>
  <p style="margin:0 0 14px;font-size:13px;opacity:.8;">Everything below runs through the same Spaceship account except the certificate, which only matters if your host doesn't already include HTTPS.</p>
  <div style="display:flex;flex-wrap:wrap;gap:14px;">${cards}
  </div>
  <p style="margin:12px 0 0;font-size:12px;opacity:.75;"><a href="/disclosure/">Affiliate disclosure</a> — we may earn a commission at no extra cost to you.</p>
</div>`;
}
