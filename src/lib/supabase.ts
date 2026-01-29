import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if credentials are provided
export const supabase: SupabaseClient | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export const isSupabaseConfigured = !!supabase

// Types for the sermon database
export interface Sermon {
  id: string
  title: string
  speaker: string
  date: string
  series?: string
  scripture?: string
  description?: string
  youtube_url?: string
  audio_url?: string
  created_at: string
}

// Helper functions
export async function getSermons(limit?: number) {
  if (!supabase) return []
  
  let query = supabase
    .from('sermons')
    .select('*')
    .order('date', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching sermons:', error)
    return []
  }
  
  return data as Sermon[]
}

export async function getSermonById(id: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching sermon:', error)
    return null
  }
  
  return data as Sermon
}

export async function searchSermons(query: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .or(`title.ilike.%${query}%,speaker.ilike.%${query}%,series.ilike.%${query}%,scripture.ilike.%${query}%`)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error searching sermons:', error)
    return []
  }
  
  return data as Sermon[]
}

export async function getSermonsBySpeaker(speaker: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('speaker', speaker)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching sermons by speaker:', error)
    return []
  }
  
  return data as Sermon[]
}

export async function getSermonsBySeries(series: string) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sermons')
    .select('*')
    .eq('series', series)
    .order('date', { ascending: false })
  
  if (error) {
    console.error('Error fetching sermons by series:', error)
    return []
  }
  
  return data as Sermon[]
}

export async function getSpeakers() {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sermons')
    .select('speaker')
  
  if (error) {
    console.error('Error fetching speakers:', error)
    return []
  }
  
  // Get unique speakers
  const speakers = [...new Set(data.map(s => s.speaker))]
  return speakers.filter(Boolean)
}

export async function getSeries() {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('sermons')
    .select('series')
  
  if (error) {
    console.error('Error fetching series:', error)
    return []
  }
  
  // Get unique series
  const series = [...new Set(data.map(s => s.series))]
  return series.filter(Boolean)
}
