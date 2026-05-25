import React from 'react';
import { SITE_CONFIG } from '../constants';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function EditorialPolicyPage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Editorial Policy — AI Nexus",
    "url": `${SITE_CONFIG.siteUrl}/editorial-policy/`,
    "description": "AI Nexus editorial standards: independent research, no sponsored reviews, verified pricing, and transparent methodology.",
    "dateModified": "2026-05-25",
    "author": {
      "@type": "Person",
      "@id": `${SITE_CONFIG.siteUrl}/about#author`,
      "name": SITE_CONFIG.authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI Nexus",
      "url": SITE_CONFIG.siteUrl
    },
    "about": {
      "@type": "Thing",
      "name": "AI Tools Research Editorial Standards"
    }
  };

  const sections = [
    {
      title: "Independence — No Sponsored Reviews",
      body: `Every review and comparison on AI Nexus is written independently. No tool company pays for inclusion, favourable coverage, or ranking position. If a review includes affiliate links (disclosed at the top of the page), those links do not influence the verdict, the rating, or the ranking. Tools are included because they serve the reader's interests — not because of commercial relationships.`
    },
    {
      title: "Research Standards",
      body: `Every tool is researched using the same 6-step process: official documentation review, free plan verification, analysis of 200+ verified user reviews from Trustpilot, G2, and Capterra, Reddit sentiment analysis, live pricing verification, and competitor benchmarking. Tools are never recommended based solely on their marketing materials.`
    },
    {
      title: "Pricing Accuracy",
      body: `All pricing is verified against the tool's live pricing page at the time of publication. Reviews are updated when tools change their pricing or features. The "last verified" date at the top of each review reflects when pricing was last confirmed. INR pricing for Indian readers is included where the tool has local pricing — otherwise the USD price plus typical GST estimate is shown.`
    },
    {
      title: "Affiliate Disclosure",
      body: `Some pages include affiliate links. When you click an affiliate link and make a purchase, AI Nexus may receive a commission at no extra cost to you. Affiliate relationships are disclosed at the top of every page where they exist. Affiliate status never influences tool selection, ranking, or the content of a review. See the full Disclosure page for details.`
    },
    {
      title: "Correction Policy",
      body: `If a review contains an inaccuracy, reach out via the contact details on the About page. Verified corrections are applied within 48 hours and the update is noted in the review with a date. Pricing corrections are applied immediately upon verification.`
    },
    {
      title: "Author Expertise",
      body: `AI Nexus is run by Navneet Arya, an AI Automation & Performance Testing professional since 2022. Research is based on official documentation, verified reviews, and public usage data — not fabricated testing or sponsored data. Where hands-on research has been conducted, it is noted explicitly. Where research is documentation and review-based, that is also stated.`
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>

        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.mut, cursor: 'pointer', fontSize: 13, marginBottom: 32, padding: 0 }}
        >
          ← Back to home
        </button>

        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
          Editorial Policy
        </h1>
        <p style={{ color: C.mut, fontSize: 14, marginBottom: 40 }}>
          Last updated: May 25, 2026 · <span style={{ color: C.a1 }}>AI Nexus</span>
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.75, color: C.mut, marginBottom: 40 }}>
          AI Nexus publishes independent AI tool research and comparisons. This page explains how content is created, what standards apply, and how commercial relationships are handled.
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 10 }}>{s.title}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.mut }}>{s.body}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: '20px 24px', background: C.surf, borderRadius: 12, border: `1px solid ${C.a1brd}` }}>
          <p style={{ fontSize: 13.5, color: C.mut, margin: 0 }}>
            Questions about this editorial policy?{' '}
            <button onClick={() => navigate('/about/')} style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 13.5, padding: 0, textDecoration: 'underline' }}>
              Visit the About page
            </button>{' '}
            to get in touch with Navneet Arya directly.
          </p>
        </div>

      </div>
    </div>
  );
}
