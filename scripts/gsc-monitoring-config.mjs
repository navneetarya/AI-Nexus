/**
 * GA4 + GSC Monitoring Setup
 * Tracks:
 * - Ranking changes (tracking top 20 keywords)
 * - CTR improvements on rewritten titles (T2)
 * - Indexing progress (T3)
 * - Mobile traffic trends (T6)
 * 
 * Implementation guide for ainexustools.online
 */

// ── GA4 Custom Events Configuration ────────────────────────────────────────
export const GA4_CUSTOM_EVENTS = {
  'seo_page_view': {
    // Track every page view with keyword/intent metadata
    parameters: {
      'keyword_rank': '', // e.g. '15' for keyword rank in SERP
      'keyword_target': '', // e.g. 'best ai tools' 
      'page_category': '', // e.g. 'compare', 'blog', 'category'
      'title_version': '', // e.g. 'v1_original' or 'v2_optimized'
    }
  },
  'serp_impression': {
    // Track when page appears in SERP (via GSC data)
    parameters: {
      'keyword': '',
      'position': '', // 1-10, 11-20, 21-30, etc
      'impressions': '',
      'clicks': '',
      'ctr': '', // Click-through rate percentage
    }
  },
  'ctr_test_impact': {
    // Track the impact of CTR-optimized titles (T2)
    parameters: {
      'page_url': '',
      'old_title': '',
      'new_title': '',
      'days_since_update': '',
      'ctr_change': '', // percentage change
      'clicks_change': '', // absolute change
    }
  },
  'mobile_performance': {
    // Track mobile engagement and Core Web Vitals
    parameters: {
      'device_type': 'mobile', // or 'desktop'
      'lcp_ms': '', // Largest Contentful Paint
      'cls': '', // Cumulative Layout Shift
      'fid_ms': '', // First Input Delay
      'engagement_time_msec': '',
    }
  },
  'indexing_progress': {
    // Track new pages being indexed (T3 diagnosis)
    parameters: {
      'page_url': '',
      'date_published': '',
      'days_to_index': '', // how many days to first GSC impression
      'indexing_status': '', // 'pending', 'indexed', 'excluded'
    }
  }
};

// ── Google Search Console API Setup ───────────────────────────────────────
export const GSC_MONITORING_CONFIG = {
  propertyUrl: 'https://ainexustools.online/',
  
  // Track these 20 keywords for ranking changes
  trackedKeywords: [
    'best ai tools 2026',
    'best ai writing tools',
    'best ai coding tools',
    'perplexity vs chatgpt',
    'cursor vs windsurf',
    'lovable vs bolt vs v0',
    'grammarly vs quillbot',
    'ai tools for freelancers',
    'make vs zapier',
    'headshotpro vs aragon',
    'best ai tools india',
    'best free ai tools',
    'ai chatbots compared',
    'replit vs github copilot',
    'grammarly vs prowritingaid',
    'leonardo ai vs midjourney',
    'claude vs chatgpt',
    'taskade vs asana',
    'murf ai vs elevenlabs',
    'invideo vs pictory',
  ],
  
  // GA4 property ID
  ga4PropertyId: 'YOUR_GA4_PROPERTY_ID', // Set via environment variable
  
  // Data sync frequency
  syncInterval: 'daily', // Import GSC data to GA4 daily
  
  // Metrics to track
  metricsToTrack: [
    'impressions', // page views in SERP
    'clicks', // actual clicks from SERP
    'ctr', // click-through rate (%)
    'position', // average rank
    'topPages', // top 10 performing pages
    'topQueries', // top 10 search queries
  ],
};

// ── Weekly Reporting Dashboard (GA4 Looker Studio) ──────────────────────
export const DASHBOARD_METRICS = {
  weeklyCheckpoints: {
    'Week 1': {
      baseline: {
        pagesSessions: 3,
        bounceRate: 85,
        avgSessionDuration: '0:12',
        gscImpressions: 150,
        gscClicks: 2,
        avgCtr: 1.3,
      },
      notes: 'T2 titles deployed. Measuring CTR improvement.',
    },
    'Week 2': {
      target: {
        // Expected after T6, T9, T11 deployment
        pagesSessions: 5, // +67%
        bounceRate: 80, // -5 points
        avgSessionDuration: '0:18', // +50%
        gscImpressions: 200, // +33%
        gscClicks: 4, // +100%
        avgCtr: 2.0, // +54% CTR from titles
      },
    },
  },
  
  comparePage: {
    name: 'T2-T11 Impact Dashboard',
    metrics: [
      { name: 'CTR Improvement (T2 titles)', format: 'percentage', target: '+3-4%' },
      { name: 'Mobile Score (T6 audit)', format: 'number', target: '≥60' },
      { name: 'Pages Indexed (T3 diagnosis)', format: 'percentage', target: '≥25%' },
      { name: 'India Traffic (T11)', format: 'sessions', target: '+10' },
      { name: 'Organic Sessions', format: 'sessions', target: '≥8' },
      { name: 'Avg Session Duration', format: 'time', target: '≥0:20' },
    ]
  }
};

