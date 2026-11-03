/** Optional, dismissible support notice. Never lock the page or require ad clicks. */
(function() {
  'use strict';
  const dismissalKey = 'ad-support-dismissed-at';
  const week = 7 * 24 * 60 * 60 * 1000;
  try {
    const dismissedAt = Number(localStorage.getItem(dismissalKey));
    if (dismissedAt && Date.now() - dismissedAt < week) return;
  } catch (error) { /* Reading does not depend on storage availability. */ }

  function showNotice() {
    const article = document.querySelector('article.md-text.content');
    if (!article || document.querySelector('.ad-support-notice')) return;
    const notice = document.createElement('aside');
    notice.className = 'ad-support-notice';
    notice.setAttribute('aria-label', '本站广告说明');
    const message = document.createElement('p');
    message.textContent = '本站通过广告支持内容维护。如愿意支持，可将本站加入广告拦截白名单；你也可以继续阅读。';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '关闭';
    close.setAttribute('aria-label', '关闭广告说明，继续阅读');
    close.addEventListener('click', function() {
      try { localStorage.setItem(dismissalKey, String(Date.now())); } catch (error) { /* Optional. */ }
      notice.remove();
    });
    notice.append(message, close);
    article.append(notice);
  }

  setTimeout(function() {
    const localPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (localPreview && new URLSearchParams(location.search).get('test-adblock') === '1') {
      showNotice();
      return;
    }
    if (localPreview) return;
    // Missing ads or an unavailable network alone do not imply an ad blocker.
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.cssText = 'position:absolute;left:-10000px;width:1px;height:10px;pointer-events:none';
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);
    const blocked = bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
    bait.remove();
    if (blocked) showNotice();
  }, 3000);
})();
