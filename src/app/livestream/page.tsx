'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon, BookOpen, Facebook, Youtube } from 'lucide-react'

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
            <div className="aspect-video bg-navy rounded-xl overflow-hidden shadow-lg">
              {activeTab === 'facebook' ? (
                <div className="w-full h-full">
                  {/* Facebook Page Plugin - Replace PAGE_URL with your church's Facebook page */}
                  <iframe
                    src="https://www.facebook.com/plugins/video.php?height=314&href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=false&width=560&t=0"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', overflow: 'hidden' }}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                  {/* 
                    To embed your Facebook Live:
                    1. Go to your Facebook page
                    2. Find the live video or page
                    3. Click Share > Embed
                    4. Copy the iframe code and replace the one above
                    
                    Or use the Facebook Page Plugin:
                    https://developers.facebook.com/docs/plugins/page-plugin/
                  */}
                </div>
              ) : (
                <div className="w-full h-full">
                  {/* YouTube Embed - Replace VIDEO_ID with your channel's live stream or video ID */}
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/live_stream?channel=YOUR_CHANNEL_ID"
                    title="Victory Bible Baptist Church Live Stream"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                  {/*
                    To embed your YouTube Live:
                    1. Go to your YouTube channel
                    2. Click on "Live" or find your live stream
                    3. Click Share > Embed
                    4. Copy the iframe code and replace the one above
                    
                    For channel live stream, replace YOUR_CHANNEL_ID with your actual channel ID
                  */}
                </div>
              )}
            </div>
            
            {/* Placeholder message when not live */}
            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                If you don't see a video above, the livestream may not be active. 
                Check back during our regular service times.
              </p>
            </div>
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
          <div className="flex justify-center gap-4">
            <a
              href="https://facebook.com/YOUR_PAGE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Facebook size={20} />
              Facebook
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
