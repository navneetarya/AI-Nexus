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
};

const TOOL_LINKS: Record<string, string> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t.affiliateLink])
);

export const AFFILIATE_LINKS: Record<string, string> = {
  ...TOOL_LINKS,
  ...SUPPLEMENTARY_LINKS,
};
