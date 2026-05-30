import React, { useState, useRef } from 'react';
import { Mail, Menu, X, Scale, Sun, Moon, ChevronDown, BookOpen } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { COMPARE_ARTICLES } from './compare-data';

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
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
};

// ── Nav-scoped CSS (only the styles this component needs) ─────────────────
const NAV_CSS = `
@keyframes slideDown{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.shared-nav-slide { animation:slideDown .3s ease both }
.shared-nav-btn   { transition:all .15s ease; }
.shared-nav-btn:hover { background:rgba(13,148,136,.08)!important; color:var(--a1)!important; }
.compare-dropdown { position:absolute; top:calc(100% + 6px); left:50%; transform:translateX(-50%);
  background:var(--surf); border:1px solid var(--bar-brd); border-radius:12px;
  box-shadow:0 8px 32px rgba(0,0,0,.12); padding:8px; min-width:280px; z-index:300;
  animation:slideDown .2s ease both; }
.compare-dropdown-item { display:block; width:100%; text-align:left; padding:8px 12px;
  border-radius:8px; border:none; background:transparent; cursor:pointer;
  font-size:13px; color:var(--mut); font-family:'Inter',system-ui,sans-serif;
  transition:background .12s, color .12s; white-space:nowrap; overflow:hidden;
  text-overflow:ellipsis; }
.compare-dropdown-item:hover { background:var(--a1-card)!important; color:var(--a1)!important; }
.compare-wrap { position:relative; }
.bestlists-wrap { position:relative; }
.trust-pill-nav {
  display:inline-flex; align-items:center; gap:5px;
  background:var(--a1-card); border:1px solid var(--a1-brd);
  border-radius:100px; padding:5px 12px;
  font-size:11px; font-weight:700; color:var(--a1);
  white-space:nowrap; letter-spacing:.01em; line-height:1; flex-shrink:0;
}
@media(max-width:680px){
  #shared-hamburger { display:flex !important; }
  #shared-desktop-nav { display:none !important; }
  .trust-pill-nav { display:none !important; }
  .author-cred-bar { display:none !important; }
}
@media(min-width:681px){
  #shared-hamburger { display:none !important; }
}
`;

// ── NexusIcon SVG — identical to HomePage ─────────────────────────────────
const NexusIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="16" x2="4"  y2="4"  stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="4" y1="4"  x2="16" y2="16" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    <line x1="16" y1="4" x2="16" y2="16" stroke="rgba(255,255,255,.55)" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="4"  cy="4"  r="2.2" fill="#fff"/>
    <circle cx="4"  cy="16" r="2.2" fill="#fff"/>
    <circle cx="16" cy="4"  r="2.2" fill="#fff"/>
    <circle cx="16" cy="16" r="2.2" fill="#fff"/>
    <circle cx="10" cy="10" r="2.8" fill="#fff" opacity=".9"/>
    <circle cx="10" cy="10" r="1.4" fill="rgba(13,148,136,.7)"/>
  </svg>
);

export interface SharedNavProps {
  navigate:    (to: string) => void;
  isDark:      boolean;
  toggleTheme: () => void;
  /** Which tab is currently active. Default: 'home' */
  activePage?: 'home' | 'compare' | 'about' | 'tool' | 'blog' | 'methodology';
  /** If provided, clicking Compare calls this instead of navigating away */
  onCompare?:  () => void;
  /** If provided, clicking All Tools calls this instead of navigating away */
  onAllTools?: () => void;
}

