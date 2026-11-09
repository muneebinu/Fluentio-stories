import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ExternalLink, Globe2, Search, Sparkles, X, Languages, Volume2, Download, Trash2, RotateCcw, GraduationCap } from 'lucide-react'
import './styles.css'
import './reader.css'

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
  { id: 10, title: 'German literature · Gutenberg', description: 'A large collection of German-language books and literary works. Difficulty varies.', levelLabel: 'B2+', levels: ['B2'], type: 'Classic literature', language: 'German', url: 'https://www.gutenberg.org/browse/languages/de', tag: 'Original literature', note: 'Check copyright status of each individual work before reuse.' },
]

const featuredReads = [
  { title: 'Meine Stadt', level: 'A1', topic: 'Everyday life · Places', url: 'https://german.net/reading/meine-stadt/' },
  { title: 'Unser Haus', level: 'A1', topic: 'Home · Family', url: 'https://german.net/reading/unser-haus/' },
  { title: 'In der Schule', level: 'A2', topic: 'Education · Daily routines', url: 'https://german.net/reading/schule/' },
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
  const [grammarRules, setGrammarRules] = useState([])
  const [grammarLoading, setGrammarLoading] = useState(false)
  const [grammarError, setGrammarError] = useState('')
  const [grammarQuery, setGrammarQuery] = useState('')
  const [flashIndex, setFlashIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [phraseSelected, setPhraseSelected] = useState('')

  function persistVocab(next) { setVocab(next); localStorage.setItem('fluentio-vocab', JSON.stringify(next)) }
  function saveActiveWord() {
    if (!activeWord) return
    const entry = { word: activeWord, meaning: translation || lexical?.english || '', lemma: lexical?.lemma || activeWord, pos: lexical?.pos || '', gender: lexical?.gender || '', added: Date.now(), due: Date.now(), interval: 0, reviews: 0 }
    const next = [entry, ...vocab.filter(item => item.word.toLocaleLowerCase() !== activeWord.toLocaleLowerCase())]
    persistVocab(next)
  }
  function speakWord(value) {
    if (!('speechSynthesis' in window)) { setError('Speech is not supported in this browser.'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(value)
    utterance.lang = 'de-DE'
    window.speechSynthesis.speak(utterance)
  }
  function rateFlashcard(days) {
    if (!vocab.length) return
    const current = vocab[flashIndex % vocab.length]
    const next = vocab.map(item => item.word === current.word ? {...item, interval: days, due: Date.now() + days*24*60*60*1000, reviews: (item.reviews || 0)+1} : item)
    persistVocab(next)
    setFlashIndex((flashIndex+1) % vocab.length)
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
    const clean = value.trim().replace(/[^\\p{L}\\p{M}-]/gu, '')
    if (!clean) return
    setActiveWord(clean); setTranslation(''); setDictionary(''); setLexical(null); setError(''); setLoading(true)
    try {
      const wiktUrl = 'https://api.wiktapi.dev/v1/en/word/' + encodeURIComponent(clean) + '?lang=de'
      const vocabUrl = 'https://german-language.onrender.com/vocab/search?q=' + encodeURIComponent(clean) + '&limit=8'
      const translationUrl = new URL('https://api.mymemory.translated.net/get')
      translationUrl.searchParams.set('q', clean); translationUrl.searchParams.set('langpair', 'de|en')
      const results = await Promise.allSettled([fetch(wiktUrl), fetch(vocabUrl, {headers:{'X-API-Key':'demo-key-12345'}}), fetch(translationUrl)])
      let wiktEntry = null, vocabEntry = null, translated = ''
      if (results[0].status === 'fulfilled' && results[0].value.ok) {
        const data = await results[0].value.json()
        wiktEntry = (data.entries || []).find(entry => entry.lang_code === 'de' || entry.lang === 'German') || data.entries?.[0] || null
      }
      if (results[1].status === 'fulfilled' && results[1].value.ok) {
        const data = await results[1].value.json()
        const matches = data.data || []
        vocabEntry = matches.find(entry => entry.german?.toLocaleLowerCase() === clean.toLocaleLowerCase()) || matches[0] || null
      }
      if (results[2].status === 'fulfilled' && results[2].value.ok) {
        const data = await results[2].value.json()
        if (data?.responseData?.translatedText) { translated = data.responseData.translatedText; setTranslation(translated) }
      }
      const senses = (wiktEntry?.senses || []).flatMap(sense => sense.glosses || []).slice(0,5)
      const forms = (wiktEntry?.forms || []).slice(0,12).map(form => form.form).filter(Boolean)
      const structured = {
        lemma: wiktEntry?.word || vocabEntry?.german || clean,
        pos: wiktEntry?.pos || vocabEntry?.pos || '',
        gender: vocabEntry?.gender || (wiktEntry?.senses || []).flatMap(s => s.tags || []).find(tag => ['masculine','feminine','neuter'].includes(tag)) || '',
        english: vocabEntry?.english || senses[0] || '',
        definitions: senses,
        forms,
        example: vocabEntry?.example_de || '',
        exampleEn: vocabEntry?.example_en || '',
        level: vocabEntry?.level || ''
      }
      setLexical(structured)
      if (vocabEntry?.english && !translated) { translated = vocabEntry.english; setTranslation(translated) }
      if (senses.length || forms.length) setDictionary([...senses, ...(forms.length ? ['Forms: '+forms.join(', ')] : [])].join('\\n'))
      else {
        const dictionaryUrl = new URL('https://de.wiktionary.org/w/api.php')
        dictionaryUrl.searchParams.set('action','query'); dictionaryUrl.searchParams.set('prop','extracts'); dictionaryUrl.searchParams.set('explaintext','1'); dictionaryUrl.searchParams.set('titles',structured.lemma); dictionaryUrl.searchParams.set('format','json'); dictionaryUrl.searchParams.set('origin','*')
        const fallback = await fetch(dictionaryUrl)
        if (fallback.ok) { const data = await fallback.json(); const page = Object.values(data?.query?.pages || {})[0]; if (page?.extract) setDictionary(page.extract.slice(0,1000)) }
      }
      if (!vocabEntry && !wiktEntry && !translation) setError('No dictionary result was found. Try the base form of the word.')
    } catch (e) { setError('Dictionary services are temporarily unavailable. Try again in a moment.') }
    finally { setLoading(false) }
  }

  function openReader(text = '', title = '') {
    setReaderText(text)
    setReaderTitle(title)
    setActiveWord('')
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
    if (!readerTitle) setReaderTitle(file.name.replace(/\\.txt$/i, ''))
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
    const tokens = readerText.split(/([\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*)/gu)
    return tokens.map((token, index) => /^[\p{L}\p{M}]+(?:[-’'][\p{L}\p{M}]+)*$/u.test(token)
      ? <button className={'reader-word' + (activeWord.toLocaleLowerCase() === token.toLocaleLowerCase() ? ' word-active' : '')} key={index} onClick={() => lookupWord(token)}>{token}</button>
      : <React.Fragment key={index}>{token}</React.Fragment>)
  }

  if (view === 'vocab') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('home')}><ArrowLeft size={17}/> Library</button><strong className="hub-title">MY VOCABULARY</strong><span className="reader-level">{vocab.length} WORDS SAVED</span></header><main className="hub-page"><div className="hub-heading"><div><span className="eyebrow">YOUR PERSONAL WORD BANK</span><h1>Words worth keeping.</h1><p>Saved on this device only. Nothing is uploaded to an account.</p></div><div className="hub-actions"><button onClick={exportVocab} disabled={!vocab.length}><Download size={15}/> Export CSV</button><button onClick={()=>setView('flashcards')} disabled={!vocab.length}>Practice words <ArrowUpRight size={15}/></button></div></div>{vocab.length?<div className="vocab-list">{vocab.map((item,index)=><article className="vocab-row" key={item.word+index}><div><strong>{item.gender ? item.gender+' ' : ''}{item.lemma || item.word}</strong><span>{item.meaning || 'Meaning not saved'} {item.pos ? ' · '+item.pos : ''}</span></div><button aria-label={'Remove '+item.word} onClick={()=>persistVocab(vocab.filter(v=>v.word!==item.word))}><Trash2 size={16}/></button></article>)}</div>:<div className="hub-empty"><Bookmark size={28}/><h2>Your word list is empty</h2><p>Open the reader, tap a word, then save it to build your personal vocabulary.</p><button onClick={()=>openReader()}>Go to reader</button></div>}</main></div>

  if (view === 'flashcards') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('vocab')}><ArrowLeft size={17}/> Vocabulary</button><strong className="hub-title">FLASHCARD PRACTICE</strong><span className="reader-level">{vocab.length ? flashIndex+1+' / '+vocab.length : 'NO CARDS'}</span></header><main className="hub-page flash-page"><span className="eyebrow">ACTIVE RECALL</span><h1>Bring the words back.</h1>{vocab.length ? <><button className="flash-card" onClick={()=>setShowAnswer(!showAnswer)}><span>{showAnswer?'ENGLISH MEANING':'GERMAN'}</span><strong>{showAnswer ? (vocab[flashIndex % vocab.length].meaning || 'No meaning saved') : vocab[flashIndex % vocab.length].word}</strong><small>Tap to {showAnswer?'see the German word':'reveal the meaning'}</small></button><div className="flash-controls"><button onClick={()=>setShowAnswer(!showAnswer)}><RotateCcw size={15}/> Flip card</button></div>{showAnswer&&<div className="rating-controls"><span>How well did you remember it?</span><button onClick={()=>rateFlashcard(1)}>Again · 1 day</button><button onClick={()=>rateFlashcard(3)}>Hard · 3 days</button><button onClick={()=>rateFlashcard(7)}>Good · 7 days</button><button onClick={()=>rateFlashcard(14)}>Easy · 14 days</button></div>}<p className="flash-count">{reviewed} reviews this session · {vocab.filter(item=>!item.due||item.due<=Date.now()).length} due now</p></> : <div className="hub-empty"><p>Add words in the reader to start practicing.</p><button onClick={()=>setView('reader')}>Open reader</button></div>}</main></div>

  if (view === 'grammar') return <div className="reader-app"><header className="reader-topbar"><button className="back-button" onClick={()=>setView('home')}><ArrowLeft size={17}/> Library</button><strong className="hub-title">GRAMMAR LIBRARY</strong><span className="reader-level">A1 — C1</span></header><main className="hub-page"><div className="hub-heading"><div><span className="eyebrow">LEARN THE STRUCTURE</span><h1>German, made clearer.</h1><p>Grammar rules, examples and explanations from an open learning dataset.</p></div></div><input className="grammar-search" value={grammarQuery} onChange={e=>setGrammarQuery(e.target.value)} placeholder="Search cases, verbs, word order…"/>{grammarLoading?<p className="panel-muted">Loading grammar library…</p>:grammarError?<p className="lookup-error">{grammarError}</p>:<div className="grammar-grid">{grammarRules.filter(rule=>(rule.category_name+' '+rule.subcategory+' '+rule.rule_english+' '+rule.rule_german).toLowerCase().includes(grammarQuery.toLowerCase())).map(rule=><article className="grammar-card" key={rule.id}><span>{rule.category_name} · {(rule.cefr_levels||[]).join(', ')}</span><h3>{rule.subcategory || rule.category_name}</h3><p>{rule.rule_english}</p><blockquote>{rule.rule_german}</blockquote><div className="grammar-example"><strong>{rule.example_de}</strong><small>{rule.example_en}</small></div></article>)}</div>}</main></div>

  if (view === 'reader') return <div className="reader-app">
    <header className="reader-topbar">
      <button className="back-button" onClick={() => setView('home')}><ArrowLeft size={17}/> Library</button>
      <a className="brand reader-brand" href="#home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <div className="reader-nav"><button onClick={()=>setView('vocab')}>Vocabulary ({vocab.length})</button><button onClick={openGrammar}>Grammar</button></div>
    </header>
    <main className="reader-layout">
      <section className="reader-main">
        <div className="reader-kicker">YOUR READING SPACE <span>·</span> GERMAN</div>
        <input className="reader-title-input" value={readerTitle} onChange={e=>setReaderTitle(e.target.value)} placeholder="Give your reading a title..." aria-label="Reading title"/>
        <p className="reader-instructions">Paste text from a source you are permitted to use, then tap any German word to explore it.</p>
        <textarea className="reader-paste" value={readerText} onChange={e=>setReaderText(e.target.value)} placeholder="Paste your German text here…" aria-label="German reading text"/>
        <div className="reader-toolbar"><span>{readerText.trim() ? readerText.trim().split(/\s+/).length + ' words' : 'Your text stays in this browser session.'}</span><div className="reader-toolbar-actions"><label className="upload-text-button">Upload .txt<input type="file" accept=".txt,text/plain" onChange={e=>loadTextFile(e.target.files?.[0])}/></label><button onClick={()=>{setReaderText('');setReaderTitle('');setActiveWord('')}}>Clear text</button></div></div>
        <div className="reader-divider"/>
        <div className="reading-heading"><span className="eyebrow">INTERACTIVE READING</span><span className="reading-hint"><span className="hint-dot"/> Tap a word to look it up</span>{phraseSelected&&<button className="phrase-lookup" onClick={()=>lookupPhrase(phraseSelected)}>Translate selected phrase</button>}</div>
        {readerText.trim()
          ? <article className="reading-paper" onMouseUp={()=>{const selection=window.getSelection()?.toString().trim()||'';setPhraseSelected(selection.split(/\s+/).length>1?selection:'')}}><h2>{readerTitle || 'German reading'}</h2><p>{renderReadableText()}</p></article>
          : <div className="reader-empty"><BookOpen size={28}/><strong>Your reading will appear here</strong><span>Paste a German passage in the box above to get started.</span></div>}
        <div className="reader-source-note">Use text you wrote yourself, public-domain material, or content whose licence permits this use. For other publishers, read on their original website.</div>
      </section>
      <aside className="word-panel">
        <div className="word-panel-top"><div><span className="eyebrow">WORD EXPLORER</span><h2>Wort für Wort.</h2></div><Sparkles size={19}/></div>
        {activeWord ? <>
          <div className="selected-word">{activeWord}<div className="word-actions"><button onClick={()=>speakWord(activeWord)} aria-label="Listen to word"><Volume2 size={16}/></button><button onClick={copyWord} aria-label="Copy word">{copied?<Check size={16}/>:<Bookmark size={16}/>}</button><button onClick={saveActiveWord} aria-label="Save word"><Bookmark size={16}/></button></div></div>
          <div className="word-section"><span className="panel-label">ENGLISH MEANING</span>{loading?<p className="panel-muted">Looking it up…</p>:translation?<p className="translation-text">{translation}</p>:<p className="panel-muted">No translation returned.</p>}</div>
          {lexical&&<div className="word-facts">{lexical.lemma&&<span><b>Base form</b>{lexical.lemma}</span>}{lexical.pos&&<span><b>Word type</b>{lexical.pos}</span>}{lexical.gender&&<span><b>Gender</b>{lexical.gender}</span>}{lexical.level&&<span><b>CEFR</b>{lexical.level}</span>}{lexical.example&&<span className="fact-example"><b>Example</b>{lexical.example}<small>{lexical.exampleEn}</small></span>}</div>}<div className="word-section"><span className="panel-label">DICTIONARY ENTRY</span>{dictionary?<p className="dictionary-text">{dictionary}</p>:<p className="panel-muted">German Wiktionary information will appear here when available.</p>}</div>
          {error&&<p className="lookup-error">{error}</p>}
          <p className="panel-disclaimer">Dictionary data comes from open Wiktionary-derived datasets and translation services. Inflected forms and grammatical fields may be incomplete; verify context.</p>
        </> : <div className="word-panel-empty"><div className="empty-word-icon">Aa</div><strong>Select a German word</strong><p>Tap any word in your passage. Its English meaning and available dictionary entry will show here.</p></div>}
        <div className="panel-bottom"><span>OPEN DICTIONARY + TRANSLATION APIS</span><a href="https://www.wiktionary.org/" target="_blank" rel="noreferrer">Wiktionary <ExternalLink size={12}/></a></div>
      </aside>
    </main>
  </div>

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Fluentio Stories home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <nav className="nav-links"><a href="#library">Explore</a><a href="#how">How it works</a><button onClick={()=>openReader()}>Reader</button><button onClick={()=>setView('vocab')}>Vocabulary</button><button onClick={openGrammar}>Grammar</button><a href="https://github.com/muneebinu/Fluentio-stories/tree/main/browser-extension" target="_blank" rel="noreferrer">Web Reader</a></nav>
      <button className="top-cta" onClick={()=>openReader()}>Open reader <ArrowUpRight size={16}/></button>
    </header>
    <main id="home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot"/> GERMAN, ONE STORY AT A TIME</div>
          <h1>Read more.<br/><em>Understand</em> more.</h1>
          <p className="hero-description">A better way to build your German — discover reading from A1 to B2, explore real-world language, and grow your vocabulary as you go.</p>
          <button className="hero-button" onClick={()=>document.getElementById('library')?.scrollIntoView({behavior:'smooth'})}>Explore the library <ArrowUpRight size={17}/></button>
          <div className="hero-meta"><span><BookOpen size={15}/> Curated reading sources</span><span><Globe2 size={15}/> A1 — B2</span></div>
        </div>
        <div className="hero-art" aria-label="Editorial illustration of a reading book"><div className="art-note note-top">LESEN · LERNEN · WACHSEN</div><div className="book-shadow"/><div className="book"><div className="book-label">DEUTSCH<br/>ENTDECKEN</div><div className="book-rule"/><div className="book-lines"><i/><i/><i/><i/></div><div className="book-mark">01 / 04</div></div><div className="art-stamp">WORT<br/>FÜR WORT</div><div className="art-note note-bottom">YOUR NEXT CHAPTER STARTS HERE.</div></div>
      </section>
      <section className="level-strip" aria-label="Reading levels"><div><span className="strip-label">FIND YOUR LEVEL</span><strong>Start where you are.</strong></div><div className="level-pills">{levels.slice(1).map(l=><button key={l} onClick={()=>{setLevel(l);document.getElementById('library')?.scrollIntoView({behavior:'smooth'})}} className={level===l?'active':''}>{l}</button>)}</div></section>
      <section className="library-section" id="library">
        <div className="section-heading"><div><div className="eyebrow">THE READING ROOM</div><h2>Find your next read.</h2><p>Explore trusted places to read German at your pace.</p></div><div className="search-wrap"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reading sources..." aria-label="Search reading sources"/></div></div>
        <div className="filters">{levels.map(l=><button key={l} className={level===l?'selected':''} onClick={()=>setLevel(l)}>{l}</button>)}<span className="result-count">{filtered.length} SOURCES</span></div>
        <div className="source-grid">{filtered.map((item,index)=><article className="source-card" key={item.id}><div className={'card-visual visual-'+item.id}><span className="visual-index">0{index+1}</span><span className="visual-type">{item.type}</span><div className="visual-glyph">{item.id===1?'A':item.id===2?'N':item.id===3?'Ü':'S'}</div></div><div className="card-content"><div className="card-topline"><span className="level-tag">{item.levelLabel}</span><span className="card-language">{item.language}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="card-footer"><span>{item.tag}</span><button onClick={()=>setSelected(item)} aria-label={'View '+item.title}><ArrowUpRight size={18}/></button></div></div></article>)}</div>
        {filtered.length===0&&<div className="empty-state">No sources match that search. Try another word or level.</div>}
        <div className="library-actions"><div><strong>Already have a German text?</strong><span>Open the interactive reader and explore it word by word.</span></div><button onClick={()=>openReader()}>Open reading workspace <ArrowUpRight size={16}/></button></div>
        <section className="featured-reading"><div className="eyebrow">HAND-PICKED STARTING POINTS</div><h3>Start with a real text.</h3><div className="featured-read-grid">{featuredReads.map(item=><article key={item.title}><span>{item.level} · {item.topic}</span><strong>{item.title}</strong><a href={item.url} target="_blank" rel="noreferrer">Read at German.net <ExternalLink size={13}/></a></article>)}</div><p>These are links to the original publisher. Their texts are not copied into Fluentio Stories.</p></section><div className="learning-shortcuts"><button onClick={()=>setView('vocab')}><Bookmark size={17}/> My vocabulary <span>{vocab.length} saved</span></button><button onClick={()=>setView('flashcards')}><GraduationCap size={17}/> Flashcard practice <span>Review saved words</span></button><button onClick={openGrammar}><Languages size={17}/> Grammar library <span>Rules and examples</span></button></div><p className="library-footnote">We link to original publishers. Content availability, reading levels and reuse permissions are determined by each source.</p>
      </section>
      <section className="how-section" id="how"><div className="how-heading"><div className="eyebrow">A SIMPLE WAY TO LEARN</div><h2>Make every word count.</h2></div><div className="how-grid"><div className="how-step"><span>01</span><BookOpen/><h3>Choose a source</h3><p>Find German reading from publishers and learning platforms.</p></div><div className="how-step"><span>02</span><Sparkles/><h3>Explore language</h3><p>Paste permitted text into the reader and tap a word for its meaning.</p></div><div className="how-step"><span>03</span><Bookmark/><h3>Keep progressing</h3><p>Save useful words, practise with flashcards and export your vocabulary.</p></div></div></section>
    </main>
    <footer><a className="footer-brand" href="#home">FLUENTIO <span>STORIES</span></a><p>Read your way to German.</p><span>© {new Date().getFullYear()} Fluentio Academia</span></footer>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={19}/></button><span className="eyebrow">READING SOURCE · {selected.levelLabel}</span><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-note">{selected.note}</div><a className="hero-button" href={selected.url} target="_blank" rel="noreferrer">Visit original source <ExternalLink size={16}/></a><div className="modal-divider"/><button className="reader-open-link" onClick={()=>openReader('',selected.title+' reading')}>Open reader workspace <ArrowUpRight size={15}/></button><p className="modal-small">Read the original publisher's material on its website. Paste text into your reading workspace only where you have permission to do so.</p></section></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
