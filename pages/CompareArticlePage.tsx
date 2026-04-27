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

  // ── rytr-vs-writesonic ───────────────────────────────────────────────────
  {
    slug: 'rytr-vs-writesonic',
    title: 'Rytr vs Writesonic (2026): Which AI Writing Tool Is Actually Worth It?',
    metaDescription: 'Comparing Rytr and Writesonic for solopreneurs, freelancers, and content creators. Real pricing, real output quality, and an honest verdict on which AI writer wins in 2026.',
    keyword: 'rytr vs writesonic',
    publishDate: 'April 2026',
    intro: `I've run both of these tools side-by-side for content work over the past several months — paid accounts on both, same prompts, same use cases. Here's the honest breakdown.

The short answer: Writesonic does more, costs more, and is worth it only if SEO-driven long-form content is your main output. Rytr is cheaper, simpler, and quietly excellent for solopreneurs and freelancers who need consistent short-to-medium form copy without paying $40–100/month for the privilege.`,
    sections: [
      {
        heading: 'What most comparisons get wrong',
        content: `Most Rytr vs Writesonic articles are written by people who tested the free tiers for 15 minutes. The real comparison happens at the paid tiers — specifically, what you actually get per dollar.

Rytr's paid tier is $9/month for unlimited words. Writesonic's equivalent starts at $16/month and limits you on word count depending on the plan. That pricing gap compounds quickly if you write regularly.`,
      },
      {
        heading: 'Rytr — The underdog that quietly wins on value',
        content: `Rytr's free plan gives 10,000 characters/month — enough to test whether it works for your use case before spending a cent. The $9/month Saver plan is unlimited words. That's it. No word credit nonsense.

What it actually does well: short-to-medium form content. Email sequences, ad copy, blog intros, LinkedIn posts, product descriptions, SEO meta descriptions, YouTube descriptions, and cold outreach. It has 40+ use case templates that work well without needing to engineer a prompt from scratch each time.

**Where it genuinely falls short:** Long-form blog posts over 1,200 words. Rytr can write sections, but stitching together a 2,000-word article feels like manual labour. The output is also more generic for nuanced topics — it's excellent at structure, not always at depth.

**Support for 30+ languages** is a real plus. For creators targeting international audiences or non-English markets, Rytr holds up better than most tools at this price point.

The Chrome extension is useful — Rytr works inside Gmail and other web apps so you're not context-switching to write a reply.

**Who Rytr is actually for:** Freelancers, solopreneurs, social media managers, and small businesses who write structured content types regularly and don't want to pay $50/month for a tool that's 80% the same.`,
      },
      {
        heading: 'Writesonic — More powerful, but priced for it',
        content: `Writesonic ($16+/month) plays in a different league for long-form SEO content. The built-in SEO checker, Chatsonic AI chatbot, and Article Writer are genuinely good — the kind of tooling that would cost extra with Rytr.

The Article Writer generates full 1,500–2,500 word drafts that are actually usable as starting points rather than rough placeholders. For bloggers building topical authority, Writesonic's output has noticeably better structure and keyword integration than Rytr's.

**Chatsonic** is Writesonic's answer to ChatGPT — a conversational AI with real-time web access for up-to-date responses. This is genuinely useful for research-heavy content and is a feature Rytr simply doesn't offer.

**Where Writesonic trips up:** The UI feels cluttered. There are too many templates and modes, and finding the right one for a task takes a learning curve. Some templates produce noticeably weaker output than others — quality is inconsistent across the board compared to Rytr's more focused toolset.

**The pricing trap:** Writesonic's plans can feel like a moving target. Word credits, premium words, and plan tiers require careful attention — you can hit limits faster than expected on the entry plan.

**Who Writesonic is actually for:** SEO content marketers, bloggers targeting organic search, and content agencies that need long-form output regularly. If your primary output is 1,500+ word articles optimised for Google, Writesonic earns its higher price.`,
      },
      {
        heading: 'Head-to-head: the honest output test',
        content: `I ran the same brief through both tools for several content types. Here's what I found:

**Email copy:** Rytr wins. The templates are tighter, output requires less editing, and the tone controls work better for cold outreach and nurture sequences.

**Blog intros and conclusions:** Roughly equal. Both produce serviceable drafts. Rytr's are slightly more punchy, Writesonic's are slightly better structured for SEO.

**Full blog posts (1,500+ words):** Writesonic wins clearly. The Article Writer produces a coherent first draft. Rytr requires manual assembly of sections.

**Social media captions:** Rytr wins on speed and template variety. Writesonic works but it's not where it shines.

**Ad copy (Google, Meta):** Rytr's dedicated templates are excellent here. Writesonic's ad copy tool is similar quality but takes more steps to reach the same output.`,
      },
    ],
    verdict: `If you write primarily short-to-medium form content — social posts, emails, ad copy, blog intros, product descriptions — start with Rytr. $9/month unlimited is one of the best-value deals in AI tools right now. The 40+ templates mean you're rarely starting from scratch.

If you're a blogger or SEO content marketer who needs full 1,500–2,500 word drafts regularly, Writesonic's Article Writer and SEO tools justify the higher price. The gap in long-form quality is real.

The mistake is paying Writesonic prices for Rytr-level output needs. Be honest about what you actually write each week — the right tool follows from that.`,
    comparisonTable: [
      { name: 'Rytr', price: 'Free–$29/mo', priceINR: '₹0–₹2,430', freeplan: true, aiContent: '40+ templates, short-form focus', platforms: 'Web + Chrome ext', bestFor: 'Freelancers & solopreneurs', ourPick: true },
      { name: 'Writesonic', price: 'Free–$99/mo', priceINR: '₹0–₹8,300', freeplan: true, aiContent: 'Article Writer, SEO tools, Chatsonic', platforms: 'Web + API', bestFor: 'SEO bloggers & content teams', ourPick: false },
    ],
    winnerSlug: 'rytr',
    winnerName: 'Rytr',
    winnerAffiliateLink: 'https://rytr.me/?via=navneet-arya',
    winnerAffiliateText: 'Try Rytr free',
  },

  // ── grammarly-vs-quillbot ─────────────────────────────────────────────────
  {
    slug: 'grammarly-vs-quillbot',
    title: 'Grammarly vs QuillBot (2026): Which Should You Actually Use?',
    metaDescription: 'Grammarly vs QuillBot compared for writers, students, and professionals. Real breakdown of what each tool actually does, where each wins, and which one to use in 2026.',
    keyword: 'grammarly vs quillbot',
    publishDate: 'April 2026',
    intro: `These two tools get compared constantly — and almost always by people who don't clearly understand what each one is actually built to do. Grammarly and QuillBot are not the same kind of product.

Here's the direct answer: if you want to write better, use Grammarly. If you want to rewrite or repurpose existing text, use QuillBot. Both have generous free plans. Both cost under $10–12/month for premium. The real question is which problem you actually have.`,
    sections: [
      {
        heading: "They solve different problems — get clear on yours first",
        content: `Grammarly is an AI writing assistant. It reads what you've written and suggests improvements to grammar, spelling, clarity, tone, and engagement. Think of it as a real-time editor sitting beside you while you write.

QuillBot is an AI paraphrasing and rewriting tool. It takes existing text and restructures it — same meaning, different phrasing. Think of it as a translation layer: text in, rephrased text out.

This difference matters more than any feature comparison. If you mix them up, you'll be frustrated regardless of which one you choose. If you're clear on your need, both tools are genuinely excellent at their specific job.`,
      },
      {
        heading: 'Grammarly — The writing assistant used by 40 million people',
        content: `Grammarly's free plan is one of the best free tiers in any writing tool. Basic grammar checks, spelling corrections, and punctuation fixes work across Gmail, Google Docs, LinkedIn, Twitter, and 500+ other apps via the browser extension. The free plan alone is enough for most casual writing needs.

The premium plan ($12/month) adds what makes it genuinely useful for professional writing: **tone detection** tells you how your message reads to the recipient (confident, aggressive, unclear); **clarity rewrites** suggest simpler ways to say complex things; **engagement scoring** flags when writing is flat or overly repetitive. These aren't gimmicks — after two weeks, you start internalising the patterns.

**The plagiarism checker** is included in premium and is reliable for blog content and student work verification. Not as comprehensive as Turnitin for academic institutions, but solid for general use.

**Where Grammarly falls short:** It occasionally over-corrects creative writing by applying formal grammar rules to intentional stylistic choices. Write punchy one-liners and Grammarly will flag them as fragments. You learn quickly what to accept and what to dismiss.

**The business case:** If your job involves writing — emails, reports, proposals, content — the time Grammarly saves in self-editing pays for itself quickly.`,
      },
      {
        heading: 'QuillBot — The paraphrasing tool that actually works',
        content: `QuillBot's core feature — the paraphrasing tool — is the best in the market at its specific job. 7 modes (Standard, Fluency, Formal, Simple, Creative, Expand, Shorten) let you control not just the words but the register and length of the output. The free plan gives access to the two most useful modes; premium unlocks all seven.

The **Summariser** is excellent for research. Paste a long article or paper and QuillBot produces a clean abstract. For anyone who reads heavily — researchers, students, content strategists — this alone saves significant time.

**Grammar checker, citation generator, and plagiarism detector** are all bundled in the platform. The citation generator supports APA, MLA, Chicago, and Harvard formats — which is precisely why QuillBot has become the default tool for students globally.

**Where QuillBot falls short:** It is not a writing assistant. It won't help you write from scratch, won't give you tone feedback on your emails, and won't integrate into Gmail or Docs the way Grammarly does. It is purely a rewriting and research tool.

The **free plan** is genuinely functional — the character limit per paraphrase is restrictive but the core capability is available without payment.`,
      },
      {
        heading: 'Free plans compared: who gives you more for nothing',
        content: `**Grammarly free:** Grammar, spelling, punctuation checks. Works across 500+ apps via browser extension. No word limit. Basic writing suggestions — premium features are clearly withheld, not hidden behind vague limits.

**QuillBot free:** Paraphrasing with 2 modes, up to 125 words per paraphrase, summariser (600 words max), basic grammar checker, citation generator with no limits.

For students, QuillBot's free tier is more immediately useful — the paraphraser and citation generator cover primary use cases without spending anything. For professionals and content writers, Grammarly's free tier is more useful because the grammar checks integrate into the apps you already use every day.`,
      },
    ],
    verdict: `Use Grammarly if you write original content — emails, blog posts, reports, social media — and want a real-time editor that makes your writing clearer and more professional. The free plan is enough for casual use; premium is worth it if writing is central to your work.

Use QuillBot if you regularly need to rewrite, paraphrase, or summarise existing text. Students, researchers, and content strategists who repurpose content will find QuillBot more directly useful for their specific workflow.

The best setup if budget allows: use both. Grammarly while you write, QuillBot when you need to restructure or simplify. They don't overlap — they complement each other.`,
    comparisonTable: [
      { name: 'Grammarly', price: 'Free–$12/mo', priceINR: '₹0–₹1,005', freeplan: true, aiContent: 'Grammar, tone, clarity, rewrites', platforms: '500+ apps via extension', bestFor: 'Original writing & editing', ourPick: true },
      { name: 'QuillBot', price: 'Free–$9.95/mo', priceINR: '₹0–₹835', freeplan: true, aiContent: 'Paraphrase, summarise, cite', platforms: 'Web + Chrome ext + Word', bestFor: 'Students & content repurposers', ourPick: false },
    ],
    winnerSlug: 'grammarly',
    winnerName: 'Grammarly',
    winnerAffiliateLink: 'https://grammarly.com?affiliateId=ainexus',
    winnerAffiliateText: 'Try Grammarly free',
  },

  // ── ocoya-vs-buffer-vs-hootsuite (existing) ───────────────────────────────
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
        heading: "What you're actually trying to solve",
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
        padding: '0 28px',
      }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', height: 58, justifyContent: 'space-between' }}>
          {/* Logo */}
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 0 }}>
            <div style={{ width: 4, height: 28, background: `linear-gradient(180deg, ${C.a1}, #06B6D4)`, borderRadius: 2, marginRight: 12 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, letterSpacing: '-0.02em' }}>
              AI<span style={{ color: C.a1 }}>Nexus</span>
            </span>
          </div>
          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => navigate('/')}
              style={{ fontSize: 13, fontWeight: 500, color: C.mut, padding: '7px 14px', borderRadius: 100, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              All Tools
            </button>
            <button onClick={() => navigate('/')}
              style={{ fontSize: 13, fontWeight: 600, color: C.a1, padding: '7px 14px', borderRadius: 100, background: 'rgba(91,33,182,.065)', border: `1.5px solid rgba(91,33,182,.18)`, cursor: 'pointer' }}>
              ⚖️ Compare
            </button>
            <button onClick={() => navigate('/about')}
              style={{ fontSize: 13, fontWeight: 500, color: C.mut, padding: '7px 14px', borderRadius: 100, background: 'transparent', border: `1px solid rgba(15,15,26,.12)`, cursor: 'pointer' }}>
              About
            </button>
          </div>
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
