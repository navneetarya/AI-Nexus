import React, { useState, useMemo } from 'react';
import { TOOLS, SITE_CONFIG, TOOL_RATINGS } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, ArrowRight, Mail, Star, ExternalLink, ChevronRight, Zap, BookOpen, BarChart2 } from 'lucide-react';
import { COMPARE_ARTICLES } from './CompareArticlePage';

const C = {
  bg: '#0E0C0B', surf: '#161412', surf2: '#1E1A17',
  txt: '#F0EBE3', mut: 'rgba(240,235,227,0.58)', mut2: 'rgba(240,235,227,0.30)',
  acc: '#E9A93A', acc2: '#3BC98F',
  accCard: 'rgba(233,169,58,0.07)', accBrd: 'rgba(233,169,58,0.18)',
  greenCard: 'rgba(59,201,143,0.07)', greenBrd: 'rgba(59,201,143,0.18)',
  brd: 'rgba(240,235,227,0.08)', brd2: 'rgba(240,235,227,0.14)',
  barBg: 'rgba(14,12,11,0.97)', barBrd: 'rgba(240,235,227,0.08)',
};

const CATEGORY_META: Record<string, { emoji: string; color: string; count?: number }> = {
  All: { emoji: '⚡', color: C.acc },
  Writing: { emoji: '✍️', color: '#a78bfa' },
  Image: { emoji: '🎨', color: '#f472b6' },
  Video: { emoji: '🎬', color: '#60a5fa' },
  Audio: { emoji: '🎙️', color: '#34d399' },
  Marketing: { emoji: '📣', color: '#fb923c' },
  Design: { emoji: '✦', color: '#c084fc' },
  Coding: { emoji: '💻', color: '#f87171' },
  Productivity: { emoji: '🚀', color: '#4ade80' },
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':   { bg: 'rgba(59,201,143,0.10)',  color: '#3BC98F' },
  'Most popular':  { bg: 'rgba(233,169,58,0.10)',  color: '#E9A93A' },
  'Best value':    { bg: 'rgba(59,201,143,0.10)',  color: '#3BC98F' },
  'Free trial ✓':  { bg: 'rgba(59,201,143,0.10)',  color: '#3BC98F' },
  'SEO pick':      { bg: 'rgba(233,169,58,0.10)',  color: '#E9A93A' },
  'One-time price':{ bg: 'rgba(233,169,58,0.10)',  color: '#E9A93A' },
};

const AFFILIATE_SLUGS = ['rytr', 'podcastle', 'ocoya', 'replit', 'taskade'];
const CATEGORIES = ['All', 'Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'];

