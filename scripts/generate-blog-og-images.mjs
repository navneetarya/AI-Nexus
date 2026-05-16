#!/usr/bin/env node
/**
 * scripts/generate-blog-og-images.mjs
 *
 * Generates 1200×630 WebP OG images for every blog post.
 * Run once: node scripts/generate-blog-og-images.mjs
 * Images are written to public/og/blog/<slug>.webp
 *
 * Design: dark navy gradient + left accent bar + wrapped title +
 *         category pill + AI Nexus branding.
 * Uses `sharp` (already in devDependencies) — no extra packages needed.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dir  = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.join(__dir, '..');
const OUT    = path.join(ROOT, 'public', 'og', 'blog');
const SITE   = 'ainexustools.online';
const W = 1200, H = 630;

fs.mkdirSync(OUT, { recursive: true });

// ── Accent colours by content category ───────────────────────────────────────
function accentColor(slug, title) {
  const t = (slug + title).toLowerCase();
  if (t.includes('podcast') || t.includes('audio') || t.includes('voice') || t.includes('podcastle') || t.includes('descript') || t.includes('elevenlabs') || t.includes('murf'))
    return { hex: '#EC4899', r: 236, g: 72,  b: 153 }; // pink  — Audio
  if (t.includes('video') || t.includes('invideo') || t.includes('pictory') || t.includes('opus'))
    return { hex: '#F59E0B', r: 245, g: 158, b: 11  }; // amber — Video
  if (t.includes('india') || t.includes('inr') || t.includes('indian'))
    return { hex: '#F97316', r: 249, g: 115, b: 22  }; // orange — India
  if (t.includes('social') || t.includes('marketing') || t.includes('ocoya') || t.includes('buffer'))
    return { hex: '#10B981', r: 16,  g: 185, b: 129 }; // emerald — Marketing
  if (t.includes('coding') || t.includes('replit') || t.includes('github') || t.includes('developer'))
    return { hex: '#8B5CF6', r: 139, g: 92,  b: 246 }; // violet — Coding
  if (t.includes('student') || t.includes('teacher') || t.includes('education') || t.includes('free'))
    return { hex: '#3B82F6', r: 59,  g: 130, b: 246 }; // blue — Education
  if (t.includes('logo') || t.includes('image') || t.includes('midjourney') || t.includes('leonardo') || t.includes('design') || t.includes('canva'))
    return { hex: '#06B6D4', r: 6,   g: 182, b: 212 }; // cyan — Image/Design
  if (t.includes('productivity') || t.includes('notion') || t.includes('taskade') || t.includes('asana'))
    return { hex: '#14B8A6', r: 20,  g: 184, b: 166 }; // teal — Productivity
  // Default: writing / AI tools
  return { hex: '#6366F1', r: 99, g: 102, b: 241 };    // indigo — Writing
}

// ── Wrap title text into lines of ≤ maxChars ──────────────────────────────────
function wrapText(text, maxChars = 36) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + (line ? ' ' : '') + word).length <= maxChars) {
      line += (line ? ' ' : '') + word;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3); // max 3 lines
}

// ── Determine category label ──────────────────────────────────────────────────
function categoryLabel(slug, title) {
  const t = (slug + title).toLowerCase();
  if (t.includes('podcast') || t.includes('audio') || t.includes('voice'))   return 'Audio & Podcast';
  if (t.includes('video') || t.includes('youtube'))                           return 'AI Video';
  if (t.includes('social') || t.includes('marketing'))                        return 'Marketing';
  if (t.includes('coding') || t.includes('developer') || t.includes('replit'))return 'AI Coding';
  if (t.includes('student') || t.includes('teacher'))                         return 'Education';
  if (t.includes('logo') || t.includes('image') || t.includes('midjourney') || t.includes('leonardo') || t.includes('canva')) return 'AI Image';
  if (t.includes('productivity') || t.includes('notion') || t.includes('taskade')) return 'Productivity';
  if (t.includes('india') || t.includes('inr'))                               return 'AI Tools India';
  if (t.includes('freelancer'))                                                return 'For Freelancers';
  return 'AI Writing';
}

// ── Build SVG for a single post ───────────────────────────────────────────────
function buildSvg({ slug, title }) {
  const ac   = accentColor(slug, title);
  const lines = wrapText(title.replace(/ — /, '\n').split('\n')[0].replace(/ — .*/,'').trim(), 34);
  const cat  = categoryLabel(slug, title);

  // Font sizes
  const titleSize  = lines.length === 1 ? 72 : lines.length === 2 ? 64 : 54;
  const lineH      = titleSize * 1.2;
  const totalH     = lines.length * lineH;
  const startY     = (H - totalH) / 2 + 10;

  const titleSvg = lines.map((ln, i) =>
    `<text
      x="140" y="${startY + i * lineH}"
      font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
      font-size="${titleSize}" font-weight="800" fill="white"
      dominant-baseline="hanging"
      style="letter-spacing:-1px"
    >${escSvg(ln)}</text>`
  ).join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <!-- Dark background gradient -->
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#080C1A"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <!-- Radial glow behind title -->
    <radialGradient id="glow" cx="40%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${ac.hex}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${ac.hex}" stop-opacity="0"/>
    </radialGradient>
    <!-- Noise texture for depth -->
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- Subtle grid dots -->
  <rect width="${W}" height="${H}" fill="none"
    style="background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px"/>

  <!-- Glow -->
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="8" height="${H}" fill="${ac.hex}"/>

  <!-- Subtle top line -->
  <line x1="140" y1="52" x2="${W - 60}" y2="52" stroke="${ac.hex}" stroke-opacity="0.3" stroke-width="1"/>
  <!-- Subtle bottom line -->
  <line x1="140" y1="${H - 52}" x2="${W - 60}" y2="${H - 52}" stroke="${ac.hex}" stroke-opacity="0.3" stroke-width="1"/>

  <!-- Category pill (top-left) -->
  <rect x="140" y="64" rx="6" ry="6" width="${cat.length * 9 + 28}" height="34" fill="${ac.hex}" fill-opacity="0.18"/>
  <rect x="140" y="64" rx="6" ry="6" width="${cat.length * 9 + 28}" height="34" fill="none" stroke="${ac.hex}" stroke-opacity="0.5" stroke-width="1"/>
  <text x="${154}" y="81"
    font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
    font-size="13" font-weight="700" fill="${ac.hex}"
    dominant-baseline="middle" style="letter-spacing:1px;text-transform:uppercase"
  >${escSvg(cat)}</text>

  <!-- Title lines -->
  ${titleSvg}

  <!-- AI Nexus logo area (bottom) -->
  <!-- Hexagon icon -->
  <polygon
    points="60,${H-58} 76,${H-68} 92,${H-58} 92,${H-38} 76,${H-28} 60,${H-38}"
    fill="${ac.hex}" fill-opacity="0.25" stroke="${ac.hex}" stroke-width="1.5"
  />
  <text x="76" y="${H - 48}"
    font-family="system-ui,-apple-system,Helvetica,Arial,sans-serif"
    font-size="11" font-weight="900" fill="${ac.hex}"
    text-anchor="middle" dominant-baseline="middle"
  >AI</text>

  <!-- Wordmark -->
  <text x="104" y="${H - 52}"
    font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
    font-size="20" font-weight="800" fill="white"
    dominant-baseline="middle"
  >AI Nexus</text>
  <text x="104" y="${H - 31}"
    font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
    font-size="13" font-weight="400" fill="rgba(255,255,255,0.45)"
    dominant-baseline="middle"
  >${escSvg(SITE)}</text>

  <!-- Corner accent dot -->
  <circle cx="${W - 60}" cy="${H - 60}" r="4" fill="${ac.hex}" fill-opacity="0.6"/>
  <circle cx="${W - 60}" cy="${H - 60}" r="10" fill="none" stroke="${ac.hex}" stroke-opacity="0.25" stroke-width="1"/>
  <circle cx="${W - 60}" cy="${H - 60}" r="18" fill="none" stroke="${ac.hex}" stroke-opacity="0.12" stroke-width="1"/>
