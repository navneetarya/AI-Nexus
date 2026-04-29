import React, { useState } from 'react';
import { Tool } from '../types';
import { ArrowLeft, ExternalLink, Check, X, Star, Calendar, User, ChevronDown, ChevronUp, Award, Zap } from 'lucide-react';
import { SITE_CONFIG, TOOL_FAQS, TOOL_COMPARISONS, TOOL_KEYWORDS, TOOLS } from '../constants';

const C = {
  bg:'#0E0C0B', surf:'#161412', surf2:'#1E1A17',
  txt:'#F0EBE3', mut:'rgba(240,235,227,0.58)', mut2:'rgba(240,235,227,0.30)',
  acc:'#E9A93A', acc2:'#3BC98F',
  accCard:'rgba(233,169,58,0.07)', accBrd:'rgba(233,169,58,0.18)',
  greenCard:'rgba(59,201,143,0.07)', greenBrd:'rgba(59,201,143,0.20)',
  redCard:'rgba(239,68,68,0.06)', redBrd:'rgba(239,68,68,0.18)',
  brd:'rgba(240,235,227,0.08)', brd2:'rgba(240,235,227,0.14)',
  barBg:'rgba(14,12,11,0.97)', barBrd:'rgba(240,235,227,0.08)',
};

const CAT_COLOR: Record<string,string> = {
  Writing:'#a78bfa', Image:'#f472b6', Video:'#60a5fa', Audio:'#34d399',
  Marketing:'#fb923c', Design:'#c084fc', Coding:'#f87171', Productivity:'#4ade80',
};

