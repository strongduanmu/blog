(() => {
  'use strict';

  const input = document.getElementById('search-input');
  if (!input) return;

  const wrapper = document.getElementById('search-wrapper');
  const results = document.getElementById('search-result');
  const indexUrl = document.currentScript.dataset.searchIndex;
  const filter = input.dataset.filter || '';
  let index;
  let loading = false;

  // Search the longest phrases first when choosing the snippet, as Stellar does.
  function phrasesFor(query) {
    const words = query.toLowerCase().split(/\s+/);
    const phrases = [];
    for (let length = words.length; length > 0; length--) {
      for (let start = 0; start + length <= words.length; start++) {
        phrases.push(words.slice(start, start + length).join(' '));
      }
    }
    return phrases;
  }

  function resultItem(entry, firstMatch, highlight) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = entry.path.startsWith('//') ? entry.path.slice(1) : entry.path;
    const title = document.createElement('span');
    title.className = 'search-result-title';
    title.textContent = entry.title;
    const snippet = document.createElement('p');
    snippet.className = 'search-result-content';

    const start = Math.max(0, firstMatch - 20);
    const excerpt = entry.content.slice(start, start + 100);
    let offset = 0;
    for (const match of excerpt.matchAll(highlight)) {
      snippet.append(excerpt.slice(offset, match.index));
      const keyword = document.createElement('span');
      keyword.className = 'search-keyword';
      keyword.textContent = match[0];
      snippet.append(keyword);
      offset = match.index + match[0].length;
    }
    snippet.append(excerpt.slice(offset) + '...');
    link.append(title, snippet);
    item.append(link);
    return item;
  }

  function render() {
    const query = input.value.trim();
    wrapper.setAttribute('searching', query ? 'true' : 'false');
    results.replaceChildren();
    if (!query) {
      wrapper.classList.remove('noresult');
      return;
    }

    const phrases = phrasesFor(query);
    const matches = [];
    for (const entry of index) {
      let rank = 0;
      let firstMatch = -1;
      for (const phrase of phrases) {
        const offset = entry.contentLower.indexOf(phrase);
        if (offset < 0 && !entry.titleLower.includes(phrase)) continue;
        if (firstMatch < 0) firstMatch = Math.max(0, offset);
        rank++;
      }
      if (rank) matches.push({ entry, rank, firstMatch });
    }

    wrapper.classList.toggle('noresult', matches.length === 0);
    if (!matches.length) return;
    const alternatives = phrases.map(phrase => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const highlight = new RegExp(alternatives.join('|'), 'gi');
    const list = document.createElement('ul');
    list.className = 'search-result-list';
    matches.sort((a, b) => b.rank - a.rank);
    for (const { entry, firstMatch } of matches) list.append(resultItem(entry, firstMatch, highlight));
    results.append(list);
  }

  async function loadIndex() {
    if (index || loading) return;
    loading = true;
    try {
      const response = await fetch(indexUrl);
      if (!response.ok) return;
      const entries = await response.json();
      index = entries.filter(entry => entry.content?.trim() && entry.path?.includes(filter)).map(entry => {
        const title = entry.title?.trim() || 'Untitled';
        return {
          path: entry.path,
          title,
          content: entry.content,
          titleLower: title.toLowerCase(),
          contentLower: entry.content.toLowerCase()
        };
      });
    } catch {
      // The next focus or input can retry after a network or response failure.
    } finally {
      loading = false;
    }
    if (index) render();
  }

  input.addEventListener('focus', loadIndex);
  input.addEventListener('input', () => {
    if (index) render();
    else if (input.value.trim()) loadIndex();
  });
  input.form.addEventListener('submit', event => event.preventDefault());
  if (document.activeElement === input || input.value.trim()) loadIndex();
})();
