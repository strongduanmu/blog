/**
 * Fix for hexo-google-adsense plugin compatibility with hexo-log 4.x
 * This local plugin provides the GoogleAdsense tag functionality
 */

const fs = require('fs');
const path = require('path');

const config = hexo.config.hexo_google_adsense;
if (!config || !config.enable) {
  return;
}

const tag_name = config.tag_name || 'GoogleAdsense';
const file_path = config.file_path || 'source/ads/google/article_ads.html';
const log_msg = config.log_msg || false;
const auto_insert = config.auto_insert || {};

// Check if file exists
const fullPath = path.join(hexo.base_dir, file_path);

function getAdsCode() {
  try {
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath, 'utf8');
    }
  } catch (e) {
    if (log_msg) {
      hexo.log.warn('GoogleAdsense: Failed to read ad file');
    }
  }
  return '';
}

function isArticleLike(data) {
  const layout = data.layout || data.page_layout;
  return layout === 'post' || layout === 'wiki' || Boolean(data.notebook);
}

function hasInlineAd(content) {
  return typeof content === 'string' && (
    content.includes('article-inline-ad-wrapper') ||
    content.includes('article-inline-ad-container') ||
    content.includes('data-ad-slot="7617691942"')
  );
}

function findInsertionOffsetAfterTopLevelParagraph(content, paragraphIndex) {
  if (typeof content !== 'string' || paragraphIndex < 1) {
    return -1;
  }

  const tagPattern = /<\/?([a-zA-Z0-9-]+)(?:\s[^<>]*?)?\s*\/?>/g;
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const stack = [];
  let paragraphCount = 0;
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    const rawTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosingTag = rawTag.startsWith('</');
    const isSelfClosingTag = rawTag.endsWith('/>') || voidTags.has(tagName);

    if (!isClosingTag) {
      stack.push({
        name: tagName,
        isTopLevelParagraph: tagName === 'p' && stack.length === 0
      });

      if (isSelfClosingTag) {
        stack.pop();
      }
      continue;
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (node.name !== tagName) {
        continue;
      }
      if (tagName === 'p' && node.isTopLevelParagraph) {
        paragraphCount += 1;
        if (paragraphCount === paragraphIndex) {
          return match.index + rawTag.length;
        }
      }
      break;
    }
  }

  return -1;
}

function findInsertionOffsetAfterSecondTopLevelH2Section(content) {
  if (typeof content !== 'string') {
    return -1;
  }

  const tagPattern = /<\/?([a-zA-Z0-9-]+)(?:\s[^<>]*?)?\s*\/?>/g;
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  const stack = [];
  let h2Count = 0;
  let secondH2Seen = false;
  let match;

  while ((match = tagPattern.exec(content)) !== null) {
    const rawTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosingTag = rawTag.startsWith('</');
    const isSelfClosingTag = rawTag.endsWith('/>') || voidTags.has(tagName);

    if (!isClosingTag) {
      const isTopLevel = stack.length === 0;
      stack.push({ name: tagName });

      if (isTopLevel && tagName === 'h2') {
        h2Count += 1;
        if (h2Count === 2) {
          secondH2Seen = true;
        } else if (h2Count === 3 && secondH2Seen) {
          return match.index;
        }
      }

      if (isSelfClosingTag) {
        stack.pop();
      }
      continue;
    }

    while (stack.length > 0) {
      const node = stack.pop();
      if (node.name === tagName) {
        break;
      }
    }
  }

  if (secondH2Seen) {
    return content.length;
  }

  return -1;
}

function insertInlineAd(content, adHtml, paragraphIndex) {
  let insertOffset = findInsertionOffsetAfterSecondTopLevelH2Section(content);
  if (insertOffset === -1) {
    insertOffset = findInsertionOffsetAfterTopLevelParagraph(content, paragraphIndex);
  }
  if (insertOffset === -1) {
    return content;
  }

  return content.slice(0, insertOffset) + '\n\n' + adHtml + '\n\n' + content.slice(insertOffset);
}

// Register the tag
hexo.extend.tag.register(tag_name, function(args, content) {
  return getAdsCode();
});

// Auto insert inline ad after the Nth paragraph of article content.
hexo.extend.filter.register('after_post_render', function(data) {
  if (!auto_insert.enable) {
    return data;
  }

  if (!isArticleLike(data) || !data.content || typeof data.content !== 'string') {
    return data;
  }

  if (data.disable_inline_ads === true || data.disable_ads === true) {
    return data;
  }

  if (hasInlineAd(data.content)) {
    return data;
  }

  const adHtml = getAdsCode();
  if (!adHtml) {
    return data;
  }

  const paragraphIndex = Number(auto_insert.after_paragraph || 2);
  const nextContent = insertInlineAd(data.content, adHtml, paragraphIndex);

  if (nextContent !== data.content) {
    data.content = nextContent;
    if (log_msg) {
      hexo.log.info(`Auto insert Google Adsense at article target position:`, data.title);
    }
  }

  return data;
});

// Add logging filter
if (log_msg) {
  hexo.extend.filter.register('before_post_render', function(data) {
    if (data.content && data.content.includes('{% ' + tag_name + ' %}')) {
      hexo.log.info('Insert Google Adsense code for:', data.title);
    }
    return data;
  });
}

if (log_msg) {
  hexo.log.info('GoogleAdsense plugin loaded successfully');
}
