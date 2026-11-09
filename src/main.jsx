import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowUpRight, BookOpen, Bookmark, ChevronDown, ExternalLink, Globe2, Search, Sparkles, X } from 'lucide-react'
import './styles.css'

const levels = ['All levels', 'A1', 'A2', 'B1', 'B2']

// These are source directories, not copied story text. Open each publisher's
// site to read its material and respect its own terms and attribution rules.
const sources = [
  { id: 1, title: 'LingoStories', description: 'Short, interactive stories for language learners, with a focus on accessible reading.', level: 'A1', type: 'Interactive stories', language: 'German', url: 'https://lingostories.org/de/', tag: 'Beginner friendly', note: 'Check each story’s licence before reuse.' },
  { id: 2, title: 'Nicos Weg', description: 'A structured German-learning course with everyday situations, videos and exercises.', level: 'A1', type: 'Video & lessons', language: 'German', url: 'https://learngerman.dw.com/', tag: 'A1–B1', note: 'Read and learn on Deutsche Welle.' },
  { id: 3, title: 'German collection', description: 'A large collection of German-language books and literary works. Difficulty varies.', level: 'B2', type: 'Classic literature', language: 'German', url: 'https://www.gutenberg.org/browse/languages/de', tag: 'Original literature', note: 'Check the copyright status of each individual work.' },
  { id: 4, title: 'Stufenpost', description: 'Graded news and reading material designed for German learners.', level: 'B1', type: 'News & reading', language: 'German', url: 'https://stufenpost.de/english/', tag: 'Real-world topics', note: 'Open the publisher for its current reading collection.' },
]

