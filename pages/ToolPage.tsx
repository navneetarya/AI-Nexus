import React from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Instagram } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

interface ToolPageProps {
  tool: Tool;
  navigate: (to: string) => void;
}

export function ToolPage({ tool, navigate }: ToolPageProps) {
  // Update page meta for SEO
  React.useEffect(() => {
    document.title = `${tool.name} Review 2025 — Pricing, Features & Free Trial | AI Nexus`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', `Honest ${tool.name} review. ${tool.tagline}. See pricing, features, pros & cons, and get your free trial link.`);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`);
  }, [tool]);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f3ff', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede9fe', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: 14, fontWeight: 500, padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
            <ArrowLeft size={16} /> Back to all tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: 6 }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#1a1a2e' }}>AI Nexus</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Hero card — carousel-matching style */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid #ede9fe', padding: '36px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <span style={{ display: 'inline-block', background: '#ede9fe', color: '#7c3aed', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', padding: '3px 12px', borderRadius: 20, textTransform: 'uppercase', marginBottom: 12 }}>
                {tool.category}
              </span>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,5vw,40px)', color: '#1a1a2e', margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {tool.name}
              </h1>
              <p style={{ fontSize: 16, color: '#7c3aed', fontWeight: 500, margin: '0 0 14px' }}>
                {tool.tagline}
              </p>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px' }}>
                {tool.description}
              </p>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {tool.pricing && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pricing</div>
                    <div style={{ fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>{tool.pricing}</div>
                  </div>
                )}
                {tool.bestFor && (
                  <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Best for</div>
                    <div style={{ fontSize: 14, color: '#1a1a2e', fontWeight: 600 }}>{tool.bestFor}</div>
                  </div>
                )}
                {tool.commission && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 14px' }}>
                    <div style={{ fontSize: 10, color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Commission</div>
                    <div style={{ fontSize: 14, color: '#059669', fontWeight: 600 }}>{tool.commission}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button — top placement */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', textDecoration: 'none', borderRadius: 14, padding: '16px 28px', fontSize: 16, fontWeight: 600, marginBottom: 24, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.01em', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}>
          Try {tool.name} Free
          <ExternalLink size={16} />
        </a>

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #ede9fe', padding: '28px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: '#1a1a2e', margin: '0 0 20px', letterSpacing: '-0.01em' }}>
              Key features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {tool.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#faf9ff', border: '1px solid #ede9fe', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ width: 20, height: 20, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="#7c3aed" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pros & Cons */}
        {(tool.pros || tool.cons) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
            {tool.pros && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #bbf7d0', padding: '24px' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#059669', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={16} /> What we love
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tool.pros.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                      <div style={{ width: 18, height: 18, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={10} color="#059669" strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #fecaca', padding: '24px' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#ef4444', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={16} /> Watch out for
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tool.cons.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                      <div style={{ width: 18, height: 18, background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <X size={10} color="#ef4444" strokeWidth={3} />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA — dark purple like carousel final slide */}
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 20, padding: '36px', textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Ready to try it?
          </p>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Start your free {tool.name} trial
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: '0 0 24px' }}>
            No credit card required on free plan.
          </p>
          <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#7c3aed', textDecoration: 'none', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
            Get started free <ExternalLink size={14} />
          </a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '16px 0 0' }}>
            Affiliate link — we earn a commission at no extra cost to you.
          </p>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            <ArrowLeft size={14} /> Browse all AI tools
          </button>
        </div>
      </div>

      {/* Schema.org for this tool */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Review",
        "name": `${tool.name} Review`,
        "reviewBody": tool.description,
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
