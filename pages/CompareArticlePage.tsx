import React from 'react';
import { ArrowLeft, ExternalLink, Check, X, ChevronRight } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg: '#F5F4FF', surf: '#FFFFFF', a1: '#5B21B6', a2: '#06B6D4',
  txt: '#0F0F1A', mut: 'rgba(15,15,26,.66)', mut2: 'rgba(15,15,26,.38)',
  a1card: 'rgba(91,33,182,.065)', a1brd: 'rgba(91,33,182,.18)',
  barBg: 'rgba(245,244,255,.97)', barBrd: 'rgba(91,33,182,.13)',
};

// ── Compare article data ───────────────────────────────────────────────────
export interface CompareArticle {
  slug: string;
  title: string;
  metaDescription: string;
  keyword: string;
  publishDate: string;
  intro: string;
  sections: CompareSection[];
  verdict: string;
  comparisonTable: CompareRow[];
  winnerSlug: string;   // tool slug for CTA link
  winnerName: string;
  winnerAffiliateLink: string;
  winnerAffiliateText: string;
}

export interface CompareSection {
  heading: string;
  content: string;   // may contain simple markdown **bold** and line breaks
}

export interface CompareRow {
  name: string;
  price: string;
  priceINR: string;
  freeplan: boolean;
  aiContent: string;
  platforms: string;
  bestFor: string;
  ourPick: boolean;
}

