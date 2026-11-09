const list = document.getElementById('list');
const count = document.getElementById('count');

async function render() {
  const { vocabulary = [] } = await chrome.storage.local.get({ vocabulary: [] });
  count.textContent = vocabulary.length + ' saved';
  list.innerHTML = '';
  if (!vocabulary.length) {
    list.innerHTML = '<div class="empty">No words saved yet. Select a word on a German webpage.</div>';
    return;
  }
  vocabulary.forEach(item => {
    const row = document.createElement('div');
    row.className = 'item';
    const word = document.createElement('strong');
    word.textContent = item.word;
    const meaning = document.createElement('span');
    meaning.textContent = item.translation || item.lemma || 'Meaning unavailable';
    row.append(word, meaning);
    list.appendChild(row);
  });
}

document.getElementById('export').addEventListener('click', async () => {
  const { vocabulary = [] } = await chrome.storage.local.get({ vocabulary: [] });
  const rows = [['German','English','Lemma','Gender','Part of speech'], ...vocabulary.map(item => [item.word,item.translation,item.lemma,item.gender,item.pos])];
  const csv = rows.map(row => row.map(value => '"' + String(value || '').replaceAll('"','""') + '"').join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'fluentio-web-vocabulary.csv'; a.click();
  URL.revokeObjectURL(url);
});

document.getElementById('clear').addEventListener('click', async () => {
  if (!confirm('Clear all saved extension vocabulary?')) return;
  await chrome.storage.local.set({ vocabulary: [] });
  render();
});

render();