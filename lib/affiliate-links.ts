// lib/affiliate-links.ts
//
// SINGLE SOURCE OF TRUTH for every affiliate/referral link used across the
// site — blog posts AND tool pages.
//
// To change a link sitewide, edit it in exactly ONE place:
//   - Tool has a full review page (/tools/<slug>/)?  → edit `affiliateLink`
//     on that tool's entry in constants.ts. Every blog post CTA that
//     references AFFILIATE_LINKS['<slug>'] updates automatically.
//   - Tool is only mentioned in blog content, no dedicated tool page yet?
//     → edit its entry in SUPPLEMENTARY_LINKS below.
//
// Never hardcode an affiliate/referral URL directly inside a blog post's
// `content` template literal again — import AFFILIATE_LINKS instead:
//   import { AFFILIATE_LINKS } from '../lib/affiliate-links';
//   ...
//   <a href="${AFFILIATE_LINKS['grammarly']}" rel="sponsored nofollow noopener noreferrer">Try Grammarly Free →</a>
//
// This file intentionally contains ZERO hardcoded links for tools that
// already live in constants.ts — it only re-exports them.
//
// ENFORCEMENT: `scripts/check-affiliate-links.mjs` runs as the first step of
// `npm run build` and fails the build if a raw affiliate URL appears outside
// constants.ts or this file. impact.com links (sjv.io / pxf.io) are blocking
// with zero tolerance. Legacy `?via=` / `?fpr=` links that predate this rule
// are recorded in scripts/affiliate-links-baseline.json — that list may only
// shrink, so adding a new hardcoded link anywhere fails the build.

import { TOOLS } from '../constants';

// Tools referenced in blog posts that don't (yet) have a full TOOLS entry
// in constants.ts / a dedicated /tools/<slug>/ page. When one of these gets
// a real tool page, move its link into constants.ts and delete it here.
const SUPPLEMENTARY_LINKS: Record<string, string> = {
  make: 'https://www.make.com/en/register?pc=navneet',
  lindy: 'https://www.lindy.ai/', // TODO: Lindy has no referral/tracking param issued yet
  'relevance-ai': 'https://relevanceai.com/?via=navneet',
  n8n: 'https://n8n.io/', // TODO: n8n has no public affiliate program as of 2026
  tidio: 'https://www.tidio.com/?via=ainexus',
  juicebox: 'https://juicebox.ai/?via=c6add3',
  vidiq: 'https://vidiq.com?via=ainexus',
  appsumo: 'https://appsumo.8odi.net/2R0DB7?utm_source=appsumo&utm_medium=affiliate', // Impact — marketplace link; no dedicated tool page
  // PixVerse has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['pixverse']).
  // Spaceship (Impact) — deep-linked with the standard ?u={encoded landing page} pattern so each
  // mention lands on the actual product page rather than the generic homepage. CAVEAT: this only
  // works if Spaceship has "Allow Partners to deep link" turned on for spaceship.com in their Impact
  // program settings. Verify in the Impact partner dashboard before this goes live — if deep linking
  // isn't enabled, Impact sends the click to a dead-end page instead of Spaceship's site. If that's
  // the case, strip everything from '?u=' onward on all three lines below to fall back to the plain
  // base link (https://spaceship.sjv.io/X49n7b), which is confirmed working.
  spaceship: 'https://spaceship.sjv.io/X49n7b?u=https%3A%2F%2Fwww.spaceship.com%2F&utm_source=spaceship&utm_medium=affiliate', // domains
  'spaceship-email': 'https://spaceship.sjv.io/X49n7b?u=https%3A%2F%2Fwww.spaceship.com%2Fbusiness-email&utm_source=spaceship-email&utm_medium=affiliate', // Spacemail business email
  automattic: 'https://automattic.pxf.io/3k0mxk?utm_source=automattic&utm_medium=affiliate', // Impact — WordPress.com / Pressable hosting; Jetpack AI Assistant has its own tool page in constants.ts
  // Added Sep 29 2026 — website-creation + domain/hosting/SSL programs (all Impact).
  // No dedicated tool pages yet: Readdy + WordToSite target the website-builder posts;
  // the four domain/hosting/SSL programs are meant for one combined "launch your site" article.
  wordtosite: 'https://wordtosite.sjv.io/2R9k07?utm_source=wordtosite&utm_medium=affiliate',
  readdy: 'https://interactivelinkpteltd.sjv.io/KB3KdN?utm_source=readdy&utm_medium=affiliate', // Interactive Link PTE. LTD. (readdy.ai)
  bigrock: 'https://bigrock-in.sjv.io/3krA0M?utm_source=bigrock&utm_medium=affiliate',
  'domain-com': 'https://domain.mno8.net/vDqz6v?utm_source=domain-com&utm_medium=affiliate', // mno8.net — now covered by scripts/check-affiliate-links.mjs
  'network-solutions': 'https://network-solutions.7eer.net/yZQg63?utm_source=network-solutions&utm_medium=affiliate',
  ssls: 'https://ssls.sjv.io/m4VRyM?utm_source=ssls&utm_medium=affiliate',
  // Added Sep 30 2026 (Impact). SITE123 is positioned as a simple drag-and-drop builder, not an AI builder.
  site123: 'https://site123ltd.sjv.io/enPqkZ?utm_source=site123&utm_medium=affiliate',
  gitmind: 'https://gitmindcom.sjv.io/2R0Vqa?utm_source=gitmind&utm_medium=affiliate',
  // Added Oct 8 2026 (Impact). Esimatic is a travel eSIM app, off-niche for an AI tools site: use only as a
  // contextual mention (e.g. India / remote-work content), not as a tool page or comparison.
  esimatic: 'https://esimsia.sjv.io/n4JDe7?utm_source=esimatic&utm_medium=affiliate',
  // Added Oct 9 2026 (Impact). signNow is an e-signature tool, NOT an AI contract analyzer: use it only for the
  // "after review, sign it" step (contract-analysis post, freelancer posts). No tool page.
  signnow: 'https://signnow.sjv.io/OYJYXA?utm_source=signnow&utm_medium=affiliate',
  soundraw: 'https://soundraw.io/?ref=pvxxfrzw',
  // Renderforest has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['renderforest']).
};

const TOOL_LINKS: Record<string, string> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t.affiliateLink])
);

export const AFFILIATE_LINKS: Record<string, string> = {
  ...TOOL_LINKS,
  ...SUPPLEMENTARY_LINKS,
};
