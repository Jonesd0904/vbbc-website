import { NextResponse } from 'next/server'
import { getAllContent } from '@/lib/content'

export async function GET() {
  try {
    const content = await getAllContent()
    
    return NextResponse.json({
      success: true,
      givingData: {
        giving_enabled: content.giving_enabled,
        tithely_form_id: content.tithely_form_id,
        tithely_church_id: content.tithely_church_id,
        giving_message: content.giving_message
      },
      allContent: content
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
