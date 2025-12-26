import { NextRequest, NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function escapeXml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayloadClient()
    
    const news = await payload.find({
      collection: 'news',
      where: {
        status: { equals: 'published' },
      },
      limit: 50,
      sort: '-publishedDate',
    })

    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://sarsyc.org'
    const baseUrl = siteUrl

    const rssItems = news.docs.map((item: any) => {
      const pubDate = item.publishedDate || item.createdAt
      const date = new Date(pubDate)
      const formattedDate = date.toUTCString()

      // Extract text from rich text description if needed
      let description = item.excerpt || ''
      if (typeof description === 'object') {
        description = JSON.stringify(description)
      }

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${baseUrl}/news/${item.slug}</link>
      <guid isPermaLink="true">${baseUrl}/news/${item.slug}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${formattedDate}</pubDate>
      <category>${escapeXml(item.category || 'News')}</category>
    </item>`
    }).join('\n')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>SARSYC VI News</title>
    <link>${baseUrl}</link>
    <description>Latest news and updates from the Southern African Regional Students and Youth Conference</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/news/rss" rel="self" type="application/rss+xml"/>
    <generator>SARSYC VI Platform</generator>
${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
      },
    })
  } catch (error: any) {
    console.error('RSS generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}


