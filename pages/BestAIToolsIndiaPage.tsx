// pages/BestAIToolsIndiaPage.tsx
// Week 3 Task 15 — /best-ai-tools-india/
// Target keyword: "best AI tools India 2026" — 2,800/mo KD 16
// Unique angle: INR pricing, Hindi support, VPN column, Indian seller use cases

import React from 'react';
import { TOOLS, SITE_CONFIG } from '../constants';
import { ExternalLink, CheckCircle, XCircle, ArrowRight, MapPin, Star } from 'lucide-react';
import { SharedNav } from './SharedNav';

const C = {
  bg:     'var(--bg)',
  surf:   'var(--surf)',
  a1:     'var(--a1)',
  a2:     'var(--a2)',
  txt:    'var(--txt)',
  mut:    'var(--mut)',
  dark:   'var(--dark)',
  a1card: 'var(--a1-card)',
  a1brd:  'var(--a1-brd)',
  barBg:  'var(--bar-bg)',
  barBrd: 'var(--bar-brd)',
};

// ── Top 10 tools curated for India ──────────────────────────────────────────
// INR pricing converted at ~₹83/USD (May 2026 average)
const INDIA_TOOLS: Array<{
  slug: string;
  inrFree: string;
  inrPaid: string;
  hindiSupport: boolean;
  hindiNote: string;
  vpnNeeded: boolean;
  indiaUseCase: string;
  rank: number;
  badge?: string;
}> = [
  {
    slug: 'grammarly',
    inrFree: 'Free forever',
    inrPaid: '₹1,000/month',
    hindiSupport: false,
    hindiNote: 'English only',
    vpnNeeded: false,
    indiaUseCase: 'Emails, reports, LinkedIn profiles, client communication in English',
    rank: 1,
    badge: 'Best Free Pick',
  },
  {
    slug: 'rytr',
    inrFree: 'Free (10,000 chars/mo)',
    inrPaid: '₹750/month',
    hindiSupport: true,
    hindiNote: 'Hindi output supported',
    vpnNeeded: false,
    indiaUseCase: 'Freelance blog content, social media captions, product descriptions for Meesho/Flipkart sellers',
    rank: 2,
    badge: 'Best Value',
  },
  {
    slug: 'canva-ai',
    inrFree: 'Free (limited AI)',
    inrPaid: '₹1,250/month Pro',
    hindiSupport: true,
    hindiNote: 'Hindi UI + AI tools',
    vpnNeeded: false,
    indiaUseCase: 'Social media creatives, festival posts, YouTube thumbnails, WhatsApp marketing',
    rank: 3,
    badge: 'Most Versatile',
  },
  {
    slug: 'elevenlabs',
    inrFree: 'Free (10,000 chars/mo)',
    inrPaid: '₹415/month Starter',
    hindiSupport: true,
    hindiNote: 'Hindi + Indian English voices',
    vpnNeeded: false,
    indiaUseCase: 'YouTube voiceovers in Hindi/English, e-learning narration, audio content for regional creators',
    rank: 4,
  },
  {
    slug: 'leonardo-ai',
    inrFree: 'Free (150 credits/day)',
    inrPaid: '₹1,000/month',
    hindiSupport: false,
    hindiNote: 'English interface',
    vpnNeeded: false,
    indiaUseCase: 'Product mockups, e-commerce visuals, social media images, game asset creation',
    rank: 5,
  },
  {
    slug: 'murf-ai',
    inrFree: 'Free (10 mins/mo)',
    inrPaid: '₹1,580/month Creator',
    hindiSupport: true,
    hindiNote: 'Hindi & Indian English voices',
    vpnNeeded: false,
    indiaUseCase: 'Hindi explainer videos, regional language eLearning, corporate training narration',
    rank: 6,
  },
  {
    slug: 'perplexity',
    inrFree: 'Free (unlimited basic)',
    inrPaid: '₹1,660/month Pro',
    hindiSupport: true,
    hindiNote: 'Answers in Hindi on request',
    vpnNeeded: false,
    indiaUseCase: 'Research with cited sources — students, journalists, freelancers doing competitor analysis',
    rank: 7,
  },
  {
    slug: 'notion-ai',
    inrFree: 'Free Notion + paid AI add-on',
    inrPaid: '₹830/month add-on',
    hindiSupport: true,
    hindiNote: 'Generates Hindi content',
    vpnNeeded: false,
    indiaUseCase: 'Startup documentation, project management, team wikis, meeting note summaries',
    rank: 8,
  },
  {
    slug: 'replit',
    inrFree: 'Free (3 public Repls)',
    inrPaid: '₹580/month',
    hindiSupport: false,
    hindiNote: 'English interface',
    vpnNeeded: false,
    indiaUseCase: 'Learning to code without a local setup — students, bootcamp learners, IT freshers building side projects',
    rank: 9,
  },
  {
    slug: 'taskade',
    inrFree: 'Free (1 workspace)',
    inrPaid: '₹665/month',
    hindiSupport: true,
    hindiNote: 'Partial Hindi support',
    vpnNeeded: false,
    indiaUseCase: 'Freelancer project management, small agency task tracking, remote team collaboration',
    rank: 10,
  },
];

