import React from 'react';
import { CheckCircle, FlaskConical, Clock, Scale, ShieldCheck, BadgeDollarSign, Star, UserCheck, Search, BarChart2 } from 'lucide-react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';
import { Breadcrumb } from '../components/Breadcrumb';

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
    title: '2. Published user feedback',
    body: `Ratings and review text published on Trustpilot, G2, and Capterra are read where a tool has them. Published reviews surface problems that marketing copy never will — support response times, billing friction, feature gaps that appear only after prolonged use. Relevant community discussions (Reddit and product forums) are also checked for real-world sentiment that doesn't appear on structured review platforms. The amount of published feedback differs from tool to tool, so no fixed review count is promised.`,
  },
  {
    icon: CheckCircle,
    title: '3. Pricing verification',
    body: `All pricing is verified against the tool's live pricing page at the time of publication — not cached data, not third-party price aggregators. Free plan limitations are documented explicitly: what the free tier actually includes, what it excludes, and whether a credit card is required to access it. INR equivalents are included for Indian creators and freelancers, since USD pricing doesn't reflect local purchasing power.`,
  },
  {
    icon: Scale,
    title: '4. Competitor comparison',
    body: `No tool is reviewed in isolation. Each tool is compared against its closest alternatives on feature parity, pricing, and use-case fit, using the same criteria each time. The comparison tables are compiled from public documentation and pricing pages, not from hands-on benchmark runs. If a competitor does something meaningfully better, the review says so. The goal is to help you make the right choice, not to rank the tool being reviewed as highly as possible.`,
  },
  {
    icon: Star,
    title: '5. Review freshness — updated on tool changes',
    body: `AI tool pricing and features change frequently. Each review is updated when tools ship significant new features, change their pricing, or discontinue features that the review relies on. The "last updated" date at the top of every review reflects the most recent verification pass. Reviews that haven't been updated in over 6 months are flagged for re-verification before any recommendation is made.`,
  },
];

// Research steps — desk research from public sources. Keep in sync with the methodology
// block in scripts/prerender.mjs (prerendered copy read by crawlers and AI tools).
const RESEARCH_STEPS = [
  {
    icon: UserCheck,
    step: 'Step 1',
    action: 'Official documentation review',
    detail: 'Features, limits, and plan rules are read from the vendor\'s official documentation, help centre, and changelog. If the docs say a feature is paid-only, limited, or in beta, the review says so. AI Nexus does not perform hands-on product testing, so anything the documentation does not state is not asserted. Every feature claim is cross-referenced against official docs before it appears in a review.',
  },
  {
    icon: ShieldCheck,
    step: 'Step 2',
    action: 'Free plan claim verification',
    detail: 'Every free tier claim is checked against the tool\'s official documentation, pricing page, and published user reports — not just what its marketing page promises. This step documents whether a credit card is required to access the free plan, whether "free" features are rate-limited or watermarked, and where advertised free capabilities require a paid upgrade to use in practice. INR equivalents are included for Indian creators, since USD pricing does not reflect local purchasing power. This is the step that catches the most common deceptive pattern in AI tool marketing: advertising a feature as free when it is only available on a paid plan.',
  },
  {
    icon: Search,
    step: 'Step 3',
    action: 'Published user review analysis',
    detail: 'Ratings and review text published on Trustpilot, G2, and Capterra are read where they exist, favouring reviews the platform marks as verified. Recurring complaints (support, billing, feature gaps) and recurring praise points are tagged. Reading across platforms prevents any single platform\'s review distribution from skewing the verdict. Review volume differs by tool, so no fixed review count is promised.',
  },
  {
    icon: BarChart2,
    step: 'Step 4',
    action: 'Community discussion check',
    detail: 'Relevant discussions on Reddit and product forums are read for long-term frustrations — cancellation problems, hidden charges, feature degradations — that don\'t always appear on structured review platforms. Community posts are anecdotal, so they are treated as signals to check against documentation, not as proof.',
  },
  {
    icon: BadgeDollarSign,
    step: 'Step 5',
    action: 'Live pricing page verification',
    detail: 'The tool\'s pricing page is checked directly and every tier is documented: exact price, billing frequency, what\'s included, what requires an upgrade, whether a credit card is required for the free plan, and the cancellation terms. Pricing is never pulled from third-party aggregators — it goes stale within weeks.',
  },
  {
    icon: Scale,
    step: 'Step 6',
    action: 'Feature comparison against close alternatives',
    detail: 'The tool\'s key features are mapped against its closest alternatives across free plan quality, pricing, documented capabilities, and unique differentiators. The comparison tables are compiled from public documentation and pricing pages, not from hands-on benchmark runs.',
  },
];

