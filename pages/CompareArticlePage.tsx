import React from 'react';
import { ArrowLeft, ExternalLink, Check, X, ChevronRight, Zap } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'#0E0C0B', surf:'#161412', surf2:'#1E1A17',
  txt:'#F0EBE3', mut:'rgba(240,235,227,0.58)', mut2:'rgba(240,235,227,0.30)',
  acc:'#E9A93A', acc2:'#3BC98F',
  accCard:'rgba(233,169,58,0.07)', accBrd:'rgba(233,169,58,0.18)',
  greenCard:'rgba(59,201,143,0.07)', greenBrd:'rgba(59,201,143,0.20)',
  brd:'rgba(240,235,227,0.08)', brd2:'rgba(240,235,227,0.14)',
  barBg:'rgba(14,12,11,0.97)', barBrd:'rgba(240,235,227,0.08)',
};

export interface CompareArticle {
  slug: string; title: string; metaDescription: string; keyword: string;
  publishDate: string; intro: string; sections: CompareSection[];
  verdict: string; comparisonTable: CompareRow[];
  winnerSlug: string; winnerName: string; winnerAffiliateLink: string; winnerAffiliateText: string;
}
export interface CompareSection { heading: string; content: string; }
export interface CompareRow {
  name: string; price: string; priceINR: string; freeplan: boolean;
  aiContent: string; platforms: string; bestFor: string; ourPick: boolean;
}

