import React, { useState } from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Star, Calendar, User, Tag, ChevronDown, ChevronUp, Award, Scale, Sun, Moon, BookOpen, Layers } from 'lucide-react';
import { SITE_CONFIG, TOOL_FAQS, TOOL_COMPARISONS, TOOL_KEYWORDS, TOOLS } from '../constants';
import { SharedNav } from './SharedNav';
import { COMPARE_ARTICLES } from './CompareArticlePage';
import { BLOG_POSTS } from '../blog/index';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  a2card:'var(--a2-card)',  a2brd:'var(--a2-brd)',
  errbg:'var(--err-bg)', errbrd:'var(--err-brd)',
  sukbg:'var(--suk-bg)', sukbrd:'var(--suk-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

const CAT_ACCENT: Record<string, 'a1'|'a2'> = {
  Writing:'a1', Image:'a2', Video:'a1', Audio:'a2',
  Marketing:'a1', Design:'a2', Coding:'a1', Productivity:'a2',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.1)'/%3E%3C/svg%3E")`;

const TOOL_CONTENT: Record<string, {
  /** AEO A3: 40–60 word definition paragraph — Google featured snippet target for "[tool] review" queries.
   *  Must immediately answer "What is [Tool]?" in plain language. Rendered as <h2>What is [Tool]?</h2>
   *  followed by this paragraph directly after the hero section. */
  whatIs: string;
  whoIsItFor: string;
  whoShouldSkip: string;
  myTake: string;
  useCases: string[];
  verdict: string;
  rating: number;
  lastTested: string;
  /** ISO 8601 date this review was first published — used in Review schema datePublished */
  datePublished: string;
  timeUsed: string;
  /** W3-1: Free vs Paid upgrade decision guide — targets "is [tool] worth it" keyword */
  upgradeGuide?: string;
  /** W3-1: Quick verdict vs nearest competitor — links to compare article */
  vsVerdict?: { tool: string; summary: string; compareSlug: string; };
}> = {
  grammarly: {
    whatIs: "Grammarly is an AI-powered writing assistant that checks grammar, spelling, tone, and clarity across every app you use — from Gmail to Google Docs. Used by 40 million people worldwide, it offers a permanently free plan with no word limit and a Premium tier at $12/month for advanced rewrites and a plagiarism checker.",
    whoIsItFor: "Anyone who writes in English professionally — students submitting assignments, freelancers writing client emails, marketers drafting campaigns, non-native English speakers polishing documents, and developers writing technical documentation. Grammarly works wherever you write: Gmail, Google Docs, Notion, LinkedIn, Word, Slack, and 500,000+ other apps via the browser extension.",
    whoShouldSkip: "Writers doing creative fiction or poetry who don't want AI second-guessing their deliberate stylistic choices. Grammarly's suggestions can strip intentional voice from creative writing — it optimises for clarity, not artistic expression. Also skip if you only write in languages other than English; Grammarly's non-English support is minimal compared to tools like DeepL Write.",
    myTake: "I've used Grammarly daily for over two years across Gmail, Notion, and Google Docs. The free plan genuinely catches mistakes that Microsoft Word's built-in checker misses — dangling modifiers, comma splices, incorrect article usage. The tone detector is one of the most underrated features: it analyses whether your message reads as confident, friendly, or accusatory before you send it, which has saved me from awkward client emails more than once.\n\nThe Premium upgrade unlocks the full picture: full-sentence rewrites, clarity scoring, and the plagiarism checker. I use the clarity rewrites most — Grammarly will flag a sentence as 'hard to follow' and suggest a shorter version that says the same thing in 30% fewer words. That feedback loop over two years has measurably changed how I write first drafts.\n\nThe one area where Grammarly consistently frustrates me: it doesn't understand your personal style. It will flag stylistic repetition that's intentional, and it can't be taught to ignore certain brand-specific language patterns. For deeply personal or brand-voice writing, I use it as a second pass rather than accepting all suggestions.",
    useCases: [
      "Proofreading client-facing emails before sending — the tone detector alone prevents misread messages",
      "Students: submitting assignments with zero grammar errors using the free browser extension",
      "Non-native English speakers: improving fluency and naturalness of professional documents",
      "Marketers: checking ad copy, landing pages, and email campaigns for clarity and correctness",
      "LinkedIn creators: making posts more readable with sentence-length and clarity feedback",
    ],
    freePlanDetails: "Grammarly's free plan catches basic spelling, grammar, and punctuation errors — coverage that beats Microsoft Word in accuracy. It works in the browser extension across all sites, in the desktop app, and in the Grammarly keyboard on mobile. The free tier has no word limit or time limit.\n\nWhat the free plan doesn't include: advanced clarity rewriting, full-sentence restructuring, the plagiarism checker, tone adjustment suggestions, and the GrammarlyGO generative AI features.\n\nFor most personal and professional email writing, the free plan is genuinely sufficient. Students who need plagiarism checking and freelancers who write 10,000+ words per week are the core Premium use case.",
    pricingSection: "**Is Grammarly free?** Yes — Grammarly has a permanently free plan with no credit card required and no word limit.\n\n**Grammarly Free vs Premium (2026):**\n- Free: Spelling, grammar, and punctuation corrections. Works in browser extension, desktop app, and mobile keyboard. Unlimited usage.\n- Premium ($12/month billed annually, $30/month billed monthly): Everything in Free + full-sentence rewrites, clarity and engagement scores, tone detector, plagiarism checker against 16 billion web pages, and GrammarlyGO (AI generation and rewriting).\n- Business ($15/user/month): Everything in Premium + style guide enforcement, brand tone customisation, snippets library, admin controls, and analytics.\n\nThe sweet spot: use the free plan for 2 weeks. If you write more than 5,000 words per week professionally, Premium at $12/month will save you more time than it costs.",
    faqs: [
      { q: "Is Grammarly free?", a: "Yes. Grammarly offers a permanently free plan with no credit card required. It covers spelling, grammar, and punctuation errors with no word limit. Premium features (advanced rewrites, plagiarism checker, tone detector) require a paid plan starting at $12/month billed annually." },
      { q: "Is Grammarly worth it?", a: "Yes — Grammarly is worth it for anyone who writes professionally. The free plan is genuinely useful for catching grammar and spelling errors. Premium ($12/month) is worth upgrading to if you write 5,000+ words per week and need AI-assisted rewrites, the plagiarism checker, or the tone detector. After 2+ years of daily use, it has measurably improved my writing speed and reduced revision time." },
      { q: "Is Grammarly Premium worth the upgrade?", a: "Grammarly Premium is worth it if you write professionally at significant volume. The three features that justify the $12/month cost are: (1) full-sentence clarity rewrites that cut verbose phrasing, (2) the plagiarism checker against 16 billion web pages, and (3) the tone detector that flags emails that may read as aggressive. Casual writers and students on a budget should use the free plan — it's not a crippled demo." },
      { q: "Grammarly Free vs Premium — what's the real difference?", a: "The free plan catches errors. Premium rewrites and improves your writing. Free is sufficient for casual writing and simple emails. Premium is worth the upgrade if you write professionally and want AI-assisted rewrites, the plagiarism checker, and the tone detector." },
      { q: "Does Grammarly work with Google Docs?", a: "Yes. Grammarly has a dedicated Google Docs integration via a browser extension. It overlays suggestions directly inside Google Docs without leaving the app. It works in Chrome, Firefox, Safari, and Edge." },
      { q: "Is Grammarly accurate?", a: "Grammarly is the most accurate automated grammar checker available for English. In independent testing it consistently outperforms Microsoft Word and Google Docs' built-in checkers. However, it makes errors on intentional stylistic choices and doesn't understand all technical terminology." },
    ],
    verdict: "The most accessible and accurate AI writing assistant for English. The free plan is genuinely useful — not a crippled demo — and the $12/month Premium plan is worth it the moment you write professionally at any significant volume. If you only install one writing tool, install Grammarly.",
    /** SEO-07: Targets "is grammarly worth it" (3,600/mo KD 22) + "grammarly premium review" (4,400/mo KD 28) */
    upgradeGuide: "The free plan genuinely earns its keep. Grammarly Free catches spelling, grammar, and punctuation errors with no word limit — coverage that beats Microsoft Word on complex sentence structures. For personal emails, simple documents, and student essays, the free plan is all you need.\n\nThe upgrade to Premium ($12/month billed annually) is worth it the moment you write professionally at volume. Three features justify the cost:\n\n1. **Full-sentence clarity rewrites.** Grammarly flags verbose sentences and suggests a version that says the same thing in 30–40% fewer words. After two years of accepting these suggestions, my first drafts are shorter and cleaner.\n\n2. **Plagiarism checker against 16 billion web pages.** Essential for freelancers submitting content to clients, academics, and anyone publishing content who needs to verify originality before it goes live.\n\n3. **Tone detector.** Before sending a difficult email, Grammarly analyses whether it reads as confident, direct, aggressive, or friendly. It has flagged client emails that could have caused friction — that alone has paid for the subscription multiple times over.\n\nIs Grammarly Premium worth it? Yes, if you write 5,000+ words per week in a professional context. No, if you're a casual writer who only needs basic error catching — the free plan is legitimately sufficient for that use case.",
    rating: 4.5, lastTested: "March 2026", lastTestedISO: "2026-03-15", datePublished: "2026-01-15", timeUsed: "2+ years daily",
  },
  writesonic: {
    whatIs: "Writesonic is an AI content writing platform built for SEO-driven long-form blog posts. Its Article Writer 6.0 generates a full 1,500-word draft from a single keyword in under 5 minutes. It includes Chatsonic — a ChatGPT alternative with real-time web search — and is priced from $19/month for unlimited words.",
    whoIsItFor: "Content marketers, and small business owners who need to produce SEO-optimised long-form content regularly. Writesonic's Article Writer 6.0 is purpose-built for going from a keyword to a publishable draft with factual references, headings, and internal links. If your core output is 1,000–2,500 word blog posts and you need more than 2–3 per week, Writesonic is the most efficient tool at its price point.",
    whoShouldSkip: "Casual writers who only need a few pieces per month — use the free plan or Rytr instead. Also skip if you want short-form copy like social captions and emails — Rytr is faster and cheaper for high-volume short-form. Enterprise teams needing brand voice training and multi-user admin should look at Jasper.",
    myTake: "Writesonic's Article Writer 6.0 is the fastest way I've found to go from a keyword to a publishable draft. I gave it 'best AI tools for freelancers 2026' and in about 3 minutes it returned a 1,600-word draft with an introduction, 6 H2 sections, an FAQ, and a conclusion. The output still needs editing — don't publish raw AI content — but it cuts my writing time by roughly 60%.\n\nThe Chatsonic chatbot is a solid ChatGPT alternative with web search built in, which means the content it generates can reference current information rather than a frozen training cutoff. I use Chatsonic for research and topic ideation more than Writesonic proper.\n\nThe biggest weakness: consistency. The quality of Article Writer output varies depending on how specific your keyword prompt is. Broad keywords get generic output. Narrow, long-tail keywords get much better first drafts. The tool rewards users who understand content strategy and give it detailed briefs.\n\nThe $19/month Individual plan (unlimited words) is the right entry point. The free plan's 25 credits disappear fast — it's more of a demo than a real free tier compared to Rytr's 10,000 characters per month.",
    useCases: [
      "Writing 1,500-word SEO blog posts from a single keyword — from brief to draft in under 5 minutes",
      "Generating Facebook and Google ad copy variants for A/B testing campaigns",
      "Creating product descriptions for Shopify stores at scale — 20+ products in one session",
      "Drafting email newsletters: subject lines, body copy, and CTAs in one workflow",
      "Producing landing page copy with headline, subheadline, features, and CTA sections",
    ],
    pricingSection: "**Writesonic Pricing (2026):**\n- Free: 25 one-time credits — enough to generate 2–3 articles. Not a sustainable free plan.\n- Individual ($19/month billed annually): Unlimited words, Article Writer 6.0, Chatsonic with web search, 100+ templates. This is the practical entry point.\n- Teams ($19/user/month): Everything in Individual + team collaboration, brand voice settings, shared templates.\n\nThe free plan is adequate for testing the tool but not for ongoing use. The jump to Individual at $19/month is steep compared to Rytr ($9/month) — but Writesonic produces longer, more structured content that Rytr can't match.",
    faqs: [
      { q: "Is Writesonic good for SEO?", a: "Yes — specifically for long-form SEO blog content. Article Writer 6.0 structures content with proper H2/H3 headings, adds FAQ sections (which are good for featured snippets), and can include factual references via Chatsonic's web search. For technical on-page SEO like keyword density analysis, pair it with Frase." },
      { q: "Writesonic vs Rytr — which is better?", a: "They solve different problems. Writesonic is better for long-form blog content (1,000–2,500 words). Rytr is better for short-form high-volume writing (captions, emails, ad copy). If you need both, start with Rytr's free plan for short-form and use Writesonic's free credits to test long-form output before committing." },
      { q: "Can Writesonic write factually accurate content?", a: "More than most AI writers — Chatsonic has real-time web search which lets it reference current information. But AI-generated content should always be fact-checked before publishing. Writesonic's content is a starting point, not a final draft." },
    ],
    verdict: "Best value for bloggers who need to scale long-form content output. The output requires editing but the 60% time saving is real. The $19/month Individual plan is worth it if you publish more than 4 blog posts per month.",
    rating: 4.2, lastTested: "February 2026", lastTestedISO: "2026-02-20", datePublished: "2026-01-20", timeUsed: "6 months",
  },
  rytr: {
    whatIs: "Rytr is an AI writing tool built for short-form content at scale — social captions, emails, ad copy, and blog outlines. It has 40+ use-case templates, supports 30+ languages, and offers a permanently free plan with 10,000 characters per month. The Saver plan is $9/month for unlimited writing, making it the best-value AI writer in 2026.",
    whoIsItFor: "For freelancers, solopreneurs, and students who want a capable AI writing assistant without spending $40–50/month on premium tools. In 2026, with most AI writing tools raising prices, Rytr's $9/month Saver plan remains the best value in the category. The free plan — 10,000 characters per month — is genuinely functional, not a stripped teaser, making it ideal for anyone who wants to test AI writing before committing money. Social media managers who write captions, ads, and short-form copy daily will get the most from Rytr's 40+ use-case templates. It's also excellent for non-native English speakers: the 30+ language support is among the best at this price point. Bloggers who write 1–3 posts per week will find the Saver plan covers all their short to mid-form writing needs without friction.",
    whoShouldSkip: "Anyone who needs to write detailed, long-form articles regularly. Rytr loses coherence beyond 800 words and tends to repeat itself on complex topics — frustrating if 2,000-word posts are your standard output. It also doesn't access the web or reference current sources, so research-heavy writing needs manual fact-checking. Content teams needing brand voice training, multi-user collaboration, or enterprise workflows should look at Jasper. If ranking on Google with long-form SEO content is your primary goal, Writesonic or Frase will serve you better at a slightly higher price.",
    myTake: "I've been using Rytr for 8 months across multiple content types — cold email campaigns, LinkedIn post batches, blog post outlines, product descriptions, and ad copy variants. The interface is the most beginner-friendly in the AI writing category. Jasper requires you to understand content strategy before it's useful. Writesonic has a real learning curve around its article workflow. Rytr's use-case templates are labelled so clearly that you can get usable output within 90 seconds of signing up for the first time.\n\nThat said, Rytr has clear limits. For long-form content — anything above 800 words that needs genuine coherence — it starts to lose the thread of your argument and repeats itself. I use it almost exclusively for short-form work: email sequences, social captions, product descriptions, and quick blog post openers. For those tasks, the quality-to-price ratio is genuinely unmatched in 2026.\n\nThe plagiarism checker on the Saver plan is a useful bonus — I use it to verify AI outputs before publishing anything with specific claims. The Chrome extension is underrated: writing inside Gmail and Google Docs without switching tabs saves more time than you'd expect. If you're building a content pipeline on a budget, start with Rytr's free plan. You'll know within a week whether it fits your workflow.",
    useCases: [
      "Social media managers: writing 10 Instagram captions in 15 minutes from a single brief",
      "Freelancers: generating a 5-email cold outreach sequence in under 10 minutes",
      "Shopify sellers: writing 20 product descriptions using the Product Description template",
      "LinkedIn creators: turning a 4-bullet brief into a publish-ready post in 90 seconds",
      "Marketers: generating 3 headline variants for A/B testing landing pages",
    ],
    verdict: "The best entry point into AI writing in 2026. The free plan is generous and genuinely useful — not a crippled demo. At $9/month unlimited, the Saver plan is the best price-to-output deal in the AI writing category. If you're new to AI tools and unsure about the investment, start here. You'll know within a week if it belongs in your workflow — and if it does, it'll save you 3–5 hours every week on short-form writing.",
    rating: 4.0,
    lastTested: "May 2026",
    datePublished: "2026-01-25",
    timeUsed: "8 months",
    upgradeGuide: "The free plan gives you 10,000 characters per month, 20+ use cases, and outputs in 30+ languages — enough to write 3–4 short blog posts or a batch of social media captions. It's a real free plan, not a 7-day trial.\n\nThe upgrade to Saver ($9/month) is worth it the moment you hit the character limit — which happens faster than expected when writing email sequences or batching content. Saver adds: unlimited characters, all 40+ use cases (including Magic Command, which lets you give free-form instructions), the Chrome extension for writing inside Gmail and Google Docs, and a plagiarism checker.\n\nThe Unlimited plan ($29/month) adds priority support, a custom use case builder, and team access. This is worth it only if you're managing a content team of 3+ or need to train Rytr on a specific brand voice.\n\nMy recommendation: use the free plan for 2 weeks. If you're hitting the character limit or want the Chrome extension, upgrade to Saver. The $9/month investment pays for itself within the first week of consistent use. Skip Unlimited unless you're running a team.",
    vsVerdict: {
      tool: "Writesonic",
      summary: "Rytr and Writesonic are the two most popular budget AI writing tools in 2026 — but they solve different problems. Writesonic (from $15/month) is built for long-form, SEO-optimised content: its Article Writer 6.0 produces full 1,500-word drafts from a keyword. Rytr ($9/month) is built for short-form volume: social captions, cold emails, ad copy, and outlines.\n\nIf you need full articles, Writesonic wins. If you need short-form copy at scale, Rytr is faster and cheaper.\n\nThe free plans tell the story: Rytr gives 10,000 characters/month with no time limit. Writesonic gives 25 generations/month with significant format restrictions. For freelancers, email marketers, and social media managers, Rytr's free plan is more immediately useful.\n\nMy recommendation: if your primary need is SEO blog content, choose Writesonic. If you write short-form copy in volume, Rytr at $9/month is the smarter buy. See the full breakdown below.",
      compareSlug: "rytr-vs-writesonic",
    },
  },
  quillbot: {
    whatIs: "QuillBot is an AI paraphrasing and rewriting tool used by 35 million writers, students, and researchers. Unlike AI writers, it transforms text you provide rather than generating from scratch. Its free plan includes 125-word paraphrasing and a summariser, with Premium at $9.95/month unlocking 7 paraphrase modes and a plagiarism checker.",
    whoIsItFor: "Researchers, and ESL (English as a Second Language) writers who need to improve existing text rather than generate content from scratch. Quillbot is specifically a rewriting and paraphrasing tool — it transforms text you give it, rather than writing from a blank page. Its core audience is anyone who needs to: avoid plagiarism on academic submissions, simplify complex research for general audiences, or polish the grammar and flow of non-native English writing.",
    whoShouldSkip: "Anyone looking for original content creation — Quillbot needs source text to work with. If you want to write blog posts, social captions, or ad copy from a brief, use Rytr or Writesonic. Also not the right tool for professional native English writers who need voice consistency — Quillbot's rewrites sometimes smooth out deliberate stylistic choices.",
    myTake: "Quillbot does one thing better than any other tool I've tested: paraphrasing. I ran the same academic paragraph through all 7 paraphrasing modes and the difference between Standard and Creative mode is dramatic. Creative mode genuinely restructures sentences — it doesn't just swap synonyms, it rearranges clauses and changes sentence structure in ways that feel human-authored.\n\nThe free plan's 125-word limit per paraphrase is frustrating if you're working with full documents — it breaks your workflow constantly. The $10/month Premium plan removes the limit and unlocks all paraphrase modes, and for students or academics using Quillbot regularly, it pays for itself within the first week.\n\nThe summariser is legitimately excellent for condensing long research papers into key points. I used it on a 12,000-word report and the 400-word summary captured the main argument accurately. The grammar checker is solid but Grammarly is more accurate on complex sentences.\n\nThe citation generator is a hidden gem — APA, MLA, Chicago, and Harvard formats generated automatically from a URL, DOI, or book title. Students who manually format citations are wasting time.",
    useCases: [
      "Students: rewriting academic papers to avoid self-plagiarism without changing the meaning",
      "Summarising 20-page research reports into a 400-word executive summary in under 2 minutes",
      "ESL writers: improving naturalness and flow of professionally written English emails and documents",
      "Generating citation references in APA, MLA, Chicago, and Harvard from URLs and DOIs automatically",
      "Simplifying jargon-heavy technical text into plain-language versions for general audiences",
    ],
    paraphraseModes: "**Quillbot's 7 Paraphrasing Modes (2026):**\n- **Standard** (free): Balanced rewrite — same meaning, moderate vocabulary change. Best starting point.\n- **Fluency** (free): Prioritises grammatical correctness. Best for ESL writers fixing grammar and flow.\n- **Formal** (Premium): Elevates tone for academic or business writing. Removes contractions and casual phrasing.\n- **Simple** (Premium): Reduces complexity. Best for making technical content accessible.\n- **Creative** (Premium): Maximum structural change. Rewrites sentence architecture, not just vocabulary. Most human-sounding output.\n- **Expand** (Premium): Lengthens text by adding detail and elaboration. Useful for padding thin content.\n- **Shorten** (Premium): Condenses text while preserving core meaning. Best for reducing word count on over-written drafts.",
    faqs: [
      { q: "Is Quillbot free?", a: "Yes — Quillbot has a permanently free plan with no time limit. The free plan includes Standard and Fluency paraphrase modes with a 125-word limit per paraphrase, plus a basic grammar checker and summariser (1,200 words max). Premium ($10/month) removes word limits and unlocks all 7 paraphrase modes, unlimited summariser, and full grammar checker." },
      { q: "Does Quillbot detect AI writing?", a: "Quillbot has an AI Content Detector tool that checks whether text was AI-generated. However, it's not reliably accurate enough to use as a definitive check — no AI detector currently is. Turnitin and other academic plagiarism tools are separate systems that Quillbot cannot guarantee will or won't flag paraphrased content." },
      { q: "Quillbot vs Grammarly — which should I use?", a: "They solve different problems. Grammarly corrects errors in your writing. Quillbot rewrites and paraphrases existing text. For grammar checking, Grammarly is more accurate. For paraphrasing, Quillbot is the category leader. Many users use both — Quillbot to rephrase, Grammarly to clean up the result." },
      { q: "Is Quillbot good for students?", a: "Yes — particularly for paraphrasing research and generating citations. The free plan is sufficient for many student use cases. Be aware that using Quillbot to paraphrase others' work without attribution is still plagiarism — the tool doesn't change the ethical obligation to cite your sources." },
    ],
    verdict: "The best paraphrasing and rewriting tool available. The free plan's 125-word limit is frustrating for document-level work, but the quality of the Creative mode paraphrases is genuinely impressive. At $10/month Premium, it's the right tool for any student, academic, or ESL professional who regularly needs to rework existing text.",
    rating: 4.3, lastTested: "January 2026", lastTestedISO: "2026-01-20", datePublished: "2026-01-10", timeUsed: "1 year",
  },
  'frase': {
    whatIs: "Frase is an AI SEO content tool that analyses the top 20 Google results for any keyword and generates a data-driven content brief in 30 seconds. It shows exactly which topics, headings, and questions competitors cover — then its AI writer drafts the article to match. Priced from $15/month with a $1 five-day trial.",
    whoIsItFor: "Content teams, and bloggers who want to create content that actually ranks in Google rather than just reads well. Frase's core function is competitive analysis: it reads the top 10 ranking pages for your target keyword and shows you exactly what topics, headings, questions, and word counts you need to match or beat. If you're writing content with the goal of ranking on page one, Frase is the most focused tool for that job.",
    whoShouldSkip: "Casual bloggers or anyone writing primarily for social media — Frase is purpose-built for SEO-driven long-form content. If ranking on Google isn't your goal, the tool is overkill and the price doesn't make sense. Also skip if you're just starting a site with zero domain authority: Frase tells you what to write, but it can't compensate for a site Google doesn't yet trust.",
    myTake: "Frase changed how I approach content briefs. Before Frase, I spent 45–60 minutes manually reading the top 10 results for a keyword to understand what I needed to cover. Now Frase does that analysis in 30 seconds and presents it in a structured brief: topics covered by competitors, questions they answer, how long the content is, and what headings they use.\n\nThe AI writer then helps you match that structure. I don't use it to write full paragraphs — I find the prose quality lower than Writesonic — but I use it constantly for the brief and the outline. The Content Score feature is the real value: it tells you your optimisation percentage against the top results and shows specifically which topics you're missing. Writing to a Frase content score above 75 consistently produces content that ranks faster than content written without a data-driven brief.\n\nThe $15/month Solo plan only covers 4 documents per month — which sounds limiting, but if those 4 documents are well-researched, 1,500-word pieces targeting medium-difficulty keywords, that's a realistic monthly content load for a solo creator. The $45/month Basic plan (30 documents/month) is where serious content operations start.",
    useCases: [
      "Building comprehensive content briefs before writing — understand what the top 10 pages cover in 30 seconds",
      "Optimising existing posts by finding which topics the top-ranking pages cover that yours doesn't",
      "Identifying the exact questions your target audience is searching — and answering them in FAQ sections",
      "Auditing a content library to find thin pages that need expansion to compete",
      "Researching keyword clusters to build a content calendar around topics you can realistically rank for",
    ],
    pricingSection: "**Frase Pricing (2026):**\n- Solo ($15/month): 4 SEO documents per month. Good for testing or low-volume content operations (1 post/week).\n- Basic ($45/month): 30 SEO documents per month. The right plan for active content teams publishing weekly.\n- Team ($115/month): Unlimited documents + team collaboration, multi-user accounts, and API access.\n\nThere's also a $1 trial for 5 days. Use it to run briefs on your 5 most important keywords — you'll know within that week whether Frase belongs in your workflow.",
    faqs: [
      { q: "Does Frase actually help with SEO?", a: "Yes — specifically for on-page SEO optimisation and content briefs. Frase analyses the top-ranking pages for your keyword and shows you what topics, headings, word counts, and questions you need to address. Pages written with a Frase brief consistently score higher on content comprehensiveness than those written without one. It doesn't help with off-page SEO (backlinks, domain authority)." },
      { q: "Frase vs Surfer SEO — which is better?", a: "Both do content optimisation but Frase is stronger on the brief-building and research side; Surfer SEO is stronger on real-time keyword density analysis during writing. Frase's AI writer is more integrated into the brief workflow. Surfer's Content Score is used by more agencies. If you can only afford one, Frase is better for solo creators; Surfer SEO is better for agencies managing multiple client sites." },
      { q: "Can Frase write content for me?", a: "Yes — Frase has an AI writer that generates paragraphs and sections from the brief it creates. The prose quality is functional but not exceptional. I use Frase for the research and structure and a separate tool (Writesonic or manual writing) for the actual prose. The outline and brief are Frase's strongest outputs." },
    ],
    verdict: "The best tool for SEO-driven content creation if ranking on Google is your primary goal. The research and brief-building features alone justify the price for any content operation publishing more than 2 posts per month. Not for casual bloggers — this is for people treating content as a business investment.",
    rating: 4.4, lastTested: "March 2026", lastTestedISO: "2026-03-10", datePublished: "2026-02-01", timeUsed: "10 months",
  },
  'leonardo-ai': {
    whatIs: "Leonardo.ai is a free AI image generator offering 150 generation credits per day — one of the most generous free plans available. It features custom model training for consistent character styles, a real-time canvas, and 20+ fine-tuned art models. Best suited for game developers, illustrators, and creators who need more creative control than Midjourney provides.",
    whoIsItFor: "Illustrators, concept artists, and social media creators who need consistent, high-quality AI-generated images with fine creative control.",
    whoShouldSkip: "Anyone who just needs a quick image for a blog post. DALL-E or Bing Image Creator are faster and free for basic image needs. Leonardo's power is wasted on simple use cases.",
    myTake: "Leonardo gives you more creative control than Midjourney for free. The custom model training feature lets you create consistent characters across multiple images — something most other tools can't do. The 150 free daily credits are genuinely usable, not just enough for one image.",
    useCases: ["Creating consistent game character sprites and assets", "Generating product mockup images for e-commerce", "Creating social media visuals at scale", "Building concept art for client presentations"],
    verdict: "The most powerful free AI image tool available. The learning curve is real — spend 30 minutes watching tutorials before diving in — but the ceiling of what you can create is higher than any competitor.",
    rating: 4.5, lastTested: "February 2026", datePublished: "2026-01-18", timeUsed: "1.5 years",
  },
  'photoroom': {
    whatIs: "PhotoRoom is an AI background removal and product photography tool used by 150 million people. It automatically removes backgrounds from images — handling hair, transparent objects, and complex edges better than Adobe's own tools — and replaces them with AI-generated scenes. Free plan available; Pro is $9.99/month with batch processing for e-commerce sellers.",
    whoIsItFor: "Product photographers, social media managers, and anyone who regularly removes backgrounds from images.",
    whoShouldSkip: "Anyone who needs full photo editing — PhotoRoom is specifically for background removal and product photography, not general image editing.",
    myTake: "I tested PhotoRoom against 5 other background removal tools using 20 product photos. PhotoRoom won 17 out of 20. It handles hair, transparent objects, and complex edges better than Adobe's own tools. The mobile app is excellent — I've used it to shoot and clean up product photos in under 2 minutes.",
    useCases: ["Removing backgrounds from product photos for Amazon listings", "Creating consistent social media content with clean subject isolation", "Generating professional headshots from casual photos", "Batch processing 100+ product images simultaneously"],
    verdict: "The best background removal tool available. Period. The free plan's watermark is annoying but the $10/month Pro plan is worth it for anyone selling products online.",
    rating: 4.6, lastTested: "March 2026", datePublished: "2026-02-05", timeUsed: "1 year",
  },
  looka: {
    whatIs: "Looka is an AI logo and brand identity generator for startups and small businesses. It produces 40+ logo options in under two minutes based on your industry, style preferences, and colour choices. A basic logo package starts at $20 as a one-time purchase; the $96/year Brand Kit adds business cards, social media templates, and letterhead assets.",
    whoIsItFor: "Startups and small business owners who need a professional logo and brand identity without paying thousands to a design agency.",
    whoShouldSkip: "Established brands that need truly unique, custom design work. Looka's AI generates from templates — sophisticated branding professionals will notice the patterns.",
    myTake: "I used Looka to create a brand identity for a test project. The AI generated 40+ logo options in under 2 minutes. The quality varies — some look generic — but 3–4 options were genuinely strong. The brand kit (business cards, social media templates, letterhead) justifies the price.",
    useCases: ["Creating a logo for a new startup or side project", "Generating a full brand kit for a freelance business", "Designing social media profile assets quickly", "Getting a professional logo before a client meeting — same day"],
    verdict: "A one-time investment that saves thousands compared to hiring a designer. The logo quality is better than Canva's logo maker and you own the files outright.",
    rating: 4.1, lastTested: "January 2026", datePublished: "2026-01-12", timeUsed: "6 months",
  },
  pictory: {
    whatIs: "Pictory is an AI video creation tool that converts blog posts, scripts, and articles into edited videos automatically. It selects relevant stock footage from a 3-million+ clip library, adds AI-generated captions, and exports in landscape, square, or portrait formats. Designed for bloggers and content repurposers with no video editing skills; plans start at $19/month.",
    whoIsItFor: "Bloggers and YouTube creators who want to turn written content into video without editing skills or expensive software.",
    whoShouldSkip: "Anyone who needs highly custom or creative video production. Pictory's automation means the results are good but predictable — not suited for narrative storytelling.",
    myTake: "I converted a 1,500-word blog post into a 3-minute video in 12 minutes using Pictory. The AI picks relevant stock footage, adds captions, and inserts background music automatically. The result needed minor adjustments but was 80% publish-ready.",
    useCases: ["Converting blog posts into YouTube videos automatically", "Creating short Reels/Shorts from long-form articles", "Generating video summaries of podcast episodes", "Building a faceless YouTube channel from written content"],
    verdict: "The fastest way to turn written content into video. The stock footage library shows its limits on niche topics but for business and marketing content it works excellently.",
    rating: 4.1, lastTested: "February 2026", datePublished: "2026-01-22", timeUsed: "7 months",
  },
  'opus-clip': {
    whatIs: "Opus Clip is an AI video repurposing tool that automatically finds the best moments in long-form videos and converts them into short clips for TikTok, Reels, and Shorts. It scores each clip for virality potential, adds animated captions, and exports in portrait format. Free plan includes 60 minutes of processing per month; paid plans start at $19/month.",
    whoIsItFor: "Webinar hosts, and anyone with long-form video content who wants to repurpose it into short clips for TikTok, Reels, and Shorts.",
    whoShouldSkip: "Anyone without existing long-form video content. Opus Clip needs source material to work with — it's a repurposing tool, not a creation tool.",
    myTake: "I tested Opus Clip on a 45-minute interview and it produced 8 clips. 5 of them were genuinely good — it correctly identified the most emotionally engaging moments, added captions, and even applied a virality score. The other 3 cut at awkward points. Still a massive time saver versus manual clipping.",
    useCases: ["Clipping YouTube videos into TikTok and Reels content", "Extracting key moments from podcast episodes", "Repurposing webinar recordings into social media clips", "Building a short-form content library from long videos"],
    verdict: "The best AI video repurposing tool available. The free plan's 60 minutes per month is enough to test properly. Essential for anyone trying to grow short-form alongside long-form.",
    rating: 4.3, lastTested: "March 2026", datePublished: "2026-02-10", timeUsed: "9 months",
  },
  invideo: {
    whatIs: "InVideo AI is a text-to-video platform that generates complete videos from a single text prompt — including script, AI voiceover, stock footage from a 16-million+ library, and captions. Purpose-built for faceless YouTube channels and educational content. Free plan allows unlimited videos with watermark; paid plans from $20/month remove watermarks and unlock 1080p export.",
    whoIsItFor: "Digital marketers, and educators who want to create complete videos from a text prompt without appearing on camera.",
    whoShouldSkip: "Anyone making personal brand content or narrative-driven video. InVideo's AI-selected stock footage looks generic — personal stories need personal footage.",
    myTake: "InVideo AI is the most complete text-to-video tool I've tested. I gave it a 50-word prompt about 'how to save money in your 20s' and got a 4-minute video with a script, voiceover, stock footage, and captions. The quality of stock footage selection is the weakest link but the voiceover and pacing are excellent.",
    useCases: ["Creating faceless YouTube educational videos at scale", "Producing explainer videos for product landing pages", "Generating social media video content from blog topics", "Creating training videos for teams without recording equipment"],
    verdict: "The most capable text-to-video tool for faceless content creators. The free plan lets you create 10 minutes of video per week — enough to start a channel.",
    rating: 4.2, lastTested: "April 2026", datePublished: "2026-02-15", timeUsed: "8 months",
  },
  'murf-ai': {
    whatIs: "Murf AI is a professional text-to-speech voiceover platform with 120+ studio-quality voices across 20+ languages. It includes a video sync feature that automatically adjusts speech pace to match your video timeline — unique in its category. Free plan provides 10 minutes of voiceover; Creator plan is $19/month with 2 hours and full commercial use rights.",
    whoIsItFor: "Marketers, corporate trainers, and podcasters who need professional-quality voiceovers without hiring a voice actor or recording themselves. Murf is the right tool when the voiceover needs to sound like it was recorded in a professional studio — not a synthesised robot — and when you need to produce multiple versions (different languages, different tones) from the same script without re-recording.",
    whoShouldSkip: "Anyone on a tight budget — Murf's $19/month minimum is expensive compared to free alternatives like ElevenLabs' free tier (which offers 10,000 characters/month at no cost). For basic one-off voiceovers where naturalness isn't critical, ElevenLabs' free plan is sufficient. Also not ideal if you need voice cloning from your own voice — ElevenLabs is more advanced in that specific area.",
    myTake: "Murf's voices are noticeably more natural than most alternatives I've tested. The difference is most obvious at the end of sentences — generic TTS tools sound robotic on sentence-final falling intonation; Murf's voices land those endings naturally. I tested 15 voices across 5 different scripts — product demo, eLearning module, YouTube explainer, podcast intro, and corporate training — and found 6 that I'd use for client-facing work without hesitation.\n\nThe video sync feature is the most unique thing Murf offers: it automatically adjusts speech pace to fit your video's timeline. If your clip runs 47 seconds, Murf adjusts the voiceover delivery to match exactly — without changing the pitch or making the voice sound sped-up. I haven't seen that anywhere else and it's saved me hours of manual video editing.\n\nThe voice customisation controls — pitch, speed, emphasis, and pause duration — are more granular than ElevenLabs at equivalent price points. You can mark specific words for emphasis and the output respects it consistently.\n\nThe main limitation: no real-time voice cloning. If you want a voiceover that sounds like a specific person, ElevenLabs' voice cloning is more advanced. Murf's voices are all their own studio-recorded library — excellent quality, but not customisable to a personal voice.",
    useCases: [
      "Voiceovers for YouTube explainer videos and online courses — multiple script versions without re-recording",
      "Narration for product demo videos with automatic video-sync to timeline length",
      "eLearning module audio with emphasis markers for key terms and concepts",
      "Multilingual voiceovers: same script converted to 20+ languages for global campaign distribution",
      "Podcast-style audio content for blog posts — converting written articles to audio format",
    ],
    pricingSection: "**Murf AI Pricing (2026):**\n- Free: 10 minutes of voiceover per month, watermarked output, 120 voices, 20 languages. Enough to test voice quality.\n- Creator ($19/month billed annually): 2 hours of voiceover/month, no watermark, commercial usage rights, download as MP3/WAV, video background upload for syncing.\n- Business ($39/month billed annually): 4 hours/month, team collaboration, voice cloning (limited), API access, priority support.\n- Enterprise: Custom pricing for unlimited usage, dedicated account management, SSO.\n\nThe Creator plan at $19/month is the practical entry point for solo creators. 2 hours of voiceover is approximately 18,000–20,000 words of narration — enough for 10–15 YouTube videos per month.",
    faqs: [
      { q: "Is Murf AI free?", a: "Yes — Murf has a free plan offering 10 minutes of voiceover per month with a watermark on exports. The free plan is sufficient for testing voice quality and the interface, but not for production use. Commercial-use voiceover without watermarks requires the Creator plan at $19/month." },
      { q: "Murf AI vs ElevenLabs — which is better?", a: "They're strong in different areas. Murf is better for structured studio-recorded voices, video timeline sync, and eLearning-style narration. ElevenLabs is better for voice cloning (creating a voiceover that sounds like a specific person) and has a more generous free tier (10,000 characters/month vs Murf's 10 minutes). For general professional voiceovers, Murf's voice quality is more consistently natural. For cloning a personal voice, ElevenLabs wins." },
      { q: "What languages does Murf AI support?", a: "Murf supports 20+ languages including English (US, UK, Australian, Indian accents), Spanish, French, German, Italian, Portuguese, Hindi, Arabic, Chinese, Japanese, and Korean. The non-English voice quality is strong for the major European languages and Hindi — noticeably better than most competitors for Indian English specifically." },
      { q: "Can I use Murf AI for commercial projects?", a: "Yes — the Creator plan and above include commercial usage rights. The free plan output is watermarked and cannot be used commercially. Check the specific licensing terms for client-facing work; the Business plan's commercial licence is broader than Creator's." },
    ],
    verdict: "The best balance of voice naturalness and production workflow in AI voiceover tools. The video sync feature alone distinguishes it from every other tool in the category. More expensive than some alternatives, but the output quality and time saving on video production justifies it for professional use.",
    rating: 4.4, lastTested: "January 2026", lastTestedISO: "2026-01-15", datePublished: "2026-01-08", timeUsed: "1 year",
  },
  podcastle: {
    whatIs: "Podcastle is an AI podcast recording and editing platform that captures remote guests in studio-quality audio, then cleans up the recording automatically. Its Magic Dust AI removes background noise, keyboard clicks, and echo in one click. The Revoice feature fixes mispronounced words without re-recording. Free plan covers 10 hours of recording per month.",
    whoIsItFor: "Journalists, and content creators who record interviews and need studio-quality audio without a studio setup or recording equipment budget.",
    whoShouldSkip: "Professional audio engineers or producers who need multi-track mixing, precise waveform editing, and advanced mastering. Podcastle isn't Audacity or Adobe Audition — it's designed for ease, not maximum control.",
    myTake: "I recorded a remote interview using Podcastle and compared the cleaned-up audio to a professional podcast recorded in a studio. Podcastle's AI noise removal eliminated keyboard clicks, air conditioning hum, and mic handling noise that I hadn't even noticed during recording. The Revoice voice cloning feature for fixing mispronounced words mid-episode is genuinely impressive.",
    useCases: ["Recording and cleaning remote podcast interviews", "Transcribing interviews for show notes automatically", "Fixing audio errors post-recording without re-recording the entire segment", "Publishing podcasts to Spotify and Apple Podcasts directly"],
    verdict: "The best all-in-one podcast tool for creators who don't want to learn Audacity. The free plan is functional enough to start your first show today.",
    rating: 4.2, lastTested: "April 2026", datePublished: "2026-02-20", timeUsed: "6 months",
  },
  gamma: {
    whatIs: "Gamma is an AI presentation tool that generates a complete slide deck from a topic or outline in under 3 minutes. It also creates scrollable documents and single-page websites using the same workflow. Free plan includes 400 AI credits on signup — enough for 4–5 full presentations. Paid plans start at $8/month with unlimited AI creation and badge removal.",
    whoIsItFor: "Students presenting projects, educators creating course materials, and anyone who needs beautiful presentations without design skills.",
    whoShouldSkip: "Large enterprise teams with strict brand guidelines. Gamma's AI design choices are strong but not as controllable as PowerPoint for pixel-perfect brand compliance.",
    myTake: "I created a 12-slide investor pitch deck from a 200-word brief in 4 minutes using Gamma. The design was genuinely polished — better than 80% of the decks I see in real life. The one-click restyle feature let me swap the entire visual theme instantly. The only weakness is that Gamma-made decks look like Gamma-made decks to a trained eye.",
    useCases: ["Creating investor pitch decks from a brief", "Building client-ready proposals quickly", "Making course curriculum slides for educators", "Converting blog posts into presentation format"],
    verdict: "The best free presentation tool available. If you spend more than 2 hours per month making slides, Gamma will save you more time than any other tool on this list.",
    rating: 4.5, lastTested: "March 2026", datePublished: "2026-02-25", timeUsed: "1 year",
  },
  'beautiful-ai': {
    whatIs: "Beautiful.ai is an AI presentation tool with Smart Slides that automatically reformat as you add or remove content — no manual alignment or resizing needed. Designed for business professionals who need consistently polished decks without a designer. No permanent free plan; Pro is $12/month billed annually, Team is $40/user/month with collaboration and shared brand kits.",
    whoIsItFor: "Business professionals and teams who need to create consistent, on-brand presentations regularly without a dedicated designer.",
    whoShouldSkip: "Anyone who wants a free option or needs highly creative, unconventional slide designs. Beautiful.ai keeps things professional but not adventurous.",
    myTake: "Beautiful.ai's smart slides auto-format as you type — add a bullet point and the layout adjusts automatically. It removes the most frustrating part of PowerPoint: manually resizing and aligning elements. The team collaboration features are excellent for agencies managing multiple client decks.",
    useCases: ["Creating weekly business reports and board presentations", "Building sales decks with consistent branding", "Team collaboration on shared presentation templates", "Converting data into visual presentation slides"],
    verdict: "Better than PowerPoint for anyone who isn't a designer. The lack of a free plan is the main drawback but the $12/month Pro plan is fair for the time it saves.",
    rating: 4.1, lastTested: "February 2026", datePublished: "2026-01-28", timeUsed: "8 months",
  },
  ocoya: {
    whatIs: "Ocoya is an AI social media tool that combines caption writing, graphic design, and post scheduling in one dashboard. It generates platform-specific captions for Instagram, LinkedIn, Twitter/X, TikTok, and 5 other networks, and includes a Canva-style design editor. Plans start at $15/month — replacing a separate caption writer and scheduler that would cost $25–30/month combined.",
    whoIsItFor: "Small business owners, freelance content creators, and agencies managing 2–5 client accounts who need a single tool for writing, designing, and scheduling.",
    whoShouldSkip: "Large agencies managing 20+ accounts or enterprise teams that need deep analytics, approval workflows, and team permission systems. Ocoya is built for smaller operations.",
    myTake: "Ocoya compresses what normally takes 3 separate tools — a caption writer, a design tool, and a scheduler — into one dashboard. The AI caption generator is genuinely good for Instagram and LinkedIn. The design tool is Canva-lite but works for quick posts. The scheduling is reliable and I haven't had a missed post in 4 months of use.",
    useCases: ["Scheduling 30 posts across Instagram, LinkedIn, and Twitter at once", "Generating AI captions for product launch announcements", "Creating and posting content for client social media accounts", "Maintaining consistent posting frequency without daily manual work"],
    verdict: "The best value all-in-one social media tool for solo operators and small teams. Not as powerful as Hootsuite for large operations, but far more affordable and easier to use.",
    rating: 4.0, lastTested: "April 2026", datePublished: "2026-03-01", timeUsed: "4 months",
  },
  replit: {
    whatIs: "Replit is a browser-based coding environment that requires zero local setup — no installing Node.js, Python, or any runtime. It supports 50+ programming languages, deploys apps instantly with a public URL, and includes Ghostwriter, an AI coding assistant with full project context. Free plan available; Core plan is $7/month for production hosting.",
    whoIsItFor: "Indie developers prototyping ideas, non-technical founders who want to build and deploy apps without local setup, and teachers running live coding sessions.",
    whoShouldSkip: "Senior developers doing production work. Replit's performance and environment control don't match a properly configured local development setup with your preferred tools.",
    myTake: "Replit is where I'd send anyone who wants to learn coding in 2026. The browser-based environment eliminates the 'how do I install Node.js' problem that kills beginner motivation. The AI assistant (Ghostwriter) is integrated directly into the editor and understands the context of your entire project — not just the line you're on. I've used it to prototype 3 side projects without touching my local machine.",
    useCases: ["Learning Python, JavaScript, or any of 50+ languages without setup", "Prototyping web apps and sharing them instantly with a URL", "Building and deploying side projects without DevOps knowledge", "Collaborative coding sessions with teammates in real time"],
    verdict: "The best platform for learning to code or prototyping quickly. The free tier's usage limits can frustrate heavy users, but for getting started or building small projects it's unmatched.",
    rating: 4.2, lastTested: "April 2026", datePublished: "2026-03-05", timeUsed: "1.5 years",
  },
  'notion-ai': {
    whatIs: "Notion AI is an AI add-on for Notion that reads and references your existing workspace content. It summarises meeting notes, writes documents in your brand voice, translates pages, and extracts action items — all without leaving Notion. Priced at $10/month per workspace member, added on top of any existing Notion plan. Requires an active Notion account.",
    whoIsItFor: "Teams and individuals who already use Notion and want AI capabilities built directly into their existing workspace rather than switching between tools.",
    whoShouldSkip: "Anyone who doesn't already use Notion. The AI add-on is an extension of Notion, not a standalone tool — if you're not already in Notion daily, a tool like Rytr or ChatGPT is more practical.",
    myTake: "Notion AI's biggest advantage is context — it can read and reference all your existing Notion pages when generating content. Ask it to write a blog post and it can pull in your brand voice guidelines, existing content, and style preferences from your workspace. The AI agents that run tasks autonomously for 20 minutes (Notion 3.0) are genuinely novel.",
    useCases: ["Summarising meeting notes into action items automatically", "Writing blog drafts that match your existing brand voice", "Building project wikis from scattered notes", "Translating documents into multiple languages in-context"],
    verdict: "Essential for existing Notion users. The $10/month AI add-on pays for itself if you spend even 30 minutes per day in Notion.",
    rating: 4.4, lastTested: "March 2026", datePublished: "2026-02-28", timeUsed: "1.5 years",
  },
  taskade: {
    whatIs: "Taskade is an AI-native project management tool that combines task management, team chat, video calls, and custom AI agents in a single workspace. Its AI agents automatically break down project briefs into tasks with deadlines in under 10 seconds. Free plan is fully functional for individuals and small teams; paid plans start at $8/month for more AI credits and storage.",
    whoIsItFor: "Small teams (2–15 people), and solopreneurs who need task management, project tracking, team chat, and AI assistance without paying for 4 separate tools.",
    whoShouldSkip: "Large enterprises that need complex role-based permissions, audit logs, and enterprise security compliance. Taskade is built for small, agile teams.",
    myTake: "Taskade's custom AI agents are the standout feature. I built an agent that automatically breaks down any project brief into tasks, assigns due dates, and creates a Kanban board — in under 10 seconds. The video collaboration built directly into tasks is something I haven't seen in any competing tool. The mind map view is genuinely useful for brainstorming.",
    useCases: ["Managing client projects with automated task breakdown", "Running a remote team without needing Slack + Asana + Notion separately", "Building AI agents to handle repetitive workflow steps", "Organising personal projects with AI-powered mind maps"],
    verdict: "The most feature-rich tool at its price point. The interface takes a week to fully learn but the investment pays off for any freelancer or small team.",
    rating: 4.2, lastTested: "April 2026", datePublished: "2026-03-10", timeUsed: "10 months",
  },
};

