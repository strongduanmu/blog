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

// Register the tag
hexo.extend.tag.register(tag_name, function(args, content) {
  return getAdsCode();
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