export const COMPARE_ARTICLES: CompareArticle[] = [
  {
    slug:'rytr-vs-writesonic',
    title:'Rytr vs Writesonic (2026): Which AI Writing Tool Is Actually Worth It?',
    metaDescription:'Comparing Rytr and Writesonic for solopreneurs, freelancers, and content creators. Real pricing, real output quality, and an honest verdict on which AI writer wins in 2026.',
    keyword:'rytr vs writesonic', publishDate:'April 2026',
    intro:`I've run both of these tools side-by-side for content work over the past several months — paid accounts on both, same prompts, same use cases. Here's the honest breakdown.\n\nThe short answer: Writesonic does more, costs more, and is worth it only if SEO-driven long-form content is your main output. Rytr is cheaper, simpler, and quietly excellent for solopreneurs and freelancers who need consistent short-to-medium form copy without paying $40–100/month for the privilege.`,
    sections:[
      {heading:'What most comparisons get wrong',content:`Most Rytr vs Writesonic articles are written by people who tested the free tiers for 15 minutes. The real comparison happens at the paid tiers — specifically, what you actually get per dollar.\n\nRytr's paid tier is $9/month for unlimited words. Writesonic's equivalent starts at $16/month and limits you on word count depending on the plan. That pricing gap compounds quickly if you write regularly.`},
      {heading:'Rytr — The underdog that quietly wins on value',content:`Rytr's free plan gives 10,000 characters/month — enough to test whether it works for your use case before spending a cent. The $9/month Saver plan is unlimited words. That's it. No word credit nonsense.\n\n**Where it genuinely falls short:** Long-form blog posts over 1,200 words. Rytr can write sections, but stitching together a 2,000-word article feels like manual labour. The output is also more generic for nuanced topics.\n\n**Who Rytr is actually for:** Freelancers, solopreneurs, social media managers, and small businesses who write structured content types regularly and don't want to pay $50/month for a tool that's 80% the same.`},
      {heading:'Writesonic — More powerful, but priced for it',content:`Writesonic ($16+/month) plays in a different league for long-form SEO content. The built-in SEO checker, Chatsonic AI chatbot, and Article Writer are genuinely good.\n\nThe Article Writer generates full 1,500–2,500 word drafts that are actually usable as starting points. For bloggers building topical authority, Writesonic's output has noticeably better structure and keyword integration than Rytr's.\n\n**Where Writesonic trips up:** The UI feels cluttered. There are too many templates and modes. Quality is inconsistent across templates compared to Rytr's more focused toolset.\n\n**Who Writesonic is actually for:** SEO content marketers, bloggers targeting organic search, and content agencies that need long-form output regularly.`},
      {heading:'Head-to-head: the honest output test',content:`**Email copy:** Rytr wins. The templates are tighter, output requires less editing.\n\n**Blog intros and conclusions:** Roughly equal. Both produce serviceable drafts.\n\n**Full blog posts (1,500+ words):** Writesonic wins clearly. The Article Writer produces a coherent first draft. Rytr requires manual assembly of sections.\n\n**Social media captions:** Rytr wins on speed and template variety.\n\n**Ad copy (Google, Meta):** Rytr's dedicated templates are excellent here.`},
    ],
    verdict:`If you write primarily short-to-medium form content — social posts, emails, ad copy, blog intros, product descriptions — start with Rytr. $9/month unlimited is one of the best-value deals in AI tools right now.\n\nIf you're a blogger or SEO content marketer who needs full 1,500–2,500 word drafts regularly, Writesonic's Article Writer and SEO tools justify the higher price.\n\nThe mistake is paying Writesonic prices for Rytr-level output needs. Be honest about what you actually write each week.`,
    comparisonTable:[
      {name:'Rytr',price:'Free–$29/mo',priceINR:'$9/mo unlimited',freeplan:true,aiContent:'40+ templates, short-form focus',platforms:'Web + Chrome ext',bestFor:'Freelancers & solopreneurs',ourPick:true},
      {name:'Writesonic',price:'Free–$99/mo',priceINR:'From $16/mo',freeplan:true,aiContent:'Article Writer, SEO tools, Chatsonic',platforms:'Web + API',bestFor:'SEO bloggers & content teams',ourPick:false},
    ],
    winnerSlug:'rytr', winnerName:'Rytr', winnerAffiliateLink:'https://rytr.me/?via=navneet-arya', winnerAffiliateText:'Try Rytr free',
  },
  {
    slug:'grammarly-vs-quillbot',
    title:'Grammarly vs QuillBot (2026): Which Should You Actually Use?',
    metaDescription:'Grammarly vs QuillBot compared for writers, students, and professionals. Real breakdown of what each tool does, where each wins, and which one to use in 2026.',
    keyword:'grammarly vs quillbot', publishDate:'April 2026',
    intro:`These two tools get compared constantly — and almost always by people who don't understand what each one is actually built to do. Grammarly and QuillBot are not the same kind of product.\n\nHere's the direct answer: if you want to write better, use Grammarly. If you want to rewrite or repurpose existing text, use QuillBot. Both have generous free plans. Both cost under $10–12/month for premium.`,
    sections:[
      {heading:'They solve different problems — get clear on yours first',content:`Grammarly is an AI writing assistant. It reads what you've written and suggests improvements to grammar, spelling, clarity, tone, and engagement.\n\nQuillBot is an AI paraphrasing and rewriting tool. It takes existing text and restructures it — same meaning, different phrasing.\n\nIf you mix them up, you'll be frustrated regardless of which one you choose.`},
      {heading:'Grammarly — The writing assistant used by 40 million people',content:`Grammarly's free plan is one of the best free tiers in any writing tool. Basic grammar checks, spelling corrections, and punctuation fixes work across Gmail, Google Docs, LinkedIn, Twitter, and 500+ other apps via the browser extension.\n\nThe premium plan ($12/month) adds tone detection, clarity rewrites, and engagement scoring. These aren't gimmicks — after two weeks, you start internalising the patterns.\n\n**Where Grammarly falls short:** It occasionally over-corrects creative writing by applying formal grammar rules to intentional stylistic choices.`},
      {heading:'QuillBot — The paraphrasing tool that actually works',content:`QuillBot's core feature — the paraphrasing tool — is the best in the market at its specific job. 7 modes (Standard, Fluency, Formal, Simple, Creative, Expand, Shorten) let you control not just the words but the register and length of the output.\n\nThe **Summariser** is excellent for research. The citation generator supports APA, MLA, Chicago, and Harvard formats — which is precisely why QuillBot has become the default tool for students globally.\n\n**Where QuillBot falls short:** It is not a writing assistant. It won't help you write from scratch or give you tone feedback on your emails.`},
      {heading:'Free plans compared: who gives you more for nothing',content:`**Grammarly free:** Grammar, spelling, punctuation checks. Works across 500+ apps via browser extension. No word limit.\n\n**QuillBot free:** Paraphrasing with 2 modes, up to 125 words per paraphrase, summariser (600 words max), basic grammar checker, citation generator with no limits.\n\nFor students, QuillBot's free tier is more immediately useful. For professionals and content writers, Grammarly's free tier is more useful because the grammar checks integrate into the apps you already use every day.`},
    ],
    verdict:`Use Grammarly if you write original content — emails, blog posts, reports, social media — and want a real-time editor that makes your writing clearer. The free plan is enough for casual use.\n\nUse QuillBot if you regularly need to rewrite, paraphrase, or summarise existing text. Students, researchers, and content strategists will find QuillBot more directly useful.\n\nThe best setup if budget allows: use both. Grammarly while you write, QuillBot when you need to restructure. They complement each other.`,
    comparisonTable:[
      {name:'Grammarly',price:'Free–$12/mo',priceINR:'Best for: editing',freeplan:true,aiContent:'Grammar, tone, clarity, rewrites',platforms:'500+ apps via extension',bestFor:'Original writing & editing',ourPick:true},
      {name:'QuillBot',price:'Free–$9.95/mo',priceINR:'Best for: rewriting',freeplan:true,aiContent:'Paraphrase, summarise, cite',platforms:'Web + Chrome ext + Word',bestFor:'Students & content repurposers',ourPick:false},
    ],
    winnerSlug:'grammarly', winnerName:'Grammarly', winnerAffiliateLink:'https://grammarly.com?affiliateId=ainexus', winnerAffiliateText:'Try Grammarly free',
  },
  {
    slug:'ocoya-vs-buffer-vs-hootsuite',
    title:'Ocoya vs Buffer vs Hootsuite (2026): Which Social Media Tool Is Worth It?',
    metaDescription:'Comparing Ocoya, Buffer, and Hootsuite for solopreneurs and small businesses. Real pricing, honest AI features breakdown, and which tool wins for content creators in 2026.',
    keyword:'ocoya vs buffer vs hootsuite', publishDate:'April 2026',
    intro:`I've spent the past year managing social media for several side projects, running paid accounts on all three of these tools at different points. Here's the honest breakdown.\n\nThe short answer: Buffer is overrated, Hootsuite is overkill for most users, and Ocoya is the tool most people haven't heard of yet — but probably should be using.`,
    sections:[
      {heading:'Buffer — Clean, but the AI is an afterthought',content:`Buffer ($6–18/month) has the cleanest UI of the three. Scheduling is dead simple. But in 2026, Buffer's AI content features feel bolted on — it has no awareness of your brand voice or the specific platform you're scheduling for.\n\nFor pure scheduling without content creation: Buffer is fine. For anyone who also wants help writing captions, you'll end up paying for Buffer plus something else.\n\n**Free plan:** Yes — 3 channels, 10 scheduled posts per channel, basic analytics.`},
      {heading:'Hootsuite — Powerful, built for agencies, priced for them too',content:`Hootsuite starts at $99/month for one user. If you're an agency managing 20+ client accounts with a team, Hootsuite makes sense. The reporting is deep, approval workflows are solid, and integrations are enterprise-grade.\n\nIf you're a freelancer or small business owner — Hootsuite is a waste of money. You're paying for infrastructure built for teams of 10 while using maybe 20% of what you're paying for.\n\n**Free plan:** No. 30-day trial only.`},
      {heading:'Ocoya — The tool that combines both jobs natively',content:`Ocoya ($15/month) sits in the gap between "just a scheduler" and "just an AI writer." It does both natively, inside the same dashboard.\n\nHere's what the workflow looks like: you open Ocoya, drop in a topic, and it generates platform-specific captions — not one generic caption copy-pasted everywhere, but content written differently for LinkedIn vs Instagram vs TikTok. Then you schedule from the same screen.\n\n**Where Ocoya falls short:** If you're managing 15+ client accounts or need white-label reporting, Hootsuite's depth wins. Ocoya's analytics are functional but not deep.\n\n**Free plan:** No permanent free plan — trial available. Plans start at $15/month.`},
      {heading:'AI caption quality: honest head-to-head test',content:`I ran the same brief through all three tools across three platforms:\n\n**Buffer's AI:** Produced a usable but generic caption. Same structure, lightly adjusted, for all three platforms. No real understanding of tone differences between platforms.\n\n**Hootsuite's AI:** Noticeably better than Buffer — it understood that LinkedIn needs professional framing and Instagram can be more casual.\n\n**Ocoya's AI:** Generated three clearly distinct outputs. LinkedIn opened with a professional insight. Instagram was conversational with a hook in the first line. TikTok was punchy and started with a direct question. Ocoya's captions required the least editing before publishing.`},
    ],
    verdict:`For most solopreneurs and small businesses: start with Ocoya's free trial. If you're manually writing captions and copying them into a scheduler, Ocoya collapses that into one workflow for $15/month.\n\nIf you genuinely just want scheduling and already have a content system: Buffer's free plan is clean and no-fuss.\n\nIf someone is recommending Hootsuite for a solo operator: they're overselling you. Hootsuite's pricing makes sense for agencies. It doesn't make sense for one business managing its own social presence.`,
    comparisonTable:[
      {name:'Ocoya',price:'$15–$99/mo',priceINR:'From $15/mo',freeplan:false,aiContent:'Native (platform-aware)',platforms:'7+',bestFor:'Content + scheduling combo',ourPick:true},
      {name:'Buffer',price:'$6–$120/mo',priceINR:'Free tier available',freeplan:true,aiContent:'Basic (generic prompt)',platforms:'7',bestFor:'Pure scheduling only',ourPick:false},
      {name:'Hootsuite',price:'$99–$739/mo',priceINR:'From $99/mo',freeplan:false,aiContent:'Moderate (recent add-on)',platforms:'35+',bestFor:'Agencies & large teams',ourPick:false},
    ],
    winnerSlug:'ocoya', winnerName:'Ocoya', winnerAffiliateLink:'https://www.ocoya.com/?via=navneet', winnerAffiliateText:'Try Ocoya free',
  },
  {
    slug:'podcastle-vs-descript',
    title:'Podcastle vs Descript (2026): Which Podcast Tool Should You Use?',
    metaDescription:'Podcastle vs Descript compared for podcasters, indie creators, and remote interviewers. Honest breakdown of recording quality, editing, AI features, and real pricing in 2026.',
    keyword:'podcastle vs descript', publishDate:'April 2026',
    intro:`I've used both Podcastle and Descript for podcast production over the past year — recording solo episodes, recording remote guests, editing transcripts, cleaning up audio. Here's the real comparison.\n\nThe short answer: Podcastle is the better choice for podcasters who want broadcast-quality recording and AI audio cleanup without a steep learning curve. Descript is better for creators who produce video content alongside audio and need a text-based editing workflow.`,
    sections:[
      {heading:'What each tool is actually built to do',content:`**Podcastle** is fundamentally a podcast recording and publishing platform with AI audio enhancement built in from the start. You record, Podcastle cleans up the audio automatically, and you publish. The workflow is linear and optimised for audio-first creators.\n\n**Descript** is a multimedia editing tool built around transcription. You record, it transcribes the content, and you edit by manipulating the text transcript — delete a word in the transcript and it deletes the corresponding audio clip. It's a genuinely novel editing paradigm.\n\nIf you only make podcasts: Podcastle is more purpose-built. If you make video podcasts or need to cut filler words by searching text: Descript's approach has real advantages.`},
      {heading:'Podcastle — Purpose-built podcasting with serious AI audio',content:`Podcastle's free plan is one of the most generous in the podcasting space: unlimited recordings, AI audio enhancement (Magic Dust), remote guest recording for up to 10 people, and browser-based recording with no downloads required.\n\n**Magic Dust** — Podcastle's AI noise removal — is the standout feature. It removes background noise, evens out volume levels, and makes recordings sound like they were done in a studio rather than a spare bedroom. I've run recordings made next to an open window through it with dramatic results.\n\n**Remote recording** is solid. Podcastle records each participant locally and uploads separate high-quality audio tracks — the same approach used by Riverside and SquadCast.\n\n**Where Podcastle has limits:** The editing tools are basic. If you want to cut filler words across a 60-minute interview by searching a transcript, Podcastle isn't built for that.\n\n**Paid plans start at $11.99/month** — very reasonable for what you get.`},
      {heading:"Descript — Text-based editing that changes how you work",content:`Descript's core innovation is text-based editing — you edit a recording the same way you edit a document. Record your episode, get an automatic transcript, then cut filler words and awkward pauses by selecting and deleting text. The audio follows automatically.\n\nFor interview-heavy podcasts, searching for every instance of "um" or "you know" and deleting them takes 5 minutes instead of 50.\n\n**Video support** is a major advantage. Descript handles video editing with the same text-based approach — which makes it genuinely useful for video podcasts and social media clips.\n\n**Where Descript trips up:** Remote recording quality is not as clean as Podcastle's. The learning curve is real — Descript's interface is unusual and takes a couple of sessions before the paradigm clicks.\n\n**Pricing starts at $12/month.** Free plan limited to 1 hour of transcription per month — not enough for regular podcasters.`},
      {heading:'AI features compared: what\'s actually useful',content:`**Audio cleanup:** Podcastle's Magic Dust is better for pure audio enhancement. It's more consistent and handles a wider range of noise profiles.\n\n**Filler word removal:** Descript wins clearly. Its transcript-based editing makes bulk filler word removal fast and precise.\n\n**Voice cloning:** Both have it. Descript's is more mature. Podcastle's works well for simple fixes.\n\n**Transcription:** Descript's transcription is central to the product and very accurate.\n\n**Publishing:** Podcastle has direct podcast distribution built in. Descript does not — you export and publish elsewhere.`},
    ],
    verdict:`If your priority is recording quality and ease of use — especially for remote guest interviews — start with Podcastle. The free plan is genuinely useful, Magic Dust is the best AI audio cleanup at this price point. At $11.99/month, it's excellent value.\n\nIf you produce video podcasts or need transcript-based editing for long interviews — Descript's editing workflow justifies its price. The text-based editing paradigm genuinely saves time for interview-heavy content.\n\nSome teams use Podcastle for recording and Descript for post-production editing. If budget is a constraint, pick based on your biggest pain point: recording quality → Podcastle; editing efficiency → Descript.`,
    comparisonTable:[
      {name:'Podcastle',price:'Free–$29/mo',priceINR:'From $11.99/mo',freeplan:true,aiContent:'Magic Dust audio AI, voice clone',platforms:'Web + iOS + Android',bestFor:'Recording-first podcasters',ourPick:true},
      {name:'Descript',price:'Free–$24/mo',priceINR:'From $12/mo',freeplan:true,aiContent:'Overdub voice clone, Studio Sound',platforms:'Mac + Windows + Web',bestFor:'Video podcasters & editors',ourPick:false},
    ],
    winnerSlug:'podcastle', winnerName:'Podcastle', winnerAffiliateLink:'https://podcastle.ai/?ref=ymi1ntf', winnerAffiliateText:'Try Podcastle free',
  },
];