function App() {
  const [level, setLevel] = useState('All levels')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [word, setWord] = useState('')
  const [translation, setTranslation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const filtered = useMemo(() => sources.filter(item => {
    const matchesLevel = level === 'All levels' || item.level === level || (item.id === 2 && level === 'A2')
    const matchesQuery = (item.title + ' ' + item.description + ' ' + item.type).toLowerCase().includes(query.toLowerCase())
    return matchesLevel && matchesQuery
  }), [level, query])

  async function lookupWord(value) {
    const clean = value.trim().replace(/[^\p{L}\p{M}-]/gu, '')
    if (!clean) return
    setWord(clean)
    setTranslation('')
    setError('')
    setLoading(true)
    try {
      const url = new URL('https://api.mymemory.translated.net/get')
      url.searchParams.set('q', clean)
      url.searchParams.set('langpair', 'de|en')
      const response = await fetch(url)
      if (!response.ok) throw new Error('Dictionary service is temporarily unavailable.')
      const data = await response.json()
      const result = data?.responseData?.translatedText
      if (!result || data?.responseStatus !== 200) throw new Error('No translation found. Try another word.')
      setTranslation(result)
    } catch (e) {
      setError(e.message || 'Could not look up this word right now.')
    } finally {
      setLoading(false)
    }
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Fluentio Stories home">
        <img src="https://raw.githubusercontent.com/muneebinu/Fluentio-Academia/main/assets/logo.png" alt="Fluentio Academia" />
        <span className="brand-divider" />
        <span className="brand-name">STORIES</span>
      </a>
      <nav className="nav-links"><a href="#library">Explore</a><a href="#how">How it works</a></nav>
      <a className="top-cta" href="#library">Start reading <ArrowUpRight size={16}/></a>
    </header>

    <main id="home">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> GERMAN, ONE STORY AT A TIME</div>
          <h1>Read more.<br/><em>Understand</em> more.</h1>
          <p className="hero-description">A better way to build your German — discover reading from A1 to B2, explore real-world language, and grow your vocabulary as you go.</p>
          <a className="hero-button" href="#library">Explore the library <ArrowUpRight size={17}/></a>
          <div className="hero-meta"><span><BookOpen size={15}/> Curated reading sources</span><span><Globe2 size={15}/> A1 — B2</span></div>
        </div>
        <div className="hero-art" aria-label="Editorial illustration of a reading book">
          <div className="art-note note-top">LESEN · LERNEN · WACHSEN</div>
          <div className="book-shadow"/>
          <div className="book">
            <div className="book-label">DEUTSCH<br/>ENTDECKEN</div>
            <div className="book-rule"/>
            <div className="book-lines"><i/><i/><i/><i/></div>
            <div className="book-mark">01 / 04</div>
          </div>
          <div className="art-stamp">WORT<br/>FÜR WORT</div>
          <div className="art-note note-bottom">YOUR NEXT CHAPTER STARTS HERE.</div>
        </div>
      </section>

      <section className="level-strip" aria-label="Reading levels">
        <div><span className="strip-label">FIND YOUR LEVEL</span><strong>Start where you are.</strong></div>
        <div className="level-pills">{levels.slice(1).map(l => <button key={l} onClick={() => {setLevel(l); document.getElementById('library')?.scrollIntoView({behavior:'smooth'})}} className={level===l?'active':''}>{l}</button>)}</div>
      </section>

      <section className="library-section" id="library">
        <div className="section-heading">
          <div><div className="eyebrow">THE READING ROOM</div><h2>Find your next read.</h2><p>Explore trusted places to read German at your pace.</p></div>
          <div className="search-wrap"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reading sources..." aria-label="Search reading sources"/></div>
        </div>
        <div className="filters">
          {levels.map(l=><button key={l} className={level===l?'selected':''} onClick={()=>setLevel(l)}>{l}</button>)}
          <span className="result-count">{filtered.length} SOURCES</span>
        </div>
        <div className="source-grid">
          {filtered.map((item, index)=><article className="source-card" key={item.id}>
            <div className={'card-visual visual-'+item.id}><span className="visual-index">0{index+1}</span><span className="visual-type">{item.type}</span><div className="visual-glyph">{item.id===1?'A':item.id===2?'N':item.id===3?'Ü':'S'}</div></div>
            <div className="card-content">
              <div className="card-topline"><span className="level-tag">{item.level}</span><span className="card-language">{item.language}</span></div>
              <h3>{item.title}</h3><p>{item.description}</p>
              <div className="card-footer"><span>{item.tag}</span><button onClick={()=>setSelected(item)} aria-label={'View '+item.title}><ArrowUpRight size={18}/></button></div>
            </div>
          </article>)}
        </div>
        {filtered.length===0 && <div className="empty-state">No sources match that search. Try another word or level.</div>}
        <p className="library-footnote">We link to original publishers. Content availability, reading levels and reuse permissions are determined by each source.</p>
      </section>

      <section className="how-section" id="how">
        <div className="how-heading"><div className="eyebrow">A SIMPLE WAY TO LEARN</div><h2>Make every word count.</h2></div>
        <div className="how-grid">
          <div className="how-step"><span>01</span><BookOpen/><h3>Choose a story</h3><p>Pick a reading source that fits your current German level.</p></div>
          <div className="how-step"><span>02</span><Sparkles/><h3>Explore language</h3><p>Use the word lookup to get a quick German-to-English translation.</p></div>
          <div className="how-step"><span>03</span><Bookmark/><h3>Keep progressing</h3><p>Read regularly and build confidence, one page at a time.</p></div>
        </div>
      </section>
    </main>

    <footer><a className="footer-brand" href="#home">FLUENTIO <span>STORIES</span></a><p>Read your way to German.</p><span>© {new Date().getFullYear()} Fluentio Academia</span></footer>

    {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="source-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close" onClick={()=>setSelected(null)} aria-label="Close"><X size={19}/></button>
      <span className="eyebrow">READING SOURCE · {selected.level}</span><h2 id="modal-title">{selected.title}</h2><p>{selected.description}</p><div className="modal-note">{selected.note}</div>
      <a className="hero-button" href={selected.url} target="_blank" rel="noreferrer">Visit original source <ExternalLink size={16}/></a>
      <div className="modal-divider"/>
      <label className="lookup-label" htmlFor="word-input">TRY A WORD LOOKUP <span>GERMAN → ENGLISH</span></label>
      <div className="lookup-row"><input id="word-input" value={word} onChange={e=>setWord(e.target.value)} onKeyDown={e=>e.key==='Enter'&&lookupWord(word)} placeholder="e.g. gemütlich"/><button onClick={()=>lookupWord(word)}>Translate</button></div>
      {loading&&<p className="lookup-result">Looking up your word…</p>}
      {translation&&<div className="lookup-result"><strong>{word}</strong><span>{translation}</span><small>Machine translation · verify context in the original sentence.</small></div>}
      {error&&<p className="lookup-error">{error}</p>}
      <p className="modal-small">Translation uses a free third-party service and may be rate-limited. It does not yet identify grammatical forms or noun articles.</p>
    </section></div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
