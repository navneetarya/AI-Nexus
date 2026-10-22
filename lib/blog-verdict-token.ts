import { TOOLS } from '../constants';
import { getVerifiedFacts, type ToolFacts } from './vendor-facts';

export interface VerdictTokenSegment {
  type: 'html' | 'verdict';
  value: string;
}

const TOKEN_RE = /\{\{verdict:([a-z0-9-]+)\}\}/g;

export function verdictDataForSlug(slug: string): { facts: ToolFacts; affiliateLink: string } {
  const facts = getVerifiedFacts(slug);
  const tool = TOOLS.find((entry) => entry.slug === slug);
  if (!facts || !tool?.affiliateLink) {
    throw new Error(`Invalid verdict token: ${slug} has no verified facts and affiliate link.`);
  }
  return { facts, affiliateLink: tool.affiliateLink };
}

export function parseVerdictTokens(html: string): VerdictTokenSegment[] {
  const segments: VerdictTokenSegment[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(html)) !== null) {
    if (match.index > cursor) segments.push({ type: 'html', value: html.slice(cursor, match.index) });
    verdictDataForSlug(match[1]);
    segments.push({ type: 'verdict', value: match[1] });
    cursor = match.index + match[0].length;
  }
  if (cursor < html.length) segments.push({ type: 'html', value: html.slice(cursor) });
  return segments;
}

export function hasVerdictToken(html: string): boolean {
  TOKEN_RE.lastIndex = 0;
  return TOKEN_RE.test(html);
}
