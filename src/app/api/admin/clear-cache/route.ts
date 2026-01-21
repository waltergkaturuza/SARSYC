import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Revalidate all speaker-related pages
    revalidatePath('/', 'layout') // Revalidate entire site
    revalidatePath('/programme/speakers')
    revalidatePath('/programme/speakers/[slug]', 'page')
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared for speaker pages',
      revalidated: [
        '/',
        '/programme/speakers',
        '/programme/speakers/[slug]',
      ],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to clear cache' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
