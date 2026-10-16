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
  // Perplexity Comet now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['perplexity-comet']).
  // Lindy runs a public PartnerStack program (market.partnerstack.com/page/lindy). Our application is recorded as pending in
  // constants.ts, so this link stays plain until a tracked link is issued. Rates differ between Lindy's network listings, so confirm
  // terms in the PartnerStack dashboard before quoting a commission anywhere. NOTE: this entry overrides the Lindy TOOLS entry in
  // constants.ts (SUPPLEMENTARY wins), so when the tracked link arrives change it HERE and update the constants.ts comment, not just one of them.
  lindy: 'https://www.lindy.ai/',
  'relevance-ai': 'https://relevanceai.com/?via=navneet',
  n8n: 'https://n8n.io/', // TODO: n8n has no public affiliate program as of 2026
  // Tidio now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['tidio']).
  juicebox: 'https://juicebox.ai/?via=c6add3',
  // vidIQ now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['vidiq']).
  // AppSumo now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['appsumo']).
  // PixVerse has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['pixverse']).
  // Spaceship (Impact) — deep-linked with the standard ?u={encoded landing page} pattern so each
  // mention lands on the actual product page rather than the generic homepage. CAVEAT: this only
  // works if Spaceship has "Allow Partners to deep link" turned on for spaceship.com in their Impact
  // program settings. Verify in the Impact partner dashboard before this goes live — if deep linking
  // isn't enabled, Impact sends the click to a dead-end page instead of Spaceship's site. If that's
  // the case, strip everything from '?u=' onward on the 'spaceship-email' line below, the Spaceship and Alf entries in constants.ts TOOLS to fall back to the plain
  // base link (https://spaceship.sjv.io/X49n7b), which is confirmed working.
  // Spaceship now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['spaceship']). 'spaceship-email' stays here.
  'spaceship-email': 'https://spaceship.sjv.io/X49n7b?u=https%3A%2F%2Fwww.spaceship.com%2Fbusiness-email&utm_source=spaceship-email&utm_medium=affiliate', // Spacemail business email
  automattic: 'https://automattic.pxf.io/3k0mxk?utm_source=automattic&utm_medium=affiliate', // Impact — WordPress.com / Pressable hosting; Jetpack AI Assistant has its own tool page in constants.ts
  // Added Sep 29 2026 — website-creation + domain/hosting/SSL programs (all Impact).
  // Readdy and WordToSite now have tool pages, so their links live in constants.ts TOOLS (AFFILIATE_LINKS['readdy'] / ['wordtosite']).
  // The four domain/hosting/SSL programs are meant for one combined "launch your site" article.
  // BigRock now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['bigrock']).
  'domain-com': 'https://domain.mno8.net/vDqz6v?utm_source=domain-com&utm_medium=affiliate', // mno8.net — now covered by scripts/check-affiliate-links.mjs
  // Network Solutions now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['network-solutions']).
  ssls: 'https://ssls.sjv.io/m4VRyM?utm_source=ssls&utm_medium=affiliate',
  // Added Sep 30 2026 (Impact). SITE123 is positioned as a simple drag-and-drop builder, not an AI builder.
  // SITE123 now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['site123']).
  // GitMind now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['gitmind']).
  // Added Oct 8 2026 (Impact). Esimatic is a travel eSIM app, off-niche for an AI tools site: use only as a
  // contextual mention (e.g. India / remote-work content), not as a tool page or comparison.
  esimatic: 'https://esimsia.sjv.io/n4JDe7?utm_source=esimatic&utm_medium=affiliate',
  // Added Oct 9 2026 (Impact). signNow is an e-signature tool, NOT an AI contract analyzer: use it only for the
  // "after review, sign it" step (contract-analysis post, freelancer posts). It now has a short tool page, so its
  // link lives in constants.ts TOOLS (AFFILIATE_LINKS['signnow']).
  // Added Oct 13 2026 (Impact). Photo-editing programs. Plain base links (no ?u= deep link):
  // deep-link permission has not been confirmed in the Impact dashboard for either program.
  // YouCam Online Editor now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['youcam']).
  // Retouch4me now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['retouch4me']).
  // Soundraw now has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['soundraw']).
  // Renderforest has a tool page, so its link lives in constants.ts TOOLS (AFFILIATE_LINKS['renderforest']).
};

const TOOL_LINKS: Record<string, string> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t.affiliateLink])
);

export const AFFILIATE_LINKS: Record<string, string> = {
  ...TOOL_LINKS,
  ...SUPPLEMENTARY_LINKS,
};
