import React from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Zap, Star, Instagram } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const T = {
  bg: '#0a0a0f', surface: '#111118', surfaceHigh: '#16161f', border: '#1e1e2a',
  muted: '#3a3a50', subtle: '#6b6b8a', text: '#f0eff6', textDim: '#9090b0',
  accent: '#00e5a0', accentBg: 'rgba(0,229,160,0.08)',
};

const CAT_COLOR: Record<string, string> = {
  Writing: '#60a5fa', Image: '#f472b6', Video: '#34d399', Audio: '#fbbf24',
  Marketing: '#f87171', Design: '#a78bfa', Coding: '#38bdf8', Productivity: '#fb923c',
};

interface ToolPageProps { tool: Tool; navigate: (to: string) => void; }

export function ToolPage({ tool, navigate }: ToolPageProps) {
  const cc = CAT_COLOR[tool.category] || T.accent;

  React.useEffect(() => {
    document.title = `${tool.name} Review 2026 — Is It Worth It? | AI Nexus`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', `Honest ${tool.name} review. ${tool.tagline}. Free trial link, real pricing, and honest pros & cons.`);
    window.scrollTo(0, 0);
  }, [tool]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'DM Sans', sans-serif", color: T.text }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${T.border}`, padding: '0 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: T.textDim, fontSize: 14, fontWeight: 500, padding: 0, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
            <ArrowLeft size={15} /> All tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={14} color={T.bg} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>AI<span style={{ color: T.accent }}>Nexus</span></span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '48px 32px 96px' }}>

        {/* Hero card */}
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          {/* color top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${cc}, ${cc}88)` }} />
          {/* subtle glow */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${cc}10 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, color: cc, background: cc + '15', padding: '4px 12px', borderRadius: 100, marginBottom: 20 }}>
            {tool.category}
          </span>

          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' as const, fontWeight: 400, fontSize: 'clamp(32px, 5vw, 48px)', color: T.text, margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {tool.name}
          </h1>

          <p style={{ fontSize: 16, fontWeight: 600, color: cc, margin: '0 0 14px', lineHeight: 1.4 }}>{tool.tagline}</p>
          <p style={{ fontSize: 15, color: T.textDim, lineHeight: 1.7, margin: '0 0 28px' }}>{tool.description}</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {tool.pricing && (
              <div style={{ background: T.surfaceHigh, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 10, color: T.subtle, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>Pricing</div>
                <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{tool.pricing}</div>
              </div>
            )}
            {tool.bestFor && (
              <div style={{ background: T.surfaceHigh, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 10, color: T.subtle, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3 }}>Best for</div>
                <div style={{ fontSize: 15, color: T.text, fontWeight: 700 }}>{tool.bestFor}</div>
              </div>
            )}
            {tool.userBadge && (
              <div style={{ background: cc + '12', border: `1px solid ${cc}30`, borderRadius: 10, padding: '10px 16px' }}>
                <div style={{ fontSize: 10, color: cc, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 3, opacity: 0.7 }}>Highlight</div>
                <div style={{ fontSize: 15, color: cc, fontWeight: 700 }}>{tool.userBadge}</div>
              </div>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: T.accent, color: T.bg, textDecoration: 'none', borderRadius: 14, padding: '17px 32px', fontSize: 16, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.01em', transition: 'opacity 0.15s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Start {tool.name} Free <ExternalLink size={16} />
        </a>

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, padding: '32px', marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 20, color: T.text, margin: '0 0 22px', letterSpacing: '-0.02em' }}>
              Key features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {tool.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.surfaceHigh, border: `1px solid ${T.border}`, borderRadius: 10, padding: '11px 14px' }}>
                  <div style={{ width: 20, height: 20, background: cc + '18', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color={cc} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: T.textDim, fontWeight: 500, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mid CTA */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'transparent', color: cc, border: `1.5px solid ${cc}`, textDecoration: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
          Try {tool.name} Free — No Credit Card Needed <ExternalLink size={14} />
        </a>

        {/* Pros & Cons */}
        {(tool.pros || tool.cons) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 16 }}>
            {tool.pros && (
              <div style={{ background: T.surface, borderRadius: 16, border: `1px solid rgba(52,211,153,0.2)`, padding: '26px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#34d399', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} /> What I love
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.pros.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: T.textDim, lineHeight: 1.55 }}>
                      <div style={{ width: 18, height: 18, background: 'rgba(52,211,153,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Check size={10} color="#34d399" strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && (
              <div style={{ background: T.surface, borderRadius: 16, border: `1px solid rgba(248,113,113,0.2)`, padding: '26px' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: '#f87171', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={16} /> Watch out for
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.cons.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: T.textDim, lineHeight: 1.55 }}>
                      <div style={{ width: 18, height: 18, background: 'rgba(248,113,113,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <X size={10} color="#f87171" strokeWidth={3} />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ background: T.surface, borderRadius: 20, border: `1px solid ${T.border}`, padding: '40px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: `radial-gradient(ellipse, ${cc}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic' as const, fontWeight: 400, fontSize: 28, color: T.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Ready to try {tool.name}?
          </h2>
          <p style={{ color: T.textDim, fontSize: 15, margin: '0 0 28px', lineHeight: 1.6 }}>
            Start with the free plan — upgrade only if you love it.
          </p>
          <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: T.accent, color: T.bg, textDecoration: 'none', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700 }}>
            Get started free <ExternalLink size={15} />
          </a>
          <p style={{ color: T.muted, fontSize: 12, margin: '14px 0 0' }}>
            Affiliate link — I earn a small commission if you upgrade, at no extra cost to you.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: T.textDim, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
            <ArrowLeft size={14} /> Browse all AI tools
          </button>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Review",
        "name": `${tool.name} Review 2026`,
        "reviewBody": tool.description,
        "reviewRating": { "@type": "Rating", "ratingValue": "4.5", "bestRating": "5" },
        "itemReviewed": { "@type": "SoftwareApplication", "name": tool.name, "applicationCategory": tool.category, "offers": { "@type": "Offer", "description": tool.pricing } },
        "author": { "@type": "Organization", "name": "AI Nexus" },
        "publisher": { "@type": "Organization", "name": "AI Nexus", "url": SITE_CONFIG.siteUrl }
      })}} />
    </div>
  );
}
