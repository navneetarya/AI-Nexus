// pages/BlogPage.tsx
import React from 'react';
import { SharedNav } from './SharedNav';
import { BLOG_POSTS, BlogPost } from '../blog/index';
import { SITE_CONFIG } from '../constants';

interface BlogPageProps {
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

function CategoryPill({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 11px',
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.06em',
      textTransform: 'uppercase' as const,
      background: C.a1card,
      color: C.a1,
      border: `1px solid ${C.a1brd}`,
    }}>
      {label}
    </span>
  );
}

function PostCard({ post, navigate }: { post: BlogPost; navigate: (to: string) => void }) {
  return (
    <article
      onClick={() => navigate(`/blog/${post.slug}`)}
      style={{
        background: C.surf,
        border: `1px solid ${C.brd}`,
        borderRadius: 16,
        padding: '24px 28px',
        cursor: 'pointer',
        transition: 'transform .15s ease, box-shadow .15s ease',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px var(--sh-md)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <CategoryPill label={post.category} />
        <span style={{ fontSize: 12, color: C.mut2 }}>{post.readTime}</span>
      </div>

      <h2 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: 18,
        fontWeight: 800,
        color: C.txt,
        lineHeight: 1.3,
        margin: 0,
      }}>
        {post.title}
      </h2>

      <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.6, margin: 0 }}>
        {post.excerpt}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        <span style={{ fontSize: 12, color: C.mut2 }}>
          {post.author} · {new Date(post.datePublished).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span style={{ fontSize: 13, color: C.a1, fontWeight: 600 }}>
          Read →
        </span>
      </div>
    </article>
  );
}

export function BlogPage({ navigate, isDark, toggleTheme }: BlogPageProps) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <SharedNav
        navigate={navigate}
        isDark={isDark}
        toggleTheme={toggleTheme}
        activePage="blog"
      />

      {/* Hero — always dark bg regardless of theme (--dark flips to light in dark mode) */}
      <div style={{
        background: '#0A1512',
        padding: '48px 20px 52px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(13,148,136,.22) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(20,184,166,.08) 0%, transparent 60%)',
        }} />
        <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(13,148,136,.15)',
            border: '1px solid rgba(13,148,136,.3)',
            color: '#5eead4',
            fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100,
            marginBottom: 20,
          }}>
            📝 AI Nexus Blog
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 14,
            lineHeight: 1.15,
          }}>
            AI Tools Guides &amp; Reviews
          </h1>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 16, maxWidth: 480 }}>
            In-depth guides written by {SITE_CONFIG.authorName} after personally testing every tool mentioned.
          </p>
        </div>
      </div>

      {/* Post grid */}
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '48px 20px 80px' }}>
        {BLOG_POSTS.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: C.mut, margin: 0 }}>
              <strong style={{ color: C.txt }}>{BLOG_POSTS.length}</strong> guides published
            </p>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const,
              color: C.a1, background: C.a1card, border: `1px solid ${C.a1brd}`,
              padding: '4px 10px', borderRadius: 100,
            }}>All guides</span>
          </div>
        )}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {BLOG_POSTS.map(post => (
            <PostCard key={post.slug} post={post} navigate={navigate} />
          ))}
        </div>

        {BLOG_POSTS.length === 0 && (
          <p style={{ color: C.mut, textAlign: 'center', padding: '60px 0' }}>
            No posts yet — check back soon.
          </p>
        )}
      </div>

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
