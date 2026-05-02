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

  const authorSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": SITE_CONFIG.authorName,
    "url": `${SITE_CONFIG.siteUrl}/about`,
    "image": `${SITE_CONFIG.siteUrl}/author-photo.jpg`,
    "description": SITE_CONFIG.authorBio,
    "sameAs": ["https://www.linkedin.com/in/navneetarya/"],
    "knowsAbout": ["Artificial Intelligence", "AI Tools", "Content Creation", "Podcast Software", "Productivity Software", "Writing Tools"],
    "worksFor": {
      "@type": "Organization",
      "name": "AI Nexus",
      "url": SITE_CONFIG.siteUrl
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="about" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Author hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>ABOUT THE REVIEWER</span>

            {/* Author identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg,${C.a1},${C.a2})`, padding: 3, boxShadow: `0 0 0 3px ${C.a1card}, 0 4px 16px rgba(13,148,136,.25)` }}>
                  <img
                    src="/author-photo.jpg"
                    alt="Navneet Arya — founder of AI Nexus"
                    width={74} height={74}
                    style={{ width: 74, height: 74, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                  />
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 18, height: 18, borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff' }}/>
                </div>
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(22px,4vw,32px)', color: C.txt, margin: '0 0 4px', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
                  {SITE_CONFIG.authorName}
                </h1>
                <div style={{ fontSize: 13, color: C.mut2 }}>Founder, AI Nexus</div>
              </div>
            </div>

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>
              {SITE_CONFIG.authorBio}
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 14 }}>
              I built AI Nexus because every "best AI tools" article I found was clearly written by someone who had never actually opened the products. Review sites were copying marketing pages and calling it a review. I got frustrated and decided to build something where every single review comes from real, personal usage.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
              Every tool on this site has been signed up for, tested on real work tasks, and used for at least 2–4 weeks before I write about it. I focus on what works for <strong style={{ color: C.txt }}>solo creators, freelancers, and small teams</strong> — not enterprise buyers with unlimited budgets. Every tool on this site is useful regardless of where you're based.
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
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            What I've actually tested
          </h2>
          <p style={{ fontSize: 14, color: C.mut2, margin: '0 0 20px', fontWeight: 300 }}>Updated April 2026</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {[
              ['Writing tools', '12+ tools tested', C.a1],
              ['AI image tools', '8+ tools tested', C.a2],
              ['Video AI tools', '7+ tools tested', C.a1],
              ['Podcast & audio', '6+ tools tested', C.a2],
              ['Productivity apps', '9+ tools tested', C.a1],
              ['Marketing tools', '5+ tools tested', C.a2],
              ['Coding platforms', '4+ tools tested', C.a1],
              ['Design tools', '6+ tools tested', C.a2],
            ].map(([cat, count, color], i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.txt, marginBottom: 3 }}>{cat}</div>
                <div style={{ fontSize: 12, color: color, fontWeight: 500 }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review process */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Testing methodology — how every review is done
          </h2>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 18px', fontWeight: 300 }}>
            <a href="/methodology" onClick={e => { e.preventDefault(); navigate('/methodology'); }}
              style={{ color: C.a1, fontWeight: 500 }}>Read the full review methodology →</a>
          </p>
          {[
            ['1. Sign up on the free plan', 'Every tool is tested starting from the free tier — because that\'s where most creators and small businesses start. If the free plan is terrible, I say so.'],
            ['2. Use it for real tasks', 'Not demo tasks. Real work: writing actual blog posts, editing actual podcast audio, creating actual social media captions, building actual code projects.'],
            ['3. Test for at least 2–4 weeks', 'First impressions are almost always wrong. Tools need time to reveal their real strengths and their real weaknesses. Most negative experiences happen after week 1.'],
            ['4. Document what breaks or frustrates', 'The "cons" sections are where most review sites fail. I specifically push tools to their limits and document what frustrates me.'],
            ['5. Compare against direct competitors', 'I run the same task on 2–3 competing tools. The comparison tables on each review page come from actual side-by-side testing.'],
            ['6. Check the affiliate program separately', 'I evaluate the tool first, then check if it has an affiliate program. The review is never shaped by whether I earn commission. I have negative things to say about tools I earn from.'],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <CheckCircle size={14} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, fontWeight: 300 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate transparency */}
        <div style={{ background: 'rgba(13,148,136,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Full transparency on how this site earns money</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            This site earns money through affiliate commissions. When you click a link and sign up for a paid plan, I earn a commission — typically 20–30% of the subscription payment, recurring. This does not affect my reviews. I recommend tools because they're genuinely good, not because the commission is high.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            I only list tools that I have personally tested and would recommend to a friend. I have turned down sponsorships from tools that I don't think are worth recommending.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.a1, fontWeight: 500 }}>Read the full affiliate disclosure →</a>
          </p>
        </div>

        {/* Contact / collab */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '24px 28px', textAlign: 'center' as const }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: C.txt, marginBottom: 8 }}>Want to get in touch?</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, marginBottom: 16, maxWidth: 420, margin: '0 auto 16px' }}>
            If you have a question about a tool I've reviewed, a suggestion for a tool I should test, or want to flag something inaccurate — email me.
          </p>
          <a href={`mailto:${SITE_CONFIG.email}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif", textDecoration: 'none' }}>
            <Mail size={14} /> {SITE_CONFIG.email}
          </a>
        </div>

      </div>
    </div>
  );
}
