import React, { useState, useMemo } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, ExternalLink, Instagram, ArrowRight, Zap } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  [Category.WRITING]:      '#7c3aed',
  [Category.IMAGE]:        '#db2777',
  [Category.VIDEO]:        '#059669',
  [Category.AUDIO]:        '#d97706',
  [Category.MARKETING]:    '#e11d48',
  [Category.DESIGN]:       '#2563eb',
  [Category.CODING]:       '#0891b2',
  [Category.PRODUCTIVITY]: '#6d28d9',
};

const CATEGORY_BG: Record<string, string> = {
  [Category.WRITING]:      '#ede9fe',
  [Category.IMAGE]:        '#fce7f3',
  [Category.VIDEO]:        '#d1fae5',
  [Category.AUDIO]:        '#fef3c7',
  [Category.MARKETING]:    '#ffe4e6',
  [Category.DESIGN]:       '#dbeafe',
  [Category.CODING]:       '#cffafe',
  [Category.PRODUCTIVITY]: '#ede9fe',
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':      { bg: '#d1fae5', color: '#065f46' },
  'Most popular':     { bg: '#ede9fe', color: '#5b21b6' },
  'Best for beginners': { bg: '#dbeafe', color: '#1e40af' },
  'Free trial ✓':     { bg: '#d1fae5', color: '#065f46' },
  'SEO pick':         { bg: '#fef3c7', color: '#92400e' },
  'One-time price':   { bg: '#fce7f3', color: '#9d174d' },
};

interface HomePageProps {
  navigate: (to: string) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: Category.ALL });

  const filtered = useMemo(() => {
    return TOOLS.filter(t => {
      const q = filters.search.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      const matchCat = filters.category === Category.ALL || t.category === filters.category;
      return matchSearch && matchCat;
    });
  }, [filters]);

  const categories = [Category.ALL, ...Object.values(Category).filter(c => c !== Category.ALL)];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ede9fe',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#18182b', letterSpacing: '-0.03em' }}>
              AI Nexus
            </span>
          </div>
          <a
            href={SITE_CONFIG.instagramUrl}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontSize: 14, fontWeight: 600, color: '#7c3aed',
              padding: '8px 16px',
              border: '1.5px solid #ede9fe',
              borderRadius: 100,
              background: '#fdfcff',
              textDecoration: 'none',
              transition: 'all 0.15s',
            }}
          >
            <Instagram size={15} /> Follow on Instagram
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede9fe', padding: '72px 24px 64px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#ede9fe', color: '#6d28d9',
            fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em',
            padding: '5px 14px', borderRadius: 100,
            marginBottom: 28,
            textTransform: 'uppercase',
          }}>
            <Zap size={12} /> AI tools reviewed & tested
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: '40px',
            lineHeight: 1.15,
            color: '#18182b',
            margin: '0 0 20px',
            letterSpacing: '-0.022em',
          }}>
            The best AI tools,{' '}
            <span style={{
              color: '#7c3aed',
            }}>honest reviews.</span>
          </h1>

          <p style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: '#6b7280',
            margin: '0 0 10px',
            fontWeight: 400,
          }}>
            I personally test every tool on this list. Every card links to a <strong style={{ color: '#18182b', fontWeight: 600 }}>free trial</strong> — no credit card required on most.
          </p>

          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 32px' }}>
            Affiliate links — I earn a small commission if you upgrade, at no extra cost to you.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
            <Search size={17} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search tools — writing, video, audio..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{
                width: '100%',
                paddingLeft: 50, paddingRight: 20,
                height: 52,
                border: '1.5px solid #e5e7eb',
                borderRadius: 14,
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: '#fafafa',
                color: '#18182b',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = '#7c3aed')}
              onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '36px 24px 96px' }}>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {categories.map(cat => {
            const active = filters.category === cat;
            const catColor = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilters(f => ({ ...f, category: cat }))}
                style={{
                  padding: '8px 18px',
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: active ? (catColor || '#7c3aed') : '#fff',
                  color: active ? '#fff' : '#374151',
                  boxShadow: active ? `0 2px 10px ${(catColor || '#7c3aed')}30` : '0 0 0 1.5px #e5e7eb',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24, fontWeight: 500 }}>
          Showing {filtered.length} tool{filtered.length !== 1 ? 's' : ''}
          {filters.category !== Category.ALL ? ` in ${filters.category}` : ''}
        </p>

        {/* Tool grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} navigate={navigate} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: 18, marginBottom: 16, color: '#374151', fontWeight: 600 }}>
              No results for "{filters.search}"
            </p>
            <button
              onClick={() => setFilters({ search: '', category: Category.ALL })}
              style={{
                color: '#7c3aed', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 15, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Clear filters →
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #18182b 0%, #2d1b69 100%)',
        padding: '56px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={16} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#fff', letterSpacing: '-0.03em' }}>
            AI Nexus
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '0 0 20px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
          I test every AI tool personally and share honest takes on Instagram. Affiliate links help keep the reviews free.
        </p>
        <a
          href={SITE_CONFIG.instagramUrl}
          target="_blank" rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#fff', fontSize: 14, fontWeight: 600,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '10px 20px', borderRadius: 100,
            textDecoration: 'none',
          }}
        >
          <Instagram size={15} /> Follow @ainexustools
        </a>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, margin: '24px 0 0' }}>
          © {new Date().getFullYear()} AI Nexus. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function ToolCard({ tool, navigate }: { tool: Tool; navigate: (to: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const catColor = CATEGORY_COLORS[tool.category] || '#7c3aed';
  const catBg = CATEGORY_BG[tool.category] || '#ede9fe';
  const badge = tool.userBadge ? (BADGE_COLORS[tool.userBadge] || { bg: '#ede9fe', color: '#5b21b6' }) : null;

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 18,
        border: `1.5px solid ${hovered ? catColor + '35' : '#ede9fe'}`,
        padding: '22px 22px 18px',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 32px ${catColor}15` : '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top row: category label + arrow */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          background: catBg, color: catColor,
          fontSize: 11, fontWeight: 700,
          letterSpacing: '0.06em',
          padding: '3px 10px', borderRadius: 100,
          textTransform: 'uppercase',
        }}>
          {tool.category}
        </span>
        <div style={{ color: hovered ? catColor : '#d1d5db', transition: 'color 0.15s' }}>
          <ArrowRight size={17} />
        </div>
      </div>

      {/* Tool name */}
      <h3 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: 19,
        color: '#18182b',
        margin: '0 0 5px',
        lineHeight: 1.2,
        letterSpacing: '-0.018em',
      }}>
        {tool.name}
      </h3>

      {/* Tagline */}
      <p style={{
        fontSize: 14,
        color: '#7c3aed',
        fontWeight: 600,
        margin: '0 0 10px',
        lineHeight: 1.4,
      }}>
        {tool.tagline}
      </p>

      {/* Description */}
      <p style={{
        fontSize: 14,
        color: '#6b7280',
        margin: '0 0 18px',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {tool.description}
      </p>

      {/* Bottom row: pricing + user badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
        {tool.pricing && (
          <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{tool.pricing}</span>
        )}
        {badge && tool.userBadge && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            background: badge.bg, color: badge.color,
            padding: '3px 10px', borderRadius: 100,
          }}>
            {tool.userBadge}
          </span>
        )}
      </div>
    </div>
  );
}
