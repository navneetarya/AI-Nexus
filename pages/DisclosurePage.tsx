import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { SITE_CONFIG } from '../constants';

const C = {
  bg:'#0E0C0B', surf:'#161412', txt:'#F0EBE3', mut:'rgba(240,235,227,0.58)', mut2:'rgba(240,235,227,0.30)',
  acc:'#E9A93A', accCard:'rgba(233,169,58,0.07)', accBrd:'rgba(233,169,58,0.18)',
  brd:'rgba(240,235,227,0.08)', barBg:'rgba(14,12,11,0.97)', barBrd:'rgba(240,235,227,0.08)',
};

export function DisclosurePage({ navigate }: { navigate:(to:string)=>void }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'IBM Plex Sans', sans-serif", color:C.txt }}>
      <nav style={{ position:'sticky', top:0, zIndex:100, background:C.barBg, backdropFilter:'blur(20px)', borderBottom:`1px solid ${C.barBrd}`, padding:'0 24px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:6, color:C.mut, fontSize:13, background:'none', border:'none', cursor:'pointer' }}>
            <ArrowLeft size={13} /> Home
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
        <div style={{ background:C.surf, borderRadius:16, border:`1px solid ${C.accBrd}`, padding:'36px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:C.acc }} />
          <div style={{ position:'relative' }}>
            <span style={{ display:'inline-block', background:C.accCard, border:`1px solid ${C.accBrd}`, color:C.acc, fontSize:11, fontWeight:600, letterSpacing:'0.1em', padding:'4px 12px', borderRadius:100, marginBottom:20 }}>LEGAL</span>
            <h1 style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontSize:32, color:C.txt, margin:'0 0 8px', letterSpacing:'-0.02em' }}>Affiliate Disclosure</h1>
            <p style={{ fontSize:12, color:C.mut2, marginBottom:28 }}>Last updated: {new Date().toLocaleDateString('en',{year:'numeric',month:'long',day:'numeric'})}</p>

            {[
              ['What are affiliate links?',`Some links on this website are affiliate links. This means that if you click a link and make a purchase or sign up for a paid plan, AI Nexus may earn a commission. This comes at no additional cost to you — the price you pay is identical whether you use our link or go directly to the tool's website.`],
              ['Does this affect our reviews?',`No. Tools are reviewed based on personal testing and honest assessment. We have written critical reviews of tools that have affiliate programs, and positive reviews of tools where we earn no commission at all. The affiliate relationship does not influence the content of any review on this site.`],
              ['Which tools have affiliate links?',`All tools listed on this site have direct affiliate programs. Every tool card and tool page that contains an affiliate link clearly states "Affiliate link" in the fine print. We only list tools that we have personally tested and would recommend to a colleague.`],
              ['Who runs this site?',`AI Nexus is run by ${SITE_CONFIG.authorName}. Every review is personally written based on real usage. There are no paid placements, sponsored reviews, or pay-to-rank arrangements on this site.`],
              ['FTC compliance',`This disclosure complies with the Federal Trade Commission (FTC) guidelines on endorsements and testimonials (16 CFR Part 255). Material connections between AI Nexus and the companies whose products are reviewed are disclosed on every page where affiliate links appear.`],
              ['Contact',`If you have any questions about our affiliate relationships or review methodology, contact us at ${SITE_CONFIG.email}`],
            ].map(([heading,body],i) => (
              <div key={i} style={{ marginBottom:24, paddingBottom:24, borderBottom: i < 5 ? `1px solid ${C.brd}` : 'none' }}>
                <h2 style={{ fontWeight:600, fontSize:16, color:C.txt, margin:'0 0 8px' }}>{heading}</h2>
                <p style={{ fontSize:14, color:C.mut, lineHeight:1.8, fontWeight:300, margin:0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
