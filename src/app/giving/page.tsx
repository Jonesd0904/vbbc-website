'use client'

import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'

export default function GivingPage() {
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    // Check if script is already loaded
    if (typeof window !== 'undefined' && (window as any).tithelyGive) {
      setScriptLoaded(true)
      return
    }

    // Load the Tithely script if not already loaded
    const script = document.createElement('script')
    script.src = 'https://static.tithely.com/give/give.js'
    script.async = true
    script.onload = () => {
      setScriptLoaded(true)
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy via-navy to-navy-light py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-full mb-6">
            <Heart className="w-10 h-10 text-gold" />
          </div>
          <h1 className="font-cinzel text-4xl md:text-5xl text-white mb-6">
            Give to VBBC
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your generous giving supports our church ministries, missions, and community outreach. Thank you for partnering with us to share the love of Christ.
          </p>
        </div>
      </section>

      {/* Giving Button Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl text-navy mb-6">
            Give Online Securely
          </h2>
          <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
            Click the button below to give securely through our online giving platform. You can make a one-time gift or set up recurring donations.
          </p>
          
          {/* Tithely Give Button */}
          <div className="flex justify-center">
            {scriptLoaded ? (
              <button 
                className="tithely-give-button hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
                data-form="b52c1053-6865-11ee-90fc-1260ab546d11"
                style={{
                  backgroundColor: '#00DB72',
                  fontFamily: 'inherit',
                  fontWeight: 'bold',
                  fontSize: '19px',
                  padding: '15px 70px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  backgroundImage: 'none',
                  color: 'white',
                  textShadow: 'none',
                  display: 'inline-block',
                  float: 'none' as any,
                  border: 'none'
                }}
              >
                Give
              </button>
            ) : (
              <div className="inline-flex items-center justify-center" style={{
                backgroundColor: '#00DB72',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '19px',
                padding: '15px 70px',
                borderRadius: '4px',
                color: 'white',
                opacity: 0.7
              }}>
                Loading...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Scripture Section */}
      <section className="py-16 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <blockquote className="text-2xl md:text-3xl font-lora italic mb-6">
            &ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo;
          </blockquote>
          <cite className="text-gold font-cinzel text-lg">— 2 Corinthians 9:7</cite>
        </div>
      </section>

      {/* Other Ways to Give */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-cinzel text-3xl text-navy text-center mb-12">
            Other Ways to Give
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
                <span className="text-2xl font-bold text-navy">1</span>
              </div>
              <h3 className="font-cinzel text-xl text-navy mb-3">In Person</h3>
              <p className="text-gray-600">
                Give during any of our worship services. Offering boxes are available as you enter or exit the sanctuary.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
                <span className="text-2xl font-bold text-navy">2</span>
              </div>
              <h3 className="font-cinzel text-xl text-navy mb-3">By Mail</h3>
              <p className="text-gray-600">
                Mail your donation to:<br />
                <strong className="text-navy">Victory Bible Baptist Church</strong><br />
                1401 Old Lexington Hwy<br />
                Chapin, SC 29036
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Have questions about giving?{' '}
            <a href="/contact" className="text-gold hover:underline font-semibold">
              Contact us
            </a>
            {' '}or visit us during service times.
          </p>
        </div>
      </section>
    </main>
  )
}
