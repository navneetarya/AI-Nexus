import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, Instagram, ArrowUpRight, Zap } from 'lucide-react';

const T = {
  bg: '#0a0a0f', surface: '#111118', border: '#1e1e2a', borderHover: '#2e2e42',
  muted: '#3a3a50', subtle: '#6b6b8a', text: '#f0eff6', textDim: '#9090b0',
  accent: '#00e5a0', accentDim: '#00c888', accentBg: 'rgba(0,229,160,0.08)',
};

const CAT_COLOR: Record<string, string> = {
  Writing: '#60a5fa', Image: '#f472b6', Video: '#34d399', Audio: '#fbbf24',
  Marketing: '#f87171', Design: '#a78bfa', Coding: '#38bdf8', Productivity: '#fb923c',
};

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':        { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  'Most popular':       { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa' },
  'Best for beginners': { bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa' },
  'Free trial ✓':       { bg: 'rgba(52,211,153,0.12)',  color: '#34d399' },
  'SEO pick':           { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24' },
  'One-time price':     { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
};

interface HomePageProps { navigate: (to: string) => void; }

export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: 'All' as any });

  const filtered = useMemo(() => TOOLS.filter(t => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchCat = filters.category === 'All' || t.category === filters.category;
    return matchSearch && matchCat;
  }), [filters]);

  const categories = ['All', 'Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}`, padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color={T.bg} strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '-0.01em' }}>
              AI<span style={{ color: T.accent }}>Nexus</span>
            </span>
          </div>
          <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: T.textDim, padding: '7px 14px', border: `1px solid ${T.border}`, borderRadius: 100 }}>
            <Instagram size={13} /> Follow
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '88px 32px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(0,229,160,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${T.border}`, borderRadius: 100, padding: '5px 14px', marginBottom: 32, fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: '0.06em', textTransform: 'uppercase' as const, background: T.accentBg }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
            AI tools reviewed &amp; tested
          </div>

          <h1 style={{ margin: '0 0 24px' }}>
            <span style={{ display: 'block', fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' as const, fontSize: 'clamp(48px, 7vw, 72px)', color: T.text, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              The best AI tools,
            </span>
            <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(48px, 7vw, 72px)', color: T.accent, lineHeight: 1.05, letterSpacing: '-0.04em' }}>
              honest reviews.
            </span>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: T.textDim, margin: '0 0 10px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            I personally test every tool. Every card links directly to a <strong style={{ color: T.text, fontWeight: 600 }}>free trial</strong> — no gatekeeping.
          </p>
          <p style={{ fontSize: 13, color: T.muted, margin: '0 0 40px' }}>
            Affiliate links — I earn a small commission if you upgrade, at no cost to you.
          </p>

          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' as const }} />
            <input type="text" placeholder="Search tools — writing, video, audio..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', paddingLeft: 48, paddingRight: 20, height: 50, border: `1.5px solid ${T.border}`, borderRadius: 14, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif", background: T.surface, color: T.text }}
              onFocus={e => (e.target.style.borderColor = T.accent)}
              onBlur={e => (e.target.style.borderColor = T.border)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 100px' }}>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 40, paddingBottom: 32, borderBottom: `1px solid ${T.border}` }}>
          {categories.map(cat => {
            const active = filters.category === cat;
            const cc = CAT_COLOR[cat] || T.accent;
            return (
              <button key={cat}
                onClick={() => setFilters(f => ({ ...f, category: cat as any }))}
                style={{ padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, border: `1px solid ${active ? cc : T.border}`, background: active ? cc + '18' : 'transparent', color: active ? cc : T.textDim, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}
              >{cat}</button>
            );
          })}
        </div>

        <p style={{ fontSize: 13, color: T.subtle, marginBottom: 28, fontWeight: 500 }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{filters.category !== 'All' ? ` in ${filters.category}` : ''}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 2 }}>
          {filtered.map((tool, i) => <ToolCard key={tool.id} tool={tool} navigate={navigate} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 17, color: T.textDim, marginBottom: 16 }}>No results for "{filters.search}"</p>
            <button onClick={() => setFilters({ search: '', category: 'All' as any })}
              style={{ color: T.accent, background: 'none', border: `1px solid ${T.border}`, borderRadius: 100, padding: '8px 20px', fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
              Clear filter
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '48px 32px', textAlign: 'center', background: T.surface }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color={T.bg} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>AI<span style={{ color: T.accent }}>Nexus</span></span>
        </div>
        <p style={{ color: T.subtle, fontSize: 13, margin: '0 0 20px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          I test every AI tool personally. Affiliate links help keep the reviews free.
        </p>
        <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: T.textDim, fontSize: 13, fontWeight: 500, border: `1px solid ${T.border}`, padding: '8px 18px', borderRadius: 100 }}>
          <Instagram size={13} /> @ainexustools
        </a>
        <p style={{ color: T.muted, fontSize: 12, marginTop: 24 }}>© {new Date().getFullYear()} AI Nexus</p>
      </footer>
    </div>
  );
}

function ToolCard({ tool, navigate }: { tool: Tool; navigate: (to: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const cc = CAT_COLOR[tool.category] || T.accent;
  const badge = tool.userBadge ? (BADGE_STYLE[tool.userBadge] || { bg: T.accentBg, color: T.accent }) : null;

  return (
    <div onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? T.surface : 'transparent', border: `1px solid ${hovered ? T.borderHover : T.border}`, borderRadius: 16, padding: '24px 26px 20px', cursor: 'pointer', transition: 'all 0.18s', transform: hovered ? 'translateY(-2px)' : 'none', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: cc, opacity: hovered ? 1 : 0, transition: 'opacity 0.18s', borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: cc, background: cc + '15', padding: '3px 10px', borderRadius: 100 }}>{tool.category}</span>
        <div style={{ color: hovered ? cc : T.subtle, transition: 'color 0.15s' }}><ArrowUpRight size={16} /></div>
      </div>

      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 5px', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{tool.name}</h3>

      <p style={{ fontSize: 13, fontWeight: 500, color: cc, margin: '0 0 10px', lineHeight: 1.4 }}>{tool.tagline}</p>

      <p style={{ fontSize: 13, color: T.textDim, margin: '0 0 20px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tool.description}</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
        {tool.pricing && <span style={{ fontSize: 13, fontWeight: 600, color: T.textDim }}>{tool.pricing}</span>}
        {badge && tool.userBadge && <span style={{ fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 100 }}>{tool.userBadge}</span>}
      </div>
    </div>
  );
}
