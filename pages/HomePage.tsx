import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, SITE_CONFIG, TRENDING_SLUGS } from '../constants';
import { Category, FilterState, Tool } from '../types';
import {
  Search, ArrowRight, Mail, Star, Shield,
  ExternalLink, X, Menu, ChevronRight,
  Zap, Clock, Award, BookOpen, BarChart2,
  PenLine, Image as ImageIcon, Video as VideoIcon,
  Mic, Megaphone, Palette, Code2, Scale, Sun, Moon, Calendar, Linkedin,
} from 'lucide-react';
import { COMPARE_ARTICLES } from './compare-data';
import { BLOG_POSTS } from '../blog/index';
import { SharedNav } from './SharedNav';
import { BeehiivForm } from '../components/BeehiivForm';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:     'var(--bg)',
  surf:   'var(--surf)',
  a1:     'var(--a1)',
  a2:     'var(--a2)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  mut2:   'var(--mut2)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  a2card: 'var(--a2-card)',
  a2brd:  'var(--a2-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
  dark:   'var(--dark)',
};

// ── Per-tool domains for Clearbit logo fetching ──────────────────────────────

// All tool logos have local PNGs in /public/logos/ — no external fallback needed.
const NO_LOCAL_LOGO = new Set<string>([]);

function ToolLogo({ slug, size = 28, name, color }: { slug: string; size?: number; name?: string; color?: string }) {
  // Skip local PNG fetch for known-missing files to prevent 404 console errors
  const [localErr, setLocalErr] = React.useState(() => NO_LOCAL_LOGO.has(slug));
  const initial = (name ?? slug)[0].toUpperCase();
  const r = Math.round(size * 0.27);

  // FIX: added loading="lazy" + decoding="async" so below-the-fold logos
  // don't block the main thread or consume bandwidth during initial paint.
  if (!localErr) {
    return (
      <img src={`/logos/${slug}.png`} alt={name ?? slug}
        width={size} height={size}
        loading="lazy"
        decoding="async"
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setLocalErr(true)}
      />
    );
  }
  return (
    <span style={{ width: size, height: size, borderRadius: r, background: color ?? C.a1, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.5), fontWeight: 700 }}>
      {initial}
    </span>
  );
}

// ── Category icon helper ──────────────────────────────────────────────────────
function CatIcon({ cat, size = 13, color }: { cat: string; size?: number; color?: string }) {
  const p = { size, color, style: { flexShrink: 0 as const } };
  switch (cat) {
    case 'Writing':      return <PenLine {...p} />;
    case 'Image':        return <ImageIcon {...p} />;
    case 'Video':        return <VideoIcon {...p} />;
    case 'Audio':        return <Mic {...p} />;
    case 'Marketing':    return <Megaphone {...p} />;
    case 'Design':       return <Palette {...p} />;
    case 'Coding':       return <Code2 {...p} />;
    case 'Productivity': return <Zap {...p} />;
    default:             return <Zap {...p} />;
  }
}

const COMPARE_CAT: Record<string, string> = {
  'rytr-vs-writesonic':           'Writing',
  'grammarly-vs-quillbot':        'Writing',
  'grammarly-vs-writesonic':      'Writing',
  'podcastle-vs-descript':        'Audio',
  'murf-ai-vs-elevenlabs':        'Audio',
  'ocoya-vs-buffer-vs-hootsuite': 'Marketing',
  'leonardo-vs-midjourney':       'Image',
  'replit-vs-github-copilot':     'Coding',
  'taskade-vs-notion':            'Productivity',
  'taskade-vs-asana':             'Productivity',
};

// Derived: category → array of compare slugs (inverted from COMPARE_CAT)
const CAT_COMPARES: Record<string, string[]> = Object.entries(COMPARE_CAT).reduce(
  (acc, [slug, cat]) => ({ ...acc, [cat]: [...(acc[cat] ?? []), slug] }),
  {} as Record<string, string[]>
);

// Category → compare article category mapping

const CAT_ACCENT: Record<string, 'a1' | 'a2'> = {
  Writing: 'a1', Image: 'a2', Video: 'a1', Audio: 'a2',
  Marketing: 'a1', Design: 'a2', Coding: 'a1', Productivity: 'a2',
};

const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  'Free plan ✓':        { bg: 'rgba(13,148,136,.1)',  color: '#0D9488' },
  'Most popular':       { bg: 'rgba(249,115,22,.12)', color: '#c2410c' },
  'Best value':         { bg: 'rgba(16,185,129,.1)',  color: '#059669' },
  'Free trial ✓':       { bg: 'rgba(13,148,136,.1)',  color: '#0D9488' },
  'SEO pick':           { bg: 'rgba(249,115,22,.1)',  color: '#ea580c' },
  'One-time price':     { bg: 'rgba(99,102,241,.1)',  color: '#4f46e5' },
  'Best for beginners': { bg: 'rgba(13,148,136,.1)',  color: '#0D9488' },
};

const AFFILIATE_SLUGS = ['rytr', 'podcastle', 'ocoya', 'replit', 'taskade'];
const CATEGORIES = ['All', 'Writing', 'Image', 'Video', 'Audio', 'Marketing', 'Design', 'Coding', 'Productivity'];

// Estimated read time for compare articles (minutes)
const READ_TIME: Record<string, number> = {
  'rytr-vs-writesonic': 6, 'podcastle-vs-descript': 7,
  'ocoya-vs-buffer-vs-hootsuite': 8, 'grammarly-vs-quillbot': 5,
  'leonardo-vs-midjourney': 7, 'replit-vs-github-copilot': 6,
  'taskade-vs-notion': 7,
};

// ── Animation styles ─────────────────────────────────────────────────────────
const ANIM_STYLE = `
@keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes scaleIn  { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
@keyframes ticker   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
@keyframes floatA   { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-10px) rotate(1deg)} }
@keyframes floatB   { 0%,100%{transform:translateY(-5px) rotate(.8deg)} 50%{transform:translateY(5px) rotate(-1.2deg)} }
@keyframes floatC   { 0%,100%{transform:translateY(-2px) rotate(.5deg)} 50%{transform:translateY(8px) rotate(-1deg)} }
@keyframes floatD   { 0%,100%{transform:translateY(4px) rotate(-1.5deg)} 50%{transform:translateY(-6px) rotate(1deg)} }

.anim-fade-up  { animation:fadeUp  .55s cubic-bezier(.22,1,.36,1) both }
.anim-fade-in  { animation:fadeIn  .5s ease both }
.anim-scale-in { animation:scaleIn .45s cubic-bezier(.22,1,.36,1) both }
.anim-slide-down{ animation:slideDown .3s ease both }
.d1{animation-delay:.05s}.d2{animation-delay:.1s}.d3{animation-delay:.15s}
.d4{animation-delay:.2s}.d5{animation-delay:.25s}.d6{animation-delay:.3s}

.scroll-reveal { opacity:0; transform:translateY(18px);
  transition:opacity .5s cubic-bezier(.22,1,.36,1), transform .5s cubic-bezier(.22,1,.36,1) }
.scroll-reveal.visible { opacity:1; transform:translateY(0) }
.tool-card-wrap.visible:not(.scroll-reveal) { opacity:1; transform:none }

.tool-card-inner { transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease }
.tool-card-wrap:hover .tool-card-inner {
  transform:translateY(-3px);
  border-color:var(--card-brd) !important;
  box-shadow:0 14px 40px var(--sh-md) !important;
}
.cat-pill  { transition:all .15s ease }
.cat-pill:hover { transform:translateY(-1px) }
.nav-btn   { transition:all .15s ease }
.nav-btn:hover  { background:rgba(13,148,136,.08)!important; color:#0D9488!important }
.blog-card { transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease }
.blog-card:hover { transform:translateY(-3px); box-shadow:0 16px 40px rgba(13,148,136,.10)!important; border-color:rgba(13,148,136,.28)!important }
.pick-card { transition:all .15s ease }
.pick-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(13,148,136,.10)!important }
.ticker-track { display:flex; animation:ticker 30s linear infinite }
.ticker-track:hover { animation-play-state:paused }

/* ── Desktop-only floats ── */
@media(max-width:680px){
  .hero-float { display:none !important }
  /* Mobile hero chip strip — shown only on mobile */
  .mobile-hero-chips { display:flex !important }
  /* Tighten hero padding on small screens */
  .hero-wrap { padding:44px 16px 40px !important }
  /* Single-column tool grid on phones */
  .tool-grid { grid-template-columns: 1fr !important }
  /* Prevent compare cards from going sub-300px */
  .compare-grid { grid-template-columns: 1fr !important }
  /* Horizontal scroll category pills */
  .cat-pills-row { flex-wrap:nowrap !important; overflow-x:auto; -webkit-overflow-scrolling:touch;
    padding-bottom:6px; scrollbar-width:none }
  .cat-pills-row::-webkit-scrollbar { display:none }
  /* Tighten blog grid */
  .blog-grid { grid-template-columns:1fr !important }
  /* Footer single column */
  .footer-grid { grid-template-columns:1fr !important }
  /* Tool section padding */
  .tools-section { padding:24px 14px 72px !important }
  /* Affiliate picks grid — 1 col on mobile */
  .picks-grid { grid-template-columns:1fr !important }
}
@media(min-width:681px){
  .mobile-hero-chips { display:none !important }
}
/* Smooth scroll chip strip */
.mobile-hero-chips {
  display:none;
  gap:8px; overflow-x:auto; padding:4px 0 12px;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
  mask-image:linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%);
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%);
}
.mobile-hero-chips::-webkit-scrollbar { display:none }
.mobile-chip {
  flex-shrink:0; display:inline-flex; align-items:center; gap:6px;
  padding:7px 12px; border-radius:10px; border:1.5px solid var(--a1-brd);
  background:var(--a1-card); white-space:nowrap;
  font-family:'Inter', system-ui, sans-serif; font-size:12px; font-weight:600;
  color:var(--a1);
}
@media(prefers-reduced-motion:reduce){
  .hero-float { animation:none !important }
}
/* ── Mobile performance: reduce animation & paint cost ── */
@media(max-width:680px){
  .anim-fade-up, .anim-fade-in, .anim-scale-in, .anim-slide-down { animation-duration:.25s !important }
  .scroll-reveal { transition-duration:.3s !important }
  .tool-card-inner { transition:none !important }
  .blog-card { transition:none !important }
  .pick-card { transition:none !important }
  .ticker-track { animation-duration:20s !important }
}
html { scroll-behavior:smooth }
::-webkit-scrollbar { width:5px; height:5px }
::-webkit-scrollbar-track { background:transparent }
::-webkit-scrollbar-thumb { background:rgba(13,148,136,.28); border-radius:10px }
::-webkit-scrollbar-thumb:hover { background:rgba(13,148,136,.5) }
`;

