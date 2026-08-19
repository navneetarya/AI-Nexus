#!/usr/bin/env node
/**
 * scripts/generate-blog-meta.mjs
 *
 * WHY THIS EXISTS:
 * blog/index.ts statically imports all 90 blog posts, including each post's
 * full HTML `content` field. That's fine for scripts/prerender.mjs (a Node
 * build step that needs full content), but it's expensive if a page's client
 * bundle imports it too — ToolPage.tsx and CategoryPage.tsx used to do this
 * just to render "From the blog" cards, dragging every post's full content
 * into their lazy-loaded chunk. See blog/metadata.ts (lightweight fields
 * only) and blog/loaders.ts (per-slug dynamic import) for the fix.
 *
 * Those two files were previously hand-maintained, so adding a new blog post
 * meant remembering to update THREE places (blog/index.ts, metadata.ts,
 * loaders.ts) — easy to forget, and nothing caught it if you did.
 *
 * This script is the fix: blog/index.ts (source of truth, one import per
 * post) is now the ONLY file you edit by hand when adding a post. Run
 * `npm run generate:blog-meta` (wired into `npm run build` below) and this
 * script regenerates metadata.ts + loaders.ts from it automatically, and
 * fails the build if anything is out of sync (orphaned file, duplicate
 * slug, missing import, etc).
 *
 * HOW IT WORKS:
 * 1. Parse blog/index.ts to get the ordered list of `import postN from
 *    './slug-file'` statements — this defines both which posts exist and
 *    their display order.
 * 2. For each imported file, transpile the TS source to CommonJS with the
 *    TypeScript compiler (already a devDependency — no new dep needed) and
 *    `require()` the result in-memory. This reads the *real* JS object
 *    exactly as the app would see it, so there's no risk of a regex
 *    mis-parsing an apostrophe or nested quote inside post content.
 * 3. Strip the heavy `content` field, keep everything else, and write out
 *    blog/metadata.ts (typed array) and blog/loaders.ts (slug -> dynamic
 *    import map), byte-for-byte in the same shape the app already expects.
 * 4. Sanity-check: every file on disk under blog/*.ts must be imported by
 *    index.ts, and every import must resolve to a real file with a unique
 *    slug matching its filename. Any mismatch fails the script with a clear
 *    error instead of silently shipping a stale/broken metadata file.
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dir, '..');
const BLOG_DIR = path.join(ROOT, 'blog');
const INDEX_PATH = path.join(BLOG_DIR, 'index.ts');
const METADATA_OUT = path.join(BLOG_DIR, 'metadata.ts');
const LOADERS_OUT = path.join(BLOG_DIR, 'loaders.ts');

const require = createRequire(import.meta.url);

// Fields kept in the lightweight metadata type. Must exactly match
// BlogPostMeta in blog/metadata.ts (everything in BlogPost except the
// heavy `content` body and a few fields the "From the blog" cards don't use).
const META_FIELDS = [
  'slug',
  'title',
  'seoTitle',
  'metaDescription',
  'datePublished',
  'dateModified',
  'author',
  'category',
  'readTime',
  'ogImage',
  'excerpt',
];

function fail(message) {
  console.error(`\n❌ generate-blog-meta failed: ${message}\n`);
  process.exit(1);
}

// ── Step 1: parse blog/index.ts for the ordered import list ─────────────────
function parseIndexImports(indexSrc) {
  const importRe = /import\s+(\w+)\s+from\s+'\.\/([^']+)';/g;
  const varToFile = new Map();
  let m;
  while ((m = importRe.exec(indexSrc))) {
    const [, varName, filePath] = m;
    varToFile.set(varName, filePath);
  }
  if (varToFile.size === 0) {
    fail(`no "import postN from './...'" statements found in ${INDEX_PATH}`);
  }

  // Order = the order post variables appear inside `export const BLOG_POSTS = [...]`
  const arrayMatch = indexSrc.match(/export const BLOG_POSTS[^=]*=\s*\[([\s\S]*?)\];/);
  if (!arrayMatch) {
    fail(`could not find "export const BLOG_POSTS: BlogPost[] = [...]" in ${INDEX_PATH}`);
  }
  const arrayBody = arrayMatch[1];
  const orderedVars = [...arrayBody.matchAll(/\bpost\d+\b/g)].map((x) => x[0]);
  if (orderedVars.length === 0) {
    fail(`BLOG_POSTS array in ${INDEX_PATH} appears empty`);
  }

  const ordered = [];
  for (const varName of orderedVars) {
    const filePath = varToFile.get(varName);
    if (!filePath) {
      fail(`"${varName}" is used in BLOG_POSTS but has no matching import statement`);
    }
    ordered.push({ varName, filePath });
  }
  return ordered;
}

// ── Step 2: cross-check every blog/*.ts file is actually imported ───────────
function checkForOrphanedFiles(orderedImports) {
  const importedFiles = new Set(orderedImports.map((x) => x.filePath));
  const diskFiles = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.ts'))
    .filter((f) => !['index.ts', 'types.ts', 'metadata.ts', 'loaders.ts'].includes(f))
    .map((f) => f.replace(/\.ts$/, ''));

  const orphaned = diskFiles.filter((f) => !importedFiles.has(f));
  if (orphaned.length > 0) {
    fail(
      `${orphaned.length} file(s) exist in blog/ but are NOT imported in blog/index.ts ` +
        `(they'll never be reachable on the site):\n  - ${orphaned.join('\n  - ')}\n\n` +
        `Add "import postN from './<slug>';" and include postN in the BLOG_POSTS array, ` +
        `or delete the file if it's abandoned.`
    );
  }

  const missing = orderedImports.filter(
    (x) => !fs.existsSync(path.join(BLOG_DIR, `${x.filePath}.ts`))
  );
  if (missing.length > 0) {
    fail(
      `blog/index.ts imports file(s) that don't exist on disk:\n` +
        missing.map((x) => `  - ${x.filePath}.ts`).join('\n')
    );
  }
}

// ── Step 3: transpile + require each post file to read its real fields ──────

// blog/types.ts mostly holds interfaces (compiled away), but also the
// `Category` enum, which some posts reference at runtime (e.g.
// `category: Category.AUDIO`). Transpile it once for real so those imports
// resolve to the actual enum values instead of a stub.
let cachedTypesModule = null;
function loadTypesModule() {
  if (cachedTypesModule) return cachedTypesModule;
  const absPath = path.join(BLOG_DIR, 'types.ts');
  const src = fs.readFileSync(absPath, 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: absPath,
  });
  const Module = require('module');
  const mod = new Module(absPath, null);
  mod.filename = absPath;
  mod._compile(outputText, absPath);
  cachedTypesModule = mod.exports;
  return cachedTypesModule;
}

function loadPostModule(filePath) {
  const absPath = path.join(BLOG_DIR, `${filePath}.ts`);
  const src = fs.readFileSync(absPath, 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: absPath,
  });

  // Run the transpiled CJS in a throwaway module so post files can freely
  // `import { BlogPost } from './types'` (a type-only import that
  // transpiles away) without needing a real resolvable ./types.js on disk.
  const Module = require('module');
  const mod = new Module(absPath, null);
  mod.filename = absPath;
  mod.paths = Module._nodeModulePaths(path.dirname(absPath));
  // Post files import from './types' — sometimes just for the BlogPost type
  // (elided at compile time), sometimes for the real `Category` enum used
  // at runtime (e.g. `category: Category.AUDIO`). Route that require to a
  // real transpiled copy of types.ts rather than the file on disk, since
  // this module isn't running through Node's normal TS-aware resolution.
  //
  // A couple of posts also import helpers like AFFILIATE_LINKS from
  // '../lib/affiliate-links', but only to interpolate URLs inside the
  // `content` field — which we strip before ever writing it out. Rather
  // than resolving the app's whole dependency graph (constants.ts, icons,
  // etc.) just to throw it away, stub any non-types relative import with a
  // harmless Proxy that returns '' for anything accessed.
  const originalRequire = mod.require.bind(mod);
  const stub = new Proxy(
    {},
    { get: () => new Proxy({}, { get: () => '' }) }
  );
  mod.require = (id) => {
    if (id === './types') return loadTypesModule();
    if (id.startsWith('.')) return stub;
    return originalRequire(id);
  };
  mod._compile(outputText, absPath);
  return mod.exports.default ?? mod.exports;
}

// ── Step 4: build metadata.ts + loaders.ts output ────────────────────────────
function buildMetadataFile(posts) {
  const seenSlugs = new Map();
  for (const p of posts) {
    if (seenSlugs.has(p.slug)) {
      fail(
        `duplicate slug "${p.slug}" found in both ${seenSlugs.get(p.slug)}.ts and ${p.__filePath}.ts`
      );
    }
    seenSlugs.set(p.slug, p.__filePath);
    if (p.slug !== p.__filePath) {
      console.warn(
        `⚠️  ${p.__filePath}.ts has slug "${p.slug}" — doesn't match its filename. ` +
          `Routing still works (routes use the slug field), but consider renaming the file to match.`
      );
    }
  }

  const entries = posts
    .map((p) => {
      const obj = {};
      for (const field of META_FIELDS) {
        if (p[field] !== undefined) obj[field] = p[field];
      }
      return '  ' + JSON.stringify(obj, null, 2).split('\n').join('\n  ') + ',';
    })
    .join('\n');

  return `// AUTO-GENERATED by scripts/generate-blog-meta.mjs — do not edit by hand.
// Source of truth is blog/index.ts. Add/remove posts there, then run:
//   npm run generate:blog-meta
// This file intentionally omits the heavy \`content\` field so pages that
// only need post metadata (ToolPage "related posts", CategoryPage, etc.)
// don't pull all 90 posts' full HTML into their bundle.

export interface BlogPostMeta {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  datePublished: string;
  dateModified: string;
  author: string;
  category: string;
  readTime: string;
  ogImage?: string;
  excerpt?: string;
}

export const BLOG_POSTS_META: BlogPostMeta[] = [
${entries}
];

export const BLOG_POST_META_BY_SLUG: Record<string, BlogPostMeta> = Object.fromEntries(
  BLOG_POSTS_META.map(post => [post.slug, post])
);
`;
}

function buildLoadersFile(posts) {
  const entries = posts
    .map((p) => `  '${p.slug}': () => import('./${p.__filePath}'),`)
    .join('\n');

  return `// AUTO-GENERATED by scripts/generate-blog-meta.mjs — do not edit by hand.
// Source of truth is blog/index.ts. Add/remove posts there, then run:
//   npm run generate:blog-meta

import type { BlogPost } from './types';

type BlogPostModule = { default: BlogPost };

const BLOG_POST_LOADERS: Record<string, () => Promise<BlogPostModule>> = {
${entries}
};

export async function loadBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const load = BLOG_POST_LOADERS[slug];
  if (!load) return null;
  const mod = await load();
  return mod.default;
}

export const BLOG_POST_SLUGS = Object.keys(BLOG_POST_LOADERS);
`;
}

// ── Main ──────────────────────────────────────────────────────────────────
function main() {
  const indexSrc = fs.readFileSync(INDEX_PATH, 'utf8');
  const orderedImports = parseIndexImports(indexSrc);
  checkForOrphanedFiles(orderedImports);

  const posts = orderedImports.map(({ filePath }) => {
    const post = loadPostModule(filePath);
    if (!post || typeof post !== 'object' || !post.slug) {
      fail(`${filePath}.ts does not "export default { slug: ..., ... }" as expected`);
    }
    for (const required of ['slug', 'title', 'datePublished', 'category', 'readTime']) {
      if (!post[required]) {
        fail(`${filePath}.ts is missing required field "${required}"`);
      }
    }
    return { ...post, __filePath: filePath };
  });

  fs.writeFileSync(METADATA_OUT, buildMetadataFile(posts));
  fs.writeFileSync(LOADERS_OUT, buildLoadersFile(posts));

  console.log(`✅ Generated blog/metadata.ts and blog/loaders.ts from ${posts.length} posts in blog/index.ts`);
}

main();
