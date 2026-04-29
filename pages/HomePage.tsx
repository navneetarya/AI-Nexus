import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { Category, FilterState, Tool } from '../types';
import { Search, ArrowRight, Mail, Star, Shield, ExternalLink, X, Menu, ChevronRight, Zap, Clock, Award } from 'lucide-react';
import { COMPARE_ARTICLES } from './CompareArticlePage';

// ── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:     '#F0F5F4',
  surf:   '#FFFFFF',
  a1:     '#0D9488',
  a2:     '#F97316',
  txt:    '#0F1C1A',
  mut:    'rgba(15,28,26,.60)',
  mut2:   'rgba(15,28,26,.36)',
  a1card: 'rgba(13,148,136,.08)',
  a1brd:  'rgba(13,148,136,.22)',
  a2card: 'rgba(249,115,22,.08)',
  a2brd:  'rgba(249,115,22,.22)',
  barBg:  'rgba(240,245,244,.96)',
  barBrd: 'rgba(13,148,136,.15)',
  dark:   '#0A1512',
};

// ── Per-tool emoji icons (replaces letter icons) ───────────────────────────
const TOOL_EMOJI: Record<string, string> = {
  'grammarly':     '✅',
  'writesonic':    '📝',
  'rytr':          '✍️',
  'quillbot':      '🔄',
  'frase':         '🔍',
  'leonardo-ai':   '🎨',
  'photoroom':     '📸',
  'looka':         '💎',
  'pictory':       '🎬',
  'opus-clip':     '✂️',
  'invideo':       '🎥',
  'murf-ai':       '🎙️',
  'podcastle':     '🎧',
  'gamma':         '✨',
  'beautiful-ai':  '🖼️',
  'ocoya':         '📱',
  'replit':        '💻',
  'notion-ai':     '📓',
  'taskade':       '⚡',
};

const CAT_EMOJI: Record<string, string> = {
  Writing: '✍️', Image: '🎨', Video: '🎬', Audio: '🎙️',
  Marketing: '📱', Design: '✨', Coding: '💻', Productivity: '⚡',
};

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

// ── Keyframe style injection ───────────────────────────────────────────────
const ANIM_STYLE = `
@keyframes fadeUp {
  from { opacity:0; transform:translateY(22px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes slideDown {
  from { opacity:0; transform:translateY(-10px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes scaleIn {
  from { opacity:0; transform:scale(0.94); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes ticker {
  0%   { transform:translateX(0); }
  100% { transform:translateX(-50%); }
}
.anim-fade-up   { animation:fadeUp  .55s cubic-bezier(.22,1,.36,1) both; }
.anim-fade-in   { animation:fadeIn  .5s ease both; }
.anim-scale-in  { animation:scaleIn .45s cubic-bezier(.22,1,.36,1) both; }
.anim-slide-down{ animation:slideDown .35s ease both; }
.d1  { animation-delay:.05s }  .d2  { animation-delay:.1s }
.d3  { animation-delay:.15s }  .d4  { animation-delay:.2s }
.d5  { animation-delay:.25s }  .d6  { animation-delay:.3s }
.d7  { animation-delay:.35s }  .d8  { animation-delay:.4s }

.tool-card-wrap:hover .tool-card-inner {
  transform:translateY(-3px);
  border-color:var(--card-brd) !important;
  box-shadow:0 12px 40px rgba(15,28,26,.08) !important;
}
.tool-card-inner { transition:transform .18s ease, border-color .18s ease, box-shadow .18s ease; }
.cat-pill { transition:all .15s ease; }
.cat-pill:hover { transform:translateY(-1px); }
.nav-btn { transition:all .15s ease; }
.nav-btn:hover { background:rgba(13,148,136,.08) !important; color:#0D9488 !important; }
.compare-card { transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.compare-card:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(13,148,136,.11) !important; border-color:rgba(13,148,136,.3) !important; }
.ticker-track { display:flex; gap:0; animation:ticker 28s linear infinite; }
.ticker-track:hover { animation-play-state:paused; }
.pick-card { transition:all .15s ease; }
.pick-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(13,148,136,.1) !important; }
`;

