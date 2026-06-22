#!/usr/bin/env node

/**
 * Mobile PageSpeed Audit Script
 * Measures Core Web Vitals and performance metrics for all pages
 * 
 * Usage: npm run audit:lighthouse
 * Output: audit-results.json with mobile scores for every page
 */

import chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import fs from 'fs';
import path from 'path';

const AUDIT_PAGES = [
  // Homepage
  '/',
  // Top 5 page-1 rankings (0 CTR)
  '/compare/grammarly-vs-quillbot/',
  '/compare/lovable-vs-bolt-vs-v0/',
  '/blog/best-ai-email-marketing-tools-2026/',
  '/blog/best-ai-headshot-tools-linkedin-2026/',
  '/blog/cursor-ai-review-2026/',
  // Week 2 new pages
  '/compare/perplexity-vs-chatgpt/',
  '/compare/headshotpro-vs-aragon/',
  '/compare/make-vs-zapier/',
  // Category pages (sample)
  '/best-ai-writing-tools/',
  '/best-ai-coding-tools/',
];

const BASE_URL = 'https://ainexustools.online';

async function launchChromeAndRunLighthouse(url, options) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  options.port = chrome.port;
  
  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();
    return runnerResult;
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

async function auditPages() {
  console.log('\n📊 Mobile PageSpeed Audit — Week 2');
  console.log(`Testing ${AUDIT_PAGES.length} pages for Core Web Vitals\n`);
  
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    summary: {
      totalPages: AUDIT_PAGES.length,
      pagesAudited: 0,
      avgMobileScore: 0,
      avgLCP: 0,
      avgCLS: 0,
      avgFID: 0,
    },
    pages: [],
  };
  
  const lighthouseOptions = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility'],
    emulatedFormFactor: 'mobile',
  };
  
  for (const page of AUDIT_PAGES) {
    const url = `${BASE_URL}${page}`;
    console.log(`🔍 Auditing ${page}...`);
    
    try {
      const runnerResult = await launchChromeAndRunLighthouse(url, lighthouseOptions);
      const audits = JSON.parse(runnerResult.report);
      
      const scores = audits.categories;
      const metrics = audits.audits;
      
      const pageResult = {
        url: page,
        mobileScore: Math.round(scores.performance.score * 100),
        lcp: metrics['largest-contentful-paint']?.numericValue?.toFixed(2) || 'N/A',
        cls: metrics['cumulative-layout-shift']?.numericValue?.toFixed(3) || 'N/A',
        fid: metrics['first-input-delay']?.numericValue?.toFixed(2) || 'N/A',
        fcp: metrics['first-contentful-paint']?.numericValue?.toFixed(2) || 'N/A',
      };
      
      results.pages.push(pageResult);
      results.summary.pagesAudited++;
      
      // Aggregate metrics
      if (pageResult.mobileScore) results.summary.avgMobileScore += pageResult.mobileScore;
      if (pageResult.lcp !== 'N/A') results.summary.avgLCP += parseFloat(pageResult.lcp);
      if (pageResult.cls !== 'N/A') results.summary.avgCLS += parseFloat(pageResult.cls);
      
      console.log(`  ✓ Mobile score: ${pageResult.mobileScore} | LCP: ${pageResult.lcp}s | CLS: ${pageResult.cls}`);
    } catch (error) {
      console.log(`  ✗ Audit failed: ${error.message}`);
      results.pages.push({
        url: page,
        error: error.message,
      });
    }
  }
  
  // Calculate averages
  if (results.summary.pagesAudited > 0) {
    results.summary.avgMobileScore = Math.round(results.summary.avgMobileScore / results.summary.pagesAudited);
    results.summary.avgLCP = (results.summary.avgLCP / results.summary.pagesAudited).toFixed(2);
    results.summary.avgCLS = (results.summary.avgCLS / results.summary.pagesAudited).toFixed(3);
  }
  
  // Save results
  const outputPath = 'audit-results-mobile.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📈 Summary:`);
  console.log(`  • Pages audited: ${results.summary.pagesAudited}/${AUDIT_PAGES.length}`);
  console.log(`  • Avg mobile score: ${results.summary.avgMobileScore}/100`);
  console.log(`  • Avg LCP: ${results.summary.avgLCP}s (target: <2.5s)`);
  console.log(`  • Avg CLS: ${results.summary.avgCLS} (target: <0.1)`);
  console.log(`\n💾 Results saved to ${outputPath}`);
  
  // Exit with status based on performance
  if (results.summary.avgMobileScore >= 60) {
    console.log('\n✅ Mobile performance is good.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Mobile performance below 60 — consider optimization.');
    process.exit(1);
  }
}

auditPages().catch((error) => {
  console.error('Audit error:', error);
  process.exit(1);
});
