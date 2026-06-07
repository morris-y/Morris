import fs from 'fs'
import path from 'path'

export interface NoteItem {
  slug: string
  title: string
  date: string
  content: string
  source: 'local' | 'medium'
  url?: string
}

export interface NoteFolder {
  id: string
  label: string
  notes: NoteItem[]
}

function parseLocalMd(raw: string, slug: string): { title: string; date: string; content: string } {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!frontmatterMatch) {
    return { title: slug, date: '', content: raw }
  }
  const meta = frontmatterMatch[1]
  const content = frontmatterMatch[2].trim()
  const titleMatch = meta.match(/^title:\s*(.+)$/m)
  const dateMatch = meta.match(/^date:\s*(.+)$/m)
  return {
    title: titleMatch ? titleMatch[1].trim() : slug,
    date: dateMatch ? dateMatch[1].trim() : '',
    content,
  }
}

function readFolder(folderPath: string, folderId: string): NoteItem[] {
  if (!fs.existsSync(folderPath)) return []
  return fs
    .readdirSync(folderPath)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(folderPath, file), 'utf-8')
      const slug = file.replace(/\.md$/, '')
      const { title, date, content } = parseLocalMd(raw, slug)
      return { slug: `${folderId}/${slug}`, title, date, content, source: 'local' as const }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getLocalFolders(): NoteFolder[] {
  const base = path.join(process.cwd(), 'src/content/notes')
  if (!fs.existsSync(base)) return []

  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((dir) => ({
      id: dir.name,
      label: dir.name,
      notes: readFolder(path.join(base, dir.name), dir.name),
    }))
    .filter((f) => f.notes.length > 0)
}

export async function getMediumFolders(): Promise<NoteFolder[]> {
  try {
    const res = await fetch('https://morrisy.medium.com/feed', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const xml = await res.text()

    const items: NoteItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1]
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? 'Untitled'
      const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
      const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
      const contentEncoded = block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ?? ''
      const description = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] ?? ''

      // Strip HTML tags for preview; keep as raw for display
      const content = contentEncoded || description

      items.push({
        slug: `medium/${encodeURIComponent(title)}`,
        title,
        date: pubDate ? new Date(pubDate).toISOString().split('T')[0] : '',
        content,
        source: 'medium',
        url: link,
      })
    }

    if (items.length === 0) return []
    return [{ id: 'medium', label: 'medium', notes: items }]
  } catch {
    return []
  }
}

export async function getAllFolders(): Promise<NoteFolder[]> {
  const [local, medium] = await Promise.all([getLocalFolders(), getMediumFolders()])
  return [...local, ...medium]
}
