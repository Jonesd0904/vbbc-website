'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, BookOpen, Facebook, Youtube, Instagram } from 'lucide-react'

const FACEBOOK_PAGE_URL = 'https://www.facebook.com/profile.php?id=100064556957430'
const FACEBOOK_PAGE_ID = '100064556957430'

export default function LivestreamPage() {
  const [activeTab, setActiveTab] = useState<'facebook' | 'youtube'>('facebook')

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
                activeTab === 'facebook'
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy hover:bg-gray-100'
              }`}
            >
              <Facebook size={20} />
              Facebook Live
            </button>
            <button
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-cinzel transition-colors ${
                activeTab === 'youtube'
                  ? 'bg-navy text-white'
                  : 'bg-white text-navy hover:bg-gray-100'
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
                {/* Facebook Live Embed */}
                <div className="aspect-video bg-navy rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D${FACEBOOK_PAGE_ID}&show_text=false&width=560&height=314&appId`}
                    width="100%"
                    height="100%"
                    style={{ border: 'none', overflow: 'hidden' }}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>
                {/* Not Live Fallback */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-gray-500 text-sm text-center">
                    If no video appears, the service may not be live yet — check back at service time, or watch on Facebook directly.
                  </p>
                  <a
                    href={FACEBOOK_PAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#1877f2] text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap text-sm font-cinzel"
                  >
                    <Facebook size={16} />
                    Open on Facebook
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="aspect-video bg-navy rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
                    title="Victory Bible Baptist Church Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-500 text-sm">
                    If you don't see a video above, the livestream may not be active. 
                    Check back during our regular service times.
                  </p>
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
