import React from 'react';
import { ArrowLeft, CheckCircle, Mail, Zap } from 'lucide-react';
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

export function AboutPage({ navigate }: { navigate:(to:string)=>void }) {
  const authorSchema = {
    "@context":"https://schema.org","@type":"Person",
    "name": SITE_CONFIG.authorName,
    "url":`${SITE_CONFIG.siteUrl}/about`,
    "email": SITE_CONFIG.email,
    "description": SITE_CONFIG.authorBio,
    "knowsAbout":["Artificial Intelligence","AI Writing Tools","Podcast Software","Productivity Software","Social Media Automation","AI Image Generation","AI Coding Tools","Content Creation"],
    "worksFor":{"@type":"Organization","name":"AI Nexus","url":SITE_CONFIG.siteUrl},
    "hasCredential":{"@type":"EducationalOccupationalCredential","description":"2+ years personally testing and reviewing AI tools across 8 categories"},
    "sameAs":[SITE_CONFIG.twitterUrl]
  };

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'IBM Plex Sans', sans-serif", color:C.txt }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html:JSON.stringify(authorSchema) }} />

      <nav style={{ position:'sticky', top:0, zIndex:100, background:C.barBg, backdropFilter:'blur(20px)', borderBottom:`1px solid ${C.barBrd}`, padding:'0 24px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:6, color:C.mut, fontSize:13, fontWeight:500, background:'none', border:'none', cursor:'pointer' }}>
            <ArrowLeft size={13} /> All tools
          </button>
          <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div style={{ width:24, height:24, borderRadius:5, background:C.acc, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={12} color="#0E0C0B" fill="#0E0C0B" />
            </div>
            <span style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:16, color:C.txt }}>AI Nexus</span>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'40px 24px 80px' }}>

        {/* Author hero */}
        <div style={{ background:C.surf, borderRadius:16, border:`1px solid ${C.accBrd}`, padding:'36px', marginBottom:12, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:C.acc }} />
          <div style={{ position:'absolute', top:-80, right:-60, width:280, height:280, borderRadius:'50%', background:`radial-gradient(circle,rgba(233,169,58,0.06) 0%,transparent 70%)`, pointerEvents:'none' }} />

          <div style={{ position:'relative' }}>
            <span style={{ display:'inline-block', background:C.accCard, border:`1px solid ${C.accBrd}`, color:C.acc, fontSize:11, fontWeight:600, letterSpacing:'0.1em', padding:'4px 12px', borderRadius:100, marginBottom:20 }}>
              ABOUT THE REVIEWER
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:20 }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:C.acc, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.bg, flexShrink:0 }}>NA</div>
              <div>
                <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:'clamp(22px,4vw,30px)', color:C.txt, margin:'0 0 4px', letterSpacing:'-0.02em' }}>
                  {SITE_CONFIG.authorName}
                </h1>
                <div style={{ fontSize:13, color:C.mut2 }}>Founder, AI Nexus · {SITE_CONFIG.authorExperience}</div>
              </div>
            </div>

            <p style={{ fontSize:15, color:C.mut, lineHeight:1.8, fontWeight:300, marginBottom:14 }}>
              {SITE_CONFIG.authorBio}
            </p>
            <p style={{ fontSize:15, color:C.mut, lineHeight:1.8, fontWeight:300, marginBottom:14 }}>
              I built AI Nexus because every "best AI tools" article I found was clearly written by someone who had never actually opened the products. Review sites were copying marketing pages and calling it a review. I got frustrated and decided to build something where every single review comes from real, personal usage.
            </p>
            <p style={{ fontSize:15, color:C.mut, lineHeight:1.8, fontWeight:300 }}>
              Every tool on this site has been signed up for, tested on real work tasks, and used for at least 2–4 weeks before I write about it. I focus on what works for <strong style={{ color:C.txt, fontWeight:500 }}>solo creators, freelancers, and small teams</strong> — not enterprise buyers with unlimited budgets.
            </p>

            <div style={{ display:'flex', gap:8, marginTop:20, flexWrap:'wrap' as const }}>
              <a href={`mailto:${SITE_CONFIG.email}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:500, color:C.acc, padding:'7px 16px', border:`1.5px solid ${C.accBrd}`, borderRadius:100, background:C.accCard, textDecoration:'none' }}>
                <Mail size={12} /> {SITE_CONFIG.email}
              </a>
            </div>
          </div>
        </div>

        {/* Categories tested */}
        <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.brd}`, padding:'24px 26px', marginBottom:12 }}>
          <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, margin:'0 0 4px', letterSpacing:'-0.01em' }}>What I've actually tested</h2>
          <p style={{ fontSize:13, color:C.mut2, margin:'0 0 18px' }}>Updated {new Date().toLocaleDateString('en',{month:'long',year:'numeric'})}</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:8 }}>
            {[
              ['✍️ Writing tools','12+ tools tested','#a78bfa'],['🎨 AI image tools','8+ tools tested','#f472b6'],
              ['🎬 Video AI tools','7+ tools tested','#60a5fa'],['🎙️ Podcast & audio','6+ tools tested','#34d399'],
              ['🚀 Productivity apps','9+ tools tested','#4ade80'],['📣 Marketing tools','5+ tools tested','#fb923c'],
              ['💻 Coding platforms','4+ tools tested','#f87171'],['✦ Design tools','6+ tools tested','#c084fc'],
            ].map(([cat,count,color],i) => (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background:color+'12', border:`1px solid ${color}22` }}>
                <div style={{ fontSize:13, fontWeight:500, color:C.txt, marginBottom:2 }}>{cat}</div>
                <div style={{ fontSize:11, color:color as string, fontWeight:600 }}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Review process */}
        <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.brd}`, padding:'24px 26px', marginBottom:12 }}>
          <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:20, color:C.txt, margin:'0 0 18px', letterSpacing:'-0.01em' }}>How every review is done</h2>
          {[
            ['1. Sign up on the free plan','Every tool is tested starting from the free tier — because that\'s where most creators start. If the free plan is terrible, I say so.'],
            ['2. Use it for real tasks','Not demo tasks. Real work: writing actual blog posts, editing actual podcast audio, creating actual social media captions, building actual code projects.'],
            ['3. Test for at least 2–4 weeks','First impressions are almost always wrong. Tools need time to reveal their real strengths and their real weaknesses.'],
            ['4. Document what breaks or frustrates','The "cons" sections are where most review sites fail. I specifically push tools to their limits and document what frustrates me.'],
            ['5. Compare against direct competitors','I run the same task on 2–3 competing tools. The comparison tables on each review page come from actual side-by-side testing.'],
            ['6. Check the affiliate program separately','I evaluate the tool first, then check if it has an affiliate program. The review is never shaped by whether I earn commission.'],
          ].map(([title,desc],i) => (
            <div key={i} style={{ display:'flex', gap:12, marginBottom:16, alignItems:'flex-start' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:C.accCard, border:`1px solid ${C.accBrd}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                <CheckCircle size={13} color={C.acc} />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:14, color:C.txt, marginBottom:3 }}>{title}</div>
                <div style={{ fontSize:13, color:C.mut, lineHeight:1.65, fontWeight:300 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate transparency */}
        <div style={{ background:C.accCard, borderRadius:12, border:`1.5px solid ${C.accBrd}`, padding:'20px 24px', marginBottom:12 }}>
          <div style={{ fontWeight:600, fontSize:12, color:C.acc, letterSpacing:'0.08em', textTransform:'uppercase' as const, marginBottom:10 }}>
            Full transparency on how this site earns money
          </div>
          <p style={{ fontSize:14, color:C.mut, lineHeight:1.75, fontWeight:300, marginBottom:10 }}>
            This site earns money through affiliate commissions. When you click a link and sign up for a paid plan, I earn a commission — typically 20–30% of the subscription payment, recurring. This does not affect my reviews.
          </p>
          <p style={{ fontSize:14, color:C.mut, lineHeight:1.75, fontWeight:300 }}>
            I only list tools that I have personally tested and would recommend to a friend. I have turned down sponsorships from tools that I don't think are worth recommending.{' '}
            <a href="/disclosure" onClick={e => { e.preventDefault(); navigate('/disclosure'); }} style={{ color:C.acc, fontWeight:500 }}>Read the full affiliate disclosure →</a>
          </p>
        </div>

        {/* Contact */}
        <div style={{ background:C.surf, borderRadius:14, border:`1px solid ${C.brd}`, padding:'24px 28px', textAlign:'center' as const }}>
          <h2 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:18, color:C.txt, marginBottom:8, letterSpacing:'-0.01em' }}>Get in touch</h2>
          <p style={{ fontSize:14, color:C.mut, lineHeight:1.65, marginBottom:18, maxWidth:420, marginLeft:'auto', marginRight:'auto' }}>
            Question about a tool I've reviewed, a suggestion, or want to flag something inaccurate — email me.
          </p>
          <a href={`mailto:${SITE_CONFIG.email}`}
            style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.acc, color:C.bg, borderRadius:9, padding:'11px 22px', fontSize:14, fontWeight:600, textDecoration:'none' }}>
            <Mail size={13} /> {SITE_CONFIG.email}
          </a>
        </div>
      </div>
    </div>
  );
}
