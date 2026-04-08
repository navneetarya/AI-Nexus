import React, { useState, useMemo } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, ExternalLink, Instagram, ArrowRight } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  [Category.WRITING]:    '#7c3aed',
  [Category.IMAGE]:      '#db2777',
  [Category.VIDEO]:      '#059669',
  [Category.AUDIO]:      '#d97706',
  [Category.MARKETING]:  '#e11d48',
  [Category.DESIGN]:     '#2563eb',
  [Category.CODING]:     '#0891b2',
  [Category.PRODUCTIVITY]: '#6d28d9',
};

const CATEGORY_BG: Record<string, string> = {
  [Category.WRITING]:    '#ede9fe',
  [Category.IMAGE]:      '#fce7f3',
  [Category.VIDEO]:      '#d1fae5',
  [Category.AUDIO]:      '#fef3c7',
  [Category.MARKETING]:  '#ffe4e6',
  [Category.DESIGN]:     '#dbeafe',
  [Category.CODING]:     '#cffafe',
  [Category.PRODUCTIVITY]: '#ede9fe',
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
    <div style={{ minHeight: '100vh', background: '#f4f3ff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede9fe', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 14, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>N</span>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#1a1a2e' }}>AI Nexus</span>
          </div>
          <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#7c3aed', fontWeight: 500, textDecoration: 'none', padding: '6px 14px', border: '1px solid #ede9fe', borderRadius: 20, background: '#faf9ff' }}>
            <Instagram size={14} /> Follow on Instagram
          </a>
        </div>
      </nav>

      {/* Hero — matches carousel style */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ede9fe', padding: '64px 24px 56px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', padding: '4px 14px', borderRadius: 20, marginBottom: 20, textTransform: 'uppercase' }}>
            50+ tools reviewed
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 1.05, color: '#1a1a2e', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            The best AI tools,<br />
            <span style={{ color: '#7c3aed' }}>honest reviews.</span>
          </h1>
          <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px' }}>
            Every tool below has a free trial. Click any card to read the full review, see pricing, and get your affiliate-free trial link.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search tools (e.g. video, writing, free...)"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', paddingLeft: 44, paddingRight: 16, height: 48, border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif", background: '#fafafa' }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Category filter — pill style like carousel */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {categories.map(cat => {
            const active = filters.category === cat;
            return (
              <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat }))}
                style={{
                  padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
                  background: active ? '#7c3aed' : '#fff',
                  color: active ? '#fff' : '#374151',
                  boxShadow: active ? 'none' : '0 0 0 1px #e5e7eb',
                  transition: 'all 0.15s',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''} found
        </p>

        {/* Tool grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} navigate={navigate} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>
            <p style={{ fontSize: 16, marginBottom: 12 }}>No tools found for "{filters.search}"</p>
            <button onClick={() => setFilters({ search: '', category: Category.ALL })}
              style={{ color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Footer — dark purple bar like carousel CTA */}
      <footer style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: '0 0 6px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>
          AI Nexus
        </p>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '0 0 16px' }}>
          Links on this site are affiliate links. We earn a small commission at no extra cost to you.
        </p>
        <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Instagram size={14} /> @ainexustools
        </a>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '16px 0 0' }}>
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

  return (
    <div
      onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hovered ? catColor + '40' : '#f0effe'}`,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.18s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 8px 24px ${catColor}18` : '0 1px 4px rgba(0,0,0,0.05)',
      }}>

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <span style={{ display: 'inline-block', background: catBg, color: catColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', marginBottom: 8 }}>
            {tool.category}
          </span>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#1a1a2e', margin: 0, lineHeight: 1.2 }}>
            {tool.name}
          </h3>
        </div>
        <div style={{ color: hovered ? catColor : '#d1d5db', transition: 'color 0.15s', marginTop: 2 }}>
          <ArrowRight size={18} />
        </div>
      </div>

      {/* Tagline */}
      <p style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500, margin: '0 0 8px', lineHeight: 1.4 }}>
        {tool.tagline}
      </p>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {tool.description}
      </p>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
        {tool.pricing && (
          <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{tool.pricing}</span>
        )}
        {tool.commission && (
          <span style={{ fontSize: 11, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
            {tool.commission}
          </span>
        )}
      </div>
    </div>
  );
}
