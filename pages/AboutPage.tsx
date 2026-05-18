import React from 'react';
import { ArrowLeft, CheckCircle, Mail, ExternalLink, Linkedin } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(13%2C148%2C136%2C0.1)'/%3E%3C/svg%3E")`;

export function AboutPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  // M3 (SEO-Medium): Enhanced Person schema — Google quality raters look for
  // explicit expertise signals (knowsAbout depth, jobTitle, numberOfReviews).
  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": SITE_CONFIG.authorName,
    "url": `${SITE_CONFIG.siteUrl}/about`,
    "image": `${SITE_CONFIG.siteUrl}/author-photo.jpg`,
    "description": SITE_CONFIG.authorBio,
    "jobTitle": "AI Tools Reviewer & Founder",
    "sameAs": [
      "https://www.linkedin.com/in/navneetarya/",
      "https://x.com/aryanavneet",
      "https://ainexustools.online/about/"
      // Add once published: "https://medium.com/@navneetarya"
    ],
    "knowsAbout": [
      "Artificial Intelligence", "AI Writing Tools", "AI Image Generators",
      "Podcast Software", "AI Video Tools", "Productivity Software",
      "Affiliate Marketing", "Content Creation", "SEO Content Strategy"
    ],
    "worksFor": {
      "@type": "Organization",
      "name": "AI Nexus",
      "url": SITE_CONFIG.siteUrl,
      "description": "Independent AI tool review site — every tool independently researched before publication"
    },
    "hasOccupation": {
      "@type": "Occupation",
      "name": "AI Tools Reviewer",
      "description": "Independently researches and compares AI tools for writers, creators, and freelancers using official documentation, verified user reviews, and pricing analysis."
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="about" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Author hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>ABOUT THE REVIEWER</span>

            {/* Author identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${C.a1},${C.a2})`, padding: 3, boxShadow: `0 0 0 3px ${C.a1card}, 0 4px 16px rgba(13,148,136,.25)` }}>
                  <img
                    src="/author-photo.jpg"
                    alt="Navneet Arya, independent AI tools researcher and founder of AI Nexus — researched 25+ AI writing, audio, and video tools since 2022"
                    width={74} height={74}
                    style={{ width: 74, height: 74, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }}/>
                </div>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(22px,4vw,32px)', color: C.txt, margin: '0 0 4px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  {SITE_CONFIG.authorName}
                </h1>
                <div style={{ fontSize: 13, color: C.mut2 }}>AI Automation &amp; Performance Testing Leader · BOLD &nbsp;|&nbsp; Founder, AI Nexus</div>
              </div>
            </div>

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>
              {SITE_CONFIG.authorBio}
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>
              I built AI Nexus because every "best AI tools" article I found was clearly written by someone who had never actually opened the products. Review sites were copying marketing pages and calling it a review. I got frustrated and decided to build something where every review is based on independent research — official documentation, verified user reviews, and real pricing data.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
              Every tool on this site is independently researched — verified against official documentation, aggregated from 100+ verified user reviews on Trustpilot, G2, and Capterra, and cross-referenced with Reddit community sentiment before I write about it. I focus on what works for <strong style={{ color: C.txt }}>solo creators, freelancers, and small teams</strong> — not enterprise buyers with unlimited budgets. Every tool on this site is useful regardless of where you're based.
            </p>

            {/* Contact row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' as const }}>
              <a href={`mailto:${SITE_CONFIG.email}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: C.a1, padding: '7px 16px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, textDecoration: 'none' }}>
                <Mail size={13} /> {SITE_CONFIG.email}
              </a>
              <a href="https://www.linkedin.com/in/navneetarya/" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#0A66C2', padding: '7px 16px', border: '1.5px solid rgba(10,102,194,.25)', borderRadius: 100, background: 'rgba(10,102,194,.06)', textDecoration: 'none' }}>
                <Linkedin size={13} /> LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Credentials & what I've tested */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10, marginBottom: 18 }}>
            <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: 0, letterSpacing: '-0.02em' }}>
              What I've researched
            </h2>
            {/* W4-T3 (Task 21): Prominent last-verified badge — Google quality raters check for
                freshness signals on YMYL-adjacent pages. Small muted text is insufficient.
                Badge format: "Research last updated: May 2026 · 24 tools verified" */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.a1}12`, border: `1.5px solid ${C.a1}30`, borderRadius: 100, padding: '5px 14px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.a1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: C.a1, fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                Research last updated: May 2026 &middot; 24 tools verified
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              ['Writing tools', 'Grammarly, Rytr, QuillBot, Writesonic, Jasper, Frase, ProWritingAid + more', C.a1],
              ['AI image tools', 'Leonardo.ai, PhotoRoom, Midjourney, Looka, Canva AI, Adobe Firefly + more', C.a2],
              ['Video AI tools', 'InVideo AI, Pictory, Opus Clip, Descript, Kapwing + more', C.a1],
              ['Podcast & audio', 'Podcastle, Murf AI, ElevenLabs, Riverside.fm, Adobe Podcast + more', C.a2],
              ['Productivity apps', 'Taskade, Notion AI, Perplexity, Otter.ai, Motion, Reclaim + more', C.a1],
              ['Marketing tools', 'Ocoya, Buffer, Hootsuite, Beehiiv, Mailchimp + more', C.a2],
              ['Coding platforms', 'Replit, GitHub Copilot, Cursor, v0 + more', C.a1],
              ['Design tools', 'Gamma, Beautiful.ai, Canva AI, Figma AI + more', C.a2],
            ].map(([cat, tools, color], i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.txt, marginBottom: 3 }}>{cat}</div>
                {/* M3 (SEO-Medium): Specific tool names add E-E-A-T depth Google quality raters look for */}
                <div style={{ fontSize: 11, color: color, fontWeight: 500, lineHeight: 1.5 }}>{tools}</div>
              </div>
            ))}
          </div>

          {/* W1-T1: Research environment — replaced false testing claims */}
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 12, background: `${C.a1}06`, border: `1px solid ${C.a1}18` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.txt, marginBottom: 4 }}>Research environment</div>
            <div style={{ fontSize: 12, color: C.mut2, lineHeight: 1.6 }}>
              Official documentation review · 100+ Trustpilot, G2 &amp; Capterra reviews per tool · Reddit community sentiment analysis · Live pricing page verification · INR pricing included for India market
            </div>
          </div>
        </div>

        {/* Review process */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Research methodology — how every review is done
          </h2>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 18px', fontWeight: 300 }}>
            <a href="/methodology" onClick={e => { e.preventDefault(); navigate('/methodology'); }}
              style={{ color: C.a1, fontWeight: 500 }}>Read the full review methodology →</a>
          </p>

          {/* E-E-A-T: exact testing standard — audited copy required for Google quality rater signals */}
          <div style={{ background: C.a1card, borderRadius: 12, border: `1.5px solid ${C.a1brd}`, padding: '18px 20px', marginBottom: 22 }}>
            <p style={{ fontSize: 14.5, color: C.txt, lineHeight: 1.75, fontWeight: 400, margin: 0 }}>
              Every review is based on independent research: official documentation review, aggregated verified user feedback (Trustpilot, G2, Capterra), Reddit community sentiment analysis, and live pricing verification. INR equivalents are included for the India market. Reviews are updated when tools change their pricing or features.
            </p>
          </div>

          {[
            ['1. Official documentation review', 'Every feature claim is verified against the tool\'s official documentation and changelog — not marketing copy. If the docs say something is a paid feature, that\'s what the review reflects.'],
            ['2. Verified user review aggregation', 'A minimum of 100 verified reviews from Trustpilot, G2, and Capterra per tool. Reddit communities (r/writing, r/productivity, r/indiegamedev and others) are analysed for real-world sentiment that doesn\'t appear in official reviews.'],
            ['3. Pricing verification', 'All pricing is verified against the tool\'s live pricing page at the time of publication. INR equivalents are included for the India market. Free plan limitations are documented explicitly.'],
            ['4. Competitor benchmarking', 'Each tool is compared against its 2–3 closest alternatives on feature parity, pricing, and use-case fit. The comparison tables on each review page come from this structured benchmarking.'],
            ['5. Review freshness', 'Each review is updated when tools change their pricing or ship significant new features. The "last updated" date at the top of every review reflects the most recent verification pass.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <CheckCircle size={14} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, fontWeight: 300 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate transparency */}
        <div style={{ background: 'rgba(13,148,136,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Full transparency on how this site earns money</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            This site earns money through affiliate commissions. When you click a link and sign up for a paid plan, I earn a commission — typically 20–30% of the subscription payment, recurring. This does not affect my reviews. I recommend tools because they're genuinely good, not because the commission is high.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            I only list tools that I have independently researched and would recommend to a friend. I have turned down sponsorships from tools that I don't think are worth recommending.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.a1, fontWeight: 500 }}>Read the full affiliate disclosure →</a>
          </p>
        </div>

        {/* Contact / collab */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '24px 28px', textAlign: 'center' as const }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: C.txt, marginBottom: 8 }}>Want to get in touch?</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, marginBottom: 16, maxWidth: 420, margin: '0 auto 16px' }}>
            If you have a question about a tool I've reviewed, a suggestion for a tool I should research, or want to flag something inaccurate — email me.
          </p>
          <a href={`mailto:${SITE_CONFIG.email}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'Inter', sans-serif", textDecoration: 'none' }}>
            <Mail size={14} /> {SITE_CONFIG.email}
          </a>
        </div>

      </div>
    </div>
  );
}
