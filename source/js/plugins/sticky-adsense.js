/**
 * 右侧赞助商组件固定定位
 */
(function() {
  'use strict';

  function initStickyAdSense() {
    // 多次尝试查找右侧栏，因为可能还没加载
    function tryInit(retryCount = 0) {
      const rightbar = document.querySelector('.l_right');

      if (!rightbar) {
        if (retryCount < 10) {
          setTimeout(function() {
            tryInit(retryCount + 1);
          }, 500);
        }
        return;
      }

      // 查找赞助商组件（可能是 adsense widget 或标题为"赞助商"的 markdown widget）
      let adsenseWidget = rightbar.querySelector('.widget-wrapper.adsense');

      // 如果找不到 adsense widget，尝试找标题为"赞助商"的 markdown widget
      if (!adsenseWidget) {
        const markdownWidgets = rightbar.querySelectorAll('.widget-wrapper.markdown');
        markdownWidgets.forEach(function(widget) {
          const header = widget.querySelector('.widget-header .name');
          if (header && (header.textContent.includes('赞助商') || header.textContent.includes('Sponsor'))) {
            adsenseWidget = widget;
          }
        });
      }

      if (!adsenseWidget) {
        return;
      }

      // 在PC端才启用sticky
      if (window.innerWidth < 1024) {
        return;
      }

      let isFixed = false;
      let widgetTop = 0;

      function updatePosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (!isFixed && scrollTop > widgetTop) {
          // 开始固定
          adsenseWidget.style.position = 'fixed';
          adsenseWidget.style.top = '1rem';
          adsenseWidget.style.width = rightbar.offsetWidth + 'px';
          adsenseWidget.style.zIndex = '100';
          isFixed = true;
        } else if (isFixed && scrollTop <= widgetTop) {
          // 取消固定
          adsenseWidget.style.position = '';
          adsenseWidget.style.top = '';
          adsenseWidget.style.width = '';
          adsenseWidget.style.zIndex = '';
          isFixed = false;
        }
      }

      // 初始化位置
      const rect = adsenseWidget.getBoundingClientRect();
      widgetTop = rect.top + window.pageYOffset;

      // 监听滚动
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', function() {
        // 窗口大小改变时重新初始化
        adsenseWidget.style.position = '';
        adsenseWidget.style.top = '';
        adsenseWidget.style.width = '';
        adsenseWidget.style.zIndex = '';
        isFixed = false;
        setTimeout(function() {
          const rect = adsenseWidget.getBoundingClientRect();
          widgetTop = rect.top + window.pageYOffset;
        }, 100);
      });
    }

    // 开始尝试初始化
    tryInit();
  }

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStickyAdSense);
  } else {
    initStickyAdSense();
  }
})();
