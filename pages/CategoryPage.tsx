// pages/CategoryPage.tsx
// Dynamic category landing pages — /best-ai-writing-tools/, /best-ai-image-tools/, etc.
// Each category targets a high-volume keyword with unique editorial intro + FAQ.

import React, { lazy, Suspense } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, Tool } from '../types';
import { ExternalLink, Star, ArrowRight, Zap, BookOpen } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { CategoryIntroSections, CategoryDetailSections, CategoryFaq, categoryFaqPlain } from '../components/CategoryEditorial';
// Perf: use the lightweight metadata list (no full post `content`) so this
// route's bundle doesn't pull in every blog post's HTML body just to render
// the "From the blog" cards. Full content is only needed on /blog/:slug itself,
// which loads it via blog/loaders.ts (loadBlogPostBySlug).
import { BLOG_POSTS_META as BLOG_POSTS } from '../blog/metadata';
const BeehiivForm = lazy(() => import('../components/BeehiivForm').then(m => ({ default: m.BeehiivForm })));

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

// ── Category SEO metadata ────────────────────────────────────────────────────

interface CategoryMeta {
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  slug: string;
  emoji: string;
  color: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  [Category.WRITING]: {
    title: 'Best AI Writing Tools 2026',
    seoTitle: 'Best AI Writing Tools 2026 — Reviewed & Ranked | AI Nexus',
    metaDescription: 'The best AI writing tools in 2026, tested and ranked. Compare Grammarly, Rytr, Writesonic, Jasper, Quillbot and more — with real output examples and honest reviews.',
    h1: 'Best AI Writing Tools 2026',
    slug: 'best-ai-writing-tools',
    emoji: '✍️',
    color: '#a855f7',
  },

  [Category.IMAGE]: {
    title: 'Best AI Image Tools 2026',
    seoTitle: 'Best AI Image Generator & Editor Tools 2026 | AI Nexus',
    metaDescription: 'The best AI image generators and editors in 2026. Compare Leonardo.ai, Midjourney, DALL-E, PhotoRoom and more — with sample outputs and honest reviews.',
    h1: 'Best AI Image Tools 2026',
    slug: 'best-ai-image-tools',
    emoji: '🎨',
    color: '#3b82f6',
  },

  [Category.VIDEO]: {
    title: 'Best AI Video Tools 2026',
    seoTitle: 'Best AI Video Editor & Generator Tools 2026 | AI Nexus',
    metaDescription: 'The best AI video tools in 2026 for editing, generating, and repurposing video content. Compare InVideo, Opus Clip, Pictory and more — tested with real projects.',
    h1: 'Best AI Video Tools 2026',
    slug: 'best-ai-video-tools',
    emoji: '🎬',
    color: '#ef4444',
  },

  [Category.AUDIO]: {
    title: 'Best AI Audio Tools 2026',
    seoTitle: 'Best AI Voice Generator & Audio Tools 2026 | AI Nexus',
    metaDescription: 'The best AI audio and voice tools in 2026. Compare Murf AI, Podcastle, ElevenLabs and more — for voiceovers, podcasts, and audio production. Tested and ranked.',
    h1: 'Best AI Audio Tools 2026',
    slug: 'best-ai-audio-tools',
    emoji: '🎙️',
    color: '#f97316',
  },

  [Category.MARKETING]: {
    title: 'Best AI Marketing Tools 2026',
    seoTitle: 'Best AI Marketing Tools 2026 — Reviewed & Ranked | AI Nexus',
    metaDescription: 'The best AI marketing tools in 2026 for social media, ads, email, and content marketing. Compare Ocoya, Jasper, Copy.ai and more — with real campaign results.',
    h1: 'Best AI Marketing Tools 2026',
    slug: 'best-ai-marketing-tools',
    emoji: '📊',
    color: '#ec4899',
  },

  [Category.DESIGN]: {
    title: 'Best AI Design Tools 2026',
    seoTitle: 'Best AI Design Tools 2026 — Reviewed & Ranked | AI Nexus',
    metaDescription: 'The best AI design tools in 2026 for presentations, graphics, and UI. Compare Gamma, Canva AI, Beautiful.ai and more — with real design samples and reviews.',
    h1: 'Best AI Design Tools 2026',
    slug: 'best-ai-design-tools',
    emoji: '💎',
    color: '#14b8a6',
  },

