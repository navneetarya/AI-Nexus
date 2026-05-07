import React, { useState, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { DisclosurePage } from './pages/DisclosurePage';
import { CompareArticlePage, COMPARE_ARTICLES } from './pages/CompareArticlePage';
import { MethodologyPage } from './pages/MethodologyPage';
// Week 3: Blog infrastructure
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { BLOG_POSTS } from './blog/index';
// Week 5: Best free AI tools landing page
import { BestFreeAIToolsPage } from './pages/BestFreeAIToolsPage';

function updateMeta(title: string, description: string, canonical: string) {
  document.title = title;
  const setMeta = (sel: string, val: string) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute('content', val);
  };
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonical);
  const canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonical);
}

function getInitialTheme(): 'light' | 'dark' | 'system' {
  const saved = localStorage.getItem('ainexus-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return 'dark'; // default to dark
}

function App() {
  // Normalize pathname: strip trailing slash except on root "/"
  const normalizePath = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);

  const [path, setPath] = useState(normalizePath(window.location.pathname));
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(getInitialTheme);

  // Derive isDark for passing to pages
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && systemDark);

  // Apply data-theme attribute whenever theme changes
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'system') {
      html.removeAttribute('data-theme');
      localStorage.removeItem('ainexus-theme');
    } else {
      html.setAttribute('data-theme', theme);
      localStorage.setItem('ainexus-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  };

  useEffect(() => {
    const onPop = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(normalizePath(to));
    window.scrollTo(0, 0);
  };

  const themeProps = { isDark, toggleTheme };

  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        // Title kept to ≤60 chars: "[Tool Name] Review 2026 — Personally Tested | AI Nexus"
        `${tool.name} Review 2026 — Personally Tested | AI Nexus`,
        `Honest ${tool.name} review by ${SITE_CONFIG.authorName}. ${tool.tagline}. Pros, cons, free plan breakdown — personally tested.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}/`
      );
      return <ToolPage tool={tool} navigate={navigate} {...themeProps} />;
    }
  }

  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (compareMatch) {
    const article = COMPARE_ARTICLES.find(a => a.slug === compareMatch[1]);
    if (article) {
      // H7 (SEO-High): seoTitle is the shorter ≤60-char <title> tag string;
      // falls back to the full title if seoTitle is not defined.
      updateMeta(
        `${article.seoTitle ?? article.title} | AI Nexus`,
        article.metaDescription,
        `${SITE_CONFIG.siteUrl}/compare/${article.slug}/`
      );
      return <CompareArticlePage article={article} navigate={navigate} {...themeProps} />;
    }
  }

  // ── Week 3: Blog post pages (/blog/:slug) ───────────────────────────────────
  const blogPostMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogPostMatch) {
    const post = BLOG_POSTS.find(p => p.slug === blogPostMatch[1]);
    if (post) {
      updateMeta(
        `${post.seoTitle ?? post.title} | AI Nexus`,
        post.metaDescription,
        `${SITE_CONFIG.siteUrl}/blog/${post.slug}/`
      );
      return <BlogPostPage post={post} navigate={navigate} {...themeProps} />;
    }
  }

  // ── Week 3: Blog list page (/blog) ──────────────────────────────────────────
  if (path === '/blog') {
    updateMeta(
      `AI Tools Blog — Guides & Reviews | AI Nexus by ${SITE_CONFIG.authorName}`,
      `In-depth AI tool guides and reviews by ${SITE_CONFIG.authorName}. Personally tested. No sponsored posts.`,
      `${SITE_CONFIG.siteUrl}/blog/`
    );
    return <BlogPage navigate={navigate} {...themeProps} />;
  }

  if (path === '/about') {
    updateMeta(
      `About ${SITE_CONFIG.authorName} — The Person Behind AI Nexus`,
      `${SITE_CONFIG.authorName} personally tests every AI tool before recommending it. No sponsored reviews. Testing since 2022 across writing, audio, video, and productivity.`,
      `${SITE_CONFIG.siteUrl}/about/`
    );
    return <AboutPage navigate={navigate} {...themeProps} />;
  }

  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. I earn a commission if you purchase through my links, at no extra cost to you.',
      `${SITE_CONFIG.siteUrl}/disclosure/`
    );
    return <DisclosurePage navigate={navigate} {...themeProps} />;
  }

  if (path === '/methodology') {
    updateMeta(
      'How I Review AI Tools — Testing Methodology | AI Nexus',
      `The 7-step process ${SITE_CONFIG.authorName} uses to test every AI tool on AI Nexus. Real standards, paid plan testing, head-to-head comparisons, and honest verdicts.`,
      `${SITE_CONFIG.siteUrl}/methodology/`
    );
    return <MethodologyPage navigate={navigate} {...themeProps} />;
  }

  // ── Week 5: Best free AI tools landing page (/best-free-ai-tools) ───────────
  if (path === '/best-free-ai-tools') {
    updateMeta(
      `Best Free AI Tools 2026 — Tested & Ranked | AI Nexus`,
      `13 AI tools with permanent free plans — personally tested. Writing, image generation, video, audio, design, coding, and productivity. No credit card required.`,
      `${SITE_CONFIG.siteUrl}/best-free-ai-tools/`
    );
    return <BestFreeAIToolsPage navigate={navigate} {...themeProps} />;
  }

  updateMeta(
    // Title ≤60 chars
    `Best AI Tools 2026 — Tested & Ranked | AI Nexus`,
    `Honest reviews of the best AI tools for writing, video, audio, podcasting, and productivity. Every tool personally tested by ${SITE_CONFIG.authorName}. Free trials only.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} {...themeProps} />;
}

export default App;
