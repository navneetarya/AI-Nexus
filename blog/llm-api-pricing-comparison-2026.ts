// blog/llm-api-pricing-comparison-2026.ts
// Day 14 (Jul 4 slot, published Jul 6): LLM API Pricing Comparison — 2,100/mo, KD 12
// Target keyword: "llm api pricing" / "cost per token 2026" — cross-links to the
// existing /blog/ai-api-pricing-comparison-2026/ post both ways per the sprint plan.
// No direct affiliate — this is a developer reference post optimized for AI search
// citation (Claude, Perplexity, ChatGPT Search) and Featured Snippet targeting.
// Pricing verified directly against official vendor docs on 2026-07-06:
//   - https://developers.openai.com/api/docs/pricing
//   - https://platform.claude.com/docs/en/about-claude/pricing
//   - https://ai.google.dev/gemini-api/docs/pricing

import { BlogPost } from './types';

const post: BlogPost = {
  slug: 'llm-api-pricing-comparison-2026',
  title: 'Claude vs GPT vs Gemini API Pricing (Aug 2026): $2 vs $2.50 vs $1.50 per Million Tokens',
  seoTitle: 'Claude vs GPT vs Gemini API Pricing (Aug 2026)',
  metaDescription: 'Claude Sonnet 5 ($2/$10), GPT-5.4 ($2.50/$15), Gemini 3.5 Flash ($1.50/$9) per million tokens — verified pricing plus a worked cost example.',
  datePublished: '2026-07-06',
  dateModified: '2026-08-03',
  author: 'Navneet Arya',
  category: 'Coding',
  readTime: '12 min read',
  ogImage: 'https://ainexustools.online/og/blog/llm-api-pricing-comparison-2026.webp',
  excerpt: 'GPT-4o has quietly disappeared from OpenAI\'s own pricing page. Here is what the OpenAI, Anthropic, and Google Gemini APIs actually cost per million tokens as of July 2026 — including a worked cost example for a real production workload.',
  quickAnswer: 'As of July 2026, Claude Sonnet 5 is the cheapest frontier-tier model at $2/$10 per million input/output tokens (introductory, through August 31). Gemini 3.5 Flash costs $1.50/$9, and GPT-5.4 costs $2.50/$15. GPT-4o no longer appears on OpenAI\'s official pricing page; GPT-5.4 and GPT-5.5 are its direct successors for any 2026 API pricing comparison.',
  myTake: 'The "GPT-4o vs Claude vs Gemini" search habit hasn\'t caught up with reality. GPT-4o has been retired from ChatGPT entirely and dropped off OpenAI\'s own pricing table, so the real 2026 comparison is GPT-5.4/5.5 vs Claude Sonnet 5 vs Gemini 3.5 Flash. Sonnet 5\'s introductory $2/$10 rate through August 31 makes it the one worth routing to right now if quality-per-dollar is the goal. Its heavier tokenizer does eat into that headline discount on real workloads, though.',
  faqs: [
    {
      q: 'Is GPT-4o pricing still relevant in 2026?',
      a: 'Not for new integrations. OpenAI retired GPT-4o from ChatGPT entirely by April 3, 2026. As of July 2026, GPT-4o no longer appears on OpenAI\'s official API pricing page alongside the current GPT-5.5 and GPT-5.4 families. Existing API integrations may still route to legacy GPT-4o endpoints depending on account history. OpenAI has been clear, though, that GPT-5.4 and GPT-5.5 are the models developers should use for any current pricing comparison. If a comparison chart still lists GPT-4o at $2.50/$10 per million tokens as OpenAI\'s current flagship rate, treat it as outdated. That was accurate earlier in 2026, but it does not reflect OpenAI\'s current lineup.',
    },
    {
      q: 'What is the cheapest LLM API in 2026?',
      a: 'Among frontier-tier, general-purpose models, Gemini 3.5 Flash ($1.50/$9.00 per million input/output tokens) and Claude Sonnet 5 ($2.00/$10.00 introductory, through August 31, 2026) are the two cheapest capable options. For pure budget routing on simple tasks like classification or extraction, Gemini 2.5 Flash-Lite ($0.10/$0.40 per million tokens) and Claude Haiku 4.5 ($1.00/$5.00) are considerably cheaper. They trade off reasoning depth, though. The right "cheapest" answer depends on whether the task needs frontier-level reasoning or can be routed to a smaller model.',
    },
    {
      q: 'How much does the Claude API cost per million tokens in 2026?',
      a: 'Claude Sonnet 5 costs $2.00 input / $10.00 output per million tokens through an introductory period ending August 31, 2026. After that it moves to $3.00/$15.00, the same rate as Claude Sonnet 4.6. Claude Opus 4.8 costs $5.00/$25.00, and Claude Haiku 4.5 costs $1.00/$5.00. All current-generation Claude models include a full 1 million token context window at standard pricing with no long-context surcharge. Prompt caching also cuts cache-hit input cost by 90% across the board.',
    },
    {
      q: 'Is Gemini cheaper than GPT-5 and Claude for API use?',
      a: 'At the flagship tier, Gemini 3.5 Flash ($1.50/$9.00) undercuts GPT-5.4 ($2.50/$15.00) and matches or beats Claude Sonnet 5\'s post-introductory rate ($3.00/$15.00). Gemini 3.1 Pro Preview ($2.00/$12.00 up to 200K tokens) sits between the two on price. Google also offers a genuinely free tier for Flash and Flash-Lite models with reduced rate limits, which neither OpenAI nor Anthropic currently matches for their current-generation models. Google\'s Pro-tier models, however, lost free-tier access entirely as of April 1, 2026. Gemini 3.1 Pro Preview is paid-only.',
    },
    {
      q: 'What is prompt caching and how much does it save on LLM API costs?',
      a: 'Prompt caching lets an API reuse a previously processed prompt prefix (a system prompt, a long document, or few-shot examples) instead of reprocessing it on every request. The cached portion then bills at a steep discount. Anthropic charges just 10% of standard input price for a cache hit (a 90% saving) after an initial 1.25x-cost cache write. OpenAI\'s GPT-5.4 and GPT-5.5 families offer a similar 90% cached-input discount. Google\'s Gemini context caching runs at roughly 10% of standard input price plus a small hourly storage fee. For any application with a stable system prompt sent on every request, caching is usually the single biggest lever for cutting LLM API costs, bigger than choosing between providers.',
    },
    {
      q: 'How much does LLM API usage cost in India after GST and currency conversion?',
      a: 'None of the three providers bill in INR or accept UPI for API usage. OpenAI, Anthropic, and Google all charge in USD via international card, which typically adds 2–3.5% in foreign transaction fees. An 18% GST also applies for GST-registered Indian businesses on top of the converted amount. For budgeting, a $50/month API bill on any of the three providers works out to roughly ₹4,150–₹4,300 after typical forex fees, before GST. A forex-enabled card from an Indian bank, or a fintech card from a provider like Niyo or Scapia, reduces the repeated conversion fee compared to a standard debit card.',
    },
    {
      q: 'What is the difference between input tokens and output tokens?',
      a: 'Input tokens are what you send to the model: your prompt, system instructions, and any retrieved context or documents. Output tokens are what the model generates back, including any internal reasoning tokens on extended-thinking models. Every provider charges more per output token than per input token, usually 5 to 6 times more, because generating text takes more compute than reading it.',
    },
    {
      q: 'Does batch processing reduce LLM API costs?',
      a: 'Yes. OpenAI, Anthropic, and Google all offer roughly a 50% discount on standard pricing for batch API requests, where results aren\'t needed in real time and can be processed within a 24-hour window. This works well for large offline jobs — bulk summarization, dataset labeling, or overnight report generation — where an immediate response isn\'t required.',
    },
    {
      q: 'How do I estimate my monthly LLM API bill before building?',
      a: 'Start with a rough token estimate: multiply your expected number of requests by average input and output tokens per request, then apply each provider\'s per-million-token rate. For a chatbot, count a typical conversation\'s input and output tokens and multiply by expected daily conversations. Add a 20–30% buffer for retries and longer-than-average sessions, and remember that a stable system prompt makes caching worth enabling from day one — it directly cuts the input-token cost on nearly every request.',
    },
  ],
  content: `
<div style="background:rgba(13,148,136,.08);border-left:4px solid #0D9488;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
  <strong style="color:#0D9488;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Quick Answer</strong>
  <p style="margin:8px 0 0;font-size:15px;line-height:1.6;">For <strong>LLM API pricing</strong> as of July 2026, <strong>Claude Sonnet 5</strong> is the cheapest frontier-tier model. It costs $2/$10 per million input/output tokens (introductory, through August 31). <strong>Gemini 3.5 Flash</strong> costs $1.50/$9, and <strong>GPT-5.4</strong> costs $2.50/$15.</p>
  <p style="margin:8px 0 0;font-size:15px;line-height:1.6;"><strong>GPT-4o</strong> no longer appears on OpenAI's official pricing page. GPT-5.4 and GPT-5.5 are its direct successors for any 2026 API pricing comparison.</p>
</div>

<blockquote style="border-left:3px solid #0D9488;padding-left:16px;margin:24px 0;font-style:italic;color:#444;">The "GPT-4o vs Claude vs Gemini" search habit hasn't caught up with reality. GPT-4o has been retired from ChatGPT entirely and dropped off OpenAI's own pricing table. The real 2026 comparison is GPT-5.4/5.5 vs Claude Sonnet 5 vs Gemini 3.5 Flash. Sonnet 5's introductory $2/$10 rate through August 31 makes it the one worth routing to right now if quality-per-dollar is the goal. Its heavier tokenizer does eat into that headline discount on real workloads, though.<br/><span style="font-style:normal;font-size:13px;color:#888;">— Navneet Arya, AI Nexus</span></blockquote>
<p style="font-size:12px;color:var(--text-muted,#888);">This is a developer reference post with no affiliate links — every "Visit API" link below goes straight to the vendor. See our <a href="/disclosure/">affiliate disclosure</a> for how we handle sponsored links elsewhere on the site.</p>

<img src="https://images.unsplash.com/photo-1636115837651-6f2a5c7ef01a?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A close-up of a bunch of money, representing API cost comparison" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>How to Pick the Right Model for Cost</h2>
<ol style="margin:16px 0;padding-left:24px;line-height:1.9;font-size:14.5px;">
  <li><strong>Match the model to the task first, not the price.</strong> A cheap model that fails the task costs more in retries than a pricier one that gets it right the first time.</li>
  <li><strong>Route simple tasks to a budget-tier model.</strong> Classification, extraction, and routing rarely need frontier-level reasoning — use Gemini 2.5 Flash-Lite or Claude Haiku 4.5 there.</li>
  <li><strong>Turn on prompt caching if you have a stable system prompt.</strong> This is usually the single biggest cost lever available, bigger than which provider you pick.</li>
  <li><strong>Check the long-context surcharge before you commit.</strong> OpenAI and Google both roughly double their price past a token threshold; Anthropic's flat 1M-token pricing avoids that entirely.</li>
  <li><strong>Re-run the math before Sonnet 5's introductory window ends.</strong> Its rate rises 50% on September 1, 2026 — budget for that if you're building on it now.</li>
</ol>
<div style="margin:14px 0 24px;">
  <a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">Visit Anthropic API →</a>
</div>

<img src="https://images.unsplash.com/photo-1711606815631-38d32cdaec3e?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A calculator sitting on a table next to a laptop, used to compare API pricing" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>Why "GPT-4o vs Claude vs Gemini" Is the Wrong Question in July 2026</h2>
<p>GPT-4o is still the model most people type into a search bar when they want to compare LLM API pricing. For most of 2024 and 2025 that made sense: it was OpenAI's default workhorse model. That is no longer true.</p>
<p>OpenAI retired GPT-4o from ChatGPT in two stages. Consumer access was cut on February 13, 2026. The last bit, through Custom GPTs on Business, Enterprise, and Edu plans, ended April 3, 2026.</p>
<p>Check OpenAI's own pricing page today and GPT-4o is nowhere in the current tables, next to GPT-5.5 and GPT-5.4. It has effectively moved off the price list that OpenAI actively maintains for new integrations.</p>
<p>That leaves a gap between what people search for and what providers actually publish.</p>
<p>That matters for anyone budgeting an <strong>LLM API</strong> project in 2026. A lot of "GPT-4o vs Claude vs Gemini" posts online still quote its old $2.50/$10.00 rate, as if that were still OpenAI's flagship price. It is not.</p>
<p>This guide uses the numbers OpenAI, Anthropic, and Google publish today, checked against each provider's own pricing page. It treats GPT-5.4 and GPT-5.5 as GPT-4o's real successors for cost comparison purposes.</p>

<img src="https://images.unsplash.com/photo-1651341050677-24dba59ce0fd?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A graphical user interface application showing usage data on screen" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>LLM API Pricing Comparison — Verified July 2026</h2>
<p>Every model below bills per million tokens, split into input (what you send) and output (what it generates back). Rates shown are standard, non-batch, non-cached — the starting point, before any of the cost-cutting levers covered below.</p>
<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-size:13px;">
  <thead>
    <tr style="background:rgba(13,148,136,.1);">
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Model</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Provider</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Input $/M</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Output $/M</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Context</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">GPT-5.5</td>
      <td style="padding:10px 12px;">OpenAI</td>
      <td style="padding:10px 12px;">$5.00</td>
      <td style="padding:10px 12px;">$30.00</td>
      <td style="padding:10px 12px;">Long-context surcharge above ~270K</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">GPT-5.4</td>
      <td style="padding:10px 12px;">OpenAI</td>
      <td style="padding:10px 12px;">$2.50</td>
      <td style="padding:10px 12px;">$15.00</td>
      <td style="padding:10px 12px;">Long-context surcharge above ~270K</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">GPT-5.4 mini</td>
      <td style="padding:10px 12px;">OpenAI</td>
      <td style="padding:10px 12px;">$0.75</td>
      <td style="padding:10px 12px;">$4.50</td>
      <td style="padding:10px 12px;">Standard</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Claude Opus 4.8</td>
      <td style="padding:10px 12px;">Anthropic</td>
      <td style="padding:10px 12px;">$5.00</td>
      <td style="padding:10px 12px;">$25.00</td>
      <td style="padding:10px 12px;">1M tokens, flat rate</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Claude Sonnet 5</td>
      <td style="padding:10px 12px;">Anthropic</td>
      <td style="padding:10px 12px;">$2.00 (until Aug 31) → $3.00</td>
      <td style="padding:10px 12px;">$10.00 (until Aug 31) → $15.00</td>
      <td style="padding:10px 12px;">1M tokens, flat rate</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Claude Haiku 4.5</td>
      <td style="padding:10px 12px;">Anthropic</td>
      <td style="padding:10px 12px;">$1.00</td>
      <td style="padding:10px 12px;">$5.00</td>
      <td style="padding:10px 12px;">200K tokens</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Gemini 3.1 Pro Preview</td>
      <td style="padding:10px 12px;">Google</td>
      <td style="padding:10px 12px;">$2.00 (≤200K) / $4.00 (&gt;200K)</td>
      <td style="padding:10px 12px;">$12.00 (≤200K) / $18.00 (&gt;200K)</td>
      <td style="padding:10px 12px;">Up to 2M (reported)</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Gemini 3.5 Flash</td>
      <td style="padding:10px 12px;">Google</td>
      <td style="padding:10px 12px;">$1.50</td>
      <td style="padding:10px 12px;">$9.00</td>
      <td style="padding:10px 12px;">~1M tokens</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;font-weight:600;">Gemini 2.5 Flash-Lite</td>
      <td style="padding:10px 12px;">Google</td>
      <td style="padding:10px 12px;">$0.10</td>
      <td style="padding:10px 12px;">$0.40</td>
      <td style="padding:10px 12px;">Standard, free tier available</td>
    </tr>
  </tbody>
</table>
</div>

<h3>OpenAI: GPT-5.5 and GPT-5.4 Replace GPT-4o</h3>
<p>OpenAI's current flagship lineup has two tiers. GPT-5.5 runs $5.00 input / $30.00 output per million tokens, with a $0.50 cached-input rate. GPT-5.4 is the mid-tier option at $2.50/$15.00.</p><p>Both roughly double their rate once a request crosses a long-context threshold — around 270,000 tokens for GPT-5.5/5.4.</p>
<p>For budget routing, GPT-5.4 mini ($0.75/$4.50) and GPT-5.4 nano ($0.20/$1.25) exist below the flagship tier. GPT-4o isn't listed in OpenAI's current pricing docs at all. That's a real shift from earlier in 2026, when it still showed up as a legacy option.</p>

<h3>Anthropic: Claude Sonnet 5's Introductory Window</h3>
<p>Anthropic's current lineup is Claude Opus 4.8 at $5.00/$25.00 and Claude Haiku 4.5 at $1.00/$5.00. Claude Sonnet 5 costs an introductory $2.00/$10.00 through August 31, 2026. After that it reverts to $3.00/$15.00, the same rate as the outgoing Sonnet 4.6.</p>
<p>One thing headline pricing tables tend to miss: Sonnet 5, plus Opus 4.7 and later, uses a newer tokenizer. It produces roughly 30% more tokens for the same input text than the previous generation did.</p>
<p>That means the real cost on Sonnet 5 can land higher than the raw rate implies, even at the discounted introductory price.</p>
<p>Anthropic is also the only one of the three providers with a full 1 million token context window at flat, standard pricing. There's no long-context surcharge, unlike with OpenAI and Google.</p>

<h3>Google: Gemini 3.5 Flash Undercuts the Pro Tier</h3>
<p>Google's Gemini API splits into a Pro tier and a Flash tier with meaningfully different economics. Gemini 3.1 Pro Preview costs $2.00/$12.00 per million tokens up to a 200,000-token prompt, stepping to $4.00/$18.00 above that threshold.</p><p>It has been paid-only since April 1, 2026, when Google removed free-tier access to its Pro-class models.</p>
<p>Gemini 3.5 Flash, launched at Google I/O 2026, costs $1.50/$9.00 with no context-length pricing tiers. It also has a genuine free tier with lower rate limits — something neither OpenAI's nor Anthropic's flagship models offer.</p><p>For the cheapest possible routing tier, Gemini 2.5 Flash-Lite at $0.10/$0.40 remains available with a free tier as well.</p>

<h3>How These Prices Have Moved Since Early 2026</h3>
<p>LLM API pricing hasn't stood still this year, and the direction differs by provider. OpenAI's flagship rate actually rose in 2026: GPT-5.5 at $5.00/$30.00 costs twice as much per input token as GPT-4o's old $2.50 rate.</p>
<p>That reflects OpenAI pricing its most capable model as a genuine premium tier, not a like-for-like swap. GPT-5.4 at $2.50/$15.00 is the closer match to what GPT-4o used to cost.</p>
<p>Anthropic moved the opposite way at the flagship level. Opus dropped from $15.00/$75.00 (Opus 4.1) to $5.00/$25.00 across Opus 4.5 through 4.8 — a 3x cut across four straight releases.</p>
<p>Google's biggest 2026 change wasn't a price cut. It was a free-tier restriction: Gemini Pro-class models lost free access entirely on April 1, 2026. That pushed anyone prototyping with Gemini 3.1 Pro onto a paid account, though Flash and Flash-Lite kept a reduced free tier.</p>

<img src="https://images.unsplash.com/photo-1579532582937-16c108930bf6?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A close-up of a paper covered in numbers, representing token cost math" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>Cost Per Token, Explained</h2>
<p>Every major LLM API bills in units of one million tokens, split into input tokens and output tokens. Input tokens cover the prompt, system instructions, and any context you send.</p>
<p>Output tokens are what the model generates back, including internal reasoning tokens on extended-thinking models. A token is roughly four characters, or 0.75 words in English — so 1,000 tokens is close to 750 words.</p>
<p>Output tokens always cost more than input tokens, usually 5 to 6 times more. Generating text just takes more compute per token than reading it. That's why output-heavy work — long-form writing, code, detailed answers — costs a lot more than input-heavy work like classification or summarizing, even on the same model.</p>
<p>The formula for any request is simple: (input tokens ÷ 1,000,000 × input price) + (output tokens ÷ 1,000,000 × output price). The real complexity comes from what's layered on top: long-context surcharges, caching discounts, and batch discounts. That's where the real cost differences between providers show up.</p>

<img src="https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A person using a MacBook Pro to test long-context prompt caching" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>Long Context and Prompt Caching: The Hidden Multipliers</h2>
<p>Two structural differences between the three providers matter more than the headline per-token rate for most production workloads. The first is <strong>long-context pricing</strong>. OpenAI's GPT-5.4/5.5 family and Google's Gemini 3.1 Pro both roughly double their price once a request crosses a context-length threshold.</p><p>That's around 270K tokens for OpenAI, 200K tokens for Gemini 3.1 Pro.</p>
<p>Anthropic's current Claude models — Sonnet 5, Sonnet 4.6, Opus 4.8, Opus 4.7, Opus 4.6 — all get the full 1M token window at flat, standard pricing. There's no premium tier. That's a real difference for any app working with big codebases, long documents, or long chat history.</p>
<p>The second is <strong>prompt caching</strong>, which every one of the three providers now offers. A cache hit on Anthropic costs 10% of the standard input price, a 90% discount. OpenAI's cached-input rate for GPT-5.4/5.5 runs at roughly the same 10% of standard input.</p><p>Google's Gemini context caching costs about 10% of standard input too, plus a small per-hour storage fee.</p>
<p>Most chatbots and coding assistants send the same system prompt, examples, or reference doc on every single request. For that kind of app, turning on caching is usually a bigger cost lever than which provider you pick at all. All three providers also offer a 50% batch-processing discount for asynchronous, non-time-sensitive workloads.</p>

<img src="https://images.unsplash.com/photo-1636115798885-68e47c928729?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A stack of money sitting on top of a laptop computer, representing a worked cost example" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>A Worked Cost Example: Same Workload, Three Providers</h2>
<p>Here's a concrete example: a mid-size app processing 10 million input tokens and 3 million output tokens a month. That's a realistic volume for a chatbot or coding assistant with moderate traffic, before caching or batch discounts kick in.</p>
<div style="overflow-x:auto;margin:24px 0;">
<table style="width:100%;border-collapse:collapse;font-size:13px;">
  <thead>
    <tr style="background:rgba(13,148,136,.1);">
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Model</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Input cost (10M)</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Output cost (3M)</th>
      <th style="padding:10px 12px;text-align:left;border-bottom:2px solid rgba(13,148,136,.2);">Monthly total</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Gemini 2.5 Flash-Lite</td>
      <td style="padding:10px 12px;">$1.00</td>
      <td style="padding:10px 12px;">$1.20</td>
      <td style="padding:10px 12px;font-weight:600;">$2.20</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Claude Haiku 4.5</td>
      <td style="padding:10px 12px;">$10.00</td>
      <td style="padding:10px 12px;">$15.00</td>
      <td style="padding:10px 12px;font-weight:600;">$25.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Gemini 3.5 Flash</td>
      <td style="padding:10px 12px;">$15.00</td>
      <td style="padding:10px 12px;">$27.00</td>
      <td style="padding:10px 12px;font-weight:600;">$42.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Claude Sonnet 5 (introductory)</td>
      <td style="padding:10px 12px;">$20.00</td>
      <td style="padding:10px 12px;">$30.00</td>
      <td style="padding:10px 12px;font-weight:600;">$50.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Gemini 3.1 Pro Preview (≤200K)</td>
      <td style="padding:10px 12px;">$20.00</td>
      <td style="padding:10px 12px;">$36.00</td>
      <td style="padding:10px 12px;font-weight:600;">$56.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">GPT-5.4</td>
      <td style="padding:10px 12px;">$25.00</td>
      <td style="padding:10px 12px;">$45.00</td>
      <td style="padding:10px 12px;font-weight:600;">$70.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);">
      <td style="padding:10px 12px;font-weight:600;">Claude Sonnet 5 (standard, post-Sep 1)</td>
      <td style="padding:10px 12px;">$30.00</td>
      <td style="padding:10px 12px;">$45.00</td>
      <td style="padding:10px 12px;font-weight:600;">$75.00</td>
    </tr>
    <tr style="border-bottom:1px solid rgba(13,148,136,.08);background:rgba(13,148,136,.03);">
      <td style="padding:10px 12px;font-weight:600;">Claude Opus 4.8</td>
      <td style="padding:10px 12px;">$50.00</td>
      <td style="padding:10px 12px;">$75.00</td>
      <td style="padding:10px 12px;font-weight:600;">$125.00</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;font-weight:600;">GPT-5.5</td>
      <td style="padding:10px 12px;">$50.00</td>
      <td style="padding:10px 12px;">$90.00</td>
      <td style="padding:10px 12px;font-weight:600;">$140.00</td>
    </tr>
  </tbody>
</table>
</div>
<p>At this volume, the spread between the cheapest budget-tier model and the priciest flagship is roughly 64x. That's a bigger swing than most teams expect until they run the numbers.</p>
<p>Note: this table skips Sonnet 5's ~30% tokenizer overhead versus older Claude models. Real cost lands a bit higher than the raw math shows. It also excludes caching. A chatbot with an 80% cache-hit rate on a shared system prompt could cut most of these totals by a third or more.</p>

<img src="https://images.unsplash.com/photo-1726137570000-70ae29f0ba01?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A hand holding a credit card next to a phone, representing billing for API usage in India" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>Which LLM API Is Cheapest for Indian Developers?</h2>
<p>None of the three providers bill in INR or accept UPI for direct API usage. OpenAI, Anthropic, and Google all charge in USD through an international card, which adds 2–3.5% in forex fees. GST-registered Indian businesses also pay 18% GST on top of the converted amount.</p>
<p>From the example above, a $50/month Sonnet 5 bill at the intro rate works out to roughly ₹4,150–₹4,300 after forex fees, before GST. That's competitive with Gemini 3.5 Flash's $42/month bill at similar conversion overhead.</p>
<p>For Indian teams testing providers, Google AI Studio gives free access to Gemini 3.5 Flash and Flash-Lite, no card needed. It's the lowest-friction way to prototype before any INR conversion cost applies.</p>
<p>A forex-enabled card from an Indian bank, or a prepaid card from a fintech like Niyo or Scapia, helps too. Either cuts the repeated conversion fee versus a standard debit card, whichever provider you settle on.</p>

<h2>Which LLM API Should You Actually Use?</h2>
<p><strong>Choose Gemini 3.5 Flash or Claude Sonnet 5 if:</strong> cost-per-quality is the priority, and the task doesn't need the top reasoning tier. Sonnet 5's introductory rate is the better deal through August 31, 2026. Budget for the tokenizer overhead and the price hike after that, though.</p>
<p><strong>Choose Claude Opus 4.8 or GPT-5.5 if:</strong> the task genuinely needs frontier-level reasoning. Think complex agents, hard coding tasks, or long-document work, where a cheaper model gives noticeably worse output. Opus 4.8's flat 1M-context pricing gives it an edge over GPT-5.5 for large-document workloads specifically.</p>
<p><strong>Choose Gemini 3.1 Pro Preview if:</strong> your workload needs a bigger context window than Claude or GPT-5 offer at standard pricing. Gemini 3.1 Pro is the only one of the three with a context window reported up to 2 million tokens.</p>
<p><strong>Route to a budget-tier model (Gemini 2.5 Flash-Lite, Claude Haiku 4.5, or GPT-5.4 mini/nano) whenever the task allows it.</strong> Classification, extraction, and routing rarely need frontier-level reasoning. The cost gap at scale adds up fast.</p>
<p>Building on these APIs, not just chatting with them? See a wider rundown in AI Nexus's <a href="/best-ai-coding-tools/">best AI coding tools</a> category. For a deeper look at where AI spend gets wasted on the wrong model tier, see the <a href="/blog/ai-tools-cost-roi-calculator-2026/">AI Tools Cost & ROI Calculator</a>.</p>

<p>For a broader look at these three families on capability, not price, see <a href="/blog/gpt-5-5-vs-claude-opus-4-8-vs-grok-4-2026/">GPT-5.5 vs Claude Opus 4.8 vs Grok 4</a>. For the earlier snapshot of this same pricing landscape from May 2026, see AI Nexus's original <a href="/blog/ai-api-pricing-comparison-2026/">AI API Pricing Comparison 2026</a>. It also covers Meta's open-source Llama pricing, which isn't included here.</p>
<div style="margin:14px 0 24px;">
  <a href="https://platform.openai.com/docs/pricing" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">Visit OpenAI API →</a>
  <a href="https://platform.claude.com/docs/en/about-claude/pricing" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">Visit Anthropic API →</a>
  <a href="https://ai.google.dev/gemini-api/docs/pricing" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#0D9488,#0f766e);color:#fff;padding:10px 14px;margin:6px 8px 0 0;border-radius:10px;font-weight:700;font-size:13px;text-decoration:none;">Visit Google AI Studio →</a>
</div>

<img src="https://images.unsplash.com/photo-1516159754081-f01c990481dd?auto=format&fit=crop&w=1200&h=675&q=80&crop=entropy" alt="A vintage adding machine, representing the final cost verdict" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin:8px 0 24px;" loading="lazy" />

<h2>Final Verdict: LLM API Pricing in July 2026</h2>
<p>The clearest takeaway from the official pricing pages, not recycled charts: GPT-4o is no longer part of this conversation. Any pricing table that still centers it is working from stale data.</p><p>The real three-way comparison in July 2026 is GPT-5.4/5.5 versus Claude Sonnet 5/Opus 4.8 versus Gemini 3.1 Pro/3.5 Flash.</p>
<p>On that comparison, Sonnet 5's intro rate and Gemini 3.5 Flash are the two best-value options near the frontier tier. Claude and Gemini both beat OpenAI, on flat long-context pricing and free-tier access respectively. Every provider now offers roughly the same caching and batch discounts too.</p>
<p>The single biggest cost lever, whichever provider you pick, is still routing simple tasks to a cheaper model. Turning on prompt caching for a repeated system prompt is the other one.</p>
  `.trim(),
  wordCount: 2230,
  proscons: {
    pros: [
      'All three providers now publish clear, official per-token pricing with no hidden model-selection tax',
      'Claude Sonnet 5\'s introductory pricing and Gemini 3.5 Flash both undercut GPT-5.4 on a like-for-like basis',
      'Anthropic\'s flat 1M-context pricing avoids the long-context surcharges OpenAI and Google both apply',
      'Google still offers a genuine free tier on Flash-class Gemini models, unlike current-generation GPT or Claude flagships',
      'Prompt caching and batch discounts are now roughly equivalent (~90% and 50% respectively) across all three',
    ],
    cons: [
      'GPT-4o pricing data still circulates widely online despite being retired from OpenAI\'s current pricing page',
      'Claude Sonnet 5\'s new tokenizer produces ~30% more tokens for the same text, eating into its headline discount',
      'Claude Sonnet 5\'s introductory rate expires August 31, 2026, rising 50% afterward',
      'Gemini 3.1 Pro Preview lost free-tier access entirely as of April 1, 2026',
      'None of the three providers bill in INR or accept UPI, adding forex fees and GST for Indian developers',
    ],
  },
  outboundCitations: [
    { url: 'https://developers.openai.com/api/docs/pricing', label: 'OpenAI — Official API Pricing' },
    { url: 'https://platform.claude.com/docs/en/about-claude/pricing', label: 'Anthropic — Official Claude API Pricing' },
    { url: 'https://ai.google.dev/gemini-api/docs/pricing', label: 'Google — Official Gemini API Pricing' },
    { url: 'https://openai.com/index/retiring-gpt-4o-and-older-models/', label: 'OpenAI — Retiring GPT-4o and Older Models' },
  ],
};

export default post;