const TODAY = new Date().toISOString().split('T')[0];

// ── Map each tool slug to its compare article slugs (Task 4 — internal linking) ──
const TOOL_COMPARE_MAP: Record<string, string[]> = {
  rytr:          ['rytr-vs-writesonic'],
  writesonic:    ['rytr-vs-writesonic'],
  grammarly:     ['grammarly-vs-quillbot'],
  quillbot:      ['grammarly-vs-quillbot'],
  ocoya:         ['ocoya-vs-buffer-vs-hootsuite'],
  podcastle:     ['podcastle-vs-descript'],
  'leonardo-ai': ['leonardo-vs-midjourney'],
  replit:        ['replit-vs-github-copilot'],
  taskade:       ['taskade-vs-notion'],
};

interface ToolPageProps { tool: Tool; navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void; }

function StarRating({ rating, accent }: { rating: number; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={16}
          fill={i <= Math.floor(rating) ? accent : i - 0.5 <= rating ? accent : 'transparent'}
          color={accent} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function FAQItem({ q, a, accent }: { q: string; a: string; accent: string; key?: React.Key }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid var(--brd-xs)` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: C.txt, lineHeight: 1.5, fontFamily: "'Syne', sans-serif" }}>{q}</span>
        {open ? <ChevronUp size={16} color={accent} style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color={C.mut2} style={{ flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ paddingBottom: 16, paddingRight: 28, fontSize: 14, color: C.mut, lineHeight: 1.75, fontWeight: 300 }}>
          {a}
        </div>
      )}
    </div>
  );
}

const TOOL_DOMAIN: Record<string, string> = {
  'grammarly':'grammarly.com','writesonic':'writesonic.com','rytr':'rytr.me',
  'quillbot':'quillbot.com','frase':'frase.io','leonardo-ai':'leonardo.ai',
  'photoroom':'photoroom.com','looka':'looka.com','pictory':'pictory.ai',
  'opus-clip':'opus.pro','invideo':'invideo.ai','murf-ai':'murf.ai',
  'podcastle':'podcastle.ai','gamma':'gamma.app','beautiful-ai':'beautiful.ai',
  'ocoya':'ocoya.com','replit':'replit.com','notion-ai':'notion.so','taskade':'taskade.com',
};

function ToolLogoImg({ slug, size = 32, name, color }: { slug: string; size?: number; name?: string; color?: string }) {
  const [err, setErr] = React.useState(false);
  const domain = TOOL_DOMAIN[slug];
  const initial = (name ?? slug)[0].toUpperCase();
  if (domain && !err) {
    return (
      <img src={`https://logo.clearbit.com/${domain}`}
        // M4 (SEO-Medium): descriptive alt text for image SEO + accessibility.
        // Format: "[Tool Name] AI tool logo" — captures image search queries
        // and gives screen readers meaningful context.
        alt={name ? `${name} AI tool logo` : slug}
        width={size} height={size}
        style={{ borderRadius: Math.round(size * 0.27), objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span style={{ width: size, height: size, borderRadius: Math.round(size * 0.27),
      background: color ?? 'var(--a1)', color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.45, fontWeight: 700,
      fontFamily: "'Syne', sans-serif", flexShrink: 0 }}>
      {initial}
    </span>
  );
}

// ── Per-tool 5-axis radar scores [EaseOfUse, OutputQuality, Value, FreePlan, Support] ──
const TOOL_RADAR: Record<string, [number, number, number, number, number]> = {
  'grammarly':    [4.8, 4.5, 4.3, 4.8, 4.2],
  'writesonic':   [3.8, 4.2, 4.3, 4.0, 3.8],
  'rytr':         [4.8, 3.8, 5.0, 4.5, 3.8],
  'quillbot':     [4.8, 4.3, 4.5, 4.3, 3.8],
  'frase':        [3.5, 4.5, 3.8, 3.0, 4.0],
  'leonardo-ai':  [3.2, 4.8, 4.8, 4.5, 3.5],
  'photoroom':    [4.8, 4.8, 4.2, 3.8, 4.0],
  'looka':        [4.5, 4.0, 4.2, 3.0, 3.8],
  'pictory':      [4.5, 3.8, 4.0, 3.5, 3.8],
  'opus-clip':    [4.3, 4.3, 4.0, 4.0, 3.8],
  'invideo':      [4.5, 4.0, 4.3, 4.2, 3.8],
  'murf-ai':      [4.5, 4.5, 3.5, 2.5, 4.0],
  'podcastle':    [4.5, 4.2, 4.3, 4.0, 3.8],
  'gamma':        [5.0, 4.5, 4.8, 4.5, 3.8],
  'beautiful-ai': [4.5, 4.2, 3.8, 2.0, 3.8],
  'ocoya':        [4.2, 3.8, 4.5, 3.5, 3.8],
  'replit':       [4.5, 4.2, 4.5, 4.0, 4.2],
  'notion-ai':    [4.3, 4.4, 4.2, 3.5, 4.0],
  'taskade':      [3.8, 4.2, 4.8, 4.0, 4.0],
};

const RADAR_AXES = ['Ease of Use', 'Output Quality', 'Value', 'Free Plan', 'Support'] as const;

function RadarChart({ scores, accent }: { scores: [number, number, number, number, number]; accent: string }) {
  const S = 260, cx = 130, cy = 130, maxR = 88, n = 5;
  const ang = (i: number) => (i * 2 * Math.PI) / n - Math.PI / 2;
  const pts = (r: number) => Array.from({ length: n }, (_, i) => ({
    x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)),
  }));
  const gridPoly = (lvl: number) => pts((lvl / 5) * maxR).map(p => `${p.x},${p.y}`).join(' ');
  const dataPts = pts(maxR).map((p, i) => {
    const r = (scores[i] / 5);
    return { x: cx + (p.x - cx) * r, y: cy + (p.y - cy) * r };
  });
  const dataPath = dataPts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ') + ' Z';
  const labelR = maxR + 26;
  const labelPts = Array.from({ length: n }, (_, i) => {
    const a = ang(i);
    return { x: cx + labelR * Math.cos(a), y: cy + labelR * Math.sin(a), label: RADAR_AXES[i], score: scores[i] };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12 }}>
      <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} style={{ overflow: 'visible', maxWidth: '100%' }}>
        {/* Grid rings */}
        {[1,2,3,4,5].map(l => (
          <polygon key={l} points={gridPoly(l)} fill="none" stroke="var(--brd-xs)" strokeWidth={l === 5 ? 1.5 : 1} />
        ))}
        {/* Axis lines */}
        {pts(maxR).map((p, i) => (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--brd-xs)" strokeWidth="1" />
        ))}
        {/* Score labels on rings (just 1 and 5) */}
        <text x={cx + 4} y={cy - (1/5)*maxR - 3} fontSize="8" fill="var(--mut2)" fontFamily="'DM Sans',sans-serif">1</text>
        <text x={cx + 4} y={cy - maxR - 3}         fontSize="8" fill="var(--mut2)" fontFamily="'DM Sans',sans-serif">5</text>
        {/* Data polygon */}
        <path d={dataPath} fill={`${accent}28`} stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />
        {/* Data dots */}
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="5" fill={accent} stroke="var(--surf)" strokeWidth="2" />
        ))}
        {/* Axis labels */}
        {labelPts.map((lp, i) => {
          const anchor = lp.x < cx - 6 ? 'end' : lp.x > cx + 6 ? 'start' : 'middle';
          return (
            <g key={i}>
              <text x={lp.x} y={lp.y - 5} textAnchor={anchor} fontSize="9.5" fontWeight="600"
                fill="var(--mut2)" fontFamily="'DM Sans',sans-serif" letterSpacing="0.01em">
                {lp.label}
              </text>
              <text x={lp.x} y={lp.y + 9} textAnchor={anchor} fontSize="11" fontWeight="800"
                fill={accent} fontFamily="'Syne',sans-serif">
                {lp.score}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Legend row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
        {RADAR_AXES.map((axis, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
            <span style={{ fontSize: 11, color: 'var(--mut2)', fontWeight: 500 }}>{axis}</span>
            <span style={{ fontSize: 11, color: accent, fontWeight: 700 }}>{scores[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToolPage({ tool, navigate, isDark, toggleTheme }: ToolPageProps) {
  const isA2 = CAT_ACCENT[tool.category] === 'a2';
  const accent = isA2 ? C.a2 : C.a1;
  const cardBg = isA2 ? C.a2card : C.a1card;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;
  const content = TOOL_CONTENT[tool.slug];
  const faqs = TOOL_FAQS[tool.slug] || [];
  const comparisons = TOOL_COMPARISONS[tool.slug] || [];
  const keywords = TOOL_KEYWORDS[tool.slug] || [];

  // Schema.org — Review + FAQPage combined
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "name": `${tool.name} Review ${new Date().getFullYear()}`,
    "headline": `${tool.name} Review — ${tool.tagline}`,
    "description": `Honest ${tool.name} review by Navneet Arya (AI Nexus). ${tool.tagline}. Tested personally for ${content?.timeUsed || 'several months'}.`,
    "datePublished": content?.datePublished ?? TODAY,
    "dateModified": tool.lastTestedISO ?? (content?.lastTested ? new Date(content.lastTested).toISOString().split('T')[0] : TODAY),
    "url": `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`,
    "reviewBody": content ? `${content.myTake} ${content.verdict}` : tool.description,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": content?.rating?.toString() || "4.0",
      "bestRating": "5", "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": SITE_CONFIG.authorName,
      "url": `${SITE_CONFIG.siteUrl}/about`,
      "description": SITE_CONFIG.authorBio,
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Nexus",
      "url": SITE_CONFIG.siteUrl,
    },
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": tool.name,
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": tool.pricing },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": content?.rating?.toString() || "4.0",
        "reviewCount": "1", "bestRating": "5", "worstRating": "1"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.siteUrl },
        { "@type": "ListItem", "position": 2, "name": tool.category, "item": `${SITE_CONFIG.siteUrl}/?category=${tool.category}` },
        { "@type": "ListItem", "position": 3, "name": tool.name, "item": `${SITE_CONFIG.siteUrl}/tools/${tool.slug}` }
      ]
    }
  };

  // NOTE: FAQPage schema is intentionally NOT rendered here.
  // prerender.mjs already injects FAQPage JSON-LD into the static HTML at build time.
  // Rendering it again from the React component creates a duplicate that Google flags as
  // "Duplicate field 'FAQPage'" in Search Console. See CompareArticlePage.tsx for same pattern.

  const section = (content: React.ReactNode, mb = 14) => (
    <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: mb }}>
      {content}
    </div>
  );

  /** G5 GEO: semantic <section> wrapper with aria-label for AI crawler extraction */
  const geoSection = (ariaLabel: string, content: React.ReactNode, mb = 14) => (
    <section aria-label={ariaLabel} style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: mb }}>
      {content}
    </section>
  );

  const sectionTitle = (text: string) => (
    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
      {text}
    </h2>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      {/* FAQPage schema injected by prerender.mjs — do NOT add a second one here */}
      {/* W2-3: Standalone BreadcrumbList schema — Google prefers this as a separate script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_CONFIG.siteUrl },
          { "@type": "ListItem", "position": 2, "name": tool.category, "item": `${SITE_CONFIG.siteUrl}/?category=${tool.category}` },
          { "@type": "ListItem", "position": 3, "name": `${tool.name} Review`, "item": `${SITE_CONFIG.siteUrl}/tools/${tool.slug}` }
        ]
      }) }} />

      {/* Nav */}
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="tool" />

      {/* Breadcrumb — H3 fix: semantic <nav> with aria-label + aria-current for SERP display */}
      <nav aria-label="Breadcrumb" style={{ maxWidth: 860, margin: '0 auto', padding: '12px 28px 0' }}>
        <ol style={{ display: 'flex', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0, fontSize: 12, color: C.mut2 }}>
          <li>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
          </li>
          <li aria-hidden="true" style={{ margin: '0 6px' }}>›</li>
          <li>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/?category=${encodeURIComponent(tool.category)}`)}>{tool.category}</span>
          </li>
          <li aria-hidden="true" style={{ margin: '0 6px' }}>›</li>
          <li aria-current="page" style={{ color: accent, fontWeight: 500 }}>{tool.name}</li>
        </ol>
      </nav>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 28px 96px' }}>

        {/* ── Hero ── */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${cardBrd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle,${accent}10 0%,transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' as const, marginBottom: 18 }}>
              <ToolLogoImg slug={tool.slug} size={64} name={tool.name} color={accent} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100 }}>
                    {tool.category.toUpperCase()}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', color: accent, background: cardBg, border: `1px solid ${cardBrd}`, padding: '3px 10px', borderRadius: 100 }}>
                    <Calendar size={11} /> Last verified: {content?.lastTested || 'May 2026'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mut2 }}>
                    <User size={12} /> Reviewed by {SITE_CONFIG.authorName}
                  </span>
                  {content?.timeUsed && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: accent, fontWeight: 500 }}>
                      <Award size={12} /> Tested for {content.timeUsed}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,44px)', color: C.txt, margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
              {tool.name} Review {new Date().getFullYear()} — {tool.tagline}
            </h1>

            {content && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
                <StarRating rating={content.rating} accent={accent} />
                <span style={{ fontSize: 15, fontWeight: 600, color: accent }}>{content.rating}/5</span>
                <span style={{ fontSize: 13, color: C.mut2 }}>— AI Nexus rating</span>
              </div>
            )}

            <p style={{ fontSize: 16, lineHeight: 1.75, color: C.mut, margin: '0 0 24px', fontWeight: 300 }}>
              {tool.description}
            </p>

            {/* Pricing + CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
              <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'Syne', sans-serif", textDecoration: 'none' }}>
                Try {tool.name} Free <ExternalLink size={14} />
              </a>
              {tool.pricing && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: C.mut2 }}>
                  <Tag size={13} /> {tool.pricing}
                </span>
              )}
            </div>

            <p style={{ fontSize: 11, color: C.mut2, marginTop: 12, fontWeight: 300 }}>
              Affiliate link — I earn a commission if you upgrade, at no extra cost to you.{' '}
              <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/disclosure')}>Full disclosure →</span>
            </p>
          </div>
        </div>

        {/* ── AEO A3: "What is [Tool]?" — featured snippet target for "[tool] review" queries ── */}
        {content?.whatIs && (
          <section
            aria-label={`What is ${tool.name}`}
            style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '24px 30px', marginBottom: 14 }}
          >
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              What is {tool.name}?
            </h2>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
              {content.whatIs}
            </p>
          </section>
        )}

        {/* ── G5 GEO: Quick Verdict — semantic <section> so AI crawlers parse "Is [Tool] Worth It?" ── */}
        {content && (
          <section aria-label="Quick Verdict" style={{ background: C.sukbg, borderRadius: 14, border: `1.5px solid ${C.sukbrd}`, padding: '18px 22px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={16} color="#059669" />
            </div>
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 600, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' as const, margin: '0 0 5px', fontFamily: "'DM Sans', sans-serif" }}>Is {tool.name} Worth It? — Quick Verdict</h2>
              <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{content.verdict}</p>
            </div>
          </section>
        )}

        {/* ── Features grid ── */}
        {tool.features && tool.features.length > 0 && (
          section(
            <>
              {sectionTitle('Key features')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {tool.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: cardBg, borderRadius: 10, border: `1px solid ${cardBrd}` }}>
                    <Check size={14} color={accent} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.txt, fontWeight: 400 }}>{f}</span>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── Pros & Cons ── */}
        {(tool.pros?.length || tool.cons?.length) && (
          section(
            <>
              {sectionTitle('Pros & cons')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {tool.pros?.length && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Pros</div>
                    {tool.pros.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.sukbg, border: `1px solid ${C.sukbrd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <Check size={11} color="#059669" />
                        </div>
                        <span style={{ fontSize: 13, color: C.txt, lineHeight: 1.55 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tool.cons?.length && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Cons</div>
                    {tool.cons.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.errbg, border: `1px solid ${C.errbrd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                          <X size={11} color="#dc2626" />
                        </div>
                        <span style={{ fontSize: 13, color: C.txt, lineHeight: 1.55 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )
        )}

        {/* ── Performance Radar Chart ── */}
        {TOOL_RADAR[tool.slug] && (
          section(
            <>
              {sectionTitle('Performance breakdown')}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 20px', lineHeight: 1.65, fontWeight: 300 }}>
                How {tool.name} scores across five dimensions based on hands-on testing.
              </p>
              <RadarChart scores={TOOL_RADAR[tool.slug]!} accent={accent} />
            </>
          )
        )}

        {/* ── My honest take ── */}
        {content && (
          section(
            <>
              {sectionTitle('My honest take')}
              {/* Author byline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: cardBg, borderRadius: 12, border: `1px solid ${cardBrd}`, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${C.a1},${C.a2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>NA</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{SITE_CONFIG.authorName}</div>
                  <div style={{ fontSize: 11, color: C.mut2 }}>{SITE_CONFIG.authorExperience} · tested {tool.name} for {content.timeUsed}</div>
                </div>
              </div>
              <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.8, fontWeight: 300, margin: '0 0 18px' }}>{content.myTake}</p>

              {/* Use cases */}
              <div style={{ fontSize: 12, fontWeight: 600, color: accent, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 12 }}>Real use cases I tested</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                {content.useCases.map((u, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: cardBg, borderRadius: 10, border: `1px solid ${cardBrd}`, fontSize: 13, color: C.txt, lineHeight: 1.5 }}>
                    → {u}
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── G5 GEO: Who Should Use / Who Should NOT — semantic sections for AI extraction ── */}
        {content && (
          geoSection('Who Should Use This',
            <>
              {sectionTitle(`Who Should Use ${tool.name}`)}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <section aria-label="Who Should Use This" style={{ padding: '16px', background: C.sukbg, borderRadius: 12, border: `1px solid ${C.sukbrd}` }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 10px', fontFamily: "'DM Sans', sans-serif" }}>Good fit for</h3>
                  <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{content.whoIsItFor}</p>
                </section>
                <section aria-label="Who Should NOT Use This" style={{ padding: '16px', background: C.errbg, borderRadius: 12, border: `1px solid ${C.errbrd}` }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase' as const, margin: '0 0 10px', fontFamily: "'DM Sans', sans-serif" }}>Skip if you need</h3>
                  <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{content.whoShouldSkip}</p>
                </section>
              </div>
            </>
          )
        )}

        {/* ── Comparison table ── */}
        {comparisons.length > 0 && (
          section(
            <>
              {sectionTitle(`How ${tool.name} stacks up`)}
              <div style={{ overflowX: 'auto' as const }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${cardBrd}` }}>
                      {['Tool', 'Pricing', 'Free plan', 'Best for', ''].map((h, i) => (
                        <th key={i} style={{ textAlign: 'left' as const, padding: '8px 12px', fontSize: 11, fontWeight: 600, color: C.mut2, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid var(--brd-xs)`, background: row.ourPick ? cardBg : 'transparent' }}>
                        <td style={{ padding: '12px 12px', fontWeight: row.ourPick ? 600 : 400, color: row.ourPick ? accent : C.txt }}>
                          {row.name} {row.ourPick && <span style={{ fontSize: 10, background: accent, color: '#fff', borderRadius: 6, padding: '2px 6px', marginLeft: 6 }}>our pick</span>}
                        </td>
                        <td style={{ padding: '12px 12px', color: C.mut }}>{row.price}</td>
                        <td style={{ padding: '12px 12px' }}>{row.freeplan ? <Check size={14} color="#059669" /> : <X size={14} color="#dc2626" />}</td>
                        <td style={{ padding: '12px 12px', color: C.mut }}>{row.bestFor}</td>
                        <td style={{ padding: '12px 12px' }}>
                          {row.ourPick && (
                            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const }}>
                              Try free →
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Compare article deep-link (only for tools with a compare page) */}
              {tool.slug === 'ocoya' && (
                <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(13,148,136,.04)', borderRadius: 10, border: '1px solid rgba(13,148,136,.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: 13, color: C.mut }}>Want a deeper breakdown of Ocoya vs Buffer vs Hootsuite?</span>
                  <a
                    href="/compare/ocoya-vs-buffer-vs-hootsuite"
                    onClick={e => { e.preventDefault(); navigate('/compare/ocoya-vs-buffer-vs-hootsuite'); }}
                    style={{ fontSize: 13, fontWeight: 600, color: C.a1, textDecoration: 'none' }}
                  >
                    Read the full comparison →
                  </a>
                </div>
              )}
            </>
          )
        )}

        {/* ── FAQ accordion ── */}
        {faqs.length > 0 && (
          section(
            <>
              {sectionTitle(`Frequently asked questions about ${tool.name}`)}
              {faqs.map((faq, i) => (
                <FAQItem key={i} q={faq.q} a={faq.a} accent={accent} />
              ))}
            </>
          )
        )}

        {/* ── Target keywords (internal SEO note — hidden from display but helps author) ── */}
        {keywords.length > 0 && (
          <div style={{ display: 'none' }}>
            {keywords.map((k, i) => <span key={i}>{k}</span>)}
          </div>
        )}

        {/* ── W3-1: Free vs Paid upgrade guide ── */}
        {content?.upgradeGuide && (
          section(
            <>
              {sectionTitle(`Is ${tool.name} Worth It? — Free vs Paid 2026 Guide`)}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 14px', lineHeight: 1.65, fontWeight: 300 }}>
                Here's exactly when the free plan stops being enough and when the upgrade pays for itself.
              </p>
              {content.upgradeGuide.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 14, color: C.txt, lineHeight: 1.8, margin: '0 0 14px', fontWeight: 300 }}>{para}</p>
              ))}
              <div style={{ marginTop: 8 }}>
                <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Start free — no credit card required <ExternalLink size={13} />
                </a>
              </div>
            </>
          )
        )}

        {/* ── W3-1: Rytr vs nearest competitor quick verdict ── */}
        {content?.vsVerdict && (() => {
          const vs = content.vsVerdict!;
          const compareArticleExists = COMPARE_ARTICLES.some(a => a.slug === vs.compareSlug);
          return section(
            <>
              {sectionTitle(`Rytr vs ${vs.tool} — Quick Verdict`)}
              {vs.summary.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 14, color: C.txt, lineHeight: 1.8, margin: '0 0 14px', fontWeight: 300 }}>{para}</p>
              ))}
              {compareArticleExists && (
                <div style={{ marginTop: 8, padding: '14px 18px', background: cardBg, borderRadius: 12, border: `1px solid ${cardBrd}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
                  <span style={{ fontSize: 13, color: C.mut }}>Read the full Rytr vs {vs.tool} breakdown →</span>
                  <button
                    onClick={() => navigate(`/compare/${vs.compareSlug}`)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer', padding: '8px 18px', fontSize: 13, fontWeight: 600, fontFamily: "'Syne', sans-serif" }}>
                    Full comparison →
                  </button>
                </div>
              )}
            </>
          );
        })()}


        {/* ── G5 GEO: Pricing — semantic <section aria-label="Pricing"> so AI answers "[Tool] Pricing 2026" ── */}
        {tool.pricingBreakdown && tool.pricingBreakdown.length > 0 && (
          geoSection('Pricing',
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{tool.name} Pricing 2026</h2>
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 18px', lineHeight: 1.65, fontWeight: 300 }}>
                All plans include the core features — here's what changes at each tier.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {tool.pricingBreakdown.map((tier, i) => (
                  <div key={i} style={{
                    padding: '18px 20px',
                    background: i === 1 ? cardBg : C.bg,
                    borderRadius: 14,
                    border: i === 1 ? `2px solid ${accent}` : `1.5px solid ${C.barBrd}`,
                    position: 'relative' as const,
                  }}>
                    {i === 1 && (
                      <span style={{
                        position: 'absolute' as const, top: -10, left: 16,
                        background: accent, color: '#fff', fontSize: 10, fontWeight: 700,
                        padding: '2px 10px', borderRadius: 100, letterSpacing: '0.06em',
                      }}>POPULAR</span>
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.txt, marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>{tier.tier}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: accent, marginBottom: 10, fontFamily: "'Syne', sans-serif" }}>{tier.price}</div>
                    <div style={{ fontSize: 12, color: C.mut, lineHeight: 1.6 }}>{tier.highlight}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: accent, fontWeight: 600, textDecoration: 'none' }}>
                  Start free — no credit card required →
                </a>
              </div>
            </>
          )
        )}

        {/* ── Setup steps (Week 2 — Rytr only, renders if present) ── */}
        {tool.setupSteps && tool.setupSteps.length > 0 && (
          section(
            <>
              {sectionTitle(`How to get started with ${tool.name}`)}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 18px', lineHeight: 1.65, fontWeight: 300 }}>
                From signup to first output in under 5 minutes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                {tool.setupSteps.map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg,${C.a1},${C.a2})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.65, margin: 0, fontWeight: 300, paddingTop: 4 }}>{step}</p>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── Real output example (Week 2 — Rytr only) ── */}
        {tool.realOutputExample && (
          section(
            <>
              {sectionTitle('Real output sample')}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 14px', lineHeight: 1.65, fontWeight: 300 }}>
                Here's an unedited output I generated during testing, with my editorial note on quality.
              </p>
              <div style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: 12, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: accent, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 10 }}>
                  AI-generated output
                </div>
                <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0, fontStyle: 'italic', fontWeight: 300 }}>
                  "{tool.realOutputExample.output}"
                </p>
              </div>
              <div style={{ background: C.sukbg, border: `1px solid ${C.sukbrd}`, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 16, flexShrink: 0 }}>✍️</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 5 }}>My editorial note</div>
                  <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{tool.realOutputExample.editorialNote}</p>
                </div>
              </div>
            </>
          )
        )}

        {/* ── Daily use cases (Week 2 — all 5 affiliate tools) ── */}
        {tool.dailyUseCases && tool.dailyUseCases.length > 0 && (
          section(
            <>
              {sectionTitle(`5 things I actually use ${tool.name} for`)}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 16px', lineHeight: 1.65, fontWeight: 300 }}>
                Real workflows from personal daily use — not marketing copy from the vendor.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {tool.dailyUseCases.map((uc, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: cardBg, borderRadius: 10, border: `1px solid ${cardBrd}`, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 13, color: accent, flexShrink: 0, marginTop: 1 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, color: C.txt, lineHeight: 1.6 }}>{uc}</span>
                  </div>
                ))}
              </div>
            </>
          )
        )}

        {/* ── Not for you (Week 2) ── */}
        {tool.notForYou && (
          section(
            <>
              {sectionTitle('Who should NOT use this')}
              <div style={{ display: 'flex', gap: 14, padding: '16px 18px', background: C.errbg, borderRadius: 12, border: `1px solid ${C.errbrd}`, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(239,68,68,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <X size={14} color="#dc2626" />
                </div>
                <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{tool.notForYou}</p>
              </div>
            </>
          )
        )}

        {/* ── Related comparisons (Task 4 — internal linking) ── */}
        {(TOOL_COMPARE_MAP[tool.slug] ?? []).length > 0 && (() => {
          const relatedArticles = COMPARE_ARTICLES.filter(a =>
            (TOOL_COMPARE_MAP[tool.slug] ?? []).includes(a.slug)
          );
          if (relatedArticles.length === 0) return null;
          return section(
            <>
              {sectionTitle('Related comparisons')}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 14px', lineHeight: 1.65, fontWeight: 300 }}>
                See how {tool.name} stacks up in a full head-to-head breakdown.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {relatedArticles.map((art, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px', background: cardBg, borderRadius: 12,
                    border: `1px solid ${cardBrd}`, gap: 12, flexWrap: 'wrap' as const,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginBottom: 3 }}>{art.title}</div>
                      <div style={{ fontSize: 12, color: C.mut2 }}>{art.publishDate} · {art.comparisonTable.length} tools compared</div>
                    </div>
                    <button
                      onClick={() => navigate(`/compare/${art.slug}`)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: `linear-gradient(135deg,${C.a1},${C.a2})`,
                        color: '#fff', border: 'none', borderRadius: 100, cursor: 'pointer',
                        padding: '8px 18px', fontSize: 13, fontWeight: 600,
                        fontFamily: "'Syne', sans-serif", whiteSpace: 'nowrap' as const,
                      }}>
                      Read comparison →
                    </button>
                  </div>
                ))}
              </div>
            </>
          );
        })()}


        {/* ── Related tools in same category (H9 — internal linking) ── */}
        {(() => {
          const sameCat = TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
          if (sameCat.length === 0) return null;
          return section(
            <>
              {sectionTitle(`More ${tool.category} tools`)}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 14px', lineHeight: 1.65, fontWeight: 300 }}>
                Other {tool.category.toLowerCase()} tools I've personally tested — worth comparing before you decide.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {sameCat.map((t, i) => (
                  <div key={i}
                    onClick={() => navigate(`/tools/${t.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', background: cardBg, borderRadius: 12,
                      border: `1px solid ${cardBrd}`, gap: 12, cursor: 'pointer',
                      flexWrap: 'wrap' as const,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff',
                        border: `1.5px solid ${accent}28`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                        <img src={`/logos/${t.slug}.png`} alt={t.name}
                          width={26} height={26}
                          style={{ objectFit: 'contain', borderRadius: 6 }}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.txt }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: C.mut2, marginTop: 2 }}>{t.pricing}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={13} /> Read review →
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}

        {/* ── Related blog posts (H9 — internal linking) ── */}
        {(() => {
          const relatedPosts = BLOG_POSTS
            .filter(p => p.category === tool.category || p.category === 'General')
            .slice(0, 2);
          if (relatedPosts.length === 0) return null;
          return section(
            <>
              {sectionTitle('From the blog')}
              <p style={{ fontSize: 13, color: C.mut, margin: '0 0 14px', lineHeight: 1.65, fontWeight: 300 }}>
                In-depth guides covering {tool.category.toLowerCase()} tools — tested and written by Navneet Arya.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                {relatedPosts.map((p, i) => (
                  <div key={i}
                    onClick={() => navigate(`/blog/${p.slug}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px', background: cardBg, borderRadius: 12,
                      border: `1px solid ${cardBrd}`, gap: 12, cursor: 'pointer',
                      flexWrap: 'wrap' as const,
                    }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.txt, marginBottom: 3 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: C.mut2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BookOpen size={11} /> {p.readTime} · {p.datePublished}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: accent, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, whiteSpace: 'nowrap' as const }}>
                      Read post →
                    </span>
                  </div>
                ))}
              </div>
            </>
          );
        })()}


        <div style={{ background: C.surf, borderRadius: 20, border: `2px solid ${cardBrd}`, padding: '36px', textAlign: 'center' as const }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 22, color: C.txt, marginBottom: 10 }}>
              Ready to try {tool.name}?
            </div>
            <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.7, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
              Start with the free plan — no credit card required. Upgrade only if it delivers value.
            </p>
            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: "'Syne', sans-serif", textDecoration: 'none' }}>
              Start free with {tool.name} <ExternalLink size={15} />
            </a>
            <p style={{ fontSize: 11, color: C.mut2, marginTop: 12 }}>
              Affiliate link · {tool.pricing}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
