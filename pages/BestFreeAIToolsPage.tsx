// pages/BestFreeAIToolsPage.tsx
// Week 5 Task 1 — /best-free-ai-tools
// Target keyword: "best free AI tools" — 22,000/mo, Medium difficulty
// Dedicated landing page filtering tools with free plans from constants.ts

import React from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, Tool } from '../types';
import { ExternalLink, CheckCircle, Star, ArrowRight, Zap } from 'lucide-react';
import { SharedNav } from './SharedNav';

const C = {
  bg:   'var(--bg)',
  surf: 'var(--surf)',
  a1:   'var(--a1)',
  a2:   'var(--a2)',
  txt:  'var(--txt)',
  mut:  'var(--mut)',
  dark: 'var(--dark)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
};

// Tools that have a genuine free plan (not just free trial)
const FREE_PLAN_SLUGS = new Set([
  'grammarly','writesonic','rytr','quillbot',
  'leonardo-ai','photoroom',
  'opus-clip','invideo',
  'murf-ai','podcastle',
  'gamma',
  'replit',
  'taskade',
]);

// What each tool gives you for free
const FREE_DETAILS: Record<string, { gets: string; limit: string }> = {
  'grammarly':    { gets: 'Grammar, spelling & tone checks', limit: 'Unlimited — browser + apps' },
  'writesonic':   { gets: 'AI blog posts, ads & chatbot', limit: '25 credits/month' },
  'rytr':         { gets: '40+ writing templates', limit: '10,000 characters/month' },
  'quillbot':     { gets: 'Paraphrasing & summarisation', limit: '125 words per paraphrase' },
  'leonardo-ai':  { gets: 'AI image generation', limit: '150 credits/day (~1,500 images)' },
  'photoroom':    { gets: 'AI background removal', limit: '3 exports/day, watermark' },
  'opus-clip':    { gets: 'Short clip generation from long video', limit: '60 minutes/month' },
  'invideo':      { gets: 'AI video from text prompt', limit: '10 exports/week, watermark' },
  'murf-ai':      { gets: 'AI voiceover in 120+ voices', limit: '10 minutes/month' },
  'podcastle':    { gets: 'Podcast recording + AI cleanup', limit: '3 hours recording/month' },
  'gamma':        { gets: 'AI presentations & docs', limit: '400 AI credits, unlimited views' },
  'replit':       { gets: 'Online coding + AI autocomplete', limit: '3 public Repls' },
  'taskade':      { gets: 'AI tasks, projects & agents', limit: '1 workspace, 5 projects' },
};

// Category display config
const CAT_META: Partial<Record<Category, { label: string; emoji: string; color: string }>> = {
  [Category.WRITING]:     { label: 'Writing',     emoji: '✍️',  color: '#a855f7' },
  [Category.IMAGE]:       { label: 'Image',       emoji: '🎨',  color: '#3b82f6' },
  [Category.VIDEO]:       { label: 'Video',       emoji: '🎬',  color: '#ef4444' },
  [Category.AUDIO]:       { label: 'Audio',       emoji: '🎙️', color: '#f97316' },
  [Category.DESIGN]:      { label: 'Design',      emoji: '💎',  color: '#14b8a6' },
  [Category.CODING]:      { label: 'Coding',      emoji: '💻',  color: '#22c55e' },
  [Category.PRODUCTIVITY]:{ label: 'Productivity',emoji: '⚡',  color: '#f59e0b' },
};

// Schema data for structured SEO
function BreadcrumbSchema() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Best Free AI Tools', item: `${SITE_CONFIG.siteUrl}/best-free-ai-tools` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