  [Category.CODING]: {
    title: 'Best AI Coding Tools 2026',
    seoTitle: 'Best AI Coding Tools & Assistants 2026 | AI Nexus',
    metaDescription: 'The best AI coding tools in 2026 for developers. Compare GitHub Copilot, Replit, Cursor, Tabnine and more — tested with real coding projects and honest reviews.',
    h1: 'Best AI Coding Tools 2026',
    slug: 'best-ai-coding-tools',
    emoji: '💻',
    color: '#22c55e',
  },

  [Category.PRODUCTIVITY]: {
    title: 'Best AI Productivity Tools 2026',
    seoTitle: 'Best AI Productivity Tools 2026 — Reviewed & Ranked | AI Nexus',
    metaDescription: 'The best AI productivity tools in 2026 for task management, note-taking, and workflow automation. Compare Taskade, Notion AI, Motion and more — tested and reviewed.',
    h1: 'Best AI Productivity Tools 2026',
    slug: 'best-ai-productivity-tools',
    emoji: '⚡',
    color: '#f59e0b',
  },
};

// ── Tool logo with local-first fallback ──────────────────────────────────────

function ToolLogo({ tool, size = 40 }: { tool: Tool; size?: number }) {
  const [err, setErr] = React.useState(false);
  const r = Math.round(size * 0.27);
  const initial = tool.name[0].toUpperCase();

  if (!err) {
    return (
      <img loading="lazy"
        src={`/logos/${tool.slug}.png`}
        alt={tool.name}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: r, background: tool.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 700, fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {initial}
    </span>
  );
}

// ── Tool card ────────────────────────────────────────────────────────────────

const ToolCard: React.FC<{ tool: Tool; navigate: (to: string) => void }> = ({ tool, navigate }) => (
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
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ToolLogo tool={tool} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>
          {tool.name}
        </span>
        {tool.userBadge && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, marginLeft: 8,
            background: 'rgba(13,148,136,.1)', color: C.a1, border: '1px solid rgba(13,148,136,.25)',
          }}>
            {tool.userBadge}
          </span>
        )}
        <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{tool.tagline}</div>
      </div>
    </div>

    {/* Description */}
    <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0 }}>
      {tool.description}
    </p>

    {/* Features */}
    {tool.features && tool.features.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {tool.features.slice(0, 4).map(f => (
          <span key={f} style={{
            fontSize: 11, padding: '3px 9px', borderRadius: 100,
            background: C.barBg, border: `1px solid ${C.barBrd}`, color: C.mut,
          }}>
            {f}
          </span>
        ))}
      </div>
    )}

    {/* Best for + pricing */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      {tool.bestFor && (
        <div style={{ fontSize: 12, color: C.mut }}>
          <span style={{ color: C.txt, fontWeight: 600 }}>Best for:</span> {tool.bestFor}
        </div>
      )}
      {tool.pricing && (
        <div style={{ fontSize: 11, color: C.mut }}>
          From <strong style={{ color: C.txt }}>{tool.pricing}</strong>
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
        <ExternalLink size={12} /> Try It
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
        Full Review <ArrowRight size={12} />
      </button>
    </div>
  </div>
);

// ── JSON-LD schemas ──────────────────────────────────────────────────────────

function BreadcrumbSchema({ meta }: { meta: CategoryMeta }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
      { '@type': 'ListItem', position: 2, name: meta.title, item: `${SITE_CONFIG.siteUrl}/${meta.slug}` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function FAQSchema({ faqs }: { faqs: { q: string; a: string }[] }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function ItemListSchema({ tools, meta }: { tools: Tool[]; meta: CategoryMeta }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: meta.title,
    description: meta.metaDescription,
    numberOfItems: tools.length,
    itemListElement: tools.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      url: `${SITE_CONFIG.siteUrl}/tools/${t.slug}/`,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  category: string;
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function CategoryPage({ category, navigate, isDark, toggleTheme }: Props) {
  const meta = CATEGORY_META[category];

  // Fallback if category not found
  if (!meta) {
    return (
      <div style={{ background: C.bg, minHeight: '100vh', color: C.txt, padding: 48, textAlign: 'center' }}>
        <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />
        <h1 style={{ fontFamily: "'Inter',sans-serif", marginTop: 80 }}>Category not found</h1>
        <button onClick={() => navigate('/')} style={{ marginTop: 16, color: C.a1, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  const filteredTools = TOOLS.filter(t => t.category === category);
  const relatedPosts = BLOG_POSTS
    .filter(p => p.category === category)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished))
    .slice(0, 9);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt }}>
      <BreadcrumbSchema meta={meta} />
      <FAQSchema faqs={categoryFaqPlain(meta.slug)} />
      <ItemListSchema tools={filteredTools} meta={meta} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '16px 24px 0' }}>
        <nav style={{ fontSize: 12, color: C.mut }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 12, padding: 0 }}
          >
            Home
          </button>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: C.txt, fontWeight: 600 }}>{meta.title}</span>
        </nav>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.dark,
        padding: '56px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        marginTop: 12,
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${meta.color}33 0%, transparent 70%)`,
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
            color: meta.color, fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <Zap size={11} /> {filteredTools.length} TOOLS ANALYZED & RANKED
          </div>
          <h1 style={{
            fontFamily: "'Inter',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,5vw,48px)', color: '#fff',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            {meta.h1.replace(/ 2026$/, '')}<br />
            <span style={{ color: 'var(--a2)' }}>2026</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 28px' }}>
            {meta.metaDescription}
          </p>
          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: String(filteredTools.length), label: 'Tools reviewed' },
              { n: String(filteredTools.filter(t => t.pricing?.toLowerCase().includes('free')).length), label: 'With free plans' },
              { n: '2026', label: 'Last updated' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--a2)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Editorial intro: key takeaways, how we research, landscape (T5.4) ─────────
          Same data/category-content.json as the prerendered static HTML. */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 8px' }}>
        <CategoryIntroSections slug={meta.slug} C={C} navigate={navigate} />
      </div>

      {/* ── Tool grid ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{
          fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{meta.emoji}</span> All {filteredTools.length} {meta.title.replace('Best ', '')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filteredTools.map(t => <ToolCard key={t.id} tool={t} navigate={navigate} />)}
        </div>

        {filteredTools.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.mut }}>
            <p style={{ fontSize: 16 }}>No tools found in this category yet.</p>
            <button onClick={() => navigate('/')} style={{ marginTop: 12, color: C.a1, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
              ← Browse all tools
            </button>
          </div>
        )}
      </div>

      {/* ── Closer look, pricing at a glance, common mistakes (T5.4) ───────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 8px' }}>
        <CategoryDetailSections slug={meta.slug} C={C} navigate={navigate} />
      </div>

      {/* ── From the blog (Day 1 fix: hub → cluster internal linking) ─────── */}
      {relatedPosts.length > 0 && (
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 32px' }}>
          <h2 style={{
            fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 6,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <BookOpen size={18} color={meta.color} /> From the blog
          </h2>
          <p style={{ fontSize: 13, color: C.mut, margin: '0 0 16px', lineHeight: 1.65 }}>
            In-depth guides covering {meta.title.replace('Best AI ', '').replace(' 2026', '').toLowerCase()} — tested and written by Navneet Arya.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {relatedPosts.map((p, i) => (
              <div key={i}
                onClick={() => navigate(`/blog/${p.slug}/`)}
                style={{
                  padding: '16px 18px', background: C.surf, borderRadius: 12,
                  border: `1px solid ${C.barBrd}`, cursor: 'pointer',
                }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginBottom: 6, lineHeight: 1.4 }}>{p.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: C.mut }}>{p.readTime} · {p.datePublished}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: meta.color, whiteSpace: 'nowrap' as const }}>Read post →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ (T5.4): same questions as the FAQPage JSON-LD and the static HTML ── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <CategoryFaq slug={meta.slug} C={C} navigate={navigate} />
      </div>

      {/* ── Newsletter CTA ───────────────────────────────────────────────── */}
      <div style={{ background: C.dark, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Get notified when I review new {meta.title.replace('Best AI ', '').replace(' 2026', '').toLowerCase()}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 24 }}>
            New AI tools are researched every week. Subscribe to get honest reviews and comparison guides delivered to your inbox.
          </p>
          <Suspense fallback={<div style={{ minHeight: 220 }} />}>
            <BeehiivForm variant="hero" />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
