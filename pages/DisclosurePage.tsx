import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function DisclosurePage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 20 }}>LEGAL</span>
            <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 32, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.025em' }}>Affiliate Disclosure</h1>
            <p style={{ fontSize: 12, color: C.mut2, marginBottom: 28 }}>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            {[
              ['What are affiliate links?', 'Some links on this website are affiliate links. This means that if you click a link and make a purchase or sign up for a paid plan, AI Nexus may earn a commission. This comes at no additional cost to you.'],
              ['Does this affect our reviews?', 'No. Tools are reviewed through independent research — official documentation, verified user reviews (Trustpilot, G2, Reddit), and pricing analysis — combined with honest, unsponsored assessment. We have written negative reviews of tools that have affiliate programs, and positive reviews of tools where we earn no commission. The affiliate relationship does not influence the content of any review.'],
              // ── Affiliate programme list ──────────────────────────────────────────
              // Step E (Phase 1 affiliate plan): this list is hand-maintained. When a new
              // affiliate or referral programme is added in constants.ts, add the tool name
              // to the matching network below. Tools linked with a plain vendor URL and no
              // tracking parameter are NOT affiliate links and do not belong here.
              ['Which tools have affiliate links?', 'Some tools featured on AI Nexus are linked through affiliate or referral programmes. We may earn a commission if you sign up or purchase through those links, at no extra cost to you. Many other tools are linked plainly, with no commission attached, purely because they are useful. As of September 2026 we participate in the following programmes. Through the Impact network: CREAO, Flowith, InVideo AI, Lovable, PopAi Sheets, Transkriptor and Wegic. Through vendor and PartnerStack-style referral programmes: Beautiful.ai, Canva, Descript, Fireflies.ai, Frase.io, Gamma, GetResponse, HeadshotPro, Jasper, Leonardo.ai, Looka, Munch AI, Narrato, Notion, Ocoya, Opus Clip, Perplexity, PhotoRoom, Pictory, QuillBot, Relevance AI, Rytr, Taskade, Tidio, vidIQ and Writesonic. Every individual tool page states whether its outbound link is an affiliate link, and all affiliate links carry a rel="sponsored" attribute.'],
              ['Compliance', 'This disclosure complies with the FTC guidelines on endorsements and testimonials, and international standards for affiliate marketing disclosures including ASA (UK) and ACCC (Australia) guidelines.'],
              ['Contact', 'If you have any questions about our affiliate relationships, contact us at hello@ainexustools.online'],
            ].map(([heading, body], i) => (
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
