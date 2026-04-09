import React, { useState, useEffect } from 'react';
import { TOOLS, SITE_CONFIG } from './constants';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';
import { AboutPage } from './pages/AboutPage';
import { DisclosurePage } from './pages/DisclosurePage';

// Update <head> meta tags dynamically — runs before paint
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

function App() {
  const [path, setPath] = useState(window.location.pathname);

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

  // /tools/:slug
  const toolMatch = path.match(/^\/tools\/([^/]+)$/);
  if (toolMatch) {
    const tool = TOOLS.find(t => t.slug === toolMatch[1]);
    if (tool) {
      updateMeta(
        `${tool.name} Review 2026 — Honest Take, Free Trial & Pricing | AI Nexus`,
        `Honest ${tool.name} review by someone who actually used it. ${tool.tagline}. Free trial link, real pricing, pros & cons.`,
        `${SITE_CONFIG.siteUrl}/tools/${tool.slug}`
      );
      return <ToolPage tool={tool} navigate={navigate} />;
    }
  }

  // /about
  if (path === '/about') {
    updateMeta(
      'About AI Nexus — Who Tests These AI Tools | AI Nexus',
      'AI Nexus is run by a solo creator who personally tests every AI tool before recommending it. No sponsored reviews, no gatekeeping.',
      `${SITE_CONFIG.siteUrl}/about`
    );
    return <AboutPage navigate={navigate} />;
  }

  // /disclosure
  if (path === '/disclosure') {
    updateMeta(
      'Affiliate Disclosure | AI Nexus',
      'Full affiliate disclosure for AI Nexus. We earn a small commission if you purchase through our links, at no extra cost to you.',
      `${SITE_CONFIG.siteUrl}/disclosure`
    );
    return <DisclosurePage navigate={navigate} />;
  }

  // Homepage
  updateMeta(
    'AI Nexus — Best AI Tools Reviewed & Ranked 2026',
    'Honest reviews of the best AI tools for writing, video, image, audio & productivity. Every tool personally tested. Every link is a free trial.',
    SITE_CONFIG.siteUrl
  );
  return <HomePage navigate={navigate} />;
}

export default App;
