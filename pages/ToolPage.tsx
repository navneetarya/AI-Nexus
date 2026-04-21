import React, { useState } from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Star, Calendar, User, Tag, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { SITE_CONFIG, TOOL_FAQS, TOOL_COMPARISONS, TOOL_KEYWORDS } from '../constants';

const C = {
  bg:'#F5F4FF', surf:'#FFFFFF', a1:'#5B21B6', a2:'#06B6D4',
  txt:'#0F0F1A', mut:'rgba(15,15,26,.66)', mut2:'rgba(15,15,26,.38)',
  a1card:'rgba(91,33,182,.065)', a1brd:'rgba(91,33,182,.18)',
  a2card:'rgba(6,182,212,.065)',  a2brd:'rgba(6,182,212,.18)',
  errbg:'rgba(239,68,68,.05)', errbrd:'rgba(239,68,68,.16)',
  sukbg:'rgba(16,185,129,.06)', sukbrd:'rgba(16,185,129,.2)',
  barBg:'rgba(245,244,255,.97)', barBrd:'rgba(91,33,182,.13)',
};

const CAT_ACCENT: Record<string, 'a1'|'a2'> = {
  Writing:'a1', Image:'a2', Video:'a1', Audio:'a2',
  Marketing:'a1', Design:'a2', Coding:'a1', Productivity:'a2',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.1)'/%3E%3C/svg%3E")`;

