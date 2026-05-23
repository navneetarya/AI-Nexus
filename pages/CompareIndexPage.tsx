import React from 'react';
import { Scale } from 'lucide-react';
import { SharedNav } from './SharedNav';
import { COMPARE_ARTICLES } from './compare-data';

const C = {
  bg:     'var(--bg)',
  surf:   'var(--surf)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  mut2:   'var(--mut2)',
  a1:     'var(--a1)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
  brd:    'var(--brd)',
};

interface CompareIndexPageProps {
  navigate:    (to: string) => void;
  isDark:      boolean;
  toggleTheme: () => void;
}

export function CompareIndexPage({ navigate, isDark, toggleTheme }: CompareIndexPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', system-ui, sans-serif", color: C.txt }}>
      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="compare" />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 40, textAlign: 'center' as const }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: C.a1card, border: `1px solid ${C.a1brd}`,
            borderRadius: 100, padding: '5px 14px', marginBottom: 16,
          }}>
            <Scale size={12} color={C.a1} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.a1, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>
              Side-by-side comparisons
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Inter', sans-serif", fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 800, color: C.txt, margin: '0 0 12px', lineHeight: 1.15,
          }}>
            AI Tool Comparisons
          </h1>

          <p style={{ fontSize: 16, color: C.mut, maxWidth: 540, margin: '0 auto', lineHeight: 1.65 }}>
            {COMPARE_ARTICLES.length} side-by-side comparisons independently researched by Navneet Arya.
            No sponsored opinions. No affiliate bias.
          </p>
        </div>

        {/* Card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: 20,
        }}>
          {COMPARE_ARTICLES.map(article => (
            <article
              key={article.slug}
              onClick={() => navigate(`/compare/${article.slug}`)}
              style={{
                background: C.surf,
                border: `1px solid ${C.brd}`,
                borderRadius: 16,
                padding: '22px 24px',
                cursor: 'pointer',
                transition: 'transform .15s ease, box-shadow .15s ease, border-color .15s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-2px)';
                el.style.boxShadow = '0 8px 32px rgba(13,148,136,.10)';
                el.style.borderColor = C.a1brd;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
                el.style.borderColor = C.brd;
              }}
            >
              {/* Meta row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Scale size={12} color={C.a1} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.a1, letterSpacing: '0.05em' }}>
                  {article.publishDate}
                </span>
                <span style={{ fontSize: 11, color: C.mut2, marginLeft: 'auto' }}>
                  Winner: {article.winnerName}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 700,
                color: C.txt, lineHeight: 1.3, margin: '0 0 8px',
              }}>
                {article.title}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 13, color: C.mut, lineHeight: 1.55, margin: '0 0 16px' }}>
                {article.metaDescription}
              </p>

              {/* CTA */}
              <span style={{ fontSize: 13, color: C.a1, fontWeight: 600 }}>
                Read comparison →
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