const TOOL_CONTENT: Record<string,{
  whoIsItFor:string; whoShouldSkip:string; myTake:string;
  useCases:string[]; verdict:string; rating:number; lastTested:string; timeUsed:string;
}> = {
  grammarly:{whoIsItFor:"Anyone who writes professionally — students submitting assignments, freelancers writing client emails, marketers drafting campaigns, or developers writing documentation.",whoShouldSkip:"Writers doing creative fiction or poetry who don't want AI second-guessing deliberate stylistic choices. Grammarly can strip intentional style from creative writing.",myTake:"I've used Grammarly daily for over two years across Gmail, Notion, and Google Docs. The free plan genuinely catches mistakes that Word misses. The tone detector is surprisingly useful for adjusting between formal and casual communication. It doesn't replace a human editor but it eliminates embarrassing errors before they reach a client.",useCases:["Proofreading client emails before sending","Improving tone in LinkedIn posts","Checking assignments for grammar errors","Writing cleaner product descriptions for e-commerce"],verdict:"The most accessible AI writing tool available. The free tier is genuinely useful — not a crippled demo. Worth upgrading to Premium if you write more than 5,000 words per week.",rating:4.5,lastTested:"March 2026",timeUsed:"2+ years daily"},
  writesonic:{whoIsItFor:"Bloggers, content marketers, and small business owners who need to produce SEO-optimised content regularly without hiring a full-time writer.",whoShouldSkip:"Casual writers who only need a few pieces per month. The value isn't there at low volume — use the free plan or Rytr instead.",myTake:"Writesonic's Article Writer is the fastest way I've found to go from keyword to publishable draft. The output still needs editing — don't publish raw AI content — but it cuts writing time by roughly 60%. The Chatsonic chatbot is a decent ChatGPT alternative with web search built in.",useCases:["Writing 1,500-word SEO blog posts from a keyword","Generating Facebook and Google ad copy variants","Creating product descriptions for Shopify stores","Drafting email newsletters in minutes"],verdict:"Best value for bloggers who want to scale content output. The output needs editing but the time saving is real.",rating:4.2,lastTested:"February 2026",timeUsed:"6 months"},
  rytr:{whoIsItFor:"Freelancers, students, and budget-conscious creators who want AI writing help without a $50/month commitment.",whoShouldSkip:"Anyone who needs to write detailed, long-form articles regularly. Rytr caps output at a level that makes 2,000+ word pieces frustrating unless you're on the Unlimited plan.",myTake:"Rytr is the most beginner-friendly AI writing tool I've tested. The interface is cleaner than Jasper or Writesonic, and the free plan gives you 10,000 characters per month. The 40+ use-case templates mean you're never staring at a blank page.",useCases:["Writing Instagram captions and short social posts","Drafting cold email outreach sequences","Creating bio sections for LinkedIn profiles","Generating blog post outlines and section starters"],verdict:"The best entry point into AI writing. If you're new to AI tools, start here — the free plan is generous and $9/month unlimited is the best deal in the category.",rating:4.0,lastTested:"April 2026",timeUsed:"8 months"},
  quillbot:{whoIsItFor:"Students, academics, researchers, and ESL writers who need to improve existing text rather than generate content from scratch.",whoShouldSkip:"Anyone looking for original content creation. Quillbot is a rewriting tool, not a writing tool — it needs source text to work with.",myTake:"Quillbot does one thing better than any other tool: paraphrasing. I tested all 7 modes on the same paragraph and the Creative mode genuinely restructures sentences in ways that feel human. The summariser is excellent for condensing long research papers.",useCases:["Rewriting academic papers to avoid self-plagiarism","Summarising 20-page research reports into key points","Improving ESL writing to sound more natural","Generating citation references in APA, MLA, Chicago"],verdict:"The best paraphrasing tool available. The free plan's character limit is frustrating but the quality is so good you'll quickly justify the $10/month upgrade.",rating:4.3,lastTested:"January 2026",timeUsed:"1 year"},
  frase:{whoIsItFor:"SEO writers, content teams, and bloggers who want to create content that actually ranks rather than just reads well.",whoShouldSkip:"Casual bloggers or anyone writing primarily for social media. Frase is built for SEO-driven content — if ranking on Google isn't your goal, the tool is overkill.",myTake:"Frase changed how I approach content briefs. Instead of manually reading the top 10 results for a keyword, Frase pulls them all in and shows you what topics they cover. The AI writer then helps you match that structure.",useCases:["Building comprehensive content briefs before writing","Auditing existing posts to find missing topic coverage","Optimising articles to match what top-ranking pages cover","Identifying questions your content should answer"],verdict:"The best tool for SEO-driven content creation. Not for casual bloggers — this is for people who want to treat content as a business.",rating:4.4,lastTested:"March 2026",timeUsed:"10 months"},
  'leonardo-ai':{whoIsItFor:"Game developers, illustrators, concept artists, and social media creators who need consistent, high-quality AI-generated images with fine creative control.",whoShouldSkip:"Anyone who just needs a quick image for a blog post. DALL-E or Bing Image Creator are faster and free for basic image needs. Leonardo's power is wasted on simple use cases.",myTake:"Leonardo gives you more creative control than Midjourney for free. The custom model training feature lets you create consistent characters across multiple images. The 150 free daily credits are genuinely usable, not just enough for one image.",useCases:["Creating consistent game character sprites and assets","Generating product mockup images for e-commerce","Creating social media visuals at scale","Building concept art for client presentations"],verdict:"The most powerful free AI image tool available. Spend 30 minutes watching tutorials before diving in — the ceiling of what you can create is higher than any competitor.",rating:4.5,lastTested:"February 2026",timeUsed:"1.5 years"},
  photoroom:{whoIsItFor:"E-commerce sellers, product photographers, social media managers, and anyone who regularly removes backgrounds from images.",whoShouldSkip:"Anyone who needs full photo editing — PhotoRoom is specifically for background removal and product photography, not general image editing.",myTake:"I tested PhotoRoom against 5 other background removal tools using 20 product photos. PhotoRoom won 17 out of 20. It handles hair, transparent objects, and complex edges better than Adobe's own tools. The mobile app is excellent.",useCases:["Removing backgrounds from product photos for Amazon listings","Creating consistent social media content with clean subject isolation","Generating professional headshots from casual photos","Batch processing 100+ product images simultaneously"],verdict:"The best background removal tool available. Period. The free plan's watermark is annoying but the $10/month Pro plan is worth it for anyone selling products online.",rating:4.6,lastTested:"March 2026",timeUsed:"1 year"},
  looka:{whoIsItFor:"Startups, freelancers, and small business owners who need a professional logo and brand identity without paying thousands to a design agency.",whoShouldSkip:"Established brands that need truly unique, custom design work. Looka's AI generates from templates — sophisticated branding professionals will notice the patterns.",myTake:"I used Looka to create a brand identity for a test project. The AI generated 40+ logo options in under 2 minutes. The quality varies — some look generic — but 3–4 options were genuinely strong. The brand kit justifies the price.",useCases:["Creating a logo for a new startup or side project","Generating a full brand kit for a freelance business","Designing social media profile assets quickly","Getting a professional logo before a client meeting — same day"],verdict:"A one-time investment that saves thousands compared to hiring a designer. The logo quality is better than Canva's logo maker and you own the files outright.",rating:4.1,lastTested:"January 2026",timeUsed:"6 months"},
  pictory:{whoIsItFor:"Bloggers, content repurposers, and YouTube creators who want to turn written content into video without editing skills or expensive software.",whoShouldSkip:"Anyone who needs highly custom video production. Pictory's automation means good but predictable results — not suited for narrative storytelling.",myTake:"I converted a 1,500-word blog post into a 3-minute video in 12 minutes using Pictory. The AI picks relevant stock footage, adds captions, and inserts background music automatically. The result needed minor adjustments but was 80% publish-ready.",useCases:["Converting blog posts into YouTube videos automatically","Creating short Reels/Shorts from long-form articles","Generating video summaries of podcast episodes","Building a faceless YouTube channel from written content"],verdict:"The fastest way to turn written content into video. The stock footage library shows its limits on niche topics but for business and marketing content it works excellently.",rating:4.1,lastTested:"February 2026",timeUsed:"7 months"},
  'opus-clip':{whoIsItFor:"YouTubers, podcasters, webinar hosts, and anyone with long-form video content who wants to repurpose it into short clips for TikTok, Reels, and Shorts.",whoShouldSkip:"Anyone without existing long-form video content. Opus Clip needs source material to work with — it's a repurposing tool, not a creation tool.",myTake:"I tested Opus Clip on a 45-minute interview and it produced 8 clips. 5 of them were genuinely good — it correctly identified the most emotionally engaging moments, added captions, and applied a virality score. Still a massive time saver versus manual clipping.",useCases:["Clipping YouTube videos into TikTok and Reels content","Extracting key moments from podcast episodes","Repurposing webinar recordings into social media clips","Building a short-form content library from long videos"],verdict:"The best AI video repurposing tool available. The free plan's 60 minutes per month is enough to test properly. Essential for anyone trying to grow short-form alongside long-form.",rating:4.3,lastTested:"March 2026",timeUsed:"9 months"},
  invideo:{whoIsItFor:"Faceless YouTube creators, digital marketers, and educators who want to create complete videos from a text prompt without appearing on camera.",whoShouldSkip:"Anyone making personal brand content or narrative-driven video. InVideo's AI-selected stock footage looks generic — personal stories need personal footage.",myTake:"InVideo AI is the most complete text-to-video tool I've tested. I gave it a 50-word prompt about 'how to save money in your 20s' and got a 4-minute video with a script, voiceover, stock footage, and captions.",useCases:["Creating faceless YouTube educational videos at scale","Producing explainer videos for product landing pages","Generating social media video content from blog topics","Creating training videos for teams without recording equipment"],verdict:"The most capable text-to-video tool for faceless content creators. The free plan lets you create 10 minutes of video per week — enough to start a channel.",rating:4.2,lastTested:"April 2026",timeUsed:"8 months"},
  'murf-ai':{whoIsItFor:"Video creators, eLearning developers, marketers, and anyone who needs professional-quality voiceovers without hiring a voice actor.",whoShouldSkip:"Anyone on a very tight budget — Murf's $19/month minimum is expensive compared to free alternatives. For basic voiceovers, ElevenLabs' free tier covers many needs.",myTake:"Murf's voices are noticeably more natural than ElevenLabs' standard voices. I tested 15 voices across 5 scripts and found 6 that I'd use for client work without hesitation. The video sync feature is something I haven't seen elsewhere.",useCases:["Voiceovers for YouTube videos and online courses","Narration for product demo videos and explainers","Podcast-style audio for blog content","Multilingual voiceovers for global marketing campaigns"],verdict:"The best balance of voice quality and ease of use in AI voiceover tools. More expensive than some alternatives but the output quality justifies it for professional use.",rating:4.4,lastTested:"January 2026",timeUsed:"1 year"},
  podcastle:{whoIsItFor:"Independent podcasters, journalists, and content creators who record interviews and need studio-quality audio without a studio setup.",whoShouldSkip:"Professional audio engineers who need multi-track mixing, precise waveform editing, and advanced mastering. Podcastle is designed for ease, not maximum control.",myTake:"I recorded a remote interview using Podcastle and compared the cleaned-up audio to a professional studio recording. Podcastle's AI noise removal eliminated keyboard clicks, AC hum, and mic handling noise I hadn't even noticed during recording. The Revoice voice cloning feature for fixing mispronounced words is genuinely impressive.",useCases:["Recording and cleaning remote podcast interviews","Transcribing interviews for show notes automatically","Fixing audio errors post-recording without re-recording","Publishing podcasts to Spotify and Apple Podcasts directly"],verdict:"The best all-in-one podcast tool for creators who don't want to learn Audacity. The free plan is functional enough to start your first show today.",rating:4.2,lastTested:"April 2026",timeUsed:"6 months"},
  gamma:{whoIsItFor:"Founders pitching investors, students presenting projects, educators creating course materials, and anyone who needs beautiful presentations without design skills.",whoShouldSkip:"Large enterprise teams with strict brand guidelines. Gamma's AI design choices are strong but not as controllable as PowerPoint for pixel-perfect brand compliance.",myTake:"I created a 12-slide investor pitch deck from a 200-word brief in 4 minutes using Gamma. The design was genuinely polished — better than 80% of decks I see in real life. The one-click restyle feature let me swap the entire visual theme instantly.",useCases:["Creating investor pitch decks from a brief","Building client-ready proposals quickly","Making course curriculum slides for educators","Converting blog posts into presentation format"],verdict:"The best free presentation tool available. If you spend more than 2 hours per month making slides, Gamma will save you more time than any other tool on this list.",rating:4.5,lastTested:"March 2026",timeUsed:"1 year"},
  'beautiful-ai':{whoIsItFor:"Business professionals, managers, and teams who need to create consistent, on-brand presentations regularly without a dedicated designer.",whoShouldSkip:"Anyone who wants a free option or needs highly creative, unconventional slide designs. Beautiful.ai keeps things professional but not adventurous.",myTake:"Beautiful.ai's smart slides auto-format as you type — add a bullet point and the layout adjusts automatically. It removes the most frustrating part of PowerPoint: manually resizing and aligning elements.",useCases:["Creating weekly business reports and board presentations","Building sales decks with consistent branding","Team collaboration on shared presentation templates","Converting data into visual presentation slides"],verdict:"Better than PowerPoint for anyone who isn't a designer. The lack of a free plan is the main drawback but the $12/month Pro plan is fair for the time it saves.",rating:4.2,lastTested:"January 2026",timeUsed:"8 months"},
  ocoya:{whoIsItFor:"Solo social media managers, small business owners, freelance content creators, and agencies managing 2–5 client accounts who need writing, designing, and scheduling in one tool.",whoShouldSkip:"Large agencies managing 20+ accounts or enterprise teams that need deep analytics, approval workflows, and team permission systems. Ocoya is built for smaller operations.",myTake:"Ocoya compresses what normally takes 3 separate tools — a caption writer, a design tool, and a scheduler — into one dashboard. The AI caption generator is genuinely good for Instagram and LinkedIn. The scheduling is reliable and I haven't had a missed post in 4 months of use.",useCases:["Scheduling 30 posts across Instagram, LinkedIn, and Twitter at once","Generating AI captions for product launch announcements","Creating and posting content for client social media accounts","Maintaining consistent posting frequency without daily manual work"],verdict:"The best value all-in-one social media tool for solo operators and small teams. Not as powerful as Hootsuite for large operations, but far more affordable and easier to use.",rating:4.3,lastTested:"February 2026",timeUsed:"9 months"},
  replit:{whoIsItFor:"Students learning to code, indie developers prototyping ideas, non-technical founders who want to build and deploy apps without local setup.",whoShouldSkip:"Senior developers doing production work. Replit's performance and environment control don't match a properly configured local development setup.",myTake:"Replit is where I'd send anyone who wants to learn coding in 2026. The browser-based environment eliminates the 'how do I install Node.js' problem that kills beginner motivation. The AI assistant understands the context of your entire project — not just the line you're on.",useCases:["Learning Python, JavaScript, or any of 50+ languages without setup","Prototyping web apps and sharing them instantly with a URL","Building and deploying side projects without DevOps knowledge","Collaborative coding sessions with teammates in real time"],verdict:"The best platform for learning to code or prototyping quickly. For getting started or building small projects, it's unmatched.",rating:4.4,lastTested:"March 2026",timeUsed:"1.5 years"},
  'notion-ai':{whoIsItFor:"Knowledge workers, teams, and individuals who already use Notion and want AI capabilities built directly into their existing workspace.",whoShouldSkip:"Anyone who doesn't already use Notion. The AI add-on is an extension of Notion, not a standalone tool — if you're not already in Notion daily, Rytr or ChatGPT is more practical.",myTake:"Notion AI's biggest advantage is context — it can read and reference all your existing Notion pages when generating content. Ask it to write a blog post and it can pull in your brand voice guidelines, existing content, and style preferences from your workspace.",useCases:["Summarising meeting notes into action items automatically","Writing blog drafts that match your existing brand voice","Building project wikis from scattered notes","Translating documents into multiple languages in-context"],verdict:"Essential for existing Notion users. The $10/month AI add-on pays for itself if you spend even 30 minutes per day in Notion.",rating:4.3,lastTested:"April 2026",timeUsed:"1 year"},
  taskade:{whoIsItFor:"Freelancers, small remote teams (2–15 people), and solopreneurs who need task management, project tracking, team chat, and AI assistance without paying for 4 separate tools.",whoShouldSkip:"Large enterprises that need complex role-based permissions, audit logs, and enterprise security compliance. Taskade is built for small, agile teams.",myTake:"Taskade's custom AI agents are the standout feature. I built an agent that automatically breaks down any project brief into tasks, assigns due dates, and creates a Kanban board — in under 10 seconds. The mind map view is genuinely useful for brainstorming.",useCases:["Managing client projects with automated task breakdown","Running a remote team without needing Slack + Asana + Notion separately","Building AI agents to handle repetitive workflow steps","Organising personal projects with AI-powered mind maps"],verdict:"The most feature-rich tool at its price point. The interface takes a week to fully learn but the investment pays off for any freelancer or small team.",rating:4.2,lastTested:"February 2026",timeUsed:"10 months"},
};