export const COMPARE_ARTICLES: CompareArticle[] = [
  {
    slug: 'ocoya-vs-buffer-vs-hootsuite',
    title: 'Ocoya vs Buffer vs Hootsuite (2026): Which Social Media Tool Is Actually Worth It?',
    metaDescription: 'Comparing Ocoya, Buffer, and Hootsuite for small businesses and solo creators. Real pricing in INR, real features, and which one wins for Indian freelancers on a budget.',
    keyword: 'ocoya vs buffer vs hootsuite',
    publishDate: 'April 2026',
    intro: `I've been managing social media for a few side projects over the past year, and I've had paid accounts on all three of these tools at different points. Here's the honest breakdown — no fluff, no affiliate cheerleading.

The short answer: if you're a solo creator or small business, Buffer is overrated, Hootsuite is overkill, and Ocoya is the tool most people haven't heard of yet — but probably should be using.`,
    sections: [
      {
        heading: 'What you're actually trying to solve',
        content: `Before comparing tools, get clear on your actual need. Most small businesses and freelancers need three things: schedule posts in advance across platforms, generate captions without starting from scratch every time, and not pay ₹8,000/month for the privilege.

That's it. None of these tools need to be Salesforce.`,
      },
      {
        heading: 'Buffer — Clean, but the AI is an afterthought',
        content: `Buffer ($6–18/month, ~₹500–1,500) has the cleanest UI of the three. Scheduling is dead simple. The analytics are honest and readable.

But here's the problem in 2026: the AI content features feel bolted on. Buffer's AI assistant is essentially a prompt box that calls a generic language model — it has no awareness of your brand, your previous posts, or what platform you're scheduling for. You write the caption, then ask it to "improve" it. That's not AI-native; that's AI as a polish layer.

For pure scheduling without content creation: Buffer is fine. For anyone who also wants help writing, you'll end up paying for Buffer plus something else.

**Platforms supported:** Instagram, Facebook, LinkedIn, Twitter/X, Pinterest, TikTok, Google Business.

**Who it's for:** Solopreneurs who already have a content system and just need a clean scheduler.`,
      },
      {
        heading: 'Hootsuite — Powerful, built for teams, priced accordingly',
        content: `Hootsuite starts at $99/month (~₹8,300). The cheapest plan allows one user and 10 social accounts. The next tier is $249/month.

If you're an agency managing 20+ client accounts with a team of five, Hootsuite makes sense. The reporting is deep, the approval workflows are solid, and the integrations are enterprise-grade.

If you're a freelancer or small business owner in India, Hootsuite is a waste of money. You're paying for features you'll never use.

The AI content features exist but feel like a recent addition to compete with newer tools — not something built into the core product from day one.

**Who it's for:** Agencies, marketing teams, anyone managing 10+ accounts for clients.`,
      },
      {
        heading: 'Ocoya — The one tool that actually combines both jobs',
        content: `Ocoya ($15/month, ~₹1,260) sits in the gap between "just a scheduler" and "just an AI writer." It does both natively, in the same dashboard.

Here's what that actually looks like in practice: you open Ocoya, drop in a topic or paste an image, and it generates platform-specific captions — not one generic caption repurposed for everywhere, but content written differently for LinkedIn's professional tone versus Instagram's conversational style. Then you schedule it without leaving the tool.

That single-workflow difference is underrated. Buffer + a separate AI writing tool means two logins, two monthly charges, and copy-pasting between apps. Ocoya is one place.

What else works well: the template library (40+ use-case starters), multi-platform scheduling across Instagram, LinkedIn, Twitter/X, Facebook, Pinterest, TikTok, and Google Business, plus a link-in-bio page builder included at no extra cost.

**Where Ocoya falls short:** If you're managing 15+ client accounts or need white-label reporting for agencies, Hootsuite still wins. Ocoya is optimised for the solo creator to 5-person team range.

**Who it's for:** Freelancers, content creators, small businesses, Indian solopreneurs who want one tool instead of two.`,
      },
    ],
    verdict: `For most people reading this — especially Indian freelancers and solo creators — start with Ocoya's free trial. If you're spending time writing captions manually and then copying them into a scheduler, Ocoya collapses that into one workflow for ₹1,260/month. That's less than most people spend on Swiggy in a week.

If you truly just want scheduling and already have a content pipeline: Buffer at ₹500/month is fine.

If someone is trying to sell you Hootsuite for a small business: they're overselling you.`,
    comparisonTable: [
      { name: 'Ocoya', price: '$15–$99/mo', priceINR: '₹1,260–₹8,300', freeplan: false, aiContent: 'Native (platform-aware)', platforms: '7+', bestFor: 'Content + scheduling combo', ourPick: true },
      { name: 'Buffer', price: '$6–$120/mo', priceINR: '₹500–₹10,000', freeplan: true, aiContent: 'Basic (generic prompt)', platforms: '7', bestFor: 'Pure scheduling only', ourPick: false },
      { name: 'Hootsuite', price: '$99–$739/mo', priceINR: '₹8,300+', freeplan: false, aiContent: 'Basic (recent add-on)', platforms: '35+', bestFor: 'Agencies & large teams', ourPick: false },
    ],
    winnerSlug: 'ocoya',
    winnerName: 'Ocoya',
    winnerAffiliateLink: 'https://www.ocoya.com/?via=navneet',
    winnerAffiliateText: 'Try Ocoya free',
  },
];

// ── Helper: parse inline **bold** markdown ────────────────────────────────
function renderContent(text: string) {
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={j}>{chunk.slice(2, -2)}</strong>;
      }
      return <span key={j}>{chunk}</span>;
    });
    return (
      <p key={i} style={{ margin: '0 0 1rem', lineHeight: 1.75, color: C.txt }}>
        {parts}
      </p>
    );
  });
}

// ── Main Component ─────────────────────────────────────────────────────────
interface Props {
  article: CompareArticle;
  navigate: (to: string) => void;
}

