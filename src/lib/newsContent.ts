/**
 * Convert admin textarea plain text to Payload Slate richText shape (array of blocks).
 */
export function plainTextToSlate(plain: string): { type: string; children: { text: string }[] }[] {
  const trimmed = plain ?? ''
  const blocks = trimmed.trim() === '' ? [''] : trimmed.split(/\n\n+/)
  return blocks.map((block) => ({
    type: 'p',
    children: [{ text: block }],
  }))
}

function extractTextFromNode(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'object' && 'text' in (node as object) && (node as { text?: string }).text != null) {
    return String((node as { text: string }).text)
  }
  if (typeof node === 'object' && node !== null && 'children' in node) {
    const children = (node as { children: unknown[] }).children
    if (Array.isArray(children)) {
      return children.map(extractTextFromNode).join('')
    }
  }
  return ''
}

/** Slate / richText → plain string for editing in textarea */
export function slateToPlainText(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content
    .map((node) => extractTextFromNode(node))
    .join('\n\n')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Slate → safe HTML for public article body */
export function slateToSimpleHtml(content: unknown): string {
  if (typeof content === 'string') {
    return `<p>${escapeHtml(content).replace(/\n/g, '<br />')}</p>`
  }
  if (!Array.isArray(content)) return ''
  return content
    .map((node: any) => {
      const text = extractTextFromNode(node)
      const tag =
        node?.type === 'h1' || node?.type === 'h2' || node?.type === 'h3' ? node.type : 'p'
      return `<${tag}>${escapeHtml(text).replace(/\n/g, '<br />')}</${tag}>`
    })
    .join('')
}

export const NEWS_CATEGORY_LABELS: Record<string, string> = {
  conference: 'Conference Updates',
  speakers: 'Speaker Announcements',
  partnerships: 'Partnership News',
  'youth-stories': 'Youth Stories',
  research: 'Research',
  advocacy: 'Advocacy',
  events: 'Events',
}

export type NewsRelatedLink = { label: string; url: string }

export function formatNewsUserName(user: unknown): string {
  if (!user || typeof user !== 'object') return ''
  const u = user as { firstName?: string; lastName?: string; email?: string }
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim()
  return name || u.email || ''
}

export function formatNewsAuthorNames(article: {
  authors?: unknown
  author?: unknown
}): string {
  const authors = Array.isArray(article.authors) ? article.authors : []
  const names = authors.map(formatNewsUserName).filter(Boolean)
  if (names.length > 0) return names.join(', ')
  const primary = formatNewsUserName(article.author)
  return primary || 'SARSYC'
}

export function parseNewsAuthorIds(article: {
  authors?: unknown
  author?: unknown
}): string[] {
  const fromAuthors = Array.isArray(article.authors)
    ? article.authors
        .map((a) => (typeof a === 'object' && a && 'id' in a ? String((a as { id: unknown }).id) : String(a)))
        .filter(Boolean)
    : []
  if (fromAuthors.length > 0) return fromAuthors
  const author = article.author
  if (typeof author === 'object' && author && 'id' in author) {
    return [String((author as { id: unknown }).id)]
  }
  if (author != null && author !== '') return [String(author)]
  return []
}

export type NewsRelatedLinkInput = { label: string; url: string }

export function parseNewsRelatedLinks(raw: string | null): NewsRelatedLinkInput[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => ({
        label: String(item.label || '').trim(),
        url: String(item.url || '').trim(),
      }))
      .filter((item) => item.label && item.url)
  } catch {
    return []
  }
}

export function parseNewsAuthorIdNumbers(raw: string | null): number[] {
  try {
    const parsed = JSON.parse(raw || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0)
  } catch {
    return []
  }
}

export function parseNewsDownloadResource(label: string | null, url: string | null) {
  const cleanLabel = (label || '').trim()
  const cleanUrl = (url || '').trim()
  if (!cleanLabel && !cleanUrl) return undefined
  if (!cleanLabel || !cleanUrl) {
    throw new Error('Download resource requires both a label and a URL.')
  }
  return { label: cleanLabel, url: cleanUrl }
}
