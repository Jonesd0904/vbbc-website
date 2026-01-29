'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Calendar, User, BookOpen, Play, Headphones, Youtube } from 'lucide-react'
import { supabase, isSupabaseConfigured, Sermon } from '@/lib/supabase'

// Sample sermons for when Supabase is not connected
const sampleSermons: Sermon[] = [
  {
    id: '1',
    title: 'The Victory of Faith',
    speaker: 'Pastor John Seydlitz',
    date: '2024-01-28',
    series: 'Living Victoriously',
    scripture: '1 Corinthians 15:57',
    description: 'Discover how faith in Christ gives us victory over sin, death, and the challenges of life.',
    youtube_url: 'https://youtube.com/watch?v=example1',
    created_at: '2024-01-28',
  },
  {
    id: '2',
    title: 'Walking in the Spirit',
    speaker: 'Pastor John Seydlitz',
    date: '2024-01-21',
    series: 'Living Victoriously',
    scripture: 'Galatians 5:16-25',
    description: 'Learn what it means to walk in the Spirit and live a life pleasing to God.',
    youtube_url: 'https://youtube.com/watch?v=example2',
    created_at: '2024-01-21',
  },
  {
    id: '3',
    title: 'The Faithfulness of God',
    speaker: 'Dr. Chris Shepler',
    date: '2024-01-14',
    series: 'Foundations of Faith',
    scripture: 'Lamentations 3:22-23',
    description: "God's mercies are new every morning. Great is His faithfulness!",
    youtube_url: 'https://youtube.com/watch?v=example3',
    created_at: '2024-01-14',
  },
]

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>(sampleSermons)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState('')
  const [speakers, setSpeakers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sermons])

  useEffect(() => {
    async function fetchSermons() {
      if (!isSupabaseConfigured || !supabase) {
        console.log('Using sample sermons (Supabase not configured)')
        setSermons(sampleSermons)
        setSpeakers(['Pastor John Seydlitz', 'Dr. Chris Shepler'])
        setIsSupabaseConnected(false)
        setLoading(false)
        return
      }
      
      try {
        const { data, error } = await supabase.from('sermons').select('*').order('date', { ascending: false })
        
        if (error) {
          console.log('Using sample sermons (Supabase error)')
          setSermons(sampleSermons)
          setSpeakers(['Pastor John Seydlitz', 'Dr. Chris Shepler'])
          setIsSupabaseConnected(false)
        } else if (data && data.length > 0) {
          setSermons(data)
          const uniqueSpeakers = [...new Set(data.map((s: Sermon) => s.speaker))]
          setSpeakers(uniqueSpeakers.filter(Boolean) as string[])
          setIsSupabaseConnected(true)
        } else {
          setSermons(sampleSermons)
          setSpeakers(['Pastor John Seydlitz', 'Dr. Chris Shepler'])
          setIsSupabaseConnected(false)
        }
      } catch (err) {
        console.log('Using sample sermons')
        setSermons(sampleSermons)
        setSpeakers(['Pastor John Seydlitz', 'Dr. Chris Shepler'])
        setIsSupabaseConnected(false)
      }
      setLoading(false)
    }

    fetchSermons()
  }, [])

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = searchQuery === '' || 
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sermon.series && sermon.series.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sermon.scripture && sermon.scripture.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSpeaker = selectedSpeaker === '' || sermon.speaker === selectedSpeaker

    return matchesSearch && matchesSpeaker
  })

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Listen & Learn</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Sermon Archive</h1>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-8 bg-cream border-b border-gray-200">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search sermons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            {/* Speaker Filter */}
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent bg-white"
            >
              <option value="">All Speakers</option>
              {speakers.map((speaker) => (
                <option key={speaker} value={speaker}>{speaker}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Sermons List */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading sermons...</p>
            </div>
          ) : filteredSermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No sermons found matching your search.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSermons.map((sermon) => (
                <div key={sermon.id} className="bg-white rounded-xl shadow-sm overflow-hidden fade-in">
                  <div className="flex flex-col lg:flex-row">
                    {/* Thumbnail */}
                    {sermon.youtube_url && (
                      <div className="lg:w-80 flex-shrink-0">
                        <div className="aspect-video bg-navy relative group">
                          {extractYouTubeId(sermon.youtube_url) ? (
                            <img
                              src={`https://i.ytimg.com/vi/${extractYouTubeId(sermon.youtube_url)}/mqdefault.jpg`}
                              alt={sermon.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Youtube className="text-gold" size={48} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="text-white" size={48} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(sermon.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {sermon.speaker}
                        </span>
                        {sermon.scripture && (
                          <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {sermon.scripture}
                          </span>
                        )}
                      </div>

                      <h3 className="font-cinzel text-xl text-navy mb-2">{sermon.title}</h3>
                      
                      {sermon.series && (
                        <p className="text-gold text-sm mb-2">Series: {sermon.series}</p>
                      )}

                      {sermon.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sermon.description}</p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {sermon.youtube_url && (
                          <a
                            href={sermon.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-navy text-white px-4 py-2 rounded text-sm hover:bg-navy-light transition-colors"
                          >
                            <Play size={16} />
                            Watch
                          </a>
                        )}
                        {sermon.audio_url && (
                          <a
                            href={sermon.audio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded text-sm hover:bg-gold-light transition-colors"
                          >
                            <Headphones size={16} />
                            Listen
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isSupabaseConnected && (
            <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-blue-700 text-sm">
                <strong>Note:</strong> These are sample sermons. Connect Supabase to manage your sermon database.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Want to experience these messages in person?</p>
          <Link href="/contact" className="btn-primary inline-block">
            Plan Your Visit
          </Link>
        </div>
      </section>
    </>
  )
}
