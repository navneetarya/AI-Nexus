import React from 'react';
import { SharedNav } from './SharedNav';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function TermsPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {
  const lastUpdated = 'June 26, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      body: `By using ${SITE_CONFIG.siteUrl}, you agree to these Terms of Service. If you do not agree, please stop using the site.`
    },
    {
      title: '2. Content Purpose',
      body: 'AI Nexus publishes independent reviews, comparisons, and educational content about AI tools. All content is provided for informational purposes and should not be treated as legal, tax, investment, or professional advice.'
    },
    {
      title: '3. Editorial Independence and Affiliate Links',
      body: 'Some links are affiliate links. If you purchase through them, AI Nexus may earn a commission at no additional cost to you. Rankings and conclusions are based on independent research, not sponsorship.'
    },
    {
      title: '4. Accuracy and Updates',
      body: 'Pricing, product features, and policies can change quickly. While we aim for accuracy, we cannot guarantee that every detail remains current at all times. Always verify critical details on the official provider website before purchasing.'
    },
    {
      title: '5. Intellectual Property',
      body: 'All original AI Nexus content, including text, layouts, graphics, and branding, is protected by copyright and applicable law. You may quote short excerpts with clear attribution and a link back to the original page.'
    },
    {
      title: '6. Prohibited Use',
      body: 'You agree not to misuse the website, attempt unauthorized access, disrupt service operations, scrape content at abusive rates, or use content in a way that violates law or third-party rights.'
    },
    {
      title: '7. External Services and Third-Party Links',
      body: 'This site links to third-party tools and services. AI Nexus is not responsible for third-party content, availability, pricing changes, or data handling practices. Review each service terms and privacy policy directly.'
    },
    {
      title: '8. Limitation of Liability',
      body: 'To the fullest extent permitted by law, AI Nexus and its author are not liable for losses or damages resulting from your use of this site or reliance on its content. Your use of the site is at your own risk.'
    },
    {
      title: '9. Changes to Terms',
      body: 'We may update these terms periodically. Material updates will be reflected by a revised last-updated date. Continued use of the website after updates means you accept the revised terms.'
    },
    {
      title: '10. Contact',
      body: `Questions about these terms can be sent to ${SITE_CONFIG.email}.`
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>LEGAL</span>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,4vw,34px)', color: C.txt, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Terms of Service</h1>
            <p style={{ fontSize: 12, color: C.mut2, marginBottom: 0 }}>Last updated: {lastUpdated} · Site: {SITE_CONFIG.siteUrl}</p>
          </div>
        </div>

        {sections.map(({ title, body }) => (
          <div key={title} style={{ background: C.surf, borderRadius: 16, border: `1.5px solid ${C.barBrd}`, padding: '22px 26px', marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: C.txt, margin: '0 0 10px', letterSpacing: '-0.015em' }}>{title}</h2>
            <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, margin: 0 }}>{body}</p>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <button onClick={() => navigate('/privacy')}
            style={{ fontSize: 13, fontWeight: 500, color: C.a1, padding: '8px 18px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Privacy Policy →
          </button>
          <button onClick={() => navigate('/disclosure')}
            style={{ fontSize: 13, fontWeight: 500, color: C.a1, padding: '8px 18px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Affiliate Disclosure →
          </button>
        </div>
      </div>
    </div>
  );
}
