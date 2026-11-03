/** Image presentation must not depend on the theme loading jQuery first. */
(function() {
  'use strict';
  const banner = '/assets/banner/banner_' + (Math.floor(Math.random() * 20) + 1) + '.jpg';
  document.querySelectorAll('.banner img.bg').forEach(function(image) {
    image.setAttribute('src', banner);
  });

  const selector = 'article.md-text img:not(.post-cover img):not(.cover img):not(.card-link img):not(.image-bg img):not(.social img):not(.preview img)';
  document.querySelectorAll(selector).forEach(function(image) {
    const text = image.getAttribute('title') || image.getAttribute('alt');
    const next = image.nextElementSibling;
    if (!text || (next && next.classList.contains('image-meta'))) return;
    const caption = document.createElement('div');
    caption.className = 'image-meta';
    caption.style.textAlign = 'center';
    const label = document.createElement('span');
    label.className = 'image-caption center';
    label.style.cssText = 'display:inline-block;font-size:.8125rem;color:var(--text-p2);line-height:1.5;text-align:justify';
    label.textContent = text;
    caption.appendChild(label);
    image.after(caption);
  });
})();
