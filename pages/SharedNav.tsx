import React, { useState } from 'react';
import { Mail, Menu, X, Scale, Sun, Moon } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

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
@media(max-width:680px){
  #shared-hamburger { display:flex !important; }
  #shared-desktop-nav { display:none !important; }
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
  activePage?: 'home' | 'compare' | 'about' | 'tool' | 'blog';
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

  const closeMobile = () => setMobileOpen(false);

  const handleAllTools = () => {
    closeMobile();
    if (onAllTools) { onAllTools(); }
    else { navigate('/'); }
  };

  const handleCompare = () => {
    closeMobile();
    if (onCompare) { onCompare(); }
    else { navigate('/'); }
  };

  const handleAbout = () => {
    closeMobile();
    navigate('/about');
  };

  const handleBlog = () => {
    closeMobile();
    navigate('/blog');
  };

  const isCompareActive = activePage === 'compare';
  const isHomeActive    = activePage === 'home';
  const isAboutActive   = activePage === 'about';
  const isBlogActive    = activePage === 'blog';

  return (
    <>
      <style>{NAV_CSS}</style>
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
                fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16,
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
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              All Tools
            </button>

            {/* Compare */}
            <button
              className="shared-nav-btn"
              onClick={handleCompare}
              style={{
                fontSize: 14, fontWeight: 600,
                color: isCompareActive ? '#fff' : C.a1,
                padding: '7px 15px', borderRadius: 8,
                background: isCompareActive
                  ? `linear-gradient(135deg,${C.a1},#0b7a6e)`
                  : C.a1card,
                border: `1.5px solid ${C.a1brd}`,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: isCompareActive ? '0 2px 8px rgba(13,148,136,.28)' : 'none',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Scale size={14} /> Compare
            </button>

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
                fontFamily: "'DM Sans',sans-serif",
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
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              Blog
            </button>

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
              { label: 'All Tools', fn: handleAllTools },
              { label: 'Compare',   fn: handleCompare  },
              { label: 'About',     fn: handleAbout    },
              { label: 'Blog',      fn: handleBlog     },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  fontSize: 15, fontWeight: 500, color: C.txt,
                  padding: '12px 12px', borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
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
    </>
  );
}
