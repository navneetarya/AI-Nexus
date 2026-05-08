#!/usr/bin/env node
/**
 * generate-icons.mjs — Creates apple-touch-icon.png (180x180) and icon-512.png (512x512)
 * from the favicon.svg source. Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dir, '../public');
const svgPath = resolve(PUBLIC, 'favicon.svg');

const svg = readFileSync(svgPath);

// Apple touch icon — 180x180
await sharp(svg).resize(180, 180).png().toFile(resolve(PUBLIC, 'apple-touch-icon.png'));
console.log('  ✓  apple-touch-icon.png (180×180)');

// PWA manifest icon — 512x512
await sharp(svg).resize(512, 512).png().toFile(resolve(PUBLIC, 'icon-512.png'));
console.log('  ✓  icon-512.png (512×512)');
