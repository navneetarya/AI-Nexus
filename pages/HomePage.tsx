import React, { useState, useMemo } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, Instagram, ArrowRight } from 'lucide-react';

// ── Exact carousel color palette ──────────────────────────
const C = {
  bg:      '#F5F4FF',
  surf:    '#FFFFFF',
  a1:      '#5B21B6',
  a2:      '#06B6D4',
  txt:     '#0F0F1A',
  mut:     'rgba(15,15,26,.66)',
  mut2:    'rgba(15,15,26,.38)',
  a1card:  'rgba(91,33,182,.065)',
  a1brd:   'rgba(91,33,182,.18)',
  a2card:  'rgba(6,182,212,.065)',
  a2brd:   'rgba(6,182,212,.18)',
  barBg:   'rgba(245,244,255,.97)',
  barBrd:  'rgba(91,33,182,.13)',
};

// Category → colour pair (a1 or a2 tint)
const CAT_ACCENT: Record<string, 'a1' | 'a2'> = {
  Writing: 'a1', Image: 'a2', Video: 'a1', Audio: 'a2',
  Marketing: 'a1', Design: 'a2', Coding: 'a1', Productivity: 'a2',
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':        { bg: 'rgba(6,182,212,.1)',   color: '#06B6D4' },
  'Most popular':       { bg: 'rgba(91,33,182,.1)',   color: '#5B21B6' },
  'Best for beginners': { bg: 'rgba(6,182,212,.1)',   color: '#06B6D4' },
  'Free trial ✓':       { bg: 'rgba(6,182,212,.1)',   color: '#06B6D4' },
  'SEO pick':           { bg: 'rgba(91,33,182,.1)',   color: '#5B21B6' },
  'One-time price':     { bg: 'rgba(91,33,182,.1)',   color: '#5B21B6' },
};

// Dot-grid SVG background — exact from carousel
const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.12)'/%3E%3C/svg%3E")`;

interface HomePageProps { navigate: (to: string) => void; }

