import React, { useState, useMemo } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, ArrowRight, Mail, Star, ExternalLink } from 'lucide-react';

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

const CAT_ACCENT: Record<string, 'a1' | 'a2'> = {
  Writing: 'a1', Image: 'a2', Video: 'a1', Audio: 'a2',
  Marketing: 'a1', Design: 'a2', Coding: 'a1', Productivity: 'a2',
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':   { bg: 'rgba(6,182,212,.1)',  color: '#06B6D4' },
  'Most popular':  { bg: 'rgba(91,33,182,.1)',  color: '#5B21B6' },
  'Best value':    { bg: 'rgba(16,185,129,.1)', color: '#059669' },
  'Free trial ✓':  { bg: 'rgba(6,182,212,.1)',  color: '#06B6D4' },
  'SEO pick':      { bg: 'rgba(91,33,182,.1)',  color: '#5B21B6' },
  'One-time price':{ bg: 'rgba(91,33,182,.1)',  color: '#5B21B6' },
  'Best for beginners': { bg: 'rgba(6,182,212,.1)', color: '#06B6D4' },
};

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.12)'/%3E%3C/svg%3E")`;

// Our 5 affiliate picks — shown in the featured strip
const AFFILIATE_SLUGS = ['rytr', 'podcastle', 'ocoya', 'replit', 'taskade'];

interface HomePageProps { navigate: (to: string) => void; }

