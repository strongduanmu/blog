/**
 * img_alt_fix.js
 * Fix missing alt attribute for images
 * 1. When img tag has title but no alt, use title as alt
 * 2. When img tag has no alt and no title, generate alt from data-src or src
 */

'use strict';

hexo.extend.filter.register('after_render:html', function(htmlContent) {
  // Fix 1: if img has title but no alt, copy title to alt
  htmlContent = htmlContent.replace(/<img([^>]*?)title="([^"]*)"([^>]*?)>/gi, function(match, before, title, after) {
    if (!/alt="/gi.test(match)) {
      return '<img' + before + 'title="' + title + '" alt="' + title + '"' + after + '>';
    }
    return match;
  });

  // Fix 2: if img has no alt and no title, generate alt from data-src or src
  htmlContent = htmlContent.replace(/<img([^>]*)>/gi, function(match, attrs) {
    // Skip if already has alt
    if (/alt="/gi.test(match)) {
      return match;
    }

    // Skip if has title (already handled above)
    if (/title="/gi.test(match)) {
      return match;
    }

    // Try to get src from data-src (lazyload) first, then src
    let srcPath = '';
    const dataSrcMatch = attrs.match(/data-src="([^"]*)"/);
    if (dataSrcMatch) {
      srcPath = dataSrcMatch[1];
    } else {
      const srcMatch = attrs.match(/src="([^"]*)"/);
      if (srcMatch && !srcMatch[1].startsWith('data:image')) {
        srcPath = srcMatch[1];
      }
    }

    // Generate alt text from path
    let altText = '';
    if (srcPath) {
      const filename = srcPath.split('/').pop().split('.')[0];
      // Convert filename to readable text
      altText = filename
        .replace(/[-_]/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    // Try class name if no src or empty alt
    if (!altText) {
      const classMatch = attrs.match(/class="([^"]*)"/);
      if (classMatch) {
        const mainClass = classMatch[1].split(' ').find(c => c && c !== 'lazy');
        if (mainClass) {
          altText = mainClass.charAt(0).toUpperCase() + mainClass.slice(1);
        }
      }
    }

    // Final fallback
    if (!altText) {
      altText = 'Image';
    }

    // Insert alt attribute
    return match.replace('<img', '<img alt="' + altText + '"');
  });

  return htmlContent;
}, 99);
