import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  cardTextProblems,
  freePlanLabel,
  startsAtLabel,
  verifiedLabel,
  type ToolFacts,
} from '../lib/vendor-facts';
import { trackAffiliateClick } from '../lib/subid-tracking';

// components/VerdictCard.tsx  (Phase 2, task 2.1)
//
// A compact "at a glance" card for tool pages: best for, skip if, starts at,
// free plan, verified date, ONE call to action and the affiliate disclosure.
//
// RULES THIS COMPONENT FOLLOWS
//  - Every fact comes from lib/vendor-facts.ts. The caller passes the result of
//    getVerifiedFacts(slug). If that returns null, do not mount the card.
//  - A row is omitted when its value is null (null means "not verified").
//  - Pure and synchronous: no state, no effects, no fetching. The output depends
//    only on props, so it cannot shift the layout after load and the HTML can be
//    reproduced by prerender.mjs (task 2.4). Keep it that way.
//  - Colours come from the CSS variables in index.html, so light and dark mode
//    (OS preference and the manual data-theme switch) work with no extra code.
//  - Mobile first: one column by default, the grid widens by itself when there is
//    room (auto-fit), and long text wraps instead of overflowing.

export interface VerdictCardProps {
  /** Result of getVerifiedFacts(slug). Must be a showable entry. */
  facts: ToolFacts;
  /** Tool's affiliate URL (tool.affiliateLink). */
  affiliateLink: string;
  /** Optional SPA navigate function. Without it the disclosure link is a normal link. */
  navigate?: (to: string) => void;
}

/** CTA wording that only promises what the verified facts support. */
export function verdictCtaLabel(facts: ToolFacts): string {
  if (facts.freeAccess === 'free-plan') return `Try ${facts.name} free`;
  if (facts.freeAccess === 'trial-only') return `Start ${facts.name} free trial`;
  return `Visit ${facts.name}`;
}

export interface VerdictRow {
  key: 'bestFor' | 'skipIf' | 'startsAt' | 'freePlan';
  label: string;
  value: string;
}

/**
 * The rows the card shows, in order, with unverified rows already dropped.
 * Exported so tests (and prerender parity, task 2.4) can use the exact same logic.
 */
export function buildVerdictRows(facts: ToolFacts): VerdictRow[] {
  const rows: VerdictRow[] = [];
  // Card text is only shown when it passes the word limits from the data file.
  if (cardTextProblems(facts.card).length === 0 && facts.card) {
    rows.push({ key: 'bestFor', label: 'Best for', value: facts.card.bestFor.trim() });
    rows.push({ key: 'skipIf', label: 'Skip if', value: facts.card.skipIf.trim() });
  }
  const startsAt = startsAtLabel(facts);
  if (startsAt) rows.push({ key: 'startsAt', label: 'Starts at', value: startsAt });
  const free = freePlanLabel(facts);
  if (free) rows.push({ key: 'freePlan', label: 'Free plan', value: free });
  return rows;
}

const wrap: React.CSSProperties = { minWidth: 0, overflowWrap: 'anywhere' };

export function VerdictCard({ facts, affiliateLink, navigate }: VerdictCardProps) {
  const rows = buildVerdictRows(facts);
  const verified = verifiedLabel(facts);
  const ctaLabel = verdictCtaLabel(facts);

  return (
    <section
      aria-label={`${facts.name} verdict`}
      data-verdict-card={facts.slug}
      style={{
        background: 'var(--surf)',
        border: '1px solid var(--a1-brd)',
        borderRadius: 16,
        padding: 'clamp(14px, 4vw, 20px)',
        margin: '0 0 20px',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%',
        color: 'var(--txt)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--a1)',
          marginBottom: 12,
        }}
      >
        Quick verdict
      </div>

      {rows.length > 0 && (
        <dl
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '12px 20px',
            margin: 0,
          }}
        >
          {rows.map((r) => (
            <div key={r.key} style={wrap}>
              <dt
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: 'var(--mut)',
                  marginBottom: 2,
                }}
              >
                {r.label}
              </dt>
              <dd style={{ ...wrap, margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--txt)' }}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px 16px',
          marginTop: rows.length > 0 ? 16 : 0,
        }}
      >
        <a
          href={affiliateLink}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={(e) => trackAffiliateClick(e, { toolName: facts.name, ctaPosition: 'verdict_card' })}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxSizing: 'border-box',
            minHeight: 44,
            maxWidth: '100%',
            background: 'linear-gradient(135deg,var(--a1),var(--a2))',
            color: '#fff',
            borderRadius: 100,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          {ctaLabel} <ExternalLink size={14} aria-hidden="true" />
        </a>
        {verified && (
          <span style={{ ...wrap, fontSize: 12, color: 'var(--mut)' }}>
            {verified}
            {facts.pricingPageUrl && (
              <>
                {' · '}
                <a
                  href={facts.pricingPageUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  style={{ color: 'var(--a1)', fontWeight: 600, textDecoration: 'none' }}
                >
                  official pricing page
                </a>
              </>
            )}
          </span>
        )}
      </div>

      <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--mut)', margin: '12px 0 0' }}>
        Affiliate link — I earn a commission if you upgrade, at no extra cost to you.{' '}
        <a
          href="/disclosure/"
          onClick={
            navigate
              ? (e) => {
                  e.preventDefault();
                  navigate('/disclosure');
                }
              : undefined
          }
          style={{ color: 'var(--a1)', textDecoration: 'underline' }}
        >
          Full disclosure →
        </a>
      </p>
    </section>
  );
}

export default VerdictCard;
