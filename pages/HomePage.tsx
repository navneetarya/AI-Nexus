import React, { useState, useMemo, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import {
  Search, ArrowRight, Mail, Star, Shield,
  ExternalLink, X, Menu, ChevronRight,
  Zap, Clock, Award, BookOpen, BarChart2,
  PenLine, Image as ImageIcon, Video as VideoIcon,
  Mic, Megaphone, Palette, Code2, Scale, Sun, Moon, Calendar, Linkedin,
} from 'lucide-react';
import { COMPARE_ARTICLES } from './CompareArticlePage';
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
const TOOL_DOMAIN: Record<string, string> = {
  'grammarly':'grammarly.com','writesonic':'writesonic.com','rytr':'rytr.me',
  'quillbot':'quillbot.com','frase':'frase.io','leonardo-ai':'leonardo.ai',
  'photoroom':'photoroom.com','looka':'looka.com','pictory':'pictory.ai',
  'opus-clip':'opus.pro','invideo':'invideo.ai','murf-ai':'murf.ai',
  'podcastle':'podcastle.ai','gamma':'gamma.app','beautiful-ai':'beautiful.ai',
  'ocoya':'ocoya.com','replit':'replit.com','notion-ai':'notion.so','taskade':'taskade.com',
};

function ToolLogo({ slug, size = 28, name, color }: { slug: string; size?: number; name?: string; color?: string }) {
  const [localErr, setLocalErr] = React.useState(false);
  const [clearbitErr, setClearbitErr] = React.useState(false);
  const domain = TOOL_DOMAIN[slug];
  const initial = (name ?? slug)[0].toUpperCase();
  const r = Math.round(size * 0.27);
  // Try local logo first (/public/logos/{slug}.png), then Clearbit, then letter avatar
  if (!localErr) {
    return (
      <img src={`/logos/${slug}.png`} alt={name ?? slug}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setLocalErr(true)}
      />
    );
  }
  if (domain && !clearbitErr) {
    return (
      <img src={`https://logo.clearbit.com/${domain}`} alt={name ?? slug}
        width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setClearbitErr(true)}
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
  'podcastle-vs-descript':        'Audio',
  'ocoya-vs-buffer-vs-hootsuite': 'Marketing',
  'grammarly-vs-quillbot':        'Writing',
  'leonardo-vs-midjourney':       'Image',
  'replit-vs-github-copilot':     'Coding',
  'taskade-vs-notion':            'Productivity',
};

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

@media(max-width:680px){
  .hero-float { display:none !important }
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

  // ── Memos — MUST come before any useEffect that references them ─────────
  const filtered = useMemo(() => TOOLS.filter(t => {
    const q  = filters.search.toLowerCase();
    const ms = !q || t.name.toLowerCase().includes(q)
                  || t.tagline.toLowerCase().includes(q)
                  || t.category.toLowerCase().includes(q);
    const mc = (filters.category as string) === 'All' || t.category === filters.category;
    return ms && mc;
  }), [filters]);

  const affiliatePicks = useMemo(
    () => TOOLS.filter(t => AFFILIATE_SLUGS.includes(t.slug)),
    []
  );

  // ── Scroll-reveal (IntersectionObserver) ────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    const io  = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.07, rootMargin: '0px 0px -36px 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [filtered, view]);

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
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16,
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
              Honest AI tool reviews. Every tool personally tested.
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>TOOLS</div>
            {['Writing','Audio','Video','Image','Coding','Productivity','Marketing','Design'].map(cat => (
              <button key={cat}
                onClick={() => { setView('home'); setFilters({ search:'', category:cat as any });
                  window.scrollTo(0,0); setTimeout(() => scrollToId('tools-section'), 80); }}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'DM Sans',sans-serif", background:'none', border:'none',
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>COMPARE</div>
            {COMPARE_ARTICLES.map(a => (
              <button key={a.slug} onClick={() => navigate(`/compare/${a.slug}`)}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'DM Sans',sans-serif", background:'none', border:'none',
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11,
              color:'rgba(255,255,255,.35)', marginBottom:12, letterSpacing:'0.1em' }}>SITE</div>
            {[
              { label:'Home',                fn: goHome },
              { label:'About the reviewer',  fn: () => navigate('/about') },
              { label:'How I review tools',  fn: () => navigate('/methodology') },
              { label:'Affiliate disclosure', fn: () => navigate('/disclosure') },
              { label:'Compare tools',        fn: goCompare },
            ].map(({ label, fn }) => (
              <button key={label} onClick={fn}
                style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.4)',
                  fontFamily:"'DM Sans',sans-serif", background:'none', border:'none',
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
        fontFamily:"'DM Sans',sans-serif", color:C.txt }}>
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

            <h1 className="anim-fade-up d2"
              style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize:'clamp(28px,5vw,44px)', color:C.txt,
                margin:'0 0 14px', letterSpacing:'-0.03em', lineHeight:1.1 }}>
              Tool comparisons
            </h1>
            <p className="anim-fade-up d3"
              style={{ fontSize:16, color:C.mut, lineHeight:1.7, margin:0, maxWidth:520 }}>
              Can't decide between two tools? These in-depth, personally tested breakdowns
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
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
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
      fontFamily:"'DM Sans',sans-serif", color:C.txt }}>
      <style>{ANIM_STYLE}</style>
      <Nav/>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.surf,
        borderBottom:`1px solid ${C.barBrd}`, padding:'68px 24px 60px' }}>

        {/* Background washes */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 80% 55% at 65% -5%, rgba(13,148,136,.07) 0%, transparent 70%)` }}/>
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:`radial-gradient(ellipse 45% 45% at -5% 105%, rgba(249,115,22,.05) 0%, transparent 65%)` }}/>

        {/* ── Floating animated tool cards ─────────────────────────────── */}
        {/* Right cluster */}
        {([
          { slug:'grammarly', rating:'4.8', badge:'Writing',    anim:'floatA', delay:'0.3s', dur:'5.8s', top:18,  right:32 },
          { slug:'podcastle', rating:'4.7', badge:'Audio',      anim:'floatB', delay:'0.5s', dur:'6.4s', top:108, right:52 },
          { slug:'taskade',   rating:'4.6', badge:'Productivity',anim:'floatC', delay:'0.8s', dur:'7.1s', top:196, right:24 },
        ] as const).map(({ slug, rating, badge, anim, delay, dur, top, right }) => {
          const t = TOOLS.find(x => x.slug === slug);
          const ac = CAT_ACCENT[t?.category ?? 'Writing'] === 'a2' ? C.a2 : C.a1;
          return (
            <div key={slug} className="hero-float" style={{ position:'absolute', top, right,
              pointerEvents:'none',
              animation:`fadeIn .7s ease ${delay} both, ${anim} ${dur} ease-in-out ${delay} infinite` }}>
              <div style={{ background:C.surf, border:`1.5px solid ${C.a1brd}`,
                borderRadius:14, padding:'10px 14px', minWidth:160,
                boxShadow:'0 6px 28px rgba(13,148,136,.13), 0 1px 4px rgba(0,0,0,.10)',
                backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'#fff',
                    border:`1.5px solid ${ac}28`, display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    <ToolLogo slug={slug} size={20} name={t?.name} color={ac} />
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                      fontSize:12.5, color:C.txt, lineHeight:1.2 }}>{t?.name ?? slug}</div>
                    <div style={{ fontSize:10, color:ac, fontWeight:600,
                      background:`${ac}12`, padding:'1px 6px', borderRadius:4,
                      display:'inline-block', marginTop:1 }}>{badge}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="10" height="10" viewBox="0 0 10 10">
                      <polygon points="5,1 6.2,3.8 9,3.8 6.9,5.8 7.6,8.5 5,7 2.4,8.5 3.1,5.8 1,3.8 3.8,3.8"
                        fill={s <= Math.floor(parseFloat(rating)) ? ac : 'var(--brd)'}/>
                    </svg>
                  ))}
                  <span style={{ fontSize:10, fontWeight:700, color:C.mut, marginLeft:3 }}>{rating}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Left cluster */}
        {([
          { slug:'rytr',   rating:'4.5', badge:'Writing', anim:'floatD', delay:'0.4s', dur:'6.2s', bottom:80, left:28 },
          { slug:'ocoya',  rating:'4.6', badge:'Marketing',anim:'floatB', delay:'0.7s', dur:'5.5s', bottom:10, left:58 },
        ] as const).map(({ slug, rating, badge, anim, delay, dur, bottom, left }) => {
          const t = TOOLS.find(x => x.slug === slug);
          const ac = CAT_ACCENT[t?.category ?? 'Marketing'] === 'a2' ? C.a2 : C.a1;
          return (
            <div key={slug} className="hero-float" style={{ position:'absolute', bottom, left,
              pointerEvents:'none',
              animation:`fadeIn .7s ease ${delay} both, ${anim} ${dur} ease-in-out ${delay} infinite` }}>
              <div style={{ background:C.surf, border:`1.5px solid ${C.a2brd}`,
                borderRadius:14, padding:'10px 14px', minWidth:148,
                boxShadow:'0 6px 28px rgba(249,115,22,.10), 0 1px 4px rgba(0,0,0,.10)',
                backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:'#fff',
                    border:`1.5px solid ${ac}28`, display:'flex', alignItems:'center',
                    justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                    <ToolLogo slug={slug} size={20} name={t?.name} color={ac} />
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
                      fontSize:12.5, color:C.txt, lineHeight:1.2 }}>{t?.name ?? slug}</div>
                    <div style={{ fontSize:10, color:ac, fontWeight:600,
                      background:`${ac}12`, padding:'1px 6px', borderRadius:4,
                      display:'inline-block', marginTop:1 }}>{badge}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} width="10" height="10" viewBox="0 0 10 10">
                      <polygon points="5,1 6.2,3.8 9,3.8 6.9,5.8 7.6,8.5 5,7 2.4,8.5 3.1,5.8 1,3.8 3.8,3.8"
                        fill={s <= Math.floor(parseFloat(rating)) ? ac : 'var(--brd)'}/>
                    </svg>
                  ))}
                  <span style={{ fontSize:10, fontWeight:700, color:C.mut, marginLeft:3 }}>{rating}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Hero content */}
        <div style={{ maxWidth:600, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>

          {/* Trust pill */}
          <button className="anim-fade-up d1"
            onClick={() => navigate('/methodology')}
            style={{ display:'inline-flex', alignItems:'center', gap:7,
              background:C.a1card, border:`1px solid ${C.a1brd}`,
              borderRadius:100, padding:'5px 14px 5px 7px', marginBottom:24,
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ width:19, height:19, borderRadius:'50%', background:C.a1,
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={10} color="#fff"/>
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:C.a1 }}>
              Every tool personally tested — no sponsored posts
            </span>
          </button>

          {/* Week 1 Task 7: H1 targets "best AI tools for creators" — 12,000/mo keyword */}
          <h1 className="anim-fade-up d2"
            style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
              fontSize:'clamp(32px,6vw,54px)', lineHeight:1.07, color:C.txt,
              margin:'0 0 16px', letterSpacing:'-0.035em' }}>
            Best AI Tools for Creators —<br/>
            <span style={{ color:C.a1 }}>Personally Tested & Ranked.</span>
          </h1>

          {/* Week 4 Task 4: Social proof strip — 20+ Tools · 7 Comparisons · Free Trial Links */}
          <div className="anim-fade-up d2" style={{
            display:'flex', gap:'clamp(12px,3vw,28px)', justifyContent:'center',
            flexWrap:'wrap' as const, margin:'0 auto 20px', maxWidth:520,
          }}>
            {[
              { num:'20+',  label:'Tools Tested' },
              { num:'7',    label:'Head-to-Head Comparisons' },
              { num:'100%', label:'Free Trial Links' },
            ].map(({ num, label }) => (
              <div key={label} style={{
                display:'flex', alignItems:'center', gap:8,
                background:C.a1card, border:`1px solid ${C.a1brd}`,
                borderRadius:100, padding:'6px 14px',
              }}>
                <span style={{
                  fontFamily:"'Syne',sans-serif", fontWeight:800,
                  fontSize:15, color:C.a1, lineHeight:1,
                }}>{num}</span>
                <span style={{ fontSize:12, color:C.mut, fontWeight:500 }}>{label}</span>
              </div>
            ))}
          </div>

          <p className="anim-fade-up d3"
            style={{ fontSize:16.5, lineHeight:1.72, color:C.mut, margin:'0 0 8px',
              maxWidth:480, marginLeft:'auto', marginRight:'auto' }}>
            I'm <strong style={{ color:C.txt, fontWeight:600 }}>{SITE_CONFIG.authorName}</strong> — I
            personally sign up for, test, and use every tool before recommending it.
            Every link is a <strong style={{ color:C.txt, fontWeight:600 }}>free trial</strong>.
          </p>

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
                fontFamily:"'DM Sans',sans-serif", background:C.surf, color:C.txt,
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
                  fontFamily:"'DM Sans',sans-serif",
                  display:'inline-flex', alignItems:'center', gap:5 }}>
                <CatIcon cat={cat} size={12} color={C.mut} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Teal trust bar ─────────────────────────────────────────────── */}
      <div style={{ background:`linear-gradient(90deg,#0b7a6e,${C.a1})`, padding:'12px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex',
          justifyContent:'center', gap:'clamp(18px,4vw,48px)', flexWrap:'wrap' as const }}>
          {[
            { icon:<Award size={13}/>,  text:`${TOOLS.length}+ tools reviewed` },
            { icon:<Clock size={13}/>,  text:'2+ years of testing' },
            { icon:<Shield size={13}/>, text:'No sponsored content' },
            { icon:<Zap size={13}/>,    text:'Every link = free trial' },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7,
              color:'rgba(255,255,255,.88)', fontSize:12.5, fontWeight:500 }}>
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Ticker ─────────────────────────────────────────────────────── */}
      <div style={{ overflow:'hidden', borderBottom:`1px solid ${C.barBrd}`,
        background:C.surf, padding:'10px 0' }}>
        <div className="ticker-track">
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <span key={i} style={{ fontSize:11.5, fontWeight:500, color:C.mut2,
              padding:'0 18px', whiteSpace:'nowrap' as const,
              display:'inline-flex', alignItems:'center', gap:6,
              borderRight:`1px solid var(--brd-sm)` }}>
              <ToolLogo slug={t.slug} size={16} name={t.name} color={t.color} /> {t.name}
            </span>
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
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                  fontSize:14.5, color:C.txt }}>Editor's top picks</span>
                <span style={{ fontSize:11.5, color:C.mut2, marginLeft:9 }}>
                  Tools I actively use
                </span>
              </div>
            </div>
            <button onClick={goCompare}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5,
                fontWeight:600, color:C.a1, padding:'7px 14px', borderRadius:9,
                background:C.a1card, border:`1px solid ${C.a1brd}`,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
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
                    fontFamily:"'DM Sans',sans-serif",
                    boxShadow:'0 1px 4px var(--sh-xs)' }}>
                  <div style={{ width:40, height:40, borderRadius:11, flexShrink:0,
                    background:'#fff', border:`1.5px solid ${brd}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    overflow:'hidden', boxShadow:`0 2px 8px ${accent}30` }}>
                    <ToolLogo slug={tool.slug} size={30} name={tool.name} color={accent} />
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700,
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

      {/* ── Tool Grid ──────────────────────────────────────────────────── */}
      <div id="tools-section" style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px 96px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:20, flexWrap:'wrap' as const, gap:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19,
            color:C.txt, letterSpacing:'-0.025em' }}>
            {(filters.category as string) === 'All' ? 'All AI tools' : `${filters.category} tools`}
          </div>
          {(filters.category as string) !== 'All' && (
            <button onClick={() => setFilters(f => ({ ...f, category:'All' as any }))}
              style={{ fontSize:12, color:C.a1, border:`1px solid ${C.a1brd}`, borderRadius:8,
                padding:'6px 14px', background:C.a1card, cursor:'pointer',
                fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>
              ← All tools
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' as const, marginBottom:26 }}>
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
                  fontWeight:active?700:500, fontFamily:"'DM Sans',sans-serif",
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

        {/* Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} navigate={navigate}
              isAffiliatePick={AFFILIATE_SLUGS.includes(tool.slug)} idx={i}/>
          ))}
        </div>

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
                fontFamily:"'DM Sans',sans-serif", background:C.a1card, cursor:'pointer' }}>
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── Newsletter strip — bottom of page ────────────────────────── */}
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
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16,
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

function ToolCard({ tool, navigate, isAffiliatePick, idx }: {
  tool: Tool; navigate: (to: string) => void; isAffiliatePick: boolean; idx: number; key?: React.Key;
}) {
  const isA2    = CAT_ACCENT[tool.category] === 'a2';
  const accent  = isA2 ? C.a2 : C.a1;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;
  const badge   = tool.userBadge ? BADGE_COLORS[tool.userBadge] : null;
  const isSecondary = !isAffiliatePick && !tool.userBadge;

  // ── FEATURED tier ─────────────────────────────────────────────────────────
  if (isAffiliatePick) {
    const rating = FEATURED_RATINGS[tool.slug] ?? '4.5';
    const ratingNum = parseFloat(rating);

    return (
      <div className="tool-card-wrap scroll-reveal"
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
              <span style={{ fontSize:10, fontWeight:700, color:accent,
                letterSpacing:'0.07em', textTransform:'uppercase' as const }}>
                ✦ Editor's Pick
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
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                  fontSize:15.5, color:C.txt, letterSpacing:'-0.025em', lineHeight:1.2 }}>
                  {tool.name}
                </div>
                <div style={{ fontSize:11, color:C.mut2, fontWeight:500, marginTop:2 }}>
                  {tool.pricing}
                </div>
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
              <span style={{ fontSize:11, color:C.mut2 }}>
                Best for: {tool.bestFor}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12.5,
                fontWeight:700, color:'#fff',
                background:`linear-gradient(135deg,${accent},${isA2?'#ea580c':'#0b7a6e'})`,
                padding:'7px 14px', borderRadius:9,
                boxShadow:`0 3px 10px ${accent}44` }}>
                Try free <ExternalLink size={11}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── STANDARD & SECONDARY tiers ────────────────────────────────────────────
  // Secondary = no userBadge, not affiliate → slightly receded visual weight
  return (
    <div className="tool-card-wrap scroll-reveal"
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
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800,
                fontSize: isSecondary ? 14 : 15, color:C.txt,
                letterSpacing:'-0.02em', lineHeight:1.2 }}>
                {tool.name}
              </div>
              <div style={{ fontSize:11, color:C.mut2, marginTop:3, fontWeight:500 }}>
                {tool.pricing}
              </div>
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

        {/* Category chip */}
        <div style={{ marginBottom:9 }}>
          <span style={{ fontSize:11, fontWeight:600, color:accent,
            background:`${accent}10`, padding:'3px 9px', borderRadius:7,
            display:'inline-flex', alignItems:'center', gap:5 }}>
            <CatIcon cat={tool.category} size={11} color={accent}/> {tool.category}
          </span>
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
          <span style={{ fontSize:11.5, color:C.mut2 }}>Best for: {tool.bestFor}</span>
          <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12,
            fontWeight: isSecondary ? 500 : 600,
            color: isSecondary ? C.mut2 : accent }}>
            Read review <ArrowRight size={12}/>
          </div>
        </div>
      </div>
    </div>
  );
}
