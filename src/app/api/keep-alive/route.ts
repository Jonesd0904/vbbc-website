import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Daily keep-alive, triggered by Vercel Cron (see vercel.json).
// Supabase pauses free projects after ~7 days of inactivity. A plain read
// has not reliably prevented that, so this performs a real database WRITE
// via the keep_alive_ping() function (see supabase/keep-alive.sql).
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  // Optional protection: if CRON_SECRET is set in Vercel, only Vercel Cron may call this.
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Supabase not configured' }, { status: 500 })
  }

  const { data, error } = await supabase.rpc('keep_alive_ping')
  if (error) {
    console.error('[keep-alive] ping failed:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, pinged_at: data })
}