</svg>`;
}

function escSvg(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Blog posts to generate ────────────────────────────────────────────────────
const POSTS = [
  { slug: 'best-ai-writing-tools-for-beginners-2026',    title: '7 Best AI Writing Tools for Beginners 2026' },
  { slug: 'best-ai-tools-for-freelancers-2026',          title: 'Best AI Tools for Freelancers 2026' },
  { slug: 'best-grammarly-alternatives',                  title: 'Best Grammarly Alternatives 2026' },
  { slug: 'best-podcastle-alternatives',                  title: 'Best Podcastle Alternatives 2026' },
  { slug: 'best-ai-tools-for-social-media-2026',         title: 'Best AI Tools for Social Media 2026' },
  { slug: 'how-to-use-rytr-to-write-blog-posts',         title: 'How to Use Rytr to Write Blog Posts' },
  { slug: 'ai-tools-for-students-free-2026',             title: 'Best Free AI Tools for Students 2026' },
  { slug: 'best-ai-podcast-tools-2026',                  title: 'Best AI Podcast Tools 2026' },
  { slug: 'best-notion-ai-alternatives-2026',            title: 'Best Notion AI Alternatives 2026' },
  { slug: 'how-to-use-ai-for-content-creation-2026',     title: 'How to Use AI for Content Creation 2026' },
  { slug: 'best-invideo-alternatives-2026',              title: 'Best InVideo AI Alternatives 2026' },
  { slug: 'jasper-ai-alternatives',                       title: 'Best Jasper AI Alternatives 2026' },
  { slug: 'chatgpt-alternatives-free-2026',              title: 'Best Free ChatGPT Alternatives 2026' },
  { slug: 'best-ai-coding-tools-2026',                   title: 'Best AI Coding Tools 2026' },
  { slug: 'best-ai-logo-makers-free-2026',               title: 'Best Free AI Logo Makers 2026' },
  { slug: 'best-ai-marketing-tools-2026',                title: 'Best AI Marketing Tools 2026' },
  { slug: 'ai-tools-for-teachers-2026',                  title: 'Best AI Tools for Teachers 2026' },
  { slug: 'best-midjourney-alternatives-2026',           title: 'Best Midjourney Alternatives 2026' },
  { slug: 'best-ai-tools-in-india-2026',                 title: 'Best AI Tools in India 2026' },
  { slug: 'taskade-vs-notion-vs-asana-2026',             title: 'Taskade vs Notion vs Asana 2026' },
  { slug: 'leonardo-vs-midjourney-2026',                 title: 'Leonardo.ai vs Midjourney 2026' },
  { slug: 'best-free-ai-tools-for-students-in-india-2026', title: 'Best Free AI Tools for Students in India 2026' },
  { slug: 'best-ai-tools-for-freelancers-india-2026',   title: 'Best AI Tools for Freelancers in India 2026' },
  { slug: 'best-ai-tools-for-content-creators-free-2026', title: 'Best Free AI Tools for Content Creators 2026' },
];

// ── Generate ─────────────────────────────────────────────────────────────────
console.log(`\n🎨  Generating ${POSTS.length} blog OG images → public/og/blog/\n`);

let ok = 0, fail = 0;
for (const post of POSTS) {
  const outPath = path.join(OUT, `${post.slug}.webp`);
  try {
    const svg = buildSvg(post);
    await sharp(Buffer.from(svg))
      .resize(W, H)
      .webp({ quality: 90, effort: 4 })
      .toFile(outPath);
    console.log(`  ✓  ${post.slug}.webp`);
    ok++;
  } catch (err) {
    console.error(`  ✗  ${post.slug}  —  ${err.message}`);
    fail++;
  }
}

console.log(`\n✅  Done. ${ok} images generated${fail ? `, ${fail} failed` : ''}.`);
console.log(`   Add ?public/og/blog/ to your .gitignore exceptions if needed.\n`);
