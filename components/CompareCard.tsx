import React from 'react';
import { ExternalLink } from 'lucide-react';
import { getVerifiedFacts, verifiedLabel, type ToolFacts } from '../lib/vendor-facts';
import { buildVerdictRows, verdictCtaLabel, type VerdictRow } from './VerdictCard';
import { trackAffiliateClick } from '../lib/subid-tracking';

// components/CompareCard.tsx  (Phase 3, task 3.1)
//
// Two-column "at a glance" card for compare pages: tool A | tool B, a winner badge,
// ONE primary call to action (the winner's) and the affiliate disclosure.
//
// RULES THIS COMPONENT FOLLOWS (same as VerdictCard)
//  - Every fact comes from lib/vendor-facts.ts via getVerifiedFacts(slug). The card is
//    only mounted when BOTH tools are verified (see resolveCompareFacts below).
//  - The rows come from buildVerdictRows(), so the wording is identical to the tool
//    page's verdict card. null means "not verified": when only one side has a value,
//    the other side says "Not verified" instead of guessing; when neither has it, the
//    row is dropped.
//  - Pure and synchronous: no state, no effects, no fetching, so prerender.mjs can
//    render the same HTML (task 3.3) and nothing shifts after load.
//  - Colours come from the CSS variables in index.html (light, dark, manual switch).
//  - Mobile first: the two columns stack below ~500px and sit side by side above it.

export interface CompareFacts {
  a: ToolFacts;
  b: ToolFacts;
}

/**
 * The verified facts for a pair, or null when the card must not show:
 * either tool is not verified, the two slugs are the same, or the winner is
 * neither of the two tools (for example case-study articles).
 */
export function resolveCompareFacts(
  slugA: string,
  slugB: string,
  winnerSlug: string,
): CompareFacts | null {
  if (slugA === slugB) return null;
  if (winnerSlug !== slugA && winnerSlug !== slugB) return null;
  const a = getVerifiedFacts(slugA);
  const b = getVerifiedFacts(slugB);
  return a && b ? { a, b } : null;
}

export interface CompareRow {
  key: VerdictRow['key'];
  label: string;
  a: string | null;
  b: string | null;
}

/** Rows in a fixed order. A row is dropped when neither tool has a verified value. */
export function buildCompareRows(a: ToolFacts, b: ToolFacts): CompareRow[] {
  const ra = buildVerdictRows(a);
  const rb = buildVerdictRows(b);
  const order: VerdictRow['key'][] = ['bestFor', 'skipIf', 'startsAt', 'freePlan'];
  const out: CompareRow[] = [];
  for (const key of order) {
    const va = ra.find((r) => r.key === key);
    const vb = rb.find((r) => r.key === key);
    if (!va && !vb) continue;
    out.push({ key, label: (va ?? vb)!.label, a: va?.value ?? null, b: vb?.value ?? null });
  }
  return out;
}

export interface CompareCardProps {
  facts: CompareFacts;
  /** Slug of the winning tool. Must be facts.a.slug or facts.b.slug. */
  winnerSlug: string;
  /** The winner's affiliate URL. */
  affiliateLink: string;
  /** Optional path of the winner's full review, shown as a plain text link (not a second CTA). */
  fullReviewPath?: string;
  /** Optional SPA navigate function; without it the links are normal links. */
  navigate?: (to: string) => void;
}

/** The article fields the card needs. CompareArticle satisfies this. */
export interface CompareCardArticle {
  toolSlugs?: [string, string];
  winnerSlug: string;
  winnerAffiliateLink: string;
}

/**
 * THE ONE RULE for whether a compare page shows the card, and with what props.
 * Used by pages/CompareArticlePage.tsx (live page) and lib/verdict-card-ssr.tsx
 * (prerender), so crawlers and readers can never see different cards.
 * Returns null when the page must not show a card.
 *
 * @param winnerHasToolPage true when /tools/<winnerSlug>/ exists (shows the "full review" text link)
 */
export function compareCardPropsFor(
  article: CompareCardArticle,
  winnerHasToolPage: boolean,
): Omit<CompareCardProps, 'navigate'> | null {
  if (!article.toolSlugs || !article.winnerAffiliateLink) return null;
  const facts = resolveCompareFacts(article.toolSlugs[0], article.toolSlugs[1], article.winnerSlug);
  if (!facts) return null;
  return {
    facts,
    winnerSlug: article.winnerSlug,
    affiliateLink: article.winnerAffiliateLink,
    fullReviewPath: winnerHasToolPage ? `/tools/${article.winnerSlug}/` : undefined,
  };
}

