import React from 'react';
import { ArrowLeft } from 'lucide-react';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function DisclosurePage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Plus Jakarta Sans', sans-serif", color: C.txt }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={15} /> Home
          </button>
        </div>
      </nav>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>LEGAL</span>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 32, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Affiliate Disclosure</h1>
            <p style={{ fontSize: 12, color: C.mut2, marginBottom: 28 }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {[
              ['What are affiliate links?', 'Some links on this website are affiliate links. This means that if you click a link and make a purchase or sign up for a paid plan, AI Nexus may earn a commission. This comes at no additional cost to you.'],
              ['Does this affect our reviews?', 'No. Tools are reviewed based on personal testing and honest assessment. We have written negative reviews of tools that have affiliate programs, and positive reviews of tools where we earn no commission. The affiliate relationship does not influence the content of any review.'],
              ['Which tools have affiliate links?', 'All tools listed on this site have direct affiliate programs. We only list tools where we can earn a commission directly from the tool\'s own affiliate program — not through third-party networks. This is disclosed on every tool page.'],
              ['Compliance', 'This disclosure complies with the FTC guidelines on endorsements and testimonials, and international standards for affiliate marketing disclosures including ASA (UK) and ACCC (Australia) guidelines.'],
              ['Contact', 'If you have any questions about our affiliate relationships, contact us at hello@ainexustools.online'],
            ].map(([heading, body], i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: C.txt, margin: '0 0 8px' }}>{heading}</h2>
                <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
