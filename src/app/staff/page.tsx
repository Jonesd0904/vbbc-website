'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { getStaff, defaultStaff, StaffMember } from '@/lib/content'

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(defaultStaff)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStaff = async () => {
      const staffData = await getStaff()
      setStaff(staffData)
      setIsLoading(false)
    }
    loadStaff()
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
  }, [staff, isLoading])

  // Function to render bio - handles both plain text and HTML
  const renderBio = (bio: string) => {
    // Check if it's HTML content (contains HTML tags)
    if (bio.includes('<') && bio.includes('>')) {
      return (
        <div 
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: bio }}
        />
      )
    }
    
    // Plain text - split by newlines and render paragraphs
    return (
      <div className="space-y-4 text-gray-600 leading-relaxed">
        {bio.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Meet Our Team</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Church Staff</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <p className="text-gray-600 text-lg leading-relaxed">
            Our church is blessed with godly leadership committed to serving the Lord and His people. 
            Get to know the team that shepherds our congregation.
          </p>
        </div>
      </section>

      {/* Staff Cards */}
      <section className="py-8 bg-cream">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-10">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-200 p-8 flex items-center justify-center min-h-[200px]" />
                    <div className="md:w-2/3 p-8 space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="space-y-2 pt-4">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            staff.map((person, index) => (
              <div key={person.id || index} className="bg-white rounded-xl shadow-lg overflow-hidden fade-in">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 bg-gradient-to-br from-navy to-navy-light p-8 flex items-center justify-center">
                    {person.image_url ? (
                      <div className="w-40 h-40 rounded-full overflow-hidden relative">
                        <Image
                          src={person.image_url}
                          alt={person.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center">
                        <User className="text-gold" size={64} />
                      </div>
                    )}
                  </div>
                  <div className="md:w-2/3 p-8">
                    <h2 className="font-cinzel text-2xl md:text-3xl text-navy mb-2">{person.name}</h2>
                    <p className="font-lora italic text-gold text-lg mb-6">{person.role}</p>
                    {renderBio(person.bio)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy mt-8">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">We'd love to meet you! Come visit us this Sunday.</p>
          <Link href="/contact" className="btn-primary inline-block">
            Plan Your Visit
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
