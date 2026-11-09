(() => {
  if (window.__fluentioReaderInstalled) return;
  window.__fluentioReaderInstalled = true;

  const host = document.createElement('div');
  host.id = 'fluentio-web-reader-host';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;right:18px;bottom:18px;';
  document.documentElement.appendChild(host);
  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    .panel{width:300px;max-width:calc(100vw - 36px);background:#244855;color:#FBE9D0;border:1px solid rgba(251,233,208,.2);box-shadow:0 14px 45px rgba(0,0,0,.25);font:13px Arial,sans-serif;padding:16px;display:none}
    .top{display:flex;justify-content:space-between;align-items:center;color:#90AEAD;font:10px monospace;letter-spacing:.12em}
    .close{border:0;background:transparent;color:#FBE9D0;font-size:20px;cursor:pointer}
    .word{font:26px Georgia,serif;margin:12px 0 8px;overflow-wrap:anywhere}
    .meaning{font:16px Georgia,serif;line-height:1.5;color:#fffaf2}
    .meta{font:11px/1.6 Arial,sans-serif;color:#90AEAD;margin-top:10px;white-space:pre-line}
    .actions{display:flex;gap:8px;margin-top:14px}
    .actions button{border:1px solid #90AEAD;background:transparent;color:#FBE9D0;padding:9px 11px;font-size:11px;cursor:pointer}
    .actions button.primary{background:#E64833;border-color:#E64833}
    .status{font-size:10px;color:#90AEAD;margin-top:9px;line-height:1.4}
    .hint{font:10px Arial,sans-serif;color:#244855;background:#FBE9D0;padding:8px 10px;margin-bottom:8px;box-shadow:0 3px 12px rgba(0,0,0,.15)}
  `;
  const hint = document.createElement('div');
  hint.className = 'hint';
  hint.textContent = 'Fluentio Reader · select a German word or phrase';
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.innerHTML = '<div class="top"><span>FLUENTIO · WORD EXPLORER</span><button class="close" aria-label="Close">×</button></div><div class="word"></div><div class="meaning">Looking up…</div><div class="meta"></div><div class="actions"><button class="primary save">Save word</button><button class="speak">Listen</button></div><div class="status"></div>';
  shadow.append(style, hint, panel);

  let current = null;
  let lookupTimer = null;
  const $ = selector => panel.querySelector(selector);

  function selectedText(event) {
    const selected = window.getSelection()?.toString().trim() || '';
    if (selected && selected.length <= 180) return selected;
    if (event?.type === 'dblclick') {
      const target = event.target;
      const text = target?.childNodes?.length === 1 && target.firstChild?.nodeType === Node.TEXT_NODE ? target.textContent : '';
      if (text) {
        const range = document.caretRangeFromPoint?.(event.clientX, event.clientY);
        if (range) {
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const value = node.textContent;
            let start = range.startOffset, end = range.startOffset;
            while (start > 0 && /[\p{L}\p{M}-]/u.test(value[start - 1])) start--;
            while (end < value.length && /[\p{L}\p{M}-]/u.test(value[end])) end++;
            return value.slice(start, end).trim();
          }
        }
      }
    }
    return '';
  }

  function showLookup(text) {
    if (!text || !/[\p{L}]/u.test(text)) return;
    current = text;
    hint.style.display = 'none';
    panel.style.display = 'block';
    $('.word').textContent = text;
    $('.meaning').textContent = 'Looking up…';
    $('.meta').textContent = '';
    $('.status').textContent = '';
    chrome.runtime.sendMessage({ type: 'FLUENTIO_LOOKUP', text }, response => {
      if (chrome.runtime.lastError) {
        $('.meaning').textContent = 'The dictionary service could not be reached.';
        $('.status').textContent = chrome.runtime.lastError.message;
        return;
      }
      if (!response?.ok) {
        $('.meaning').textContent = 'No result available.';
        $('.status').textContent = response?.error || 'Try again.';
        return;
      }
      const item = response.result;
      current = item;
      $('.meaning').textContent = item.translation;
      $('.meta').textContent = [
        item.lemma && 'Base form: ' + item.lemma,
        item.gender && 'Gender: ' + item.gender,
        item.pos && 'Type: ' + item.pos,
        item.forms?.length && 'Forms: ' + item.forms.join(', '),
        item.example && 'Example: ' + item.example,
        item.exampleEn
      ].filter(Boolean).join('\n');
      $('.status').textContent = 'Check context: dictionary and machine translations can be imperfect.';
    });
  }

  document.addEventListener('mouseup', event => {
    clearTimeout(lookupTimer);
    lookupTimer = setTimeout(() => {
      const text = selectedText(event);
      if (text) showLookup(text);
    }, 120);
  });
  document.addEventListener('dblclick', event => {
    const text = selectedText(event);
    if (text) showLookup(text);
  });

  $('.close').addEventListener('click', () => { panel.style.display = 'none'; hint.style.display = 'block'; });
  $('.save').addEventListener('click', async () => {
    if (!current) return;
    const item = typeof current === 'string' ? { word: current, translation: '' } : current;
    const saved = (await chrome.storage.local.get({ vocabulary: [] })).vocabulary;
    const next = [{ ...item, savedAt: Date.now() }, ...saved.filter(row => row.word.toLowerCase() !== item.word.toLowerCase())];
    await chrome.storage.local.set({ vocabulary: next });
    $('.status').textContent = 'Saved to your Fluentio vocabulary.';
  });
  $('.speak').addEventListener('click', () => {
    if (!current) return;
    const text = typeof current === 'string' ? current : current.word;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
})();