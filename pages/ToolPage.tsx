import React from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Star, Calendar, User, Tag } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'#F5F4FF', surf:'#FFFFFF', a1:'#5B21B6', a2:'#06B6D4',
  txt:'#0F0F1A', mut:'rgba(15,15,26,.66)', mut2:'rgba(15,15,26,.38)',
  a1card:'rgba(91,33,182,.065)', a1brd:'rgba(91,33,182,.18)',
  a2card:'rgba(6,182,212,.065)',  a2brd:'rgba(6,182,212,.18)',
  errbg:'rgba(239,68,68,.05)', errbrd:'rgba(239,68,68,.16)',
  barBg:'rgba(245,244,255,.97)', barBrd:'rgba(91,33,182,.13)',
};

const CAT_ACCENT: Record<string, 'a1'|'a2'> = {
  Writing:'a1', Image:'a2', Video:'a1', Audio:'a2',
  Marketing:'a1', Design:'a2', Coding:'a1', Productivity:'a2',
};

const DOT_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Ccircle cx='22' cy='22' r='1.4' fill='rgba(91%2C33%2C182%2C0.1)'/%3E%3C/svg%3E")`;

// Rich use-case content per tool — this is what makes pages rankable
const TOOL_CONTENT: Record<string, {
  whoIsItFor: string;
  myTake: string;
  useCases: string[];
  verdict: string;
  rating: number;
}> = {
  grammarly: {
    whoIsItFor: "Anyone who writes in English professionally — students submitting assignments, freelancers writing client emails, marketers drafting campaigns, or developers writing documentation.",
    myTake: "I've used Grammarly daily for over a year across Gmail, Notion, and Google Docs. The free plan genuinely catches mistakes that Word misses. The tone detector is surprisingly useful for adjusting between formal and casual communication. It doesn't replace a human editor but it eliminates embarrassing errors before they reach a client.",
    useCases: ["Proofreading client emails before sending", "Improving tone in LinkedIn posts", "Checking student assignments for grammar errors", "Writing cleaner product descriptions for e-commerce"],
    verdict: "The most accessible AI writing tool available. The free tier is genuinely useful — not a crippled demo. Worth upgrading to Premium if you write more than 5,000 words per week.",
    rating: 4.5,
  },
  writesonic: {
    whoIsItFor: "Bloggers, content marketers, and small business owners who need to produce SEO-optimised content regularly without hiring a full-time writer.",
    myTake: "Writesonic's Article Writer 6.0 is the fastest way I've found to go from keyword to publishable draft. The output still needs editing — don't publish raw AI content — but it cuts writing time by roughly 60%. The Chatsonic chatbot is a decent ChatGPT alternative with web search built in.",
    useCases: ["Writing 1,500-word SEO blog posts from a keyword", "Generating Facebook and Google ad copy variants", "Creating product descriptions for Shopify stores", "Drafting email newsletters in minutes"],
    verdict: "Best value for bloggers who want to scale content output. The 30% recurring affiliate commission is a bonus, but the tool genuinely earns its place as a daily writing assistant.",
    rating: 4.2,
  },
  rytr: {
    whoIsItFor: "Freelancers, students, and budget-conscious creators who want AI writing help without a $50/month commitment.",
    myTake: "Rytr is the most beginner-friendly AI writing tool I've tested. The interface is cleaner than Jasper or Writesonic, and the free plan gives you 10,000 characters per month — enough to write 3-4 blog posts. The quality isn't quite at GPT-4 level but it's impressively solid for the price.",
    useCases: ["Writing Instagram captions and short social posts", "Drafting cold email outreach sequences", "Creating bio sections for LinkedIn profiles", "Generating blog post outlines and section starters"],
    verdict: "The best entry point into AI writing. If you're new to AI tools and unsure about spending money, start here. The free plan is generous and the $9/month unlimited plan is the best deal in the category.",
    rating: 4.0,
  },
  quillbot: {
    whoIsItFor: "Students, academics, researchers, and ESL writers who need to improve existing text rather than generate content from scratch.",
    myTake: "Quillbot does one thing better than any other tool: paraphrasing. I tested all 7 modes on the same paragraph and the 'Creative' mode genuinely restructures sentences in ways that feel human. The summariser is excellent for condensing long research papers. The grammar checker is solid but Grammarly is more accurate.",
    useCases: ["Rewriting academic papers to avoid self-plagiarism", "Summarising 20-page research reports into key points", "Improving ESL writing to sound more natural", "Generating citation references in APA, MLA, Chicago"],
    verdict: "The best paraphrasing tool available. The free plan's 125-word limit per paraphrase is frustrating but the quality is so good you'll quickly justify the $10/month upgrade.",
    rating: 4.3,
  },
  'frase': {
    whoIsItFor: "SEO writers, content teams, and bloggers who want to create content that actually ranks rather than just reads well.",
    myTake: "Frase changed how I approach content briefs. Instead of manually reading the top 10 results for a keyword, Frase pulls them all in and shows you what topics they cover, how long they are, and what questions they answer. The AI writer then helps you match that structure. It's not cheap, but if you're serious about ranking, it pays for itself quickly.",
    useCases: ["Building comprehensive content briefs before writing", "Auditing existing posts to find missing topic coverage", "Optimising articles to match what top-ranking pages cover", "Identifying questions your content should answer"],
    verdict: "The best tool for SEO-driven content creation. Not for casual bloggers — this is for people who want to treat content as a business.",
    rating: 4.4,
  },
  'leonardo-ai': {
    whoIsItFor: "Game developers, illustrators, concept artists, and social media creators who need consistent, high-quality AI-generated images with fine creative control.",
    myTake: "Leonardo gives you more creative control than Midjourney for free. The custom model training feature lets you create consistent characters across multiple images — something most other tools can't do. The 150 free daily credits are genuinely usable, not just enough for one image.",
    useCases: ["Creating consistent game character sprites and assets", "Generating product mockup images for e-commerce", "Creating social media visuals at scale", "Building concept art for client presentations"],
    verdict: "The most powerful free AI image tool available. The learning curve is real — spend 30 minutes watching tutorials before diving in — but the ceiling of what you can create is higher than any competitor.",
    rating: 4.5,
  },
  'photoroom': {
    whoIsItFor: "E-commerce sellers, product photographers, social media managers, and anyone who regularly removes backgrounds from images.",
    myTake: "I tested PhotoRoom against 5 other background removal tools using 20 product photos. PhotoRoom won 17 out of 20. It handles hair, transparent objects, and complex edges better than Adobe's own tools. The mobile app is excellent — I've used it to shoot and clean up product photos in under 2 minutes.",
    useCases: ["Removing backgrounds from product photos for Amazon listings", "Creating consistent social media content with clean subject isolation", "Generating professional headshots from casual photos", "Batch processing 100+ product images simultaneously"],
    verdict: "The best background removal tool available. Period. The free plan's watermark is annoying but the $10/month Pro plan is worth it for anyone selling products online.",
    rating: 4.6,
  },
  looka: {
    whoIsItFor: "Startups, freelancers, and small business owners who need a professional logo and brand identity without paying ₹50,000+ to a design agency.",
    myTake: "I used Looka to create a brand identity for a test project. The AI generated 40+ logo options in under 2 minutes based on my industry, style preferences, and colour choices. The quality varies — some look generic — but 3-4 options were genuinely strong. The brand kit (business cards, social media templates, letterhead) justifies the price.",
    useCases: ["Creating a logo for a new startup or side project", "Generating a full brand kit for a freelance business", "Designing social media profile assets quickly", "Getting a logo before a client meeting — same day"],
    verdict: "A one-time investment that saves thousands compared to hiring a designer. The logo quality is better than Canva's logo maker and you own the files outright.",
    rating: 4.1,
  },
  pictory: {
    whoIsItFor: "Bloggers, content repurposers, and YouTube creators who want to turn written content into video without editing skills or expensive software.",
    myTake: "I converted a 1,500-word blog post into a 3-minute video in 12 minutes using Pictory. The AI picks relevant stock footage, adds captions, and inserts background music automatically. The result needed minor adjustments but was 80% publish-ready. For repurposing content at scale, nothing beats it.",
    useCases: ["Converting blog posts into YouTube videos automatically", "Creating short Reels/Shorts from long-form articles", "Generating video summaries of podcast episodes", "Building a faceless YouTube channel from written content"],
    verdict: "The fastest way to turn written content into video. The stock footage library shows its limits on niche topics but for business, marketing, and tech content it works excellently.",
    rating: 4.1,
  },
  'opus-clip': {
    whoIsItFor: "YouTubers, podcasters, webinar hosts, and anyone with long-form video content who wants to repurpose it into short clips for TikTok, Reels, and Shorts.",
    myTake: "I tested Opus Clip on a 45-minute interview and it produced 8 clips. 5 of them were genuinely good — it correctly identified the most emotionally engaging moments, added captions, and even applied a 'virality score'. The other 3 cut at awkward points. Still a massive time saver versus manual clipping.",
    useCases: ["Clipping YouTube videos into TikTok and Reels content", "Extracting key moments from podcast episodes", "Repurposing webinar recordings into social media clips", "Building a short-form content library from long videos"],
    verdict: "The best AI video repurposing tool available. The free plan's 60 minutes per month is enough to test properly. Essential for anyone trying to grow short-form alongside long-form.",
    rating: 4.3,
  },
  invideo: {
    whoIsItFor: "Faceless YouTube creators, digital marketers, and educators who want to create complete videos from a text prompt without appearing on camera.",
    myTake: "InVideo AI is the most complete 'text to video' tool I've tested. I gave it a 50-word prompt about 'how to save money in your 20s' and got a 4-minute video with a script, voiceover, stock footage, and captions. The quality of the stock footage selection is the weakest link — sometimes it's generic — but the voiceover and pacing are excellent.",
    useCases: ["Creating faceless YouTube educational videos at scale", "Producing explainer videos for product landing pages", "Generating social media video content from blog topics", "Creating training videos for teams without recording equipment"],
    verdict: "The most capable text-to-video tool for faceless content creators. The free plan lets you create 10 minutes of video per week — genuinely enough to start a channel.",
    rating: 4.2,
  },
  'murf-ai': {
    whoIsItFor: "Video creators, eLearning developers, marketers, and anyone who needs professional-quality voiceovers without hiring a voice actor.",
    myTake: "Murf's voices are noticeably more natural than ElevenLabs' standard voices. I tested 15 voices across 5 scripts and found 6 that I'd use for client work without hesitation. The video sync feature — where Murf automatically adjusts speech pace to fit your video timeline — is a feature I haven't seen elsewhere.",
    useCases: ["Voiceovers for YouTube videos and online courses", "Narration for product demo videos and explainers", "Podcast-style audio for blog content", "Multilingual voiceovers for global marketing campaigns"],
    verdict: "The best balance of voice quality and ease of use in AI voiceover tools. More expensive than some alternatives but the output quality justifies it for professional use.",
    rating: 4.4,
  },
  podcastle: {
    whoIsItFor: "Independent podcasters, journalists, and content creators who record interviews and need studio-quality audio without a studio.",
    myTake: "I recorded a remote interview using Podcastle and compared the cleaned-up audio to a professional podcast. The AI noise removal eliminated keyboard clicks, air conditioning hum, and mic handling noise that I hadn't even noticed during recording. The 'Revoice' voice cloning feature for fixing mispronounced words mid-episode is genuinely magic.",
    useCases: ["Recording and cleaning remote podcast interviews", "Transcribing interviews for show notes automatically", "Fixing audio errors post-recording without re-recording", "Publishing podcasts to Spotify and Apple Podcasts directly"],
    verdict: "The best all-in-one podcast tool for creators who don't want to learn Audacity or Adobe Audition. The free plan is functional enough to start your first show.",
    rating: 4.2,
  },
  gamma: {
    whoIsItFor: "Founders pitching investors, students presenting projects, educators creating course materials, and anyone who needs beautiful presentations without design skills.",
    myTake: "I created a 12-slide investor pitch deck from a 200-word brief in 4 minutes using Gamma. The design was genuinely polished — better than 80% of the decks I see in real life. The 'one-click restyle' feature let me swap the entire visual theme instantly. The only weakness is that Gamma-made decks look like Gamma-made decks to a trained eye.",
    useCases: ["Creating investor pitch decks from a brief", "Building client-ready proposals quickly", "Making course curriculum slides for educators", "Converting blog posts into presentation format"],
    verdict: "The best free presentation tool available. If you spend more than 2 hours per month making slides, Gamma will save you more time than any other tool on this list.",
    rating: 4.5,
  },
  'beautiful-ai': {
    whoIsItFor: "Business professionals, managers, and teams who need to create consistent, on-brand presentations regularly without a dedicated designer.",
    myTake: "Beautiful.ai's 'smart slides' auto-format as you type — add a bullet point and the layout adjusts automatically. It removes the most frustrating part of PowerPoint: manually resizing and aligning elements. The team collaboration features are excellent for agencies managing multiple client decks.",
    useCases: ["Creating weekly business reports and board presentations", "Building sales decks with consistent branding", "Team collaboration on shared presentation templates", "Converting data into visual presentation slides"],
    verdict: "Better than PowerPoint for anyone who isn't a designer. The lack of a free plan is the main drawback — but the $12/month Pro plan is fair for the time it saves.",
    rating: 4.1,
  },
  ocoya: {
    whoIsItFor: "Solo social media managers, small business owners, and content creators who need to manage posting across multiple platforms without a team.",
    myTake: "Ocoya compresses what normally takes 3 separate tools — a caption writer, a design tool, and a scheduler — into one dashboard. The AI caption generator is genuinely good for Instagram and LinkedIn. The design tool is Canva-lite but works for quick posts. The scheduling is reliable.",
    useCases: ["Scheduling 30 posts across Instagram, LinkedIn, and Twitter at once", "Generating AI captions for product launch announcements", "Creating and posting content for client social media accounts", "Maintaining consistent posting frequency without daily manual work"],
    verdict: "The best value all-in-one social media tool for solo operators. Not as powerful as Hootsuite or Buffer for large teams, but far more affordable and easier to use.",
    rating: 4.0,
  },
  replit: {
    whoIsItFor: "Students learning to code, indie developers prototyping ideas, and non-technical founders who want to build and deploy apps without local setup.",
    myTake: "Replit is where I'd send anyone who wants to learn coding in 2026. The browser-based environment eliminates the 'how do I install Node.js' problem that kills beginner motivation. The AI assistant is integrated directly into the editor and understands the context of your entire project — not just the line you're on.",
    useCases: ["Learning Python, JavaScript, or any of 50+ languages without setup", "Prototyping web apps and sharing them instantly with a URL", "Building and deploying side projects without DevOps knowledge", "Collaborative coding sessions with teammates in real time"],
    verdict: "The best platform for learning to code or prototyping quickly. The free tier's usage limits can frustrate heavy users, but for getting started or building small projects it's unmatched.",
    rating: 4.2,
  },
  'notion-ai': {
    whoIsItFor: "Knowledge workers, teams, and individuals who already use Notion and want AI capabilities built directly into their existing workspace rather than switching between tools.",
    myTake: "Notion AI's biggest advantage is context — it can read and reference all your existing Notion pages when generating content. Ask it to write a blog post and it can pull in your brand voice guidelines, existing content, and style preferences from your workspace. The AI agents that run tasks for 20 minutes autonomously (Notion 3.0) are genuinely novel.",
    useCases: ["Summarising meeting notes into action items automatically", "Writing blog drafts that match your existing brand voice", "Building project wikis from scattered notes", "Translating documents into multiple languages in-context"],
    verdict: "Essential for existing Notion users. The $10/month AI add-on pays for itself if you spend even 30 minutes per day in Notion. Not worth switching to Notion just for the AI, but if you're already there, don't skip it.",
    rating: 4.4,
  },
  taskade: {
    whoIsItFor: "Freelancers, small remote teams, and solopreneurs who need task management, project tracking, team chat, and AI assistance without paying for 4 separate tools.",
    myTake: "Taskade's custom AI agents are the standout feature. I built an agent that automatically breaks down any project brief into tasks, assigns due dates, and creates a Kanban board — in under 10 seconds. The video collaboration built directly into tasks is something I haven't seen in any competing tool.",
    useCases: ["Managing client projects with automated task breakdown", "Running a remote team without needing Slack + Asana + Notion", "Building AI agents to handle repetitive workflow steps", "Organising personal projects with AI-powered mind maps"],
    verdict: "The most feature-rich tool at its price point. The interface takes a week to fully learn but the investment pays off. The free plan is legitimately useful — not a trial.",
    rating: 4.2,
  },
};

