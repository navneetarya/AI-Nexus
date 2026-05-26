import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact AI Nexus",
  "url": "https://ainexustools.online/contact/",
  "mainEntity": {
    "@type": "Organization",
    "name": "AI Nexus",
    "email": "hello@ainexustools.online",
    "url": "https://ainexustools.online"
  }
};

const SECTIONS = [
  {
    heading: 'Editorial Enquiries',
    body: "Questions about a specific review, factual corrections, or concerns about how a tool has been covered? Reach out and include the tool name and the specific detail you'd like addressed. All correction requests are reviewed within 2–3 business days.",
  },
  {
    heading: 'Research Collaboration',
    body: 'Researchers, academics, or journalists working on AI tool adoption, freelancer workflows, or the creator economy are welcome to get in touch. I can provide data points, commentary, or background for relevant projects.',
  },
  {
    heading: 'Press Contact',
    body: 'Media enquiries, interview requests, and requests for expert commentary on AI productivity tools can be sent directly to the address below. Please include your publication name and deadline in the subject line.',
  },
  {
    heading: 'Affiliate Partnerships',
    body: 'AI Nexus only accepts direct affiliate programmes from tools that have been independently tested and meet our editorial standards. If you represent an AI tool and want to explore a partnership, send a brief overview of the tool and its programme details.',
  },
];

export function ContactPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CONTACT_SCHEMA) }}
      />
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.mut, fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '0 0 24px', fontFamily: "'Inter',sans-serif" }}
        >
          <ArrowLeft size={15} /> Back to home
        </button>

        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>CONTACT</span>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 32, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Contact {SITE_CONFIG.name}</h1>
            <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 32 }}>
              For editorial enquiries, research collaboration, press contact, and affiliate partnership questions, email us directly. We aim to respond within <strong style={{ color: C.txt, fontWeight: 600 }}>2–3 business days</strong>.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.a1card, border: `1.5px solid ${C.a1brd}`, borderRadius: 12, padding: '16px 20px', marginBottom: 36 }}>
              <Mail size={18} style={{ color: C.a1, flexShrink: 0 }} />
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                style={{ fontSize: 15, fontWeight: 600, color: C.a1, textDecoration: 'none', fontFamily: "'Inter',sans-serif", letterSpacing: '-0.01em' }}
              >
                {SITE_CONFIG.email}
              </a>
            </div>

            {SECTIONS.map(({ heading, body }, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, color: C.txt, margin: '0 0 8px' }}>{heading}</h2>
                <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
