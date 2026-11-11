'use strict';

const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

// The Markdown renderer generates KaTeX 0.12.0 markup at build time.
const katexBase = 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/';
const katexCss = `<link rel="stylesheet" href="${katexBase}katex.min.css" integrity="sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X" crossorigin="anonymous">`;
const placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';

hexo.extend.filter.register('before_generate', function() {
  this.theme.setView('_plugins/index.ejs', fs.readFileSync(path.join(this.base_dir, 'layout/_plugins/index.ejs'), 'utf8'));
});

hexo.extend.helper.register('needs_mermaid', function(content) {
  const $ = cheerio.load(content);
  return $('pre.mermaid, .mermaid').length > 0;
});

// Let the banner script choose one URL before the theme's lazy loader starts.
// The original URL remains a no-JavaScript fallback, never a second live request.
// Keep the live image adjacent to .content for the theme's banner styles.
hexo.extend.filter.register('after_render:html', function(html) {
  return html.replace(/<div class="article banner top">\s*<img class="bg" src="([^"]+)"\s*\/?>/g, (match, url) =>
    match.replace(/<img[\s\S]+$/, `<noscript><img class="bg" no-lazy src="${url}"></noscript><img class="bg" no-lazy src="${placeholder}" data-random-banner data-src="${url}">`));
}, 9);

// Inspect final markup so excerpts and pages without front matter are covered.
hexo.extend.filter.register('after_render:html', function(html) {
  if (!/<html[\s>]/i.test(html)) return html;
  const $ = cheerio.load(html);
  const rendered = $('.katex').length > 0;
  $('script,style,pre,code,noscript,textarea,option,.katex').remove();
  let rawMath = false;
  $('body').find('*').addBack().contents().each((_, node) => {
    if (node.type === 'text' && /\$\$[\s\S]+?\$\$|\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]/.test(node.data)) rawMath = true;
  });
  if (!rendered && !rawMath) return html;
  if (!$('link[href="' + katexBase + 'katex.min.css"]').length) html = html.replace(/<\/head>/i, katexCss + '</head>');
  if (rawMath && !html.includes(katexBase + 'contrib/auto-render.min.js')) {
    html = html.replace(/<\/body>/i, `<script defer src="${katexBase}katex.min.js" integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4" crossorigin="anonymous"></script><script defer src="${katexBase}contrib/auto-render.min.js" integrity="sha384-mll67QQFJfxn0IYznZYonOWZ644AWYC+Pt2cHqMaRhXVrursRwvLnLaebdGIlYNa" crossorigin="anonymous" onload="renderMathInElement(document.body)"></script></body>`);
  }
  return html;
}, 100);
