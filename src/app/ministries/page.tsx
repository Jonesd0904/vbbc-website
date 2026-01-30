'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, BookOpen, Music, Globe, Heart, LucideIcon } from 'lucide-react'
import { getMinistries, defaultMinistries, Ministry } from '@/lib/content'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  users: Users,
  book: BookOpen,
  music: Music,
  globe: Globe,
  heart: Heart,
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
              return (
                <div 
                  key={ministry.id || index} 
                  className={`flex flex-col md:flex-row items-start gap-6 p-8 rounded-lg fade-in ${
                    index % 2 === 0 ? 'bg-white' : 'bg-cream-dark'
                  }`}
                >
                  <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="text-gold" size={36} />
                  </div>
                  <div>
                    <h2 className="font-cinzel text-2xl text-navy mb-3">{ministry.title}</h2>
                    {renderDescription(ministry.description)}
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