// ── Nexus SVG logomark — node-and-connection "N" motif ───────────────────────
// Works at 16 px (favicon) through 160 px (OG image). Four nodes at corners
// connected by strokes that trace the letter N; a fifth hub node sits at the
// diagonal cross-point, making the "nexus" concept literal.
const NexusIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Connection lines forming N */}
    <line x1="4" y1="16" x2="4"  y2="4"  stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="4" y1="4"  x2="16" y2="16" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="16" y1="4" x2="16" y2="16" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    {/* Corner nodes */}
    <circle cx="4"  cy="4"  r="2.2" fill="#fff"/>
    <circle cx="4"  cy="16" r="2.2" fill="#fff"/>
    <circle cx="16" cy="4"  r="2.2" fill="#fff"/>
    <circle cx="16" cy="16" r="2.2" fill="#fff"/>
    {/* Hub node at diagonal cross-point — the "nexus" */}
    <circle cx="10" cy="10" r="2.8" fill="#fff" opacity=".9"/>
    <circle cx="10" cy="10" r="1.4" fill="rgba(13,148,136,.7)"/>
  </svg>
);

interface HomePageProps { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void; }

// ── Main component ───────────────────────────────────────────────────────────
export function HomePage({ navigate, isDark, toggleTheme }: HomePageProps) {
  const [filters, setFilters]     = useState<FilterState>({ search: '', category: 'All' as any });
  const [view, setView]           = useState<'home' | 'compare'>('home');
  // FIX: paginate the tool grid — render only the first batch on mount to
  // dramatically reduce main-thread Style & Layout work (was 619ms).
  // Load more cards as the user scrolls down.
  const TOOLS_PER_PAGE = typeof window !== 'undefined' && window.innerWidth <= 680 ? 6 : 12;
  const [visibleCount, setVisibleCount] = useState(TOOLS_PER_PAGE);

  // ── Memos — MUST come before any useEffect that references them ─────────
  const filtered = useMemo(() => TOOLS.filter(t => {
    const q  = filters.search.toLowerCase();
    const ms = !q || t.name.toLowerCase().includes(q)
                  || t.tagline.toLowerCase().includes(q)
                  || t.category.toLowerCase().includes(q);
    const mc = (filters.category as string) === 'All' || t.category === filters.category;
    return ms && mc;
  }), [filters]);

  // Reset pagination whenever filters change so users always see fresh results from top
  useEffect(() => {
    setVisibleCount(TOOLS_PER_PAGE);
  }, [filters]);

  const affiliatePicks = useMemo(
    () => TOOLS.filter(t => AFFILIATE_SLUGS.includes(t.slug)),
    []
  );

  // ── Scroll-reveal (IntersectionObserver) ────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal:not(.visible)');
    if (!els.length) return;
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.05, rootMargin: '60px 0px -36px 0px' }
    );
    els.forEach(el => io.observe(el));
    // Fallback: reveal any cards already in viewport after paint settles
    requestAnimationFrame(() => {
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 60 && r.bottom > 0) {
          el.classList.add('visible');
          io.unobserve(el);
        }
      });
    });
    return () => io.disconnect();
  }, [filtered, view, visibleCount]);

  const scrollToId = (id: string) => {
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  const goCompare = () => {
    setView('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Logo (used in Footer dark band) ──────────────────────────────────────
  const Logo = ({ dark = false }: { dark?: boolean }) => (
    <div onClick={goHome}
      style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0 }}>
      <div style={{ width:34, height:34, borderRadius:10, flexShrink:0,
        background:`linear-gradient(135deg,${C.a1},#0b7a6e)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow:`0 2px 10px rgba(13,148,136,.32)` }}>
        <NexusIcon size={20}/>
      </div>
      <div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:16,
          color: dark ? '#fff' : C.txt, letterSpacing:'-0.034em', lineHeight:1.1 }}>
          AI Nexus<span style={{ color:C.a1 }}>.</span>
        </div>
        <div style={{ fontSize:9, fontWeight:500, letterSpacing:'0.07em',
          textTransform:'uppercase' as const, lineHeight:1,
          color: dark ? 'rgba(255,255,255,.4)' : C.mut2 }}>
          Honest reviews
        </div>
      </div>
    </div>
  );

  // ── Nav — uses SharedNav so all pages are consistent ─────────────────────
  const Nav = () => (
    <SharedNav
      navigate={navigate}
      isDark={isDark}
      toggleTheme={toggleTheme}
      activePage={view === 'compare' ? 'compare' : 'home'}
      onCompare={goCompare}
      onAllTools={() => { setView('home'); scrollToId('tools-section'); }}
    />
  );

  // ── Footer ───────────────────────────────────────────────────────────────
  const Footer = () => (
    <footer style={{ background:'var(--footer-bg)', padding:'48px 24px 26px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',
          gap:32, marginBottom:40 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom:14 }}><Logo dark/></div>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:13, lineHeight:1.7,
              marginBottom:16, maxWidth:200 }}>
              Honest AI tool research &amp; comparisons. No sponsored reviews.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <a href={`mailto:${SITE_CONFIG.email}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6,
                  color:C.a1, fontSize:13, fontWeight:500, textDecoration:'none' }}>
                <Mail size={12}/> {SITE_CONFIG.email}
              </a>
              <a href="https://www.linkedin.com/in/navneetarya/" target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6,
                  color:'#5eaeff', fontSize:13, fontWeight:500, textDecoration:'none' }}>
                <Linkedin size={12}/> LinkedIn — Navneet Arya
              </a>
            </div>
          </div>

          {/* Tools */}
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>TOOLS</div>
            {['Writing','Audio','Video','Image','Coding','Productivity','Marketing','Design'].map(cat => (
              <button key={cat}
                onClick={() => { setView('home'); setFilters({ search:'', category:cat as any });
                  window.scrollTo(0,0); setTimeout(() => scrollToId('tools-section'), 80); }}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'Inter', system-ui, sans-serif", background:'none', border:'none',
                  cursor:'pointer', padding:'3px 0', textAlign:'left' as const, transition:'color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.a1)}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.4)')}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  <CatIcon cat={cat} size={11} color="rgba(255,255,255,.4)" /> {cat}
                </span>
              </button>
            ))}
          </div>

          {/* Compare */}
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>COMPARE</div>
            {COMPARE_ARTICLES.map(a => (
              <button key={a.slug} onClick={() => navigate(`/compare/${a.slug}`)}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'Inter', system-ui, sans-serif", background:'none', border:'none',
                  cursor:'pointer', padding:'3px 0', textAlign:'left' as const,
                  transition:'color .15s', lineHeight:1.5 }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.a1)}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.4)')}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  <Scale size={11} color="rgba(255,255,255,.4)" /> {a.title.replace(/ \(\d{4}\).*/, '').replace(/ \(\d{4}\)/, '').slice(0, 30)}…
                </span>
              </button>
            ))}
          </div>

          {/* Site */}
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>SITE</div>
            {[
              { label:'Home',                    fn: goHome },
              { label:'About the reviewer',      fn: () => navigate('/about') },
              { label:'How Tools Are Evaluated', fn: () => navigate('/methodology') },
              { label:'Affiliate disclosure',    fn: () => navigate('/disclosure') },
              { label:'Compare tools',           fn: goCompare },
              { label:'Glossary',                fn: () => navigate('/glossary') },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'Inter', system-ui, sans-serif", background:'none', border:'none',
                  cursor:'pointer', padding:'3px 0', textAlign:'left' as const, transition:'color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.a1)}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.4)')}>
                {label}
              </button>
            ))}
          </div>

          {/* Guides */}
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>GUIDES</div>
            {[
              { label:'Best Free AI Tools',            fn: () => navigate('/best-free-ai-tools') },
              { label:'Best AI Writing Tools',         fn: () => navigate('/best-ai-writing-tools') },
              { label:'Best AI Coding Tools',          fn: () => navigate('/best-ai-coding-tools') },
              { label:'AI Tools for Freelancers',      fn: () => navigate('/best-ai-tools-for-freelancers') },
              { label:'Best AI Tools in India',        fn: () => navigate('/best-ai-tools-india') },
              { label:'AI Glossary',                   fn: () => navigate('/glossary') },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'Inter', system-ui, sans-serif", background:'none', border:'none',
                  cursor:'pointer', padding:'3px 0', textAlign:'left' as const, transition:'color .15s' }}
                onMouseEnter={e=>(e.currentTarget.style.color=C.a1)}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,.4)')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop:'1px solid rgba(255,255,255,.06)', paddingTop:20,
          display:'flex', justifyContent:'space-between', flexWrap:'wrap' as const, gap:8 }}>
          <p style={{ color:'rgba(255,255,255,.2)', fontSize:11.5 }}>
            © {new Date().getFullYear()} AI Nexus · Honest reviews, no gatekeeping.
          </p>
          <p style={{ color:'rgba(255,255,255,.2)', fontSize:11.5 }}>
            Affiliate links help keep all reviews free to read.
          </p>
        </div>
      </div>
    </footer>
  );

  // ════════════════════════════════════════════════════════════════════════════
  // ── COMPARE VIEW ────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  if (view === 'compare') {
    return (
      <div style={{ minHeight:'100vh', background:C.bg,
        fontFamily:"'Inter', system-ui, sans-serif", color:C.txt }}>
        <style>{ANIM_STYLE}</style>
        <Nav/>

        {/* Compare header */}
        <div style={{ background:C.surf, borderBottom:`1px solid ${C.barBrd}`,
          padding:'52px 24px 44px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0,
            background:`radial-gradient(ellipse 70% 60% at 70% 0%, rgba(13,148,136,.06) 0%, transparent 70%)`,
            pointerEvents:'none' }}/>
          <div style={{ maxWidth:780, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div className="anim-fade-up d1"
              style={{ display:'inline-flex', alignItems:'center', gap:7,
                background:C.a1card, border:`1px solid ${C.a1brd}`,
                borderRadius:100, padding:'4px 13px 4px 7px', marginBottom:20 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', background:C.a1,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BarChart2 size={10} color="#fff"/>
              </div>
              <span style={{ fontSize:11.5, fontWeight:600, color:C.a1 }}>
                {COMPARE_ARTICLES.length} tool comparisons published
              </span>
            </div>

            <h2 className="anim-fade-up d2"
              style={{ fontFamily:"'Inter',sans-serif", fontWeight:800,
                fontSize:'clamp(28px,5vw,44px)', color:C.txt,
                margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1.1 }}>
              Tool comparisons
            </h2>
            <p className="anim-fade-up d3"
              style={{ fontSize:16, color:C.mut, lineHeight:1.7, margin:0, maxWidth:520 }}>
              Can't decide between two tools? These in-depth, research-backed breakdowns
              give you an honest verdict — no affiliate bias, just what actually works.
            </p>
          </div>
        </div>

        {/* Blog post grid */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'44px 24px 96px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',
            gap:24 }}>
            {COMPARE_ARTICLES.map((article, i) => (
              <BlogCompareCard key={article.slug} article={article} navigate={navigate} idx={i}/>
            ))}

            {/* Coming soon placeholder */}
            <div className="scroll-reveal"
              style={{ borderRadius:18, border:`1.5px dashed rgba(13,148,136,.18)`,
                background:'transparent', display:'flex', flexDirection:'column' as const,
                justifyContent:'center', alignItems:'center', textAlign:'center' as const,
                padding:'40px 28px', minHeight:280 }}>
              <span style={{ fontSize:32, marginBottom:14 }}>🔜</span>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700,
                fontSize:14, color:C.mut, marginBottom:10 }}>
                More comparisons in progress
              </div>
              <div style={{ fontSize:12.5, color:C.mut2, lineHeight:1.8 }}>
                Rytr vs Jasper<br/>
                Podcastle vs Riverside<br/>
                Taskade vs Notion<br/>
                Grammarly vs ProWritingAid
              </div>
            </div>
          </div>
        </div>

        {/* ── Newsletter strip — bottom of compare list ────────────────── */}
        <BeehiivForm variant="hero" />

        <Footer/>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // ── HOME VIEW ───────────────────────────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div style={{ minHeight:'100vh', background:C.bg,
      fontFamily:"'Inter', system-ui, sans-serif", color:C.txt }}>
      <style>{ANIM_STYLE}</style>
      <Nav/>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="hero-wrap" style={{ position:'relative', overflow:'hidden', background:C.surf,
        borderBottom:`1px solid ${C.barBrd}`, padding:'68px 24px 60px' }}>

        {/* Background washes */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 80% 55% at 65% -5%, rgba(13,148,136,.07) 0%, transparent 70%)` }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 45% 45% at -5% 105%, rgba(249,115,22,.05) 0%, transparent 65%)` }}/>

        {/* ── Mobile-only horizontal tool chip strip ─────────────────── */}
        {/* Shown on screens ≤680px where hero-floats are hidden. Gives  */}
        {/* mobile visitors a scrollable preview of featured tools.       */}
        <div className="mobile-hero-chips" aria-label="Featured tools preview" style={{ marginBottom:20 }}>
          {['grammarly','rytr','podcastle','taskade','ocoya','replit'].map(slug => {
            const t = TOOLS.find(x => x.slug === slug);
            if (!t) return null;
            const isA2 = CAT_ACCENT[t.category] === 'a2';
            const ac = isA2 ? C.a2 : C.a1;
            return (
              <button key={slug} className="mobile-chip"
                onClick={() => navigate(`/tools/${slug}`)}
                style={{ border:`1.5px solid ${ac}40`, background:`${ac}0e`,
                  color:ac, cursor:'pointer' }}>
                <div style={{ width:20, height:20, borderRadius:5, background:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  flexShrink:0, overflow:'hidden' }}>
                  <ToolLogo slug={slug} size={15} name={t.name} color={ac} />
                </div>
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Hero content */}
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>

          {/* W4-T1: Author photo badge */}
          <div className="anim-fade-up d1" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:C.surf, border:`1px solid ${C.a1brd}`,
            borderRadius:100, padding:'4px 14px 4px 4px', marginBottom:16,
          }}>
            <img
              src="/author-photo.jpg"
              alt="Navneet Arya"
              style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover' as const, border:`2px solid ${C.a1}`, flexShrink:0 }}
            />
            <span style={{ fontSize:12, fontWeight:600, color:C.txt, fontFamily:"'Inter', system-ui, sans-serif" }}>
              by Navneet Arya
            </span>
          </div>

          {/* Trust badges */}
          <div className="anim-fade-up d1" style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' as const, marginBottom:24 }}>
            {['\u2713 Independent AI Research', '\u2713 No Sponsored Rankings'].map(badge => (
              <span key={badge} style={{ display:'inline-flex', alignItems:'center', gap:5,
                background:C.a1card, border:`1px solid ${C.a1brd}`,
                borderRadius:100, padding:'5px 13px',
                fontSize:12, fontWeight:600, color:C.a1,
                fontFamily:"'Inter', system-ui, sans-serif" }}>
                {badge}
              </span>
            ))}
          </div>

          {/* H1 */}
          <h1 className="anim-fade-up d2"
            style={{ fontFamily:"'Fraunces', Georgia, serif", fontWeight:800,
              fontSize:'clamp(30px,6vw,52px)', lineHeight:1.07, color:C.txt,
              margin:'0 0 16px', letterSpacing:'-0.025em' }}>
            Independent AI Research, Comparisons
            <span style={{ color:C.a1, fontStyle:'italic' }}> &amp; Workflow Intelligence</span>
          </h1>

          <p className="anim-fade-up d3"
            style={{ fontSize:16.5, lineHeight:1.72, color:C.mut, margin:'0 0 8px',
              maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>
            AI Nexus independently researches, compares &amp; organises AI tools
            for creators, freelancers, developers and modern teams.
          </p>

          {/* Trust stats bar */}
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16, marginBottom: 24 }}>
            {[
              { n: '200+',  label: 'tools evaluated' },
              { n: '25+',   label: 'workflows reviewed' },
              { n: 'Weekly', label: 'updated' },
              { n: '2022',  label: 'researching since' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.a1, lineHeight: 1.1 }}>{n}</div>
                <div style={{ fontSize: 12, color: C.mut, fontWeight: 500, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              onClick={() => scrollToId('tools-section')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 14, fontWeight: 700, color: '#fff',
                padding: '11px 24px', borderRadius: 10,
                background: `linear-gradient(135deg,${C.a1},#0b7a6e)`,
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: '0 3px 12px rgba(13,148,136,.35)' }}>
              Explore AI Tools <ArrowRight size={14}/>
            </button>
            <button
              onClick={() => navigate('/methodology')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
                fontSize: 14, fontWeight: 600, color: C.a1,
                padding: '11px 22px', borderRadius: 10,
                background: C.a1card, border: `1.5px solid ${C.a1brd}`,
                cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
              How Tools Are Evaluated
            </button>
          </div>

          <p className="anim-fade-up d3"
            style={{ fontSize:12, color:C.mut2, margin:'0 0 32px' }}>
            Affiliate links — I earn a small commission if you upgrade, at no cost to you.{' '}
            <a href="/disclosure" onClick={e=>{ e.preventDefault(); navigate('/disclosure'); }}
              style={{ color:C.a1, fontWeight:500 }}>Full disclosure</a>
          </p>

          {/* Search */}
          <div className="anim-scale-in d4"
            style={{ position:'relative', maxWidth:450, margin:'0 auto 16px' }}>
            <Search size={15} style={{ position:'absolute', left:15, top:'50%',
              transform:'translateY(-50%)', color:C.mut2, pointerEvents:'none' as const }}/>
            <input type="text"
              placeholder="Search — writing, podcast, video, code..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width:'100%', paddingLeft:43, paddingRight:16, height:50,
                border:`1.5px solid ${C.a1brd}`, borderRadius:13, fontSize:14.5,
                outline:'none', boxSizing:'border-box' as const,
                fontFamily:"'Inter', system-ui, sans-serif", background:C.surf, color:C.txt,
                boxShadow:'0 4px 20px rgba(13,148,136,.09)' }}
              onFocus={e=>(e.target.style.borderColor=C.a1)}
              onBlur={e=>(e.target.style.borderColor=C.a1brd)}
            />
          </div>

          {/* Quick category pills */}
          <div className="anim-fade-up d5"
            style={{ display:'flex', gap:7, justifyContent:'center', flexWrap:'wrap' as const }}>
            {[
              { label:'Writing', cat:'Writing' }, { label:'Audio',   cat:'Audio' },
              { label:'Social',  cat:'Marketing'},  { label:'Code',    cat:'Coding' },
              { label:'Productivity', cat:'Productivity' }, { label:'Video', cat:'Video' },
            ].map(({ label, cat }) => (
              <button key={cat} className="cat-pill"
                onClick={() => { setFilters({ search:'', category:cat as any }); scrollToId('tools-section'); }}
                style={{ fontSize:12.5, fontWeight:500, color:C.mut, padding:'6px 13px',
                  borderRadius:100, background:'transparent',
                  border:`1px solid var(--brd-lg)`, cursor:'pointer',
                  fontFamily:"'Inter', system-ui, sans-serif",
                  display:'inline-flex', alignItems:'center', gap:5 }}>
                <CatIcon cat={cat} size={12} color={C.mut} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <div style={{ background:`linear-gradient(90deg,#0b7a6e,${C.a1})`, padding:'11px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex',
          justifyContent:'center', gap:'clamp(16px,3.5vw,44px)', flexWrap:'wrap' as const }}>
          {[
            { icon:<Shield size={12}/>,  text:'Independent Human Research' },
            { icon:<Zap size={12}/>,     text:'Workflow-Focused Analysis' },
            { icon:<Award size={12}/>,   text:'No Sponsored Placements' },
            { icon:<Star size={12}/>,    text:'Human-Curated Comparisons' },
            { icon:<Clock size={12}/>,   text:'Updated Weekly' },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6,
              color:'rgba(255,255,255,.9)', fontSize:12, fontWeight:500 }}>
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Editor picks ───────────────────────────────────────────────── */}
      <div style={{ background:C.surf, padding:'32px 24px',
        borderBottom:`1px solid ${C.barBrd}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            marginBottom:18, flexWrap:'wrap' as const, gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:C.a2card,
                border:`1.5px solid ${C.a2brd}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Star size={13} color={C.a2} fill={C.a2}/>
              </div>
              <div>
                <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:800,
                  fontSize:14.5, color:C.txt }}>Trending AI Tools This Week</span>
                <span style={{ fontSize:11.5, color:C.mut2, marginLeft:9 }}>
                  Curated &amp; updated weekly
                </span>
              </div>
            </div>
            <button onClick={goCompare}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5,
                fontWeight:600, color:C.a1, padding:'7px 14px', borderRadius:9,
                background:C.a1card, border:`1px solid ${C.a1brd}`,
                cursor:'pointer', fontFamily:"'Inter', system-ui, sans-serif" }}>
                <Scale size={13}/> See all comparisons <ArrowRight size={12}/>
            </button>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
            {affiliatePicks.map((tool, i) => {
              const isA2   = CAT_ACCENT[tool.category] === 'a2';
              const accent = isA2 ? C.a2 : C.a1;
              const bg     = isA2 ? C.a2card : C.a1card;
              const brd    = isA2 ? C.a2brd  : C.a1brd;
              return (
                <button key={tool.id} className="pick-card"
                  onClick={() => navigate(`/tools/${tool.slug}`)}
                  style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px',
                    borderRadius:13, border:`1.5px solid ${brd}`, background:bg,
                    cursor:'pointer', textAlign:'left' as const,
                    fontFamily:"'Inter', system-ui, sans-serif",
                    boxShadow:'0 1px 4px var(--sh-xs)' }}>
                  <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                    background:'#fff', border:`1.5px solid ${brd}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    overflow:'hidden', boxShadow:`0 2px 8px ${accent}30` }}>
                    <ToolLogo slug={tool.slug} size={30} name={tool.name} color={accent} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700,
                      fontSize:13.5, color:C.txt, marginBottom:2 }}>{tool.name}</div>
                    <div style={{ fontSize:11, color:accent, fontWeight:600 }}>{tool.pricing}</div>
                  </div>
                  <ChevronRight size={13} color={accent} style={{ marginLeft:'auto', flexShrink:0 }}/>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Trending This Week ────────────────────────────────────────── */}
      {(filters.category as string) === 'All' && !filters.search && (
        <div className="scroll-reveal" style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px 0' }}>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:17,
            color:C.txt, letterSpacing:'-0.025em', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
              width:22, height:22, borderRadius:6, background:C.a1card }}>
              🔥
            </span>
            Most Researched This Month
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
            {TOOLS.filter(t => TRENDING_SLUGS.includes(t.slug)).map(tool => {
              const accent = CAT_ACCENT[tool.category] === 'a2' ? C.a2 : C.a1;
              return (
                <div key={tool.slug} onClick={() => navigate(`/tools/${tool.slug}`)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
                    background:C.surf, border:`1px solid var(--brd-xs)`, borderRadius:12,
                    cursor:'pointer', transition:'border-color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = accent)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--brd-xs)')}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#fff',
                    border:`1.5px solid ${accent}28`, display:'flex', alignItems:'center',
                    justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
                    <ToolLogo slug={tool.slug} size={28} name={tool.name} color={accent} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:14,
                      color:C.txt, whiteSpace:'nowrap' as const, overflow:'hidden', textOverflow:'ellipsis' }}>
                      {tool.name}
                    </div>
                    <div style={{ fontSize:11, color:C.mut2, marginTop:1 }}>{tool.category} · {tool.pricing}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontSize:11, color:accent, fontWeight:600, flexShrink:0 }}>
                    Read review →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Latest AI Research ──────────────────────────────────────────── */}
      {(filters.category as string) === 'All' && !filters.search && (
        <div className="scroll-reveal" style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px 0' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14, gap:8 }}>
            <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:17,
              color:C.txt, letterSpacing:'-0.025em', margin:0, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center',
                width:22, height:22, borderRadius:6, background:C.a1card }}>📊</span>
              Latest AI Research
            </h2>
            <button
              onClick={() => navigate('/blog')}
              style={{ fontSize:12, fontWeight:600, color:C.a1, background:'none', border:'none',
                cursor:'pointer', fontFamily:"'Inter',sans-serif" }}>
              View all research →
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
            {BLOG_POSTS.filter(p => p.category === 'Research').slice(0, 3).map(post => (
              <div key={post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                style={{ padding:'16px', background:C.surf, border:`1px solid var(--brd-xs)`,
                  borderRadius:12, cursor:'pointer', transition:'border-color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = C.a1)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--brd-xs)')}
              >
                <div style={{ fontSize:11, fontWeight:700, color:C.a1, textTransform:'uppercase',
                  letterSpacing:'0.06em', marginBottom:6 }}>{post.category}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:14,
                  color:C.txt, lineHeight:1.4, marginBottom:6 }}>{post.title}</div>
                <div style={{ fontSize:12, color:C.mut, lineHeight:1.5,
                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const,
                  overflow:'hidden' }}>{post.excerpt}</div>
                <div style={{ marginTop:10, fontSize:11, color:C.a1, fontWeight:600 }}>Read research →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tool Grid ──────────────────────────────────────────────────── */}
      <div id="tools-section" className="tools-section" style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px 96px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:20, flexWrap:'wrap' as const, gap:12 }}>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:19,
            color:C.txt, letterSpacing:'-0.025em' }}>
            {(filters.category as string) === 'All' ? 'All AI tools' : `${filters.category} tools`}
          </h2>
          {(filters.category as string) !== 'All' && (
            <button onClick={() => setFilters(f => ({ ...f, category:'All' as any }))}
              style={{ fontSize:12, color:C.a1, border:`1px solid ${C.a1brd}`, borderRadius:8,
                padding:'6px 14px', background:C.a1card, cursor:'pointer',
                fontFamily:"'Inter', system-ui, sans-serif", fontWeight:600 }}>
              ← All tools
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="cat-pills-row" style={{ display:'flex', gap:7, flexWrap:'wrap' as const, marginBottom:26 }}>
          {CATEGORIES.map(cat => {
            const active = (filters.category as string) === cat;
            const isA2   = CAT_ACCENT[cat] === 'a2';
            const ac     = isA2 ? C.a2 : C.a1;
            const abg    = isA2 ? C.a2card : C.a1card;
            const abrd   = isA2 ? C.a2brd  : C.a1brd;
            return (
              <button key={cat} className="cat-pill"
                onClick={() => setFilters(f => ({ ...f, category:cat as any }))}
                style={{ padding:'7px 16px', borderRadius:100, fontSize:12.5,
                  fontWeight:active?700:500, fontFamily:"'Inter', system-ui, sans-serif",
                  border:`1.5px solid ${active ? abrd : 'var(--brd)'}`,
                  background:active ? abg : C.surf, color:active ? ac : C.mut,
                  cursor:'pointer', boxShadow:active?`0 2px 8px ${ac}1e`:'none' }}>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  {cat !== 'All' && <CatIcon cat={cat} size={12} color={active ? ac : C.mut} />}
                  {cat}
                </span>
              </button>
            );
          })}
        </div>

        <p style={{ fontSize:11, color:C.mut2, marginBottom:20, fontWeight:600,
          letterSpacing:'0.08em', textTransform:'uppercase' as const }}>
          {filtered.length} tool{filtered.length !== 1?'s':''}
          {(filters.category as string)!=='All' ? ` · ${filters.category}` : ''}
          {filters.search ? ` matching "${filters.search}"` : ''}
        </p>

        {/* ── W5 Task 3: Compare callout — shown when a category is active ── */}
        {(filters.category as string) !== 'All' && (() => {
          const cat      = filters.category as string;
          const isA2     = CAT_ACCENT[cat] === 'a2';
          const ac       = isA2 ? C.a2 : C.a1;
          const acCard   = isA2 ? C.a2card : C.a1card;
          const acBrd    = isA2 ? C.a2brd  : C.a1brd;
          const slugs    = CAT_COMPARES[cat] ?? [];
          const articles = COMPARE_ARTICLES.filter(a => slugs.includes(a.slug));
          if (articles.length === 0) return null;
          return (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: acCard, border: `1px solid ${acBrd}`,
              borderRadius: 12, padding: '13px 18px', marginBottom: 22,
              flexWrap: 'wrap' as const,
            }}>
              <span style={{
                fontSize: 12, fontWeight: 700, color: ac,
                fontFamily: "'Inter', system-ui, sans-serif", whiteSpace: 'nowrap' as const,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Scale size={13} color={ac} />
                Compare {cat} tools:
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                {articles.map(art => (
                  <button
                    key={art.slug}
                    onClick={() => navigate(`/compare/${art.slug}`)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 12, fontWeight: 600, color: ac,
                      background: 'transparent',
                      border: `1px solid ${acBrd}`, borderRadius: 100,
                      padding: '5px 13px', cursor: 'pointer',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = acBrd)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {art.title
                      .replace(/\s*\(2026\).*$/, '')
                      .replace(/\s*:\s*.+$/, '')}
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Cards — FIX: only render visibleCount cards at a time to cut
             main-thread Style & Layout cost from 619ms down significantly */}
        <div className="tool-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.slice(0, visibleCount).map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} navigate={navigate}
              isAffiliatePick={AFFILIATE_SLUGS.includes(tool.slug)} idx={i}/>
          ))}
        </div>

        {/* Load more button — shown when there are more tools to display */}
        {visibleCount < filtered.length && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={() => setVisibleCount(c => c + TOOLS_PER_PAGE)}
              style={{
                padding: '11px 32px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Inter', system-ui, sans-serif",
                color: C.a1,
                background: C.a1card,
                border: `1.5px solid ${C.a1brd}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Load more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
              <Search size={38} color={C.mut2} />
            </div>
            <p style={{ fontSize:15.5, color:C.mut, marginBottom:14 }}>
              No tools match "{filters.search}"
            </p>
            <button onClick={() => setFilters({ search:'', category:'All' as any })}
              style={{ color:C.a1, border:`1.5px solid ${C.a1brd}`, borderRadius:9,
                padding:'9px 22px', fontSize:13, fontWeight:600,
                fontFamily:"'Inter', system-ui, sans-serif", background:C.a1card, cursor:'pointer' }}>
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── Author CTA — replaces fabricated testimonials ──────────────── */}
      <div style={{ padding:'48px 24px 0', background:'var(--bg)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20,
            background:C.surf, borderRadius:16, border:`1px solid var(--brd-sm)`,
            padding:'24px 28px', flexWrap:'wrap' as const }}>
            <img
              src="/author-photo.jpg"
              alt="Navneet Arya — independent AI tools researcher"
              width={56} height={56}
              style={{ borderRadius:'50%', objectFit:'cover' as const, flexShrink:0 }}
            />
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontSize:14, fontWeight:700, color:C.txt,
                fontFamily:"'Inter',sans-serif", marginBottom:4 }}>
                Navneet Arya — independent AI tools researcher
              </div>
              <div style={{ fontSize:13.5, color:C.mut, lineHeight:1.65 }}>
                I read every email. If a review here helped you choose a tool — or if you think I got something wrong — I genuinely want to hear it.
              </div>
              <a href="mailto:hello@ainexustools.online"
                style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:10,
                  fontSize:12.5, fontWeight:600, color:C.a1, textDecoration:'none',
                  padding:'6px 14px', borderRadius:8,
                  background:C.a1card, border:`1px solid ${C.a1brd}` }}>
                <Mail size={13}/> hello@ainexustools.online
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── How Tools Are Evaluated ────────────────────────────────── */}
      <div style={{ background:C.surf, borderTop:`1px solid ${C.barBrd}`, borderBottom:`1px solid ${C.barBrd}`, padding:'52px 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div className="scroll-reveal" style={{ textAlign:'center', marginBottom:32 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:C.a1 }}>Our Process</span>
            <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:24, color:C.txt, margin:'10px 0 12px', letterSpacing:'-0.025em' }}>
              How AI Tools Are Evaluated
            </h2>
            <p style={{ fontSize:14.5, color:C.mut, maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>
              AI tools on AI Nexus are independently researched and evaluated based on publicly available information — no sponsored rankings, no paid placements.
            </p>
          </div>
          <div className="scroll-reveal" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
            {([
              { icon:'\uD83D\uDD0D', label:'Publicly Available Features', desc:'We evaluate based on what the tool actually offers, not marketing claims.' },
              { icon:'\uD83D\uDCB0', label:'Pricing Transparency', desc:'Every free plan, trial and paid tier clearly documented.' },
              { icon:'\u2699\uFE0F', label:'Workflow Relevance', desc:'Does the tool fit real creator, freelancer, or team workflows?' },
              { icon:'\uD83C\uDFA8', label:'Usability & Accessibility', desc:'Evaluated for approachability across different skill levels.' },
              { icon:'\uD83D\uDCAC', label:'Community Feedback', desc:'Creator forums, Reddit, and G2 sentiment analysis considered.' },
              { icon:'\uD83D\uDCC4', label:'Documentation Quality', desc:'Well-documented tools with active changelogs rated higher.' },
            ] as const).map(({ icon, label, desc }) => (
              <div key={label} style={{ background:C.bg, border:`1px solid var(--brd-xs)`, borderRadius:12, padding:'18px 18px' }}>
                <div style={{ fontSize:20, marginBottom:10 }}>{icon}</div>
                <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13, color:C.txt, marginBottom:6, lineHeight:1.3 }}>{label}</div>
                <div style={{ fontSize:12, color:C.mut, lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
          <div className="scroll-reveal" style={{ marginTop:22, padding:'18px 22px', background:C.a1card, border:`1px solid ${C.a1brd}`, borderRadius:12, textAlign:'center' as const }}>
            <p style={{ fontSize:13.5, color:C.txt, margin:'0 0 12px', fontWeight:500, lineHeight:1.65 }}>
              The goal is not to artificially rank tools — but to help users discover tools worth exploring.
            </p>
            <button onClick={() => navigate('/methodology')} style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:C.a1, border:`1px solid ${C.a1brd}`, borderRadius:8, padding:'8px 18px', background:C.surf, cursor:'pointer', fontFamily:"'Inter', system-ui, sans-serif" }}>
              Read Full Evaluation Process <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Popular Comparisons */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 48px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap' as const, gap:12 }}>
          <div>
            <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:19, color:C.txt, letterSpacing:'-0.025em', marginBottom:4 }}>
              Popular Comparisons
            </h2>
            <div style={{ fontSize:13, color:C.mut }}>
              Can't decide between two tools? These side-by-side breakdowns cut through the noise.
            </div>
          </div>
          <button
            onClick={goCompare}
            style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:C.a1, border:`1px solid ${C.a1brd}`, borderRadius:8, padding:'7px 14px', background:C.a1card, cursor:'pointer', fontFamily:"'Inter', system-ui, sans-serif" }}
          >
            View all {COMPARE_ARTICLES.length} comparisons <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {COMPARE_ARTICLES.slice(0, 5).map((article, i) => (
            <div
              key={article.slug}
              onClick={() => navigate(`/compare/${article.slug}`)}
              style={{ background:C.surf, border:`1.5px solid var(--brd-xs)`, borderRadius:14, padding:'16px 18px', cursor:'pointer', transition:'box-shadow .15s, transform .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${C.a1}22`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
            >
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:C.a1card, border:`1px solid ${C.a1brd}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Scale size={13} color={C.a1} />
                </div>
                <span style={{ fontSize:10, fontWeight:700, color:C.a1, letterSpacing:'0.07em', textTransform:'uppercase' as const }}>Compare</span>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:C.txt, lineHeight:1.4, marginBottom:6 }}>
                {article.keyword.split(' vs ').join(' vs ')}
              </div>
              <div style={{ fontSize:12, color:C.mut, lineHeight:1.5 }}>
                {article.quickAnswer.slice(0, 90)}…
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:10, fontSize:12, fontWeight:600, color:C.a1 }}>
                Read comparison <ArrowRight size={11} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Start Here ──────────────────────────────────────────────────── */}
      <div style={{ padding:'52px 24px', borderBottom:`1px solid ${C.barBrd}` }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div className="scroll-reveal" style={{ marginBottom:28 }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:C.a2 }}>New to AI Tools?</span>
            <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:24, color:C.txt, margin:'10px 0 6px', letterSpacing:'-0.025em' }}>
              Start Here
            </h2>
            <p style={{ fontSize:14, color:C.mut }}>The most useful starting points — no overwhelm, just the essentials.</p>
          </div>
          <div className="scroll-reveal" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:12 }}>
            {([
              { icon:'🆓', label:'Best Free AI Tools',      desc:'Top tools you can use right now without paying',         path:'/best-free-ai-tools' },
              { icon:'✍️', label:'Best AI Writing Tools',    desc:'For bloggers, copywriters and content creators',        path:'/best-ai-writing-tools' },
              { icon:'💼', label:'AI Tools for Freelancers', desc:'Tools that save time and improve client work',          path:'/best-ai-tools-for-freelancers' },
              { icon:'🤖', label:'ChatGPT vs Claude',        desc:'Which AI assistant suits your workflow best?',          path:'/blog/chatgpt-alternatives-free-2026' },
              { icon:'💻', label:'Best AI Coding Tools',     desc:'Copilot, Replit, Cursor — compared honestly',          path:'/best-ai-coding-tools' },
              { icon:'🔬', label:'How Tools Are Evaluated',  desc:'Our research criteria and evaluation methodology',     path:'/methodology' },
            ] as const).map(({ icon, label, desc, path }) => (
              <button key={path}
                onClick={() => navigate(path)}
                style={{ display:'flex', alignItems:'flex-start', gap:13, padding:'15px 17px',
                  background:C.surf, border:`1.5px solid var(--brd-xs)`, borderRadius:12,
                  cursor:'pointer', textAlign:'left' as const,
                  fontFamily:"'Inter', system-ui, sans-serif", transition:'border-color .15s, box-shadow .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.a1brd; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 16px ${C.a1}14`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brd-xs)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}>
                <span style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:13.5, color:C.txt, marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:12, color:C.mut, lineHeight:1.55 }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter ───────────────────────────────────────────────────── */}
      <div style={{ padding:'52px 24px 0', textAlign:'center' as const }}>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' as const, color:C.a1 }}>Weekly Research Digest</span>
        <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:22, color:C.txt, margin:'10px 0 10px', letterSpacing:'-0.025em' }}>
          Get Only the AI Tools Worth Exploring.
        </h2>
        <p style={{ fontSize:14, color:C.mut, maxWidth:400, margin:'0 auto 20px', lineHeight:1.65 }}>
          Weekly independent AI research: new tools, workflow ideas, curated discoveries — zero spam.
        </p>
      </div>
      <BeehiivForm variant="hero" />

      <Footer/>
    </div>
  );
}