const wrap: React.CSSProperties = { minWidth: 0, overflowWrap: 'anywhere' };

function Column({ tool, rows, side, isWinner }: { tool: ToolFacts; rows: CompareRow[]; side: 'a' | 'b'; isWinner: boolean }) {
  return (
    <div
      role="group"
      aria-label={tool.name}
      data-compare-side={side}
      style={{
        ...wrap,
        boxSizing: 'border-box',
        background: 'var(--surf2)',
        border: isWinner ? '2px solid var(--a1)' : '1px solid var(--a1-brd)',
        borderRadius: 12,
        padding: 'clamp(12px, 3.5vw, 16px)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 10px', marginBottom: 10 }}>
        <span style={{ ...wrap, fontSize: 16, fontWeight: 700, color: 'var(--txt)' }}>{tool.name}</span>
        {isWinner && (
          <span
            data-winner-badge="true"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#fff',
              background: 'var(--a1)',
              borderRadius: 100,
              padding: '3px 10px',
              whiteSpace: 'nowrap',
            }}
          >
            🏆 Our pick
          </span>
        )}
      </div>
      <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
        {rows.map((r) => {
          const value = side === 'a' ? r.a : r.b;
          return (
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
              <dd
                style={{
                  ...wrap,
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: value ? 'var(--txt)' : 'var(--mut)',
                  fontStyle: value ? 'normal' : 'italic',
                }}
              >
                {value ?? 'Not verified'}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function CompareCard({ facts, winnerSlug, affiliateLink, fullReviewPath, navigate }: CompareCardProps) {
  const { a, b } = facts;
  const winner = winnerSlug === a.slug ? a : winnerSlug === b.slug ? b : null;
  if (!winner) return null;

  const rows = buildCompareRows(a, b);
  const la = verifiedLabel(a);
  const lb = verifiedLabel(b);
  const sameDate = la !== null && la === lb;

  return (
    <section
      aria-label={`${a.name} vs ${b.name} at a glance`}
      data-compare-card={`${a.slug}|${b.slug}`}
      style={{
        background: 'var(--surf)',
        border: '1px solid var(--a1-brd)',
        borderRadius: 16,
        padding: 'clamp(14px, 4vw, 20px)',
        margin: '0 0 24px',
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
        At a glance: {a.name} vs {b.name}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 12,
        }}
      >
        <Column tool={a} rows={rows} side="a" isWinner={winner.slug === a.slug} />
        <Column tool={b} rows={rows} side="b" isWinner={winner.slug === b.slug} />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '10px 16px',
          marginTop: 16,
        }}
      >
        <a
          href={affiliateLink}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={(e) => trackAffiliateClick(e, { toolName: winner.name, ctaPosition: 'compare_card' })}
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
          {verdictCtaLabel(winner)} <ExternalLink size={14} aria-hidden="true" />
        </a>
        {fullReviewPath && (
          <a
            href={fullReviewPath}
            onClick={
              navigate
                ? (e) => {
                    e.preventDefault();
                    navigate(fullReviewPath);
                  }
                : undefined
            }
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--a1)', textDecoration: 'none' }}
          >
            Read the full {winner.name} review →
          </a>
        )}
      </div>

      <p style={{ ...wrap, fontSize: 12, lineHeight: 1.5, color: 'var(--mut)', margin: '12px 0 0' }}>
        {sameDate ? (
          <>
            {la}
            {' · '}
            <PricingLink tool={a} />
            {' · '}
            <PricingLink tool={b} />
          </>
        ) : (
          <>
            {a.name}: {la ?? 'date not verified'} · <PricingLink tool={a} />
            {' · '}
            {b.name}: {lb ?? 'date not verified'} · <PricingLink tool={b} />
          </>
        )}
      </p>

      <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--mut)', margin: '8px 0 0' }}>
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

function PricingLink({ tool }: { tool: ToolFacts }) {
  if (!tool.pricingPageUrl) return <>{tool.name} pricing</>;
  return (
    <a
      href={tool.pricingPageUrl}
      target="_blank"
      rel="nofollow noopener noreferrer"
      style={{ color: 'var(--a1)', fontWeight: 600, textDecoration: 'none' }}
    >
      {tool.name} pricing
    </a>
  );
}

export default CompareCard;