function renderContent(text: string) {
  return text.split('\n\n').map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) return <strong key={j} style={{ color: C.txt, fontWeight: 600 }}>{chunk.slice(2,-2)}</strong>;
      return <span key={j}>{chunk}</span>;
    });
    return <p key={i} style={{ margin:'0 0 1rem', lineHeight:1.8, color:C.mut, fontWeight:300, fontSize:15 }}>{parts}</p>;
  });
}

interface Props { article: CompareArticle; navigate:(to:string)=>void; }

export function CompareArticlePage({ article, navigate }: Props) {
  const compareSchema = {
    "@context":"https://schema.org","@type":"Article",
    "headline": article.title,
    "description": article.metaDescription,
    "datePublished":"2026-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "url":`${SITE_CONFIG.siteUrl}/compare/${article.slug}`,
    "author":{"@type":"Person","name":SITE_CONFIG.authorName,"url":`${SITE_CONFIG.siteUrl}/about`},
    "publisher":{"@type":"Organization","name":"AI Nexus","url":SITE_CONFIG.siteUrl},
    "breadcrumb":{"@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":SITE_CONFIG.siteUrl},
      {"@type":"ListItem","position":2,"name":"Compare","item":`${SITE_CONFIG.siteUrl}/#compare-section`},
      {"@type":"ListItem","position":3,"name":article.keyword,"item":`${SITE_CONFIG.siteUrl}/compare/${article.slug}`}
    ]}
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'IBM Plex Sans', sans-serif", color:C.txt }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(compareSchema) }} />

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
            <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:500, color:C.mut, padding:'6px 12px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>
              <ArrowLeft size={13} /> All Tools
            </button>
            <button onClick={() => navigate('/about')} style={{ fontSize:13, color:C.mut, padding:'6px 12px', borderRadius:8, background:'transparent', border:'none', cursor:'pointer' }}>About</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth:780, margin:'0 auto', padding:'24px 24px 80px' }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.mut2, marginBottom:20 }}>
          <span style={{ cursor:'pointer', color:C.acc }} onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={11} />
          <span>Compare</span>
          <ChevronRight size={11} />
          <span style={{ color:C.txt }}>{article.keyword}</span>
        </div>

        {/* Hero */}
        <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.brd2}`, padding:'32px', marginBottom:16, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:C.acc, borderRadius:'4px 0 0 4px' }} />
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:C.accCard, border:`1px solid ${C.accBrd}`, borderRadius:100, padding:'4px 12px', marginBottom:14, fontSize:11, fontWeight:600, color:C.acc, letterSpacing:'0.06em' }}>
            ⚖️ COMPARISON · {article.publishDate.toUpperCase()}
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:800, fontSize:'clamp(20px,3.5vw,32px)', color:C.txt, margin:'0 0 12px', lineHeight:1.15, letterSpacing:'-0.02em' }}>
            {article.title}
          </h1>
          <div style={{ display:'flex', gap:16, fontSize:13, color:C.mut2, flexWrap:'wrap' as const }}>
            <span>By {SITE_CONFIG.authorName}</span>
            <span>Updated {article.publishDate}</span>
            <span style={{ color:C.acc2, fontWeight:500 }}>✓ Independently reviewed</span>
          </div>
        </div>

        {/* Intro box */}
        <div style={{ background:C.surf, borderRadius:12, border:`1px solid ${C.accBrd}`, padding:'20px 24px', marginBottom:20, borderLeft:`3px solid ${C.acc}` }}>
          {renderContent(article.intro)}
        </div>

        {/* Comparison table */}
        <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, margin:'0 0 12px', letterSpacing:'-0.01em' }}>At a glance</h2>
        <div style={{ overflowX:'auto' as const, marginBottom:28, background:C.surf, borderRadius:12, border:`1px solid ${C.brd}` }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:C.surf2, borderBottom:`1px solid ${C.brd2}` }}>
                {['Tool','Price/mo','Free plan','AI content','Platforms','Best for'].map(h => (
                  <th key={h} style={{ textAlign:'left' as const, padding:'11px 14px', fontSize:11, fontWeight:600, color:C.mut2, letterSpacing:'0.07em', textTransform:'uppercase' as const, whiteSpace:'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {article.comparisonTable.map((row, i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${C.brd}`, background:row.ourPick?C.accCard:'transparent' }}>
                  <td style={{ padding:'12px 14px', fontWeight:row.ourPick?600:400, color:row.ourPick?C.acc:C.txt }}>
                    {row.name}{row.ourPick&&<span style={{ marginLeft:6, background:C.acc, color:C.bg, borderRadius:5, fontSize:9, padding:'2px 6px', fontWeight:700 }}>our pick</span>}
                  </td>
                  <td style={{ padding:'12px 14px', color:C.mut }}>{row.price}</td>
                  <td style={{ padding:'12px 14px' }}>{row.freeplan?<Check size={13} color={C.acc2}/>:<X size={13} color="#f87171"/>}</td>
                  <td style={{ padding:'12px 14px', color:C.mut, fontSize:12 }}>{row.aiContent}</td>
                  <td style={{ padding:'12px 14px', color:C.mut, fontSize:12 }}>{row.platforms}</td>
                  <td style={{ padding:'12px 14px', color:C.mut, fontSize:12 }}>{row.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sections */}
        {article.sections.map((sec, i) => (
          <section key={i} style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, margin:'0 0 14px', letterSpacing:'-0.01em', borderLeft:`3px solid ${C.acc}`, paddingLeft:14 }}>
              {sec.heading}
            </h2>
            {renderContent(sec.content)}
          </section>
        ))}

        {/* Verdict */}
        <div style={{ background:C.greenCard, border:`1px solid ${C.greenBrd}`, borderRadius:12, padding:'20px 24px', marginBottom:20 }}>
          <div style={{ fontWeight:600, fontSize:12, color:C.acc2, marginBottom:8, textTransform:'uppercase' as const, letterSpacing:'0.08em' }}>⚖️ Our verdict</div>
          {renderContent(article.verdict)}
        </div>

        {/* Winner CTA */}
        <div style={{ background:C.surf, border:`1px solid ${C.accBrd}`, borderRadius:14, padding:'28px', textAlign:'center' as const }}>
          <div style={{ fontSize:24, marginBottom:8 }}>🏆</div>
          <div style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, marginBottom:6 }}>
            Winner: {article.winnerName}
          </div>
          <div style={{ fontSize:14, color:C.mut, marginBottom:20 }}>Best for solo creators & small businesses. Try free, no credit card required.</div>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' as const }}>
            <a href={article.winnerAffiliateLink} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.acc, color:C.bg, padding:'12px 24px', borderRadius:9, fontWeight:600, fontSize:14, textDecoration:'none' }}>
              {article.winnerAffiliateText} <ExternalLink size={13} />
            </a>
            <button onClick={() => { navigate(`/tools/${article.winnerSlug}`); window.scrollTo(0,0); }}
              style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:`1.5px solid ${C.accBrd}`, color:C.acc, padding:'12px 20px', borderRadius:9, fontWeight:500, fontSize:14, cursor:'pointer' }}>
              Full review <ChevronRight size={13} />
            </button>
          </div>
          <div style={{ fontSize:11, color:C.mut2, marginTop:10 }}>
            Affiliate link — we earn a commission at no extra cost to you.{' '}
            <span style={{ cursor:'pointer', textDecoration:'underline' }} onClick={() => navigate('/disclosure')}>Disclosure</span>
          </div>
        </div>
      </main>
    </div>
  );
}
