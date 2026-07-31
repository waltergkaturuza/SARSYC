import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'
import { slateToPlainText } from '@/lib/newsContent'
import { getCountryLabel } from '@/lib/countries'
import {
  SESSION_DAY_OPTIONS,
  formatSessionTime,
  sessionDayLabel,
  sessionTrackLabel,
  sessionTypeLabel,
  formatSpeakerNamesList,
  formatPersonAffiliation,
  sessionDayTheme,
} from '@/lib/sessionsContent'

const BRAND_BLUE = '#1e3a8a'
const ACCENT_BLUE = '#0284c7'
const TEXT_DARK = '#111827'
const TEXT_MUTED = '#4b5563'

const DAY_OVERVIEW: Record<string, { title: string; bullets: string[] }> = {
  'day-1': {
    title: 'Day 1: Research Indaba III - Evidence for Action',
    bullets: [
      'Opening remarks, Evidence Engine and youth-led abstract presentations across 5 tracks',
      'Evidence to Action Plenary, poster presentations and keynote',
      'Launch of the SARSYC V Research Volume and Celebrating Evidence Excellence awards',
    ],
  },
  'day-2': {
    title: 'Day 2: Forums and Engagements',
    bullets: [
      "Mugota/Ixhiba Young Men's Forum - suicide, substance use and sexual health",
      'Web for Life Network Symposium | SHE SOARS - education equity, digital safety and healthy lifestyles',
      'Alliance Building Labs - GEAR Alliance Impact Showcase and Alliance Spotlight',
      'STEPP - youth advocacy presentations and policy panels with parliamentarians',
      'High-Level Youth-Parliamentarian Round Table (closed meeting)',
    ],
  },
  'day-3': {
    title: 'Day 3: High-Level Engagement and Culture Night',
    bullets: [
      'High-Level Engagement Platform and Official Ceremony - Windhoek Declaration handover',
      'Regional leadership addresses and Voices of Namibia',
      'Culture Night - Sixteen Nations, One Movement',
    ],
  },
}

/** PDFKit Helvetica only supports WinAnsi — strip/replace unsupported glyphs. */
function pdfSafe(value: unknown): string {
  return String(value ?? '')
    .replace(/\u2013|\u2014|\u2212/g, '-') // en/em dash, minus
    .replace(/\u2022|\u00B7|\u2023/g, '-') // bullets / middle dot
    .replace(/\u2026/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
}

async function loadBrandImage(filename: string): Promise<Buffer | null> {
  const localPath = path.join(process.cwd(), 'public', filename)
  try {
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath)
    }
  } catch {
    // fall through to remote fetch
  }

  try {
    const response = await fetch(`https://www.sarsyc.org/${filename}`)
    if (!response.ok) return null
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  }
}

function countryLabel(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null
  return getCountryLabel(value) || value
}

function personDetail(person: any, roleKey: 'title' | 'role' = 'title'): string | null {
  if (!person || typeof person !== 'object' || !person.name) return null
  const country = countryLabel(person.country)
  let roleOrTitle: string | null =
    roleKey === 'title'
      ? typeof person.title === 'string'
        ? person.title
        : null
      : typeof person.role === 'string'
        ? person.role
        : null

  if (roleKey === 'role') {
    const raw = (roleOrTitle || '').trim()
    if (!raw) roleOrTitle = 'Youth Steering Committee Member'
    else if (/youth\s+steering/i.test(raw)) roleOrTitle = raw
    else if (/^committee\s+member$/i.test(raw)) roleOrTitle = 'Youth Steering Committee Member'
    else roleOrTitle = `Youth Steering Committee ${raw}`
  }

  const affiliation = formatPersonAffiliation({
    title: roleKey === 'title' ? roleOrTitle : null,
    role: roleKey === 'role' ? roleOrTitle : null,
    organization: person.organization,
    country,
  })
  return affiliation ? `${person.name} - ${affiliation}` : String(person.name)
}

