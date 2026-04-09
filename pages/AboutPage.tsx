import React from 'react';
import { ArrowLeft, Instagram, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'#F5F4FF', surf:'#FFFFFF', a1:'#5B21B6', a2:'#06B6D4',
  txt:'#0F0F1A', mut:'rgba(15,15,26,.66)', mut2:'rgba(15,15,26,.38)',
  a1card:'rgba(91,33,182,.065)', a1brd:'rgba(91,33,182,.18)',
  barBg:'rgba(245,244,255,.97)', barBrd:'rgba(91,33,182,.13)',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.1)'/%3E%3C/svg%3E")`;

export function AboutPage({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={15} /> All tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 3, height: 22, background: `linear-gradient(180deg,${C.a1},${C.a2})`, borderRadius: 2, marginRight: 10 }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>AI<span style={{ color: C.a1 }}>Nexus</span></span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Hero */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>ABOUT</span>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,40px)', color: C.txt, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Who tests these AI tools?
            </h1>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
              AI Nexus is run by a solo creator based in India who got frustrated with AI tool reviews that were clearly written by people who had never actually opened the product.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
              Every tool on this site has been personally signed up for, tested with real tasks, and used for at least one week before being reviewed. The pros and cons come from actual experience, not from copying the marketing page.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
              The Instagram account <strong style={{ color: C.txt }}>@ai.nexus.in</strong> shares the same honest takes in carousel format — if you found this site from Instagram, that's exactly the same voice you're reading here.
            </p>
          </div>
        </div>

        {/* Review process */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
            How every review is done
          </h2>
          {[
            ['Sign up on the free plan', 'Every tool is tested starting from the free tier — because that\'s where most people start.'],
            ['Use it for real tasks', 'Not demo tasks. Real work — writing actual content, editing actual images, creating actual videos.'],
            ['Test for at least 7 days', 'First impressions are often wrong. Tools need a week to reveal their real strengths and weaknesses.'],
            ['Document what breaks', 'The "cons" sections are where most review sites fail. I specifically look for what frustrates me.'],
            ['Check the affiliate program', 'Only tools with direct affiliate programs (no PartnerStack middleman) are listed. This keeps the model simple.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <CheckCircle size={14} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.6, fontWeight: 300 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Transparency */}
        <div style={{ background: 'rgba(91,33,182,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Full transparency</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.7, fontWeight: 300 }}>
            This site earns money through affiliate links. When you click a link and sign up for a paid plan, I earn a small commission — typically 20–30% of the first payment. This does not affect the review. Tools are rated honestly even when I earn from them. See the <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.a1, fontWeight: 500 }}>full affiliate disclosure →</a>
          </p>
        </div>

        {/* Instagram CTA */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <a href={SITE_CONFIG.instagramUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", textDecoration: 'none' }}>
            <Instagram size={15} /> Follow @ai.nexus.in on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
