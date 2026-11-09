import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ExternalLink, Globe2, Search, Sparkles, X, Languages, Volume2, Download, Trash2, RotateCcw, GraduationCap } from 'lucide-react'
import './styles.css'
import './reader.css'
import { originalStories, classicBooks } from './stories.js'

const levels = ['All levels', 'A1', 'A2', 'B1', 'B2']

// External reading destinations. Fluentio Stories links to publishers instead
// of copying their material without permission.
const sources = [
  { id: 1, title: 'LingoStories', description: 'Free interactive German stories with audio, choices and built-in word translation.', levelLabel: 'Beginner', levels: ['A1'], type: 'Interactive stories', language: 'German', url: 'https://lingostories.org/de/', tag: 'Free · no account', note: 'The publisher states that its texts use a Creative Commons licence. Check each story for its exact terms and attribution.' },
  { id: 2, title: 'Nicos Weg · DW', description: 'A structured German-learning course built around everyday situations, videos and exercises.', levelLabel: 'A1–B1', levels: ['A1','A2','B1'], type: 'Video & lessons', language: 'German', url: 'https://learngerman.dw.com/', tag: 'Course & media', note: 'Read and learn on Deutsche Welle.' },
  { id: 3, title: 'German.net', description: 'Graded German reading passages with comprehension questions and printable exercises.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Graded texts', language: 'German', url: 'https://german.net/reading/', tag: 'Free & premium', note: 'Some texts are free and others require premium access. Read on the publisher website.' },
  { id: 4, title: 'The German Garden', description: 'German reading texts with English translations, organized by CEFR level.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Stories & translations', language: 'German', url: 'https://www.thegermangarden.com/texts', tag: 'Free texts available', note: 'The site offers free and premium reading. Content remains on its original website.' },
  { id: 5, title: 'Stufenpost', description: 'Current German news rewritten at A2, B1 and B2, with word explanations.', levelLabel: 'A2–B2', levels: ['A2','B1','B2'], type: 'Graded news', language: 'German', url: 'https://stufenpost.de/english/', tag: 'Current affairs', note: 'Free to read with no account according to the publisher.' },
  { id: 6, title: 'DaZAF', description: 'Short reading and listening texts for learners of German as a foreign language.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Short texts & audio', language: 'German', url: 'https://www.dazaf.de/index.php/en', tag: 'Stories & exercises', note: 'Browse the publisher graded texts and accompanying exercises.' },
  { id: 7, title: 'deutsch.info', description: 'A multilingual learning platform with courses, grammar and an authentic German media library.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Courses & media', language: 'German', url: 'https://deutsch.info/', tag: 'Multilingual support', note: 'The platform offers free learning materials and authentic reading resources.' },
  { id: 8, title: 'Sprachprep', description: 'A growing collection of German reading passages and comprehension exercises.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Reading practice', language: 'German', url: 'https://sprachprep.com/reading', tag: 'Practice passages', note: 'Browse passages on the publisher site; check individual content terms.' },
  { id: 9, title: 'Morgenlese', description: 'Short daily German stories presented at four learner levels.', levelLabel: 'A1–B2', levels: ['A1','A2','B1','B2'], type: 'Daily stories', language: 'German', url: 'https://morgenlese.bytesicht.com/', tag: 'Daily reading', note: 'An independent reading platform. Use its own reader and terms.' },

]

const starterText = 'Fügen Sie hier einen deutschen Text ein, den Sie lesen möchten. Wählen Sie anschließend ein Wort aus, um seine Bedeutung nachzuschlagen.'

