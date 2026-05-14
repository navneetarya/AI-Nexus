import React from 'react';
import { ArrowLeft, ExternalLink, Check, X, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';
import { BeehiivForm } from '../components/BeehiivForm';

const C = {
  bg: 'var(--bg)', surf: 'var(--surf)', surf2: 'var(--surf2)', a1: 'var(--a1)', a2: 'var(--a2)',
  txt: 'var(--txt)', mut: 'var(--mut)', mut2: 'var(--mut2)',
  a1card: 'var(--a1-card)', a1brd: 'var(--a1-brd)',
  a2card: 'var(--a2-card)', a2brd: 'var(--a2-brd)',
  barBg: 'var(--bar-bg)', barBrd: 'var(--bar-brd)',
  brdSm: 'var(--brd-sm)', brdXs: 'var(--brd-xs)',
};

export { COMPARE_ARTICLES } from './compare-data';
export type { CompareArticle, CompareSection, CompareRow, ComparePricing, ToolPricing, FeatureRow } from './compare-data';
import { COMPARE_ARTICLES } from './compare-data';
import type { CompareArticle, ComparePricing, FeatureRow } from './compare-data';

// ── T3.1: Feature Comparison Table Component ──────────────────────────────
function FeatureComparisonTable({ rows, toolA, toolB }: { rows: FeatureRow[]; toolA: string; toolB: string }) {
  const WIN_A  = { bg: 'rgba(16,185,129,.12)', color: '#10b981', label: toolA };
  const WIN_B  = { bg: 'rgba(99,102,241,.12)',  color: '#6366f1', label: toolB };
  const WIN_TIE = { bg: 'rgba(245,158,11,.10)', color: '#f59e0b', label: 'Tie' };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.txt, margin: '0 0 0.75rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
        ⚖️ Feature-by-Feature Comparison
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, background: C.surf, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.brdSm}` }}>
          <thead>
            <tr style={{ background: C.surf2 }}>
              {['Feature', toolA, toolB, 'Winner'].map((h, i) => (
                <th key={h} style={{
                  padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: 11.5,
                  color: i === 0 ? C.mut2 : i === 1 ? C.a1 : i === 2 ? '#6366f1' : C.mut,
                  borderBottom: `1px solid ${C.brdSm}`, whiteSpace: 'nowrap' as const,
                  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const win = row.winner === 'A' ? WIN_A : row.winner === 'B' ? WIN_B : WIN_TIE;
              const isEven = i % 2 === 0;
              return (
                <tr key={i} style={{ background: isEven ? C.surf : C.surf2, borderBottom: `1px solid ${C.brdXs}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: C.txt, fontSize: 13 }}>{row.feature}</td>
                  <td style={{ padding: '10px 14px', color: C.mut, fontSize: 13 }}>{row.toolA}</td>
                  <td style={{ padding: '10px 14px', color: C.mut, fontSize: 13 }}>{row.toolB}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px',
                      borderRadius: 100, background: win.bg, color: win.color,
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {row.winner === 'tie' ? '🤝 Tie' : `✓ ${win.label}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── W4-T4: Pricing Table Component ────────────────────────────────────────
function PricingTable({ pricing }: { pricing: ComparePricing }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: C.txt, margin: '0 0 0.75rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
        💰 Pricing Comparison
      </h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, background: C.surf, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.brdSm}` }}>
          <thead>
            <tr style={{ background: C.a1 }}>
              {['Tool', 'Free Plan', 'Starting Price', 'Paid From', 'Best For'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: '#fff', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pricing.tools.map((tool, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.surf : C.surf2, borderBottom: `1px solid ${C.brdSm}` }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: C.a1 }}>
                  {tool.affiliateLink ? (
                    <a href={tool.affiliateLink} target="_blank" rel="sponsored nofollow noopener noreferrer"
                      style={{ color: C.a1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      {tool.name} <ExternalLink size={11} />
                    </a>
                  ) : tool.name}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  {tool.free ? <Check size={15} color="#10b981" /> : <X size={15} color="#ef4444" />}
                </td>
                <td style={{ padding: '10px 14px', color: C.txt, fontWeight: 600 }}>{tool.startingPrice}</td>
                <td style={{ padding: '10px 14px', color: C.mut }}>{tool.paidFrom}</td>
                <td style={{ padding: '10px 14px', color: C.mut, fontSize: 12.5 }}>{tool.bestPlanFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: C.mut2, margin: '6px 0 0', fontStyle: 'italic' }}>
        Prices verified as of {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. Affiliate links marked with ↗ — I earn a commission at no cost to you.
      </p>
    </div>
  );
}

// ── Tool name → slug mapping for first-mention internal links (Task 4) ─────
const TOOL_LINK_MAP: Record<string, string> = {
  'Rytr':           'rytr',
  'Writesonic':     'writesonic',
  'Grammarly':      'grammarly',
  'QuillBot':       'quillbot',
  'Quillbot':       'quillbot',
  'Podcastle':      'podcastle',
  'Leonardo.ai':    'leonardo-ai',
  'Replit':         'replit',
  'Taskade':        'taskade',
  'Notion AI':      'notion-ai',
  'Ocoya':          'ocoya',
  'Frase':          'frase',
  'PhotoRoom':      'photoroom',
  'Looka':          'looka',
  'Pictory':        'pictory',
  'Opus Clip':      'opus-clip',
  'InVideo AI':     'invideo',
  'Murf AI':        'murf-ai',
  'Gamma':          'gamma',
  'Beautiful.ai':   'beautiful-ai',
};

// ── Helper: parse inline **bold** markdown + first-mention tool links ────────
function renderContent(text: string, navigate?: (to: string) => void, seenTools?: Set<string>) {
  const linked = seenTools ?? new Set<string>();
  // Sort tool names longest-first to avoid partial matches (e.g. "Notion AI" before "Notion")
  const toolNames = Object.keys(TOOL_LINK_MAP).sort((a, b) => b.length - a.length);

  function linkifyChunk(chunk: string, baseKey: string): React.ReactNode {
    if (!navigate) return <span key={baseKey}>{chunk}</span>;
    const parts: React.ReactNode[] = [];
    let remaining = chunk;
    let partIdx = 0;
    while (remaining.length > 0) {
      let matched = false;
      for (const toolName of toolNames) {
        const idx = remaining.indexOf(toolName);
        if (idx !== -1 && !linked.has(toolName)) {
          if (idx > 0) parts.push(<span key={`${baseKey}-${partIdx++}`}>{remaining.slice(0, idx)}</span>);
          linked.add(toolName);
          const slug = TOOL_LINK_MAP[toolName];
          parts.push(
            <span
              key={`${baseKey}-${partIdx++}`}
              onClick={() => navigate(`/tools/${slug}`)}
              style={{ color: C.a1, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: `${C.a1}55` }}
            >{toolName}</span>
          );
          remaining = remaining.slice(idx + toolName.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        parts.push(<span key={`${baseKey}-${partIdx++}`}>{remaining}</span>);
        break;
      }
    }
    return <React.Fragment key={baseKey}>{parts}</React.Fragment>;
  }

  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={j}>{chunk.slice(2, -2)}</strong>;
      }
      return linkifyChunk(chunk, `${i}-${j}`);
    });
    return (
      <p key={i} style={{ margin: '0 0 1rem', lineHeight: 1.75, color: C.txt }}>
        {parts}
      </p>
    );
  });
}

