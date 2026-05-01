import React, { useState, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { DisclosurePage } from './pages/DisclosurePage';
import { CompareArticlePage, COMPARE_ARTICLES } from './pages/CompareArticlePage';

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
  return 'system';
}

function App() {
  const [path, setPath] = useState(window.location.pathname);
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
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  const themeProps = { isDark, toggleTheme };

  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        `${tool.name} Review ${new Date().getFullYear()} — Honest Take, Pricing & Free Trial | AI Nexus`,
        `${SITE_CONFIG.authorName}'s honest ${tool.name} review after personal testing. ${tool.tagline}. Real pros, cons, pricing, and who it's best for.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`
      );
      return <ToolPage tool={tool} navigate={navigate} {...themeProps} />;
    }
  }

  const compareMatch = path.match(/^\/compare\/([^/]+)$/);
  if (compareMatch) {
    const article = COMPARE_ARTICLES.find(a => a.slug === compareMatch[1]);
    if (article) {
      updateMeta(
        `${article.title} | AI Nexus`,
        article.metaDescription,
        `${SITE_CONFIG.siteUrl}/compare/${article.slug}`
      );
      return <CompareArticlePage article={article} navigate={navigate} {...themeProps} />;
    }
  }

  if (path === '/about') {
    updateMeta(
      `About ${SITE_CONFIG.authorName} — AI Nexus Reviewer`,
      `${SITE_CONFIG.authorName} personally tests every AI tool before recommending it. No sponsored reviews, no copying marketing pages.`,
      `${SITE_CONFIG.siteUrl}/about`
    );
    return <AboutPage navigate={navigate} {...themeProps} />;
  }

  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. I earn a commission if you purchase through my links, at no extra cost to you.',
      `${SITE_CONFIG.siteUrl}/disclosure`
    );
    return <DisclosurePage navigate={navigate} {...themeProps} />;
  }

  updateMeta(
    `AI Nexus — Best AI Tools Reviewed & Ranked ${new Date().getFullYear()}`,
    `Honest reviews of the best AI tools for writing, video, audio, podcasting, productivity & social media. Every tool personally tested by ${SITE_CONFIG.authorName}. Every link is a free trial.`,
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} {...themeProps} />;
}

export default App;
