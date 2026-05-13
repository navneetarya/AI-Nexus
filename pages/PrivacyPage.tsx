import React from 'react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function PrivacyPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const lastUpdated = 'May 2026';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>LEGAL</span>
            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,4vw,34px)', color: C.txt, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Privacy Policy</h1>
            <p style={{ fontSize: 12, color: C.mut2, marginBottom: 0 }}>Last updated: {lastUpdated} &nbsp;·&nbsp; Site: {SITE_CONFIG.siteUrl}</p>
          </div>
        </div>

        {/* Sections */}
        {[
          {
            title: '1. What information we collect',
            body: `AI Nexus does not require account registration and does not collect personally identifiable information directly. The following data is collected automatically when you visit the site:\n\n• Usage data via Google Analytics 4 (GA4): pages visited, time on page, device type, browser, approximate geographic location (country/city level), and referring URL. This data is anonymised and aggregated.\n\n• We do not collect your name, email address, or payment information unless you voluntarily contact us at ${SITE_CONFIG.email}.`,
          },
          {
            title: '2. How we use your information',
            body: 'Usage data collected via Google Analytics is used solely to understand which content is useful to readers and to improve the site. We do not sell your data to third parties. We do not use your data for advertising targeting.',
          },
          {
            title: '3. Google Analytics (GA4)',
            body: 'This site uses Google Analytics 4 (GA4) to collect anonymised usage data. GA4 is configured with IP anonymisation enabled. Data is processed by Google in accordance with their Privacy Policy (policies.google.com/privacy). You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on (tools.google.com/dlpage/gaoptout).',
          },
          {
            title: '4. Cookies',
            body: 'Google Analytics sets cookies to distinguish unique visitors and sessions. These are first-party analytics cookies and do not track you across other websites. No advertising or third-party tracking cookies are used on this site.',
          },
          {
            title: '5. Affiliate links',
            body: 'This site contains affiliate links. Clicking these links and making a purchase may result in AI Nexus earning a commission from the tool provider. Affiliate links do not install any tracking software on your device. The commission is paid by the tool provider at no additional cost to you. Full details are in our Affiliate Disclosure.',
          },
          {
            title: '6. Third-party links',
            body: 'This site links to external websites including tool providers, review platforms, and documentation sources. AI Nexus is not responsible for the privacy practices of external websites. We encourage you to review the privacy policies of any third-party sites you visit.',
          },
          {
            title: '7. Data retention',
            body: 'Google Analytics data is retained for 14 months by default, after which it is automatically deleted. We do not store any other personal data.',
          },
          {
            title: '8. Your rights',
            body: 'If you are in the European Union (GDPR) or California (CCPA), you have the right to request access to, correction of, or deletion of any personal data we hold about you. Since we collect only anonymised analytics data and do not maintain user accounts, most data requests can be satisfied by clearing your browser cookies. For any specific requests, contact us at ' + SITE_CONFIG.email + '.',
          },
          {
            title: '9. Children\'s privacy',
            body: 'This site is not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided personal information through this site, please contact us and we will delete it promptly.',
          },
          {
            title: '10. Changes to this policy',
            body: 'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. The "last updated" date at the top of this page will be revised accordingly. Continued use of the site after changes constitutes acceptance of the updated policy.',
          },
          {
            title: '11. Contact',
            body: `If you have any questions about this Privacy Policy, please contact us at ${SITE_CONFIG.email}.`,
          },
        ].map(({ title, body }, i) => (
          <div key={i} style={{ background: C.surf, borderRadius: 16, border: `1.5px solid ${C.barBrd}`, padding: '22px 26px', marginBottom: 12 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15, color: C.txt, margin: '0 0 10px', letterSpacing: '-0.015em' }}>{title}</h2>
            {body.split('\n\n').map((para, j) => (
              <p key={j} style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, margin: j < body.split('\n\n').length - 1 ? '0 0 10px' : 0, whiteSpace: 'pre-line' }}>{para}</p>
            ))}
          </div>
        ))}

        {/* Back links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, marginTop: 8 }}>
          <button onClick={() => navigate('/disclosure')}
            style={{ fontSize: 13, fontWeight: 500, color: C.a1, padding: '8px 18px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Affiliate Disclosure →
          </button>
          <button onClick={() => navigate('/')}
            style={{ fontSize: 13, fontWeight: 500, color: C.mut2, padding: '8px 18px', border: `1.5px solid ${C.barBrd}`, borderRadius: 100, background: C.surf, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
            Browse all reviews
          </button>
        </div>

      </div>
    </div>
  );
}