function peopleBlocks(session: any): { label: string; lines: string[] }[] {
  const blocks: { label: string; lines: string[] }[] = []

  const speakers = (Array.isArray(session.speakers) ? session.speakers : [])
    .map((s: any) => personDetail(s, 'title'))
    .filter(Boolean) as string[]
  const guests = formatSpeakerNamesList(session.speakerNames)
  const allSpeakers = [...speakers, ...guests]
  if (allSpeakers.length) blocks.push({ label: 'Speakers', lines: allSpeakers })

  const committee = (Array.isArray(session.committeeMembers) ? session.committeeMembers : [])
    .map((m: any) => personDetail(m, 'role'))
    .filter(Boolean) as string[]
  if (committee.length) blocks.push({ label: 'Youth Steering Committee', lines: committee })

  const moderator =
    personDetail(session.moderator, 'title') ||
    personDetail(session.committeeModerator, 'role')
  if (moderator) {
    blocks.push({ label: 'Moderator', lines: [moderator] })
  }

  return blocks
}

function collectChunks(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })
}

export async function buildProgrammePdfBuffer(sessions: any[]): Promise<Buffer> {
  const [letterhead, footer] = await Promise.all([
    loadBrandImage('email-letterhead.png'),
    loadBrandImage('email-footer.png'),
  ])

  const pageWidth = 595.28 // A4
  const contentWidth = pageWidth - 96
  const letterheadHeight = Math.round(contentWidth / (1024 / 182))
  const footerHeight = Math.round(contentWidth / (669 / 68))
  const letterheadTop = 24
  const contentTop = letterheadTop + letterheadHeight + 14
  const footerBottomGap = 18
  const bottomMargin = footerHeight + footerBottomGap + 12

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: contentTop, bottom: bottomMargin, left: 48, right: 48 },
    autoFirstPage: true,
    info: {
      Title: 'SARSYC VI Conference Programme',
      Author: 'SARSYC Secretariat',
      Subject: 'Align for Action: Sustaining Progress in Youth Health and Education',
    },
  })

  const done = collectChunks(doc)

  const drawLetterhead = () => {
    try {
      if (letterhead) {
        doc.image(letterhead, 48, letterheadTop, { width: contentWidth })
      } else {
        doc
          .fontSize(11)
          .fillColor(BRAND_BLUE)
          .text(pdfSafe('SARSYC VI Conference Programme'), 48, letterheadTop + 8, {
            width: contentWidth,
            align: 'center',
          })
        doc
          .fontSize(8)
          .fillColor(TEXT_MUTED)
          .text(pdfSafe('5-7 August 2026 | Windhoek, Namibia'), {
            width: contentWidth,
            align: 'center',
          })
      }
    } catch (error) {
      console.warn('PDF letterhead draw failed:', error)
    }
  }

  const drawFooter = () => {
    const footerY = doc.page.height - footerHeight - footerBottomGap
    try {
      if (footer) {
        doc.image(footer, 48, footerY, { width: contentWidth })
      } else {
        doc
          .fontSize(8)
          .fillColor(TEXT_MUTED)
          .text(
            pdfSafe(
              'Organising Secretariat: SAYWHAT  |  Host Partner: University of Namibia  |  www.sarsyc.org',
            ),
            48,
            footerY + 12,
            { width: contentWidth, align: 'center' },
          )
      }
    } catch (error) {
      console.warn('PDF footer draw failed:', error)
    }
  }

  const startNewPage = () => {
    drawFooter()
    doc.addPage()
  }

  drawLetterhead()
  doc.y = contentTop
  doc.on('pageAdded', () => {
    drawLetterhead()
    doc.y = contentTop
  })

  doc
    .fontSize(14)
    .fillColor(BRAND_BLUE)
    .text(pdfSafe('Full Conference Programme'), { width: contentWidth, align: 'center' })
  doc
    .moveDown(0.3)
    .fontSize(10)
    .fillColor(TEXT_MUTED)
    .text(
      pdfSafe(
        'Venue: Namibia Institute of Public Administration and Management (NIPAM), Windhoek | Generated from www.sarsyc.org/programme',
      ),
      { width: contentWidth, align: 'center' },
    )
  doc.moveDown(0.8)

  doc.fontSize(12).fillColor(BRAND_BLUE).text(pdfSafe('Programme Overview'), { width: contentWidth })
  doc.moveDown(0.4)

  for (const day of SESSION_DAY_OPTIONS.filter((d) => d.value !== 'day-4')) {
    const overview = DAY_OVERVIEW[day.value]
    if (!overview) continue
    const dayColor = sessionDayTheme(day.value).pdf
    doc.fontSize(11).fillColor(dayColor).text(pdfSafe(overview.title), { width: contentWidth })
    doc.moveDown(0.2)
    for (const bullet of overview.bullets) {
      doc
        .fontSize(9)
        .fillColor(TEXT_MUTED)
        .text(pdfSafe(`-  ${bullet}`), { width: contentWidth, indent: 8, align: 'justify' })
    }
    doc.moveDown(0.45)
  }

  doc.moveDown(0.3)
  doc
    .strokeColor('#e5e7eb')
    .lineWidth(1)
    .moveTo(48, doc.y)
    .lineTo(pageWidth - 48, doc.y)
    .stroke()
  doc.moveDown(0.8)

  const byDay = SESSION_DAY_OPTIONS.map((day) => ({
    ...day,
    sessions: sessions
      .filter((s) => (s.day || 'day-1') === day.value)
      .sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || ''))),
  })).filter((group) => group.sessions.length > 0)

  if (byDay.length === 0) {
    doc
      .fontSize(10)
      .fillColor(TEXT_MUTED)
      .text(
        pdfSafe(
          'Detailed session listings will appear here as they are published in the conference CMS. Visit www.sarsyc.org/programme/sessions for the latest updates.',
        ),
        { width: contentWidth, align: 'justify' },
      )
  } else {
    doc.fontSize(12).fillColor(BRAND_BLUE).text(pdfSafe('Detailed Session Schedule'), {
      width: contentWidth,
    })
    doc.moveDown(0.5)

    for (const group of byDay) {
      if (doc.y > doc.page.height - bottomMargin - 80) {
        startNewPage()
      }

      const dayColor = sessionDayTheme(group.value).pdf
      const dayY = doc.y
      doc
        .save()
        .rect(48, dayY, 4, 18)
        .fill(dayColor)
        .restore()
      doc
        .fontSize(12)
        .fillColor(dayColor)
        .text(pdfSafe(sessionDayLabel(group.value)), 58, dayY, { width: contentWidth - 10 })
      doc.moveDown(0.45)

      for (const session of group.sessions) {
        const people = peopleBlocks(session)
        const description = slateToPlainText(session.description)
        const needed = 90 + people.length * 28
        if (doc.y > doc.page.height - bottomMargin - needed) {
          startNewPage()
        }

        const start = formatSessionTime(session.startTime)
        const end = formatSessionTime(session.endTime)
        const timeLabel = start && end ? `${start} - ${end}` : start || 'TBA'
        const typeLabel = sessionTypeLabel(session.type)
        const trackLabel = session.track ? sessionTrackLabel(session.track) : ''
        const meta = [typeLabel, trackLabel].filter(Boolean).join('  |  ')

        const cardTop = doc.y
        doc
          .save()
          .roundedRect(48, cardTop, contentWidth, 2, 0)
          .fill(dayColor)
          .restore()
        doc.y = cardTop + 8

        doc
          .fontSize(9)
          .fillColor(dayColor)
          .text(pdfSafe(timeLabel), { continued: Boolean(meta), width: contentWidth })
        if (meta) {
          doc.fillColor(TEXT_MUTED).text(pdfSafe(`   |   ${meta}`))
        } else {
          doc.text('')
        }

        doc
          .fontSize(11)
          .fillColor(TEXT_DARK)
          .text(pdfSafe(session.title || 'Untitled session'), { width: contentWidth })

        if (session.venue) {
          doc
            .fontSize(8)
            .fillColor(TEXT_MUTED)
            .text(pdfSafe(`Venue: ${session.venue}`), { width: contentWidth })
        }

        if (description && session.type !== 'break' && session.type !== 'lunch' && session.type !== 'dinner') {
          const clipped =
            description.length > 320 ? `${description.slice(0, 317).trimEnd()}...` : description
          doc
            .fontSize(8)
            .fillColor(TEXT_MUTED)
            .text(pdfSafe(clipped), { width: contentWidth, align: 'justify' })
        }

        for (const block of people) {
          doc.moveDown(0.15)
          doc.fontSize(8).fillColor(dayColor).text(pdfSafe(block.label.toUpperCase()), {
            width: contentWidth,
          })
          for (const line of block.lines) {
            doc
              .fontSize(8)
              .fillColor(TEXT_DARK)
              .text(pdfSafe(`- ${line}`), { width: contentWidth, align: 'justify' })
          }
        }

        doc.moveDown(0.65)
      }

      doc.moveDown(0.25)
    }
  }

  drawFooter()
  doc.end()
  return done
}
