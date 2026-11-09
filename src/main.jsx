import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowUpRight, BookOpen, Bookmark, Check, ChevronDown, ExternalLink, Globe2, Search, Sparkles, X } from 'lucide-react'
import './styles.css'
import './reader.css'

const levels = ['All levels', 'A1', 'A2', 'B1', 'B2']

// External reading destinations. Fluentio Stories links to publishers instead
// of copying their material without permission.
const sources = [
  { id: 1, title: 'LingoStories', description: 'Short, interactive stories for language learners, with accessible reading.', level: 'A1', type: 'Interactive stories', language: 'German', url: 'https://lingostories.org/de/', tag: 'Beginner friendly', note: 'Check the licence shown with each story before reuse.' },
  { id: 2, title: 'Nicos Weg', description: 'A structured German-learning course with everyday situations, videos and exercises.', level: 'A1', type: 'Video & lessons', language: 'German', url: 'https://learngerman.dw.com/', tag: 'A1–B1', note: 'Read and learn on Deutsche Welle.' },
  { id: 3, title: 'German collection', description: 'A large collection of German-language books and literary works. Difficulty varies.', level: 'B2', type: 'Classic literature', language: 'German', url: 'https://www.gutenberg.org/browse/languages/de', tag: 'Original literature', note: 'Check the copyright status of each individual work.' },
  { id: 4, title: 'Stufenpost', description: 'Graded news and reading material designed for German learners.', level: 'B1', type: 'News & reading', language: 'German', url: 'https://stufenpost.de/english/', tag: 'Real-world topics', note: 'Open the publisher for its current reading collection.' },
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

  const filtered = useMemo(() => sources.filter(item => {
    const matchesLevel = level === 'All levels' || item.level === level || (item.id === 2 && level === 'A2')
    const matchesQuery = (item.title + ' ' + item.description + ' ' + item.type).toLowerCase().includes(query.toLowerCase())
    return matchesLevel && matchesQuery
  }), [level, query])

  async function lookupWord(value) {
    const clean = value.trim().replace(/[^\p{L}\p{M}-]/gu, '')
    if (!clean) return
    setActiveWord(clean)
    setTranslation('')
    setDictionary('')
    setError('')
    setLoading(true)
    try {
      const translationUrl = new URL('https://api.mymemory.translated.net/get')
      translationUrl.searchParams.set('q', clean)
      translationUrl.searchParams.set('langpair', 'de|en')
      const dictionaryUrl = new URL('https://de.wiktionary.org/w/api.php')
      dictionaryUrl.searchParams.set('action', 'query')
      dictionaryUrl.searchParams.set('prop', 'extracts')
      dictionaryUrl.searchParams.set('explaintext', '1')
      dictionaryUrl.searchParams.set('exsectionformat', 'plain')
      dictionaryUrl.searchParams.set('titles', clean)
      dictionaryUrl.searchParams.set('format', 'json')
      dictionaryUrl.searchParams.set('origin', '*')
      const [translationResponse, dictionaryResponse] = await Promise.all([
        fetch(translationUrl), fetch(dictionaryUrl)
      ])
      if (translationResponse.ok) {
        const data = await translationResponse.json()
        if (data?.responseData?.translatedText) setTranslation(data.responseData.translatedText)
      }
      if (dictionaryResponse.ok) {
        const data = await dictionaryResponse.json()
        const page = Object.values(data?.query?.pages || {})[0]
        const extract = page?.extract || ''
        if (extract) setDictionary(extract.slice(0, 1100))
      }
      if (!translationResponse.ok && !dictionaryResponse.ok) throw new Error('Dictionary services are temporarily unavailable.')
    } catch (e) {
      setError(e.message || 'Could not look up this word right now.')
    } finally {
      setLoading(false)
    }
  }

  function openReader(text = '', title = '') {
    setReaderText(text)
    setReaderTitle(title)
    setActiveWord('')
    setTranslation('')
    setDictionary('')
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

  if (view === 'reader') return <div className="reader-app">
    <header className="reader-topbar">
      <button className="back-button" onClick={() => setView('home')}><ArrowLeft size={17}/> Library</button>
      <a className="brand reader-brand" href="#home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <span className="reader-level">READING MODE</span>
    </header>
    <main className="reader-layout">
      <section className="reader-main">
        <div className="reader-kicker">YOUR READING SPACE <span>·</span> GERMAN</div>
        <input className="reader-title-input" value={readerTitle} onChange={e=>setReaderTitle(e.target.value)} placeholder="Give your reading a title..." aria-label="Reading title"/>
        <p className="reader-instructions">Paste text from a source you are permitted to use, then tap any German word to explore it.</p>
        <textarea className="reader-paste" value={readerText} onChange={e=>setReaderText(e.target.value)} placeholder="Paste your German text here…" aria-label="German reading text"/>
        <div className="reader-toolbar"><span>{readerText.trim() ? readerText.trim().split(/\s+/).length + ' words' : 'Your text stays in this browser session.'}</span><button onClick={()=>{setReaderText('');setReaderTitle('');setActiveWord('')}}>Clear text</button></div>
        <div className="reader-divider"/>
        <div className="reading-heading"><span className="eyebrow">INTERACTIVE READING</span><span className="reading-hint"><span className="hint-dot"/> Tap a word to look it up</span></div>
        {readerText.trim()
          ? <article className="reading-paper"><h2>{readerTitle || 'German reading'}</h2><p>{renderReadableText()}</p></article>
          : <div className="reader-empty"><BookOpen size={28}/><strong>Your reading will appear here</strong><span>Paste a German passage in the box above to get started.</span></div>}
        <div className="reader-source-note">Use text you wrote yourself, public-domain material, or content whose licence permits this use. For other publishers, read on their original website.</div>
      </section>
      <aside className="word-panel">
        <div className="word-panel-top"><div><span className="eyebrow">WORD EXPLORER</span><h2>Wort für Wort.</h2></div><Sparkles size={19}/></div>
        {activeWord ? <>
          <div className="selected-word">{activeWord}<button onClick={copyWord} aria-label="Copy word">{copied?<Check size={16}/>:<Bookmark size={16}/>}</button></div>
          <div className="word-section"><span className="panel-label">ENGLISH MEANING</span>{loading?<p className="panel-muted">Looking it up…</p>:translation?<p className="translation-text">{translation}</p>:<p className="panel-muted">No translation returned.</p>}</div>
          <div className="word-section"><span className="panel-label">DICTIONARY ENTRY</span>{dictionary?<p className="dictionary-text">{dictionary}</p>:<p className="panel-muted">German Wiktionary information will appear here when available.</p>}</div>
          {error&&<p className="lookup-error">{error}</p>}
          <p className="panel-disclaimer">Translations and dictionary extracts are provided by free third-party services. Meanings depend on context; grammatical analysis and lemma detection are not guaranteed.</p>
        </> : <div className="word-panel-empty"><div className="empty-word-icon">Aa</div><strong>Select a German word</strong><p>Tap any word in your passage. Its English meaning and available dictionary entry will show here.</p></div>}
        <div className="panel-bottom"><span>POWERED BY OPEN DICTIONARY DATA</span><a href="https://de.wiktionary.org/" target="_blank" rel="noreferrer">Wiktionary <ExternalLink size={12}/></a></div>
      </aside>
    </main>
  </div>

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Fluentio Stories home"><img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia"/><span className="brand-divider"/><span className="brand-name">STORIES</span></a>
      <nav className="nav-links"><a href="#library">Explore</a><a href="#how">How it works</a><button onClick={()=>openReader()}>Reader</button></nav>
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
        <div className="source-grid">{filtered.map((item,index)=><article className="source-card" key={item.id}><div className={'card-visual visual-'+item.id}><span className="visual-index">0{index+1}</span><span className="visual-type">{item.type}</span><div className="visual-glyph">{item.id===1?'A':item.id===2?'N':item.id===3?'Ü':'S'}</div></div><div className="card-content"><div className="card-topline"><span className="level-tag">{item.level}</span><span className="card-language">{item.language}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="card-footer"><span>{item.tag}</span><button onClick={()=>setSelected(item)} aria-label={'View '+item.title}><ArrowUpRight size={18}/></button></div></div></article>)}</div>
        {filtered.length===0&&<div className="empty-state">No sources match that search. Try another word or level.</div>}
        <div className="library-actions"><div><strong>Already have a German text?</strong><span>Open the interactive reader and explore it word by word.</span></div><button onClick={()=>openReader()}>Open reading workspace <ArrowUpRight size={16}/></button></div>
        <p className="library-footnote">We link to original publishers. Content availability, reading levels and reuse permissions are determined by each source.</p>
      </section>
      <section className="how-section" id="how"><div className="how-heading"><div className="eyebrow">A SIMPLE WAY TO LEARN</div><h2>Make every word count.</h2></div><div className="how-grid"><div className="how-step"><span>01</span><BookOpen/><h3>Choose a source</h3><p>Find German reading from publishers and learning platforms.</p></div><div className="how-step"><span>02</span><Sparkles/><h3>Explore language</h3><p>Paste permitted text into the reader and tap a word for its meaning.</p></div><div className="how-step"><span>03</span><Bookmark/><h3>Keep progressing</h3><p>Read regularly and build confidence, one page at a time.</p></div></div></section>
    </main>
    <footer><a className="footer-brand" href="#home">FLUENTIO <span>STORIES</span></a><p>Read your way to German.</p><span>© {new Date().getFullYear()} Fluentio Academia</span></footer>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={19}/></button><span className="eyebrow">READING SOURCE · {selected.level}</span><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-note">{selected.note}</div><a className="hero-button" href={selected.url} target="_blank" rel="noreferrer">Visit original source <ExternalLink size={16}/></a><div className="modal-divider"/><button className="reader-open-link" onClick={()=>openReader('',selected.title+' reading')}>Open reader workspace <ArrowUpRight size={15}/></button><p className="modal-small">Read the original publisher's material on its website. Paste text into your reading workspace only where you have permission to do so.</p></section></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
