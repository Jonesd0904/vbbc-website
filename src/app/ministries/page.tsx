'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, BookOpen, Music, Globe, Heart, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMinistries, defaultMinistries, Ministry } from '@/lib/content'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  book: BookOpen,
  music: Music,
  globe: Globe,
  heart: Heart,
}

// Carousel Component
function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) return null

  return (
    <div className="relative w-full h-64 md:h-80 bg-gray-200 rounded-lg overflow-hidden group">
      {/* Main Image */}
      <Image
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        fill
        className="object-cover"
      />

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MinistriesPage() {
  const [ministries, setMinistries] = useState<Ministry[]>(defaultMinistries)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMinistries = async () => {
      const data = await getMinistries()
      setMinistries(data)
      setIsLoading(false)
    }
    loadMinistries()
  }, [])

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
  }, [ministries, isLoading])

  // Function to render description - handles both plain text and HTML
  const renderDescription = (description: string) => {
    // Check if it's HTML content (contains HTML tags)
    if (description.includes('<') && description.includes('>')) {
      return (
        <div 
          className="prose prose-gray max-w-none text-gray-600"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )
    }
    
    // Plain text
    return <p className="text-gray-600 leading-relaxed">{description}</p>
  }

  // Get icon component
  const getIcon = (iconName: string): LucideIcon => {
    return iconMap[iconName.toLowerCase()] || Users
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Get Involved</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Our Ministries</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <p className="text-gray-600 text-lg leading-relaxed">
            At Victory Bible Baptist Church, we believe that every member has a place to serve and grow. 
            Our ministries are designed to help you connect with God, grow in your faith, and serve others.
          </p>
        </div>
      </section>

      {/* Ministries List */}
      <section className="py-8 bg-cream">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col md:flex-row items-start gap-6 p-8 rounded-lg bg-white animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            ministries.map((ministry, index) => {
              const IconComponent = getIcon(ministry.icon)
              const hasCarousel = ministry.carousel_enabled && ministry.carousel_images && ministry.carousel_images.length > 0
              
              return (
                <div 
                  key={ministry.id || index} 
                  className={`rounded-lg fade-in overflow-hidden ${
                    index % 2 === 0 ? 'bg-white' : 'bg-cream-dark'
                  }`}
                >
                  {/* Carousel or Main Image */}
                  {hasCarousel ? (
                    <ImageCarousel images={ministry.carousel_images!} />
                  ) : ministry.image_url ? (
                    <div className="w-full h-64 md:h-80 relative">
                      <Image
                        src={ministry.image_url}
                        alt={ministry.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  {/* Content */}
                  <div className="flex flex-col md:flex-row items-start gap-6 p-8">
                    {/* Icon (only show if no image) */}
                    {!ministry.image_url && (
                      <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="text-gold" size={36} />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h2 className="font-cinzel text-2xl text-navy mb-3">{ministry.title}</h2>
                      {renderDescription(ministry.description)}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Want to get involved? We'd love to help you find your place to serve.</p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </section>

      {/* Styles for rich text content */}
      <style jsx global>{`
        .prose a {
          color: #d4af37;
          text-decoration: underline;
        }
        .prose a:hover {
          color: #b8942e;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .prose ul, .prose ol {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .prose li {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </>
  )
}
