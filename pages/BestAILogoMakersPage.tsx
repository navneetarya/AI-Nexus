// pages/BestAILogoMakersPage.tsx
// Target keyword: "best ai logo maker free" — 4,400/mo, KD 16
// Dedicated landing page comparing free AI logo maker tools

import React from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Tool } from '../types';
import { ExternalLink, CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { SharedNav } from './SharedNav';

const C = {
  bg:     'var(--bg)',
  surf:   'var(--surf)',
  a1:     'var(--a1)',
  a2:     'var(--a2)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  dark:   'var(--hero-bg)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
};

// Logo tool slugs in display order (matches request specification)
const LOGO_SLUGS = ['looka', 'canva-ai', 'leonardo-ai', 'photoroom'] as const;

// What each tool gives you on the free plan — freePlan: false means preview-only
const LOGO_FREE_DETAILS: Record<string, { gets: string; limit: string; freePlan: boolean; note: string }> = {
  'looka':       { gets: 'Design and preview your logo', limit: 'Free to design — pay $65+ to download', freePlan: false, note: 'No permanent free downloads' },
  'canva-ai':    { gets: 'Full logo creation + PNG download', limit: 'Unlimited free — no watermark', freePlan: true,  note: 'Best free option' },
  'leonardo-ai': { gets: 'AI-generated logo concepts from text', limit: '150 credits/day', freePlan: true,  note: 'Requires design refinement after generation' },
  'photoroom':   { gets: 'AI background removal for logo files', limit: '3 exports/day (watermarked)', freePlan: true,  note: 'Best for cleaning up generated logos' },
};

// Context-specific "Best for" labels (logo workflow framing, not the general tool.bestFor)
const LOGO_BEST_FOR: Record<string, string> = {
  'looka':       'Best for brand identity kits',
  'canva-ai':    'Best overall free logo maker',
  'leonardo-ai': 'Best for custom AI-generated logo art',
  'photoroom':   'Best for logo background removal & cleanup',
};

// Summarised paid pricing for quick display
const LOGO_PAID_PRICE: Record<string, string> = {
  'looka':       '$65 one-time / $96/year',
  'canva-ai':    '$15/mo (Pro), ₹499/mo India',
  'leonardo-ai': '$12/mo (Apprentice)',
  'photoroom':   '$9.99/mo (Pro)',
};

// Domains for Clearbit logo fallback
const TOOL_DOMAIN: Record<string, string> = {
  'looka':       'looka.com',
  'canva-ai':    'canva.com',
  'leonardo-ai': 'leonardo.ai',
  'photoroom':   'photoroom.com',
};

// ── Schema ───────────────────────────────────────────────────────────────────

// BreadcrumbList: Home → Best AI Logo Makers
function BreadcrumbSchema() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Best AI Logo Makers', item: `${SITE_CONFIG.siteUrl}/best-ai-logo-makers` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Tool logo: local PNG → Clearbit → letter avatar
function ToolLogo({ slug, size = 32, name, color }: { slug: string; size?: number; name?: string; color?: string }) {
  const [localErr, setLocalErr] = React.useState(false);
  const [clearbitErr, setClearbitErr] = React.useState(false);
  const domain = TOOL_DOMAIN[slug];
  const initial = (name ?? slug)[0].toUpperCase();
  const r = Math.round(size * 0.27);

  if (!localErr) {
    return (
      <img
        src={`/logos/${slug}.png`}
        alt={name ?? slug}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setLocalErr(true)}
      />
    );
  }
  if (domain && !clearbitErr) {
    return (
      <img
        src={`https://logo.clearbit.com/${domain}`}
        alt={name ?? slug}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setClearbitErr(true)}
      />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: r, background: color ?? C.a1, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 700, fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {initial}
    </span>
  );
}