// ── Blog-style Compare Card (for compare view) ───────────────────────────────
function BlogCompareCard({ article, navigate, idx }: {
  article: any; navigate: (to: string) => void; idx: number; key?: React.Key;
}) {
  const cat      = COMPARE_CAT[article.slug]  ?? 'Tools';
  const readTime = READ_TIME[article.slug]    ?? 6;
  const accent   = CAT_ACCENT[cat] === 'a2' ? C.a2 : C.a1;
  const acBg     = CAT_ACCENT[cat] === 'a2' ? C.a2card : C.a1card;
  const acBrd    = CAT_ACCENT[cat] === 'a2' ? C.a2brd  : C.a1brd;

  const vsLabel = article.title
    .replace(/ \(\d{4}\):.*/, '').replace(/ \(\d{4}\)/, '');

  return (
    <div className="blog-card scroll-reveal"
      onClick={() => navigate(`/compare/${article.slug}`)}
      style={{ background:C.surf, borderRadius:18, border:`1.5px solid var(--brd-xs)`,
        cursor:'pointer', overflow:'hidden',
        boxShadow:'0 2px 8px var(--chip-bg)',
        animationDelay:`${idx * 0.07}s` }}>

      {/* Article header band */}
      <div style={{ background:`linear-gradient(135deg, ${accent}14, ${accent}06)`,
        borderBottom:`1px solid ${acBrd}`, padding:'24px 24px 20px' }}>

        {/* Meta row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:14 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6,
            fontSize:11, fontWeight:700, color:accent,
            background:acBg, padding:'3px 10px', borderRadius:100,
            border:`1px solid ${acBrd}`, letterSpacing:'0.03em' }}>
            <CatIcon cat={cat} size={11} color={accent} /> {cat}
          </span>
          <span style={{ fontSize:11, color:C.mut2, fontWeight:500,
            display:'flex', alignItems:'center', gap:4 }}>
            <BookOpen size={11}/> {readTime} min read
          </span>
        </div>

        {/* VS logo row */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          {article.comparisonTable?.slice(0, 3).map((row: any, i: number) => {
            const slugGuess = row.name?.toLowerCase().replace(/\s+/g, '-');
            return (
              <React.Fragment key={i}>
                <div style={{ display:'flex', flexDirection:'column' as const, alignItems:'center', gap:3 }}>
                  <div style={{ width:34, height:34, borderRadius:10, background:'#fff',
                    border:`1.5px solid ${acBrd}`, display:'flex', alignItems:'center',
                    justifyContent:'center', overflow:'hidden', boxShadow:`0 1px 4px ${accent}18` }}>
                    <ToolLogo slug={slugGuess} size={26} name={row.name} color={accent} />
                  </div>
                  <span style={{ fontSize:9, fontWeight:600, color:C.mut2, letterSpacing:'0.02em' }}>
                    {row.name?.split(' ')[0]}
                  </span>
                </div>
                {i < (article.comparisonTable.length > 2 ? 1 : 0) && (
                  <span style={{ fontSize:11, fontWeight:700, color:C.mut2 }}>vs</span>
                )}
              </React.Fragment>
            );
          }) ?? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              width:34, height:34, borderRadius:10, background:acBg, border:`1.5px solid ${acBrd}` }}>
              <Scale size={16} color={accent} />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 style={{ fontFamily:"'Inter',sans-serif", fontWeight:800, fontSize:16,
          color:C.txt, margin:0, letterSpacing:'-0.02em', lineHeight:1.3 }}>
          {vsLabel}
        </h2>
      </div>

      {/* Article body */}
      <div style={{ padding:'18px 24px 20px' }}>
        <p style={{ fontSize:13, color:C.mut, lineHeight:1.65, margin:'0 0 16px' }}>
          {article.metaDescription.length > 130
            ? article.metaDescription.slice(0, 127) + '…'
            : article.metaDescription}
        </p>

        {/* Key info strip */}
        <div style={{ display:'flex', alignItems:'center', gap:8,
          marginBottom:18, flexWrap:'wrap' as const }}>
          <span style={{ fontSize:11, color:C.mut2, fontWeight:500,
            background:'var(--chip-bg)', padding:'3px 9px', borderRadius:6,
            display:'inline-flex', alignItems:'center', gap:4 }}>
            <Calendar size={10} color={C.mut2} /> {article.publishDate}
          </span>
          <span style={{ fontSize:11, color:C.mut2, fontWeight:500,
            background:'var(--chip-bg)', padding:'3px 9px', borderRadius:6 }}>
            {article.comparisonTable?.length ?? 3} tools compared
          </span>
        </div>

        {/* Footer CTA */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          borderTop:`1px solid var(--brd-sm)`, paddingTop:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase' as const,
              color:C.mut2, letterSpacing:'0.06em' }}>Winner</span>
            <span style={{ fontSize:12, color:accent, fontWeight:700,
              background:acBg, padding:'3px 10px', borderRadius:6,
              border:`1px solid ${acBrd}` }}>
              {article.winnerName}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5,
            fontWeight:700, color:accent }}>
            Read comparison <ArrowRight size={13}/>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tool Card (home view) — 3 visual tiers ──────────────────────────────────
