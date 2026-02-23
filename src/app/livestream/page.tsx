'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, BookOpen, Facebook, Youtube, Instagram, Radio, CalendarDays } from 'lucide-react'

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=100064556957430'
const FACEBOOK_PAGE_ID = '100064556957430'

function FacebookPlaceholder({ onLoad }: { onLoad: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-12 bg-gradient-to-br from-navy-dark via-navy to-navy-light">
      {/* Pulsing radio icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
        <div className="relative bg-gold/10 border border-gold/40 rounded-full p-5">
          <Radio className="text-gold" size={40} />
        </div>
      </div>

      <h3 className="font-cinzel text-white text-2xl mb-2">Join Us Live</h3>
      <p className="font-lora text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">
        We stream all our regular services. Click below to load the live stream, or visit us on Facebook directly.
      </p>

      {/* Service time pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          'Sun · 10:30 AM',
          'Sun · 6:00 PM',
          'Wed · 7:15 PM',
        ].map((label) => (
          <div key={label} className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
            <CalendarDays size={12} className="text-gold" />
            <span className="font-cinzel text-white text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Primary: load embed on page */}
        <button
          onClick={onLoad}
          className="flex items-center gap-2 bg-gold text-white px-6 py-3 rounded-lg hover:bg-gold/80 transition-colors font-cinzel text-sm"
        >
          <Radio size={16} />
          Load Live Stream
        </button>
        {/* Fallback: open Facebook directly */}
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-cinzel text-sm"
        >
          <Facebook size={16} />
          Open on Facebook
        </a>
      </div>
    </div>
  )
}

export default function LivestreamPage() {
  const [activeTab, setActiveTab] = useState<'facebook' | 'youtube'>('facebook')
  const [streamLoaded, setStreamLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.15 }
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Watch Online</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Livestream</h1>
        </div>
      </section>

      {/* Livestream Content */}
      <section className="section-padding bg-cream">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8 fade-in">
            <p className="text-gray-600 text-lg leading-relaxed">
              Can't join us in person? Watch our services live from anywhere in the world!
              We stream all of our regular services so you can worship with us no matter where you are.
            </p>
          </div>

          {/* Platform Tabs */}
          <div className="flex justify-center gap-4 mb-8 fade-in">
            <button
              onClick={() => setActiveTab('facebook')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-cinzel transition-colors ${
                activeTab === 'facebook' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              <Facebook size={20} />
              Facebook Live
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-cinzel transition-colors ${
                activeTab === 'youtube' ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              <Youtube size={20} />
              YouTube
            </button>
          </div>

          {/* Video Embed */}
          <div className="fade-in">
            {activeTab === 'facebook' ? (
              <div>
                {/* When stream not loaded: natural height so nothing clips on mobile */}
                {!streamLoaded ? (
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    <FacebookPlaceholder onLoad={() => setStreamLoaded(true)} />
                  </div>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src={`https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D${FACEBOOK_PAGE_ID}&show_text=false&width=720&height=405&appId`}
                      width="100%"
                      height="100%"
                      className="absolute inset-0"
                      style={{ border: 'none', overflow: 'hidden' }}
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    />
                  </div>
                )}
                {/* Always-visible fallback link once stream is loaded */}
                {streamLoaded && (
                  <div className="mt-3 text-center">
                    <p className="text-gray-400 text-xs">
                      Stream not showing?{' '}
                      <a
                        href={FACEBOOK_PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1877f2] hover:underline"
                      >
                        Watch directly on Facebook →
                      </a>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* YouTube placeholder */}
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-navy-dark via-navy to-navy-light">
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
                      <div className="relative bg-gold/10 border border-gold/40 rounded-full p-5">
                        <Youtube className="text-gold" size={40} />
                      </div>
                    </div>
                    <h3 className="font-cinzel text-white text-2xl mb-2">YouTube Coming Soon</h3>
                    <p className="font-lora text-gray-300 text-sm mb-6 max-w-sm leading-relaxed">
                      We're working on getting our YouTube channel set up. In the meantime, catch us live on Facebook!
                    </p>
                    <button
                      onClick={() => setActiveTab('facebook')}
                      className="flex items-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-cinzel text-sm"
                    >
                      <Facebook size={16} />
                      Watch on Facebook Instead
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="section-padding bg-cream-dark">
        <div className="container-wide">
          <div className="text-center mb-12 fade-in">
            <h2 className="font-cinzel text-3xl text-navy mb-4">Livestream Schedule</h2>
            <div className="w-16 h-1 bg-gold mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Sun, label: 'Sunday Morning', time: '10:30 AM' },
              { icon: Moon, label: 'Sunday Evening', time: '6:00 PM' },
              { icon: BookOpen, label: 'Wednesday Night', time: '7:15 PM' },
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg text-center shadow-sm fade-in">
                <service.icon className="text-gold mx-auto mb-3" size={32} />
                <p className="font-cinzel text-navy text-sm mb-1">{service.label}</p>
                <p className="font-cinzel text-gold text-2xl">{service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="py-12 bg-cream">
        <div className="container-narrow text-center fade-in">
          <h3 className="font-cinzel text-xl text-navy mb-6">Follow Us for Updates</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Facebook size={20} />
              Facebook
            </a>
            <a
              href="https://www.instagram.com/victorybiblebaptistirmo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}
            >
              <Instagram size={20} />
              Instagram
            </a>
            <a
              href="https://youtube.com/YOUR_CHANNEL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#ff0000] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Youtube size={20} />
              YouTube
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Nothing beats worshipping together in person. We'd love to have you join us!</p>
          <a href="/contact" className="btn-primary inline-block">
            Plan Your Visit
          </a>
        </div>
      </section>
    </>
  )
}