interface HomePageProps { navigate: (to: string) => void; }

// ── Main component ─────────────────────────────────────────────────────────
export function HomePage({ navigate }: HomePageProps) {
  const [filters, setFilters]   = useState<FilterState>({ search: '', category: 'All' as any });
  const [mobileNav, setMobileNav] = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = useMemo(() => TOOLS.filter(t => {
    const q = filters.search.toLowerCase();
    const ms = !q || t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    const mc = filters.category === 'All' || t.category === filters.category;
    return ms && mc;
  }), [filters]);

  const affiliatePicks = TOOLS.filter(t => AFFILIATE_SLUGS.includes(t.slug));
  const showHome = filters.search === '' && (filters.category as string) === 'All';

  const scrollTo = (id: string) => {
    setMobileNav(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.txt }}>
      <style>{ANIM_STYLE}</style>

      {/* ── Sticky Nav ──────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 200, background: C.barBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: `1px solid ${C.barBrd}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>

          {/* Logo */}
          <div onClick={() => { setFilters({ search:'', category:'All' as any }); window.scrollTo({top:0,behavior:'smooth'}); }}
            style={{ display:'flex', alignItems:'center', gap:9, cursor:'pointer', flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg, ${C.a1} 0%, #0b7a6e 100%)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 8px rgba(13,148,136,.3)` }}>
              <span style={{ color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12, letterSpacing:'-0.01em' }}>AI</span>
            </div>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:C.txt, letterSpacing:'-0.03em' }}>
              Nexus<span style={{ color:C.a1 }}>.</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div style={{ display:'flex', alignItems:'center', gap:2, '@media(max-width:640px)':{display:'none'} as any }}>
            {[
              { label:'All Tools', action: () => scrollTo('tools-section') },
              { label:'Compare',   action: () => scrollTo('compare-section') },
              { label:'About',     action: () => navigate('/about') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} className="nav-btn"
                style={{ fontSize:14, fontWeight:500, color:C.mut, padding:'7px 13px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {label}
              </button>
            ))}
            <a href={`mailto:${SITE_CONFIG.email}`}
              style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#fff', padding:'8px 18px', borderRadius:9, background:`linear-gradient(135deg, ${C.a1}, #0b7a6e)`, textDecoration:'none', marginLeft:6, boxShadow:`0 2px 8px rgba(13,148,136,.28)` }}>
              <Mail size={13}/> Contact
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileNav(v => !v)}
            style={{ display:'none', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:9, border:`1.5px solid ${C.a1brd}`, background:C.a1card, cursor:'pointer',
              // show on mobile via inline media — we handle via JS
            }}
            id="hamburger-btn"
            aria-label="Menu">
            {mobileNav ? <X size={18} color={C.a1}/> : <Menu size={18} color={C.a1}/>}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileNav && (
          <div className="anim-slide-down"
            style={{ background:C.surf, borderTop:`1px solid ${C.barBrd}`, padding:'12px 20px 20px' }}>
            {[
              { label:'🔧 All Tools',     action: () => scrollTo('tools-section') },
              { label:'⚖️ Compare',       action: () => scrollTo('compare-section') },
              { label:'👤 About',         action: () => { setMobileNav(false); navigate('/about'); } },
              { label:'📋 Disclosure',    action: () => { setMobileNav(false); navigate('/disclosure'); } },
            ].map(({ label, action }) => (
              <button key={label} onClick={action}
                style={{ display:'block', width:'100%', textAlign:'left' as const, fontSize:15, fontWeight:500, color:C.txt, padding:'13px 14px', borderRadius:10, background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", borderBottom:`1px solid rgba(15,28,26,.06)` }}>
                {label}
              </button>
            ))}
            <a href={`mailto:${SITE_CONFIG.email}`}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14, fontWeight:600, color:'#fff', padding:'13px', borderRadius:10, background:C.a1, textDecoration:'none', marginTop:10 }}>
              <Mail size={14}/> {SITE_CONFIG.email}
            </a>
          </div>
        )}
      </nav>

      {/* Mobile nav show/hide via script */}
      <style>{`
        @media(max-width:680px){
          #hamburger-btn { display:flex !important; }
        }
        @media(min-width:681px){
          #hamburger-btn { display:none !important; }
        }
      `}</style>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{ position:'relative', overflow:'hidden', background:C.surf, borderBottom:`1px solid ${C.barBrd}`, padding:'72px 24px 64px' }}>

        {/* Subtle teal wash */}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 80% 60% at 60% -10%, rgba(13,148,136,.07) 0%, transparent 70%)`, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse 50% 50% at -5% 110%, rgba(249,115,22,.05) 0%, transparent 60%)`, pointerEvents:'none' }}/>

        {/* Floating mini tool cards — the distinctive hero element */}
        <div style={{ position:'absolute', top:20, right:'max(20px, calc(50% - 560px))', display:'flex', flexDirection:'column', gap:8, opacity:0.7, pointerEvents:'none' }}>
          {['✅ Grammarly', '🎧 Podcastle', '⚡ Taskade'].map((t, i) => (
            <div key={i} style={{ background:C.surf, border:`1px solid ${C.a1brd}`, borderRadius:10, padding:'7px 13px', fontSize:12, fontWeight:600, color:C.txt, boxShadow:'0 2px 10px rgba(15,28,26,.06)', animation:`fadeIn .6s ease ${.4+i*.12}s both`, whiteSpace:'nowrap' as const }}>
              {t}
            </div>
          ))}
        </div>
        <div style={{ position:'absolute', bottom:24, left:'max(20px, calc(50% - 560px))', display:'flex', flexDirection:'column', gap:8, opacity:0.65, pointerEvents:'none' }}>
          {['💻 Replit', '📱 Ocoya', '✍️ Rytr'].map((t, i) => (
            <div key={i} style={{ background:C.surf, border:`1px solid ${C.a2brd}`, borderRadius:10, padding:'7px 13px', fontSize:12, fontWeight:600, color:C.txt, boxShadow:'0 2px 10px rgba(15,28,26,.06)', animation:`fadeIn .6s ease ${.5+i*.12}s both`, whiteSpace:'nowrap' as const }}>
              {t}
            </div>
          ))}
        </div>

        <div style={{ maxWidth:620, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 }}>

          {/* Trust pill */}
          <div className="anim-fade-up d1"
            style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.a1card, border:`1px solid ${C.a1brd}`, borderRadius:100, padding:'5px 14px 5px 7px', marginBottom:26 }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:C.a1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={11} color="#fff"/>
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:C.a1 }}>Every tool personally tested — no sponsored posts</span>
          </div>

          <h1 className="anim-fade-up d2"
            style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:'clamp(34px,6vw,56px)', lineHeight:1.06, color:C.txt, margin:'0 0 18px', letterSpacing:'-0.035em' }}>
            The best AI tools,<br/>
            <span style={{ color:C.a1 }}>honestly reviewed.</span>
          </h1>

          <p className="anim-fade-up d3"
            style={{ fontSize:17, lineHeight:1.72, color:C.mut, margin:'0 0 8px', maxWidth:500, marginLeft:'auto', marginRight:'auto' }}>
            I'm <strong style={{ color:C.txt, fontWeight:600 }}>{SITE_CONFIG.authorName}</strong> — I personally sign up for, test, and use every tool before recommending it. Every link is a <strong style={{ color:C.txt, fontWeight:600 }}>free trial</strong>.
          </p>
          <p className="anim-fade-up d3"
            style={{ fontSize:12, color:C.mut2, margin:'0 0 34px' }}>
            Affiliate links — I earn a small commission if you upgrade, at no cost to you.{' '}
            <a href="/disclosure" onClick={e=>{ e.preventDefault(); navigate('/disclosure'); }} style={{ color:C.a1, fontWeight:500 }}>Full disclosure</a>
          </p>

          {/* Search */}
          <div className="anim-scale-in d4" style={{ position:'relative', maxWidth:460, margin:'0 auto 18px' }}>
            <Search size={15} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:C.mut2, pointerEvents:'none' as const }}/>
            <input type="text"
              placeholder="Search tools — writing, podcast, video, code..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search:e.target.value }))}
              style={{ width:'100%', paddingLeft:44, paddingRight:16, height:50, border:`1.5px solid ${C.a1brd}`, borderRadius:13, fontSize:14.5, outline:'none', boxSizing:'border-box' as const, fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.surf, color:C.txt, boxShadow:`0 4px 20px rgba(13,148,136,.1)` }}
              onFocus={e=>(e.target.style.borderColor=C.a1)}
              onBlur={e=>(e.target.style.borderColor=C.a1brd)}
            />
          </div>

          {/* Category quick pills */}
          <div className="anim-fade-up d5"
            style={{ display:'flex', gap:7, justifyContent:'center', flexWrap:'wrap' as const }}>
            {[
              {label:'✍️ Writing',cat:'Writing'},
              {label:'🎙️ Audio',  cat:'Audio'},
              {label:'📱 Social', cat:'Marketing'},
              {label:'💻 Code',   cat:'Coding'},
              {label:'⚡ Productivity',cat:'Productivity'},
              {label:'🎬 Video',  cat:'Video'},
            ].map(({ label, cat }) => (
              <button key={cat} className="cat-pill"
                onClick={() => { setFilters({ search:'', category:cat as any }); scrollTo('tools-section'); }}
                style={{ fontSize:13, fontWeight:500, color:C.mut, padding:'6px 13px', borderRadius:100, background:'transparent', border:`1px solid rgba(15,28,26,.14)`, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Teal stats trust bar ────────────────────────────────────────── */}
      <div style={{ background:`linear-gradient(90deg, #0b7a6e 0%, ${C.a1} 100%)`, padding:'13px 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'center', gap:'clamp(20px,4vw,48px)', flexWrap:'wrap' as const }}>
          {[
            { icon:<Award size={14}/>,  text:`${TOOLS.length}+ tools reviewed` },
            { icon:<Clock size={14}/>,  text:'2+ years of testing' },
            { icon:<Shield size={14}/>, text:'No sponsored content ever' },
            { icon:<Zap size={14}/>,    text:'Every link = free trial' },
          ].map(({ icon, text }, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:7, color:'rgba(255,255,255,.9)', fontSize:13, fontWeight:500 }}>
              {icon} {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrolling tool ticker ───────────────────────────────────────── */}
      <div style={{ overflow:'hidden', borderBottom:`1px solid ${C.barBrd}`, background:C.surf, padding:'11px 0' }}>
        <div className="ticker-track">
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <span key={i} style={{ fontSize:12, fontWeight:500, color:C.mut2, padding:'0 20px', whiteSpace:'nowrap' as const, display:'inline-flex', alignItems:'center', gap:6, borderRight:`1px solid rgba(15,28,26,.07)` }}>
              <span>{TOOL_EMOJI[t.slug] ?? '🤖'}</span> {t.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Value props ─────────────────────────────────────────────────── */}
      <div style={{ background:C.bg, padding:'28px 24px', borderBottom:`1px solid ${C.barBrd}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))', gap:12 }}>
          {[
            { icon:'🔍', title:'Tested on real work', desc:'Every review is based on personal use — not vendor demos or marketing copy. Negatives included.' },
            { icon:'⚖️', title:'Honest comparisons', desc:"Can't pick between two tools? Detailed head-to-head guides with a clear verdict on who each is for." },
            { icon:'🎁', title:'Free trials, always', desc:'Every card links to a free trial or free plan. No paywalls, no affiliate-only paid pages.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ display:'flex', gap:14, padding:'17px 18px', background:C.surf, borderRadius:14, border:`1px solid rgba(15,28,26,.07)`, boxShadow:'0 1px 4px rgba(15,28,26,.04)' }}>
              <span style={{ fontSize:20, flexShrink:0, marginTop:2 }}>{icon}</span>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13.5, color:C.txt, marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:12.5, color:C.mut, lineHeight:1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Editor picks ────────────────────────────────────────────────── */}
      {showHome && (
        <div style={{ background:C.surf, padding:'32px 24px', borderBottom:`1px solid ${C.barBrd}` }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
              <div style={{ width:30, height:30, borderRadius:9, background:C.a2card, border:`1.5px solid ${C.a2brd}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Star size={14} color={C.a2} fill={C.a2}/>
              </div>
              <div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:C.txt }}>Editor's top picks</span>
                <span style={{ fontSize:12, color:C.mut2, marginLeft:10 }}>These are the tools I actively use and earn commission from</span>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:10 }}>
              {affiliatePicks.map((tool, i) => {
                const isA2 = CAT_ACCENT[tool.category] === 'a2';
                const accent = isA2 ? C.a2 : C.a1;
                const bg   = isA2 ? C.a2card : C.a1card;
                const brd  = isA2 ? C.a2brd : C.a1brd;
                const emoji = TOOL_EMOJI[tool.slug] ?? '🤖';
                return (
                  <button key={tool.id} onClick={() => navigate(`/tools/${tool.slug}`)}
                    className="pick-card"
                    style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 14px', borderRadius:13, border:`1.5px solid ${brd}`, background:bg, cursor:'pointer', textAlign:'left' as const, fontFamily:"'Plus Jakarta Sans',sans-serif", boxShadow:'0 1px 4px rgba(15,28,26,.04)', animationDelay:`${i*.06}s` }}>
                    <div style={{ width:40, height:40, borderRadius:11, background:accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0, boxShadow:`0 2px 8px ${accent}44` }}>
                      {emoji}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13.5, color:C.txt, marginBottom:2 }}>{tool.name}</div>
                      <div style={{ fontSize:11, color:accent, fontWeight:600 }}>{tool.pricing}</div>
                    </div>
                    <ChevronRight size={14} color={accent} style={{ marginLeft:'auto', flexShrink:0 }}/>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Comparisons ─────────────────────────────────────────────────── */}
      {showHome && (
        <div id="compare-section" style={{ background:C.bg, padding:'36px 24px', borderBottom:`1px solid ${C.barBrd}` }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:C.txt, letterSpacing:'-0.025em', marginBottom:5 }}>
                Head-to-head comparisons
              </div>
              <div style={{ fontSize:13, color:C.mut2 }}>Honest breakdowns when you can't decide between two tools.</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
              {COMPARE_ARTICLES.map((article, i) => (
                <CompareCard key={article.slug} article={article} navigate={navigate} idx={i}/>
              ))}
              {/* Coming soon card */}
              <div style={{ padding:'26px', borderRadius:16, border:`1.5px dashed rgba(13,148,136,.2)`, background:'transparent', display:'flex', flexDirection:'column' as const, justifyContent:'center', alignItems:'center', textAlign:'center' as const, minHeight:120 }}>
                <span style={{ fontSize:22, marginBottom:8 }}>🔜</span>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:C.mut, marginBottom:5 }}>More coming soon</div>
                <div style={{ fontSize:11.5, color:C.mut2, lineHeight:1.6 }}>Rytr vs Jasper<br/>Podcastle vs Riverside<br/>Taskade vs Notion</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tool grid ───────────────────────────────────────────────────── */}
      <div id="tools-section" style={{ maxWidth:1200, margin:'0 auto', padding:'36px 24px 96px' }}>

        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap' as const, gap:12 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:C.txt, letterSpacing:'-0.025em' }}>
            {(filters.category as string) === 'All' ? 'All AI tools' : `${filters.category} tools`}
          </div>
          {(filters.category as string) !== 'All' && (
            <button onClick={() => setFilters(f => ({ ...f, category:'All' as any }))}
              style={{ fontSize:12, color:C.a1, border:`1px solid ${C.a1brd}`, borderRadius:8, padding:'6px 14px', background:C.a1card, cursor:'pointer', fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>
              ← All tools
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, marginBottom:28 }}>
          {CATEGORIES.map(cat => {
            const active = (filters.category as string) === cat;
            const isA2 = CAT_ACCENT[cat] === 'a2';
            const ac  = isA2 ? C.a2 : C.a1;
            const abg = isA2 ? C.a2card : C.a1card;
            const abrd= isA2 ? C.a2brd : C.a1brd;
            return (
              <button key={cat} className="cat-pill"
                onClick={() => setFilters(f => ({ ...f, category:cat as any }))}
                style={{ padding:'8px 17px', borderRadius:100, fontSize:13, fontWeight:active?700:500, fontFamily:"'Plus Jakarta Sans',sans-serif", border:`1.5px solid ${active ? abrd : 'rgba(15,28,26,.11)'}`, background:active ? abg : C.surf, color:active ? ac : C.mut, cursor:'pointer', boxShadow:active?`0 2px 8px ${ac}22`:'none' }}>
                {cat !== 'All' && CAT_EMOJI[cat] ? `${CAT_EMOJI[cat]} ` : ''}{cat}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize:11, color:C.mut2, marginBottom:22, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' as const }}>
          {filtered.length} tool{filtered.length !== 1 ? 's' : ''}{(filters.category as string) !== 'All' ? ` · ${filters.category}` : ''}{filters.search ? ` matching "${filters.search}"` : ''}
        </p>

        {/* Tool cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:14 }}>
          {filtered.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} navigate={navigate}
              isAffiliatePick={AFFILIATE_SLUGS.includes(tool.slug)}
              idx={i}/>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:40, marginBottom:14 }}>🔍</div>
            <p style={{ fontSize:16, color:C.mut, marginBottom:14 }}>No tools match "{filters.search}"</p>
            <button onClick={() => setFilters({ search:'', category:'All' as any })}
              style={{ color:C.a1, border:`1.5px solid ${C.a1brd}`, borderRadius:9, padding:'9px 22px', fontSize:13, fontWeight:600, fontFamily:"'Plus Jakarta Sans',sans-serif", background:C.a1card, cursor:'pointer' }}>
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ background:C.dark, padding:'52px 24px 28px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Footer grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:36, marginBottom:44 }}>

            {/* Brand col */}
            <div style={{ gridColumn:'span 1' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg, ${C.a1}, #0b7a6e)`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 2px 8px rgba(13,148,136,.35)` }}>
                  <span style={{ color:'#fff', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:12 }}>AI</span>
                </div>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-0.03em' }}>
                  Nexus<span style={{ color:C.a1 }}>.</span>
                </span>
              </div>
              <p style={{ color:'rgba(255,255,255,.42)', fontSize:13, lineHeight:1.7, marginBottom:18, maxWidth:210 }}>
                Honest AI tool reviews. Every tool personally tested before recommending.
              </p>
              <a href={`mailto:${SITE_CONFIG.email}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, color:C.a1, fontSize:13, fontWeight:500, textDecoration:'none' }}>
                <Mail size={13}/> {SITE_CONFIG.email}
              </a>
            </div>

            {/* Tools col */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:14, letterSpacing:'0.1em' }}>TOOLS</div>
              {['Writing','Audio','Video','Image','Coding','Productivity','Marketing','Design'].map(cat => (
                <button key={cat}
                  onClick={() => { setFilters({ search:'', category:cat as any }); window.scrollTo(0,0); scrollTo('tools-section'); }}
                  style={{ display:'block', fontSize:13, color:'rgba(255,255,255,.42)', fontFamily:"'Plus Jakarta Sans',sans-serif", background:'none', border:'none', cursor:'pointer', padding:'4px 0', textAlign:'left' as const, transition:'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color=C.a1)}
                  onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,.42)')}>
                  {CAT_EMOJI[cat]} {cat}
                </button>
              ))}
            </div>

            {/* Compare col */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:14, letterSpacing:'0.1em' }}>COMPARE</div>
              {COMPARE_ARTICLES.map(a => (
                <button key={a.slug}
                  onClick={() => navigate(`/compare/${a.slug}`)}
                  style={{ display:'block', fontSize:12.5, color:'rgba(255,255,255,.42)', fontFamily:"'Plus Jakarta Sans',sans-serif", background:'none', border:'none', cursor:'pointer', padding:'4px 0', textAlign:'left' as const, transition:'color .15s', lineHeight:1.5 }}
                  onMouseEnter={e => (e.currentTarget.style.color=C.a1)}
                  onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,.42)')}>
                  {a.winnerName} vs …
                </button>
              ))}
            </div>

            {/* Site col */}
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:11, color:'rgba(255,255,255,.4)', marginBottom:14, letterSpacing:'0.1em' }}>SITE</div>
              {[
                { label:'Home',                action:() => { setFilters({ search:'',category:'All' as any }); window.scrollTo({top:0,behavior:'smooth'}); } },
                { label:'About the reviewer',  action:() => navigate('/about') },
                { label:'Affiliate disclosure',action:() => navigate('/disclosure') },
              ].map(({ label, action }) => (
                <button key={label} onClick={action}
                  style={{ display:'block', fontSize:13, color:'rgba(255,255,255,.42)', fontFamily:"'Plus Jakarta Sans',sans-serif", background:'none', border:'none', cursor:'pointer', padding:'4px 0', textAlign:'left' as const, transition:'color .15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color=C.a1)}
                  onMouseLeave={e => (e.currentTarget.style.color='rgba(255,255,255,.42)')}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', paddingTop:22, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap' as const, gap:10 }}>
            <p style={{ color:'rgba(255,255,255,.22)', fontSize:12 }}>© {new Date().getFullYear()} AI Nexus · Honest reviews, no gatekeeping.</p>
            <p style={{ color:'rgba(255,255,255,.22)', fontSize:12 }}>Affiliate links help keep all reviews free to read.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ── Compare Card ─────────────────────────────────────────────────────────
function CompareCard({ article, navigate, idx }: { article: any; navigate: (to: string) => void; idx: number }) {
  return (
    <div onClick={() => navigate(`/compare/${article.slug}`)}
      className="compare-card"
      style={{ background:C.surf, borderRadius:16, border:`1.5px solid rgba(15,28,26,.08)`, padding:'22px 24px', cursor:'pointer', boxShadow:'0 1px 4px rgba(15,28,26,.05)' }}>

      <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ width:40, height:40, borderRadius:11, background:C.a1card, border:`1.5px solid ${C.a1brd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>⚖️</div>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:C.txt, lineHeight:1.35 }}>
            {article.title.replace(/ \(\d{4}\):.*/, '').replace(/ \(\d{4}\)/, '')}
          </div>
          <div style={{ fontSize:11, color:C.mut2, marginTop:3 }}>{article.publishDate} · {article.comparisonTable?.length ?? 3} tools compared</div>
        </div>
      </div>

      <p style={{ fontSize:13, color:C.mut, lineHeight:1.58, margin:'0 0 14px' }}>
        {article.metaDescription.length > 112 ? article.metaDescription.slice(0,109)+'…' : article.metaDescription}
      </p>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', borderTop:`1px solid rgba(15,28,26,.07)`, paddingTop:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase' as const, color:C.mut2, letterSpacing:'0.06em' }}>Winner</span>
          <span style={{ fontSize:12, color:C.a1, fontWeight:700, background:C.a1card, padding:'3px 9px', borderRadius:6 }}>{article.winnerName}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:C.a1 }}>
          Read comparison <ArrowRight size={12}/>
        </div>
      </div>
    </div>
  );
}

// ── Tool Card ────────────────────────────────────────────────────────────
function ToolCard({ tool, navigate, isAffiliatePick, idx }: { tool: Tool; navigate: (to: string) => void; isAffiliatePick: boolean; idx: number }) {
  const isA2   = CAT_ACCENT[tool.category] === 'a2';
  const accent  = isA2 ? C.a2 : C.a1;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;
  const badge   = tool.userBadge ? BADGE_COLORS[tool.userBadge] : null;
  const emoji   = TOOL_EMOJI[tool.slug] ?? '🤖';

  return (
    <div className="tool-card-wrap" onClick={() => navigate(`/tools/${tool.slug}`)}
      style={{ cursor:'pointer', position:'relative' as const }}
      style2={{ '--card-brd': cardBrd } as any}>

      {/* Ribbon for top picks */}
      {isAffiliatePick && (
        <div style={{ position:'absolute', top:0, right:0, zIndex:3, background:`linear-gradient(135deg, ${C.a2}, #ea580c)`, color:'#fff', fontSize:9, fontWeight:800, letterSpacing:'0.08em', padding:'4px 11px', borderRadius:'0 14px 0 10px', boxShadow:`0 2px 8px ${C.a2}55` }}>
          TOP PICK
        </div>
      )}

      <div className="tool-card-inner"
        style={{ background:C.surf, borderRadius:15, border:`1.5px solid rgba(15,28,26,.08)`, padding:'20px 22px', boxShadow:'0 1px 4px rgba(15,28,26,.04)', overflow:'hidden', position:'relative' as const }}>

        {/* Accent top bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${accent}88, ${accent}22)`, borderRadius:'14px 14px 0 0' }}/>

        {/* Header row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10, marginTop:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* EMOJI icon — not letter */}
            <div style={{ width:46, height:46, borderRadius:13, background:`${accent}15`, border:`1.5px solid ${accent}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
              {emoji}
            </div>
            <div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:C.txt, letterSpacing:'-0.02em', lineHeight:1.2 }}>{tool.name}</div>
              <div style={{ fontSize:11, color:C.mut2, marginTop:3, fontWeight:500 }}>{tool.pricing}</div>
            </div>
          </div>
          {badge && (
            <span style={{ fontSize:10, fontWeight:700, color:badge.color, background:badge.bg, padding:'3px 9px', borderRadius:8, whiteSpace:'nowrap' as const, flexShrink:0, letterSpacing:'0.02em' }}>
              {tool.userBadge}
            </span>
          )}
        </div>

        {/* Category chip */}
        <div style={{ marginBottom:10 }}>
          <span style={{ fontSize:11, fontWeight:600, color:accent, background:`${accent}12`, padding:'3px 9px', borderRadius:7, letterSpacing:'0.01em' }}>
            {CAT_EMOJI[tool.category]} {tool.category}
          </span>
        </div>

        {/* Tagline */}
        <p style={{ fontSize:13, color:C.mut, lineHeight:1.62, margin:'0 0 11px', fontWeight:400 }}>
          {tool.tagline}
        </p>

        {/* Feature pills */}
        {tool.features && (
          <div style={{ display:'flex', flexWrap:'wrap' as const, gap:5, marginBottom:14 }}>
            {tool.features.slice(0,3).map((f, i) => (
              <span key={i} style={{ fontSize:11, color:C.mut, background:'rgba(15,28,26,.05)', padding:'3px 8px', borderRadius:6, border:'1px solid rgba(15,28,26,.08)', fontWeight:400 }}>{f}</span>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid rgba(15,28,26,.07)`, paddingTop:12 }}>
          <span style={{ fontSize:11.5, color:C.mut2 }}>Best for: {tool.bestFor}</span>
          {/* Upgraded CTA for affiliate picks */}
          {isAffiliatePick
            ? <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, color:'#fff', background:`linear-gradient(135deg, ${accent}, ${isA2?'#ea580c':'#0b7a6e'})`, padding:'5px 12px', borderRadius:8, boxShadow:`0 2px 8px ${accent}44` }}>
                Try free <ExternalLink size={11}/>
              </div>
            : <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:accent }}>
                Read review <ArrowRight size={12}/>
              </div>
          }
        </div>
      </div>
    </div>
  );
}
