import { supabase, isSupabaseConfigured } from './supabase'

export interface Event {
  id: string
  title: string
  description: string
  date: string
  end_date?: string
  image_url: string
  category: 'service' | 'conference' | 'ministry' | 'community' | 'other'
  location?: string
  registration_url?: string
  cta_text?: string
  color?: string
  is_active: boolean
  is_featured: boolean
  priority: number
  created_at: string
}

// Get featured event for spotlight
export async function getFeaturedEvent(): Promise<Event | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .gte('date', now)
      .order('priority', { ascending: true })
      .order('date', { ascending: true})
      .limit(1)
      .maybeSingle()

    if (error) {
      return null
    }

    return data
  } catch {
    return null
  }
}

// Get all events (for admin)
export async function getAllEvents(): Promise<Event[]> {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching all events:', error)
      return []
    }

    return data || []
  } catch {
    return []
  }
}

// Create new event
export async function createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return data
  } catch {
    return null
  }
}

// Update event
export async function updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return false
  }

  try {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating event:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception updating event:', err)
    return false
  }
}

// Delete event
export async function deleteEvent(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured')
    return false
  }

  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting event:', error)
      alert(`Failed to delete event: ${error.message}`)
      return false
    }

    return true
  } catch (err) {
    console.error('Exception deleting event:', err)
    return false
  }
}

// Upload event image
export async function uploadEventImage(file: File, eventTitle: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  try {
    const fileName = `events/${eventTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${file.name.split('.').pop()}`
    
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return publicUrl
  } catch {
    return null
  }
}

// Toggle event active status
export async function toggleEventActive(id: string, isActive: boolean): Promise<boolean> {
  return updateEvent(id, { is_active: isActive })
}

// Toggle event featured status
export async function toggleEventFeatured(id: string, isFeatured: boolean): Promise<boolean> {
  return updateEvent(id, { is_featured: isFeatured })
}