export function MethodologyPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const methodologySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `How I Research AI Tools — Research Methodology | AI Nexus`,
    description: `How ${SITE_CONFIG.authorName} researches and compares every AI tool on AI Nexus: official documentation, published user reviews, live pricing verification, community discussion, and competitor comparison. Desk research from public sources — no hands-on product testing.`,
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
    dateModified: '2026-11-03',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(methodologySchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="methodology" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        <Breadcrumb navigate={navigate} crumbs={[{ label: 'Home', href: '/' }, { label: 'Review Methodology' }]} />

        {/* Hero card */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${C.a1brd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: 10, marginBottom: 18 }}>
              <span style={{ display: 'inline-block', background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100 }}>REVIEW METHODOLOGY</span>
              {/* W4-T3 (Task 21): Prominent freshness badge at page top — quality raters check this */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${C.a1}12`, border: `1.5px solid ${C.a1}30`, borderRadius: 100, padding: '5px 14px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.a1, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.a1, fontFamily: "'Inter', sans-serif", letterSpacing: '0.01em' }}>
                  Methodology last updated: November 2026
                </span>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,4vw,34px)', color: C.txt, margin: '0 0 16px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              How I Research AI Tools
            </h1>

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              Many "best AI tools" articles I found before building this site simply repeat vendor marketing copy. Repeating a vendor's pitch and calling it a review isn't a review — it's marketing with better formatting.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300, marginBottom: 14 }}>
              The methodology below is the standard I hold every review on AI Nexus to. It is desk research from public sources — official documentation, pricing pages, published user reviews, and community discussion. I don't test each product hands-on. If I couldn't research something properly, I haven't published a review of it.
            </p>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.78, fontWeight: 300 }}>
              I publish these standards publicly because I think transparency about <em>how</em> a tool was researched matters as much as the verdict. You should know what "independently researched" means before you trust it.
            </p>

            {/* T2.4: Stats strip — quantified proof of research depth */}
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10, marginTop: 22 }}>
              {[
                { label: 'Categories covered', value: '8' },
                { label: 'Research method', value: 'Desk research' },
                { label: 'Hands-on product testing', value: 'None' },
                { label: 'Methodology last updated', value: 'November 2026' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 10, padding: '8px 14px', textAlign: 'center' as const }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.a1 }}>{value}</div>
                  <div style={{ fontSize: 11, color: C.mut2, fontWeight: 400 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5-step research principles */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            The 5-step research process
          </h2>
          {/* AEO: concise answer paragraph after H2 (40-200 chars) */}
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 24px', fontWeight: 300 }}>Applied to every tool before a review is published — official docs, published user reviews, live pricing, community discussion, and competitor comparison.</p>

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

        {/* Research steps in detail. Desk research from public sources — no per-step timings or
             hands-on testing claims. Keep in sync with the methodology block in scripts/prerender.mjs. */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            How each tool is researched, step by step
          </h2>
          {/* AEO: concise answer paragraph after H2 */}
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 12px', fontWeight: 300 }}>
            Six steps applied to every tool, each based on public sources — documentation, pricing pages, published reviews, and community discussion.
          </p>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
            Documented Research Process — Desk Research From Public Sources
          </h3>

          {RESEARCH_STEPS.map(({ icon: Icon, step, action, detail }, i) => (
            <div
              key={i}
              style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                paddingBottom: i < RESEARCH_STEPS.length - 1 ? 20 : 0,
                marginBottom: i < RESEARCH_STEPS.length - 1 ? 20 : 0,
                borderBottom: i < RESEARCH_STEPS.length - 1 ? `1px solid ${C.barBrd}` : 'none',
              }}
            >
              {/* Step number circle */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={C.a1} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.a1, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{step}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt }}>{action}</span>
                </div>
                <div style={{ fontSize: 13, color: C.mut, lineHeight: 1.7, fontWeight: 300 }}>{detail}</div>
              </div>
            </div>
          ))}

          {/* Scope note */}
          <div style={{ marginTop: 22, padding: '14px 18px', background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.txt, marginBottom: 4 }}>What this research does not include</div>
            <div style={{ fontSize: 13, color: C.mut, lineHeight: 1.7, fontWeight: 300 }}>
              AI Nexus does not sign up for and test each product hands-on, so reviews do not contain first-person usage claims, original screenshots, output samples, or benchmark results. Where something could not be confirmed from a public source, it is left out or marked as unverified.
            </div>
          </div>
        </div>

        {/* What "comparison table" means */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            What the comparison tables are based on
          </h2>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            Every comparison table in a review or comparison article is a side-by-side comparison — the same evaluation criteria applied to each competing tool. Data is drawn from official documentation, published user reviews, and live pricing pages, not from hands-on benchmark runs. Comparison data is not copied from other review sites or from the tools' own marketing materials.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 12 }}>
            The ratings (out of 5) are an independent assessment across five dimensions: output quality (based on documented user feedback), ease of use (based on G2/Capterra usability scores), pricing fairness, free plan generosity, and reliability (based on verified user reports over time).
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
            When a tool updates significantly after publication — a major pricing change, a new model, a feature that changes my verdict — I update the review and change the "last verified" date at the top of the page.
          </p>
        </div>

        {/* W4-T4: Research criteria scoring section */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            How each rating is scored
          </h2>
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 20px', fontWeight: 300 }}>
            The 5 criteria behind every tool's rating — and how much each one weighs
          </p>

          {[
            {
              icon: BadgeDollarSign,
              label: 'Pricing fairness',
              weight: '25%',
              desc: 'Does the price reflect real-world value at the feature tier? Compared against direct competitors at the same price bracket. INR equivalent is checked against purchasing power parity — a ₹1,500/month tool is held to a different standard than a $15/month USD-priced tool.',
            },
            {
              icon: Star,
              label: 'Free plan quality',
              weight: '20%',
              desc: 'Is the free plan genuinely usable, or is it a locked demo designed to frustrate? A free plan scores high if a real user can accomplish meaningful work without paying. Word limits, watermarks, export restrictions, and credit-card requirements are all counted against.',
            },
            {
              icon: CheckCircle,
              label: 'Output accuracy',
              weight: '25%',
              desc: 'Does the tool do what it claims, reliably? For writing tools: grammar accuracy and output coherence. For image tools: prompt adherence and consistency. Measured against verified G2, Capterra, and Trustpilot data — not the tool\'s own marketing claims.',
            },
            {
              icon: FlaskConical,
              label: 'Ease of use',
              weight: '15%',
              desc: 'Can a non-technical user accomplish the core task within 10 minutes of signing up? Based on usability scores from verified review platforms and the documented onboarding flow. Tools that require CLI setup or documentation-heavy configuration score lower here.',
            },
            {
              icon: ShieldCheck,
              label: 'Reliability & support',
              weight: '15%',
              desc: 'Does the tool stay up, and does the company respond when things go wrong? Outage history from verified sources, support response time from user reports, and billing/cancellation transparency all factor in. Subscription traps (hard to cancel, unexpected charges) drop the score significantly.',
            },
          ].map(({ icon: Icon, label, weight, desc }, i, arr) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < arr.length - 1 ? 20 : 0, alignItems: 'flex-start', paddingBottom: i < arr.length - 1 ? 20 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.barBrd}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.a1card, border: `1px solid ${C.a1brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <Icon size={15} color={C.a1} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: C.txt }}>{label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.a1, background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 100, padding: '2px 10px', letterSpacing: '0.06em' }}>{weight}</span>
                </div>
                <div style={{ height: 4, background: C.barBg, borderRadius: 99, marginBottom: 8, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: weight, background: `linear-gradient(90deg,${C.a1},${C.a2})`, borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 13, color: C.mut, lineHeight: 1.7, fontWeight: 300 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* What I don't do */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            What I Don't Do
          </h2>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 16 }}>
            I don't copy marketing copy from tool vendor websites. I don't accept payment for positive reviews. I don't publish a review until I've verified the pricing independently.
          </p>
          {[
            ['No sponsored reviews', 'I don\'t accept payment from tool companies to write positive reviews, publish "sponsored" content labelled as editorial, or adjust ratings in exchange for extended trial access or other benefits.'],
            ['No review-bombing or inflating scores', 'I don\'t give artificially high scores to tools I want to promote, or artificially low scores to tools I don\'t have an affiliate relationship with. Scores reflect my genuine assessment after reviewing official documentation, pricing, and published user feedback.'],
            ['No paywalled reviews', 'Every review on this site is free to read. I don\'t lock detailed research notes or verdicts behind a newsletter subscription or paywall.'],
            ['No "round-up" reviews of tools not properly researched', 'If a tool hasn\'t been verified against official documentation and published user reviews, it doesn\'t appear in a comparative round-up on this site. We\'d rather publish fewer reviews than pad the list with tools we can\'t honestly evaluate.'],
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

        {/* Author credentials — GEO E-E-A-T signals */}
        <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            About the Researcher
          </h2>
          {/* AEO: concise answer paragraph */}
          <p style={{ fontSize: 13, color: C.mut2, margin: '0 0 16px', fontWeight: 300 }}>
            Navneet Arya is an AI automation and performance testing leader with 13+ years in enterprise technology and product evaluation.
          </p>
          {/* GEO: Author credentials with key-value patterns */}
          <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px 20px' }}>
            {([
              { label: 'Background', val: '13+ years enterprise tech, AI automation, and performance testing' },
              { label: 'AI Research', val: 'Independently evaluating AI tools since 2022' },
              { label: 'Tools Evaluated', val: 'AI tools researched across 8 categories' },
              { label: 'Review Process', val: 'Desk research from public sources (documented methodology); no hands-on product testing' },
              { label: 'Standards', val: 'Zero sponsored reviews, independent verification only' },
              { label: 'Current Role', val: 'AI Automation & Performance Testing Leader, BOLD' },
            ] as const).map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <dt style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12, color: C.a1, flexShrink: 0 }}>{label}:</dt>
                <dd style={{ margin: 0, fontSize: 12, color: C.mut, lineHeight: 1.6 }}>{val}</dd>
              </div>
            ))}
          </dl>
          <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.7, marginTop: 14 }}>
            All reviews on this site reflect independent desk research verified against official documentation, live pricing, and published user reviews. No tool receives preferential ranking based on commission structure or affiliate relationships.
          </p>
        </div>

        {/* Affiliate transparency */}
        <div style={{ background: 'rgba(13,148,136,.04)', borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '22px 26px', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Affiliate links — the full picture</div>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            This site earns revenue through affiliate commissions — when you click a link and sign up for a paid plan, I may earn a commission. Rates and terms vary by program.
          </p>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300, marginBottom: 10 }}>
            Every tool we link to has been researched using the process above, and commission structure doesn't decide which tools are covered or how they are rated. We've published reviews of tools we earn nothing from because they were genuinely useful.
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
