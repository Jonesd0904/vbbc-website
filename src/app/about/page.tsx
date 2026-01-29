'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Clock } from 'lucide-react'

export default function AboutPage() {
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
          <p className="font-lora italic text-gold text-lg mb-4">Get to Know Us</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">About Us</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-cream">
        <div className="container-narrow">
          <div className="text-center fade-in">
            <h2 className="font-cinzel text-3xl md:text-4xl text-navy mb-6">
              Welcome to Victory Bible Baptist Church
            </h2>
            <div className="w-20 h-1 bg-gold mx-auto mb-8"></div>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                We are an independent Baptist church in the Irmo, Dutch Fork, and Ballentine area 
                centered on the clear teaching and preaching of the truths of God's holy Word.
              </p>
              <p>
                Our purpose is to reach people with the Good News of Jesus Christ and encourage 
                and build up believers to carry out the Great Commission. Our pastor shares how 
                you can KNOW that you will go to Heaven in every service as he clearly teaches 
                God's Word to believers.
              </p>
              <p>
                The love of Christ and truth of God's Word has made us a family-oriented, caring, 
                and sharing church. What a blessing!
              </p>
              <p className="font-lora italic text-gold text-xl">
                Come and be a part as we live by faith and enjoy the victory we have in Christ!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <h2 className="font-cinzel text-2xl md:text-3xl text-gold mb-6">Our Vision</h2>
          <p className="font-lora italic text-xl text-white">
            "Come and be a part as we live by faith and enjoy the victory we have in Christ!"
          </p>
        </div>
      </section>

      {/* Service Times */}
      <section className="section-padding bg-cream-dark">
        <div className="container-wide">
          <div className="text-center mb-12 fade-in">
            <h2 className="font-cinzel text-3xl text-navy mb-4">Service Times</h2>
            <div className="w-16 h-1 bg-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Sunday School', time: '9:15 AM' },
              { label: 'Morning Worship', time: '10:30 AM' },
              { label: 'Evening Worship', time: '6:00 PM' },
              { label: 'Wednesday Night', time: '7:15 PM' },
            ].map((service) => (
              <div key={service.label} className="bg-white p-6 rounded-lg text-center shadow-sm fade-in">
                <p className="text-gold text-xs uppercase tracking-widest mb-2">{service.label}</p>
                <p className="font-cinzel text-2xl text-navy">{service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="section-padding bg-cream">
        <div className="container-narrow text-center fade-in">
          <h2 className="font-cinzel text-3xl text-navy mb-8">Visit Us</h2>
          <div className="space-y-2 mb-8">
            <p className="text-xl font-semibold text-navy">10245 Broad River Rd.</p>
            <p className="text-xl text-gray-600">Irmo, SC 29063</p>
            <p className="text-lg text-gray-600">(803) 781-6970</p>
          </div>
          <a 
            href="https://maps.google.com/?q=10245+Broad+River+Rd+Irmo+SC+29063" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Get Directions
          </a>
        </div>
      </section>
    </>
  )
}