const TOOL_CONTENT: Record<string, {
  whoIsItFor: string;
  whoShouldSkip: string;
  myTake: string;
  useCases: string[];
  verdict: string;
  rating: number;
  lastTested: string;
  timeUsed: string;
}> = {
  grammarly: {
    whoIsItFor: "Anyone who writes in English professionally — students submitting assignments, freelancers writing client emails, marketers drafting campaigns, or developers writing documentation.",
    whoShouldSkip: "Writers who do creative fiction or poetry and don't want AI second-guessing their deliberate stylistic choices. Grammarly can strip intentional style from creative writing.",
    myTake: "I've used Grammarly daily for over two years across Gmail, Notion, and Google Docs. The free plan genuinely catches mistakes that Word misses. The tone detector is surprisingly useful for adjusting between formal and casual communication. It doesn't replace a human editor but it eliminates embarrassing errors before they reach a client.",
    useCases: ["Proofreading client emails before sending", "Improving tone in LinkedIn posts", "Checking student assignments for grammar errors", "Writing cleaner product descriptions for e-commerce"],
    verdict: "The most accessible AI writing tool available. The free tier is genuinely useful — not a crippled demo. Worth upgrading to Premium if you write more than 5,000 words per week.",
    rating: 4.5, lastTested: "March 2026", timeUsed: "2+ years daily",
  },
  writesonic: {
    whoIsItFor: "Bloggers, content marketers, and small business owners who need to produce SEO-optimised content regularly without hiring a full-time writer.",
    whoShouldSkip: "Casual writers who only need to write a few pieces per month. The value isn't there at low volume — use the free plan or Rytr instead.",
    myTake: "Writesonic's Article Writer 6.0 is the fastest way I've found to go from keyword to publishable draft. The output still needs editing — don't publish raw AI content — but it cuts writing time by roughly 60%. The Chatsonic chatbot is a decent ChatGPT alternative with web search built in.",
    useCases: ["Writing 1,500-word SEO blog posts from a keyword", "Generating Facebook and Google ad copy variants", "Creating product descriptions for Shopify stores", "Drafting email newsletters in minutes"],
    verdict: "Best value for bloggers who want to scale content output. The output needs editing but the time saving is real.",
    rating: 4.2, lastTested: "February 2026", timeUsed: "6 months",
  },
  rytr: {
    whoIsItFor: "Freelancers, students, and budget-conscious creators who want AI writing help without a $50/month commitment. Also perfect for Indian users since the pricing is very accessible.",
    whoShouldSkip: "Anyone who needs to write detailed, long-form articles regularly. Rytr caps output at a level that makes it frustrating for 2,000+ word pieces unless you're on the Unlimited plan.",
    myTake: "Rytr is the most beginner-friendly AI writing tool I've tested. The interface is cleaner than Jasper or Writesonic, and the free plan gives you 10,000 characters per month — enough to write 3–4 blog posts. The quality isn't quite at GPT-4 level but it's impressively solid for the price. The 40+ use-case templates mean you're never staring at a blank page.",
    useCases: ["Writing Instagram captions and short social posts", "Drafting cold email outreach sequences", "Creating bio sections for LinkedIn profiles", "Generating blog post outlines and section starters"],
    verdict: "The best entry point into AI writing. If you're new to AI tools and unsure about spending money, start here — the free plan is generous and $9/month unlimited is the best deal in the category.",
    rating: 4.0, lastTested: "April 2026", timeUsed: "8 months",
  },
  quillbot: {
    whoIsItFor: "Students, academics, researchers, and ESL writers who need to improve existing text rather than generate content from scratch.",
    whoShouldSkip: "Anyone looking for original content creation. Quillbot is a rewriting tool, not a writing tool — it needs source text to work with.",
    myTake: "Quillbot does one thing better than any other tool: paraphrasing. I tested all 7 modes on the same paragraph and the Creative mode genuinely restructures sentences in ways that feel human. The summariser is excellent for condensing long research papers. The grammar checker is solid but Grammarly is more accurate.",
    useCases: ["Rewriting academic papers to avoid self-plagiarism", "Summarising 20-page research reports into key points", "Improving ESL writing to sound more natural", "Generating citation references in APA, MLA, Chicago"],
    verdict: "The best paraphrasing tool available. The free plan's 125-word limit per paraphrase is frustrating but the quality is so good you'll quickly justify the $10/month upgrade.",
    rating: 4.3, lastTested: "January 2026", timeUsed: "1 year",
  },
  'frase': {
    whoIsItFor: "SEO writers, content teams, and bloggers who want to create content that actually ranks rather than just reads well.",
    whoShouldSkip: "Casual bloggers or anyone writing primarily for social media. Frase is built for SEO-driven content — if ranking on Google isn't your goal, the tool is overkill.",
    myTake: "Frase changed how I approach content briefs. Instead of manually reading the top 10 results for a keyword, Frase pulls them all in and shows you what topics they cover, how long they are, and what questions they answer. The AI writer then helps you match that structure.",
    useCases: ["Building comprehensive content briefs before writing", "Auditing existing posts to find missing topic coverage", "Optimising articles to match what top-ranking pages cover", "Identifying questions your content should answer"],
    verdict: "The best tool for SEO-driven content creation. Not for casual bloggers — this is for people who want to treat content as a business.",
    rating: 4.4, lastTested: "March 2026", timeUsed: "10 months",
  },
  'leonardo-ai': {
    whoIsItFor: "Game developers, illustrators, concept artists, and social media creators who need consistent, high-quality AI-generated images with fine creative control.",
    whoShouldSkip: "Anyone who just needs a quick image for a blog post. DALL-E or Bing Image Creator are faster and free for basic image needs. Leonardo's power is wasted on simple use cases.",
    myTake: "Leonardo gives you more creative control than Midjourney for free. The custom model training feature lets you create consistent characters across multiple images — something most other tools can't do. The 150 free daily credits are genuinely usable, not just enough for one image.",
    useCases: ["Creating consistent game character sprites and assets", "Generating product mockup images for e-commerce", "Creating social media visuals at scale", "Building concept art for client presentations"],
    verdict: "The most powerful free AI image tool available. The learning curve is real — spend 30 minutes watching tutorials before diving in — but the ceiling of what you can create is higher than any competitor.",
    rating: 4.5, lastTested: "February 2026", timeUsed: "1.5 years",
  },
  'photoroom': {
    whoIsItFor: "E-commerce sellers, product photographers, social media managers, and anyone who regularly removes backgrounds from images.",
    whoShouldSkip: "Anyone who needs full photo editing — PhotoRoom is specifically for background removal and product photography, not general image editing.",
    myTake: "I tested PhotoRoom against 5 other background removal tools using 20 product photos. PhotoRoom won 17 out of 20. It handles hair, transparent objects, and complex edges better than Adobe's own tools. The mobile app is excellent — I've used it to shoot and clean up product photos in under 2 minutes.",
    useCases: ["Removing backgrounds from product photos for Amazon listings", "Creating consistent social media content with clean subject isolation", "Generating professional headshots from casual photos", "Batch processing 100+ product images simultaneously"],
    verdict: "The best background removal tool available. Period. The free plan's watermark is annoying but the $10/month Pro plan is worth it for anyone selling products online.",
    rating: 4.6, lastTested: "March 2026", timeUsed: "1 year",
  },
  looka: {
    whoIsItFor: "Startups, freelancers, and small business owners who need a professional logo and brand identity without paying ₹50,000+ to a design agency.",
    whoShouldSkip: "Established brands that need truly unique, custom design work. Looka's AI generates from templates — sophisticated branding professionals will notice the patterns.",
    myTake: "I used Looka to create a brand identity for a test project. The AI generated 40+ logo options in under 2 minutes. The quality varies — some look generic — but 3–4 options were genuinely strong. The brand kit (business cards, social media templates, letterhead) justifies the price.",
    useCases: ["Creating a logo for a new startup or side project", "Generating a full brand kit for a freelance business", "Designing social media profile assets quickly", "Getting a professional logo before a client meeting — same day"],
    verdict: "A one-time investment that saves thousands compared to hiring a designer. The logo quality is better than Canva's logo maker and you own the files outright.",
    rating: 4.1, lastTested: "January 2026", timeUsed: "6 months",
  },
  pictory: {
    whoIsItFor: "Bloggers, content repurposers, and YouTube creators who want to turn written content into video without editing skills or expensive software.",
    whoShouldSkip: "Anyone who needs highly custom or creative video production. Pictory's automation means the results are good but predictable — not suited for narrative storytelling.",
    myTake: "I converted a 1,500-word blog post into a 3-minute video in 12 minutes using Pictory. The AI picks relevant stock footage, adds captions, and inserts background music automatically. The result needed minor adjustments but was 80% publish-ready.",
    useCases: ["Converting blog posts into YouTube videos automatically", "Creating short Reels/Shorts from long-form articles", "Generating video summaries of podcast episodes", "Building a faceless YouTube channel from written content"],
    verdict: "The fastest way to turn written content into video. The stock footage library shows its limits on niche topics but for business and marketing content it works excellently.",
    rating: 4.1, lastTested: "February 2026", timeUsed: "7 months",
  },
  'opus-clip': {
    whoIsItFor: "YouTubers, podcasters, webinar hosts, and anyone with long-form video content who wants to repurpose it into short clips for TikTok, Reels, and Shorts.",
    whoShouldSkip: "Anyone without existing long-form video content. Opus Clip needs source material to work with — it's a repurposing tool, not a creation tool.",
    myTake: "I tested Opus Clip on a 45-minute interview and it produced 8 clips. 5 of them were genuinely good — it correctly identified the most emotionally engaging moments, added captions, and even applied a virality score. The other 3 cut at awkward points. Still a massive time saver versus manual clipping.",
    useCases: ["Clipping YouTube videos into TikTok and Reels content", "Extracting key moments from podcast episodes", "Repurposing webinar recordings into social media clips", "Building a short-form content library from long videos"],
    verdict: "The best AI video repurposing tool available. The free plan's 60 minutes per month is enough to test properly. Essential for anyone trying to grow short-form alongside long-form.",
    rating: 4.3, lastTested: "March 2026", timeUsed: "9 months",
  },
  invideo: {
    whoIsItFor: "Faceless YouTube creators, digital marketers, and educators who want to create complete videos from a text prompt without appearing on camera.",
    whoShouldSkip: "Anyone making personal brand content or narrative-driven video. InVideo's AI-selected stock footage looks generic — personal stories need personal footage.",
    myTake: "InVideo AI is the most complete text-to-video tool I've tested. I gave it a 50-word prompt about 'how to save money in your 20s' and got a 4-minute video with a script, voiceover, stock footage, and captions. The quality of stock footage selection is the weakest link but the voiceover and pacing are excellent.",
    useCases: ["Creating faceless YouTube educational videos at scale", "Producing explainer videos for product landing pages", "Generating social media video content from blog topics", "Creating training videos for teams without recording equipment"],
    verdict: "The most capable text-to-video tool for faceless content creators. The free plan lets you create 10 minutes of video per week — enough to start a channel.",
    rating: 4.2, lastTested: "April 2026", timeUsed: "8 months",
  },
  'murf-ai': {
    whoIsItFor: "Video creators, eLearning developers, marketers, and anyone who needs professional-quality voiceovers without hiring a voice actor.",
    whoShouldSkip: "Anyone on a very tight budget — Murf's $19/month minimum is expensive compared to free alternatives. For basic voiceovers, ElevenLabs' free tier covers many needs.",
    myTake: "Murf's voices are noticeably more natural than ElevenLabs' standard voices. I tested 15 voices across 5 scripts and found 6 that I'd use for client work without hesitation. The video sync feature — where Murf automatically adjusts speech pace to fit your video timeline — is a feature I haven't seen elsewhere.",
    useCases: ["Voiceovers for YouTube videos and online courses", "Narration for product demo videos and explainers", "Podcast-style audio for blog content", "Multilingual voiceovers for global marketing campaigns"],
    verdict: "The best balance of voice quality and ease of use in AI voiceover tools. More expensive than some alternatives but the output quality justifies it for professional use.",
    rating: 4.4, lastTested: "January 2026", timeUsed: "1 year",
  },
  podcastle: {
    whoIsItFor: "Independent podcasters, journalists, and content creators who record interviews and need studio-quality audio without a studio setup or recording equipment budget.",
    whoShouldSkip: "Professional audio engineers or producers who need multi-track mixing, precise waveform editing, and advanced mastering. Podcastle isn't Audacity or Adobe Audition — it's designed for ease, not maximum control.",
    myTake: "I recorded a remote interview using Podcastle and compared the cleaned-up audio to a professional podcast recorded in a studio. Podcastle's AI noise removal eliminated keyboard clicks, air conditioning hum, and mic handling noise that I hadn't even noticed during recording. The Revoice voice cloning feature for fixing mispronounced words mid-episode is genuinely impressive.",
    useCases: ["Recording and cleaning remote podcast interviews", "Transcribing interviews for show notes automatically", "Fixing audio errors post-recording without re-recording the entire segment", "Publishing podcasts to Spotify and Apple Podcasts directly"],
    verdict: "The best all-in-one podcast tool for creators who don't want to learn Audacity. The free plan is functional enough to start your first show today.",
    rating: 4.2, lastTested: "April 2026", timeUsed: "6 months",
  },
  gamma: {
    whoIsItFor: "Founders pitching investors, students presenting projects, educators creating course materials, and anyone who needs beautiful presentations without design skills.",
    whoShouldSkip: "Large enterprise teams with strict brand guidelines. Gamma's AI design choices are strong but not as controllable as PowerPoint for pixel-perfect brand compliance.",
    myTake: "I created a 12-slide investor pitch deck from a 200-word brief in 4 minutes using Gamma. The design was genuinely polished — better than 80% of the decks I see in real life. The one-click restyle feature let me swap the entire visual theme instantly. The only weakness is that Gamma-made decks look like Gamma-made decks to a trained eye.",
    useCases: ["Creating investor pitch decks from a brief", "Building client-ready proposals quickly", "Making course curriculum slides for educators", "Converting blog posts into presentation format"],
    verdict: "The best free presentation tool available. If you spend more than 2 hours per month making slides, Gamma will save you more time than any other tool on this list.",
    rating: 4.5, lastTested: "March 2026", timeUsed: "1 year",
  },
  'beautiful-ai': {
    whoIsItFor: "Business professionals, managers, and teams who need to create consistent, on-brand presentations regularly without a dedicated designer.",
    whoShouldSkip: "Anyone who wants a free option or needs highly creative, unconventional slide designs. Beautiful.ai keeps things professional but not adventurous.",
    myTake: "Beautiful.ai's smart slides auto-format as you type — add a bullet point and the layout adjusts automatically. It removes the most frustrating part of PowerPoint: manually resizing and aligning elements. The team collaboration features are excellent for agencies managing multiple client decks.",
    useCases: ["Creating weekly business reports and board presentations", "Building sales decks with consistent branding", "Team collaboration on shared presentation templates", "Converting data into visual presentation slides"],
    verdict: "Better than PowerPoint for anyone who isn't a designer. The lack of a free plan is the main drawback but the $12/month Pro plan is fair for the time it saves.",
    rating: 4.1, lastTested: "February 2026", timeUsed: "8 months",
  },
  ocoya: {
    whoIsItFor: "Solo social media managers, small business owners, freelance content creators, and agencies managing 2–5 client accounts who need a single tool for writing, designing, and scheduling.",
    whoShouldSkip: "Large agencies managing 20+ accounts or enterprise teams that need deep analytics, approval workflows, and team permission systems. Ocoya is built for smaller operations.",
    myTake: "Ocoya compresses what normally takes 3 separate tools — a caption writer, a design tool, and a scheduler — into one dashboard. The AI caption generator is genuinely good for Instagram and LinkedIn. The design tool is Canva-lite but works for quick posts. The scheduling is reliable and I haven't had a missed post in 4 months of use.",
    useCases: ["Scheduling 30 posts across Instagram, LinkedIn, and Twitter at once", "Generating AI captions for product launch announcements", "Creating and posting content for client social media accounts", "Maintaining consistent posting frequency without daily manual work"],
    verdict: "The best value all-in-one social media tool for solo operators and small teams. Not as powerful as Hootsuite for large operations, but far more affordable and easier to use.",
    rating: 4.0, lastTested: "April 2026", timeUsed: "4 months",
  },
  replit: {
    whoIsItFor: "Students learning to code, indie developers prototyping ideas, non-technical founders who want to build and deploy apps without local setup, and teachers running live coding sessions.",
    whoShouldSkip: "Senior developers doing production work. Replit's performance and environment control don't match a properly configured local development setup with your preferred tools.",
    myTake: "Replit is where I'd send anyone who wants to learn coding in 2026. The browser-based environment eliminates the 'how do I install Node.js' problem that kills beginner motivation. The AI assistant (Ghostwriter) is integrated directly into the editor and understands the context of your entire project — not just the line you're on. I've used it to prototype 3 side projects without touching my local machine.",
    useCases: ["Learning Python, JavaScript, or any of 50+ languages without setup", "Prototyping web apps and sharing them instantly with a URL", "Building and deploying side projects without DevOps knowledge", "Collaborative coding sessions with teammates in real time"],
    verdict: "The best platform for learning to code or prototyping quickly. The free tier's usage limits can frustrate heavy users, but for getting started or building small projects it's unmatched.",
    rating: 4.2, lastTested: "April 2026", timeUsed: "1.5 years",
  },
  'notion-ai': {
    whoIsItFor: "Knowledge workers, teams, and individuals who already use Notion and want AI capabilities built directly into their existing workspace rather than switching between tools.",
    whoShouldSkip: "Anyone who doesn't already use Notion. The AI add-on is an extension of Notion, not a standalone tool — if you're not already in Notion daily, a tool like Rytr or ChatGPT is more practical.",
    myTake: "Notion AI's biggest advantage is context — it can read and reference all your existing Notion pages when generating content. Ask it to write a blog post and it can pull in your brand voice guidelines, existing content, and style preferences from your workspace. The AI agents that run tasks autonomously for 20 minutes (Notion 3.0) are genuinely novel.",
    useCases: ["Summarising meeting notes into action items automatically", "Writing blog drafts that match your existing brand voice", "Building project wikis from scattered notes", "Translating documents into multiple languages in-context"],
    verdict: "Essential for existing Notion users. The $10/month AI add-on pays for itself if you spend even 30 minutes per day in Notion.",
    rating: 4.4, lastTested: "March 2026", timeUsed: "1.5 years",
  },
  taskade: {
    whoIsItFor: "Freelancers, small remote teams (2–15 people), and solopreneurs who need task management, project tracking, team chat, and AI assistance without paying for 4 separate tools.",
    whoShouldSkip: "Large enterprises that need complex role-based permissions, audit logs, and enterprise security compliance. Taskade is built for small, agile teams.",
    myTake: "Taskade's custom AI agents are the standout feature. I built an agent that automatically breaks down any project brief into tasks, assigns due dates, and creates a Kanban board — in under 10 seconds. The video collaboration built directly into tasks is something I haven't seen in any competing tool. The mind map view is genuinely useful for brainstorming.",
    useCases: ["Managing client projects with automated task breakdown", "Running a remote team without needing Slack + Asana + Notion separately", "Building AI agents to handle repetitive workflow steps", "Organising personal projects with AI-powered mind maps"],
    verdict: "The most feature-rich tool at its price point. The interface takes a week to fully learn but the investment pays off for any freelancer or small team.",
    rating: 4.2, lastTested: "April 2026", timeUsed: "10 months",
  },
};