export function SharedNav({
  navigate,
  isDark,
  toggleTheme,
  activePage = 'home',
  onCompare,
  onAllTools,
}: SharedNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [bestListsOpen, setBestListsOpen] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);
  const bestListsRef = useRef<HTMLDivElement>(null);

  const closeMobile = () => setMobileOpen(false);

  // Close compare dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (compareRef.current && !compareRef.current.contains(e.target as Node)) {
        setCompareOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close bestLists dropdown when clicking outside
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bestListsRef.current && !bestListsRef.current.contains(e.target as Node)) {
        setBestListsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAllTools = () => {
    closeMobile();
    if (onAllTools) { onAllTools(); }
    else { navigate('/'); }
  };

  const handleCompare = () => {
    closeMobile();
    if (onCompare) { onCompare(); }
    else { navigate('/compare'); }
  };

  const handleCompareIndex = () => {
    closeMobile();
    navigate('/compare');
  };

  const handleAbout = () => {
    closeMobile();
    navigate('/about');
  };

  const handleBlog = () => {
    closeMobile();
    navigate('/blog');
  };

  const handleBestLists = () => {
    closeMobile();
    navigate('/best-free-ai-tools');
  };

  const isCompareActive = activePage === 'compare';
  const isHomeActive    = activePage === 'home';
  const isAboutActive   = activePage === 'about';
  const isBlogActive    = activePage === 'blog';

  const handleGlossary = () => {
    closeMobile();
    navigate('/glossary');
  };

  const handleMethodology = () => {
    closeMobile();
    navigate('/methodology');
  };

  return (
    <>
      <style>{NAV_CSS}</style>
      <a href="#main" className="sr-only" style={{
        position:'absolute', left:'-9999px', top:'auto', width:'1px', height:'1px', overflow:'hidden',
        zIndex:999, padding:'8px 16px', background:C.a1, color:'#fff', borderRadius:4,
        fontSize:14, textDecoration:'none',
      }} onFocus={e => { e.currentTarget.style.left = '8px'; e.currentTarget.style.top = '8px'; e.currentTarget.style.width = 'auto'; e.currentTarget.style.height = 'auto'; }}
        onBlur={e => { e.currentTarget.style.left = '-9999px'; e.currentTarget.style.width = '1px'; e.currentTarget.style.height = '1px'; }}>
        Skip to content
      </a>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: C.barBg,
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: `1px solid ${C.barBrd}`,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', height: 60,
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 20px',
        }}>

          {/* ── Logo ── */}
          <div
            onClick={() => { closeMobile(); navigate('/'); }}
            style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: `linear-gradient(135deg,${C.a1},#0b7a6e)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(13,148,136,.32)',
            }}>
              <NexusIcon size={20} />
            </div>
            <div>
              <div style={{
                fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 16,
                color: C.txt, letterSpacing: '-0.034em', lineHeight: 1.1,
              }}>
                AI Nexus<span style={{ color: C.a1 }}>.</span>
              </div>
              <div style={{
                fontSize: 9, fontWeight: 500, letterSpacing: '0.07em',
                textTransform: 'uppercase', lineHeight: 1, color: C.mut2,
              }}>
                Honest reviews
              </div>
            </div>
          </div>

          {/* ── Desktop nav ── */}
          <div
            id="shared-desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: 2 }}
          >
            {/* All Tools */}
            <button
              className="shared-nav-btn"
              onClick={handleAllTools}
              style={{
                fontSize: 14, fontWeight: 500,
                color: isHomeActive ? C.a1 : C.mut,
                padding: '7px 13px', borderRadius: 8,
                background: isHomeActive ? C.a1card : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              All Tools
            </button>

            {/* Compare — with dropdown */}
            <div className="compare-wrap" ref={compareRef}>
              <button
                className="shared-nav-btn"
                onClick={() => {
                  if (onCompare && !compareOpen) { handleCompare(); }
                  else { setCompareOpen(v => !v); }
                }}
                onMouseEnter={() => setCompareOpen(true)}
                style={{
                  fontSize: 14, fontWeight: 600,
                  color: isCompareActive ? '#fff' : C.a1,
                  padding: '7px 15px', borderRadius: 8,
                  background: isCompareActive
                    ? `linear-gradient(135deg,${C.a1},#0b7a6e)`
                    : C.a1card,
                  border: `1.5px solid ${C.a1brd}`,
                  cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  boxShadow: isCompareActive ? '0 2px 8px rgba(13,148,136,.28)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Scale size={14} /> Compare <ChevronDown size={12} style={{ transition: 'transform .2s', transform: compareOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* W4-T3: Compare dropdown — all compare articles */}
              {compareOpen && (
                <div className="compare-dropdown" onMouseLeave={() => setCompareOpen(false)}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.a1, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 6px', borderBottom: `1px solid ${C.a1brd}`, marginBottom: 4 }}>
                    All Comparisons
                  </div>
                  {COMPARE_ARTICLES.map(a => (
                    <button
                      key={a.slug}
                      className="compare-dropdown-item"
                      onClick={() => { setCompareOpen(false); closeMobile(); navigate(`/compare/${a.slug}`); }}
                    >
                      <Scale size={11} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle', color: 'var(--a1)' }} />
                      {a.keyword}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <button
              className="shared-nav-btn"
              onClick={handleAbout}
              style={{
                fontSize: 14, fontWeight: 500,
                color: isAboutActive ? C.a1 : C.mut,
                padding: '7px 13px', borderRadius: 8,
                background: isAboutActive ? C.a1card : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              About
            </button>

            {/* Blog */}
            <button
              className="shared-nav-btn"
              onClick={handleBlog}
              style={{
                fontSize: 14, fontWeight: 500,
                color: isBlogActive ? C.a1 : C.mut,
                padding: '7px 13px', borderRadius: 8,
                background: isBlogActive ? C.a1card : 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Blog
            </button>


            {/* Best Lists — with dropdown */}
            <div className="bestlists-wrap" ref={bestListsRef}>
              <button
                className="shared-nav-btn"
                onClick={() => setBestListsOpen(v => !v)}
                onMouseEnter={() => setBestListsOpen(true)}
                style={{
                  fontSize: 14, fontWeight: 500,
                  color: C.mut,
                  padding: '7px 13px', borderRadius: 8,
                  background: 'transparent',
                  border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <BookOpen size={14} /> Best Lists <ChevronDown size={12} style={{ transition: 'transform .2s', transform: bestListsOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {bestListsOpen && (
                <div className="compare-dropdown" onMouseLeave={() => setBestListsOpen(false)}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.a1, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px 6px', borderBottom: `1px solid ${C.a1brd}`, marginBottom: 4 }}>
                    Best Lists
                  </div>
                  {([
                    { label: 'Best Free AI Tools',            path: '/best-free-ai-tools' },
                    { label: 'Best AI Tools India',           path: '/best-ai-tools-india' },
                    { label: 'Best AI Writing Tools',         path: '/best-ai-writing-tools' },
                    { label: 'Best AI Coding Tools',          path: '/best-ai-coding-tools' },
                    { label: 'Best AI Logo Makers',           path: '/best-ai-logo-makers' },
                    { label: 'Best AI Tools for Freelancers', path: '/best-ai-tools-for-freelancers' },
                  ] as { label: string; path: string }[]).map(({ label, path }) => (
                    <button
                      key={path}
                      className="compare-dropdown-item"
                      onClick={() => { setBestListsOpen(false); closeMobile(); navigate(path); }}
                    >
                      <BookOpen size={11} style={{ display: 'inline', marginRight: 7, verticalAlign: 'middle', color: 'var(--a1)' }} />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Glossary — desktop only */}
            <button
              className="shared-nav-btn"
              onClick={handleGlossary}
              style={{
                fontSize: 14, fontWeight: 500,
                color: C.mut,
                padding: '7px 13px', borderRadius: 8,
                background: 'transparent',
                border: 'none', cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Glossary
            </button>

            {/* How I Review — trust signal in nav */}
            <button
              className="shared-nav-btn"
              onClick={handleMethodology}
              style={{
                fontSize: 13, fontWeight: 700,
                color: C.a1,
                padding: '7px 13px', borderRadius: 8,
                background: C.a1card,
                border: `1px solid ${C.a1brd}`, cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              How I Review
            </button>

            {/* Trust pill — hidden on mobile via CSS */}
            <span className="trust-pill-nav" title="All reviews are independently researched. No sponsored content.">
              🔒 No sponsored reviews
            </span>

            {/* Contact */}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: '#fff',
                padding: '8px 17px', borderRadius: 9,
                background: `linear-gradient(135deg,${C.a1},#0b7a6e)`,
                textDecoration: 'none', marginLeft: 6,
                boxShadow: '0 2px 8px rgba(13,148,136,.28)',
              }}
            >
              <Mail size={13} /> Contact
            </a>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36, height: 36, borderRadius: 9,
                border: `1.5px solid ${C.a1brd}`,
                background: C.a1card, cursor: 'pointer',
                fontSize: 16, marginLeft: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isDark ? <Sun size={16} color={C.a1} /> : <Moon size={16} color={C.a1} />}
            </button>
          </div>

          {/* ── Hamburger (mobile) ── */}
          <button
            id="shared-hamburger"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Menu"
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 9,
              border: `1.5px solid ${C.a1brd}`,
              background: C.a1card, cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={18} color={C.a1} /> : <Menu size={18} color={C.a1} />}
          </button>
        </div>

        {/* ── Mobile dropdown ── */}
        {mobileOpen && (
          <div
            className="shared-nav-slide"
            style={{
              background: C.surf,
              borderTop: `1px solid ${C.barBrd}`,
              padding: '10px 16px 18px',
            }}
          >
            {[
              { label: 'All Tools',  fn: handleAllTools },
              { label: 'Compare',    fn: handleCompareIndex },
              { label: 'About',      fn: handleAbout    },
              { label: 'Blog',       fn: handleBlog     },
              { label: 'Best Free AI Tools',            fn: () => { closeMobile(); navigate('/best-free-ai-tools'); } },
              { label: 'Best AI Tools India',           fn: () => { closeMobile(); navigate('/best-ai-tools-india'); } },
              { label: 'Best AI Writing Tools',         fn: () => { closeMobile(); navigate('/best-ai-writing-tools'); } },
              { label: 'Best AI Coding Tools',          fn: () => { closeMobile(); navigate('/best-ai-coding-tools'); } },
              { label: 'Best AI Logo Makers',           fn: () => { closeMobile(); navigate('/best-ai-logo-makers'); } },
              { label: 'Best AI Tools for Freelancers', fn: () => { closeMobile(); navigate('/best-ai-tools-for-freelancers'); } },
              { label: 'Glossary',   fn: handleGlossary },
              { label: 'How I Review', fn: handleMethodology },
              { label: 'Privacy Policy', fn: () => { closeMobile(); navigate('/privacy'); } },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontSize: 15, fontWeight: 500, color: C.txt,
                  padding: '12px 12px', borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  borderBottom: '1px solid var(--chip-bg)',
                }}
              >
                {label}
              </button>
            ))}
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, fontSize: 14, fontWeight: 600, color: '#fff',
                padding: '12px', borderRadius: 10,
                background: C.a1, textDecoration: 'none', marginTop: 10,
              }}
            >
              <Mail size={14} /> {SITE_CONFIG.email}
            </a>
          </div>
        )}
      </nav>

      {/* W4-T1: Author credential bar — desktop only, hidden on mobile via .author-cred-bar CSS class */}
      <div
        className="author-cred-bar"
        aria-label="Author credentials"
        style={{
          background: C.barBg,
          borderBottom: `1px solid ${C.barBrd}`,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{
          maxWidth: 1200, width: '100%', margin: '0 auto',
          padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <img
            src="/author-avatar.png"
            alt="Navneet Arya"
            width={20} height={20}
            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, color: C.mut, lineHeight: 1 }}>
            Reviewed by{' '}
            <a
              onClick={() => navigate('/about')}
              style={{ color: C.a1, fontWeight: 700, cursor: 'pointer', textDecoration: 'none' }}
            >
              Navneet Arya
            </a>
            {' '}·{' '}
            <strong style={{ color: C.txt, fontWeight: 700 }}>AI Automation &amp; Performance Testing Leader</strong>
            {' '}·{' '}
            <a
              onClick={() => navigate('/about')}
              style={{ color: C.a1, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
            >
              About
            </a>
          </span>
        </div>
      </div>

      {/* W1-T3: Site footer — Privacy Policy visibility for Google Quality Raters */}
      <footer style={{
        background: C.surf,
        borderTop: `1px solid ${C.barBrd}`,
        padding: '14px 20px',
      }}>
        {/* Social media links */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '0 0 12px', borderBottom: `1px solid ${C.barBrd}`, marginBottom: 12 }}>
          <a href="https://www.linkedin.com/in/navneetarya/" target="_blank" rel="noopener noreferrer" style={{ color: C.mut, fontSize: 12, textDecoration: 'none' }}>LinkedIn</a>
          <a href="https://x.com/aryanavneet" target="_blank" rel="noopener noreferrer" style={{ color: C.mut, fontSize: 12, textDecoration: 'none' }}>X / Twitter</a>
        </div>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap' as const, gap: 10,
        }}>
          <div style={{ fontSize: 12, color: C.mut2 }}>
            © {new Date().getFullYear()} AI Nexus · ainexustools.online
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' as const }}>
            {[
              { label: 'Privacy Policy', path: '/privacy' },
              { label: 'Disclosure',     path: '/disclosure' },
              { label: 'Methodology',    path: '/methodology' },
              { label: 'About',          path: '/about' },
            ].map(({ label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  fontSize: 12, color: C.mut2, background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  textDecoration: 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
