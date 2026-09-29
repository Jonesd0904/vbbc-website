import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only access to contact form messages.
// Uses the Supabase SERVICE ROLE key on the server (never sent to the browser),
// because the contact_messages table cannot be read with the public key.
// Required env var (Vercel + .env.local): SUPABASE_SERVICE_ROLE_KEY
// Optional env var: ADMIN_PASSWORD (defaults to the dashboard password)
export const dynamic = 'force-dynamic'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vbbc2024'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

function checkAuth(request: Request) {
  return request.headers.get('x-admin-password') === ADMIN_PASSWORD
}

function fail(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function GET(request: Request) {
  if (!checkAuth(request)) return fail('unauthorized', 401)
  const db = getAdminClient()
  if (!db) return fail('SUPABASE_SERVICE_ROLE_KEY is not set on the server', 500)

  const { data, error } = await db
    .from('contact_messages')
    .select('id, created_at, name, email, phone, message, read')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true, messages: data })
}

export async function PATCH(request: Request) {
  if (!checkAuth(request)) return fail('unauthorized', 401)
  const db = getAdminClient()
  if (!db) return fail('SUPABASE_SERVICE_ROLE_KEY is not set on the server', 500)

  const body = await request.json().catch(() => null)
  if (!body?.id || typeof body.read !== 'boolean') return fail('id and read are required', 400)
  const { error } = await db.from('contact_messages').update({ read: body.read }).eq('id', body.id)
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!checkAuth(request)) return fail('unauthorized', 401)
  const db = getAdminClient()
  if (!db) return fail('SUPABASE_SERVICE_ROLE_KEY is not set on the server', 500)

  const body = await request.json().catch(() => null)
  if (!body?.id) return fail('id is required', 400)
  const { error } = await db.from('contact_messages').delete().eq('id', body.id)
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true })
}
