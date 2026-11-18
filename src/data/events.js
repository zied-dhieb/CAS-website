// Automatically scans all subfolders in src/assets/events using Vite's eager glob.
// Adding any new subfolder with images and a .txt file automatically registers it.

const imageModules = import.meta.glob(
  '../assets/events/**/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
)

const textModules = import.meta.glob(
  ['../assets/events/**/*.txt', '../assets/events/**/*.txt.txt'],
  { query: '?raw', import: 'default', eager: true }
)

function parseEventText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { category: 'Activity', date: '', description: '' }
  }

  const lines = rawText.split(/\r?\n/)
  let category = ''
  let date = ''
  const bodyLines = []

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const catMatch = trimmed.match(/^category\s*:\s*(.+)$/i)
    const dateMatch = trimmed.match(/^date\s*:\s*(.+)$/i)

    if (catMatch && !category) {
      category = catMatch[1].trim()
    } else if (dateMatch && !date) {
      date = dateMatch[1].trim()
    } else {
      bodyLines.push(lines[i])
    }
  }

  return {
    category: formatCategory(category),
    date,
    description: bodyLines.join('\n').trim(),
  }
}

function formatCategory(cat) {
  if (!cat) return 'Activity'
  const c = cat.trim()
  const lower = c.toLowerCase()
  if (lower === 'technical') return 'Technical'
  if (lower === 'humanitarian') return 'Humanitarian'
  if (lower.includes('pre u') || lower.includes('pre-u')) return 'Pre-U STEM'
  if (lower === 'non technical' || lower === 'non-technical') return 'Non-Technical'
  return c.charAt(0).toUpperCase() + c.slice(1)
}

function formatTitle(folder) {
  return folder
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function loadEvents() {
  const eventsByFolder = new Map()

  // 1. Process text files
  for (const [path, raw] of Object.entries(textModules)) {
    const normalized = path.replace(/\\/g, '/')
    const rel = normalized.split('/events/')[1]
    if (!rel) continue
    const parts = rel.split('/')
    if (parts.length < 2) continue

    const folder = parts[0]
    if (!eventsByFolder.has(folder)) {
      eventsByFolder.set(folder, {
        id: folder,
        folder,
        title: formatTitle(folder),
        category: 'Activity',
        date: '',
        description: '',
        images: [],
      })
    }

    const event = eventsByFolder.get(folder)
    const parsed = parseEventText(raw)
    if (parsed.category) event.category = parsed.category
    if (parsed.date) event.date = parsed.date
    if (parsed.description) event.description = parsed.description
  }

  // 2. Process image files
  for (const [path, url] of Object.entries(imageModules)) {
    const normalized = path.replace(/\\/g, '/')
    const rel = normalized.split('/events/')[1]
    if (!rel) continue
    const parts = rel.split('/')
    if (parts.length < 2) continue

    const folder = parts[0]
    const fileName = parts.slice(1).join('/')

    if (!eventsByFolder.has(folder)) {
      eventsByFolder.set(folder, {
        id: folder,
        folder,
        title: formatTitle(folder),
        category: 'Activity',
        date: '',
        description: '',
        images: [],
      })
    }

    const event = eventsByFolder.get(folder)
    event.images.push({
      fileName,
      url,
    })
  }

  // 3. Sort images and finalize each event
  const events = Array.from(eventsByFolder.values()).map((event) => {
    // Sort images: 1_cover or cover first, then natural numeric/alphabetical
    event.images.sort((a, b) => {
      const aLower = a.fileName.toLowerCase()
      const bLower = b.fileName.toLowerCase()

      const aIsCover = aLower.includes('cover') || aLower.startsWith('1_') || aLower.startsWith('1.')
      const bIsCover = bLower.includes('cover') || bLower.startsWith('1_') || bLower.startsWith('1.')

      if (aIsCover && !bIsCover) return -1
      if (!aIsCover && bIsCover) return 1

      return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
    })

    event.cover = event.images[0]?.url || null
    return event
  })

  return events
}

export const events = loadEvents()
