/** Dismissible ad-support dialog. Never require allowlisting or ad clicks. */
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
    if (dismissed || !document.querySelector('.l_main') || document.querySelector('.ad-support-notice')) return;
    const notice = document.createElement('dialog');
    notice.className = 'ad-support-notice';
    notice.setAttribute('aria-labelledby', 'ad-support-title');
    notice.setAttribute('aria-describedby', 'ad-support-message');
    const header = document.createElement('div');
    header.className = 'ad-support-header';
    const title = document.createElement('h2');
    title.id = 'ad-support-title';
    title.textContent = '支持本站，允许展示广告';
    const close = document.createElement('button');
    close.type = 'button';
    close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<path d="M6 6L18 18M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    close.setAttribute('aria-label', '关闭广告提示');
    header.append(title, close);
    const message = document.createElement('p');
    message.id = 'ad-support-message';
    message.textContent = cssBlocked
      ? '广告可能被浏览器隐藏。如果这些内容对您有帮助，欢迎仅为本站放行广告，支持博客持续更新。'
      : '本站广告暂未加载。如果您使用了广告拦截工具，欢迎仅为本站放行，支持博客持续更新。';
    const help = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = '查看放行方法';
    const steps = document.createElement('ol');
    [
      '打开浏览器工具栏中的广告拦截扩展，或地址栏旁的隐私保护设置。',
      '选择“在此网站停用”“信任此网站”或“允许此网站的广告”，只对 strongduanmu.com 生效即可。',
      '放行后，点击下方按钮刷新页面。不方便放行也可以继续阅读。'
    ].forEach(function(text) {
      const item = document.createElement('li');
      item.textContent = text;
      steps.append(item);
    });
    help.append(summary, steps);
    const actions = document.createElement('div');
    actions.className = 'ad-support-actions';
    const continueReading = document.createElement('button');
    continueReading.type = 'button';
    continueReading.textContent = '继续阅读';
    continueReading.setAttribute('autofocus', '');
    const refresh = document.createElement('button');
    refresh.type = 'button';
    refresh.className = 'ad-support-refresh';
    refresh.textContent = '已放行，刷新页面';
    refresh.addEventListener('click', function() { location.reload(); });
    actions.append(continueReading, refresh);
    const hint = document.createElement('p');
    hint.className = 'ad-support-hint';
    hint.textContent = '可以直接关闭，关闭后 7 天内不再提示。';
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      try { localStorage.setItem(dismissalKey, String(Date.now())); } catch (error) { /* Optional. */ }
      if (notice.open && typeof notice.close === 'function') notice.close();
      notice.remove();
    }
    close.addEventListener('click', dismiss);
    continueReading.addEventListener('click', dismiss);
    notice.addEventListener('cancel', function(event) { event.preventDefault(); dismiss(); });
    notice.addEventListener('close', dismiss);
    notice.append(header, message, help, actions, hint);
    document.body.append(notice);
    // Native dialog provides a focus trap, Escape dismissal and focus restoration.
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
    if (typeof notice.showModal === 'function') notice.showModal();
    else notice.setAttribute('open', '');
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
