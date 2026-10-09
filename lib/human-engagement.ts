// lib/human-engagement.ts
//
// WHY THIS EXISTS (Oct 2026 GA4 audit)
// GA4 showed ~800 "Direct" users at 4.6% engagement and 564 Singapore users averaging 0.59s per
// session. That traffic is almost certainly automated, and it makes every per-page engagement
// number in GA4 unreliable. GA4's built-in "engaged session" cannot separate bots from people,
// so this module fires one custom event, `engaged_human`, only when BOTH are true on a page:
//
//   1. the tab was actually visible for at least DWELL_MS (accumulated, not wall-clock), and
//   2. the visitor produced at least one real input event (pointer, key, wheel or touch).
//
// Plain HTTP scrapers and most headless crawlers never produce input events, so they never fire
// this. CAVEAT: a bot that drives a real browser and synthesises input through the browser's
// debugging protocol can still look human here. Treat `engaged_human` as a strong filter, not a
// guarantee, and keep the Cloudflare-side bot rules as the second layer.
//
// SETUP IN GA4 (one-time, no code): Admin -> Events -> mark `engaged_human` as a key event, and
// register `interaction` and `page_type` as custom dimensions if you want them in reports.
// Build an Exploration segment "Human" = sessions that contain the `engaged_human` event.

const DWELL_MS = 10_000;
const TICK_MS = 1_000;
const INPUT_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;

/** Pages already counted in this tab, so SPA back/forward navigation cannot double-fire. */
const firedPaths = new Set<string>();

let stopCurrent: (() => void) | null = null;

/** Stops tracking for the current page (called automatically when the next page starts). */
export function stopHumanEngagement(): void {
  if (stopCurrent) {
    stopCurrent();
    stopCurrent = null;
  }
}

/**
 * Starts tracking for one page view. Call it once per page_view (initial load and every SPA
 * navigation). Safe to call when gtag is blocked: it simply never sends anything.
 */
export function startHumanEngagement(pagePath: string, pageType: string): void {
  stopHumanEngagement();
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (firedPaths.has(pagePath)) return;

  let visibleMs = 0;
  let lastTick = performance.now();
  let interaction: string | null = null;

  const onInput = (e: Event) => {
    // isTrusted is false for events created by page scripts via dispatchEvent().
    if (!e.isTrusted) return;
    if (!interaction) interaction = e.type;
  };

  INPUT_EVENTS.forEach((type) =>
    window.addEventListener(type, onInput, { passive: true, capture: true })
  );

  const timer = window.setInterval(() => {
    const now = performance.now();
    // Only count time while the tab is in the foreground.
    if (document.visibilityState === 'visible') visibleMs += now - lastTick;
    lastTick = now;

    if (visibleMs >= DWELL_MS && interaction) {
      firedPaths.add(pagePath);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'engaged_human', {
          page_path: pagePath,
          page_type: pageType,
          engaged_seconds: Math.round(visibleMs / 1000),
          interaction,
        });
      }
      stopHumanEngagement();
    }
  }, TICK_MS);

  stopCurrent = () => {
    window.clearInterval(timer);
    INPUT_EVENTS.forEach((type) =>
      window.removeEventListener(type, onInput, { capture: true } as EventListenerOptions)
    );
  };
}