// • Featured  (affiliate picks)  — span-2 cols, horizontal layout, teal glow, Editor's Pick ribbon
// • Standard  (badged tools)     — current design, no change
// • Secondary (no badge)         — same structure, visually recedes (thinner border, dimmer shadow)

const FEATURED_RATINGS: Record<string, string> = {
  rytr: '4.5', podcastle: '4.7', ocoya: '4.6', replit: '4.4', taskade: '4.6',
};

/** T3.5: Derive display rating from researchSources (avg of trustpilot + g2) or FEATURED_RATINGS fallback */
function getCardRating(tool: Tool): string | null {
  const src = tool.researchSources;
  if (src) {
    const vals: number[] = [];
    if (src.trustpilot?.rating) vals.push(src.trustpilot.rating);
    if (src.g2?.rating) vals.push(src.g2.rating);
    if (vals.length > 0) {
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      return avg.toFixed(1);
    }
  }
  return FEATURED_RATINGS[tool.slug] ?? null;
}

/** Format ISO date "2026-05-05" → "May 2026" for the Last Tested chip */
function fmtTested(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month:'short', year:'numeric' });
  } catch { return iso; }
}

function ToolCard({ tool, navigate, isAffiliatePick, idx }: {
  tool: Tool; navigate: (to: string) => void; isAffiliatePick: boolean; idx: number; key?: React.Key;
}) {
  const isA2    = CAT_ACCENT[tool.category] === 'a2';
  const accent  = isA2 ? C.a2 : C.a1;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;
  const badge   = tool.userBadge ? BADGE_COLORS[tool.userBadge] : null;
  const isSecondary = !isAffiliatePick && !tool.userBadge;
  const revealCls = idx < 6 ? 'tool-card-wrap visible' : 'tool-card-wrap scroll-reveal';

  // ── FEATURED tier ─────────────────────────────────────────────────────────
  if (isAffiliatePick) {
    const rating = FEATURED_RATINGS[tool.slug] ?? '4.5';
    const ratingNum = parseFloat(rating);

    return (
      <div className={revealCls}
        onClick={() => navigate(`/tools/${tool.slug}`)}
        style={{ cursor:'pointer', position:'relative', animationDelay:`${idx * 0.04}s`,
          ['--card-brd' as any]: accent + '60' }}>

        {/* "TOP PICK" ribbon */}
        <div style={{ position:'absolute', top:0, right:0, zIndex:4,
          background:`linear-gradient(135deg,${C.a2},#ea580c)`,
          color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'0.08em',
          padding:'4px 11px', borderRadius:'0 15px 0 10px',
          boxShadow:`0 2px 8px ${C.a2}50` }}>
          TOP PICK
        </div>

        <div className="tool-card-inner"
          style={{ background:`linear-gradient(160deg,${C.surf} 55%,${accent}0e)`,
            borderRadius:15, border:`2px solid ${accent}48`,
            borderLeft:'3px solid var(--a1)',
            boxShadow:`0 0 0 1px ${accent}14, 0 8px 32px ${accent}18`,
            overflow:'hidden', position:'relative', height:'100%',
            display:'flex', flexDirection:'column' as const }}>

          {/* Top accent bar */}
          <div style={{ height:4, flexShrink:0,
            background:`linear-gradient(90deg,${accent},${accent}55)` }}/>

          <div style={{ padding:'18px 20px 20px', display:'flex',
            flexDirection:'column' as const, flex:1 }}>

            {/* Editor's Pick label */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
              gap:8, marginBottom:14 }}>
              <span style={{ fontSize:10, fontWeight:700, color:'#fff',
                background:C.a1, padding:'2px 8px', borderRadius:100,
                letterSpacing:'0.05em' }}>
                EDITOR'S PICK
              </span>
              {badge && (
                <span style={{ fontSize:10, fontWeight:700, color:badge.color,
                  background:badge.bg, padding:'2px 9px', borderRadius:7,
                  whiteSpace:'nowrap' as const }}>
                  {tool.userBadge}
                </span>
              )}
            </div>

            {/* Logo + name row */}
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <div style={{ width:48, height:48, borderRadius:13, flexShrink:0,
                background:'#fff', border:`2px solid ${accent}28`,
                display:'flex', alignItems:'center', justifyContent:'center',
                overflow:'hidden', boxShadow:`0 3px 14px ${accent}2a` }}>
                <ToolLogo slug={tool.slug} size={36} name={tool.name} color={accent} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800,
                  fontSize:15.5, color:C.txt, letterSpacing:'-0.025em', lineHeight:1.2 }}>
                  {tool.name}
                </div>
                <div style={{ fontSize:11, color:C.mut2, fontWeight:500, marginTop:2 }}>
                  {tool.pricing}
                </div>
                {tool.researchSources?.trustpilot?.rating && (
                  <div style={{ fontSize:10, color:C.mut2, marginTop:2 }}>
                    ⭐ {tool.researchSources.trustpilot.rating} · {tool.researchSources.trustpilot.count?.toLocaleString()} Trustpilot reviews
                  </div>
                )}
              </div>
            </div>

            {/* Category + stars row */}
            <div style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between', marginBottom:10 }}>
              <span style={{ fontSize:11, fontWeight:600, color:accent,
                background:`${accent}10`, padding:'3px 9px', borderRadius:7,
                display:'inline-flex', alignItems:'center', gap:5 }}>
                <CatIcon cat={tool.category} size={11} color={accent}/> {tool.category}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="10" height="10" viewBox="0 0 10 10">
                    <polygon points="5,1 6.2,3.8 9,3.8 6.9,5.8 7.6,8.5 5,7 2.4,8.5 3.1,5.8 1,3.8 3.8,3.8"
                      fill={s <= Math.floor(ratingNum) ? accent : 'var(--brd)'}/>
                  </svg>
                ))}
                <span style={{ fontSize:10, color:C.mut2, marginLeft:2, fontWeight:600 }}>
                  {rating}
                </span>
              </div>
            </div>

            {/* Tagline */}
            <p style={{ fontSize:13, color:C.mut, lineHeight:1.65,
              margin:'0 0 12px', fontWeight:400, flex:1 }}>
              {tool.tagline}
            </p>

            {/* Feature pills */}
            {tool.features && (
              <div style={{ display:'flex', flexWrap:'wrap' as const, gap:5, marginBottom:14 }}>
                {tool.features.slice(0, 3).map((f, i) => (
                  <span key={i} style={{ fontSize:11, color:C.mut,
                    background:'var(--chip-bg)', padding:'3px 8px', borderRadius:6,
                    border:'1px solid var(--brd-xs)' }}>{f}</span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
              borderTop:`1px solid var(--brd-sm)`, paddingTop:12, marginTop:'auto' }}>
              <div>
                <span style={{ fontSize:11, color:C.mut2 }}>
                  Best for: {tool.bestFor}
                </span>
                {tool.lastTestedISO && (
                  <div style={{ fontSize:10, fontWeight:700, color:'#0D9488',
                    background:'rgba(13,148,136,.10)', border:'1px solid rgba(13,148,136,.22)',
                    padding:'2px 8px', borderRadius:5,
                    marginTop:5, display:'inline-flex', alignItems:'center', gap:3 }}>
                    ✓ Free plan tested · {fmtTested(tool.lastTestedISO)}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5,
                fontWeight:700, color:'#fff',
                background:'#E8580A',
                padding:'7px 14px', borderRadius:9,
                boxShadow:'0 3px 10px rgba(232,88,10,.44)' }}>
                Try free <ExternalLink size={11}/>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--mut2)', marginTop: 4 }}>
              By Navneet Arya · Verified {tool.lastTestedISO ? fmtTested(tool.lastTestedISO) : 'May 2026'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD & SECONDARY tiers ────────────────────────────────────────────
  // Secondary = no userBadge, not affiliate → slightly receded visual weight
  return (
    <div className={revealCls}
      onClick={() => navigate(`/tools/${tool.slug}`)}
      style={{ cursor:'pointer', position:'relative',
        ['--card-brd' as any]: cardBrd,
        animationDelay:`${idx * 0.04}s`,
        opacity: isSecondary ? 0.88 : 1 }}>

      <div className="tool-card-inner"
        style={{ background:C.surf, borderRadius:15,
          border: isSecondary
            ? `1px solid var(--brd-xs)`
            : `1.5px solid var(--brd-xs)`,
          padding: isSecondary ? '17px 19px' : '20px 22px',
          overflow:'hidden', position:'relative',
          boxShadow: isSecondary ? 'none' : '0 1px 4px var(--sh-xs)' }}>

        {/* Accent top bar — thinner on secondary */}
        <div style={{ position:'absolute', top:0, left:0, right:0,
          height: isSecondary ? 2 : 3,
          background:`linear-gradient(90deg,${accent}${isSecondary?'50':'80'},${accent}${isSecondary?'10':'18'})`,
          borderRadius:'14px 14px 0 0' }}/>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between',
          alignItems:'flex-start', marginBottom:10, marginTop:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width: isSecondary ? 40 : 46,
              height: isSecondary ? 40 : 46,
              borderRadius:13, flexShrink:0,
              background:'#fff', border:`1.5px solid ${accent}2e`,
              display:'flex', alignItems:'center', justifyContent:'center',
              overflow:'hidden', boxShadow:`0 1px 6px ${accent}22` }}>
              <ToolLogo slug={tool.slug} size={isSecondary ? 30 : 36}
                name={tool.name} color={accent} />
            </div>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:800,
                fontSize: isSecondary ? 14 : 15, color:C.txt,
                letterSpacing:'-0.02em', lineHeight:1.2 }}>
                {tool.name}
              </div>
              <div style={{ fontSize:11, color:C.mut2, marginTop:3, fontWeight:500 }}>
                {tool.pricing}
              </div>
              {tool.researchSources?.trustpilot?.rating && (
                <div style={{ fontSize:10, color:C.mut2, marginTop:2 }}>
                  ⭐ {tool.researchSources.trustpilot.rating} · {tool.researchSources.trustpilot.count?.toLocaleString()} Trustpilot reviews
                </div>
              )}
            </div>
          </div>
          {badge && !isSecondary && (
            <span style={{ fontSize:10, fontWeight:700, color:badge.color,
              background:badge.bg, padding:'3px 9px', borderRadius:8,
              whiteSpace:'nowrap' as const, flexShrink:0 }}>
              {tool.userBadge}
            </span>
          )}
        </div>

        {/* Category chip + T3.5 Star Rating */}
        <div style={{ marginBottom:9, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:11, fontWeight:600, color:accent,
            background:`${accent}10`, padding:'3px 9px', borderRadius:7,
            display:'inline-flex', alignItems:'center', gap:5 }}>
            <CatIcon cat={tool.category} size={11} color={accent}/> {tool.category}
          </span>
          {(() => {
            const r = getCardRating(tool);
            if (!r) return null;
            const rn = parseFloat(r);
            return (
              <div style={{ display:'flex', alignItems:'center', gap:2 }}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="10" height="10" viewBox="0 0 10 10">
                    <polygon points="5,1 6.2,3.8 9,3.8 6.9,5.8 7.6,8.5 5,7 2.4,8.5 3.1,5.8 1,3.8 3.8,3.8"
                      fill={s <= Math.floor(rn) ? accent : 'var(--brd)'}/>
                  </svg>
                ))}
                <span style={{ fontSize:10, color:C.mut2, marginLeft:2, fontWeight:600 }}>{r}</span>
              </div>
            );
          })()}
        </div>

        {/* Tagline */}
        <p style={{ fontSize: isSecondary ? 12.5 : 13, color:C.mut,
          lineHeight:1.62, margin:'0 0 11px', fontWeight:400 }}>
          {tool.tagline}
        </p>

        {/* Feature pills */}
        {tool.features && !isSecondary && (
          <div style={{ display:'flex', flexWrap:'wrap' as const, gap:5, marginBottom:14 }}>
            {tool.features.slice(0, 3).map((f, i) => (
              <span key={i} style={{ fontSize:11, color:C.mut,
                background:'var(--chip-bg)', padding:'3px 8px', borderRadius:6,
                border:'1px solid var(--brd-xs)' }}>{f}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          borderTop:`1px solid var(--brd-sm)`, paddingTop:12 }}>
          <div>
            <span style={{ fontSize:11.5, color:C.mut2 }}>Best for: {tool.bestFor}</span>
            {tool.lastTestedISO && (
              <div style={{ fontSize:10, fontWeight:700, color:'#0D9488',
                background:'rgba(13,148,136,.10)', border:'1px solid rgba(13,148,136,.22)',
                padding:'2px 8px', borderRadius:5,
                marginTop:5, display:'inline-flex', alignItems:'center', gap:3 }}>
                ✓ Free plan tested · {fmtTested(tool.lastTestedISO)}
              </div>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12,
            fontWeight: isSecondary ? 500 : 600,
            color: isSecondary ? C.mut2 : accent }}>
            Read review <ArrowRight size={12}/>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--mut2)', marginTop: 4 }}>
          By Navneet Arya · Verified {tool.lastTestedISO ? fmtTested(tool.lastTestedISO) : 'May 2026'}
        </div>
      </div>
    </div>
  );
}