interface HomePageProps { navigate: (to: string) => void; }

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
          <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5"
            fill={i <= Math.floor(rating) ? C.acc : i - 0.5 <= rating ? C.acc : 'transparent'}
            stroke={C.acc} strokeWidth="0.8" strokeLinejoin="round"
            opacity={i <= Math.floor(rating) ? 1 : i - 0.5 <= rating ? 0.6 : 0.25} />
        </svg>
      ))}
      <span style={{ fontSize: 11, fontWeight: 600, color: C.acc, marginLeft: 2 }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters] = useState<FilterState>({ search: '', category: 'All' as any });
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: TOOLS.length };
    TOOLS.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, []);

  const filtered = useMemo(() => TOOLS.filter(t => {
    const q = filters.search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    const matchCat = filters.category === 'All' || t.category === filters.category;
    return matchSearch && matchCat;
  }), [filters]);

  const affiliatePicks = TOOLS.filter(t => AFFILIATE_SLUGS.includes(t.slug));

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) { setSubscribed(true); setEmail(''); }
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Best AI Tools Reviewed & Ranked 2026",
    "description": "Independent AI tool reviews by Navneet Arya. Every tool personally tested. Every link is a free trial.",
    "url": SITE_CONFIG.siteUrl,
    "author": { "@type": "Person", "name": SITE_CONFIG.authorName, "url": `${SITE_CONFIG.siteUrl}/about` },
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "en",
    "breadcrumb": { "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.siteUrl }] }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'IBM Plex Sans', sans-serif", color: C.txt }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: C.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#0E0C0B" fill="#0E0C0B" />
            </div>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 19, color: C.txt, letterSpacing: '-0.01em' }}>AI Nexus</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: 'All Tools', action: () => { setFilters({ search: '', category: 'All' as any }); scrollTo('tools-section'); } },
              { label: 'Compare', action: () => scrollTo('compare-section') },
              { label: 'About', action: () => navigate('/about') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{ fontSize: 13, fontWeight: 500, color: C.mut, padding: '6px 13px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.txt)} onMouseLeave={e => (e.currentTarget.style.color = C.mut)}>
                {label}
              </button>
            ))}
            <a href={`mailto:${SITE_CONFIG.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: C.bg, padding: '7px 16px', borderRadius: 8, background: C.acc, textDecoration: 'none' }}>
              <Mail size={12} /> Contact
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{ padding: '80px 24px 72px', borderBottom: `1px solid ${C.barBrd}`, background: C.surf, position: 'relative', overflow: 'hidden' }}>
        {/* Subtle amber glow */}
        <div style={{ position: 'absolute', top: -120, right: '20%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(233,169,58,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '15%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,201,143,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Authority badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accCard, border: `1px solid ${C.accBrd}`, borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.acc, display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: C.acc, letterSpacing: '0.04em' }}>
              {TOOLS.length} tools tested · Updated {new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 'clamp(36px,5.5vw,58px)', lineHeight: 1.1, color: C.txt, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            The best AI tools,<br /><em style={{ color: C.acc, fontStyle: 'italic' }}>honestly reviewed.</em>
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.75, color: C.mut, margin: '0 0 8px', fontWeight: 300 }}>
            I'm <strong style={{ color: C.txt, fontWeight: 500 }}>{SITE_CONFIG.authorName}</strong> — I personally test every tool on this list before recommending it. Every card links to a <strong style={{ color: C.txt, fontWeight: 500 }}>free trial</strong>.
          </p>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 40px' }}>
            Affiliate links help keep the reviews free.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.acc, textDecoration: 'underline', textDecorationColor: 'rgba(233,169,58,0.35)' }}>Full disclosure →</a>
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto 24px' }}>
            <Search size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.mut2, pointerEvents: 'none' as const }} />
            <input
              type="search"
              placeholder="Search tools — writing, podcasting, social media..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', paddingLeft: 44, paddingRight: 16, height: 50, border: `1.5px solid ${C.brd2}`, borderRadius: 12, fontSize: 15, outline: 'none', fontFamily: "'IBM Plex Sans', sans-serif", background: C.surf2, color: C.txt, transition: 'border-color 0.2s' }}
              onFocus={e => (e.target.style.borderColor = C.accBrd)}
              onBlur={e => (e.target.style.borderColor = C.brd2)}
            />
          </div>

          {/* Quick filters */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            {[{ label: '✍️ Writing', cat: 'Writing' }, { label: '🎙️ Audio', cat: 'Audio' }, { label: '📣 Marketing', cat: 'Marketing' }, { label: '💻 Coding', cat: 'Coding' }, { label: '🚀 Productivity', cat: 'Productivity' }].map(({ label, cat }) => (
              <button key={cat} onClick={() => { setFilters({ search: '', category: cat as any }); scrollTo('tools-section'); }}
                style={{ fontSize: 12, fontWeight: 500, color: C.mut, padding: '5px 13px', borderRadius: 100, background: C.surf2, border: `1px solid ${C.brd}`, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = C.txt; e.currentTarget.style.borderColor = C.brd2; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.mut; e.currentTarget.style.borderColor = C.brd; }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── TRUST STRIP ── */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.barBrd}`, padding: '24px 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: <BookOpen size={15} color={C.acc} />, title: 'Personally tested', desc: 'Signed up, used for weeks, then reviewed. Not copied from marketing pages.' },
            { icon: <BarChart2 size={15} color={C.acc2} />, title: 'Side-by-side comparisons', desc: "Can't decide between two tools? Read a full head-to-head breakdown." },
            { icon: <Zap size={15} color={C.acc} />, title: 'Free trials, always', desc: 'Every tool card links directly to a free plan or free trial — no paywalls.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: 12, padding: '16px 18px', background: C.surf, borderRadius: 12, border: `1px solid ${C.brd}` }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: C.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.txt, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12, color: C.mut, lineHeight: 1.55 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TOP PICKS STRIP ── */}
      {filters.search === '' && filters.category === 'All' && (
        <div style={{ background: C.surf, borderBottom: `1px solid ${C.barBrd}`, padding: '24px 24px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Star size={13} color={C.acc} fill={C.acc} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.acc, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>My top picks</span>
              <span style={{ fontSize: 12, color: C.mut2 }}>— tools I personally use & earn from</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {affiliatePicks.map(tool => {
                const ratingData = TOOL_RATINGS[tool.slug];
                return (
                  <button key={tool.id} onClick={() => navigate(`/tools/${tool.slug}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 10, border: `1px solid ${C.accBrd}`, background: C.accCard, cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(233,169,58,0.12)'; e.currentTarget.style.borderColor = 'rgba(233,169,58,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = C.accCard; e.currentTarget.style.borderColor = C.accBrd; }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: C.surf2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: C.acc, flexShrink: 0 }}>
                      {tool.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: C.txt }}>{tool.name}</div>
                      {ratingData && <div style={{ fontSize: 10, color: C.acc, fontWeight: 500 }}>★ {ratingData.rating.toFixed(1)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── COMPARE SECTION ── */}
      {filters.search === '' && filters.category === 'All' && (
        <div id="compare-section" style={{ background: C.bg, borderBottom: `1px solid ${C.barBrd}`, padding: '40px 24px' }}>
          <div style={{ maxWidth: 1160, margin: '0 auto' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.mut2, marginBottom: 6 }}>Head-to-head</div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 26, color: C.txt, letterSpacing: '-0.01em', margin: 0 }}>
                Tool comparisons
              </h2>
              <p style={{ fontSize: 14, color: C.mut, marginTop: 6 }}>Can't decide between two tools? Every comparison is from real, side-by-side testing.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
              {COMPARE_ARTICLES.map(article => <CompareCard key={article.slug} article={article} navigate={navigate} />)}
              <div style={{ padding: '24px', borderRadius: 14, border: `1px dashed ${C.brd2}`, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: 120 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>✦</div>
                <div style={{ fontWeight: 500, fontSize: 13, color: C.mut, marginBottom: 4 }}>More comparisons coming</div>
                <div style={{ fontSize: 12, color: C.mut2, lineHeight: 1.6 }}>Rytr vs Jasper · Podcastle vs Riverside · Taskade vs Notion</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── NEWSLETTER ── */}
      {filters.search === '' && filters.category === 'All' && (
        <div style={{ background: C.surf, borderBottom: `1px solid ${C.barBrd}`, padding: '40px 24px' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accCard, border: `1px solid ${C.accBrd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 18 }}>📬</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 22, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
              Weekly AI tool reviews
            </h2>
            <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, margin: '0 0 20px' }}>
              One email per week. New tool reviews, comparison updates, and honest takes on what's actually worth paying for.
            </p>
            {subscribed ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.greenCard, border: `1px solid ${C.greenBrd}`, borderRadius: 10, padding: '12px 20px', color: C.acc2, fontSize: 14, fontWeight: 500 }}>
                ✓ You're in — check your inbox.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ flex: 1, height: 44, padding: '0 14px', borderRadius: 9, border: `1.5px solid ${C.brd2}`, background: C.surf2, color: C.txt, fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = C.accBrd)} onBlur={e => (e.target.style.borderColor = C.brd2)} />
                <button type="submit" style={{ height: 44, padding: '0 20px', borderRadius: 9, background: C.acc, color: C.bg, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const }}>
                  Subscribe
                </button>
              </form>
            )}
            <p style={{ fontSize: 11, color: C.mut2, marginTop: 10 }}>{SITE_CONFIG.newsletterNote}</p>
          </div>
        </div>
      )}

      {/* ── TOOLS GRID ── */}
      <div id="tools-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 24px 100px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' as const, gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: C.mut2, marginBottom: 5 }}>Directory</div>
            <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 24, color: C.txt, letterSpacing: '-0.01em', margin: 0 }}>
              {filters.category === 'All' ? 'All AI tools' : `${filters.category} tools`}
            </h2>
          </div>
          {filters.category !== 'All' && (
            <button onClick={() => setFilters(f => ({ ...f, category: 'All' as any }))}
              style={{ fontSize: 12, color: C.acc, border: `1px solid ${C.accBrd}`, borderRadius: 8, padding: '6px 14px', background: C.accCard, cursor: 'pointer' }}>
              ← Show all {TOOLS.length} tools
            </button>
          )}
        </div>

        {/* Category pills with counts */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 24 }}>
          {CATEGORIES.map(cat => {
            const active = filters.category === cat;
            const meta = CATEGORY_META[cat] || { emoji: '·', color: C.acc };
            const count = categoryCounts[cat] || 0;
            return (
              <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat as any }))}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1.5px solid ${active ? meta.color + '40' : C.brd}`, background: active ? meta.color + '12' : 'transparent', color: active ? meta.color : C.mut, cursor: 'pointer', transition: 'all 0.15s' }}>
                <span>{meta.emoji}</span>
                <span>{cat}</span>
                {cat !== 'All' && <span style={{ fontSize: 10, opacity: 0.65, background: active ? meta.color + '20' : C.surf2, padding: '1px 5px', borderRadius: 4 }}>{count}</span>}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: C.mut2, marginBottom: 20, letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{filters.search ? ` matching "${filters.search}"` : ''}
        </p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map(tool => <ToolCard key={tool.id} tool={tool} navigate={navigate} isAffiliatePick={AFFILIATE_SLUGS.includes(tool.slug)} />)}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 16, color: C.mut, marginBottom: 16 }}>No results for "{filters.search}"</p>
            <button onClick={() => setFilters({ search: '', category: 'All' as any })}
              style={{ color: C.acc, border: `1px solid ${C.accBrd}`, borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 500, background: C.accCard, cursor: 'pointer' }}>
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.surf, borderTop: `1px solid ${C.barBrd}`, padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: C.acc, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={13} color="#0E0C0B" fill="#0E0C0B" />
                </div>
                <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: 17, color: C.txt }}>AI Nexus</span>
              </div>
              <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.7, maxWidth: 240 }}>
                Independent AI tool reviews by {SITE_CONFIG.authorName}. Every tool personally tested before recommendation.
              </p>
              <a href={`mailto:${SITE_CONFIG.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.acc, marginTop: 14, textDecoration: 'none' }}>
                <Mail size={13} /> {SITE_CONFIG.email}
              </a>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.mut2, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Categories</div>
              {['Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'].map(cat => (
                <button key={cat} onClick={() => { setFilters({ search: '', category: cat as any }); scrollTo('tools-section'); }}
                  style={{ display: 'block', fontSize: 13, color: C.mut, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.txt)} onMouseLeave={e => (e.currentTarget.style.color = C.mut)}>
                  {CATEGORY_META[cat]?.emoji} {cat} tools
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.mut2, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Site</div>
              {[
                { label: 'Home', action: () => navigate('/') },
                { label: 'Compare tools', action: () => scrollTo('compare-section') },
                { label: 'About the reviewer', action: () => navigate('/about') },
                { label: 'Affiliate disclosure', action: () => navigate('/disclosure') },
              ].map(({ label, action }) => (
                <button key={label} onClick={action} style={{ display: 'block', fontSize: 13, color: C.mut, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', fontFamily: "'IBM Plex Sans', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.txt)} onMouseLeave={e => (e.currentTarget.style.color = C.mut)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${C.barBrd}`, paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
            <p style={{ fontSize: 12, color: C.mut2 }}>© {new Date().getFullYear()} AI Nexus · Honest reviews, no gatekeeping.</p>
            <p style={{ fontSize: 12, color: C.mut2 }}>
              <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.mut2, textDecoration: 'underline', textDecorationColor: 'rgba(240,235,227,0.15)' }}>Affiliate disclosure</a>
              {' · '}This site earns commission when you purchase through our links.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Compare Card ─────────────────────────────────────────────────────────
function CompareCard({ article, navigate }: { article: any; navigate: (to: string) => void; key?: any }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={() => navigate(`/compare/${article.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.surf, borderRadius: 14, border: `1px solid ${hov ? C.accBrd : C.brd}`, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.25)` : 'none' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accCard, border: `1px solid ${C.accBrd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>⚖️</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.txt, lineHeight: 1.35 }}>{article.title.replace(/ \(\d{4}\):.*/, '').replace(/ \(\d{4}\)/, '')}</div>
          <div style={{ fontSize: 11, color: C.mut2, marginTop: 3 }}>{article.publishDate}</div>
        </div>
      </div>
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.55, margin: '0 0 12px' }}>
        {article.metaDescription.length > 110 ? article.metaDescription.slice(0, 107) + '…' : article.metaDescription}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${C.brd}`, paddingTop: 11 }}>
        <span style={{ fontSize: 11, color: C.acc, fontWeight: 600, background: C.accCard, padding: '3px 8px', borderRadius: 6 }}>
          Winner: {article.winnerName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: C.acc }}>
          Read <ArrowRight size={11} />
        </div>
      </div>
    </div>
  );
}

// ── Tool Card ─────────────────────────────────────────────────────────────
function ToolCard({ tool, navigate, isAffiliatePick }: { tool: Tool; navigate: (to: string) => void; isAffiliatePick: boolean; key?: any }) {
  const [hov, setHov] = useState(false);
  const ratingData = TOOL_RATINGS[tool.slug];
  const badge = tool.userBadge ? BADGE_COLORS[tool.userBadge] : null;
  const catMeta = CATEGORY_META[tool.category] || { color: C.acc };

  return (
    <article onClick={() => navigate(`/tools/${tool.slug}`)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.surf, borderRadius: 14, border: `1px solid ${hov ? C.brd2 : C.brd}`, padding: '20px 22px', cursor: 'pointer', position: 'relative' as const, overflow: 'hidden', transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.28)` : 'none' }}>

      {/* Our pick ribbon */}
      {isAffiliatePick && (
        <div style={{ position: 'absolute', top: 12, right: -1, background: C.acc, color: C.bg, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '3px 10px 3px 8px', borderRadius: '4px 0 0 4px' }}>
          OUR PICK
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 13 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: catMeta.color + '15', border: `1px solid ${catMeta.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 17, color: catMeta.color }}>
            {tool.name[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.txt }}>{tool.name}</div>
            <div style={{ fontSize: 11, color: C.mut2, marginTop: 2 }}>{tool.pricing}</div>
          </div>
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 600, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginTop: 2 }}>
            {tool.userBadge}
          </span>
        )}
      </div>

      {/* Rating row */}
      {ratingData && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="11" height="11" viewBox="0 0 12 12">
                <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5"
                  fill={i <= Math.floor(ratingData.rating) ? C.acc : 'transparent'}
                  stroke={C.acc} strokeWidth="0.8" strokeLinejoin="round"
                  opacity={i <= Math.floor(ratingData.rating) ? 1 : i - 0.5 <= ratingData.rating ? 0.55 : 0.2} />
              </svg>
            ))}
            <span style={{ fontSize: 11, fontWeight: 600, color: C.acc, marginLeft: 3 }}>{ratingData.rating.toFixed(1)}</span>
          </div>
          <span style={{ fontSize: 11, color: C.mut2 }}>Tested {ratingData.lastTested}</span>
        </div>
      )}

      {/* Tagline */}
      <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.6, margin: '0 0 12px', fontWeight: 300 }}>{tool.tagline}</p>

      {/* Feature pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 14 }}>
        {tool.features.slice(0, 3).map((f, i) => (
          <span key={i} style={{ fontSize: 11, color: catMeta.color, background: catMeta.color + '10', padding: '2px 8px', borderRadius: 5, fontWeight: 500 }}>{f}</span>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.brd}`, paddingTop: 13 }}>
        <span style={{ fontSize: 12, color: C.mut2 }}>Best for: {tool.bestFor}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: hov ? C.acc : C.mut, transition: 'color 0.15s' }}>
          Read review <ArrowRight size={11} />
        </div>
      </div>
    </article>
  );
}
