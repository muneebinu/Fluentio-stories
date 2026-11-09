const API_KEY = 'demo-key-12345';

async function lookupGerman(text) {
  const phrase = String(text || '').trim().slice(0, 180);
  if (!phrase) throw new Error('Select a word or phrase first.');

  const translationUrl = new URL('https://api.mymemory.translated.net/get');
  translationUrl.searchParams.set('q', phrase);
  translationUrl.searchParams.set('langpair', 'de|en');

  const wiktUrl = 'https://api.wiktapi.dev/v1/en/word/' + encodeURIComponent(phrase) + '?lang=de';
  const vocabUrl = 'https://german-language.onrender.com/vocab/search?q=' + encodeURIComponent(phrase) + '&limit=5';

  const responses = await Promise.allSettled([
    fetch(translationUrl),
    fetch(wiktUrl),
    fetch(vocabUrl, { headers: { 'X-API-Key': API_KEY } })
  ]);

  let translation = '';
  let entry = null;
  let vocab = null;

  if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
    const data = await responses[0].value.json();
    translation = data?.responseData?.translatedText || '';
  }
  if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
    const data = await responses[1].value.json();
    entry = (data.entries || []).find(item => item.lang_code === 'de' || item.lang === 'German') || data.entries?.[0] || null;
  }
  if (responses[2].status === 'fulfilled' && responses[2].value.ok) {
    const data = await responses[2].value.json();
    const rows = data.data || [];
    vocab = rows.find(item => item.german?.toLowerCase() === phrase.toLowerCase()) || rows[0] || null;
  }

  const senses = (entry?.senses || []).flatMap(item => item.glosses || []).slice(0, 4);
  const forms = (entry?.forms || []).map(item => item.form).filter(Boolean).slice(0, 10);
  return {
    word: phrase,
    translation: translation || vocab?.english || senses[0] || 'No translation found.',
    lemma: entry?.word || vocab?.german || phrase,
    pos: entry?.pos || vocab?.pos || '',
    gender: vocab?.gender || '',
    definitions: senses,
    forms,
    example: vocab?.example_de || '',
    exampleEn: vocab?.example_en || ''
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'FLUENTIO_LOOKUP') return false;
  lookupGerman(message.text)
    .then(result => sendResponse({ ok: true, result }))
    .catch(error => sendResponse({ ok: false, error: error.message || 'Lookup failed.' }));
  return true;
});