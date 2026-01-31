import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Fetch all staff members
    const { data: allStaff, error: fetchError } = await supabase
      .from('staff')
      .select('*')
      .order('order_index')

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Group by name to find duplicates
    const staffByName: Record<string, typeof allStaff> = {}
    for (const person of allStaff || []) {
      const name = person.name || 'Unknown'
      if (!staffByName[name]) {
        staffByName[name] = []
      }
      staffByName[name].push(person)
    }

    // Find IDs to delete (keep first one of each name, delete the rest)
    const idsToDelete: string[] = []
    const kept: string[] = []

    for (const [name, people] of Object.entries(staffByName)) {
      if (people.length > 1) {
        // Keep the first one (usually the one with lowest order_index)
        kept.push(`${name} (ID: ${people[0].id})`)
        // Mark the rest for deletion
        for (let i = 1; i < people.length; i++) {
          idsToDelete.push(people[i].id)
        }
      } else {
        kept.push(`${name} (ID: ${people[0].id})`)
      }
    }

    // Delete duplicates
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('staff')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      message: 'Cleanup complete',
      totalBefore: allStaff?.length || 0,
      duplicatesRemoved: idsToDelete.length,
      totalAfter: (allStaff?.length || 0) - idsToDelete.length,
      kept,
      deletedIds: idsToDelete
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