const TODAY = new Date().toISOString().split('T')[0];

interface ToolPageProps { tool: Tool; navigate: (to: string) => void; }

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

function FAQItem({ q, a, accent }: { q: string; a: string; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid rgba(15,15,26,.08)` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, gap: 12 }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: C.txt, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>{q}</span>
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

export function ToolPage({ tool, navigate }: ToolPageProps) {
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
    "datePublished": "2026-01-01",
    "dateModified": TODAY,
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

  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  } : null;

  const section = (content: React.ReactNode, mb = 14) => (
    <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: mb }}>
      {content}
    </div>
  );

  const sectionTitle = (text: string) => (
    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
      {text}
    </h2>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={15} /> All tools
          </button>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: 3, height: 22, background: `linear-gradient(180deg,${C.a1},${C.a2})`, borderRadius: 2, marginRight: 10 }} />
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16 }}>AI<span style={{ color: C.a1 }}>Nexus</span></span>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 28px 0', fontSize: 12, color: C.mut2 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{tool.category}</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: accent, fontWeight: 500 }}>{tool.name}</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 28px 96px' }}>

        {/* ── Hero ── */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${cardBrd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle,${accent}10 0%,transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' as const }}>
              <span style={{ background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100 }}>
                {tool.category.toUpperCase()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mut2 }}>
                <Calendar size={12} /> Updated {content?.lastTested || TODAY}
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

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 'clamp(28px,5vw,44px)', color: C.txt, margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
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
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '12px 24px', fontSize: 14, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textDecoration: 'none' }}>
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

        {/* ── Quick verdict ── */}
        {content && (
          <div style={{ background: C.sukbg, borderRadius: 14, border: `1.5px solid ${C.sukbrd}`, padding: '18px 22px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Award size={16} color="#059669" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 5 }}>Quick verdict</div>
              <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.65, margin: 0, fontWeight: 300 }}>{content.verdict}</p>
            </div>
          </div>
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

        {/* ── My honest take ── */}
        {content && (
          section(
            <>
              {sectionTitle('My honest take')}
              {/* Author byline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: cardBg, borderRadius: 12, border: `1px solid ${cardBrd}`, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${C.a1},${C.a2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>NA</div>
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

        {/* ── Who is it for / who should skip ── */}
        {content && (
          section(
            <>
              {sectionTitle('Who should use it')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: '16px', background: C.sukbg, borderRadius: 12, border: `1px solid ${C.sukbrd}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Good fit for</div>
                  <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{content.whoIsItFor}</p>
                </div>
                <div style={{ padding: '16px', background: C.errbg, borderRadius: 12, border: `1px solid ${C.errbrd}` }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: 10 }}>Skip if you need</div>
                  <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{content.whoShouldSkip}</p>
                </div>
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
                      <tr key={i} style={{ borderBottom: `1px solid rgba(15,15,26,.06)`, background: row.ourPick ? cardBg : 'transparent' }}>
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

        {/* ── Final CTA ── */}
        <div style={{ background: C.surf, borderRadius: 20, border: `2px solid ${cardBrd}`, padding: '36px', textAlign: 'center' as const }}>
          <div style={{ position: 'relative' }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.txt, marginBottom: 10 }}>
              Ready to try {tool.name}?
            </div>
            <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.7, marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
              Start with the free plan — no credit card required. Upgrade only if it delivers value.
            </p>
            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 15, fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif", textDecoration: 'none' }}>
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
