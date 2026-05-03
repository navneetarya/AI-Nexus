// pages/BlogPostPage.tsx
import React, { useEffect } from 'react';
import { SharedNav } from './SharedNav';
import { BlogPost } from '../blog/index';
import { SITE_CONFIG } from '../constants';

interface BlogPostPageProps {
  post:        BlogPost;
  navigate:    (to: string) => void;
  isDark:      boolean;
  toggleTheme: () => void;
}

const C = {
  bg:   'var(--bg)',
  surf: 'var(--surf)',
  txt:  'var(--txt)',
  mut:  'var(--mut)',
  mut2: 'var(--mut2)',
  a1:   'var(--a1)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  brd:  'var(--brd)',
};

export function BlogPostPage({ post, navigate, isDark, toggleTheme }: BlogPostPageProps) {
  // Inject Article + FAQPage JSON-LD schema into <head>
  useEffect(() => {
    const canonical = `${SITE_CONFIG.siteUrl}/blog/${post.slug}`;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.metaDescription,
      url: canonical,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: {
        '@type': 'Person',
        name: post.author,
        url: `${SITE_CONFIG.siteUrl}/about`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'AI Nexus',
        url: SITE_CONFIG.siteUrl,
      },
      inLanguage: 'en-US',
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    };

    const faqSchema = post.faqs.length > 0 ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    } : null;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'AI Nexus', item: SITE_CONFIG.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_CONFIG.siteUrl}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
      ],
    };

    const schemas = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

    // Remove any previously injected blog schemas
    document.querySelectorAll('script[data-blog-schema]').forEach(el => el.remove());

    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-blog-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-blog-schema]').forEach(el => el.remove());
    };
  }, [post]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <SharedNav
        navigate={navigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
        activePage="blog"
      />

      <article style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: C.mut2, marginBottom: 28,
        }}>
          <span
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', color: C.a1 }}
          >
            AI Nexus
          </span>
          <span>›</span>
          <span
            onClick={() => navigate('/blog')}
            style={{ cursor: 'pointer', color: C.a1 }}
          >
            Blog
          </span>
          <span>›</span>
          <span style={{ color: C.mut }}>{post.category}</span>
        </nav>

        {/* Category + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' as const }}>
          <span style={{
            padding: '3px 12px', borderRadius: 100,
            background: C.a1card, color: C.a1,
            border: `1px solid ${C.a1brd}`,
            fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase' as const,
          }}>
            {post.category}
          </span>
          <span style={{ fontSize: 13, color: C.mut2 }}>{post.readTime}</span>
          <span style={{ fontSize: 13, color: C.mut2 }}>
            Updated {new Date(post.dateModified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 'clamp(26px, 5vw, 38px)',
          fontWeight: 800,
          color: C.txt,
          lineHeight: 1.2,
          marginBottom: 20,
        }}>
          {post.title}
        </h1>

        {/* Author strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: C.surf,
          border: `1px solid ${C.brd}`,
          borderRadius: 12,
          marginBottom: 40,
        }}>
          <img
            src="/author-avatar.png"
            alt={`${post.author} — AI tools reviewer and founder of AI Nexus`}
            width={40} height={40}
            style={{ borderRadius: '50%', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.txt }}>{post.author}</div>
            <div style={{ fontSize: 12, color: C.mut2 }}>
              Published {new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span
              onClick={() => navigate('/methodology')}
              style={{
                fontSize: 12, color: C.a1, cursor: 'pointer',
                padding: '5px 12px', borderRadius: 8,
                background: C.a1card, border: `1px solid ${C.a1brd}`,
                fontWeight: 600,
              }}
            >
              See how I test →
            </span>
          </div>
        </div>

        {/* Article content */}
        <div
          style={{ color: C.txt, lineHeight: 1.75, fontSize: 16 }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* FAQ Section */}
        {post.faqs.length > 0 && (
          <section style={{ marginTop: 56 }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 22, fontWeight: 800,
              color: C.txt, marginBottom: 20,
            }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
              {post.faqs.map(({ q, a }, i) => (
                <div
                  key={i}
                  style={{
                    background: C.surf,
                    border: `1px solid ${C.brd}`,
                    borderRadius: 12,
                    padding: '18px 22px',
                  }}
                >
                  <h3 style={{
                    fontSize: 15, fontWeight: 700,
                    color: C.txt, marginBottom: 8,
                  }}>
                    {q}
                  </h3>
                  <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.65, margin: 0 }}>
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back + explore CTA */}
        <div style={{
          marginTop: 56,
          padding: '24px 28px',
          background: C.surf,
          border: `1px solid ${C.brd}`,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: 14,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 4 }}>
              Explore all AI tool reviews
            </div>
            <div style={{ fontSize: 13, color: C.mut2 }}>
              Every tool personally tested by {SITE_CONFIG.authorName}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => navigate('/blog')}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '9px 18px', borderRadius: 9,
                background: C.a1card, border: `1px solid ${C.a1brd}`,
                color: C.a1, cursor: 'pointer',
              }}
            >
              ← More Posts
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                fontSize: 13, fontWeight: 600,
                padding: '9px 18px', borderRadius: 9,
                background: `linear-gradient(135deg, var(--a1), #0b7a6e)`,
                border: 'none', color: '#fff', cursor: 'pointer',
              }}
            >
              All Tools →
            </button>
          </div>
        </div>

      </article>

      {/* Scoped blog content styles */}
      <style>{`
        .blog-content h2 {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: var(--txt);
          margin: 36px 0 14px;
          line-height: 1.25;
        }
        .blog-content h3 {
          font-family: 'Syne', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--txt);
          margin: 26px 0 10px;
        }
        .blog-content p {
          margin-bottom: 18px;
          color: var(--txt);
        }
        .blog-content ul, .blog-content ol {
          color: var(--txt);
        }
        .blog-content li {
          margin-bottom: 4px;
        }
        .blog-content strong {
          color: var(--txt);
          font-weight: 700;
        }
        .blog-content table {
          border-radius: 10px;
          overflow: hidden;
        }
        .blog-content th {
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--txt);
        }
        .blog-content td {
          color: var(--txt);
        }
      `}</style>

      {/* Footer */}
      <footer style={{
        background: 'var(--footer-bg)',
        padding: '32px 20px',
        textAlign: 'center' as const,
        color: 'rgba(255,255,255,.3)',
        fontSize: 13,
      }}>
        <p>© {new Date().getFullYear()} AI Nexus by {SITE_CONFIG.authorName} ·{' '}
          <span
            onClick={() => navigate('/disclosure')}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'rgba(255,255,255,.4)' }}
          >
            Affiliate Disclosure
          </span>
        </p>
      </footer>
    </div>
  );
}