export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: 'All' as any });

  const filtered = useMemo(() => TOOLS.filter(t => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const matchCat = filters.category === 'All' || t.category === filters.category;
    return matchSearch && matchCat;
  }), [filters]);

  const affiliatePicks = TOOLS.filter(t => AFFILIATE_SLUGS.includes(t.slug));
  const categories = ['All', 'Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 4, height: 28, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`, borderRadius: 2, marginRight: 12 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, letterSpacing: '-0.02em' }}>
              AI<span style={{ color: C.a1 }}>Nexus</span>
            </span>
            <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.mut2, textTransform: 'uppercase' as const }}>
              by {SITE_CONFIG.authorName}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/about')}
              style={{ fontSize: 13, fontWeight: 500, color: C.mut, padding: '7px 14px', borderRadius: 100, background: 'transparent', border: `1px solid rgba(15,15,26,.12)` }}>
              About
            </button>
            <a href={`mailto:${SITE_CONFIG.email}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: C.a1, padding: '7px 16px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, textDecoration: 'none' }}>
              <Mail size={13} /> Contact
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '72px 28px 64px', borderBottom: `1px solid ${C.barBrd}`, background: C.surf }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_PATTERN, opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', border: `1.5px solid rgba(91,33,182,.06)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 450, height: 450, borderRadius: '50%', border: `1px solid rgba(6,182,212,.05)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,33,182,.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(38px, 6vw, 56px)', lineHeight: 1.1, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.03em' }}>
            The best AI tools,{' '}
            <span style={{ color: C.a1 }}>honest reviews.</span>
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, color: C.mut, margin: '0 0 8px', fontWeight: 300 }}>
            I'm <strong style={{ color: C.txt, fontWeight: 600 }}>{SITE_CONFIG.authorName}</strong> — I personally test every tool on this list.
            Every card links to a <strong style={{ color: C.txt, fontWeight: 600 }}>free trial</strong>.
          </p>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 36px', fontWeight: 300 }}>
            Affiliate links — I earn a small commission if you upgrade, at no cost to you.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); }} style={{ color: C.a1 }}>Full disclosure</a>
          </p>

          <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto' }}>
            <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.mut2, pointerEvents: 'none' as const }} />
            <input
              type="text"
              placeholder="Search tools — writing, podcast, social media..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', paddingLeft: 44, paddingRight: 16, height: 48, border: `1.5px solid ${C.a1brd}`, borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'DM Sans', sans-serif", background: C.surf, color: C.txt }}
              onFocus={e => (e.target.style.borderColor = C.a1)}
              onBlur={e => (e.target.style.borderColor = C.a1brd)}
            />
          </div>
        </div>
      </div>

      {/* ── Affiliate Picks Strip ── */}
      {filters.search === '' && filters.category === 'All' && (
        <div style={{ borderBottom: `1px solid ${C.barBrd}`, padding: '28px 28px', background: C.surf }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Star size={14} color={C.a1} fill={C.a1} />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: C.txt, letterSpacing: '-0.01em' }}>
                My top affiliate picks — tools I personally use and earn commission from
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
              {affiliatePicks.map(tool => {
                const isA2 = CAT_ACCENT[tool.category] === 'a2';
                const accent = isA2 ? C.a2 : C.a1;
                const bg = isA2 ? C.a2card : C.a1card;
                const brd = isA2 ? C.a2brd : C.a1brd;
                return (
                  <button key={tool.id} onClick={() => navigate(`/tools/${tool.slug}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${brd}`, background: bg, cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {tool.name[0]}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: C.txt }}>{tool.name}</div>
                      <div style={{ fontSize: 11, color: accent, fontWeight: 500 }}>{tool.pricing}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Category + Grid ── */}
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 28px 96px' }}>

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
                style={{ padding: '7px 18px', borderRadius: 100, fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", border: `1.5px solid ${active ? activeBrd : 'rgba(15,15,26,.12)'}`, background: active ? activeBg : 'transparent', color: active ? activeColor : C.mut }}>
                {cat}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 12, color: C.mut2, marginBottom: 24, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{filters.category !== 'All' ? ` · ${filters.category}` : ''}{filters.search ? ` matching "${filters.search}"` : ''}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
          {filtered.map(tool => <ToolCard key={tool.id} tool={tool} navigate={navigate} isAffiliatePick={AFFILIATE_SLUGS.includes(tool.slug)} />)}
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

      {/* ── Footer ── */}
      <footer style={{ background: C.barBg, borderTop: `1px solid ${C.barBrd}`, padding: '40px 28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 4, height: 24, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`, borderRadius: 2 }} />
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.txt }}>AI<span style={{ color: C.a1 }}>Nexus</span></span>
          <span style={{ fontSize: 12, color: C.mut2 }}>by {SITE_CONFIG.authorName}</span>
        </div>
        <p style={{ color: C.mut2, fontSize: 13, margin: '0 0 8px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          Affiliate links help keep reviews free and honest.
        </p>
        <a href={`mailto:${SITE_CONFIG.email}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.a1, fontSize: 13, fontWeight: 500, border: `1.5px solid ${C.a1brd}`, padding: '8px 16px', borderRadius: 100, background: C.a1card, textDecoration: 'none', marginBottom: 16 }}>
          <Mail size={13} /> {SITE_CONFIG.email}
        </a>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 6 }}>
          <button onClick={() => navigate('/about')} style={{ fontSize: 12, color: C.mut2, fontFamily: "'DM Sans', sans-serif" }}>About</button>
          <button onClick={() => navigate('/disclosure')} style={{ fontSize: 12, color: C.mut2, fontFamily: "'DM Sans', sans-serif" }}>Affiliate Disclosure</button>
        </div>
        <p style={{ color: C.mut2, fontSize: 11, marginTop: 12 }}>© {new Date().getFullYear()} AI Nexus · Honest reviews, no gatekeeping.</p>
      </footer>
    </div>
  );
}

// ── Tool Card ──────────────────────────────────────────────────────────────
function ToolCard({ tool, navigate, isAffiliatePick }: { tool: Tool; navigate: (to: string) => void; isAffiliatePick: boolean }) {
  const [hovered, setHovered] = useState(false);
  const isA2 = CAT_ACCENT[tool.category] === 'a2';
  const cardBg  = isA2 ? C.a2card  : C.a1card;
  const cardBrd = isA2 ? C.a2brd   : C.a1brd;
  const accent  = isA2 ? C.a2       : C.a1;
  const badge   = tool.userBadge ? BADGE_COLORS[tool.userBadge] : null;

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surf, borderRadius: 18, border: `1.5px solid ${hovered ? cardBrd : 'rgba(15,15,26,.08)'}`,
        padding: '22px 24px', cursor: 'pointer',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.18s', position: 'relative' as const, overflow: 'hidden',
        boxShadow: hovered ? `0 8px 32px rgba(91,33,182,.08)` : 'none',
      }}>
      {/* Affiliate pick indicator */}
      {isAffiliatePick && (
        <div style={{ position: 'absolute', top: 0, right: 0, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '4px 10px', borderBottomLeftRadius: 10 }}>
          AFFILIATE PICK
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: `${accent}18`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: accent }}>
            {tool.name[0]}
          </div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.txt, letterSpacing: '-0.01em' }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: C.mut2, marginTop: 2 }}>{tool.pricing}</div>
          </div>
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 600, color: badge.color, background: badge.bg, padding: '3px 9px', borderRadius: 8, whiteSpace: 'nowrap' as const }}>
            {tool.userBadge}
          </span>
        )}
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.55, margin: '0 0 14px', fontWeight: 300 }}>
        {tool.tagline}
      </p>

      {/* Top features */}
      {tool.features && (
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 16 }}>
          {tool.features.slice(0, 3).map((f, i) => (
            <span key={i} style={{ fontSize: 11, color: accent, background: `${accent}10`, padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>
              {f}
            </span>
          ))}
        </div>
      )}

      {/* CTA row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid rgba(15,15,26,.07)`, paddingTop: 14 }}>
        <span style={{ fontSize: 12, color: C.mut2 }}>Best for: {tool.bestFor}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: accent }}>
          Read review <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
