import React from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Instagram, Zap, Star } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

interface ToolPageProps {
  tool: Tool;
  navigate: (to: string) => void;
}

export function ToolPage({ tool, navigate }: ToolPageProps) {
  React.useEffect(() => {
    document.title = `${tool.name} Review 2026 — Is It Worth It? | AI Nexus`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', `Honest ${tool.name} review. ${tool.tagline}. See real pricing, key features, pros & cons, and get your free trial.`);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`);
    window.scrollTo(0, 0);
  }, [tool]);

  const gradientStyle = {
    background: `linear-gradient(135deg, ${tool.accentColor}15, ${tool.color}08)`,
  };

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
        <div style={{ maxWidth: 820, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 14, fontWeight: 600,
              padding: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <ArrowLeft size={16} /> All tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={15} color="#fff" />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#18182b', letterSpacing: '-0.03em' }}>AI Nexus</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: '0 auto', padding: '44px 24px 96px' }}>

        {/* Hero card */}
        <div style={{
          background: '#fff',
          borderRadius: 22,
          border: '1.5px solid #ede9fe',
          padding: '40px',
          marginBottom: 20,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Accent bar top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${tool.accentColor}, ${tool.color})` }} />

          {/* Category badge */}
          <span style={{
            display: 'inline-block',
            background: '#ede9fe', color: '#7c3aed',
            fontSize: 12, fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '4px 14px', borderRadius: 100,
            textTransform: 'uppercase',
            marginBottom: 18,
          }}>
            {tool.category}
          </span>

          {/* Tool name */}
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(32px, 6vw, 48px)',
            color: '#18182b',
            margin: '0 0 10px',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
          }}>
            {tool.name}
          </h1>

          {/* Tagline */}
          <p style={{ fontSize: 18, color: '#7c3aed', fontWeight: 600, margin: '0 0 16px', lineHeight: 1.4 }}>
            {tool.tagline}
          </p>

          {/* Description */}
          <p style={{ fontSize: 16, color: '#4b5563', lineHeight: 1.7, margin: '0 0 28px' }}>
            {tool.description}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {tool.pricing && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Pricing</div>
                <div style={{ fontSize: 15, color: '#18182b', fontWeight: 700 }}>{tool.pricing}</div>
              </div>
            )}
            {tool.bestFor && (
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Best for</div>
                <div style={{ fontSize: 15, color: '#18182b', fontWeight: 700 }}>{tool.bestFor}</div>
              </div>
            )}
            {tool.userBadge && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 16px' }}>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Highlight</div>
                <div style={{ fontSize: 15, color: '#059669', fontWeight: 700 }}>{tool.userBadge}</div>
              </div>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <a
          href={tool.affiliateLink}
          target="_blank"
          rel="noopener noreferrer nofollow"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: `linear-gradient(135deg, ${tool.accentColor}, ${tool.color})`,
            color: '#fff',
            textDecoration: 'none',
            borderRadius: 16,
            padding: '18px 32px',
            fontSize: 17,
            fontWeight: 700,
            marginBottom: 24,
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.01em',
            boxShadow: `0 6px 20px ${tool.accentColor}30`,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.92')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
        >
          Start {tool.name} Free
          <ExternalLink size={17} />
        </a>

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #ede9fe', padding: '32px', marginBottom: 18 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800, fontSize: 22, color: '#18182b',
              margin: '0 0 22px', letterSpacing: '-0.02em',
            }}>
              Key features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
              {tool.features.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  background: '#faf9ff',
                  border: '1px solid #ede9fe',
                  borderRadius: 12,
                  padding: '11px 14px',
                }}>
                  <div style={{ width: 22, height: 22, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={12} color="#7c3aed" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Second CTA — mid page */}
        {tool.features && tool.features.length > 0 && (
          <a
            href={tool.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#fff',
              color: tool.accentColor,
              border: `2px solid ${tool.accentColor}`,
              textDecoration: 'none',
              borderRadius: 14,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
              marginBottom: 18,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Try {tool.name} Free — No Credit Card Needed
            <ExternalLink size={15} />
          </a>
        )}

        {/* Pros & Cons */}
        {(tool.pros || tool.cons) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 18 }}>
            {tool.pros && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #bbf7d0', padding: '28px' }}>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800, fontSize: 17, color: '#059669',
                  margin: '0 0 18px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Check size={17} /> What I love
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tool.pros.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.55 }}>
                      <div style={{ width: 20, height: 20, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={11} color="#059669" strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && (
              <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid #fecaca', padding: '28px' }}>
                <h3 style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800, fontSize: 17, color: '#ef4444',
                  margin: '0 0 18px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <X size={17} /> Watch out for
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {tool.cons.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#374151', lineHeight: 1.55 }}>
                      <div style={{ width: 20, height: 20, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <X size={11} color="#ef4444" strokeWidth={3} />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA block */}
        <div style={{
          background: 'linear-gradient(135deg, #18182b 0%, #2d1b69 100%)',
          borderRadius: 22,
          padding: '40px',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
            ))}
          </div>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800, fontSize: 28, color: '#fff',
            margin: '0 0 10px', letterSpacing: '-0.025em',
          }}>
            Ready to try {tool.name}?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, margin: '0 0 28px', lineHeight: 1.6 }}>
            Start with the free plan — no credit card required on most tiers. Upgrade only if you love it.
          </p>
          <a
            href={tool.affiliateLink}
            target="_blank"
            rel="noopener noreferrer nofollow"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fff', color: '#18182b',
              textDecoration: 'none',
              borderRadius: 14, padding: '15px 32px',
              fontSize: 16, fontWeight: 800,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: '-0.01em',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            }}
          >
            Get started free <ExternalLink size={15} />
          </a>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: '16px 0 0' }}>
            This is an affiliate link. I earn a small commission if you upgrade — at no extra cost to you.
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#7c3aed', fontSize: 15, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <ArrowLeft size={15} /> Browse all AI tools
          </button>
        </div>
      </div>

      {/* Schema.org */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Review",
        "name": `${tool.name} Review 2026`,
        "reviewBody": tool.description,
        "reviewRating": { "@type": "Rating", "ratingValue": "4.5", "bestRating": "5" },
        "itemReviewed": {
          "@type": "SoftwareApplication",
          "name": tool.name,
          "applicationCategory": tool.category,
          "offers": { "@type": "Offer", "description": tool.pricing }
        },
        "author": { "@type": "Organization", "name": "AI Nexus" },
        "publisher": { "@type": "Organization", "name": "AI Nexus", "url": SITE_CONFIG.siteUrl }
      })}} />
    </div>
  );
}
