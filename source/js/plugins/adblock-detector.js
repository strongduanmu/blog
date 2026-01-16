/**
 * 广告拦截检测和强制提示
 * 必须关闭广告拦截器或将网站加入白名单才能继续浏览
 */
(function() {
  'use strict';

  console.log('[Adblock Detector] Script loaded');

  function initAdblockDetector() {
    // 检测广告拦截
    function detectAdblock() {
      // 临时测试：检查 URL 参数 ?test-adblock=1
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test-adblock') === '1') {
        console.log('[Adblock Detector] TEST MODE: Simulating ad block detection');
        return true;
      }

      // 方法1: 检查 AdSense 脚本是否被阻止
      // 页面中有一个 AdSense 脚本，如果被阻止，window.adsbygoogle 不会存在
      const adSenseScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
      console.log('[Adblock Detector] AdSense script found:', !!adSenseScript);

      if (adSenseScript) {
        // 检查 adsbygoogle 对象是否存在
        // 注意：需要在其他脚本创建这个对象之前检查
        // 所以我们在脚本加载后延迟一段时间再检查
        if (typeof window.adsbygoogle === 'undefined') {
          console.log('[Adblock Detector] AdSense script blocked - adsbygoogle is undefined');
          return true;
        } else {
          console.log('[Adblock Detector] adsbygoogle exists:', window.adsbygoogle.length);

          // 检查 adsbygoogle 数组是否为空
          // 如果脚本成功加载，通常会至少有一个元素（由其他脚本 push 的）
          // 但我们可以检查是否有实际的广告被加载
          const ads = document.querySelectorAll('ins.adsbygoogle');
          console.log('[Adblock Detector] Found ads elements:', ads.length);

          // 检查是否有广告内容（iframe）
          let hasAdContent = false;
          ads.forEach(function(ad) {
            if (ad.querySelector('iframe')) {
              hasAdContent = true;
            }
          });

          console.log('[Adblock Detector] Has ad content (iframe):', hasAdContent);

          // 如果有广告元素但没有内容，可能是被拦截了
          if (ads.length > 0 && !hasAdContent) {
            // 给广告一些时间加载
            // 但我们可以先返回检测结果
            console.log('[Adblock Detector] Ads exist but no content loaded yet');
          }
        }
      }

      // 方法2: 使用经典的 adsbox 诱饵检测
      const bait = document.createElement('div');
      bait.innerHTML = '&nbsp;';
      bait.className = 'adsbox';
      bait.style.position = 'absolute';
      bait.style.left = '-10000px';
      document.body.appendChild(bait);

      const baitBlocked = (
        bait.offsetHeight === 0 ||
        bait.offsetHeight === 1 ||
        window.getComputedStyle(bait).display === 'none' ||
        window.getComputedStyle(bait).visibility === 'hidden'
      );

      console.log('[Adblock Detector] Bait element:', {
        offsetHeight: bait.offsetHeight,
        display: window.getComputedStyle(bait).display,
        blocked: baitBlocked
      });

      // 清理
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }

      if (baitBlocked) {
        console.log('[Adblock Detector] Bait element blocked');
        return true;
      }

      console.log('[Adblock Detector] No ad blocker detected');
      return false;
    }

    const createMandatoryPrompt = function() {
      console.log('[Adblock Detector] Creating mandatory prompt');

      // 移除旧的提示（如果存在）
      const existingPrompt = document.getElementById('adblock-mandatory-prompt');
      if (existingPrompt) {
        existingPrompt.remove();
      }

      // 创建强制提示遮罩（磨砂玻璃效果）
      const promptOverlay = document.createElement('div');
      promptOverlay.id = 'adblock-mandatory-prompt';
      promptOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.15);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
      `;

      const promptContent = document.createElement('div');
      promptContent.style.cssText = `
        max-width: 520px;
        width: 90%;
        padding: 2.5rem;
        background: rgba(255, 255, 255, 0.85);
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        color: var(--text-p1);
        font-size: 16px;
        line-height: 1.6;
        animation: slideIn 0.3s ease-out;
      `;

      // 添加动画样式
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `;
      document.head.appendChild(style);

      const icon = document.createElement('div');
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
      icon.style.cssText = `
        margin: 0 auto 1.5rem auto;
        color: var(--theme-color);
        animation: pulse 2s ease-in-out infinite;
      `;

      const title = document.createElement('h2');
      title.textContent = '检测到广告拦截器';
      title.style.cssText = `
        font-size: 22px;
        font-weight: 600;
        margin: 0 0 1.5rem 0;
        color: var(--text-p1);
      `;

      const message = document.createElement('div');
      message.innerHTML = `
        <p style="margin: 0 0 1.5rem 0; color: var(--text-p2); line-height: 1.8; font-size: 15px;">
          检测到广告拦截器，辛苦您放行本站，创作不易，感谢您的支持。
        </p>
        <div style="text-align: left; background: var(--block); padding: 1.25rem 1.5rem; border-radius: 12px; margin: 0 auto 1.5rem auto; font-size: 14px; line-height: 1.8; color: var(--text-p2);">
          <div style="margin-bottom: 0.75rem; display: flex; align-items: flex-start;">
            <span style="color: var(--theme-color); font-weight: 600; margin-right: 0.5rem; min-width: 60px;">方法 1</span>
            <span style="flex: 1;">暂时关闭广告拦截插件，然后刷新本页面</span>
          </div>
          <div style="display: flex; align-items: flex-start;">
            <span style="color: var(--theme-color); font-weight: 600; margin-right: 0.5rem; min-width: 60px;">方法 2</span>
            <span style="flex: 1;">将本站加入白名单或信任列表，然后刷新本页面</span>
          </div>
        </div>
      `;

      const refreshBtn = document.createElement('button');
      refreshBtn.className = 'btn';
      refreshBtn.textContent = '刷新页面';
      refreshBtn.style.cssText = `
        padding: 0.625rem 2rem;
        background: var(--theme-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      `;
      refreshBtn.onmouseover = function() {
        this.style.opacity = '0.85';
        this.style.transform = 'translateY(-1px)';
      };
      refreshBtn.onmouseout = function() {
        this.style.opacity = '1';
        this.style.transform = 'translateY(0)';
      };
      refreshBtn.onclick = function() {
        location.reload();
      };

      promptContent.appendChild(icon);
      promptContent.appendChild(title);
      promptContent.appendChild(message);
      promptContent.appendChild(refreshBtn);
      promptOverlay.appendChild(promptContent);

      document.body.appendChild(promptOverlay);

      // 禁止页面滚动
      document.body.style.overflow = 'hidden';

      console.log('[Adblock Detector] Mandatory prompt displayed');
    };

    // 白名单标记：用户已经放行了本站
    var whitelistMarked = false;
    var checkInterval = null;

    // 检查是否在白名单中
    function checkWhitelist() {
      try {
        var whitelist = localStorage.getItem('adblock_whitelist');
        if (whitelist === 'true') {
          whitelistMarked = true;
          console.log('[Adblock Detector] Site is whitelisted, skipping checks');
          return true;
        }
      } catch (e) {
        // localStorage 可能被禁用
      }
      return false;
    }

    // 标记为白名单
    function markWhitelist() {
      try {
        localStorage.setItem('adblock_whitelist', 'true');
        whitelistMarked = true;
        console.log('[Adblock Detector] Site marked as whitelisted');
      } catch (e) {
        // localStorage 可能被禁用
      }
    }

    // 执行检测并处理结果
    function performDetection(showPrompt) {
      // 每次都执行检测，不跳过
      const isBlocked = detectAdblock();
      const promptExists = !!document.getElementById('adblock-mandatory-prompt');

      if (isBlocked) {
        console.log('[Adblock Detector] Ad blocker detected');

        // 检测到广告拦截，清除白名单标记
        if (whitelistMarked) {
          whitelistMarked = false;
          try {
            localStorage.removeItem('adblock_whitelist');
            console.log('[Adblock Detector] Cleared whitelist mark');
          } catch (e) {
            // ignore
          }
        }

        // 检查弹框是否被移除
        if (!promptExists) {
          console.log('[Adblock Detector] Prompt was removed, recreating');
          createMandatoryPrompt();
        } else {
          console.log('[Adblock Detector] Prompt exists, ensuring body overflow is hidden');
          // 确保页面无法滚动
          document.body.style.overflow = 'hidden';
        }
      } else {
        console.log('[Adblock Detector] No ad blocker detected');

        // 没有检测到广告拦截，标记白名单并停止定时检测
        if (!whitelistMarked) {
          whitelistMarked = true;
          try {
            localStorage.setItem('adblock_whitelist', 'true');
            console.log('[Adblock Detector] Site marked as whitelisted');
          } catch (e) {
            // ignore
          }

          // 停止定时检测
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
            console.log('[Adblock Detector] Stopping periodic checks');
          }
        }

        // 移除弹框（如果存在）
        if (promptExists) {
          const prompt = document.getElementById('adblock-mandatory-prompt');
          prompt.remove();
          document.body.style.overflow = '';
          console.log('[Adblock Detector] Removed prompt as ads are now allowed');
        }
      }
    }

    // 首次检测：延迟3秒确保页面加载完成
    setTimeout(function() {
      console.log('[Adblock Detector] Starting initial detection');
      performDetection(true);

      // 启动定时检测：每30秒检测一次
      if (!checkInterval) {
        checkInterval = setInterval(function() {
          console.log('[Adblock Detector] Running periodic check');
          performDetection(false);
        }, 30000); // 30秒间隔

        console.log('[Adblock Detector] Started periodic checks (30s interval)');
      }
    }, 3000);
  }

  // 页面加载后立即初始化
  if (document.readyState === 'loading') {
    console.log('[Adblock Detector] Waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initAdblockDetector);
  } else {
    console.log('[Adblock Detector] DOM ready, executing immediately');
    initAdblockDetector();
  }
})();