export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: 'All' as any });

  const filtered = useMemo(() => TOOLS.filter(t => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchCat = filters.category === 'All' || t.category === filters.category;
    return matchSearch && matchCat;
  }), [filters]);

  const categories = ['All', 'Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      {/* ── Nav — carousel bar style ────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.barBg,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.barBrd}`,
        padding: '0 28px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo — left purple stripe + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 4, height: 28, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`, borderRadius: 2, marginRight: 12 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, letterSpacing: '-0.02em' }}>
              AI<span style={{ color: C.a1 }}>Nexus</span>
            </span>
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.mut2, textTransform: 'uppercase' as const }}>
              @ai.nexus.in
            </span>
          </div>
          <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 500, color: C.a1, padding: '7px 16px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, transition: 'all 0.15s' }}>
            <Instagram size={13} /> Follow on Instagram
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 28px 64px', borderBottom: `1px solid ${C.barBrd}`, background: C.surf }}>
        {/* Dot pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_PATTERN, opacity: 0.6, pointerEvents: 'none' }} />
        {/* Concentric circles — exact from carousel slide 1 */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', border: `1.5px solid rgba(91,33,182,.06)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 450, height: 450, borderRadius: '50%', border: `1px solid rgba(6,182,212,.05)`, pointerEvents: 'none' }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,33,182,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Badge pill — carousel style */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${C.a1}, ${C.a2})`, borderRadius: 100, padding: '7px 20px', marginBottom: 28 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.04em' }}>
              AI tools reviewed &amp; tested
            </span>
          </div>

          {/* Headline — Space Grotesk, carousel style */}
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(38px, 6vw, 56px)', lineHeight: 1.1, color: C.txt, margin: '0 0 24px', letterSpacing: '-0.03em' }}>
            The best AI tools,{' '}
            <span style={{ color: C.a1 }}>honest reviews.</span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: C.mut, margin: '0 0 8px', fontWeight: 300 }}>
            I personally test every tool on this list. Every card links to a <strong style={{ color: C.txt, fontWeight: 600 }}>free trial</strong>.
          </p>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 36px', fontWeight: 300, letterSpacing: '0.02em' }}>
            Affiliate links — I earn a small commission if you upgrade, at no cost to you.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto' }}>
            <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.mut2, pointerEvents: 'none' as const }} />
            <input
              type="text"
              placeholder="Search tools — writing, video, audio..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', paddingLeft: 44, paddingRight: 16, height: 48, border: `1.5px solid ${C.a1brd}`, borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif", background: C.surf, color: C.txt, transition: 'border-color 0.15s' }}
              onFocus={e => (e.target.style.borderColor = C.a1)}
              onBlur={e => (e.target.style.borderColor = C.a1brd)}
            />
          </div>
        </div>
      </div>

      {/* ── Category + Grid ──────────────────────────────── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 28px 96px' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 32 }}>
          {categories.map(cat => {
            const active = filters.category === cat;
            const isA2 = CAT_ACCENT[cat] === 'a2';
            const activeColor = isA2 ? C.a2 : C.a1;
            const activeBg = isA2 ? C.a2card : C.a1card;
            const activeBrd = isA2 ? C.a2brd : C.a1brd;
            return (
              <button key={cat}
                onClick={() => setFilters(f => ({ ...f, category: cat as any }))}
                style={{ padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", border: `1.5px solid ${active ? activeBrd : 'rgba(15,15,26,.12)'}`, background: active ? activeBg : 'transparent', color: active ? activeColor : C.mut, transition: 'all 0.15s' }}
              >{cat}</button>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: C.mut2, marginBottom: 24, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{filters.category !== 'All' ? ` · ${filters.category}` : ''}
        </p>

        {/* Tool grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
          {filtered.map(tool => <ToolCard key={tool.id} tool={tool} navigate={navigate} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 16, color: C.mut, marginBottom: 14 }}>No results for "{filters.search}"</p>
            <button onClick={() => setFilters({ search: '', category: 'All' as any })}
              style={{ color: C.a1, border: `1.5px solid ${C.a1brd}`, borderRadius: 100, padding: '8px 20px', fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: C.a1card }}>
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* ── Footer — carousel bar style ──────────────────── */}
      <footer style={{ background: C.barBg, borderTop: `1px solid ${C.barBrd}`, padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 4, height: 24, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`, borderRadius: 2 }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.txt }}>AI<span style={{ color: C.a1 }}>Nexus</span></span>
          <span style={{ fontSize: 12, color: C.mut2, letterSpacing: '0.08em' }}>@ai.nexus.in</span>
        </div>
        <p style={{ color: C.mut2, fontSize: 13, margin: '0 0 16px', maxWidth: 380, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          I test every AI tool personally. Affiliate links help keep the reviews free.
        </p>
        <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.a1, fontSize: 13, fontWeight: 500, border: `1.5px solid ${C.a1brd}`, padding: '8px 16px', borderRadius: 100, background: C.a1card }}>
          <Instagram size={13} /> Follow @ai.nexus.in
        </a>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => navigate('/about')} style={{ fontSize: 12, color: C.mut2, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>About</button>
          <button onClick={() => navigate('/disclosure')} style={{ fontSize: 12, color: C.mut2, fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>Affiliate Disclosure</button>
        </div>
        <p style={{ color: C.mut2, fontSize: 11, marginTop: 12 }}>© {new Date().getFullYear()} AI Nexus</p>
      </footer>
    </div>
  );
}

// ── Tool Card — carousel card DNA ─────────────────────────
function ToolCard({ tool, navigate }: { tool: Tool; navigate: (to: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const isA2 = CAT_ACCENT[tool.category] === 'a2';
  const cardBg  = isA2 ? C.a2card  : C.a1card;
  const cardBrd = isA2 ? C.a2brd   : C.a1brd;
  const accent  = isA2 ? C.a2      : C.a1;
  const badge   = tool.userBadge ? (BADGE_COLORS[tool.userBadge] || { bg: C.a1card, color: C.a1 }) : null;

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? cardBg : C.surf,
        border: `1.5px solid ${hovered ? (isA2 ? C.a2brd : C.a1brd) : 'rgba(15,15,26,.1)'}`,
        borderRadius: 16,
        padding: '22px 22px 18px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 8px 28px rgba(91,33,182,.1)` : '0 1px 4px rgba(15,15,26,.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left accent stripe — exact carousel signature */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`,
        borderRadius: '16px 0 0 16px',
        opacity: hovered ? 1 : 0.4,
        transition: 'opacity 0.18s',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: accent, background: isA2 ? C.a2card : C.a1card, border: `1px solid ${isA2 ? C.a2brd : C.a1brd}`, padding: '3px 10px', borderRadius: 100, fontFamily: "'Space Grotesk', sans-serif" }}>
          {tool.category}
        </span>
        <div style={{ color: hovered ? accent : 'rgba(15,15,26,.2)', transition: 'color 0.15s' }}>
          <ArrowRight size={16} />
        </div>
      </div>

      {/* Tool name */}
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.txt, margin: '0 0 5px', lineHeight: 1.2, letterSpacing: '-0.02em', paddingLeft: 8 }}>
        {tool.name}
      </h3>

      {/* Tagline */}
      <p style={{ fontSize: 13, fontWeight: 500, color: accent, margin: '0 0 10px', lineHeight: 1.4, paddingLeft: 8 }}>
        {tool.tagline}
      </p>

      {/* Description */}
      <p style={{ fontSize: 13, color: C.mut, margin: '0 0 18px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingLeft: 8, fontWeight: 300 }}>
        {tool.description}
      </p>

      {/* Bottom */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingLeft: 8, borderTop: '1px solid rgba(15,15,26,.07)' }}>
        {tool.pricing && (
          <span style={{ fontSize: 13, fontWeight: 600, color: C.mut }}>{tool.pricing}</span>
        )}
        {badge && tool.userBadge && (
          <span style={{ fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 100, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.03em' }}>
            {tool.userBadge}
          </span>
        )}
      </div>
    </div>
  );
}
