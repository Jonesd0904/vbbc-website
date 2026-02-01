import { supabase, isSupabaseConfigured } from './supabase'

// Sermon Series Type
export interface SermonSeries {
  id: string
  name: string
  description?: string
  image_url?: string
  scripture_ref?: string
  order_index: number
  created_at: string
}

// Extended Sermon Type with AI fields
export interface SermonWithAI {
  id?: string
  title: string
  speaker: string
  date: string
  series_id?: string
  series?: string
  scripture?: string
  description?: string
  notes?: string  // Sermon notes/outline/key points for AI summary generation
  theme?: string
  key_points?: string[]
  youtube_url?: string
  audio_url?: string
  created_at?: string
}

// Default sermon series from the original VBBC website
export const defaultSermonSeries: Omit<SermonSeries, 'id' | 'created_at'>[] = [
  {
    name: 'Rock Solid',
    description: 'For their rock is not as our Rock... Building your life on the solid foundation of God\'s Word.',
    scripture_ref: 'Deuteronomy 32:31',
    image_url: '/images/series/rock-solid.svg',
    order_index: 1,
  },
  {
    name: 'Galatians',
    description: 'A study through the book of Galatians - Freedom in Christ.',
    scripture_ref: 'Galatians',
    image_url: '/images/series/galatians.svg',
    order_index: 2,
  },
  {
    name: 'Ephesians',
    description: 'Exploring the riches of God\'s grace in the book of Ephesians.',
    scripture_ref: 'Ephesians',
    image_url: '/images/series/ephesians.svg',
    order_index: 3,
  },
  {
    name: 'Faith Building Series',
    description: 'Messages designed to strengthen and build your faith in God.',
    image_url: '/images/series/faith-building.svg',
    order_index: 4,
  },
  {
    name: 'The Truth About Salvation',
    description: 'Understanding the true gospel of Jesus Christ and the gift of salvation.',
    image_url: '/images/series/salvation.svg',
    order_index: 5,
  },
  {
    name: 'First Peter',
    description: 'A verse-by-verse study through 1 Peter - Hope in the midst of trials.',
    scripture_ref: '1 Peter',
    image_url: '/images/series/first-peter.svg',
    order_index: 6,
  },
  {
    name: 'Second Peter',
    description: 'Growing in grace and knowledge through 2 Peter.',
    scripture_ref: '2 Peter',
    image_url: '/images/series/second-peter.svg',
    order_index: 7,
  },
  {
    name: 'Acts of the Apostles',
    description: 'The birth and growth of the early church in the book of Acts.',
    scripture_ref: 'Acts',
    image_url: '/images/series/acts.svg',
    order_index: 8,
  },
  {
    name: 'The Gospel of John',
    description: 'That ye might believe - A journey through the Gospel of John.',
    scripture_ref: 'John',
    image_url: '/images/series/gospel-of-john.svg',
    order_index: 9,
  },
  {
    name: 'End Times Prophecy',
    description: 'Understanding Bible prophecy and the end times.',
    image_url: '/images/series/end-times.svg',
    order_index: 10,
  },
  {
    name: 'How to Share Christ',
    description: 'Equipping believers to share the gospel effectively.',
    image_url: '/images/series/share-christ.svg',
    order_index: 11,
  },
  {
    name: 'The Life of Elijah',
    description: 'Lessons from the life of the prophet Elijah.',
    scripture_ref: '1 Kings 17-19',
    image_url: '/images/series/elijah.svg',
    order_index: 12,
  },
  {
    name: 'Colossians',
    description: 'Christ the preeminent one - A study in Colossians.',
    scripture_ref: 'Colossians',
    image_url: '/images/series/colossians.svg',
    order_index: 13,
  },
  {
    name: 'Philippians',
    description: 'Joy in the Lord - A journey through Philippians.',
    scripture_ref: 'Philippians',
    image_url: '/images/series/philippians.svg',
    order_index: 14,
  },
  {
    name: 'Stand-Alone Messages',
    description: 'Individual messages not part of a specific series.',
    image_url: '/images/series/standalone.svg',
    order_index: 99,
  },
]

