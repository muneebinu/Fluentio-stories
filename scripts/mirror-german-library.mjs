import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const mirrorDir = join(root, '.gutenberg-mirror')
const outputDir = join(root, 'public', 'books')
const curated = [
  { id: 35794, title: 'Märchen und Erzählungen für Anfänger · Erster Teil', author: 'H. A. Guerber', level: 'A1', sourceUrl: 'https://www.gutenberg.org/ebooks/35794' },
  { id: 45189, title: 'Märchen und Erzählungen für Anfänger · Zweiter Teil', author: 'H. A. Guerber', level: 'A2', sourceUrl: 'https://www.gutenberg.org/ebooks/45189' },
  { id: 74008, title: 'Der Schimmelreiter', author: 'Theodor Storm', level: 'B1', sourceUrl: 'https://www.gutenberg.org/ebooks/74008' },
  { id: 22367, title: 'Die Verwandlung', author: 'Franz Kafka', level: 'B1', sourceUrl: 'https://www.gutenberg.org/ebooks/22367' },
  { id: 6651, title: 'Immensee', author: 'Theodor Storm', level: 'B1', sourceUrl: 'https://www.gutenberg.org/ebooks/6651' },
  { id: 25791, title: 'In der Strafkolonie', author: 'Franz Kafka', level: 'B1+', sourceUrl: 'https://www.gutenberg.org/ebooks/25791' },
  { id: 69327, title: 'Der Prozess', author: 'Franz Kafka', level: 'B2', sourceUrl: 'https://www.gutenberg.org/ebooks/69327' }
]
const categories = [
  'Kategorie:Roman',
  'Kategorie:Novelle',
  'Kategorie:Erzählung',
  'Kategorie:Märchen',
  'Kategorie:Sage',
  'Kategorie:Kriminalroman',
  'Kategorie:Kinder- und Jugendliteratur'
]
const apiHeaders = { 'User-Agent': 'FluentioStories/1.0 (https://muneebinu.github.io/Fluentio-stories/)', 'Accept': 'application/json' }

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

async function mirrorCuratedGutenberg() {
  mkdirSync(mirrorDir, { recursive: true })
  const ids = curated.map(book => book.id)
  const acceptRegex = '.*(' + ids.join('|') + ').*\\.txt$'
  const harvestUrl = 'https://www.gutenberg.org/robot/harvest?filetypes[]=txt&langs[]=de'
  try {
    console.log('Requesting the seven curated reader files through Project Gutenberg’s documented robot-harvest route.')
    execFileSync('wget', ['--wait=2', '--mirror', '--span-hosts', '--accept-regex=' + acceptRegex, '--directory-prefix=' + mirrorDir, harvestUrl], { stdio: 'inherit' })
  } catch (error) {
    console.warn('The Gutenberg mirror step did not complete; continuing with the Wikisource library.', error.message)
  }
  const files = walk(mirrorDir).filter(path => path.toLowerCase().endsWith('.txt'))
  const output = []
  for (const book of curated) {
    const matches = files.filter(path => path.includes(String(book.id)))
    if (!matches.length) continue
    matches.sort((a, b) => statSync(b).size - statSync(a).size)
    const destination = join(outputDir, book.id + '.txt')
    copyFileSync(matches[0], destination)
    const text = (await import('node:fs')).readFileSync(destination, 'utf8')
    output.push({ ...book, provider: 'gutenberg', word_count: text.trim().split(/\\s+/).length, subjects: ['learner reader', book.level] })
  }
  return output
}

async function fetchWikisourceCategory(category) {
  const params = new URLSearchParams({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: category,
    gcmtype: 'page',
    gcmlimit: '100',
    prop: 'extracts',
    explaintext: '1',
    exsectionformat: 'plain',
    format: 'json',
    origin: '*'
  })
  const response = await fetch('https://de.wikisource.org/w/api.php?' + params.toString(), { headers: apiHeaders })
  if (!response.ok) throw new Error('Wikisource category ' + category + ' returned ' + response.status)
  const data = await response.json()
  return Object.values(data.query?.pages || {})
}

async function mirrorWikisource() {
  const found = new Map()
  for (const category of categories) {
    try {
      const pages = await fetchWikisourceCategory(category)
      for (const page of pages) {
        const title = page.title || ''
        const text = (page.extract || '').trim()
        if (!page.pageid || !title || title.includes(':') || text.length < 6000) continue
        if (found.has(page.pageid)) continue
        const id = 'ws-' + page.pageid
        const sourceUrl = 'https://de.wikisource.org/wiki/' + encodeURIComponent(title.replaceAll(' ', '_'))
        const authorMatch = text.match(/(?:Autor|Verfasser)[:：]\\s*([^\\n]+)/i)
        const authors = [{ name: authorMatch?.[1]?.trim() || 'Wikisource edition' }]
        const wordCount = text.split(/\\s+/).filter(Boolean).length
        found.set(page.pageid, {
          id, title, authors, subjects: [category.replace('Kategorie:', '')],
          provider: 'wikisource', sourceUrl, word_count: wordCount
        })
        writeFileSync(join(outputDir, id + '.txt'), text, 'utf8')
        if (found.size >= 150) break
      }
      if (found.size >= 150) break
    } catch (error) {
      console.warn('Skipping Wikisource category ' + category + ': ' + error.message)
    }
  }
  return [...found.values()]
}

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const gutenbergBooks = await mirrorCuratedGutenberg()
  const wikisourceBooks = await mirrorWikisource()
  const books = [...gutenbergBooks, ...wikisourceBooks]
  const ids = books.map(book => book.id)
  writeFileSync(join(outputDir, 'index.json'), JSON.stringify({ ids, count: books.length, books }, null, 2))
  writeFileSync(join(outputDir, 'NOTICE.txt'),
    'Fluentio Stories hosts selected full-text editions from Project Gutenberg and German Wikisource. ' +
    'Project Gutenberg files are retained with their original licence headers. German Wikisource texts are attributed to their source pages; check each page for its specific public-domain or Creative Commons licence. ' +
    'Copyright status can differ by country and translations may have separate rights.\\n'
  )
  console.log('Hosted ' + books.length + ' full-text German works (' + gutenbergBooks.length + ' Gutenberg learner/classic editions; ' + wikisourceBooks.length + ' Wikisource works).')
  if (books.length < 5) throw new Error('Too few full texts were mirrored; refusing to publish an almost-empty library.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
