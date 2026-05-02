import React from 'react';
import { CheckCircle, FlaskConical, Clock, Scale, ShieldCheck, BadgeDollarSign, Star } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(13%2C148%2C136%2C0.1)'/%3E%3C/svg%3E")`;

const STEPS = [
  {
    icon: FlaskConical,
    title: '1. I start on the free plan — always',
    body: `Every review starts from the same place a real user would: the free tier. If the free plan is confusing, limited in misleading ways, or requires a credit card to see anything useful, I say so. Most creators and small businesses trial tools for free before paying — a review that skips straight to the paid experience isn't useful for them.`,
  },
  {
    icon: Clock,
    title: '2. Minimum 2–4 weeks of real use before I write anything',
    body: `First impressions are almost always wrong — in both directions. Tools that feel impressive in a 10-minute demo often frustrate after three weeks of daily use. Tools that feel clunky on day one often reveal real strengths once you understand their logic. I don't publish a review until I've used the tool long enough for both the honeymoon effect and the initial frustration to wear off.`,
  },
  {
    icon: CheckCircle,
    title: '3. Real tasks only — not demo prompts',
    body: `I use tools on actual work: writing real blog posts in Rytr, recording a real podcast episode in Podcastle, scheduling a real week of social content in Ocoya, building a real small project in Replit. I don't run cherry-picked prompts designed to make the tool look good. The cons sections on my reviews exist because I pushed tools until they broke or frustrated me — and then I documented it.`,
  },
  {
    icon: Scale,
    title: '4. Head-to-head against 2–3 direct competitors',
    body: `No tool is reviewed in isolation. Before publishing, I run the same task through at least two competing tools — same brief, same input, same use case. The comparison tables in every review come from this side-by-side testing. If a competitor does something meaningfully better, I say so even if I'm recommending the tool I'm reviewing. My job is to help you make the right decision, not to sell you the tool I'm covering.`,
  },
  {
    icon: BadgeDollarSign,
    title: '5. I upgrade to a paid plan and test that too',
    body: `If the tool has meaningful paid features — and most do — I pay for at least one billing cycle and test those features as part of the review. The pricing section in each review is based on what the paid plan actually delivers at that price, not what the marketing page says it delivers. I've cancelled paid plans on tools I didn't think were worth recommending. I've kept paying for tools I do recommend.`,
  },
  {
    icon: ShieldCheck,
    title: '6. The affiliate programme is checked after the review is written',
    body: `I check whether a tool has an affiliate programme only after I've formed my view on the tool — not before. The rating, verdict, and recommendation are written independently of any commission. I have published critical reviews of tools that have affiliate programmes, and positive reviews of tools where I earn nothing. If commission shaped my recommendations, the site wouldn't be worth reading.`,
  },
  {
    icon: Star,
    title: '7. The one rule: would I pay for this myself?',
    body: `Every tool on this site passes a single final test before I recommend it: would I pay for it out of my own pocket, for my own work, if I had no affiliate relationship? If the answer is no, the tool doesn't get recommended — regardless of commission rate, regardless of how good the landing page looks. This is the only standard that keeps a review site honest over time.`,
  },
];

export function MethodologyPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const methodologySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `How I Review AI Tools — Testing Methodology | AI Nexus`,
    description: `The exact 7-step process ${SITE_CONFIG.authorName} uses to test every AI tool on AI Nexus. Real standards, paid plan testing, and the one rule that doesn't bend.`,
    url: `${SITE_CONFIG.siteUrl}/methodology`,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.authorName,
      url: `${SITE_CONFIG.siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI Nexus',
      url: SITE_CONFIG.siteUrl,
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="methodology" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>REVIEW METHODOLOGY</span>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,4vw,34px)', color: C.txt, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              How I Review AI Tools
            </h1>

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              Every "best AI tools" article I found before building this site was clearly written by someone who had never opened the products. Copying marketing copy and calling it a review isn't a review — it's spam with better formatting.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              The methodology below is the standard I hold every review on AI Nexus to. It's not aspirational — it's the process I actually follow. If a review is on this site, it went through these steps. If I couldn't test something properly, I haven't published a review of it.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300 }}>
              I publish these standards publicly because I think transparency about <em>how</em> a tool was tested matters as much as the verdict. You should know what "personally tested" means before you trust it.
            </p>
          </div>
        </div>

        {/* 7-step process */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            The 7-step testing process
          </h2>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 24px', fontWeight: 300 }}>Applied to every tool before a review is published</p>

          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 22 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={15} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.72, fontWeight: 300 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What "comparison table" means */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            What the comparison tables are based on
          </h2>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            Every comparison table in a review or comparison article is based on direct, simultaneous testing — the same task, the same input, run through multiple tools at the same time. I don't compile comparison data from other review sites or from the tools' own marketing materials.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            The ratings (out of 5) are my personal assessment across five dimensions: output quality, ease of use, pricing fairness, free plan generosity, and reliability over the testing period. They are not averaged from user reviews or third-party databases.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            When a tool updates significantly after publication — a major pricing change, a new model, a feature that changes my verdict — I update the review and change the "last tested" date at the top of the page.
          </p>
        </div>

        {/* What I don't do */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Standards I don't compromise
          </h2>
          {[
            ['No sponsored reviews', 'I don\'t accept payment from tool companies to write positive reviews, publish "sponsored" content labelled as editorial, or adjust ratings in exchange for extended trial access or other benefits.'],
            ['No review-bombing or inflating scores', 'I don\'t give artificially high scores to tools I want to promote, or artificially low scores to tools I don\'t have an affiliate relationship with. Scores reflect my genuine assessment after testing.'],
            ['No paywalled reviews', 'Every review on this site is free to read. I don\'t lock detailed test results or verdicts behind a newsletter subscription or paywall.'],
            ['No "round-up" reviews of tools I haven\'t used', 'If I haven\'t personally tested a tool for at least 2 weeks on real work, it doesn\'t appear in a comparative round-up on this site. I\'d rather publish fewer reviews than pad the list with tools I can\'t honestly evaluate.'],
          ].map(([heading, body], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 18 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <CheckCircle size={14} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 4 }}>{heading}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, fontWeight: 300 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate transparency */}
        <div style={{ background: 'rgba(13,148,136,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Affiliate links — the full picture</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            This site earns revenue through affiliate commissions — when you click a link and sign up for a paid plan, I earn a percentage of the subscription. Commissions range from 20–30% recurring, depending on the tool.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            Every tool I link to is one I've personally tested and would recommend regardless of the commission structure. I've declined to list tools with high commission rates that I didn't think were good enough. I've published reviews of tools I earn nothing from because they were genuinely useful.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            The commission doesn't cost you anything — it's paid by the tool company, not added to your price.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.a1, fontWeight: 500 }}>Read the full affiliate disclosure →</a>
          </p>
        </div>

        {/* Back links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <button onClick={() => navigate('/about')}
            style={{ fontSize: 13, fontWeight: 500, color: C.a1, padding: '8px 18px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            ← About {SITE_CONFIG.authorName}
          </button>
          <button onClick={() => navigate('/')}
            style={{ fontSize: 13, fontWeight: 500, color: C.mut2, padding: '8px 18px', border: `1.5px solid ${C.barBrd}`, borderRadius: 100, background: C.surf, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Browse all reviews
          </button>
        </div>

      </div>
    </div>
  );
}
