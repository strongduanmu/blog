/**
 * 在文章内容后、评论区前注入 Google AdSense 广告
 */
(function() {
  console.log('[AdSense Debug] Script loaded');
  console.log('[AdSense Debug] Current path:', window.location.pathname);

  // 只在文章页面和 wiki 页面注入广告
  const path = window.location.pathname;
  const isBlogPost = path.includes('/blog/') || path.startsWith('blog/');
  const isWikiPage = path.includes('/wiki/') || path.startsWith('wiki/');

  if (!isBlogPost && !isWikiPage) {
    console.log('[AdSense Debug] Not a blog or wiki page, skipping');
    return;
  }

  console.log('[AdSense Debug] Page matched, will insert ad');

  // 等待 DOM 加载完成
  function insertAd() {
    // 查找评论区的位置
    const commentsSection = document.querySelector('#comments');

    if (!commentsSection) {
      console.log('[AdSense Debug] Comments section not found, retrying...');
      // 如果评论区还没加载，延迟再试
      setTimeout(insertAd, 500);
      return;
    }

    // 检查是否已经插入过广告
    if (document.querySelector('.article-bottom-ad')) {
      console.log('[AdSense Debug] Ad already inserted');
      return;
    }

    console.log('[AdSense Debug] Creating ad container');

    // 创建广告容器（固定显示，不隐藏）
    const adContainer = document.createElement('div');
    adContainer.className = 'article-bottom-ad';
    adContainer.style.cssText = `
      margin: 2rem 0;
      padding: 1rem;
      text-align: center;
      border: 1px dashed #e0e0e0;
      background: #fafafa;
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-radius: 10px;
    `;

    const adInner = document.createElement('div');
    adInner.className = 'ad-container';
    adInner.style.cssText = `
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      min-height: 100px;
      width: 100%;
    `;

    // 创建广告元素
    const adIns = document.createElement('ins');
    adIns.className = 'adsbygoogle';
    adIns.style.cssText = 'display: block; width: 100%; min-height: 100px;';
    adIns.setAttribute('data-ad-client', 'ca-pub-9880881761323734');
    adIns.setAttribute('data-ad-slot', '6799117067');
    adIns.setAttribute('data-ad-format', 'auto');
    adIns.setAttribute('data-full-width-responsive', 'true');

    console.log('[AdSense Debug] Ad element created with slot: 6799117067');

    // 添加占位文本（始终显示）
    const placeholder = document.createElement('div');
    placeholder.className = 'ad-placeholder';
    placeholder.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      color: #999;
      font-size: 14px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
      white-space: nowrap;
    `;
    placeholder.innerHTML = '赞助商';

    adInner.appendChild(adIns);
    adInner.appendChild(placeholder);
    adContainer.appendChild(adInner);

    // 在评论区之前插入广告
    commentsSection.parentNode.insertBefore(adContainer, commentsSection);
    console.log('[AdSense Debug] Ad container inserted into page');

    // 监听广告加载状态（仅用于调试，不隐藏任何内容）
    function checkAdStatus() {
      const iframe = adIns.querySelector('iframe');
      const status = adIns.getAttribute('data-adsbygoogle-status');

      console.log('[AdSense Debug] Checking ad status...');
      console.log('[AdSense Debug] data-adsbygoogle-status:', status);
      console.log('[AdSense Debug] Has iframe:', !!iframe);

      if (iframe) {
        console.log('[AdSense Debug] Ad loaded successfully! Hiding placeholder');
        placeholder.style.display = 'none';
        // 如果有真实广告，移除边框和背景
        adContainer.style.border = 'none';
        adContainer.style.background = 'transparent';
        return true;
      }

      if (status === 'done') {
        console.log('[AdSense Debug] AdSense processed but no iframe (no ad content)');
        console.log('[AdSense Debug] Possible reasons: no bids, low bids, or blocked');
        return false;
      }

      return false;
    }

    // 立即检查一次
    checkAdStatus();

    // 定期检查广告状态（仅用于调试）
    let checkCount = 0;
    const checkInterval = setInterval(function() {
      checkCount++;
      const hasAd = checkAdStatus();

      if (hasAd || checkCount >= 20) {
        clearInterval(checkInterval);
        console.log('[AdSense Debug] Final check count:', checkCount);
        console.log('[AdSense Debug] Final status - Has ad:', hasAd);

        if (!hasAd) {
          console.log('[AdSense Debug] No ad loaded. Keeping placeholder visible.');
        }
      }
    }, 500);

    // 推送广告
    try {
      console.log('[AdSense Debug] Pushing ad to AdSense...');
      console.log('[AdSense Debug] adsbygoogle object before push:', window.adsbygoogle);
      (adsbygoogle = window.adsbygoogle || []).push({});
      console.log('[AdSense Debug] Ad pushed successfully');
    } catch (e) {
      console.error('[AdSense Debug] Error pushing ad:', e);
    }

    // 监听广告加载事件
    adIns.addEventListener('DOMContentLoaded', function() {
      console.log('[AdSense Debug] Ad DOMContentLoaded event fired');
    });

    // 监听广告错误
    window.addEventListener('error', function(e) {
      if (e.target === adIns || e.target.src && e.target.src.includes('googlesyndication')) {
        console.error('[AdSense Debug] AdSense script error:', e);
      }
    }, true);
  }

  // 在 DOM 加载完成后执行
  if (document.readyState === 'loading') {
    console.log('[AdSense Debug] Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', insertAd);
  } else {
    console.log('[AdSense Debug] DOM already loaded, executing immediately');
    insertAd();
  }
})();
