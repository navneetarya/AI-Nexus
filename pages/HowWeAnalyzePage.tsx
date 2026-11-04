import React from 'react';
import { SharedNav } from './SharedNav';

const C = {
  bg:'var(--bg)', surf:'var(--surf)', a1:'var(--a1)', a2:'var(--a2)',
  txt:'var(--txt)', mut:'var(--mut)', mut2:'var(--mut2)',
  a1card:'var(--a1-card)', a1brd:'var(--a1-brd)',
  barBg:'var(--bar-bg)', barBrd:'var(--bar-brd)',
};

export function HowWeAnalyzePage({ navigate, isDark, toggleTheme }: { navigate: (to: string) => void; isDark: boolean; toggleTheme: () => void }) {

  const steps = [
    {
      position: 1,
      name: "Official Documentation Review",
      text: "The tool's official docs, changelog, and API reference are read before any claim is written. No assumptions from marketing pages.",
      detail: "This means reading the actual feature documentation — not the homepage or pricing page alone. We check what features exist at each tier, what the API limits are, and what changed in recent versions."
    },
    {
      position: 2,
      name: "Free Plan Verification",
      text: "Every tool's free tier is checked against what it advertises, using official documentation, pricing pages, and published user reports. Limitations, watermarks, export restrictions, and rate limits are all documented.",
      detail: "Many tools advertise 'free forever' but hide critical limitations. We document exactly what you can and cannot do on the free plan so readers can make an informed decision before signing up."
    },
    {
      position: 3,
      name: "Published User Review Analysis",
      text: "We read published user reviews from Trustpilot, G2, Capterra, and Reddit where they exist. We look for patterns in complaints and praise — not just star averages.",
      detail: "A 4.2/5 rating tells you little. We read review text to find recurring complaints, praise patterns, and use-case fit. Review volume differs by tool, so no fixed review count is promised."
    },
    {
      position: 4,
      name: "Reddit Sentiment Analysis",
      text: "Real conversations in r/artificial, r/ChatGPT, r/MachineLearning and tool-specific subreddits reveal pain points that polished review sites miss.",
      detail: "Reddit users are often blunt. We search for the tool name across relevant subreddits and note what users say — including workarounds, deal-breakers, and hidden gems. Community posts are anecdotal, so they are checked against documentation."
    },
    {
      position: 5,
      name: "Live Pricing Verification",
      text: "All pricing is verified against the live pricing page on the day of publication. INR pricing is verified separately for Indian audience articles.",
      detail: "AI tool pricing changes frequently. We check the live pricing page and note when pricing was last verified at the top of every review."
    },
    {
      position: 6,
      name: "Competitor Comparison",
      text: "Every tool is compared against its closest competitors using the same criteria: features, pricing, limitations, and target use case.",
      detail: "We never recommend a tool in isolation. Every review includes a comparison table or section that shows how the tool stacks up against its closest alternatives."
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="methodology" />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 28px 80px' }}>
        <button
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.mut, cursor: 'pointer', fontSize: 13, marginBottom: 32, padding: 0 }}
        >
          ← Back to home
        </button>

        <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.2 }}>
          How We Analyze AI Tools
        </h1>
        <p style={{ color: C.mut, fontSize: 14, marginBottom: 16 }}>
          Last updated: November 3, 2026 · <span style={{ color: C.a1 }}>AI Nexus</span>
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.75, color: C.mut, marginBottom: 40 }}>
          Every AI tool reviewed on AI Nexus goes through a consistent 6-step research process. Here's exactly what that looks like.
        </p>

        {steps.map((step) => (
          <div key={step.position} style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: '50%',
                background: C.a1card, border: `1px solid ${C.a1brd}`,
                color: C.a1, fontSize: 12, fontWeight: 700, flexShrink: 0
              }}>
                {step.position}
              </span>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.txt, margin: 0 }}>{step.name}</h2>
            </div>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: C.mut, marginBottom: 8, marginLeft: 40 }}>{step.text}</p>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: C.mut2, marginLeft: 40, fontStyle: 'italic' }}>{step.detail}</p>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: '20px 24px', background: C.surf, borderRadius: 12, border: `1px solid ${C.a1brd}` }}>
          <p style={{ fontSize: 13.5, color: C.mut, margin: '0 0 8px' }}>
            Want to know more about our independence standards?
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
            <button onClick={() => navigate('/editorial-policy/')} style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 13.5, padding: 0, textDecoration: 'underline' }}>
              Editorial Policy
            </button>
            <button onClick={() => navigate('/about/')} style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 13.5, padding: 0, textDecoration: 'underline' }}>
              About Navneet Arya
            </button>
            <button onClick={() => navigate('/methodology/')} style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontSize: 13.5, padding: 0, textDecoration: 'underline' }}>
              Research Methodology
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
