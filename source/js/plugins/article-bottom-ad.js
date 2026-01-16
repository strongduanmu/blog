/**
 * 在文章内容后、评论区前注入 Google AdSense 广告
 */
(function() {
  // 只在文章页面和 wiki 页面注入广告
  const path = window.location.pathname;
  const isBlogPost = path.includes('/blog/') || path.startsWith('blog/');
  const isWikiPage = path.includes('/wiki/') || path.startsWith('wiki/');

  if (!isBlogPost && !isWikiPage) {
    return;
  }

  // 等待 DOM 加载完成
  function insertAd() {
    // 查找评论区的位置
    const commentsSection = document.querySelector('#comments');

    if (!commentsSection) {
      // 如果评论区还没加载，延迟再试
      setTimeout(insertAd, 500);
      return;
    }

    // 检查是否已经插入过广告
    if (document.querySelector('.article-bottom-ad')) {
      return;
    }

    // 创建广告容器（使用 widget-wrapper 结构）
    const adContainer = document.createElement('div');
    adContainer.className = 'widget-wrapper article-bottom-ad';

    // 创建 widget-body
    const widgetBody = document.createElement('div');
    widgetBody.className = 'widget-body fs14';
    widgetBody.style.cssText = `
      position: relative;
      background: var(--block);
      border-radius: 10px;
      padding: 0.5rem;
    `;

    // 创建内层 div 放置广告
    const adInnerWrapper = document.createElement('div');
    adInnerWrapper.style.cssText = `
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.5rem;
      background: var(--card);
    `;

    // 创建广告元素
    const adIns = document.createElement('ins');
    adIns.className = 'adsbygoogle';
    adIns.style.display = 'block';
    adIns.setAttribute('data-ad-client', 'ca-pub-9880881761323734');
    adIns.setAttribute('data-ad-slot', '6799117067');
    adIns.setAttribute('data-ad-format', 'auto');
    adIns.setAttribute('data-full-width-responsive', 'true');

    // 创建底部赞助商标签（图片说明样式）
    const sponsorLabel = document.createElement('div');
    sponsorLabel.className = 'image-caption center';
    sponsorLabel.style.cssText = `
      display: inline-block;
      font-size: .8125rem;
      color: var(--text-p2);
      line-height: 1.5;
      text-align: center;
      margin-top: 0.5rem;
    `;
    sponsorLabel.textContent = '赞助商';

    adInnerWrapper.appendChild(adIns);
    widgetBody.appendChild(adInnerWrapper);
    widgetBody.appendChild(sponsorLabel);
    adContainer.appendChild(widgetBody);

    // 在评论区之前插入广告
    commentsSection.parentNode.insertBefore(adContainer, commentsSection);

    // 监听广告加载状态
    function checkAdLoaded() {
      const iframe = adIns.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        // 广告加载成功
        return true;
      }
      return false;
    }

    // 立即检查一次
    if (checkAdLoaded()) {
      return;
    }

    // 定期检查广告是否加载
    let checkCount = 0;
    const checkInterval = setInterval(function() {
      checkCount++;
      if (checkAdLoaded() || checkCount >= 20) {
        clearInterval(checkInterval);
      }
    }, 500);

    // 推送广告
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // 忽略错误
    }
  }

  // 在 DOM 加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertAd);
  } else {
    insertAd();
  }
})();