// Get all sermon series
export async function getSermonSeries(): Promise<SermonSeries[]> {
  if (!isSupabaseConfigured || !supabase) {
    // Return defaults with generated IDs for local use
    return defaultSermonSeries.map((series, index) => ({
      ...series,
      id: `default-${index + 1}`,
      created_at: new Date().toISOString(),
    }))
  }

  try {
    const { data, error } = await supabase
      .from('sermon_series')
      .select('*')
      .order('order_index')

    if (error || !data || data.length === 0) {
      return defaultSermonSeries.map((series, index) => ({
        ...series,
        id: `default-${index + 1}`,
        created_at: new Date().toISOString(),
      }))
    }

    return data
  } catch {
    return defaultSermonSeries.map((series, index) => ({
      ...series,
      id: `default-${index + 1}`,
      created_at: new Date().toISOString(),
    }))
  }
}

// Create or update sermon series
export async function upsertSermonSeries(series: Partial<SermonSeries>): Promise<SermonSeries | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('sermon_series')
      .upsert(series)
      .select()
      .single()

    if (error) {
      console.error('Error upserting series:', error)
      return null
    }

    return data
  } catch {
    return null
  }
}

// Initialize default series in database
export async function initializeSermonSeries(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }

  try {
    // Check if series already exist
    const { data: existing } = await supabase
      .from('sermon_series')
      .select('id')
      .limit(1)

    if (existing && existing.length > 0) {
      return true // Already initialized
    }

    // Insert default series
    const { error } = await supabase
      .from('sermon_series')
      .insert(defaultSermonSeries.map(series => ({
        ...series,
        created_at: new Date().toISOString(),
      })))

    return !error
  } catch {
    return false
  }
}

// Create a new sermon
export async function createSermon(sermon: SermonWithAI): Promise<SermonWithAI | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .insert({
        title: sermon.title,
        speaker: sermon.speaker,
        date: sermon.date,
        series: sermon.series,
        scripture: sermon.scripture,
        description: sermon.description,
        youtube_url: sermon.youtube_url,
        audio_url: sermon.audio_url,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating sermon:', error)
      return null
    }

    return data
  } catch {
    return null
  }
}

// Bulk create sermons
export async function bulkCreateSermons(sermons: SermonWithAI[]): Promise<{ success: number; failed: number }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: 0, failed: sermons.length }
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .insert(sermons.map(sermon => ({
        title: sermon.title,
        speaker: sermon.speaker,
        date: sermon.date,
        series: sermon.series,
        scripture: sermon.scripture,
        description: sermon.description,
        youtube_url: sermon.youtube_url,
        audio_url: sermon.audio_url,
        created_at: new Date().toISOString(),
      })))
      .select()

    if (error) {
      console.error('Error bulk creating sermons:', error)
      return { success: 0, failed: sermons.length }
    }

    return { success: data?.length || 0, failed: sermons.length - (data?.length || 0) }
  } catch {
    return { success: 0, failed: sermons.length }
  }
}

// Delete a sermon
export async function deleteSermon(id: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id)

    return !error
  } catch {
    return false
  }
}

// Update a sermon
export async function updateSermon(id: string, updates: Partial<SermonWithAI>): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }

  try {
    const { error } = await supabase
      .from('sermons')
      .update(updates)
      .eq('id', id)

    return !error
  } catch {
    return false
  }
}

// Upload series image
export async function uploadSeriesImage(file: File, seriesName: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  try {
    const fileName = `series/${seriesName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${file.name.split('.').pop()}`
    
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

// Upload sermon audio
export async function uploadSermonAudio(file: File, sermonTitle: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    return null
  }

  try {
    const fileName = `sermons/${sermonTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${file.name.split('.').pop()}`
    
    const { error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading audio:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    return publicUrl
  } catch {
    return null
  }
}