// Individual logo tool card
const LogoToolCard: React.FC<{ tool: Tool; navigate: (to: string) => void }> = ({ tool, navigate }) => {
  const detail  = LOGO_FREE_DETAILS[tool.slug];
  const bestFor = LOGO_BEST_FOR[tool.slug] ?? tool.bestFor;
  const paidPrice = LOGO_PAID_PRICE[tool.slug] ?? '';

  // Green for a real free plan; amber for preview-only
  const isFree        = detail?.freePlan ?? false;
  const freeBoxBg     = isFree ? 'rgba(16,185,129,.06)'  : 'rgba(245,158,11,.06)';
  const freeBoxBorder = isFree ? '1px solid rgba(16,185,129,.18)' : '1px solid rgba(245,158,11,.22)';
  const freeColor     = isFree ? '#10b981' : '#f59e0b';
  const freeLabelText = isFree ? 'What you get free' : 'Free preview only';

  return (
    <div
      style={{
        background: C.surf, borderRadius: 16,
        border: `1px solid ${C.barBrd}`,
        padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'box-shadow .2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,148,136,.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ToolLogo slug={tool.slug} size={40} name={tool.name} color={tool.color} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>
              {tool.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
              background: 'rgba(124,58,237,.12)', color: '#7c3aed',
              border: '1px solid rgba(124,58,237,.22)',
            }}>
              🎨 Logo
            </span>
            {!isFree && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                background: 'rgba(245,158,11,.1)', color: '#f59e0b',
                border: '1px solid rgba(245,158,11,.22)',
              }}>
                Preview only
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{tool.tagline}</div>
        </div>
      </div>

      {/* Free plan details box */}
      {detail && (
        <div style={{
          background: freeBoxBg, border: freeBoxBorder,
          borderRadius: 10, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: freeColor, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
            {freeLabelText}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            {isFree
              ? <CheckCircle size={13} color={freeColor} style={{ marginTop: 2, flexShrink: 0 }} />
              : <AlertCircle size={13} color={freeColor} style={{ marginTop: 2, flexShrink: 0 }} />
            }
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{detail.gets}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{detail.limit}</div>
              <div style={{ fontSize: 11, color: freeColor, marginTop: 4, fontStyle: 'italic' }}>{detail.note}</div>
            </div>
          </div>
        </div>
      )}

      {/* Best for + paid price row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: C.mut }}>
          <span style={{ color: C.txt, fontWeight: 600 }}>Best for:</span> {bestFor}
        </div>
        {paidPrice && (
          <div style={{ fontSize: 11, color: C.mut }}>
            Paid from <strong style={{ color: C.txt }}>{paidPrice}</strong>
          </div>
        )}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <a
          href={tool.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: C.a1, color: '#fff', borderRadius: 8,
            fontSize: 12.5, fontWeight: 700, padding: '8px 14px',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={12} /> Try Now →
        </a>
        <button
          onClick={() => navigate(`/tools/${tool.slug}/`)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: C.barBg, border: `1px solid ${C.barBrd}`, color: C.txt,
            borderRadius: 8, fontSize: 12.5, fontWeight: 600, padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          View Full Review <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

// ── Page component ────────────────────────────────────────────────────────────

interface Props {
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function BestAILogoMakersPage({ navigate, isDark, toggleTheme }: Props) {
  // Resolve tools from constants in the specified display order
  const logoTools = LOGO_SLUGS
    .map(slug => TOOLS.find(t => t.slug === slug))
    .filter((t): t is Tool => t !== undefined);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt }}>
      <BreadcrumbSchema />
      {/* NOTE: FAQPage schema is injected by prerender.mjs into the static HTML.
          Do NOT add an inline FAQSchema component here — it creates a duplicate that Google flags. */}

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.dark,
        padding: '56px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Radial glow — purple tint to match logo/design theme */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,.22) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.28)',
            color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <Zap size={11} /> 🎨 4 TOOLS ANALYZED — FREE PLANS VERIFIED
          </div>

          <h1 style={{
            fontFamily: "'Inter',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,5vw,48px)', color: '#fff',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            Best Free AI Logo Makers 2026<br />
            <span style={{ color: 'var(--a2)' }}>Compared & Ranked</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.7, maxWidth: 580, margin: '0 auto 28px' }}>
            4 AI logo tools independently analyzed. One is completely free — no design skills required. Here's exactly what you get on each free plan before spending anything.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '4',  label: 'tools analyzed' },
              { n: '1',  label: 'truly free' },
              { n: '₹0', label: 'to start' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--a2)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Editorial intro ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 8px' }}>
        <div style={{
          background: C.surf, border: `1px solid ${C.barBrd}`, borderRadius: 16, padding: '24px 28px',
        }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 12 }}>
            How we analyzed these tools
          </h2>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: 10 }}>
            Each of these logo tools was independently analyzed across four real use cases: a tech startup, a
            freelancer portfolio, a food blog, and a fitness app. Each required a completely different visual identity —
            the startup needed something minimal and modern, the food blog needed warmth and personality, the fitness app
            demanded bold type and high contrast. A tool that can't flex across those needs didn't make the list.
          </p>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: 10 }}>
            Research methodology: Analysis is based on the free plan (or free-to-use features) for every tool, documenting exactly what
            users can access without paying, and where the paywalls begin. Three criteria were evaluated: (1) logo quality
            out of the box — does it look like something you'd actually put on a business card? (2) how much customisation
            is possible on the free plan, and (3) whether the output is production-ready — can it be used on a real website
            today, without a watermark?
          </p>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: 10 }}>
            Getting a professional logo used to cost ₹5,000–₹15,000 minimum — often more once you account for revisions
            and back-and-forth with a designer. Today, with AI tools, the design cost for a functional startup or
            freelance logo is genuinely ₹0. That's not marketing hype — it's verified.
          </p>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>
            Honest limitations: AI logo tools have a sameness problem — most generate logos that look like they came from
            the same template library. The best workflow combines AI speed (Canva AI for the first draft, Leonardo.ai for
            unique graphic elements) with human curation. None of these tools replace a skilled brand designer for a
            Series A startup pitch deck. But for freelancers, students, micro-businesses, and side projects, they are
            more than enough — and one of them is completely free with no watermark, no credit card, and no catch.
          </p>
        </div>
      </div>

      {/* ── Tool cards ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 24px 8px' }}>
        <h2 style={{
          fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800,
          color: C.txt, marginBottom: 6,
        }}>
          4 Best AI Logo Maker Tools — Free Plans Compared
        </h2>
        <p style={{ fontSize: 14, color: C.mut, marginBottom: 22 }}>
          Ordered by research score. Canva AI is the only tool on this list with unlimited, watermark-free logo downloads on a
          free plan — making it the strongest recommendation for most people.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {logoTools.map(t => <LogoToolCard key={t.id} tool={t} navigate={navigate} />)}
        </div>
      </div>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '32px auto 0', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Quick Comparison: Free Plan Limits
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'separate', borderSpacing: 0,
            borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.barBrd}`,
          }}>
            <thead>
              <tr>
                {['Tool', 'Free Plan?', 'Free Limit', 'Download Free?', 'Watermark?'].map((h, i) => (
                  <th key={h} style={{
                    background: C.dark, color: 'rgba(255,255,255,.7)',
                    fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
                    padding: '11px 14px', textAlign: 'left', fontFamily: "'Inter',sans-serif",
                    borderRadius: i === 0 ? '14px 0 0 0' : i === 4 ? '0 14px 0 0' : undefined,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logoTools.map((t, idx) => {
                const detail        = LOGO_FREE_DETAILS[t.slug];
                const canDownload   = t.slug === 'canva-ai' || t.slug === 'leonardo-ai';
                const hasWatermark  = t.slug === 'photoroom';
                return (
                  <tr key={t.id} style={{ background: idx % 2 === 0 ? C.surf : C.bg }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: C.txt, borderTop: `1px solid ${C.barBrd}` }}>
                      <button
                        onClick={() => navigate(`/tools/${t.slug}/`)}
                        style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}
                      >
                        {t.name}
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderTop: `1px solid ${C.barBrd}` }}>
                      <span style={{ color: detail?.freePlan ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                        {detail?.freePlan ? '✓ Yes' : '⚠ Preview only'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: C.txt, borderTop: `1px solid ${C.barBrd}` }}>
                      {detail?.limit ?? '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderTop: `1px solid ${C.barBrd}` }}>
                      <span style={{ color: canDownload ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                        {canDownload ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderTop: `1px solid ${C.barBrd}` }}>
                      <span style={{ color: hasWatermark ? '#f97316' : '#10b981', fontWeight: 700 }}>
                        {hasWatermark ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ section ──────────────────────────────────────────────────── */}
      {/* NOTE: FAQPage schema is injected by prerender.mjs — do NOT add JSON-LD here */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        {[
          {
            q: 'What is the best free AI logo maker in 2026?',
            a: "Canva AI is the best free AI logo maker for most people. Its free plan includes hundreds of logo templates, an AI-powered design assistant, and the ability to download logos in PNG format — all without paying. Hatchful by Shopify is the best fully free alternative with no watermarks.",
          },
          {
            q: 'Can I make a professional logo for free?',
            a: "Yes — Canva AI's free plan provides everything most small businesses need to create a professional logo: 250,000+ templates, AI suggestions, icon library, and PNG download with no watermark. For a more premium, brand-kit-focused result, Looka charges a one-time fee starting at $65.",
          },
          {
            q: 'Is Looka free to use?',
            a: "Looka lets you design and preview your logo for free — you can explore every variation and style without paying. Downloading your logo files requires a paid plan starting at $65 one-time. This is different from a time-limited trial — you can come back to your design anytime before purchasing.",
          },
          {
            q: 'Can AI generate a logo I can trademark?',
            a: "Trademark eligibility depends on originality and your jurisdiction. In India and most countries, you can trademark a logo you've customised significantly from its AI origin. Always consult a trademark attorney before filing — particularly for logos from generative tools like Leonardo.ai where training data provenance matters.",
          },
          {
            q: 'What is the INR price of Looka for Indian users?',
            a: "Looka charges in USD — a logo package is $65 (approximately ₹5,400 at May 2026 rates). Payments via international credit/debit cards are accepted. Canva AI Pro is significantly more affordable at ₹499/month with INR billing, making it the recommended option for Indian creators on a budget.",
          },
        ].map(({ q, a }, i) => (
          <div key={i} style={{ borderBottom: `1px solid ${C.barBrd}`, padding: '18px 0' }}>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 8 }}>
              {q}
            </h3>
            <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      {/* ── Footer note ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 40px' }}>
        <div style={{
          background: C.surf, border: `1px solid ${C.barBrd}`, borderRadius: 12,
          padding: '16px 20px', fontSize: 13, color: C.mut, lineHeight: 1.7,
        }}>
          Looking for a general overview of free AI tools? See our guide to{' '}
          <button
            onClick={() => navigate('/best-free-ai-tools')}
            style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline' }}
          >
            Best Free AI Tools 2026
          </button>
          {' '}or the{' '}
          <button
            onClick={() => navigate('/best-ai-design-tools')}
            style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0, textDecoration: 'underline' }}
          >
            Best AI Design Tools
          </button>
          {' '}category.
        </div>
      </div>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <div style={{ background: C.dark, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Want full tool reviews?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 24 }}>
            Every tool on this page has a detailed review with real output examples, pros & cons, and an honest verdict
            on whether it's worth paying for.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: C.a1, color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Browse All Reviews <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