// ── GSC Data Import to GA4 (Via Google Sheets Integration) ──────────────
export const GSC_GA4_SYNC_SCRIPT = `
/**
 * Daily GSC → GA4 sync
 * Run daily at 12:00 UTC via Google Cloud Scheduler
 * 
 * Steps:
 * 1. Query GSC API for top 20 keywords + metrics
 * 2. Deduplicate against existing GA4 events
 * 3. Send as GA4 custom events (seo_page_view, serp_impression)
 * 4. Log sync status to Cloud Logging
 */

import { google } from 'googleapis';
import { Analytics } from '@google-analytics/data';

async function syncGscToGa4() {
  // Initialize GSC API
  const searchconsole = google.searchconsole('v1');
  
  // Query last 28 days of data
  const response = await searchconsole.searchanalytics.query({
    siteUrl: 'https://ainexustools.online/',
    requestBody: {
      startDate: new Date(Date.now() - 28*24*60*60*1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dimensions: ['query', 'page'],
      rowLimit: 25000,
      aggregationType: 'auto',
    },
  });
  
  // Extract top keywords by impressions
  const topKeywords = response.data.rows
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);
  
  // Send to GA4 Measurement Protocol
  const ga4 = new Analytics();
  for (const row of topKeywords) {
    await ga4.events.create({
      event: 'serp_impression',
      params: {
        keyword: row.query,
        position: Math.round(row.position),
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: (row.ctr * 100).toFixed(2),
      },
      userId: 'seo-tracker',
      timestamp: Date.now(),
    });
  }
  
  console.log(\`✓ Synced \${topKeywords.length} keywords to GA4\`);
}

syncGscToGa4().catch(console.error);
`;

// ── Dashboard Setup Instructions ──────────────────────────────────────────
export const SETUP_INSTRUCTIONS = `
## T9: GSC Monitoring Setup

### Step 1: Enable Google Search Console API
1. Go to https://console.cloud.google.com/
2. Create or select the ainexustools.online project
3. Enable "Google Search Console API"
4. Create a service account with permissions to read GSC data

### Step 2: Connect GA4 to GSC
1. In Google Analytics (GA4), go to Admin > Data Sources
2. Click "Create connection" > Google Search Console
3. Select the ainexustools.online property
4. Authorize and link both properties

### Step 3: Set up automated sync
1. Create a Cloud Function that runs daily at 12:00 UTC
2. Deploy the GSC_GA4_SYNC_SCRIPT above
3. Schedule with Cloud Scheduler

### Step 4: Create Looker Studio Dashboard
1. Go to https://looker.studio/
2. Create a new report
3. Data source: GA4 property (ainexustools.online)
4. Add cards for:
   - Weekly organic sessions trend
   - CTR improvement (before/after T2 titles)
   - Top 20 keywords + positions
   - Mobile traffic % 
   - Pages indexed (GSC coverage)
   - Avg LCP/CLS by page (from T6 audit data)

### Step 5: Set up alerts
1. Create custom alerts in GA4:
   - Alert if organic sessions drop >20% week-over-week
   - Alert if avg CTR on rewritten titles is <1.5%
   - Alert if mobile score drops below 50

### Metrics to review daily
- GSC impressions (should rise with new indexing)
- CTR on T2-rewritten title pages (expect +3-4% vs baseline)
- Mobile pageviews % (target: >40% of total)
- India traffic % (from T11 optimization)
- Pages indexed (track improvement from T3 diagnostics)
`;

export default {
  GA4_CUSTOM_EVENTS,
  GSC_MONITORING_CONFIG,
  DASHBOARD_METRICS,
  SETUP_INSTRUCTIONS,
};