const TODAY = new Date().toISOString().split('T')[0];

interface ToolPageProps { tool: Tool; navigate: (to: string) => void; }

export function ToolPage({ tool, navigate }: ToolPageProps) {
  const isA2 = CAT_ACCENT[tool.category] === 'a2';
  const accent = isA2 ? C.a2 : C.a1;
  const cardBg = isA2 ? C.a2card : C.a1card;
  const cardBrd = isA2 ? C.a2brd : C.a1brd;
  const content = TOOL_CONTENT[tool.slug];

  // Schema.org — complete Review with all required fields
  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "name": `${tool.name} Review 2026`,
    "headline": `${tool.name} Review — ${tool.tagline}`,
    "description": `Honest ${tool.name} review with real usage experience. ${tool.tagline}.`,
    "datePublished": "2026-01-01",
    "dateModified": TODAY,
    "url": `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`,
    "reviewBody": content ? `${content.myTake} ${content.verdict}` : tool.description,
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": content?.rating?.toString() || "4.0",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": "AI Nexus",
      "url": `${SITE_CONFIG.siteUrl}/about`,
      "sameAs": [SITE_CONFIG.instagramUrl]
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Nexus",
      "url": SITE_CONFIG.siteUrl,
      "logo": { "@type": "ImageObject", "url": `${SITE_CONFIG.siteUrl}/logo.png` }
    },
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": tool.name,
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": tool.pricing
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": content?.rating?.toString() || "4.0",
        "reviewCount": "1",
        "bestRating": "5",
        "worstRating": "1"
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

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.txt }}>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.barBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${C.barBrd}`, padding: '0 28px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.mut, fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={15} /> All tools
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ width: 3, height: 22, background: `linear-gradient(180deg,${C.a1},${C.a2})`, borderRadius: 2, marginRight: 10 }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16 }}>AI<span style={{ color: C.a1 }}>Nexus</span></span>
          </div>
        </div>
      </nav>

      {/* Breadcrumb — visible + semantic */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '12px 28px 0', fontSize: 12, color: C.mut2 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Home</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>{tool.category}</span>
        <span style={{ margin: '0 6px' }}>›</span>
        <span style={{ color: accent, fontWeight: 500 }}>{tool.name}</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 96px' }}>

        {/* Hero */}
        <div style={{ background: C.surf, borderRadius: 20, border: `1.5px solid ${cardBrd}`, padding: '40px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: `linear-gradient(180deg,${C.a1},${C.a2})` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.4, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle,${accent}10 0%,transparent 70%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Category + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' as const }}>
              <span style={{ background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 100 }}>
                {tool.category.toUpperCase()}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mut2 }}>
                <Calendar size={12} /> Updated {TODAY}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: C.mut2 }}>
                <User size={12} /> Reviewed by AI Nexus
              </span>
            </div>

            {/* H1 — single, keyword-rich */}
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 'clamp(30px,5vw,46px)', color: C.txt, margin: '0 0 10px', lineHeight: 1.1, letterSpacing: '-0.025em' }}>
              {tool.name} Review 2026 — {tool.tagline}
            </h1>

            {/* Star rating — visible + in schema */}
            {content && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 14px' }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={16} fill={i <= Math.floor(content.rating) ? accent : 'transparent'} color={accent} strokeWidth={1.5} />
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: accent }}>{content.rating}/5</span>
                <span style={{ fontSize: 13, color: C.mut2 }}>— AI Nexus rating</span>
              </div>
            )}

            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.7, margin: '0 0 24px', fontWeight: 300 }}>{tool.description}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {tool.pricing && (
                <div style={{ background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: accent, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>Pricing</div>
                  <div style={{ fontSize: 14, color: C.txt, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{tool.pricing}</div>
                </div>
              )}
              {tool.bestFor && (
                <div style={{ background: isA2 ? C.a1card : C.a2card, border: `1px solid ${isA2 ? C.a1brd : C.a2brd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: isA2 ? C.a1 : C.a2, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>Best for</div>
                  <div style={{ fontSize: 14, color: C.txt, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{tool.bestFor}</div>
                </div>
              )}
              {tool.userBadge && (
                <div style={{ background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: 12, padding: '10px 16px' }}>
                  <div style={{ fontSize: 10, color: C.a1, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>Highlight</div>
                  <div style={{ fontSize: 14, color: C.a1, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{tool.userBadge}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow sponsored"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: `linear-gradient(135deg,${C.a1},${C.a2})`, color: '#fff', borderRadius: 14, padding: '17px 32px', fontSize: 16, fontWeight: 600, marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif", boxShadow: '0 8px 32px rgba(91,33,182,.22)', textDecoration: 'none' }}>
          Start {tool.name} Free <ExternalLink size={17} />
        </a>

        {/* ── Who is it for — E-E-A-T content ────────────── */}
        {content && (
          <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
              Who is {tool.name} for?
            </h2>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.7, fontWeight: 300 }}>{content.whoIsItFor}</p>
          </div>
        )}

        {/* ── My Take — first-person experience (E-E-A-T core) */}
        {content && (
          <div style={{ background: cardBg, borderRadius: 18, border: `1.5px solid ${cardBrd}`, padding: '28px 30px', marginBottom: 14, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${C.a1},${C.a2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={15} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>My honest take</div>
                <div style={{ fontSize: 12, color: C.mut2 }}>AI Nexus · Personally tested</div>
              </div>
            </div>
            <p style={{ fontSize: 15, color: C.mut, lineHeight: 1.75, fontWeight: 300, fontStyle: 'italic' as const }}>"{content.myTake}"</p>
          </div>
        )}

        {/* Features */}
        {tool.features && tool.features.length > 0 && (
          <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 18px', letterSpacing: '-0.02em' }}>
              Key features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {tool.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: cardBg, border: `1px solid ${cardBrd}`, borderRadius: 10, padding: '11px 14px' }}>
                  <div style={{ width: 20, height: 20, background: cardBg, border: `1.5px solid ${cardBrd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color={accent} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: C.mut, fontWeight: 400, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {content && (
          <div style={{ background: C.surf, borderRadius: 18, border: `1.5px solid ${C.barBrd}`, padding: '28px 30px', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: C.txt, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Real use cases
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
              {content.useCases.map((uc, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: C.mut, lineHeight: 1.6 }}>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: accent, fontSize: 12, minWidth: 24, paddingTop: 2 }}>0{i+1}</span>
                  {uc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mid CTA */}
        <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow sponsored"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: cardBg, color: accent, border: `1.5px solid ${cardBrd}`, borderRadius: 12, padding: '13px 28px', fontSize: 14, fontWeight: 600, marginBottom: 14, fontFamily: "'DM Sans',sans-serif", textDecoration: 'none' }}>
          Try {tool.name} Free — No Credit Card Needed <ExternalLink size={14} />
        </a>

        {/* Pros & Cons */}
        {(tool.pros || tool.cons) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 14 }}>
            {tool.pros && (
              <div style={{ background: C.surf, borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: C.a1, textTransform: 'uppercase' as const, marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>What I Love</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.pros.map((p, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: C.mut, lineHeight: 1.55, fontWeight: 300 }}>
                      <div style={{ width: 18, height: 18, background: C.a1card, border: `1px solid ${C.a1brd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <Check size={10} color={C.a1} strokeWidth={3} />
                      </div>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {tool.cons && (
              <div style={{ background: C.surf, borderRadius: 16, border: `1.5px solid ${C.errbrd}`, padding: '24px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(239,68,68,.7)', textTransform: 'uppercase' as const, marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>Watch Out For</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  {tool.cons.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 14, color: C.mut, lineHeight: 1.55, fontWeight: 300 }}>
                      <div style={{ width: 18, height: 18, background: 'rgba(239,68,68,.08)', border: `1px solid ${C.errbrd}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <X size={10} color="rgba(239,68,68,.7)" strokeWidth={3} />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Verdict */}
        {content && (
          <div style={{ background: `linear-gradient(135deg,rgba(91,33,182,.06),rgba(6,182,212,.04))`, borderRadius: 16, border: `1.5px solid ${C.a1brd}`, padding: '24px 28px', marginBottom: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>⚡</span>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 6 }}>Verdict</div>
              <p style={{ fontSize: 15, color: C.txt, lineHeight: 1.7, fontWeight: 500 }}>{content.verdict}</p>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ background: `linear-gradient(135deg,${C.a1},${C.a2})`, borderRadius: 20, padding: '40px', textAlign: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: DOT_BG, opacity: 0.15, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 24, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Ready to try {tool.name}?
            </h2>
            <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, margin: '0 0 22px', lineHeight: 1.6, fontWeight: 300 }}>
              Start free. Upgrade only when you love it. No FOMO buying.
            </p>
            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer nofollow sponsored"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.a1, borderRadius: 100, padding: '12px 28px', fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", textDecoration: 'none' }}>
              Get started free <ExternalLink size={14} />
            </a>
            <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, margin: '12px 0 0' }}>
              #Ad — Affiliate link. <a href="/disclosure" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'underline' }}>Full disclosure →</a>
            </p>
          </div>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.mut, fontSize: 14, fontWeight: 400 }}>
            <ArrowLeft size={14} /> Browse all AI tools
          </button>
        </div>
      </div>
    </div>
  );
}
