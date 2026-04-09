import React from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Star } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg: '#F5F4FF', surf: '#FFFFFF', a1: '#5B21B6', a2: '#06B6D4',
  txt: '#0F0F1A', mut: 'rgba(15,15,26,.66)', mut2: 'rgba(15,15,26,.38)',
  a1card: 'rgba(91,33,182,.065)', a1brd: 'rgba(91,33,182,.18)',
  a2card: 'rgba(6,182,212,.065)',  a2brd: 'rgba(6,182,212,.18)',
  err: 'rgba(239,68,68,.05)', errbrd: 'rgba(239,68,68,.16)',
  barBg: 'rgba(245,244,255,.97)', barBrd: 'rgba(91,33,182,.13)',
};

const CAT_ACCENT: Record<string, 'a1' | 'a2'> = {
  Writing: 'a1', Image: 'a2', Video: 'a1', Audio: 'a2',
  Marketing: 'a1', Design: 'a2', Coding: 'a1', Productivity: 'a2',
};

const DOT_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.1)'/%3E%3C/svg%3E")`;

interface ToolPageProps { tool: Tool; navigate: (to: string) => void; }

export function ToolPage({ tool, navigate }: ToolPageProps) {
  const isA2 = CAT_ACCENT[tool.category] === 'a2';
  const accent = isA2 ? C.a2 : C.a1;
  const cardBg = isA2 ? C.a2card : C.a1card;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;

  React.useEffect(() => {
    document.title = `${tool.name} Review 2026 — Is It Worth It? | AI Nexus`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', `Honest ${tool.name} review. ${tool.tagline}. Free trial link, real pricing, honest pros & cons.`);
    window.scrollTo(0, 0);
  }, [tool]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={15} /> All tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 3, height: 22, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})`, borderRadius: 2, marginRight: 10 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: C.txt }}>
              AI<span style={{ color: C.a1 }}>Nexus</span>
            </span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 28px 96px' }}>

        {/* ── Hero card — Slide 1 style ──────────────────── */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${cardBrd}`, padding: '40px 40px 36px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          {/* Left accent stripe */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg, ${C.a1}, ${C.a2})` }} />
          {/* Dot pattern */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_PATTERN, opacity: 0.5, pointerEvents: 'none' }} />
          {/* Glow */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Badge — carousel style */}
            <div style={{ display: 'inline-block', background: `linear-gradient(135deg, ${C.a1}, ${C.a2})`, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', padding: '6px 18px', borderRadius: 100, marginBottom: 22 }}>
              {tool.category.toUpperCase()}
            </div>

            {/* Tool name — Space Grotesk bold, carousel slide 1 style */}
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(36px, 5vw, 52px)', color: C.txt, margin: '0 0 10px', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
              {tool.name}
            </h1>

            <p style={{ fontSize: 16, fontWeight: 500, color: accent, margin: '0 0 14px', lineHeight: 1.4 }}>{tool.tagline}</p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.7, margin: '0 0 28px', fontWeight: 300 }}>{tool.description}</p>

            {/* Stat pills — carousel slide 2/3 style */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {tool.pricing && (
                <div style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>Pricing</div>
                  <div style={{ fontSize: 15, color: C.txt, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{tool.pricing}</div>
                </div>
              )}
              {tool.bestFor && (
                <div style={{ background: isA2 ? C.a1card : C.a2card, border: `1px solid ${isA2 ? C.a1brd : C.a2brd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: isA2 ? C.a1 : C.a2, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>Best for</div>
                  <div style={{ fontSize: 15, color: C.txt, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{tool.bestFor}</div>
                </div>
              )}
              {tool.userBadge && (
                <div style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: C.a1, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk', sans-serif" }}>Highlight</div>
                  <div style={{ fontSize: 15, color: C.a1, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>{tool.userBadge}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Primary CTA — gradient pill from carousel ──── */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: `linear-gradient(135deg, ${C.a1}, ${C.a2})`, color: '#fff', borderRadius: 14, padding: '17px 32px', fontSize: 16, fontWeight: 600, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.01em', boxShadow: '0 8px 32px rgba(91,33,182,.22)', transition: 'opacity 0.15s', textDecoration: 'none' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.9')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Start {tool.name} Free <ExternalLink size={17} />
        </a>

        {/* ── Features — carousel card grid ──────────────── */}
        {tool.features && tool.features.length > 0 && (
          <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${cardBrd}`, padding: '30px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.txt, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
              Key features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {tool.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: 10, padding: '11px 14px' }}>
                  <div style={{ width: 20, height: 20, background: cardBg, border: `1.5px solid ${cardBrd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color={accent} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: C.mut, fontWeight: 400, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mid CTA */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: cardBg, color: accent, border: `1.5px solid ${cardBrd}`, borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 600, marginBottom: 14, fontFamily: "'DM Sans', sans-serif", textDecoration: 'none' }}>
          Try {tool.name} Free — No Credit Card Needed <ExternalLink size={14} />
        </a>

        {/* ── Pros & Cons — carousel card style ──────────── */}
        {(tool.pros || tool.cons) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 14 }}>
            {tool.pros && (
              <div style={{ background: C.surf, borderRadius: 16, border: '1.5px solid rgba(91,33,182,.18)', padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.a1, textTransform: 'uppercase' as const, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>What I Love</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.pros.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: C.mut, lineHeight: 1.55, fontWeight: 300 }}>
                      <div style={{ width: 18, height: 18, background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Check size={10} color={C.a1} strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && (
              <div style={{ background: C.surf, borderRadius: 16, border: `1.5px solid ${C.errbrd}`, padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(239,68,68,.7)', textTransform: 'uppercase' as const, marginBottom: 14, fontFamily: "'Space Grotesk', sans-serif" }}>Watch Out For</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.cons.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: C.mut, lineHeight: 1.55, fontWeight: 300 }}>
                      <div style={{ width: 18, height: 18, background: 'rgba(239,68,68,.08)', border: `1px solid ${C.errbrd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <X size={10} color="rgba(239,68,68,.7)" strokeWidth={3} />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Bottom CTA — carousel slide 10 style ─────── */}
        <div style={{ background: `linear-gradient(135deg, ${C.a1}, ${C.a2})`, borderRadius: 20, padding: '40px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_PATTERN, opacity: 0.15, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 14 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="#fff" color="#fff" opacity={0.8} />)}
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 26, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.025em' }}>
              Ready to try {tool.name}?
            </h2>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 15, margin: '0 0 24px', lineHeight: 1.6, fontWeight: 300 }}>
              Start free. Upgrade only when you love it. No FOMO buying.
            </p>
            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.a1, borderRadius: 100, padding: '13px 28px', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
              Get started free <ExternalLink size={14} />
            </a>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 12, margin: '14px 0 0', fontWeight: 300 }}>
              Affiliate link — I earn a small commission if you upgrade, at no extra cost to you.
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.mut, fontSize: 14, fontWeight: 400 }}>
            <ArrowLeft size={14} /> Browse all AI tools
          </button>
        </div>
      </div>

      {/* Schema */}
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
