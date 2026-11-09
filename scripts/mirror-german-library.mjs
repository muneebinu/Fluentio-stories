import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const mirrorDir = join(root, '.gutenberg-mirror')
const outputDir = join(root, 'public', 'books')
const curatedIds = [35794, 45189, 74008, 22367, 6651, 25791, 69327]
const germanAuthorHints = [
  'Guerber', 'Grimm', 'Storm', 'Kafka', 'Goethe', 'Schiller', 'Heine',
  'Hoffmann', 'Hauff', 'Kleist', 'Stifter', 'Eichendorff', 'Fontane',
  'Mann', 'Nietzsche', 'Lessing', 'Tieck', 'Droste', 'Mörike', 'Hebbel',
  'Keller', 'Gotthelf', 'Busch', 'Wieland', 'Lenz', 'Büchner',
  'Schopenhauer', 'Fichte', 'Hegel', 'Humboldt', 'Rilke', 'Trakl',
  'Zweig', 'Schnitzler', 'Musäus', 'Brentano', 'Arnim', 'Bürger',
  'Claudius', 'Gellert', 'Klopstock', 'Uhland', 'Jean Paul', 'Hofmannsthal',
  'Adalbert', 'Jeremias', 'Hermann', 'Walther von der Vogelweide'
]

async function collectBooks() {
  const books = []
  const curatedResponse = await fetch('https://gutendex.com/books/?ids=' + curatedIds.join(','), { headers: { 'User-Agent': 'FluentioStories/1.0 (German reading project)', 'Accept': 'application/json' } })
  if (curatedResponse.ok) { const curatedData = await curatedResponse.json(); for (const book of curatedData.results || []) books.push(book) }
  let next = 'https://gutendex.com/books/?languages=de&mime_type=text%2Fplain&copyright=false&author_year_end=1955'
  let pages = 0
  while (next && pages < 40 && books.length < 160) {
    const response = await fetch(next, { headers: { 'User-Agent': 'FluentioStories/1.0 (German reading project)', 'Accept': 'application/json' } })
    if (!response.ok) throw new Error('Gutendex catalogue request failed: ' + response.status)
    const data = await response.json()
    for (const book of data.results || []) {
      const authors = book.authors || []
      const names = authors.map(author => author.name || '')
      const oldEnough = authors.length > 0 && authors.every(author => Number.isFinite(author.death_year) && author.death_year <= 1955)
      const knownGermanAuthor = names.some(name => germanAuthorHints.some(hint => name.toLowerCase().includes(hint.toLowerCase())))
      const hasPlainText = Object.keys(book.formats || {}).some(type => type.startsWith('text/plain'))
      if (oldEnough && knownGermanAuthor && hasPlainText) books.push(book)
    }
    next = data.next
    pages += 1
  }
  const unique = [...new Map(books.map(book => [book.id, book])).values()]
  return unique.slice(0, 160)
}

function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

async function main() {
  mkdirSync(mirrorDir, { recursive: true })
  mkdirSync(outputDir, { recursive: true })
  const books = await collectBooks()
  const ids = books.map(book => book.id)
  if (!ids.length) throw new Error('No German public-domain book IDs were selected')

  const idPattern = ids.join('|')
  const acceptRegex = '.*(' + idPattern + ').*\\.txt$'
  const harvestUrl = 'https://www.gutenberg.org/robot/harvest?filetypes[]=txt&langs[]=de'
  console.log('Mirroring ' + ids.length + ' selected German text editions through Project Gutenberg’s documented robot-harvest route.')
  execFileSync('wget', [
    '--wait=2',
    '--mirror',
    '--span-hosts',
    '--accept-regex=' + acceptRegex,
    '--directory-prefix=' + mirrorDir,
    harvestUrl
  ], { stdio: 'inherit' })

  const files = walk(mirrorDir).filter(path => path.toLowerCase().endsWith('.txt'))
  const copied = []
  for (const id of ids) {
    const matches = files.filter(path => path.includes(String(id)))
    if (!matches.length) continue
    matches.sort((a, b) => statSync(b).size - statSync(a).size)
    const destination = join(outputDir, id + '.txt')
    copyFileSync(matches[0], destination)
    copied.push(id)
  }
  const copiedBooks = books.filter(book => copied.includes(book.id)).map(book => ({ id: book.id, title: book.title, authors: book.authors || [], subjects: book.subjects || [], download_count: book.download_count || 0 }))
  writeFileSync(join(outputDir, 'index.json'), JSON.stringify({ ids: copied, count: copied.length, books: copiedBooks }, null, 2))
  writeFileSync(join(outputDir, 'NOTICE.txt'),
    'German-language public-domain text editions mirrored for Fluentio Stories. ' +
    'Each text is retained with its Project Gutenberg header and licence notice. ' +
    'Project Gutenberg copyright determinations are US-based; local copyright law and any separate translation rights must be checked. ' +
    'The in-app cards link to the original ebook landing pages.\n'
  )
  console.log('Hosted ' + copied.length + ' full-text books locally.')
  if (copied.length < 5) throw new Error('Too few full texts were mirrored; refusing to publish an almost-empty book shelf.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
