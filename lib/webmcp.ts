/**
 * WebMCP tool registration — https://webmachinelearning.github.io/webmcp/
 *
 * WebMCP is a browser-native API (Chrome 146+, Edge 147+ behind capability
 * checks) that lets a page register structured tools an in-browser AI agent
 * can call directly, instead of scraping rendered HTML. It is NOT the Model
 * Context Protocol — no JSON-RPC, no server, purely client-side.
 *
 * Deliberately minimal: only two tools, both read-only, both surfacing data
 * that isn't already covered by a standard (sitemap, llms.txt, JSON-LD,
 * markdown alternates). A tool for "search" or "list tools" would just
 * duplicate what /llms.txt and the homepage grid already do — see the
 * reasoning in CLOUDFLARE_AGENT_READY_SETUP.md before adding more here.
 *
 * No-op everywhere WebMCP isn't supported (i.e. everywhere today except a
 * couple of Chromium builds behind a flag) — safe to call unconditionally.
 */
import { TOOLS } from '../constants';
import type { Tool } from '../types';

type WebMCPToolResult = { content: Array<{ type: 'text'; text: string }> };

declare global {
  interface Navigator {
    modelContext?: {
      registerTool: (tool: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        annotations?: Record<string, unknown>;
        execute: (input: any) => Promise<WebMCPToolResult> | WebMCPToolResult;
      }) => void;
    };
  }
}

function toSummary(tool: Tool) {
  return {
    name: tool.name,
    slug: tool.slug,
    url: `https://ainexustools.online/tools/${tool.slug}/`,
    category: tool.category,
    tagline: tool.tagline,
    pricing: tool.pricing ?? null,
    bestFor: tool.bestFor ?? null,
    pros: tool.pros ?? [],
    cons: tool.cons ?? [],
  };
}

export function registerWebMCPTools(): void {
  if (typeof navigator === 'undefined' || !('modelContext' in navigator) || !navigator.modelContext) {
    return;
  }

  navigator.modelContext.registerTool({
    name: 'search_ai_tools',
    description:
      'Search AI Nexus\'s independently reviewed AI tools by category and/or keyword. Returns tool name, URL, pricing, best-for verdict, and top pros/cons for each match. Use this instead of scraping the homepage grid.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword to match against tool name, tagline, or description' },
        category: { type: 'string', description: 'Optional category filter, e.g. "Writing", "Video", "Coding"' },
        limit: { type: 'integer', minimum: 1, maximum: 25 },
      },
    },
    annotations: { readOnlyHint: true },
    execute: ({ query, category, limit }: { query?: string; category?: string; limit?: number }): WebMCPToolResult => {
      const needle = query?.trim().toLowerCase();
      const cat = category?.trim().toLowerCase();
      const cap = Math.min(limit ?? 10, 25);
      const matches = TOOLS.filter((t) => {
        if (cat && String(t.category).toLowerCase() !== cat) return false;
        if (needle) {
          const hay = `${t.name} ${t.tagline} ${t.description}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      }).slice(0, cap).map(toSummary);
      return { content: [{ type: 'text', text: JSON.stringify(matches) }] };
    },
  });

  navigator.modelContext.registerTool({
    name: 'get_ai_tool_review',
    description:
      'Get the full independently-researched review for one AI tool on AI Nexus by exact slug (e.g. "grammarly", "chatgpt", "claude-ai"). Returns pricing breakdown, pros/cons, features, and setup steps. Use search_ai_tools first if you don\'t know the exact slug.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Exact tool slug as returned by search_ai_tools' },
      },
      required: ['slug'],
    },
    annotations: { readOnlyHint: true },
    execute: ({ slug }: { slug: string }): WebMCPToolResult => {
      const tool = TOOLS.find((t) => t.slug === slug);
      if (!tool) {
        return { content: [{ type: 'text', text: JSON.stringify({ error: `No tool with slug "${slug}". Call search_ai_tools to find valid slugs.` }) }] };
      }
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...toSummary(tool),
              reviewBody: (tool as any).reviewBody ?? tool.description,
              features: tool.features ?? [],
              pricingBreakdown: tool.pricingBreakdown ?? [],
              affiliateDisclosure: 'https://ainexustools.online/disclosure/',
            }),
          },
        ],
      };
    },
  });
}
