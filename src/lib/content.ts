import { supabase, isSupabaseConfigured } from './supabase'

// Types for site content
export interface SiteContent {
  id: string
  key: string
  value: string
  category: string
  updated_at: string
}

export interface StaffMember {
  id: string
  name: string
  role: string
  bio: string
  image_url?: string
  order_index: number
}

export interface Ministry {
  id: string
  title: string
  description: string
  icon: string
  order_index: number
}

export interface ServiceTime {
  id: string
  day: string
  label: string
  time: string
  order_index: number
}

// Default content (used when Supabase is not connected)
export const defaultContent: Record<string, string> = {
  // Church Info
  'church_name': 'Victory Bible Baptist Church',
  'church_tagline': 'Living by Faith. Enjoying Victory in Christ.',
  'church_address': '10245 Broad River Rd.',
  'church_city': 'Irmo, SC 29063',
  'church_phone': '(803) 781-6970',
  
  // Hero Section
  'hero_welcome': 'Welcome to',
  'hero_verse': 'But thanks be to God, which giveth us the victory through our Lord Jesus Christ.',
  'hero_verse_ref': '1 Corinthians 15:57',
  
  // Scripture Section
  'scripture_verse': 'For their rock is not as our Rock, even our enemies themselves being judges.',
  'scripture_ref': 'Deuteronomy 32:31',
  
  // About Section
  'about_title': 'A Place to Call Home',
  'about_text_1': 'We are an independent Baptist church in the Irmo, Dutch Fork, and Ballentine area centered on the clear teaching and preaching of the truths of God\'s holy Word.',
  'about_text_2': 'Our purpose is to reach people with the Good News of Jesus Christ and encourage and build up believers to carry out the Great Commission. The love of Christ and truth of God\'s Word has made us a family-oriented, caring, and sharing church.',
  
  // Social Links
  'facebook_url': 'https://facebook.com',
  'youtube_url': 'https://youtube.com',
  
  // Livestream
  'facebook_live_url': '',
  'youtube_channel_id': '',
  
  // Images
  'image_logo': '/images/logo.png',
  'image_church_building': '/images/church-building.jpg',
  'image_rock_solid': '/images/rock-solid-bg.jpg',
}

export const defaultServiceTimes: ServiceTime[] = [
  { id: '1', day: 'Sunday', label: 'Sunday School', time: '9:15 AM', order_index: 1 },
  { id: '2', day: 'Sunday', label: 'Morning Worship', time: '10:30 AM', order_index: 2 },
  { id: '3', day: 'Sunday', label: 'Evening Worship', time: '6:00 PM', order_index: 3 },
  { id: '4', day: 'Wednesday', label: 'Wednesday Night', time: '7:15 PM', order_index: 4 },
]

export const defaultStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Pastor John Seydlitz',
    role: 'Senior Pastor',
    bio: 'Pastor John Seydlitz was saved at the age of 8 in the basement of his church after a Sunday evening service. The Lord directed him to Pensacola Christian College where he graduated with a degree in accounting in 1994.\n\nAfter college, the Lord opened the door for him to serve in his home church in the Chicago area. He then returned to Pensacola Christian College to earn a Master\'s degree in Bible Exposition.\n\nUpon graduation in 2000, the Lord brought him to Victory Bible Baptist Church as our assistant. In May 2017, Pastor Seydlitz became the Senior Pastor of our church. He has served at our church faithfully for many years with his wife, Rachel. The Seydlitz family has 3 children.',
    image_url: '',
    order_index: 1,
  },
  {
    id: '2',
    name: 'Dr. Chris Shepler',
    role: 'Pastor Emeritus & Founding Pastor',
    bio: 'Dr. Chris Shepler was saved at the age of 16, after hearing a clear gospel presentation at a youth meeting. He accepted Christ at home in his own bedroom as he thought on John 3:16. God led him to Florida Bible College, where he received his Bachelor\'s degree.\n\nHe was the founding pastor of our church in 1979, and has been in full-time ministry for over 40 years. In 2002, he earned his Master\'s of Ministry degree from Pensacola Christian College. In 2005, he was awarded an Honorary Doctorate from Pensacola Christian College.\n\nHe married his wife Peggy in 1973, and they have 4 grown children together.',
    image_url: '',
    order_index: 2,
  },
]

export const defaultMinistries: Ministry[] = [
  { id: '1', title: "Children's Ministry", description: 'Building a foundation of faith for the next generation through Bible teaching and fun activities.', icon: 'users', order_index: 1 },
  { id: '2', title: 'Youth Ministry', description: 'Equipping teens to stand firm in their faith and become leaders for Christ.', icon: 'users', order_index: 2 },
  { id: '3', title: 'Adult Bible Study', description: 'Deep dives into God\'s Word for spiritual growth and practical application.', icon: 'book', order_index: 3 },
  { id: '4', title: 'Music Ministry', description: 'Glorifying God through traditional hymns and Christ-honoring music.', icon: 'music', order_index: 4 },
  { id: '5', title: 'Outreach & Missions', description: 'Reaching the world with the Gospel of Jesus Christ.', icon: 'globe', order_index: 5 },
]

// Image upload function
export async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured - cannot upload images')
    return null
  }
  
  try {
    // Remove old file if exists
    await supabase.storage.from('images').remove([path])
    
    // Upload new file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('Error uploading image:', error)
      return null
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(path)
    
    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}

// Fetch functions
export async function getContent(key: string): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultContent[key] || ''
  }
  
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error || !data) {
      return defaultContent[key] || ''
    }
    return data.value
  } catch {
    return defaultContent[key] || ''
  }
}

export async function getAllContent(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultContent
  }
  
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
    
    if (error || !data || data.length === 0) {
      return defaultContent
    }
    
    const content: Record<string, string> = { ...defaultContent }
    data.forEach((item: { key: string; value: string }) => {
      content[item.key] = item.value
    })
    return content
  } catch {
    return defaultContent
  }
}

export async function updateContent(key: string, value: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('Supabase not configured - changes will not persist')
    return false
  }
  
  try {
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    
    return !error
  } catch {
    return false
  }
}

export async function getServiceTimes(): Promise<ServiceTime[]> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultServiceTimes
  }
  
  try {
    const { data, error } = await supabase
      .from('service_times')
      .select('*')
      .order('order_index')
    
    if (error || !data || data.length === 0) {
      return defaultServiceTimes
    }
    return data
  } catch {
    return defaultServiceTimes
  }
}

export async function updateServiceTime(serviceTime: ServiceTime): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from('service_times')
      .upsert(serviceTime)
    
    return !error
  } catch {
    return false
  }
}

export async function getStaff(): Promise<StaffMember[]> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultStaff
  }
  
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('order_index')
    
    if (error || !data || data.length === 0) {
      return defaultStaff
    }
    return data
  } catch {
    return defaultStaff
  }
}

export async function updateStaffMember(staff: StaffMember): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from('staff')
      .upsert(staff)
    
    return !error
  } catch {
    return false
  }
}

export async function getMinistries(): Promise<Ministry[]> {
  if (!isSupabaseConfigured || !supabase) {
    return defaultMinistries
  }
  
  try {
    const { data, error } = await supabase
      .from('ministries')
      .select('*')
      .order('order_index')
    
    if (error || !data || data.length === 0) {
      return defaultMinistries
    }
    return data
  } catch {
    return defaultMinistries
  }
}

export async function updateMinistry(ministry: Ministry): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    return false
  }
  
  try {
    const { error } = await supabase
      .from('ministries')
      .upsert(ministry)
    
    return !error
  } catch {
    return false
  }
}