function FAQSchema() {
  const faqs = [
    { q: 'Are there any truly free AI tools?', a: 'Yes — 13 of the tools we have tested offer a permanent free plan (not just a trial). The best completely free AI tools are Grammarly (unlimited grammar checks), Leonardo.ai (150 image credits per day), and Rytr (10,000 characters per month for writing). All three are free forever with no credit card required.' },
    { q: 'What is the best free AI writing tool?', a: 'Grammarly is the best free AI writing tool for editing and improving existing text. Rytr is the best free tool for generating new content, with 10,000 characters per month on its free plan and over 40 writing templates. Quillbot is the best free paraphrasing and summarisation tool.' },
    { q: 'What is the best free AI image generator?', a: 'Leonardo.ai is the best free AI image generator, offering 150 credits per day on its free plan — roughly 1,500 AI images per month. It requires no credit card and runs entirely in the browser. Photoroom is the best free AI tool for product photo editing and background removal.' },
    { q: 'Which free AI tools have no watermark?', a: 'Tools with no watermark on their free plan include Grammarly, Rytr, Quillbot, Leonardo.ai (downloaded images), Gamma (shareable links), Replit (shared projects), and Taskade. Murf AI, InVideo and PhotoRoom do add watermarks on the free tier.' },
    { q: 'Can I use free AI tools for commercial projects?', a: 'It depends on the tool. Grammarly, Rytr, and Quillbot allow commercial use on their free plans. Leonardo.ai free outputs can be used commercially. Always check the terms of service for each tool before using free-tier outputs in paid client work or products.' },
  ];
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

// Tool logo with local-first → Clearbit fallback → letter avatar
const TOOL_DOMAIN: Record<string, string> = {
  'grammarly':'grammarly.com','writesonic':'writesonic.com','rytr':'rytr.me',
  'quillbot':'quillbot.com','leonardo-ai':'leonardo.ai','photoroom':'photoroom.com',
  'opus-clip':'opus.pro','invideo':'invideo.ai','murf-ai':'murf.ai',
  'podcastle':'podcastle.ai','gamma':'gamma.app','replit':'replit.com','taskade':'taskade.com',
};

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
    <span style={{ width: size, height: size, borderRadius: r, background: color ?? C.a1, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 700, fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
      {initial}
    </span>
  );
}

function ToolCard({ tool, navigate }: { tool: Tool; navigate: (to: string) => void }) {
  const detail = FREE_DETAILS[tool.slug];
  const catMeta = CAT_META[tool.category];
  const paidPrice = tool.pricing?.replace(/^Free \+ /i, '') ?? '';

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
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>
              {tool.name}
            </span>
            {catMeta && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                background: `${catMeta.color}18`, color: catMeta.color,
                border: `1px solid ${catMeta.color}30`,
              }}>
                {catMeta.emoji} {catMeta.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{tool.tagline}</div>
        </div>
      </div>

      {/* What you get free */}
      {detail && (
        <div style={{
          background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)',
          borderRadius: 10, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>
            What you get free
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
            <CheckCircle size={13} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{detail.gets}</div>
              <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{detail.limit}</div>
            </div>
          </div>
        </div>
      )}

      {/* Best for + paid price */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 12, color: C.mut }}>
          <span style={{ color: C.txt, fontWeight: 600 }}>Best for:</span> {tool.bestFor}
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
          <ExternalLink size={12} /> Try Free
        </a>
        <button
          onClick={() => navigate(`/tools/${tool.slug}`)}
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
}

interface Props {
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export function BestFreeAIToolsPage({ navigate, isDark, toggleTheme }: Props) {
  const [activeCategory, setActiveCategory] = React.useState<Category | 'All'>('All');

  // Filter tools that have free plans
  const freeTools = TOOLS.filter(t => FREE_PLAN_SLUGS.has(t.slug));

  // Group by category for the "All" view
  const categories = Object.keys(CAT_META) as Category[];

  const displayTools = activeCategory === 'All'
    ? freeTools
    : freeTools.filter(t => t.category === activeCategory);

  const groupedByCategory: Record<string, Tool[]> = {};
  if (activeCategory === 'All') {
    for (const cat of categories) {
      const group = freeTools.filter(t => t.category === cat);
      if (group.length > 0) groupedByCategory[cat] = group;
    }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt }}>
      <BreadcrumbSchema />
      <FAQSchema />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.dark,
        padding: '56px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(13,148,136,.22) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)',
            color: '#34d399', fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <Zap size={11} /> 13 TOOLS — PERMANENTLY FREE
          </div>
          <h1 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            fontSize: 'clamp(28px,5vw,48px)', color: '#fff',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            Best Free AI Tools 2026<br />
            <span style={{ color: 'var(--a2)' }}>Tested & Ranked</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 560, margin: '0 auto 28px' }}>
            Every tool below has a permanent free plan — not a trial, not a demo. I've personally tested each one to confirm what you actually get for free and where the limits are.
          </p>
          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '13', label: 'Free-plan tools' },
              { n: '7',  label: 'Categories covered' },
              { n: '0',  label: 'Credit cards needed' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--a2)' }}>{n}</div>
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
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 12 }}>
            How I chose these tools
          </h2>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: 10 }}>
            I tested over 40 AI tools across 2024–2026 and narrowed this list to the 13 that meet three strict criteria: (1) the free plan works without a credit card, (2) the free limit is generous enough to do real work — not just a demo, and (3) the tool is genuinely useful for solo creators, freelancers, or students.
          </p>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>
            I've excluded tools with free trials only (Pictory, Beautiful.ai), tools where "free" is just a locked dashboard (Ocoya, Frase), and tools that require a paid plan for any useful output. Every tool below is free to use today.
          </p>
        </div>
      </div>

      {/* ── Category filter tabs ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '28px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['All', ...categories.filter(c => groupedByCategory[c] || freeTools.some(t => t.category === c))] as (Category | 'All')[]).map(cat => {
            const isActive = cat === activeCategory;
            const meta = cat === 'All' ? null : CAT_META[cat as Category];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: `1px solid ${isActive ? C.a1 : C.barBrd}`,
                  background: isActive ? C.a1 : C.barBg,
                  color: isActive ? '#fff' : C.txt,
                  transition: 'all .15s',
                }}
              >
                {meta ? `${meta.emoji} ${meta.label}` : '⚡ All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tool grid ────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 24px 32px' }}>
        {activeCategory === 'All' ? (
          // Show by category sections
          categories.filter(c => freeTools.some(t => t.category === c)).map(cat => {
            const tools = freeTools.filter(t => t.category === cat);
            const meta = CAT_META[cat]!;
            return (
              <div key={cat} style={{ marginBottom: 40 }}>
                <h2 style={{
                  fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700,
                  color: C.txt, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>{meta.emoji}</span>
                  <span style={{ color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.mut }}>
                    — {tools.length} free tool{tools.length !== 1 ? 's' : ''}
                  </span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {tools.map(t => <ToolCard key={t.id} tool={t} navigate={navigate} />)}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {displayTools.map(t => <ToolCard key={t.id} tool={t} navigate={navigate} />)}
          </div>
        )}
      </div>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Quick Comparison: Free Plan Limits
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.barBrd}` }}>
            <thead>
              <tr>
                {['Tool', 'Category', 'Free Limit', 'Credit Card?', 'Watermark?'].map((h, i) => (
                  <th key={h} style={{
                    background: C.dark, color: 'rgba(255,255,255,.7)',
                    fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
                    padding: '11px 14px', textAlign: 'left', fontFamily: "'Syne',sans-serif",
                    borderRadius: i === 0 ? '14px 0 0 0' : i === 4 ? '0 14px 0 0' : undefined,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {freeTools.map((t, idx) => {
                const detail = FREE_DETAILS[t.slug];
                return (
                  <tr key={t.id} style={{ background: idx % 2 === 0 ? C.surf : C.bg }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: C.txt, borderTop: `1px solid ${C.barBrd}` }}>
                      <button onClick={() => navigate(`/tools/${t.slug}`)}
                        style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}>
                        {t.name}
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: C.mut, borderTop: `1px solid ${C.barBrd}` }}>{t.category}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: C.txt, borderTop: `1px solid ${C.barBrd}` }}>{detail?.limit ?? '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderTop: `1px solid ${C.barBrd}`, color: '#10b981', fontWeight: 700 }}>No</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, borderTop: `1px solid ${C.barBrd}` }}>
                      <span style={{ color: ['invideo','photoroom','murf-ai'].includes(t.slug) ? '#f97316' : '#10b981', fontWeight: 700 }}>
                        {['invideo','photoroom','murf-ai'].includes(t.slug) ? 'Yes' : 'No'}
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
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        {[
          {
            q: 'Are there any truly free AI tools (forever, no credit card)?',
            a: 'Yes — 13 tools on this list are permanently free. The best no-credit-card options are Grammarly (unlimited grammar checks), Leonardo.ai (150 image credits/day), and Rytr (10,000 characters/month for writing). None require a payment method to start.',
          },
          {
            q: 'What is the best free AI writing tool?',
            a: 'Grammarly is the best free AI tool for editing. Rytr is the best for generating new content, with 40+ templates and 10,000 free characters per month. Quillbot is the top free paraphrasing tool. All three are complementary rather than competing — many writers use all three.',
          },
          {
            q: 'What is the best free AI image generator?',
            a: 'Leonardo.ai gives 150 credits per day on its free plan — roughly 1,500 images per month — with no credit card required. It has a browser-based interface and full creative control. Photoroom is the best free tool for product photo background removal, though it adds a watermark.',
          },
          {
            q: 'Which free AI tools work without a watermark?',
            a: 'Grammarly, Rytr, Quillbot, Leonardo.ai (downloaded images), Gamma (shared links), Replit, and Taskade all have no watermark on their free tier. InVideo, PhotoRoom, and Murf AI do add watermarks on the free plan. Upgrade only if watermarks are a dealbreaker for your use case.',
          },
          {
            q: 'Can I use free AI tools for commercial work?',
            a: 'Most allow commercial use — Grammarly, Rytr, Quillbot, and Leonardo.ai free outputs can be used commercially. Always verify in each tool\'s terms of service, especially for AI-generated images, before using free-tier outputs in paid client projects.',
          },
        ].map(({ q, a }, i) => (
          <div key={i} style={{
            borderBottom: `1px solid ${C.barBrd}`, padding: '18px 0',
          }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 8 }}>
              {q}
            </h3>
            <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      {/* ── Footer CTA ───────────────────────────────────────────────────── */}
      <div style={{ background: C.dark, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
            Want full tool reviews?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 24 }}>
            Every tool on this page has a detailed review with real output examples, pros & cons, and my honest verdict.
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
