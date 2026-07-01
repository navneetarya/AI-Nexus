window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
window.gtag('js', new Date());

var affiliateDomains = [
  'get.murf.ai', 'try.elevenlabs.io',
  'rytr.me', 'podcastle.ai', 'ocoya.com', 'taskade.com',
  'writesonic.com', 'quillbot.com', 'frase.io', 'jasper.ai',
  'invideo.io', 'pictory.ai', 'opus.pro', 'descript.com',
  'leonardo.ai', 'photoroom.com', 'looka.com', 'gamma.app',
  'beautiful.ai', 'notion.so', 'perplexity.ai', 'canva.com',
  'replit.com', 'grammarly.com', 'cursor.com', 'lovable.dev',
  'getresponse.com', 'getmunch.com', 'headshotpro.com',
  'fireflies.ai', 'narrato.io', 'make.com', 'lindy.ai',
  'relevanceai.com', 'n8n.io', 'windsurf.com'
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
    var matched = affiliateDomains.find(function (domain) {
      return href.indexOf(domain) !== -1;
    });

    if (!matched || typeof window.gtag !== 'function') {
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

window.addEventListener('load', function () {
  onIdle(function () {
    bindAffiliateClickTracking();

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