export function CompareArticlePage({ article, navigate }: Props) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.barBg, borderBottom: `1px solid ${C.barBrd}`,
        backdropFilter: 'blur(12px)',
        padding: '0 1.25rem',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', alignItems: 'center', height: 56, gap: '1rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.mut, fontSize: 14 }}
          >
            <ArrowLeft size={16} /> Back to reviews
          </button>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: C.a1, letterSpacing: '-0.02em' }}>AI Nexus</span>
        </div>
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.mut2, marginBottom: '1.5rem' }}>
          <span style={{ cursor: 'pointer', color: C.a1 }} onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={12} />
          <span>Compare</span>
          <ChevronRight size={12} />
          <span>{article.keyword}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: C.txt, lineHeight: 1.2, margin: '0 0 0.75rem', letterSpacing: '-0.03em' }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: 13, color: C.mut, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <span>By {SITE_CONFIG.authorName}</span>
          <span>Updated {article.publishDate}</span>
          <span style={{ color: C.a1, fontWeight: 600 }}>Independently reviewed — no paid placements</span>
        </div>

        {/* Intro */}
        <div style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          {renderContent(article.intro)}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.txt, margin: '0 0 1rem', letterSpacing: '-0.02em' }}>
          At a glance — pricing & features
        </h2>
        <div style={{ overflowX: 'auto', marginBottom: '2.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, background: C.surf, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
            <thead>
              <tr style={{ background: C.a1, color: '#fff' }}>
                {['Tool', 'Price/mo', 'INR approx', 'Free plan', 'AI captions', 'Platforms', 'Best for'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {article.comparisonTable.map((row, i) => (
                <tr key={i} style={{ background: row.ourPick ? 'rgba(91,33,182,.04)' : i % 2 === 0 ? '#fff' : '#fafafa', borderBottom: '1px solid rgba(0,0,0,.05)' }}>
                  <td style={{ padding: '10px 14px', fontWeight: row.ourPick ? 700 : 500, color: row.ourPick ? C.a1 : C.txt }}>
                    {row.name}{row.ourPick && <span style={{ marginLeft: 6, background: C.a1, color: '#fff', borderRadius: 4, fontSize: 10, padding: '2px 6px', fontWeight: 700 }}>Our pick</span>}
                  </td>
                  <td style={{ padding: '10px 14px', color: C.mut }}>{row.price}</td>
                  <td style={{ padding: '10px 14px', color: C.mut }}>{row.priceINR}</td>
                  <td style={{ padding: '10px 14px' }}>{row.freeplan ? <Check size={15} color="#10b981" /> : <X size={15} color="#ef4444" />}</td>
                  <td style={{ padding: '10px 14px', color: C.mut, fontSize: 13 }}>{row.aiContent}</td>
                  <td style={{ padding: '10px 14px', color: C.mut }}>{row.platforms}</td>
                  <td style={{ padding: '10px 14px', color: C.mut, fontSize: 13 }}>{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Article sections */}
        {article.sections.map((sec, i) => (
          <section key={i} style={{ marginBottom: '2.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: C.txt, margin: '0 0 0.85rem', letterSpacing: '-0.02em', borderLeft: `3px solid ${C.a1}`, paddingLeft: '0.75rem' }}>
              {sec.heading}
            </h2>
            {renderContent(sec.content)}
          </section>
        ))}

        {/* Verdict box */}
        <div style={{ background: 'rgba(6,182,212,.06)', border: '1px solid rgba(6,182,212,.2)', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.a1, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            ⚖️ Our Verdict
          </div>
          {renderContent(article.verdict)}
        </div>

        {/* Winner CTA */}
        <div style={{ background: C.surf, border: `1px solid ${C.a1brd}`, borderRadius: 16, padding: '1.5rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(91,33,182,.1)' }}>
          <div style={{ fontSize: 22, marginBottom: '0.4rem' }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: C.txt, marginBottom: '0.4rem' }}>
            Winner: {article.winnerName}
          </div>
          <div style={{ fontSize: 14, color: C.mut, marginBottom: '1.25rem' }}>
            Best for solo creators & small businesses. Try free, no credit card required.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={article.winnerAffiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.a1, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none' }}
            >
              {article.winnerAffiliateText} <ExternalLink size={15} />
            </a>
            <button
              onClick={() => navigate(`/tools/${article.winnerSlug}`)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: `1.5px solid ${C.a1brd}`, color: C.a1, padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Full review <ChevronRight size={15} />
            </button>
          </div>
          <div style={{ fontSize: 11, color: C.mut2, marginTop: '0.75rem' }}>
            Affiliate link — we earn a commission at no extra cost to you. <span style={{ cursor: 'pointer', textDecoration: 'underline', color: C.mut }} onClick={() => navigate('/disclosure')}>Disclosure</span>
          </div>
        </div>

      </main>
    </div>
  );
}
