import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const outputDir = join(root, 'public', 'books')
const categories = [
  'Kategorie:Roman',
  'Kategorie:Novelle',
  'Kategorie:Erzählung',
  'Kategorie:Märchen',
  'Kategorie:Sage',
  'Kategorie:Fabel',
  'Kategorie:Anekdote'
]
const apiHeaders = {
  'User-Agent': 'FluentioStories/1.0 (https://muneebinu.github.io/Fluentio-stories/)',
  'Accept': 'application/json'
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))

function htmlToText(html) {
  return String(html || '')
    .replace(/<(script|style|noscript|nav|header|footer)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<div[^>]+class="[^"]*(?:toc|navbox|references|catlinks|mw-editsection)[^"]*"[^>]*>[\s\S]*?<\/div>/gi, ' ')
    .replace(/<table[\s\S]*?<\/table>/gi, ' ')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function fetchCategoryMembers(category) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'categorymembers',
    cmtitle: category,
    cmtype: 'page',
    cmlimit: '100',
    format: 'json',
    origin: '*'
  })
  const response = await fetch('https://de.wikisource.org/w/api.php?' + params.toString(), { headers: apiHeaders })
  if (!response.ok) throw new Error(category + ' category request returned ' + response.status)
  const data = await response.json()
  if (data.error) throw new Error(data.error.info || 'Wikisource category error')
  return data.query?.categorymembers || []
}

async function fetchFullText(title) {
  const params = new URLSearchParams({ action: 'parse', page: title, prop: 'text', format: 'json', origin: '*' })
  const response = await fetch('https://de.wikisource.org/w/api.php?' + params.toString(), { headers: apiHeaders })
  if (!response.ok) return ''
  const data = await response.json()
  if (data.error) return ''
  return htmlToText(data.parse?.text)
}

function levelForCategory(category) {
  if (/Fabel|Anekdote|Märchen|Sage/.test(category)) return 'A1–A2 reading challenge'
  if (/Erzählung|Novelle/.test(category)) return 'B1 reading challenge'
  if (/Roman/.test(category)) return 'B2 reading challenge'
  return 'Reading challenge'
}

async function mirrorWikisource() {
  const found = new Map()
  for (const category of categories) {
    if (found.size >= 150) break
    try {
      const members = await fetchCategoryMembers(category)
      const titles = members.map(page => page.title).filter(title => title && !title.includes(':'))
      console.log('Wikisource ' + category + ': checking ' + titles.length + ' titles.')
      for (let start = 0; start < titles.length && found.size < 150; start += 3) {
        const batch = titles.slice(start, start + 3)
        const texts = await Promise.all(batch.map(title => fetchFullText(title)))
        for (let i = 0; i < batch.length; i++) {
          const title = batch[i]
          const text = texts[i]
          if (!text || text.length < 6000) continue
          const page = members.find(item => item.title === title)
          if (!page?.pageid || found.has(page.pageid)) continue
          const id = 'ws-' + page.pageid
          const sourceUrl = 'https://de.wikisource.org/wiki/' + encodeURIComponent(title.replaceAll(' ', '_'))
          const wordCount = text.split(/\s+/).filter(Boolean).length
          const authorMatch = text.match(/(?:Autor|Verfasser)[:：]\s*([^\n]+)/i)
          const book = {
            id, title,
            authors: [{ name: authorMatch?.[1]?.trim() || 'German Wikisource' }],
            subjects: [category.replace('Kategorie:', '')],
            provider: 'wikisource', sourceUrl, word_count: wordCount,
            level: levelForCategory(category)
          }
          found.set(page.pageid, book)
          writeFileSync(join(outputDir, id + '.txt'), text, 'utf8')
        }
        if (found.size >= 150) break
        await pause(1000)
      }
      await pause(1000)
    } catch (error) {
      console.warn('Skipping ' + category + ': ' + error.message)
    }
  }
  console.log('Mirrored ' + found.size + ' complete German Wikisource texts.')
  return [...found.values()]
}

async function main() {
  mkdirSync(outputDir, { recursive: true })
  const indexPath = join(outputDir, 'index.json')
  if (existsSync(indexPath)) {
    try {
      const cached = JSON.parse(readFileSync(indexPath, 'utf8'))
      if ((cached.books || []).length >= 5) {
        console.log('Using cached local library: ' + cached.books.length + ' complete German texts.')
        return
      }
    } catch {}
  }
  const books = await mirrorWikisource()
  const ids = books.map(book => book.id)
  writeFileSync(indexPath, JSON.stringify({ ids, count: books.length, books }, null, 2))
  writeFileSync(join(outputDir, 'NOTICE.txt'),
    'German-language full texts mirrored from German Wikisource for Fluentio Stories. ' +
    'Each entry links to its source page. Check the individual source page for the specific public-domain or Creative Commons licence and attribution requirements. ' +
    'The reading-level labels are approximate genre-based challenges, not official CEFR grading.\n'
  )
  console.log('Hosted ' + books.length + ' complete German texts in the Fluentio library.')
  if (books.length < 5) throw new Error('Too few full texts were mirrored; refusing to publish an almost-empty library.')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
