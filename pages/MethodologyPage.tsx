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
    title: '1. Official documentation review',
    body: `Every feature claim is verified against the tool's official documentation and changelog — not marketing copy or third-party summaries. If the official docs say a feature is paid-only, limited, or in beta, that's what the review reflects. This is the foundation that prevents the single most common review site failure: republishing a tool's own marketing as if it were independent analysis.`,
  },
  {
    icon: Clock,
    title: '2. Verified user review aggregation',
    body: `A minimum of 100 verified reviews from Trustpilot, G2, and Capterra are analysed for each tool before publication. Verified-purchase reviews surface problems that marketing copy never will — support response times, billing friction, feature gaps that appear only after prolonged use. Reddit communities (r/writing, r/productivity, r/indiegamedev and others) are also analysed for real-world sentiment that doesn't appear in structured review platforms.`,
  },
  {
    icon: CheckCircle,
    title: '3. Pricing verification',
    body: `All pricing is verified against the tool's live pricing page at the time of publication — not cached data, not third-party price aggregators. Free plan limitations are documented explicitly: what the free tier actually includes, what it excludes, and whether a credit card is required to access it. INR equivalents are included for Indian creators and freelancers, since USD pricing doesn't reflect local purchasing power.`,
  },
  {
    icon: Scale,
    title: '4. Competitor benchmarking',
    body: `No tool is reviewed in isolation. Each tool is compared against its 2–3 closest alternatives on feature parity, pricing, and use-case fit. The comparison tables in every review come from structured, side-by-side benchmarking — the same evaluation criteria applied to each competing tool. If a competitor does something meaningfully better, the review says so. The goal is to help you make the right choice, not to rank the tool being reviewed as highly as possible.`,
  },
  {
    icon: Star,
    title: '5. Review freshness — updated on tool changes',
    body: `AI tool pricing and features change frequently. Each review is updated when tools ship significant new features, change their pricing, or discontinue features that the review relies on. The "last updated" date at the top of every review reflects the most recent verification pass. Reviews that haven't been updated in over 6 months are flagged for re-verification before any recommendation is made.`,
  },
];

export function MethodologyPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const methodologySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `How I Review AI Tools — Testing Methodology | AI Nexus`,
    description: `The exact 5-step process ${SITE_CONFIG.authorName} uses to independently research every AI tool on AI Nexus. Real standards, verified sources, and the one rule that doesn't bend.`,
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
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="methodology" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        {/* Hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>REVIEW METHODOLOGY</span>

            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,4vw,34px)', color: C.txt, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              How I Research AI Tools
            </h1>

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              Every "best AI tools" article I found before building this site was clearly written by someone who had never opened the products. Copying marketing copy and calling it a review isn't a review — it's spam with better formatting.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              The methodology below is the standard I hold every review on AI Nexus to. It's not aspirational — it's the process every review on this site goes through. If a review is on this site, it went through these steps. If I couldn't research something properly, I haven't published a review of it.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300 }}>
              I publish these standards publicly because I think transparency about <em>how</em> a tool was researched matters as much as the verdict. You should know what "independently researched" means before you trust it.
            </p>
          </div>
        </div>

        {/* 7-step process */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            The 5-step research process
          </h2>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 24px', fontWeight: 300 }}>Applied to every tool before a review is published</p>

          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 22 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={15} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.72, fontWeight: 300 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What "comparison table" means */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            What the comparison tables are based on
          </h2>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            Every comparison table in a review or comparison article is based on structured, side-by-side benchmarking — the same evaluation criteria applied to each competing tool at the same time. Data is drawn from official documentation, verified user reviews, and live pricing pages. We don't compile comparison data from other review sites or from the tools' own marketing materials.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            The ratings (out of 5) are an independent assessment across five dimensions: output quality (based on documented user feedback), ease of use (based on G2/Capterra usability scores), pricing fairness, free plan generosity, and reliability (based on verified user reports over time).
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            When a tool updates significantly after publication — a major pricing change, a new model, a feature that changes my verdict — I update the review and change the "last tested" date at the top of the page.
          </p>
        </div>

        {/* What I don't do */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            Standards I don't compromise
          </h2>
          {[
            ['No sponsored reviews', 'I don\'t accept payment from tool companies to write positive reviews, publish "sponsored" content labelled as editorial, or adjust ratings in exchange for extended trial access or other benefits.'],
            ['No review-bombing or inflating scores', 'I don\'t give artificially high scores to tools I want to promote, or artificially low scores to tools I don\'t have an affiliate relationship with. Scores reflect my genuine assessment after testing.'],
            ['No paywalled reviews', 'Every review on this site is free to read. I don\'t lock detailed test results or verdicts behind a newsletter subscription or paywall.'],
            ['No "round-up" reviews of tools not properly researched', 'If a tool hasn\'t been verified against official documentation and aggregated user reviews, it doesn\'t appear in a comparative round-up on this site. We\'d rather publish fewer reviews than pad the list with tools we can\'t honestly evaluate.'],
          ].map(([heading, body], i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 3 ? 18 : 0, alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                <CheckCircle size={14} color={C.a1} />
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, marginBottom: 4 }}>{heading}</div>
                <div style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, fontWeight: 300 }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate transparency */}
        <div style={{ background: 'rgba(13,148,136,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Affiliate links — the full picture</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            This site earns revenue through affiliate commissions — when you click a link and sign up for a paid plan, I earn a percentage of the subscription. Commissions range from 20–30% recurring, depending on the tool.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            Every tool we link to is one that has been independently researched and would be recommended regardless of the commission structure. We've declined to list tools with high commission rates that didn't meet our research standards. We've published reviews of tools we earn nothing from because they were genuinely useful.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            The commission doesn't cost you anything — it's paid by the tool company, not added to your price.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color: C.a1, fontWeight: 500 }}>Read the full affiliate disclosure →</a>
          </p>
        </div>

        {/* Back links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <button onClick={() => navigate('/about')}
            style={{ fontSize: 13, fontWeight: 500, color: C.a1, padding: '8px 18px', border: `1.5px solid ${C.a1brd}`, borderRadius: 100, background: C.a1card, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}>
            ← About {SITE_CONFIG.authorName}
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