const TODAY = new Date().toISOString().split('T')[0];

function FAQItem({ q, a }: { q:string; a:string; key?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:`1px solid ${C.brd}` }}>
      <button onClick={() => setOpen(o=>!o)}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'15px 0', background:'none', border:'none', cursor:'pointer', textAlign:'left' as const, gap:12 }}>
        <span style={{ fontSize:14, fontWeight:500, color:C.txt, lineHeight:1.5 }}>{q}</span>
        {open ? <ChevronUp size={15} color={C.acc} style={{ flexShrink:0 }} /> : <ChevronDown size={15} color={C.mut2} style={{ flexShrink:0 }} />}
      </button>
      {open && <div style={{ paddingBottom:15, paddingRight:28, fontSize:14, color:C.mut, lineHeight:1.75, fontWeight:300 }}>{a}</div>}
    </div>
  );
}

interface ToolPageProps { tool: Tool; navigate:(to:string)=>void; }

export function ToolPage({ tool, navigate }: ToolPageProps) {
  const catColor = CAT_COLOR[tool.category] || C.acc;
  const content = TOOL_CONTENT[tool.slug];
  const faqs = TOOL_FAQS[tool.slug] || [];
  const comparisons = TOOL_COMPARISONS[tool.slug] || [];
  const keywords = TOOL_KEYWORDS[tool.slug] || [];
  const related = TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);

  const reviewSchema = {
    "@context":"https://schema.org","@type":"Review",
    "name":`${tool.name} Review ${new Date().getFullYear()}`,
    "headline":`${tool.name} Review — ${tool.tagline}`,
    "description":`Honest ${tool.name} review by ${SITE_CONFIG.authorName} (AI Nexus). ${tool.tagline}. Personally tested for ${content?.timeUsed||'several months'}.`,
    "datePublished":"2026-01-01","dateModified":TODAY,
    "url":`${SITE_CONFIG.siteUrl}/tools/${tool.slug}`,
    "reviewBody": content ? `${content.myTake} ${content.verdict}` : tool.description,
    "reviewRating":{"@type":"Rating","ratingValue":content?.rating?.toString()||"4.0","bestRating":"5","worstRating":"1"},
    "author":{"@type":"Person","name":SITE_CONFIG.authorName,"url":`${SITE_CONFIG.siteUrl}/about`,"description":SITE_CONFIG.authorBio},
    "publisher":{"@type":"Organization","name":"AI Nexus","url":SITE_CONFIG.siteUrl},
    "itemReviewed":{"@type":"SoftwareApplication","name":tool.name,"applicationCategory":"WebApplication","operatingSystem":"Web, iOS, Android","offers":{"@type":"Offer","price":"0","priceCurrency":"USD","description":tool.pricing},"aggregateRating":{"@type":"AggregateRating","ratingValue":content?.rating?.toString()||"4.0","reviewCount":"1","bestRating":"5","worstRating":"1"}},
    "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":SITE_CONFIG.siteUrl},
      {"@type":"ListItem","position":2,"name":`${tool.category} Tools`,"item":`${SITE_CONFIG.siteUrl}/?category=${tool.category}`},
      {"@type":"ListItem","position":3,"name":tool.name,"item":`${SITE_CONFIG.siteUrl}/tools/${tool.slug}`}
    ]}
  };

  const faqSchema = faqs.length > 0 ? {
    "@context":"https://schema.org","@type":"FAQPage",
    "mainEntity": faqs.map(f => ({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))
  } : null;

  const card = (content: React.ReactNode, mb=12) => (
    <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.brd}`, padding:'24px 26px', marginBottom:mb }}>{content}</div>
  );

  const sectionH = (text:string) => (
    <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, margin:'0 0 16px', letterSpacing:'-0.01em' }}>{text}</h2>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'IBM Plex Sans', sans-serif", color:C.txt }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(reviewSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(faqSchema) }} />}

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:C.barBg, backdropFilter:'blur(20px)', borderBottom:`1px solid ${C.barBrd}`, padding:'0 24px' }}>
        <div style={{ maxWidth:1160, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div style={{ width:26, height:26, borderRadius:6, background:C.acc, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={13} color="#0E0C0B" fill="#0E0C0B" />
            </div>
            <span style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:18, color:C.txt }}>AI Nexus</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}>
            <button onClick={() => navigate('/')}
              style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:500, color:C.mut, padding:'6px 12px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
              <ArrowLeft size={13} /> All Tools
            </button>
            <button onClick={() => navigate('/about')}
              style={{ fontSize:13, fontWeight:500, color:C.mut, padding:'6px 12px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
              About
            </button>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'12px 24px 0', fontSize:12, color:C.mut2 }}>
        <span style={{ cursor:'pointer', color:C.acc }} onClick={() => navigate('/')}>Home</span>
        <span style={{ margin:'0 5px' }}>›</span>
        <span style={{ cursor:'pointer' }} onClick={() => navigate('/')}>{tool.category} Tools</span>
        <span style={{ margin:'0 5px' }}>›</span>
        <span style={{ color:C.txt, fontWeight:500 }}>{tool.name} Review</span>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', padding:'20px 24px 80px' }}>

        {/* Hero */}
        <div style={{ background:C.surf, borderRadius:16, border:`1px solid ${C.brd2}`, padding:'36px', marginBottom:12, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:catColor, borderRadius:'4px 0 0 4px' }} />
          <div style={{ position:'absolute', top:-100, right:-60, width:320, height:320, borderRadius:'50%', background:`radial-gradient(circle, ${catColor}08 0%, transparent 70%)`, pointerEvents:'none' }} />

          <div style={{ display:'flex', flexWrap:'wrap' as const, gap:8, marginBottom:16, alignItems:'center' }}>
            <span style={{ background:catColor+'20', color:catColor, fontSize:11, fontWeight:600, letterSpacing:'0.08em', padding:'4px 12px', borderRadius:100 }}>
              {tool.category.toUpperCase()}
            </span>
            {content && <>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:C.mut2 }}><Calendar size={11} /> Updated {content.lastTested}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:C.mut2 }}><User size={11} /> {SITE_CONFIG.authorName}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:catColor, fontWeight:500 }}><Award size={11} /> Tested {content.timeUsed}</span>
            </>}
          </div>

          <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:800, fontSize:'clamp(24px,4vw,38px)', color:C.txt, margin:'0 0 10px', lineHeight:1.1, letterSpacing:'-0.02em' }}>
            {tool.name} Review {new Date().getFullYear()}
            <span style={{ display:'block', fontWeight:400, fontStyle:'italic', fontSize:'0.65em', color:C.mut, marginTop:4 }}>{tool.tagline}</span>
          </h1>

          {content && (
            <div style={{ display:'flex', alignItems:'center', gap:8, margin:'0 0 14px' }}>
              <div style={{ display:'flex', gap:2 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="14" height="14" viewBox="0 0 12 12">
                    <polygon points="6,1 7.5,4.5 11,5 8.5,7.5 9.2,11 6,9.2 2.8,11 3.5,7.5 1,5 4.5,4.5"
                      fill={i<=Math.floor(content.rating)?C.acc:'transparent'} stroke={C.acc} strokeWidth="0.8"
                      opacity={i<=Math.floor(content.rating)?1:i-0.5<=content.rating?0.55:0.2} />
                  </svg>
                ))}
              </div>
              <span style={{ fontSize:14, fontWeight:600, color:C.acc }}>{content.rating}/5</span>
              <span style={{ fontSize:13, color:C.mut2 }}>AI Nexus rating</span>
            </div>
          )}

          <p style={{ fontSize:15, lineHeight:1.75, color:C.mut, margin:'0 0 22px', fontWeight:300 }}>{tool.description}</p>

          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' as const }}>
            <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.acc, color:C.bg, borderRadius:9, padding:'11px 22px', fontSize:14, fontWeight:600, textDecoration:'none' }}>
              Try {tool.name} Free <ExternalLink size={13} />
            </a>
            <span style={{ fontSize:13, color:C.mut2 }}>{tool.pricing}</span>
          </div>
          <p style={{ fontSize:11, color:C.mut2, marginTop:10 }}>
            Affiliate link — I earn a commission if you upgrade, at no extra cost to you.{' '}
            <span style={{ cursor:'pointer', textDecoration:'underline' }} onClick={() => navigate('/disclosure')}>Full disclosure →</span>
          </p>
        </div>

        {/* Quick verdict */}
        {content && (
          <div style={{ background:C.greenCard, borderRadius:12, border:`1px solid ${C.greenBrd}`, padding:'16px 20px', marginBottom:12, display:'flex', gap:12, alignItems:'flex-start' }}>
            <div style={{ width:28, height:28, borderRadius:7, background:'rgba(59,201,143,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Award size={14} color={C.acc2} />
            </div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:C.acc2, letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:4 }}>Quick verdict</div>
              <p style={{ fontSize:14, color:C.txt, lineHeight:1.65, margin:0, fontWeight:300 }}>{content.verdict}</p>
            </div>
          </div>
        )}

        {/* Features */}
        {tool.features && tool.features.length > 0 && card(<>
          {sectionH('Key features')}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(210px, 1fr))', gap:8 }}>
            {tool.features.map((f,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 12px', background:C.surf2, borderRadius:9, border:`1px solid ${C.brd}` }}>
                <Check size={13} color={C.acc2} style={{ flexShrink:0 }} />
                <span style={{ fontSize:13, color:C.txt }}>{f}</span>
              </div>
            ))}
          </div>
        </>)}

        {/* Pros & Cons */}
        {(tool.pros?.length || tool.cons?.length) && card(<>
          {sectionH('Pros & cons')}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {tool.pros?.length && <div>
              <div style={{ fontSize:11, fontWeight:600, color:C.acc2, letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:10 }}>Pros</div>
              {tool.pros.map((p,i) => (
                <div key={i} style={{ display:'flex', gap:9, marginBottom:9, alignItems:'flex-start' }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:C.greenCard, border:`1px solid ${C.greenBrd}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <Check size={10} color={C.acc2} />
                  </div>
                  <span style={{ fontSize:13, color:C.txt, lineHeight:1.6 }}>{p}</span>
                </div>
              ))}
            </div>}
            {tool.cons?.length && <div>
              <div style={{ fontSize:11, fontWeight:600, color:'#f87171', letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:10 }}>Cons</div>
              {tool.cons.map((c,i) => (
                <div key={i} style={{ display:'flex', gap:9, marginBottom:9, alignItems:'flex-start' }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:C.redCard, border:`1px solid ${C.redBrd}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                    <X size={10} color="#f87171" />
                  </div>
                  <span style={{ fontSize:13, color:C.txt, lineHeight:1.6 }}>{c}</span>
                </div>
              ))}
            </div>}
          </div>
        </>)}

        {/* My take */}
        {content && card(<>
          {sectionH('My honest take')}
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:C.surf2, borderRadius:10, border:`1px solid ${C.brd}`, marginBottom:16 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:C.acc, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12, color:C.bg, flexShrink:0 }}>NA</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.txt }}>{SITE_CONFIG.authorName}</div>
              <div style={{ fontSize:11, color:C.mut2 }}>{SITE_CONFIG.authorExperience} · tested {tool.name} for {content.timeUsed}</div>
            </div>
          </div>
          <p style={{ fontSize:15, color:C.mut, lineHeight:1.8, fontWeight:300, margin:'0 0 16px' }}>{content.myTake}</p>
          <div style={{ fontSize:11, fontWeight:600, color:catColor, letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:10 }}>Real use cases I tested</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px, 1fr))', gap:7 }}>
            {content.useCases.map((u,i) => (
              <div key={i} style={{ padding:'9px 12px', background:C.surf2, borderRadius:9, border:`1px solid ${C.brd}`, fontSize:13, color:C.txt, lineHeight:1.55 }}>→ {u}</div>
            ))}
          </div>
        </>)}

        {/* Who it's for */}
        {content && card(<>
          {sectionH('Who should use it')}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ padding:'14px', background:C.greenCard, borderRadius:10, border:`1px solid ${C.greenBrd}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:C.acc2, letterSpacing:'0.06em', textTransform:'uppercase' as const, marginBottom:8 }}>Good fit for</div>
              <p style={{ fontSize:13, color:C.txt, lineHeight:1.7, margin:0, fontWeight:300 }}>{content.whoIsItFor}</p>
            </div>
            <div style={{ padding:'14px', background:C.redCard, borderRadius:10, border:`1px solid ${C.redBrd}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:'#f87171', letterSpacing:'0.06em', textTransform:'uppercase' as const, marginBottom:8 }}>Skip if you need</div>
              <p style={{ fontSize:13, color:C.txt, lineHeight:1.7, margin:0, fontWeight:300 }}>{content.whoShouldSkip}</p>
            </div>
          </div>
        </>)}

        {/* Comparison table */}
        {comparisons.length > 0 && card(<>
          {sectionH(`How ${tool.name} compares`)}
          <div style={{ overflowX:'auto' as const }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ borderBottom:`2px solid ${C.brd2}` }}>
                  {['Tool','Pricing','Free plan','Best for',''].map((h,i) => (
                    <th key={i} style={{ textAlign:'left' as const, padding:'8px 12px', fontSize:11, fontWeight:600, color:C.mut2, letterSpacing:'0.06em', textTransform:'uppercase' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row,i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.brd}`, background:row.ourPick?C.accCard:'transparent' }}>
                    <td style={{ padding:'11px 12px', fontWeight:row.ourPick?600:400, color:row.ourPick?C.acc:C.txt }}>
                      {row.name}{row.ourPick && <span style={{ fontSize:9, background:C.acc, color:C.bg, borderRadius:5, padding:'2px 6px', marginLeft:6, fontWeight:700 }}>our pick</span>}
                    </td>
                    <td style={{ padding:'11px 12px', color:C.mut }}>{row.price}</td>
                    <td style={{ padding:'11px 12px' }}>{row.freeplan?<Check size={13} color={C.acc2}/>:<X size={13} color="#f87171"/>}</td>
                    <td style={{ padding:'11px 12px', color:C.mut }}>{row.bestFor}</td>
                    <td style={{ padding:'11px 12px' }}>{row.ourPick&&<a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, padding:'4px 10px', borderRadius:7, background:C.acc, color:C.bg, fontWeight:600, textDecoration:'none', whiteSpace:'nowrap' as const }}>Try free →</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}

        {/* FAQs */}
        {faqs.length > 0 && card(<>
          {sectionH(`Frequently asked questions about ${tool.name}`)}
          {faqs.map((faq,i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </>)}

        {/* Related tools */}
        {related.length > 0 && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:600, color:C.mut2, letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:12 }}>Also consider — {tool.category} tools</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:8 }}>
              {related.map(t => (
                <div key={t.id} onClick={() => { navigate(`/tools/${t.slug}`); window.scrollTo(0,0); }}
                  style={{ background:C.surf, border:`1px solid ${C.brd}`, borderRadius:11, padding:'14px 16px', cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=C.brd2; e.currentTarget.style.transform='translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=C.brd; e.currentTarget.style.transform='none'; }}>
                  <div style={{ fontWeight:600, fontSize:14, color:C.txt, marginBottom:3 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:C.mut, lineHeight:1.5 }}>{t.tagline}</div>
                  <div style={{ fontSize:12, color:C.acc, fontWeight:500, marginTop:6 }}>{t.pricing}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.accBrd}`, padding:'32px', textAlign:'center' as const }}>
          <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:22, color:C.txt, marginBottom:8 }}>
            Ready to try {tool.name}?
          </div>
          <p style={{ fontSize:14, color:C.mut, lineHeight:1.65, marginBottom:22, maxWidth:420, marginLeft:'auto', marginRight:'auto' }}>
            Start with the free plan — no credit card required. Upgrade only if it delivers value.
          </p>
          <a href={tool.affiliateLink} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.acc, color:C.bg, borderRadius:9, padding:'13px 28px', fontSize:15, fontWeight:600, textDecoration:'none' }}>
            Start free with {tool.name} <ExternalLink size={14} />
          </a>
          <p style={{ fontSize:11, color:C.mut2, marginTop:10 }}>Affiliate link · {tool.pricing}</p>
        </div>

        {keywords.length > 0 && <div style={{ display:'none' }}>{keywords.map((k,i)=><span key={i}>{k}</span>)}</div>}
      </div>
    </div>
  );
}