// ── Best free-only tools for India ──────────────────────────────────────────
const FREE_INDIA_SLUGS = ['grammarly', 'rytr', 'canva-ai', 'elevenlabs', 'leonardo-ai', 'perplexity', 'replit', 'taskade'];

// ── Schema: BreadcrumbList ──────────────────────────────────────────────────
function BreadcrumbSchema() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Best AI Tools India', item: `${SITE_CONFIG.siteUrl}/best-ai-tools-india/` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

// ── Schema: ItemList (SoftwareApplication) for India page ───────────────────
function IndiaItemListSchema() {
  const items = [
    { position: 1, name: 'Grammarly', url: `${SITE_CONFIG.siteUrl}/tools/grammarly`, description: 'Best free AI writing assistant for Indian professionals — English grammar, tone, and email improvement.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web, Chrome, iOS, Android' },
    { position: 2, name: 'Rytr', url: `${SITE_CONFIG.siteUrl}/tools/rytr`, description: 'Most affordable AI content writer for Indian freelancers and students — ₹750/month paid tier.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web' },
    { position: 3, name: 'Canva AI', url: `${SITE_CONFIG.siteUrl}/tools/canva-ai`, description: 'Best free AI design tool for Indian SMEs and content creators — Hindi template support included.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web, iOS, Android' },
    { position: 4, name: 'ElevenLabs', url: `${SITE_CONFIG.siteUrl}/tools/elevenlabs`, description: 'Best AI voice generator supporting Indian English accents — free 10,000 characters per month.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web' },
    { position: 5, name: 'Leonardo AI', url: `${SITE_CONFIG.siteUrl}/tools/leonardo-ai`, description: 'Best free AI image generator for Indian designers — 150 free credits daily, no credit card required.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web' },
    { position: 6, name: 'Murf AI', url: `${SITE_CONFIG.siteUrl}/tools/murf-ai`, description: 'AI voiceover tool with strong Indian English voice support — used by Indian eLearning creators.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web' },
    { position: 7, name: 'Perplexity', url: `${SITE_CONFIG.siteUrl}/tools/perplexity`, description: 'Best free AI search engine for Indian researchers and students — cited answers, no hallucinations.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web, iOS, Android' },
    { position: 8, name: 'Notion AI', url: `${SITE_CONFIG.siteUrl}/tools/notion-ai`, description: 'AI-powered notes and project management for Indian startups — ₹830/month add-on.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web, iOS, Android, Desktop' },
    { position: 9, name: 'Replit', url: `${SITE_CONFIG.siteUrl}/tools/replit`, description: 'Best free browser-based coding environment for Indian CS students — no installation required.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web' },
    { position: 10, name: 'Taskade', url: `${SITE_CONFIG.siteUrl}/tools/taskade`, description: 'AI project management for Indian freelancers and remote teams — free plan with 1 workspace.', price: '₹0', priceCurrency: 'INR', operatingSystem: 'Web, iOS, Android, Desktop' },
  ];

  const json = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Best AI Tools in India 2026',
    description: 'Top 10 AI tools available in India ranked for INR pricing, Hindi support, and Indian use cases.',
    url: `${SITE_CONFIG.siteUrl}/best-ai-tools-india/`,
    numberOfItems: items.length,
    itemListElement: items.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        url: item.url,
        description: item.description,
        applicationCategory: 'BusinessApplication',
        operatingSystem: item.operatingSystem,
        offers: {
          '@type': 'Offer',
          price: item.price,
          priceCurrency: item.priceCurrency,
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}

// ── Tool logo with local-first → Clearbit fallback ──────────────────────────
const TOOL_DOMAIN: Record<string, string> = {
  'grammarly': 'grammarly.com', 'rytr': 'rytr.me', 'canva-ai': 'canva.com',
  'elevenlabs': 'elevenlabs.io', 'leonardo-ai': 'leonardo.ai', 'murf-ai': 'murf.ai',
  'perplexity': 'perplexity.ai', 'notion-ai': 'notion.so', 'replit': 'replit.com',
  'taskade': 'taskade.com',
};

function ToolLogo({ slug, size = 36, name, color }: { slug: string; size?: number; name?: string; color?: string }) {
  const [localErr, setLocalErr] = React.useState(false);
  const [clearbitErr, setClearbitErr] = React.useState(false);
  const domain = TOOL_DOMAIN[slug];
  const initial = (name ?? slug)[0].toUpperCase();
  const r = Math.round(size * 0.27);

  if (!localErr) {
    return (
      <img src={`/logos/${slug}.png`} alt={name ?? slug} width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setLocalErr(true)} />
    );
  }
  if (domain && !clearbitErr) {
    return (
      <img src={`https://logo.clearbit.com/${domain}`} alt={name ?? slug} width={size} height={size}
        style={{ borderRadius: r, objectFit: 'contain', display: 'block', background: '#fff' }}
        onError={() => setClearbitErr(true)} />
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: r, background: color ?? C.a1, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, fontWeight: 700, fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {initial}
    </span>
  );
}

// ── India Tool Card ──────────────────────────────────────────────────────────
const IndiaToolCard: React.FC<{
  indiaTool: typeof INDIA_TOOLS[0];
  navigate: (to: string) => void;
}> = ({ indiaTool, navigate }) => {
  const tool = TOOLS.find(t => t.slug === indiaTool.slug);
  if (!tool) return null;

  return (
    <div
      style={{
        background: C.surf,
        border: `1px solid ${C.barBrd}`,
        borderRadius: 16,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'box-shadow .2s',
        position: 'relative',
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 24px rgba(13,148,136,.12)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: C.a1, color: '#fff',
        width: 28, height: 28, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800,
      }}>
        {indiaTool.rank}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ToolLogo slug={tool.slug} size={40} name={tool.name} color={tool.color} />
        <div style={{ flex: 1, minWidth: 0, paddingRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: C.txt }}>
              {tool.name}
            </span>
            {indiaTool.badge && (
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                background: 'rgba(13,148,136,.12)', color: 'var(--a1)',
                border: '1px solid rgba(13,148,136,.25)',
              }}>
                {indiaTool.badge}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{tool.tagline}</div>
        </div>
      </div>

      {/* INR Pricing row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <div style={{
          background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)',
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
            Free Plan
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{indiaTool.inrFree}</div>
        </div>
        <div style={{
          background: C.barBg, border: `1px solid ${C.barBrd}`,
          borderRadius: 10, padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.mut, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>
            Paid (INR)
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.txt }}>{indiaTool.inrPaid}</div>
        </div>
      </div>

      {/* Hindi + VPN badges */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
          background: indiaTool.hindiSupport ? 'rgba(16,185,129,.1)' : 'rgba(100,116,139,.1)',
          color: indiaTool.hindiSupport ? '#10b981' : C.mut,
          border: `1px solid ${indiaTool.hindiSupport ? 'rgba(16,185,129,.25)' : 'rgba(100,116,139,.2)'}`,
        }}>
          {indiaTool.hindiSupport
            ? <CheckCircle size={11} />
            : <XCircle size={11} />
          }
          {indiaTool.hindiNote}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 100,
          background: 'rgba(16,185,129,.1)', color: '#10b981',
          border: '1px solid rgba(16,185,129,.25)',
        }}>
          <CheckCircle size={11} /> No VPN needed
        </span>
      </div>

      {/* India use case */}
      <div style={{ fontSize: 13, color: C.mut, lineHeight: 1.6 }}>
        <span style={{ color: C.txt, fontWeight: 600 }}>India use case: </span>
        {indiaTool.indiaUseCase}
      </div>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <a
          href={tool.affiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: C.a1, color: '#fff', borderRadius: 8,
            fontSize: 12.5, fontWeight: 700, padding: '8px 14px',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={12} /> Try Free
        </a>
        <button
          onClick={() => navigate(`/tools/${tool.slug}`)}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: C.barBg, border: `1px solid ${C.barBrd}`, color: C.txt,
            borderRadius: 8, fontSize: 12.5, fontWeight: 600, padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          Full Review <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

// ── Props ────────────────────────────────────────────────────────────────────
interface Props {
  navigate: (to: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function BestAIToolsIndiaPage({ navigate, isDark, toggleTheme }: Props) {
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'free' | 'hindi'>('all');

  const displayTools = INDIA_TOOLS.filter(t => {
    if (activeFilter === 'free') return ['grammarly', 'rytr', 'canva-ai', 'elevenlabs', 'leonardo-ai', 'perplexity', 'replit', 'taskade'].includes(t.slug);
    if (activeFilter === 'hindi') return t.hindiSupport;
    return true;
  });

  const freeCount = INDIA_TOOLS.filter(t => FREE_INDIA_SLUGS.includes(t.slug)).length;
  const hindiCount = INDIA_TOOLS.filter(t => t.hindiSupport).length;

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt }}>
      <BreadcrumbSchema />
      <IndiaItemListSchema />
      {/* NOTE: FAQPage + Article schema injected by prerender.mjs into static HTML */}

      <SharedNav navigate={navigate} isDark={isDark} toggleTheme={toggleTheme} activePage="home" />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.dark,
        padding: '56px 24px 52px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(13,148,136,.22) 0%, transparent 70%)',
        }} />
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(13,148,136,.12)', border: '1px solid rgba(13,148,136,.25)',
            color: 'var(--a1)', fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
            padding: '5px 14px', borderRadius: 100, marginBottom: 20,
          }}>
            <MapPin size={11} /> INDIA EDITION — INR PRICING · HINDI SUPPORT · VPN STATUS
          </div>
          <h1 style={{
            fontFamily: "'Inter',sans-serif", fontWeight: 800,
            fontSize: 'clamp(26px,5vw,46px)', color: '#fff',
            lineHeight: 1.1, marginBottom: 16,
          }}>
            Best AI Tools for India 2026<br />
            <span style={{ color: 'var(--a2)' }}>Reviewed with INR Pricing</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,.55)', fontSize: 15, lineHeight: 1.7,
            marginBottom: 28, maxWidth: 580, margin: '0 auto 28px',
          }}>
            10 independently tested AI tools — with actual rupee pricing, Hindi language support status, and Indian use cases.
            No VPN required for any tool on this list.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              { n: '10', label: 'Tools reviewed' },
              { n: String(freeCount), label: 'With free plans' },
              { n: String(hindiCount), label: 'Hindi-supported' },
              { n: '0',  label: 'Require VPN' },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--a2)' }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Why an India-specific guide ───────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px 0' }}>
        <div style={{
          background: C.surf, border: `1px solid ${C.barBrd}`, borderRadius: 16, padding: '24px 28px',
        }}>
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 700, color: C.txt, marginBottom: 12 }}>
            Why a separate India guide?
          </h2>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, marginBottom: 10 }}>
            Most AI tool review sites are written for US audiences. They list prices in dollars, ignore Hindi/regional language support, and assume fast US-based infrastructure. In India, what matters is different: rupee pricing, payment compatibility with Indian cards and UPI, whether the tool works reliably on typical Indian broadband, and whether there's any Hindi language support.
          </p>
          <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>
            Every INR price below is converted at the May 2026 exchange rate (~₹83/USD). GST applies to paid subscriptions purchased from India — most platforms charge 18% GST on top of the listed price when billing to an Indian address. Factor this in when budgeting.
          </p>
        </div>

        {/* GST notice */}
        <div style={{
          marginTop: 16,
          background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <Star size={15} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: C.txt, lineHeight: 1.65, margin: 0 }}>
            <strong style={{ color: '#f59e0b' }}>GST Note:</strong> If you purchase any paid AI tool subscription from India, 18% GST is added to the displayed price. A ₹1,000/month plan costs ~₹1,180/month after GST. Use a business GST number at checkout to reclaim input tax credit if applicable.
          </p>
        </div>
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '28px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {([
            { key: 'all',   label: `🇮🇳 All 10 Tools` },
            { key: 'free',  label: `✅ Free Plan Available (${freeCount})` },
            { key: 'hindi', label: `🗣 Hindi Supported (${hindiCount})` },
          ] as const).map(({ key, label }) => {
            const isActive = key === activeFilter;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                style={{
                  padding: '7px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', border: `1px solid ${isActive ? C.a1 : C.barBrd}`,
                  background: isActive ? C.a1 : C.barBg,
                  color: isActive ? '#fff' : C.txt,
                  transition: 'all .15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tool cards grid ───────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '24px auto 0', padding: '0 24px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 16,
        }}>
          {displayTools.map(t => (
            <IndiaToolCard key={t.slug} indiaTool={t} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* ── INR Pricing & Feature Comparison Table ────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{
          fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800,
          color: C.txt, marginBottom: 6,
        }}>
          Full Comparison: INR Pricing, Hindi & VPN
        </h2>
        <p style={{ fontSize: 14, color: C.mut, marginBottom: 20 }}>
          All prices in INR at May 2026 rates. GST (18%) not included — add it for actual billing cost from India.
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'separate', borderSpacing: 0,
            borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.barBrd}`,
            minWidth: 560,
          }}>
            <thead>
              <tr>
                {['#', 'Tool', 'Free Plan', 'Paid (INR/mo)', 'Hindi', 'VPN?'].map((h, i) => (
                  <th key={h} style={{
                    background: C.dark, color: 'rgba(255,255,255,.7)',
                    fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase',
                    padding: '11px 14px', textAlign: 'left', fontFamily: "'Inter',sans-serif",
                    borderRadius: i === 0 ? '14px 0 0 0' : i === 5 ? '0 14px 0 0' : undefined,
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INDIA_TOOLS.map((it, idx) => {
                const tool = TOOLS.find(t => t.slug === it.slug);
                if (!tool) return null;
                return (
                  <tr key={it.slug} style={{ background: idx % 2 === 0 ? C.surf : C.bg }}>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: C.mut, borderTop: `1px solid ${C.barBrd}`, fontWeight: 700 }}>
                      {it.rank}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: C.txt, borderTop: `1px solid ${C.barBrd}`, whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => navigate(`/tools/${tool.slug}`)}
                        style={{ background: 'none', border: 'none', color: C.a1, cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}
                      >
                        {tool.name}
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#10b981', fontWeight: 600, borderTop: `1px solid ${C.barBrd}` }}>
                      {it.inrFree.startsWith('Free') ? it.inrFree : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: C.txt, borderTop: `1px solid ${C.barBrd}`, whiteSpace: 'nowrap' }}>
                      {it.inrPaid}
                    </td>
                    <td style={{ padding: '11px 14px', borderTop: `1px solid ${C.barBrd}` }}>
                      {it.hindiSupport
                        ? <CheckCircle size={14} color="#10b981" />
                        : <XCircle size={14} color="#64748b" />
                      }
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, fontWeight: 700, borderTop: `1px solid ${C.barBrd}`, color: '#10b981' }}>
                      No
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Best FREE tools for India section ────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{
          background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.18)',
          borderRadius: 16, padding: '28px',
        }}>
          <h2 style={{
            fontFamily: "'Inter',sans-serif", fontSize: 18, fontWeight: 800, color: C.txt, marginBottom: 8,
          }}>
            ✅ Best Free AI Tools for India — No Credit Card
          </h2>
          <p style={{ fontSize: 14, color: C.mut, lineHeight: 1.7, marginBottom: 20 }}>
            These tools have a permanent free plan that works with an Indian email address. No international credit card required, no trial period — free forever.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {INDIA_TOOLS.filter(t => FREE_INDIA_SLUGS.includes(t.slug)).map(it => {
              const tool = TOOLS.find(t => t.slug === it.slug);
              if (!tool) return null;
              return (
                <div key={it.slug} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  background: C.surf, borderRadius: 10, padding: '12px 16px',
                  border: `1px solid ${C.barBrd}`,
                }}>
                  <ToolLogo slug={tool.slug} size={32} name={tool.name} color={tool.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.txt }}>{tool.name}</span>
                      <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{it.inrFree}</span>
                      {it.hindiSupport && (
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4,
                          background: 'rgba(13,148,136,.12)', color: 'var(--a1)', fontWeight: 700,
                        }}>
                          Hindi ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: C.mut, marginTop: 2 }}>{it.indiaUseCase}</div>
                  </div>
                  <a
                    href={tool.affiliateLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                      background: C.a1, color: '#fff', borderRadius: 7,
                      fontSize: 12, fontWeight: 700, padding: '7px 14px',
                      textDecoration: 'none',
                    }}
                  >
                    Try Free <ExternalLink size={11} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ section ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 48px' }}>
        <h2 style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: C.txt, marginBottom: 20 }}>
          Frequently Asked Questions
        </h2>
        {[
          {
            q: 'What are the best AI tools for India in 2026?',
            a: 'The best AI tools for India in 2026 — accounting for INR pricing, Hindi support, and availability without VPN — are Grammarly (free writing assistant), Rytr (free AI content writer with Hindi support), Canva AI (free design with Hindi UI), ElevenLabs (free AI voice generator with Indian English voices), and Leonardo.ai (free AI image generator). All five work without a VPN from India and are available on a permanent free plan.',
          },
          {
            q: 'Do AI tools work in India without a VPN?',
            a: 'Yes — all 10 tools on this list work in India without a VPN as of May 2026. None are geo-blocked in India. Some tools (like Perplexity and ElevenLabs) require international payment methods for paid plans, but free plans are accessible from any Indian IP address.',
          },
          {
            q: 'What is the cheapest AI writing tool in India?',
            a: 'Rytr is the cheapest paid AI writing tool in India at approximately ₹750/month (around $9/month). It also has a free plan with 10,000 characters per month and supports Hindi content generation. Grammarly is free for grammar checking. Quillbot is free for paraphrasing up to 125 words.',
          },
          {
            q: 'Which AI tools support Hindi language in India?',
            a: 'AI tools with Hindi support include: Rytr (Hindi content generation), Canva AI (Hindi interface and design tools), ElevenLabs (Hindi text-to-speech voices), Murf AI (Hindi and Indian English voices), Perplexity (can answer in Hindi), and Notion AI (generates Hindi content). Grammarly, Leonardo.ai, and Replit are English-only.',
          },
          {
            q: 'Is GST charged on AI tool subscriptions in India?',
            a: 'Yes — 18% GST is typically charged when purchasing AI tool subscriptions from India. Most international AI platforms add GST at checkout when you enter an Indian billing address. A ₹1,000/month plan becomes approximately ₹1,180/month after GST. Businesses with a GSTIN can claim input tax credit on these purchases.',
          },
        ].map(({ q, a }, i) => (
          <div key={i} style={{
            borderBottom: `1px solid ${C.barBrd}`, padding: '18px 0',
          }}>
            <h3 style={{
              fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700,
              color: C.txt, marginBottom: 8,
            }}>
              {q}
            </h3>
            <p style={{ fontSize: 14, color: C.txt, lineHeight: 1.75, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <div style={{ background: C.dark, padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 800,
            color: '#fff', marginBottom: 12,
          }}>
            Want the full reviews?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, marginBottom: 24 }}>
            Every tool on this page has a detailed review with real output examples, pros & cons, and an honest verdict from independent testing.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              background: C.a1, color: '#fff', border: 'none', borderRadius: 10,
              padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
          >
            Browse All Reviews <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
