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
