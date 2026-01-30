'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Calendar, User, BookOpen, Play, Headphones, Youtube, FolderOpen, X } from 'lucide-react'
import { supabase, isSupabaseConfigured, Sermon } from '@/lib/supabase'
import { getSermonSeries, SermonSeries } from '@/lib/sermons'

// Sample sermons for when Supabase is not connected
const sampleSermons: Sermon[] = [
  {
    id: '1',
    title: 'Rock Solid',
    speaker: 'Pastor John Seydlitz',
    date: '2024-01-28',
    series: 'Rock Solid',
    scripture: 'Deuteronomy 32:31-33',
    description: 'Discover how faith in Christ gives us victory over sin, death, and the challenges of life.',
    youtube_url: 'https://youtube.com/watch?v=example1',
    created_at: '2024-01-28',
  },
  {
    id: '2',
    title: 'Why Serve the Rock?',
    speaker: 'Pastor John Seydlitz',
    date: '2024-01-21',
    series: 'Rock Solid',
    scripture: 'Deuteronomy 31 & 32',
    description: 'Learn what it means to walk in the Spirit and live a life pleasing to God.',
    youtube_url: 'https://youtube.com/watch?v=example2',
    created_at: '2024-01-21',
  },
  {
    id: '3',
    title: 'A Rock Solid Life Has the Right Foundation',
    speaker: 'Dr. Chris Shepler',
    date: '2024-01-14',
    series: 'Rock Solid',
    scripture: 'Matthew 7:24-27',
    description: "Building your life on the solid foundation of God's Word.",
    youtube_url: 'https://youtube.com/watch?v=example3',
    created_at: '2024-01-14',
  },
  {
    id: '4',
    title: 'The Birth of Jesus',
    speaker: 'Pastor John Seydlitz',
    date: '2023-12-24',
    series: 'Stand-Alone Messages',
    scripture: 'Luke 2:1-7',
    description: "The story of our Savior's birth.",
    youtube_url: 'https://youtube.com/watch?v=example4',
    created_at: '2023-12-24',
  },
]

function extractYouTubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
}

// Series Card Component
function SeriesCard({ 
  series, 
  isSelected, 
  onClick,
  sermonCount 
}: { 
  series: SermonSeries
  isSelected: boolean
  onClick: () => void
  sermonCount: number
}) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl transition-all ${
        isSelected 
          ? 'ring-2 ring-gold ring-offset-2 shadow-lg' 
          : 'hover:shadow-md hover:scale-[1.02]'
      }`}
    >
      <div className="aspect-video bg-navy relative">
        {series.image_url ? (
          <Image
            src={series.image_url}
            alt={series.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-dark">
            <FolderOpen className="text-gold" size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-cinzel text-sm font-semibold line-clamp-1">{series.name}</h3>
          {series.scripture_ref && (
            <p className="text-gold text-xs">{series.scripture_ref}</p>
          )}
          <p className="text-gray-300 text-xs mt-1">{sermonCount} sermon{sermonCount !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </button>
  )
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>(sampleSermons)
  const [series, setSeries] = useState<SermonSeries[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('')
  const [speakers, setSpeakers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [showSeriesGrid, setShowSeriesGrid] = useState(true)

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
    async function fetchData() {
      // Fetch sermon series
      const seriesData = await getSermonSeries()
      setSeries(seriesData)

      // Fetch sermons
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

    fetchData()
  }, [])

  // Get sermon count per series
  const getSermonCountForSeries = (seriesName: string) => {
    return sermons.filter(s => s.series === seriesName).length
  }

  // Filter series to only show those with sermons
  const seriesWithSermons = series.filter(s => getSermonCountForSeries(s.name) > 0)

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch = searchQuery === '' || 
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sermon.series && sermon.series.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sermon.scripture && sermon.scripture.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesSpeaker = selectedSpeaker === '' || sermon.speaker === selectedSpeaker
    const matchesSeries = selectedSeries === '' || sermon.series === selectedSeries

    return matchesSearch && matchesSpeaker && matchesSeries
  })

  const handleSeriesClick = (seriesName: string) => {
    if (selectedSeries === seriesName) {
      setSelectedSeries('')
    } else {
      setSelectedSeries(seriesName)
      setShowSeriesGrid(false)
    }
  }

  const clearSeriesFilter = () => {
    setSelectedSeries('')
    setShowSeriesGrid(true)
  }

  // Get selected series info
  const selectedSeriesInfo = series.find(s => s.name === selectedSeries)

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Listen & Learn</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Sermon Archive</h1>
        </div>
      </section>

      {/* Series Grid */}
      {showSeriesGrid && seriesWithSermons.length > 0 && (
        <section className="py-12 bg-cream">
          <div className="container-wide">
            <h2 className="font-cinzel text-2xl text-navy mb-6 text-center">Browse by Series</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {seriesWithSermons.map((s) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  isSelected={selectedSeries === s.name}
                  onClick={() => handleSeriesClick(s.name)}
                  sermonCount={getSermonCountForSeries(s.name)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Selected Series Header */}
      {selectedSeries && selectedSeriesInfo && (
        <section className="bg-navy text-white py-8">
          <div className="container-wide">
            <div className="flex items-center gap-6">
              {selectedSeriesInfo.image_url && (
                <div className="w-32 h-20 rounded-lg overflow-hidden relative flex-shrink-0 hidden md:block">
                  <Image
                    src={selectedSeriesInfo.image_url}
                    alt={selectedSeriesInfo.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-gold text-sm mb-1">Sermon Series</p>
                <h2 className="font-cinzel text-2xl">{selectedSeriesInfo.name}</h2>
                {selectedSeriesInfo.scripture_ref && (
                  <p className="text-gray-300 text-sm mt-1">{selectedSeriesInfo.scripture_ref}</p>
                )}
                {selectedSeriesInfo.description && (
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{selectedSeriesInfo.description}</p>
                )}
              </div>
              <button
                onClick={clearSeriesFilter}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X size={18} />
                Clear Filter
              </button>
            </div>
          </div>
        </section>
      )}

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

            {/* Series Filter (dropdown for mobile) */}
            <select
              value={selectedSeries}
              onChange={(e) => {
                setSelectedSeries(e.target.value)
                setShowSeriesGrid(e.target.value === '')
              }}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent bg-white"
            >
              <option value="">All Series</option>
              {series.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            {/* Show All Button */}
            {!showSeriesGrid && (
              <button
                onClick={() => {
                  setShowSeriesGrid(true)
                  setSelectedSeries('')
                }}
                className="px-4 py-3 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
              >
                Show All Series
              </button>
            )}
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
                        <button 
                          onClick={() => handleSeriesClick(sermon.series!)}
                          className="text-gold text-sm mb-2 hover:underline"
                        >
                          Series: {sermon.series}
                        </button>
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