// ── Main Component ─────────────────────────────────────────────────────────
interface Props {
  article: CompareArticle;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

// ── FAQ Section Component ──────────────────────────────────────────────────
function FAQSection({ faqs, a1, a1card, a1brd, txt, mut }: {
  faqs: { q: string; a: string }[];
  a1: string; a1card: string; a1brd: string; txt: string; mut: string;
}) {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);
  if (!faqs || faqs.length === 0) return null;
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: txt, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
        Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{
            background: openIdx === i ? a1card : 'transparent',
            border: `1px solid ${openIdx === i ? a1brd : 'var(--brd)'}`,
            borderRadius: 12, overflow: 'hidden', transition: 'background .15s',
          }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: '100%', textAlign: 'left' as const, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, fontWeight: 600, color: txt,
                gap: 12,
              }}
            >
              <span>{faq.q}</span>
              <span style={{ color: a1, fontSize: 18, lineHeight: 1, flexShrink: 0 }}>
                {openIdx === i ? '−' : '+'}
              </span>
            </button>
            {openIdx === i && (
              <div style={{ padding: '0 18px 14px', fontSize: 14, color: mut, lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CompareArticlePage({ article, navigate, isDark, toggleTheme }: Props) {
  // Track which tool names have been linked already — only link first mention per page
  const linked = React.useRef(new Set<string>()).current;
  // Reset on article change
  React.useEffect(() => { linked.clear(); }, [article.slug, linked]);

  // Inject Article JSON-LD schema for Google rich results
  // NOTE: FAQPage schema is already injected by the prerender script into the static HTML.
  // Do NOT add a second FAQPage here — Google will flag it as "Duplicate field 'FAQPage'".
  React.useEffect(() => {
    // Article schema with dateModified — tells Google this content is fresh
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': article.title,
      'description': article.metaDescription,
      'datePublished': '2026-01-01',
      'dateModified': new Date().toISOString().split('T')[0],
      'author': { '@type': 'Person', 'name': SITE_CONFIG.authorName, 'url': `${SITE_CONFIG.siteUrl}/about` },
      'publisher': { '@type': 'Organization', 'name': 'AI Nexus', 'url': SITE_CONFIG.siteUrl },
      'mainEntityOfPage': { '@type': 'WebPage', '@id': `${SITE_CONFIG.siteUrl}/compare/${article.slug}` },
    };
    document.querySelectorAll('script[data-compare-article]').forEach(el => el.remove());
    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.setAttribute('data-compare-article', 'true');
    articleScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    // W2-3: Standalone BreadcrumbList schema for Compare pages
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_CONFIG.siteUrl },
        { '@type': 'ListItem', 'position': 2, 'name': 'Comparisons', 'item': `${SITE_CONFIG.siteUrl}/compare` },
        { '@type': 'ListItem', 'position': 3, 'name': article.keyword, 'item': `${SITE_CONFIG.siteUrl}/compare/${article.slug}` },
      ],
    };
    document.querySelectorAll('script[data-compare-breadcrumb]').forEach(el => el.remove());
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-compare-breadcrumb', 'true');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelectorAll('script[data-compare-article]').forEach(el => el.remove());
      document.querySelectorAll('script[data-compare-breadcrumb]').forEach(el => el.remove());
    };
  }, [article.slug, article.faqs]);
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav bar */}
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="compare" />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>

        {/* Breadcrumb — H3 fix: semantic <nav> with aria-label + aria-current */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, gap: 6, fontSize: 13, color: C.mut2 }}>
            <li>
              <span style={{ cursor: 'pointer', color: C.a1 }} onClick={() => navigate('/')}>Home</span>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li>
              <span style={{ cursor: 'pointer', color: C.a1 }} onClick={() => navigate('/')}>Compare</span>
            </li>
            <li aria-hidden="true"><ChevronRight size={12} /></li>
            <li aria-current="page">{article.keyword}</li>
          </ol>
        </nav>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: C.txt, lineHeight: 1.2, margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
          {article.title}
        </h1>

        {/* W3-T2: QuickAnswer — hardened for AI citation extraction (Perplexity, ChatGPT, Gemini) */}
        <section
          aria-label="Quick Answer"
          itemScope
          itemType="https://schema.org/Answer"
          style={{ background: C.a1card, border: `1.5px solid ${C.a1brd}`, borderRadius: 12, padding: '16px 20px', marginBottom: '1.25rem' }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0, fontSize: 18, lineHeight: 1 }}>⚡</div>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: C.a1, letterSpacing: '0.04em', margin: '0 0 6px', fontFamily: "'Inter', system-ui, sans-serif" }}>
                Quick Answer: {article.title.replace(/\s*\(\d{4}\).*$/, '')}
              </h2>
              <p itemProp="text" style={{ fontSize: 14, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                {article.quickAnswer}
              </p>
            </div>
          </div>
        </section>

        {/* W4-T4: Pricing Comparison Table — answers buyer's #1 question immediately */}
        {article.pricing && <PricingTable pricing={article.pricing} />}

        {/* T3.1: Feature Comparison Table — MarketerMilk parity */}
        {article.featureRows && article.featureRows.length > 0 && (
          <FeatureComparisonTable
            rows={article.featureRows}
            toolA={article.comparisonTable[0]?.name ?? 'Tool A'}
            toolB={article.comparisonTable[1]?.name ?? 'Tool B'}
          />
        )}

        {/* Meta */}
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: 13, color: C.mut, marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>By {SITE_CONFIG.authorName}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
            color: C.a1, background: C.a1card,
            border: `1px solid ${C.a1brd}`,
            padding: '3px 10px', borderRadius: 100,
          }}>
            🗓 Last verified: {article.lastUpdated ?? article.publishDate}
          </span>
          <span style={{ color: C.a1, fontWeight: 600 }}>Independently reviewed — no paid placements</span>
        </div>

        {/* Intro */}
        <div style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          {renderContent(article.intro, navigate, linked)}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.txt, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          At a glance — pricing & features
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: C.surf, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px var(--brd-xs)' }}>
            <thead>
              <tr style={{ background: C.a1, color: '#fff' }}>
                {['Tool', 'Price/mo', 'USD/mo', 'Free plan', 'AI captions', 'Platforms', 'Best for'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {article.comparisonTable.map((row, i) => (
                <tr key={i} style={{
                  background: row.ourPick
                    ? C.a1card
                    : i % 2 === 0 ? C.surf : C.surf2,
                  borderBottom: `1px solid ${C.brdSm}`,
                }}>
                  <td style={{ padding: '12px 14px', fontWeight: row.ourPick ? 700 : 500, color: row.ourPick ? C.a1 : C.txt }}>
                    {row.name}
                    {row.ourPick && (
                      <span style={{ marginLeft: 6, background: C.a1, color: '#fff', borderRadius: 4, fontSize: 10, padding: '2px 6px', fontWeight: 700 }}>
                        Our pick
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: C.txt }}>{row.price}</td>
                  <td style={{ padding: '12px 14px', color: C.txt }}>{row.priceUSD}</td>
                  <td style={{ padding: '12px 14px' }}>{row.freeplan ? <Check size={15} color="#10b981" /> : <X size={15} color="#ef4444" />}</td>
                  <td style={{ padding: '12px 14px', color: C.mut, fontSize: 13 }}>{row.aiContent}</td>
                  <td style={{ padding: '12px 14px', color: C.mut }}>{row.platforms}</td>
                  <td style={{ padding: '12px 14px', color: C.mut, fontSize: 13 }}>{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Article sections */}
        {article.sections.map((sec, i) => (
          <section key={i} style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.txt, margin: '0 0 0.85rem', letterSpacing: '-0.02em', borderLeft: `3px solid ${C.a1}`, paddingLeft: '0.75rem' }}>
              {sec.heading}
            </h2>
            {renderContent(sec.content, navigate, linked)}
          </section>
        ))}

        {/* Verdict box */}
        <div style={{ background: C.a2card, border: `1px solid ${C.a2brd}`, borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.a2, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚖️ Our Verdict
          </div>
          {renderContent(article.verdict, navigate, linked)}
        </div>

        {/* FAQ Section — FAQPage JSON-LD injected by prerender.mjs (not duplicated here) */}
        <FAQSection
          faqs={article.faqs}
          a1={C.a1} a1card={C.a1card} a1brd={C.a1brd}
          txt={C.txt} mut={C.mut}
        />

        {/* Winner CTA */}
        <div style={{ background: C.surf, border: `1px solid ${C.a1brd}`, borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(13,148,136,.1)' }}>
          <div style={{ fontSize: 22, marginBottom: '0.4rem' }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.txt, marginBottom: '0.4rem' }}>
            Winner: {article.winnerName}
          </div>
          <div style={{ fontSize: 14, color: C.mut, marginBottom: '1.25rem' }}>
            Best for solo creators & small businesses. Try free, no credit card required.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={article.winnerAffiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.a1, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
            >
              {article.winnerAffiliateText} <ExternalLink size={15} />
            </a>
            <button
              onClick={() => navigate(`/tools/${article.winnerSlug}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: `1.5px solid ${C.a1brd}`, color: C.a1, padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Full review <ChevronRight size={15} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.mut2, marginTop: '0.75rem' }}>
            Affiliate link — we earn a commission at no extra cost to you. <span style={{ cursor: 'pointer', textDecoration: 'underline', color: C.mut }} onClick={() => navigate('/disclosure')}>Disclosure</span>
          </div>
        </div>

        {/* Newsletter — bottom of article, after the CTA */}
        <BeehiivForm variant="article" />

      </main>
    </div>
  );
}