function App() {
  const [level, setLevel] = useState('All levels')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('home')
  const [readerText, setReaderText] = useState('')
  const [readerTitle, setReaderTitle] = useState('')
  const [activeWord, setActiveWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [dictionary, setDictionary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [lexical, setLexical] = useState(null)
  const [vocab, setVocab] = useState(() => { try { return JSON.parse(localStorage.getItem('fluentio-vocab') || '[]') } catch { return [] } })
  const [savedTexts, setSavedTexts] = useState(() => { try { return JSON.parse(localStorage.getItem('fluentio-texts') || '[]') } catch { return [] } })
  const [grammarRules, setGrammarRules] = useState([])
  const [grammarLoading, setGrammarLoading] = useState(false)
  const [grammarError, setGrammarError] = useState('')
  const [grammarQuery, setGrammarQuery] = useState('')
  const [flashIndex, setFlashIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [phraseSelected, setPhraseSelected] = useState('')
  const [readerFontSize, setReaderFontSize] = useState(17)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [bookCatalog, setBookCatalog] = useState([])
  const [bookCount, setBookCount] = useState(0)
  const [bookNext, setBookNext] = useState(null)
  const [bookSearch, setBookSearch] = useState('')
  const [booksLoading, setBooksLoading] = useState(false)
  const [booksError, setBooksError] = useState('')
  const [bookLoadingId, setBookLoadingId] = useState(null)
  const [bookCategory, setBookCategory] = useState('Kategorie:Roman')
  const [readerSource, setReaderSource] = useState('')
  const [lookupCache, setLookupCache] = useState(() => { try { return JSON.parse(localStorage.getItem('fluentio-lookup-cache') || '{}') } catch { return {} } })
  const lookupRequest = useRef(0)

  async function loadBookCatalog(url = null, category = bookCategory, append = false, search = bookSearch) {
    setBooksLoading(true); setBooksError('')
    try {
      let endpoint = url
      if (!endpoint) {
        const params = new URLSearchParams({ action:'query', format:'json', origin:'*' })
        if (search.trim()) { params.set('list','search'); params.set('srsearch',search.trim()); params.set('srnamespace','0'); params.set('srlimit','50') }
        else { params.set('list','categorymembers'); params.set('cmtitle',category); params.set('cmtype','page'); params.set('cmlimit','100') }
        endpoint = 'https://de.wikisource.org/w/api.php?' + params.toString()
      }
      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Wikisource catalogue returned ' + response.status)
      const data = await response.json()
      const results = search.trim() ? (data.query?.search || []) : (data.query?.categorymembers || [])
      setBookCatalog(current => append ? [...current, ...results] : results)
      setBookCount(data.query?.searchinfo?.totalhits ?? (append ? bookCatalog.length + results.length : results.length))
      if (data.continue) {
        const params = new URLSearchParams(endpoint.split('?')[1] || '')
        Object.entries(data.continue).forEach(([key,value])=>params.set(key,String(value)))
        setBookNext('https://de.wikisource.org/w/api.php?' + params.toString())
      } else setBookNext(null)
    } catch {
      setBooksError('The German Wikisource catalogue is temporarily unavailable. Please try again.')
    } finally { setBooksLoading(false) }
  }

  async function openWikisourcePage(page) {
    const title = page.title
    const cacheKey = 'fluentio-wikisource-v2-' + (page.pageid || title)
    const source = 'https://de.wikisource.org/wiki/' + encodeURIComponent(title.replaceAll(' ','_'))
    setBookLoadingId(page.pageid || title)
    setBooksError('')
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached && cached.trim().length >= 400) {
        openReader(cached, title, source)
        return
      }

      // Wikisource mainspace pages often transclude an entire book from Page:
      // namespace scans. The parse API expands those transclusions into the
      // complete readable text. Do not send both "page" and "pageid": MediaWiki
      // treats them as mutually exclusive and rejects the request.
      const extractParams = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        explaintext: '1',
        exsectionformat: 'plain',
        titles: title,
        format: 'json',
        formatversion: '2',
        origin: '*'
      })
      let text = ''
      const extractResponse = await fetch('https://de.wikisource.org/w/api.php?' + extractParams.toString(), {
        signal: AbortSignal.timeout(20000)
      })
      if (extractResponse.ok) {
        const extractData = await extractResponse.json()
        const pages = extractData.query?.pages || []
        const article = Array.isArray(pages) ? pages[0] : Object.values(pages)[0]
        text = (article?.extract || '').trim()
      }

      // Always try the rendered page when the extract is only a short lead.
      // This is the important path for books assembled from scanned Page pages.
      if (text.length < 12000) {
        const parseParams = new URLSearchParams({
          action: 'parse',
          page: title,
          prop: 'text',
          format: 'json',
          formatversion: '2',
          redirects: '1',
          disablelimitreport: '1',
          origin: '*'
        })
        const parseResponse = await fetch('https://de.wikisource.org/w/api.php?' + parseParams.toString(), {
          signal: AbortSignal.timeout(45000)
        })
        if (!parseResponse.ok) throw new Error('Wikisource parser returned HTTP ' + parseResponse.status)
        const parseData = await parseResponse.json()
        if (parseData.error) throw new Error(parseData.error.info || 'Wikisource could not parse this page')
        const parseHtml = parseData.parse?.text
        const html = typeof parseHtml === 'string' ? parseHtml : (parseHtml?.['*'] || '')
        if (html) {
          const doc = new DOMParser().parseFromString(html, 'text/html')
          doc.querySelectorAll('script,style,nav,header,footer,button,.mw-editsection,.references,.reflist,.navbox,.catlinks,.toc,.ws-noexport,.printfooter,.authority-control,.metadata,.ws-header,.ws-footer,.pagenum,.page-number,.ws-pagenum,.mw-indicators,.header,.footer').forEach(node => node.remove())
          const content = doc.querySelector('.mw-parser-output') || doc.querySelector('#mw-content-text') || doc.body
          // Extract prose blocks separately: scanned-page headers, page numbers
          // and line breaks should not be merged into the story.
          const blocks = [...content.querySelectorAll('h2,h3,h4,p,blockquote,li')]
            .map(node => (node.innerText || node.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim())
            .filter(value => value.length > 35 && !/^\[?\d{1,4}\]?$/.test(value))
          let rendered = blocks.join('\n\n')
          if (rendered.length < 400) {
            rendered = (content?.innerText || content?.textContent || '')
              .replace(/\u00a0/g, ' ')
              .split('\n')
              .map(line => line.trim())
              .filter(line => line && !/^\d{1,4}$/.test(line))
              .join(' ')
              .replace(/\s+/g, ' ')
          }
          if (rendered.length > text.length) text = rendered
        }
      }

      // Some Wikisource pages are only scans or bibliographic records. Do not
      // pretend those are complete books; surface the actual reason to students.
      if (text.trim().length < 400) {
        throw new Error('This Wikisource entry has no machine-readable transcription. It may contain scans only.')
      }

      if (text.length > 1500000) {
        text = text.slice(0, 1500000) + '\\n\\n[Reader limit reached. The source edition contains additional text.]'
      }
      text = text.replace(/\\n[ \\t]+/g, '\\n').replace(/\\n{3,}/g, '\\n\\n').trim()
      try { localStorage.setItem(cacheKey, text) } catch {}
      openReader(text, title, source)
    } catch (error) {
      console.error('Fluentio book loading failed:', title, error)
      const reason = error?.message || 'Unknown loading error'
      setBooksError('Could not open "' + title + '" inside Fluentio. ' + reason + ' Choose another transcription-ready edition; scan-only entries cannot be read as text yet.')
    } finally {
      setBookLoadingId(null)
    }
  }

  function persistVocab(next) { setVocab(next); localStorage.setItem('fluentio-vocab', JSON.stringify(next)) }
  function saveCurrentText() {
    if (!readerText.trim()) { setError('Add a reading text before saving.'); return }
    if (readerText.length > 500000) { setError('This text is too large to save in browser storage.'); return }
    const item = { id: Date.now(), title: readerTitle.trim() || 'Untitled German reading', text: readerText, savedAt: Date.now() }
    const next = [item, ...savedTexts.filter(row => row.title !== item.title)]
    setSavedTexts(next); localStorage.setItem('fluentio-texts', JSON.stringify(next)); setError('Reading saved on this device.')
  }
  function saveActiveWord() {
    if (!activeWord) return
    const entry = { word: activeWord, meaning: translation || lexical?.english || '', lemma: lexical?.lemma || activeWord, pos: lexical?.pos || '', gender: lexical?.gender || '', added: Date.now(), due: Date.now(), interval: 0, reviews: 0 }
    const next = [entry, ...vocab.filter(item => item.word.toLocaleLowerCase() !== activeWord.toLocaleLowerCase())]
    persistVocab(next)
  }
  function speakPassage() {
    if (!readerText.trim()) { setError('Add a German text before starting audio.'); return }
    if (!('speechSynthesis' in window)) { setError('Speech is not supported in this browser.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(readerText)
    utterance.lang = 'de-DE'; utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    setIsSpeaking(true); window.speechSynthesis.speak(utterance)
  }
  function stopPassage() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setIsSpeaking(false) }
  function speakWord(value) {
    if (!('speechSynthesis' in window)) { setError('Speech is not supported in this browser.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = 'de-DE'
    window.speechSynthesis.speak(utterance)
  }
  function rateFlashcard(days) {
    if (!vocab.length) return
    const current = practiceVocab[flashIndex % practiceVocab.length]
    const next = vocab.map(item => item.word === current.word ? {...item, interval: days, due: Date.now() + days*24*60*60*1000, reviews: (item.reviews || 0)+1} : item)
    persistVocab(next)
    setFlashIndex(0)
    setShowAnswer(false)
    setReviewed(reviewed+1)
  }
  function exportVocab() {
    const rows = [['German','English','Lemma','Part of speech','Gender'], ...vocab.map(v => [v.word,v.meaning,v.lemma,v.pos,v.gender])]
    const csv = rows.map(row => row.map(value => '"'+String(value || '').replaceAll('"','""')+'"').join(',')).join('\\n')
    const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}))
    const a = document.createElement('a'); a.href = url; a.download = 'fluentio-vocabulary.csv'; a.click(); URL.revokeObjectURL(url)
  }
  async function openGrammar() {
    setView('grammar'); setGrammarLoading(true); setGrammarError('')
    try {
      const response = await fetch('https://german-language.onrender.com/grammar?limit=365', { headers: { 'X-API-Key': 'demo-key-12345' } })
      if (!response.ok) throw new Error('Grammar service returned '+response.status)
      const data = await response.json(); setGrammarRules(data.data || [])
    } catch (e) { setGrammarError('The free grammar API is temporarily unavailable. Please try again.'); }
    finally { setGrammarLoading(false) }
  }

  const dueVocab = vocab.filter(item => !item.due || item.due <= Date.now())
  const practiceVocab = dueVocab.length ? dueVocab : vocab

  const filtered = useMemo(() => sources.filter(item => {
    const matchesLevel = level === 'All levels' || item.levels.includes(level)
    const matchesQuery = (item.title + ' ' + item.description + ' ' + item.type).toLowerCase().includes(query.toLowerCase())
    return matchesLevel && matchesQuery
  }), [level, query])

  async function lookupPhrase(value) {
    const phrase = value.trim().replace(/\s+/g, ' ').slice(0,180)
    if (!phrase) return
    setActiveWord(phrase); setTranslation(''); setDictionary(''); setLexical(null); setError(''); setLoading(true)
    try {
      const url = new URL('https://api.mymemory.translated.net/get')
      url.searchParams.set('q', phrase); url.searchParams.set('langpair', 'de|en')
      const response = await fetch(url)
      if (!response.ok) throw new Error('Translation service unavailable')
      const data = await response.json()
      setTranslation(data?.responseData?.translatedText || 'No phrase translation returned.')
    } catch { setError('Phrase translation is temporarily unavailable.') }
    finally { setLoading(false) }
  }

  async function lookupWord(value) {
    const clean = value.trim().replace(/[^\p{L}\p{M}-]/gu, '')
    if (!clean) return
    if (activeWord.toLocaleLowerCase() === clean.toLocaleLowerCase() && loading) return
    const requestId = ++lookupRequest.current
    setActiveWord(clean); setError('')
    const cached = lookupCache[clean.toLocaleLowerCase()]
    if (cached) {
      setTranslation(cached.translation || ''); setDictionary(cached.dictionary || '')
      setLexical(cached.lexical || null); setLoading(false); return
    }
    setTranslation(''); setDictionary(''); setLexical(null); setLoading(true)
    try {
      const googleUrl = new URL('https://translate.googleapis.com/translate_a/single')
      googleUrl.searchParams.set('client', 'gtx'); googleUrl.searchParams.set('sl', 'de')
      googleUrl.searchParams.set('tl', 'en'); googleUrl.searchParams.set('dt', 't'); googleUrl.searchParams.set('q', clean)
      const memoryUrl = new URL('https://api.mymemory.translated.net/get')
      memoryUrl.searchParams.set('q', clean); memoryUrl.searchParams.set('langpair', 'de|en')
      const googleTranslation = async () => {
        const r = await fetch(googleUrl, { signal: AbortSignal.timeout(7000) })
        if (!r.ok) throw new Error('Google translation unavailable')
        const d = await r.json()
        const value = (d?.[0] || []).map(part => part?.[0] || '').join('').trim()
        if (!value) throw new Error('Empty translation')
        return value
      }
      const memoryTranslation = async () => {
        const r = await fetch(memoryUrl, { signal: AbortSignal.timeout(8000) })
        if (!r.ok) throw new Error('MyMemory unavailable')
        const d = await r.json()
        const value = d?.responseData?.translatedText?.trim()
        if (!value || d?.quotaFinished) throw new Error('No translation')
        return value
      }
      const dictionaryLookup = async () => {
        const u = new URL('https://de.wiktionary.org/w/api.php')
        u.searchParams.set('action','query'); u.searchParams.set('prop','extracts')
        u.searchParams.set('explaintext','1'); u.searchParams.set('exsectionformat','plain')
        u.searchParams.set('titles',clean); u.searchParams.set('format','json'); u.searchParams.set('origin','*')
        const r = await fetch(u, { signal: AbortSignal.timeout(7000) })
        if (!r.ok) throw new Error('Wiktionary unavailable')
        const d = await r.json()
        const page = Object.values(d?.query?.pages || {})[0]
        return page?.extract || ''
      }
      const [translationResult, dictionaryResult] = await Promise.allSettled([
        Promise.any([googleTranslation(), memoryTranslation()]), dictionaryLookup()
      ])
      if (requestId !== lookupRequest.current) return
      const translated = translationResult.status === 'fulfilled' ? translationResult.value : ''
      const dictionaryText = dictionaryResult.status === 'fulfilled' ? dictionaryResult.value.slice(0,1800) : ''
      const lexicalData = { lemma: clean, english: translated, pos: '', gender: '', definitions: [], forms: [], example: '', exampleEn: '', level: '' }
      setTranslation(translated); setDictionary(dictionaryText); setLexical(lexicalData)
      if (!translated && !dictionaryText) setError('No result was returned. Try the dictionary base form or try again shortly.')
      if (translated || dictionaryText) {
        const nextCache = { ...lookupCache, [clean.toLocaleLowerCase()]: { translation: translated, dictionary: dictionaryText, lexical: lexicalData } }
        setLookupCache(nextCache)
        try { localStorage.setItem('fluentio-lookup-cache', JSON.stringify(nextCache)) } catch {}
      }
    } catch {
      setError('Translation services are temporarily unavailable. Please try again.')
    } finally { if (requestId === lookupRequest.current) setLoading(false) }
  }

  function openReader(text = '', title = '', source = '') {
    setReaderText(text)
    setReaderTitle(title)
    setReaderSource(source)
    setActiveWord('')
    setPhraseSelected('')
    setTranslation('')
    setDictionary('')
    setLexical(null)
    setError('')
    setView('reader')
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  async function loadTextFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Please choose a plain .txt file.')
      return
    }
    const text = await file.text()
    setReaderText(text)
    if (!readerTitle) setReaderTitle(file.name.replace(/\.txt$/i, ''))
    setActiveWord('')
    setTranslation('')
    setDictionary('')
    setLexical(null)
    setError('')
  }

  async function copyWord() {
    try {
      await navigator.clipboard.writeText(activeWord)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Copy is not available in this browser.')
    }
  }

  function renderReadableText() {
    const paragraphs = readerText.split(/\n\s*\n/).map(part => part.trim()).filter(Boolean)
    return paragraphs.map((paragraph, paragraphIndex) => {
      const tokens = paragraph.split(/([\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*)/gu)
      return <p className="reading-paragraph" key={paragraphIndex}>{tokens.map((token, index) => /^[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*$/u.test(token)
        ? <button className={'reader-word' + (activeWord.toLocaleLowerCase() === token.toLocaleLowerCase() ? ' word-active' : '')} key={index} onClick={() => lookupWord(token)}>{token}</button>
        : <React.Fragment key={index}>{token}</React.Fragment>)}</p>
    })
  }

  if (view === 'texts') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('home')}><ArrowLeft size={17}/> Library</button><strong className="hub-title">SAVED READINGS</strong><span className="reader-level">{savedTexts.length} TEXTS</span></header><main className="hub-page"><div className="hub-heading"><div><span className="eyebrow">YOUR READING SHELF</span><h1>Pick up where you left off.</h1><p>Saved privately in this browser. Export or back up your text separately.</p></div><button className="reader-open-link" onClick={()=>openReader()}>Add a reading <ArrowUpRight size={15}/></button></div>{savedTexts.length?<div className="saved-text-list">{savedTexts.map(item=><article key={item.id}><div><span>{new Date(item.savedAt).toLocaleDateString()} · {item.text.trim().split(/\\s+/).length} words</span><strong>{item.title}</strong><p>{item.text.slice(0,180)}{item.text.length>180?'…':''}</p></div><div><button onClick={()=>openReader(item.text,item.title)}>Continue reading</button><button aria-label="Delete saved reading" onClick={()=>{const next=savedTexts.filter(row=>row.id!==item.id);setSavedTexts(next);localStorage.setItem('fluentio-texts',JSON.stringify(next))}}><Trash2 size={15}/></button></div></article>)}</div>:<div className="hub-empty"><BookOpen size={28}/><h2>No saved readings yet</h2><p>Paste or upload a text in the reader, then choose Save reading.</p><button onClick={()=>openReader()}>Open reader</button></div>}</main></div>

  if (view === 'vocab') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('home')}><ArrowLeft size={17}/> Library</button><strong className="hub-title">MY VOCABULARY</strong><span className="reader-level">{vocab.length} WORDS SAVED</span></header><main className="hub-page"><div className="hub-heading"><div><span className="eyebrow">YOUR PERSONAL WORD BANK</span><h1>Words worth keeping.</h1><p>Saved on this device only. Nothing is uploaded to an account.</p></div><div className="hub-actions"><button onClick={exportVocab} disabled={!vocab.length}><Download size={15}/> Export CSV</button><button onClick={()=>setView('flashcards')} disabled={!vocab.length}>Practice words <ArrowUpRight size={15}/></button></div></div>{vocab.length?<div className="vocab-list">{vocab.map((item,index)=><article className="vocab-row" key={item.word+index}><div><strong>{item.gender ? item.gender+' ' : ''}{item.lemma || item.word}</strong><span>{item.meaning || 'Meaning not saved'} {item.pos ? ' · '+item.pos : ''}</span></div><button aria-label={'Remove '+item.word} onClick={()=>persistVocab(vocab.filter(v=>v.word!==item.word))}><Trash2 size={16}/></button></article>)}</div>:<div className="hub-empty"><Bookmark size={28}/><h2>Your word list is empty</h2><p>Open the reader, tap a word, then save it to build your personal vocabulary.</p><button onClick={()=>openReader()}>Go to reader</button></div>}</main></div>

  if (view === 'flashcards') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('vocab')}><ArrowLeft size={17}/> Vocabulary</button><strong className="hub-title">FLASHCARD PRACTICE</strong><span className="reader-level">{vocab.length ? flashIndex+1+' / '+vocab.length : 'NO CARDS'}</span></header><main className="hub-page flash-page"><span className="eyebrow">ACTIVE RECALL</span><h1>Bring the words back.</h1>{practiceVocab.length ? <><button className="flash-card" onClick={()=>setShowAnswer(!showAnswer)}><span>{showAnswer?'ENGLISH MEANING':'GERMAN'}</span><strong>{showAnswer ? (practiceVocab[flashIndex % practiceVocab.length].meaning || 'No meaning saved') : practiceVocab[flashIndex % practiceVocab.length].word}</strong><small>Tap to {showAnswer?'see the German word':'reveal the meaning'}</small></button><div className="flash-controls"><button onClick={()=>setShowAnswer(!showAnswer)}><RotateCcw size={15}/> Flip card</button></div>{showAnswer&&<div className="rating-controls"><span>How well did you remember it?</span><button onClick={()=>rateFlashcard(10/1440)}>Again · 10 min</button><button onClick={()=>rateFlashcard(1)}>Hard · 1 day</button><button onClick={()=>rateFlashcard(3)}>Good · 3 days</button><button onClick={()=>rateFlashcard(7)}>Easy · 7 days</button></div>}<p className="flash-count">{reviewed} reviews this session · {vocab.filter(item=>!item.due||item.due<=Date.now()).length} due now</p></> : <div className="hub-empty"><p>Add words in the reader to start practicing.</p><button onClick={()=>setView('reader')}>Open reader</button></div>}</main></div>

  if (view === 'grammar') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('home')}><ArrowLeft size={17}/> Library</button><strong className="hub-title">GRAMMAR LIBRARY</strong><span className="reader-level">A1 — C1</span></header><main className="hub-page"><div className="hub-heading"><div><span className="eyebrow">LEARN THE STRUCTURE</span><h1>German, made clearer.</h1><p>Grammar rules, examples and explanations from an open learning dataset.</p></div></div><input className="grammar-search" value={grammarQuery} onChange={e=>setGrammarQuery(e.target.value)} placeholder="Search cases, verbs, word order…"/>{grammarLoading?<p className="panel-muted">Loading grammar library…</p>:grammarError?<p className="lookup-error">{grammarError}</p>:<div className="grammar-grid">{grammarRules.filter(rule=>(rule.category_name+' '+rule.subcategory+' '+rule.rule_english+' '+rule.rule_german).toLowerCase().includes(grammarQuery.toLowerCase())).map(rule=><article className="grammar-card" key={rule.id}><span>{rule.category_name} · {(rule.cefr_levels||[]).join(', ')}</span><h3>{rule.subcategory || rule.category_name}</h3><p>{rule.rule_english}</p><blockquote>{rule.rule_german}</blockquote><div className="grammar-example"><strong>{rule.example_de}</strong><small>{rule.example_en}</small></div></article>)}</div>}</main></div>

  if (view === 'reader') return <div className="reader-app">
    <header className="reader-topbar">
      <button className="back-button" onClick={() => setView('home')}><ArrowLeft size={17}/> Library</button>
      <a className="brand reader-brand" href="#home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <div className="reader-nav"><button onClick={()=>setView('texts')}>Saved texts ({savedTexts.length})</button><button onClick={()=>setView('vocab')}>Words ({vocab.length})</button></div>
    </header>
    <main className="reader-layout">
      <section className="reader-main">
        <div className="reader-kicker">YOUR READING SPACE <span>·</span> GERMAN</div>
        <details className="reader-import"><summary>Import your own text (optional)</summary>
          <input className="reader-title-input" value={readerTitle} onChange={e=>setReaderTitle(e.target.value)} placeholder="Give your reading a title..." aria-label="Reading title"/>
          <p className="reader-instructions">Paste text you are permitted to use, or upload a plain-text file.</p>
          <textarea className="reader-paste" value={readerText} onChange={e=>setReaderText(e.target.value)} placeholder="Paste your German text here…" aria-label="German reading text"/>
          <div className="reader-toolbar"><span>{readerText.trim() ? readerText.trim().split(/\s+/).length.toLocaleString() + ' words · approx. ' + Math.max(1,Math.ceil(readerText.trim().split(/\s+/).length/250)) + ' reading pages' : 'Your text stays in this browser session.'}</span><div className="reader-toolbar-actions"><button onClick={speakPassage}>Listen to text</button><button onClick={stopPassage} disabled={!isSpeaking}>Stop audio</button><button onClick={saveCurrentText}>Save reading</button><label className="upload-text-button">Upload .txt<input type="file" accept=".txt,text/plain" onChange={e=>loadTextFile(e.target.files?.[0])}/></label><button onClick={()=>{setReaderText('');setReaderTitle('');setActiveWord('')}}>Clear text</button></div></div>
        </details>
        {error&&<p className="reader-feedback">{error}</p>}<div className="reader-divider"/>
        <div className="reading-heading"><span className="eyebrow">INTERACTIVE READING</span><span className="reading-hint"><span className="hint-dot"/> Click or tap a word to look it up</span><div className="reading-tools"><button onClick={()=>setReaderFontSize(Math.max(14,readerFontSize-1))} aria-label="Decrease text size">A−</button><button onClick={()=>setReaderFontSize(Math.min(28,readerFontSize+1))} aria-label="Increase text size">A+</button>{phraseSelected&&<button className="phrase-lookup" onClick={()=>lookupPhrase(phraseSelected)}>Translate selected phrase</button>}</div></div>
        {readerText.trim()
          ? <article className="reading-paper" onMouseUp={()=>{const selection=window.getSelection()?.toString().trim()||'';setPhraseSelected(selection.split(/\s+/).length>1?selection:'')}}><h2>{readerTitle || 'German reading'} {readerSource&&<a className="reader-source-link" href={readerSource} target="_blank" rel="noreferrer">Original source <ExternalLink size={12}/></a>}</h2><div className="reading-content" style={{fontSize:readerFontSize+'px'}}>{renderReadableText()}</div></article>
          : <div className="reader-empty"><BookOpen size={28}/><strong>Your reading will appear here</strong><span>Paste a German passage in the box above to get started.</span></div>}
        <div className="reader-source-note">{readerSource ? <>{readerSource.includes('gutenberg.org') ? 'This full text is hosted locally by Fluentio from Project Gutenberg; the source file and licence notice are retained. ' : 'This text is provided by German Wikisource. ' }Check the original source page for its licence and attribution details.</> : 'Use text you wrote yourself, public-domain material, or content whose licence permits this use. For other publishers, read on their original website.'}</div>
      </section>
      <aside className="word-panel">
        <div className="word-panel-top"><div><span className="eyebrow">WORD EXPLORER</span><h2>Wort für Wort.</h2></div><Sparkles size={19}/></div>
        {activeWord ? <>
          <div className="selected-word">{activeWord}<div className="word-actions"><button onClick={()=>speakWord(activeWord)} aria-label="Listen to word"><Volume2 size={16}/></button><button onClick={copyWord} aria-label="Copy word">{copied?<Check size={16}/>:<Bookmark size={16}/>}</button><button onClick={saveActiveWord} aria-label="Save word"><Bookmark size={16}/></button></div></div>
          <div className="word-section"><span className="panel-label">ENGLISH MEANING</span>{loading?<p className="panel-muted">Looking it up…</p>:translation?<p className="translation-text">{translation}</p>:<p className="panel-muted">No translation returned.</p>}</div>
          {lexical&&<div className="word-facts">{lexical.lemma&&<span><b>Base form</b>{lexical.lemma}</span>}{lexical.pos&&<span><b>Word type</b>{lexical.pos}</span>}{lexical.gender&&<span><b>Gender</b>{lexical.gender}</span>}{lexical.level&&<span><b>CEFR</b>{lexical.level}</span>}{lexical.example&&<span className="fact-example"><b>Example</b>{lexical.example}<small>{lexical.exampleEn}</small></span>}</div>}<div className="word-section"><span className="panel-label">DICTIONARY ENTRY</span>{dictionary?<p className="dictionary-text">{dictionary}</p>:<p className="panel-muted">German Wiktionary information will appear here when available.</p>}</div>
          {error&&<p className="lookup-error">{error}</p>}
          <p className="panel-disclaimer">Dictionary data comes from open Wiktionary-derived datasets and translation services. Inflected forms and grammatical fields may be incomplete; verify context.</p>
        </> : <div className="word-panel-empty"><div className="empty-word-icon">Aa</div><strong>Select a German word</strong><p>Hover over or tap any word in your passage to see its English meaning and available dictionary entry.</p></div>}
        <div className="panel-bottom"><span>OPEN DICTIONARY + TRANSLATION APIS</span><a href="https://www.wiktionary.org/" target="_blank" rel="noreferrer">Wiktionary <ExternalLink size={12}/></a></div>
      </aside>
    </main>
  </div>

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Fluentio Stories home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <nav className="nav-links"><a href="#library">Explore</a><a href="#how">How it works</a><button onClick={()=>openReader()}>Reader</button><button onClick={()=>setView('vocab')}>Vocabulary</button></nav>
      <button className="top-cta" onClick={()=>openReader()}>Open reader <ArrowUpRight size={16}/></button>
    </header>
    <main id="home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> GERMAN READING ROOM</div>
          <h1>One story.<br/><em>One step</em> forward.</h1>
          <p className="hero-description">Simple German stories for A1, A2 and B1. Read at your own pace, tap a word for its meaning, and enjoy the story.</p>
          <button className="hero-button" onClick={()=>document.getElementById('library')?.scrollIntoView({behavior:'smooth'})}>Choose a story <ArrowUpRight size={17}/></button>
          <div className="hero-meta"><span><BookOpen size={15}/> Original learner stories</span><span><Globe2 size={15}/> A1 · A2 · B1</span></div>
        </div>
        <div className="hero-art" aria-label="Illustration of an open book"><div className="art-note note-top">LESEN · LERNEN · WACHSEN</div><div className="book-shadow"/><div className="book"><div className="book-label">DEUTSCH<br/>ENTDECKEN</div><div className="book-rule"/><div className="book-lines"><i/><i/><i/><i/></div><div className="book-mark">01 / 03</div></div><div className="art-stamp">WORT<br/>FÜR WORT</div><div className="art-note note-bottom">YOUR NEXT CHAPTER STARTS HERE.</div></div>
      </section>
      <section className="library-section" id="library">
        <div className="section-heading"><div><div className="eyebrow">THE READING ROOM</div><h2>Choose your next story.</h2><p>Three original stories, written for German learners. Each one opens directly in the Fluentio reader.</p></div></div>
        <div className="filters">{['All levels','A1','A2','B1'].map(l=><button key={l} className={level===l?'selected':''} onClick={()=>setLevel(l)}>{l}</button>)}<span className="result-count">{originalStories.filter(s=>level==='All levels'||s.level===level).length} STORIES</span></div>
        <div className="story-grid">
          {originalStories.filter(s=>level==='All levels'||s.level===level).map((story,index)=><article className="story-card fluentio-story-card" key={story.id}>
            <span className="story-level">{story.level} · {story.topic}</span>
            <h4>{story.title}</h4><p>{story.description}</p>
            <small>{story.chapters.length} chapters · original Fluentio story</small>
            <button onClick={()=>openReader(story.chapters.join('\n\n'),story.title,'')}>Read story <ArrowUpRight size={14}/></button>
          </article>)}
        </div>
        <section className="classic-shelf">
          <div className="section-heading"><div><div className="eyebrow">CLASSIC GERMAN LITERATURE</div><h2>Three classics.</h2><p>For readers who want to try longer, more challenging literature. These are original literary texts, not A1–B1 graded readers.</p></div></div>
          <div className="classic-grid">{classicBooks.map(book=><article className="classic-card" key={book.id}>
            <span>{book.level} · {book.author}</span><h3>{book.title}</h3><p>{book.description}</p>
            <button onClick={()=>openWikisourcePage({title:book.pageTitle.replaceAll('_',' '),pageid:book.id})} disabled={bookLoadingId===book.id}>{bookLoadingId===book.id?'Opening…':'Read in Fluentio'} <ArrowUpRight size={14}/></button>
            <a href={book.source} target="_blank" rel="noreferrer">Source edition</a>
          </article>)}</div>
          {booksError&&<p className="reader-feedback">{booksError}</p>}
        </section>
        <div className="learning-shortcuts">
          <button onClick={()=>setView('texts')}><BookOpen size={17}/> Saved readings <span>{savedTexts.length} saved</span></button>
          <button onClick={()=>setView('vocab')}><Bookmark size={17}/> My vocabulary <span>{vocab.length} words</span></button>
          <button onClick={()=>setView('flashcards')}><GraduationCap size={17}/> Flashcards <span>Practise saved words</span></button>
        </div>
      </section>
    </main>
    <footer><a className="footer-brand" href="#home">FLUENTIO <span>STORIES</span></a><p>Read your way to German.</p><span>© {new Date().getFullYear()} Fluentio Academia</span></footer>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={19}/></button><span className="eyebrow">READING SOURCE · {selected.levelLabel}</span><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-note">{selected.note}</div><a className="hero-button" href={selected.url} target="_blank" rel="noreferrer">Visit original source <ExternalLink size={16}/></a><div className="modal-divider"/><button className="reader-open-link" onClick={()=>openReader('',selected.title+' reading')}>Open reader workspace <ArrowUpRight size={15}/></button><p className="modal-small">Read the original publisher's material on its website. Paste text into your reading workspace only where you have permission to do so.</p></section></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
