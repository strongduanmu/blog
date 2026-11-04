/**
 * Request each publisher ad once, shortly before it becomes visible.
 * Preview hosts never request ads. AdSense controls the creative's size/content.
 * https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 * https://support.google.com/adsense/answer/10762946
 */
(function() {
  'use strict';

  const liveSite = ['strongduanmu.com', 'www.strongduanmu.com'].includes(location.hostname);
  const requested = new WeakSet();
  const article = document.querySelector('article.md-text.content');
  const comments = document.querySelector('#comments');

  // Keep the existing bottom slot, without polling for comments or duplicating it.
  if (article && comments && article.textContent.trim().length >= 1000 &&
      !document.querySelector('.article-bottom-ad') &&
      /\/(blog|wiki)\//.test(location.pathname)) {
    const bottom = document.createElement('section');
    bottom.className = 'article-bottom-ad';
    bottom.setAttribute('aria-label', '广告');
    bottom.innerHTML = '<div class="ad-container">' +
      '<ins class="publisher-ad-unit" style="display:block" ' +
      'data-ad-client="ca-pub-9880881761323734" data-ad-slot="6799117067" ' +
      'data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
    comments.before(bottom);
  }

  const units = Array.from(document.querySelectorAll('ins.publisher-ad-unit[data-ad-slot]'));
  const wrappers = new Map();

  units.forEach(function(unit) {
    const wrapper = unit.closest('.article-inline-ad-wrapper, .article-bottom-ad, .widget-wrapper');
    if (!wrapper) return;
    wrappers.set(unit, wrapper);
    wrapper.classList.add('publisher-ad');
    wrapper.setAttribute('aria-label', '广告');
    if (unit.closest('.l_right')) wrapper.classList.add('adsense-widget');
    if (!liveSite) wrapper.classList.add('ad-preview');
  });

  if (!liveSite) return;

  // Avoid collapsing a visible slot while the reader is looking at it.
  const emptyObserver = window.IntersectionObserver ? new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting && entry.target.classList.contains('ad-unfilled')) {
        entry.target.hidden = true;
        emptyObserver.unobserve(entry.target);
      }
    });
  }) : null;

  units.forEach(function(unit) {
    const wrapper = wrappers.get(unit);
    if (!wrapper) return;
    new MutationObserver(function() {
      if (unit.getAttribute('data-ad-status') !== 'unfilled') return;
      wrapper.classList.add('ad-unfilled');
      const rect = wrapper.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
        wrapper.hidden = true;
      } else if (emptyObserver) {
        emptyObserver.observe(wrapper);
      }
    }).observe(unit, { attributes: true, attributeFilter: ['data-ad-status'] });
  });

  function request(unit) {
    if (requested.has(unit) || unit.hasAttribute('data-adsbygoogle-status') ||
        document.visibilityState === 'hidden' || unit.getBoundingClientRect().width <= 0) return;
    requested.add(unit);
    // Only ready slots enter AdSense's queue; push({}) processes uninitialized
    // .adsbygoogle elements in document order, not the observed element itself.
    unit.classList.add('adsbygoogle');
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      // Do not refresh or retry a processed ad unit.
      console.warn('AdSense unit could not be requested.', error);
    }
  }

  function requestNearby() {
    units.forEach(function(unit) {
      const rect = unit.getBoundingClientRect();
      if (rect.bottom >= -300 && rect.top <= window.innerHeight + 300 &&
          rect.right > 0 && rect.left < window.innerWidth) request(unit);
    });
  }

  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        request(entry.target);
        if (requested.has(entry.target)) observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });
    units.forEach(function(unit) { observer.observe(unit); });
  } else {
    window.addEventListener('scroll', requestNearby, { passive: true });
  }
  window.addEventListener('resize', requestNearby, { passive: true });
  document.addEventListener('visibilitychange', requestNearby);
  requestNearby();
})();
