import React from 'react';
import { Tag } from 'lucide-react';
import type { Deal } from '../lib/deals';
import { AFFILIATE_LINKS } from '../lib/affiliate-links';
import { trackAffiliateClick } from '../lib/subid-tracking';

// components/DealBox.tsx  (C6, Nov 2026)
//
// Shows ONE verified, time-limited discount for a tool. Mirrors components/VerdictCard.tsx's
// rules:
//  - Pure and synchronous: no state, no effects. Output depends only on props, so
//    scripts/prerender.mjs can reproduce the exact same HTML server-side (see
//    lib/verdict-card-ssr.tsx's renderDealBoxHtml).
//  - The caller decides whether to mount it at all: pass the result of
//    lib/deals.ts's getActiveDeal(slug). If that returns null (no deal, expired, or
//    stale), do not render <DealBox> — there is nothing for this component to hide
//    itself, by design, so a caller can't accidentally ship a stale deal.

export interface DealBoxProps {
  deal: Deal;
  toolName: string;
}

/** "Verified 20 Nov 2026". */
function verifiedLabel(deal: Deal): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deal.verifiedISO)) return null;
  const d = new Date(`${deal.verifiedISO}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const text = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(d);
  return `Verified ${text}`;
}

/** "Ends 1 Dec 2026", or null for an open-ended offer. */
function expiresLabel(deal: Deal): string | null {
  if (!deal.expiresISO || !/^\d{4}-\d{2}-\d{2}$/.test(deal.expiresISO)) return null;
  const d = new Date(`${deal.expiresISO}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const text = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(d);
  return `Ends ${text}`;
}

export function DealBox({ deal, toolName }: DealBoxProps) {
  const link = AFFILIATE_LINKS[deal.tool];
  if (!link) return null;
  const verified = verifiedLabel(deal);
  const expires = expiresLabel(deal);

  return (
    <section
      aria-label={`${toolName} verified deal`}
      data-deal-box={deal.tool}
      style={{
        background: 'rgba(217,119,6,.06)',
        border: '1px solid rgba(217,119,6,.25)',
        borderRadius: 14,
        padding: 'clamp(14px, 4vw, 18px)',
        margin: '0 0 20px',
        color: 'var(--txt)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: '#d97706', marginBottom: 8,
        }}
      >
        <Tag size={13} aria-hidden="true" /> Verified deal
      </div>

      <p style={{ margin: '0 0 4px', fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>{deal.discount}</p>

      {deal.code && (
        <p style={{ margin: '0 0 10px', fontSize: 13 }}>
          Code: <code style={{ background: 'rgba(0,0,0,.06)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{deal.code}</code>
        </p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px' }}>
        <a
          href={link}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          data-link-type="affiliate"
          onClick={(e) => trackAffiliateClick(e, { toolName, ctaPosition: 'deal_box' })}
          style={{
            display: 'inline-block', background: 'linear-gradient(135deg,#0D9488,#0f766e)', color: '#fff',
            padding: '10px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}
        >
          Claim this deal →
        </a>
        {(verified || expires) && (
          <span style={{ fontSize: 12, color: 'var(--mut)' }}>
            {[verified, expires].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--mut)', margin: '10px 0 0' }}>
        Source: <a href={deal.source} target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'var(--a1)' }}>vendor pricing page</a>.
        {' '}Affiliate link — we may earn a commission at no extra cost to you.{' '}
        <a href="/disclosure/" style={{ color: 'var(--a1)', textDecoration: 'underline' }}>Full disclosure →</a>
      </p>
    </section>
  );
}

export default DealBox;
