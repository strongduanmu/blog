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

    // 创建广告容器（带占位框）
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
    `;

    // 创建广告元素
    const adIns = document.createElement('ins');
    adIns.className = 'adsbygoogle';
    adIns.style.cssText = 'display: block; width: 100%; min-height: 100px;';
    adIns.setAttribute('data-ad-client', 'ca-pub-9880881761323734');
    adIns.setAttribute('data-ad-slot', '6799117067');
    adIns.setAttribute('data-ad-format', 'auto');
    adIns.setAttribute('data-full-width-responsive', 'true');

    // 添加占位文本（默认显示"赞助商"）
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

    // 监听广告加载状态，如果广告成功加载则隐藏占位文本和边框
    function checkAdLoaded() {
      // 检查是否有 iframe（广告加载成功的标志）
      const iframe = adIns.querySelector('iframe');
      if (iframe && iframe.contentDocument) {
        // iframe 存在且有内容，说明广告加载成功
        placeholder.style.display = 'none';
        // 移除边框和背景
        adContainer.style.border = 'none';
        adContainer.style.background = 'transparent';
        return true;
      }

      // 检查 AdSense 是否已经处理完成（data-adsbygoogle-status="done"）
      // 如果完成但没有 iframe，说明没有展示广告，隐藏占位框但保留样式
      if (adIns.getAttribute('data-adsbygoogle-status') === 'done') {
        // AdSense 处理完成，延迟一段时间再最终检查
        setTimeout(function() {
          const finalIframe = adIns.querySelector('iframe');
          if (!finalIframe) {
            // 没有广告内容，完全移除占位框和边框背景
            placeholder.style.display = 'none';
            adContainer.style.border = 'none';
            adContainer.style.background = 'transparent';
            adContainer.style.padding = '0';
            adContainer.style.minHeight = '0';
          }
        }, 1000);
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
        // 超过检查次数后，隐藏占位框
        if (checkCount >= 20) {
          placeholder.style.display = 'none';
          adContainer.style.border = 'none';
          adContainer.style.background = 'transparent';
          adContainer.style.padding = '0';
          adContainer.style.minHeight = '0';
        }
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
