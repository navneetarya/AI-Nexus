#!/usr/bin/env node
/**
 * scripts/generate-blog-og-images.mjs
 *
 * Generates 1200x630 WebP OG images for blog posts -> public/og/blog/<slug>.webp
 *
 * PHASE 2 REFACTOR: there is no hardcoded POSTS list any more.
 * The post list is read from blog/metadata.ts (auto-generated from blog/index.ts),
 * so a new post only needs `npm run generate:og` -- no script edit, and
 * scripts/prerender.mjs picks the file up automatically.
 *
 * Usage:
 *   node scripts/generate-blog-og-images.mjs                 # create only MISSING images (default, safe)
 *   node scripts/generate-blog-og-images.mjs --force         # regenerate every image
 *   node scripts/generate-blog-og-images.mjs --slug a,b      # (re)generate only these slugs
 *   node scripts/generate-blog-og-images.mjs --check         # report missing images, write nothing, exit 1 if any
 *   node scripts/generate-blog-og-images.mjs --check --warn  # same, but always exit 0 (used inside `npm run build`)
 *
 * Design: dark navy gradient + left accent bar + wrapped title +
 *         category pill + AI Nexus branding. Uses `sharp` (already a devDependency).
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import ts from 'typescript';

const __dir  = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.join(__dir, '..');
const OUT    = path.join(ROOT, 'public', 'og', 'blog');
const META   = path.join(ROOT, 'blog', 'metadata.ts');
const SITE   = 'ainexustools.online';
const W = 1200, H = 630;

const args  = process.argv.slice(2);
const FORCE = args.includes('--force');
const CHECK = args.includes('--check');
const WARN  = args.includes('--warn');
const slugArgIdx = args.indexOf('--slug');
const ONLY  = slugArgIdx >= 0 && args[slugArgIdx + 1]
  ? new Set(args[slugArgIdx + 1].split(',').map(s => s.trim()).filter(Boolean))
  : null;

// ── Read the post list from blog/metadata.ts (no regex: transpile + evaluate) ─
function loadPosts() {
  if (!fs.existsSync(META)) {
    console.error('✗  blog/metadata.ts not found. Run `npm run generate:blog-meta` first.');
    process.exit(1);
  }
  const js = ts.transpileModule(fs.readFileSync(META, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', js)(mod, mod.exports, createRequire(import.meta.url));
  const list = mod.exports.BLOG_POSTS_META;
  if (!Array.isArray(list) || !list.length) {
    console.error('✗  BLOG_POSTS_META is empty or missing in blog/metadata.ts');
    process.exit(1);
  }
  return list.map(p => ({ slug: p.slug, title: p.seoTitle || p.title }));
}

// Long SEO titles ("Foo 2026: Bar Baz Ranked") look cramped on a card -> keep the headline part.
function headline(title) {
  const t = String(title).trim();
  const m = t.match(/^(.{15,}?)(?::\s| — | – )/);
  return (m ? m[1] : t).trim();
}

// ── Accent colours by content category ───────────────────────────────────────
function accentColor(slug, title) {
  const t = (slug + title).toLowerCase();
  if (t.includes('transcription') || t.includes('transkriptor'))
    return { hex: '#EC4899', r: 236, g: 72,  b: 153 }; // pink  — Transcription (audio family)
  if (t.includes('spreadsheet') || t.includes('excel'))
    return { hex: '#14B8A6', r: 20,  g: 184, b: 166 }; // teal  — Spreadsheet/Productivity
  if (t.includes('podcast') || t.includes('audio') || t.includes('voice') || t.includes('podcastle') || t.includes('descript') || t.includes('elevenlabs') || t.includes('murf') || t.includes('music') || t.includes('suno') || t.includes('udio') || t.includes('speech') || t.includes('tts'))
    return { hex: '#EC4899', r: 236, g: 72,  b: 153 }; // pink  — Audio
  if (t.includes('video') || t.includes('invideo') || t.includes('pictory') || t.includes('opus') || t.includes('youtube') || t.includes('youtuber'))
    return { hex: '#F59E0B', r: 245, g: 158, b: 11  }; // amber — Video/YouTube
  if (t.includes('india') || t.includes('inr') || t.includes('indian'))
    return { hex: '#F97316', r: 249, g: 115, b: 22  }; // orange — India
  if (t.includes('social') || t.includes('marketing') || t.includes('ocoya') || t.includes('buffer') || t.includes('email'))
    return { hex: '#10B981', r: 16,  g: 185, b: 129 }; // emerald — Marketing/Email
  if (!t.includes('coding') && !t.includes('claude code') && (t.includes('agent') || t.includes('mcp') || t.includes('n8n') || t.includes('no-code')))
    return { hex: '#8B5CF6', r: 139, g: 92,  b: 246 }; // violet — Agents/Automation
  if (t.includes('resume') || t.includes('ats-') || t.includes('recruit') || t.includes('contract'))
    return { hex: '#F43F5E', r: 244, g: 63,  b: 94  }; // rose — Career/HR/Legal
  if (t.includes('coding') || t.includes('replit') || t.includes('github') || t.includes('developer') || t.includes('vibe') || t.includes('cursor') || t.includes('copilot') || t.includes('claude code') || t.includes('api') || t.includes('automation'))
    return { hex: '#8B5CF6', r: 139, g: 92,  b: 246 }; // violet — Coding/Dev
  if (t.includes('student') || t.includes('teacher') || t.includes('education') || t.includes('free'))
    return { hex: '#3B82F6', r: 59,  g: 130, b: 246 }; // blue — Education/Free
  if (t.includes('logo') || t.includes('image') || t.includes('midjourney') || t.includes('leonardo') || t.includes('design') || t.includes('canva') || t.includes('headshot') || t.includes('photo') || t.includes('website') || t.includes('builder'))
    return { hex: '#06B6D4', r: 6,   g: 182, b: 212 }; // cyan — Image/Design/Headshot
  if (t.includes('productivity') || t.includes('notion') || t.includes('taskade') || t.includes('asana') || t.includes('meeting') || t.includes('startup') || t.includes('ecosystem') || t.includes('growth'))
    return { hex: '#14B8A6', r: 20,  g: 184, b: 166 }; // teal — Productivity/Business
  // Default: writing / comparisons / chatbots / pricing
  return { hex: '#6366F1', r: 99, g: 102, b: 241 };    // indigo — Writing/Compare
}

// ── Wrap title text into lines of <= maxChars ──────────────────────────────────
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
  if (lines.length > 3) lines[2] = lines[2].replace(/[ ,;:.-]*$/, '') + '…'; // overflow -> ellipsis
  return lines.slice(0, 3); // max 3 lines
}

// ── Determine category label ──────────────────────────────────────────────────
function categoryLabel(slug, title) {
  const t = (slug + title).toLowerCase();
  if (t.includes('transcription') || t.includes('transkriptor'))              return 'AI Transcription';
  if (t.includes('spreadsheet') || t.includes('excel'))                       return 'Productivity';
  if (t.includes('podcast') || t.includes('audio') || t.includes('voice') || t.includes('podcastle') || t.includes('descript') || t.includes('elevenlabs') || t.includes('murf') || t.includes('music') || t.includes('suno') || t.includes('udio') || t.includes('speech') || t.includes('tts'))   return 'Audio & Podcast';
  if (t.includes('video') || t.includes('youtube') || t.includes('youtuber')) return 'AI Video';
  if (t.includes('email'))                                                      return 'Email Marketing';
  if (t.includes('social') || t.includes('marketing'))                         return 'Marketing';
  if (!t.includes('coding') && !t.includes('claude code') && (t.includes('agent') || t.includes('mcp') || t.includes('n8n') || t.includes('no-code'))) return 'AI Agents';
  if (t.includes('resume') || t.includes('ats-') || t.includes('recruit'))     return 'Career & Hiring';
  if (t.includes('contract'))                                                   return 'AI Legal';
  if (t.includes('cursor') || t.includes('copilot') || t.includes('vibe') || t.includes('claude code')) return 'AI Coding';
  if (t.includes('coding') || t.includes('developer') || t.includes('replit') || t.includes('api') || t.includes('automation')) return 'AI Coding';
  if (t.includes('student') || t.includes('teacher'))                          return 'Education';
  if (t.includes('headshot'))                                                   return 'AI Headshots';
  if (t.includes('logo') || t.includes('image') || t.includes('midjourney') || t.includes('leonardo') || t.includes('canva')) return 'AI Image';
  if (t.includes('meeting'))                                                    return 'AI Meetings';
  if (t.includes('startup') || t.includes('ecosystem') || t.includes('growth') || t.includes('fastest')) return 'AI Research';
  if (t.includes('productivity') || t.includes('notion') || t.includes('taskade')) return 'Productivity';
  if (t.includes('india') || t.includes('inr'))                                return 'AI Tools India';
  if (t.includes('freelancer'))                                                 return 'For Freelancers';
  if (t.includes('chatbot') || t.includes('vs') || t.includes('compare') || t.includes('pricing')) return 'AI Comparison';
  if (t.includes('website') || t.includes('builder') || t.includes('design'))  return 'AI Website Builders';
  return 'AI Writing';
}

// ── Build SVG for a single post ───────────────────────────────────────────────
function buildSvg({ slug, title }) {
  const ac   = accentColor(slug, title);
  const lines = wrapText(headline(title), 30);
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
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#080C1A"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <radialGradient id="glow" cx="40%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="${ac.hex}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${ac.hex}" stop-opacity="0"/>
    </radialGradient>
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
      <feBlend in="SourceGraphic" mode="overlay" result="blend"/>
      <feComposite in="blend" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="none"
    style="background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <rect x="0" y="0" width="8" height="${H}" fill="${ac.hex}"/>

  <line x1="140" y1="52" x2="${W - 60}" y2="52" stroke="${ac.hex}" stroke-opacity="0.3" stroke-width="1"/>
  <line x1="140" y1="${H - 52}" x2="${W - 60}" y2="${H - 52}" stroke="${ac.hex}" stroke-opacity="0.3" stroke-width="1"/>

  <rect x="140" y="64" rx="6" ry="6" width="${cat.length * 9 + 28}" height="34" fill="${ac.hex}" fill-opacity="0.18"/>
  <rect x="140" y="64" rx="6" ry="6" width="${cat.length * 9 + 28}" height="34" fill="none" stroke="${ac.hex}" stroke-opacity="0.5" stroke-width="1"/>
  <text x="${154}" y="81"
    font-family="system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
    font-size="13" font-weight="700" fill="${ac.hex}"
    dominant-baseline="middle" style="letter-spacing:1px;text-transform:uppercase"
  >${escSvg(cat)}</text>

  ${titleSvg}

  <polygon
    points="60,${H-58} 76,${H-68} 92,${H-58} 92,${H-38} 76,${H-28} 60,${H-38}"
    fill="${ac.hex}" fill-opacity="0.25" stroke="${ac.hex}" stroke-width="1.5"
  />
  <text x="76" y="${H - 48}"
    font-family="system-ui,-apple-system,Helvetica,Arial,sans-serif"
    font-size="11" font-weight="900" fill="${ac.hex}"
    text-anchor="middle" dominant-baseline="middle"
  >AI</text>

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

// ── Generate ─────────────────────────────────────────────────────────────────
fs.mkdirSync(OUT, { recursive: true });

const all    = loadPosts();
const wanted = ONLY ? all.filter(p => ONLY.has(p.slug)) : all;
if (ONLY) {
  const known = new Set(all.map(p => p.slug));
  for (const s of ONLY) if (!known.has(s)) console.warn(`⚠  --slug ${s}: not found in blog/metadata.ts`);
}
const exists  = p => fs.existsSync(path.join(OUT, `${p.slug}.webp`));
const todo    = wanted.filter(p => FORCE || ONLY || !exists(p));

if (CHECK) {
  const missing = all.filter(p => !exists(p));
  if (!missing.length) {
    console.log(`✅  All ${all.length} blog posts have a dedicated OG image.`);
    process.exit(0);
  }
  console.warn(`⚠  ${missing.length} of ${all.length} blog posts have no dedicated OG image (they share a generic one on social cards):`);
  missing.forEach(p => console.warn(`   - ${p.slug}`));
  console.warn('   Fix: npm run generate:og   then commit public/og/blog/');
  process.exit(WARN ? 0 : 1);
}

console.log(`\n🎨  ${all.length} posts in metadata, ${all.filter(exists).length} already have images, generating ${todo.length}\n`);

let ok = 0, fail = 0;
for (const post of todo) {
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

console.log(`\n✅  Done. ${ok} generated${fail ? `, ${fail} failed` : ''}. Output: public/og/blog/`);
if (todo.length) console.log('   Commit the new .webp files -- the build does not generate them.\n');
process.exit(fail ? 1 : 0);
