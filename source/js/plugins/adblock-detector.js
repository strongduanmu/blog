/** Optional, dismissible support notice. Never lock the page or require ad clicks. */
(function() {
  'use strict';
  const dismissalKey = 'ad-support-dismissed-at';
  const week = 7 * 24 * 60 * 60 * 1000;
  try {
    const dismissedAt = Number(localStorage.getItem(dismissalKey));
    if (dismissedAt && Date.now() - dismissedAt < week) return;
  } catch (error) { /* Reading does not depend on storage availability. */ }

  let dismissed = false;
  function showNotice(cssBlocked = false) {
    const article = document.querySelector('article.md-text.content');
    if (dismissed || !article || document.querySelector('.ad-support-notice')) return;
    // The theme styles every <aside> as a sticky sidebar; use a normal section.
    const notice = document.createElement('section');
    notice.className = 'ad-support-notice';
    notice.setAttribute('aria-label', '本站广告说明');
    const content = document.createElement('div');
    const message = document.createElement('p');
    message.textContent = cssBlocked
      ? '广告可能被浏览器隐藏。本站通过广告支持内容维护，如愿意支持，可仅为本站放行广告。'
      : '广告暂未加载。如果你使用了广告拦截工具，欢迎仅为本站放行，支持内容维护。';
    const help = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '如何仅为本站放行';
    const steps = document.createElement('ol');
    [
      '打开浏览器工具栏中的广告拦截扩展，或地址栏旁的隐私保护设置。',
      '选择“在此网站停用”“信任此网站”或“允许此网站的广告”，只对 strongduanmu.com 生效即可。',
      '手动刷新页面。你也可以关闭这条提示，继续阅读。'
    ].forEach(function(text) {
      const item = document.createElement('li');
      item.textContent = text;
      steps.append(item);
    });
    help.append(summary, steps);
    content.append(message, help);
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = '继续阅读';
    close.setAttribute('aria-label', '关闭广告说明，继续阅读');
    close.addEventListener('click', function() {
      dismissed = true;
      try { localStorage.setItem(dismissalKey, String(Date.now())); } catch (error) { /* Optional. */ }
      notice.remove();
    });
    notice.append(content, close);
    article.append(notice);
  }

  setTimeout(function() {
    const localPreview = ['localhost', '127.0.0.1'].includes(location.hostname);
    if (localPreview && new URLSearchParams(location.search).get('test-adblock') === '1') {
      showNotice();
      return;
    }
    if (localPreview || !['strongduanmu.com', 'www.strongduanmu.com'].includes(location.hostname)) return;
    // Missing ads or an unavailable network alone do not imply an ad blocker.
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.cssText = 'position:absolute;left:-10000px;width:1px;height:10px;pointer-events:none';
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);
    const blocked = bait.offsetHeight === 0 || getComputedStyle(bait).display === 'none';
    bait.remove();
    const script = document.getElementById('publisher-ads-script');
    function check() {
      // A failed script can also mean a network problem. Use conditional wording,
      // never infer blocking from slow loading, empty slots, or missing iframes.
      if (navigator.onLine === false) return;
      if (blocked || (script && script.getAttribute('data-load-state') === 'error')) showNotice(blocked);
    }
    if (script) script.addEventListener('error', check);
    window.addEventListener('online', check);
    check(); // The async script may have failed before this deferred file ran.
  }, 3000);
})();
