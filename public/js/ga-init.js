window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag('js', new Date());

var affiliateDomains = [
  'get.murf.ai', 'try.elevenlabs.io', 'elevenlabs.io',
  'rytr.me', 'podcastle.ai', 'ocoya.com', 'taskade.com',
  'writesonic.com', 'quillbot.com', 'frase.io', 'jasper.ai',
  'invideo.io', 'pictory.ai', 'opus.pro', 'descript.com',
  'leonardo.ai', 'photoroom.com', 'looka.com', 'gamma.app',
  'beautiful.ai', 'notion.so', 'perplexity.ai', 'canva.com',
  'replit.com', 'grammarly.com', 'cursor.com', 'lovable.dev',
  'getresponse.com', 'headshotpro.com',
  'fireflies.ai', 'narrato.io', 'make.com', 'lindy.ai',
  'relevanceai.com', 'n8n.io', 'windsurf.com',
  'tidio.com', 'getmunch.ai', 'juicebox.ai', 'vidiq.com'
];

function bindAffiliateClickTracking() {
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    var el = target.closest('a[href]');
    if (!el) {
      return;
    }

    var href = el.getAttribute('href') || '';

    // Only care about real outbound links — skip internal nav (#anchor,
    // /route, relative paths) and non-http schemes (mailto:, tel:, javascript:).
    if (!/^https?:\/\//i.test(href)) {
      return;
    }
    if (href.indexOf('ainexustools.online') !== -1) {
      return;
    }
    if (typeof window.gtag !== 'function') {
      return;
    }

    var matched = affiliateDomains.find(function (domain) {
      return href.indexOf(domain) !== -1;
    });

    // GENERIC CATCH-ALL: fire outbound_click for every external link,
    // affiliate or not. This is what closes the audit-script "untracked
    // domain" gap for good — citation/source links to github.com,
    // anthropic.com, docs sites, etc. get recorded too, instead of only
    // the handful of domains on the affiliateDomains allowlist. New
    // citation links you add later never need a code change to be tracked.
    window.gtag('event', 'outbound_click', {
      destination_domain: href.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0],
      page_path: window.location.pathname,
      destination_url: href,
      is_affiliate: !!matched,
    });

    // KEY/CONVERSION EVENT: only fires for domains on the affiliateDomains
    // allowlist (i.e. links that carry a referral param and earn revenue).
    // Mark this one — not outbound_click — as a Key Event in GA4 Admin.
    if (!matched) {
      return;
    }

    var toolName = matched
      .replace('.ai', '')
      .replace('.com', '')
      .replace('.io', '')
      .replace('.me', '')
      .replace('get.', '')
      .replace('try.', '');

    window.gtag('event', 'affiliate_click', {
      tool_name: toolName,
      page_path: window.location.pathname,
      destination_url: href,
    });
  }, true);
}

// FIX (2026-08-10): bindAffiliateClickTracking() used to run only after
// window.load + requestIdleCallback (up to ~1.5s after load). Any click
// before that point — very common on comparison posts where the reader
// already knows what they want — hit a listener that didn't exist yet,
// so the click was never tracked. window.gtag is already a safe queuing
// stub at this point (dataLayer.push), so it's safe to bind the listener
// immediately at script-parse time instead of waiting.
bindAffiliateClickTracking();

function onIdle(cb) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(cb, { timeout: 1500 });
    return;
  }
  setTimeout(cb, 900);
}

window.trackAffiliate = function trackAffiliate(toolName, destinationUrl) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'affiliate_click', {
      tool_name: toolName,
      page_path: window.location.pathname,
      destination_url: destinationUrl,
    });
  }

  setTimeout(function () {
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  }, 150);
};

// Loading gtag.js itself can stay deferred until idle — dataLayer.push()
// calls made before it loads are queued and processed once it's ready,
// so no clicks are lost even though the library loads late.
window.addEventListener('load', function () {
  onIdle(function () {
    var scriptEl = document.createElement('script');
    scriptEl.src = 'https://www.googletagmanager.com/gtag/js?id=G-9M7R4GGEEK';
    scriptEl.async = true;
    scriptEl.onload = function () {
      window.gtag('config', 'G-9M7R4GGEEK', {
        send_page_view: false,
        custom_map: {
          dimension1: 'page_type',
          dimension2: 'tool_name',
        },
      });
    };
    document.head.appendChild(scriptEl);
  });
});
