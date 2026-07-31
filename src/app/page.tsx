'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, Clock, Phone, BookOpen, Users, Music, Heart } from 'lucide-react'
import EventSpotlight from '@/components/EventSpotlight'

export default function Home() {
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
      {/* Hero Section with Event Spotlight */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light overflow-hidden">
        {/* Background video: looping clouds (placeholder — swap /videos/sky-loop.mp4 for a real one anytime) */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source src="/videos/sky-loop.mp4" type="video/mp4" />
        </video>
        {/* Overlays keep the hero text readable over the video */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-dark/80 via-navy/60 to-navy-light/50"></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-12 pb-20">
          <div className="grid lg:grid-cols-[350px_1fr] gap-8 lg:gap-16 items-start">
            
            {/* Event Spotlight - Left Side (Desktop only) - Further left and lower */}
            <div className="hidden lg:flex items-center justify-start lg:mt-16 lg:-ml-24">
              <EventSpotlight />
            </div>

            {/* Main Hero Content - Center (truly centered) */}
            <div className="text-center lg:col-start-1 lg:col-span-2 lg:flex lg:justify-center">
              <div className="max-w-3xl">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-gold" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 5 L50 95 M30 25 L70 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="font-lora italic text-gold text-lg md:text-xl mb-4 [text-shadow:0_2px_8px_rgba(0,0,0,0.75)]">Welcome to</p>
                <h1 className="font-trajan text-4xl md:text-6xl lg:text-7xl text-white font-semibold mb-6 tracking-wide [text-shadow:0_3px_18px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.55)]">
                  Victory Bible<br />Baptist Church
                </h1>
                <p className="font-lora text-xl md:text-2xl text-white mb-4 [text-shadow:0_2px_8px_rgba(0,0,0,0.75)]">
                  Living by Faith. Enjoying Victory in Christ.
                </p>
                <p className="font-lora italic text-gold text-lg mb-10 max-w-2xl mx-auto [text-shadow:0_2px_8px_rgba(0,0,0,0.75)]">
                  "But thanks be to God, which giveth us the victory through our Lord Jesus Christ."
                  <span className="block mt-2 text-white/85">— 1 Corinthians 15:57</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Link href="/about" className="btn-primary">
                    Plan Your Visit
                  </Link>
                  <Link href="/livestream" className="btn-secondary">
                    Watch Live
                  </Link>
                </div>
                
                {/* Scroll Indicator - Now below buttons */}
                <div className="animate-bounce mt-8">
                  <ChevronDown className="text-white/50 mx-auto" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Times */}
      <section className="bg-navy py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Sunday School', time: '9:15 AM' },
              { label: 'Morning Worship', time: '10:30 AM' },
              { label: 'Evening Worship', time: '6:00 PM' },
              { label: 'Wednesday Night', time: '7:15 PM' },
            ].map((service) => (
              <div key={service.label} className="text-white">
                <p className="text-gold text-xs uppercase tracking-widest mb-1">{service.label}</p>
                <p className="font-cinzel text-2xl">{service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              {/* Framed photo: offset gold frame + warm-graded image */}
              <div className="relative">
                <div
                  className="absolute -top-4 -left-4 right-4 bottom-4 border-2 border-gold/85 rounded-lg pointer-events-none"
                  aria-hidden="true"
                ></div>
                <div className="relative aspect-[4/3] rounded-md overflow-hidden shadow-[0_14px_40px_rgba(15,37,64,0.22)]">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/images/service-loop-poster.jpg"
                    aria-label="Worship service at Victory Bible Baptist Church"
                  >
                    <source src="/videos/service-loop.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
            <div className="fade-in">
              <p className="font-lora italic text-gold mb-2">Welcome</p>
              <h2 className="font-cinzel text-3xl md:text-4xl text-navy mb-6">
                A Place to Call Home
              </h2>
              <div className="w-16 h-1 bg-gold mb-6"></div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are an independent Baptist church in the Irmo, Dutch Fork, and Ballentine area 
                centered on the clear teaching and preaching of the truths of God's holy Word.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our purpose is to reach people with the Good News of Jesus Christ and encourage 
                and build up believers to carry out the Great Commission. The love of Christ and 
                truth of God's Word has made us a family-oriented, caring, and sharing church.
              </p>
              <Link href="/about" className="btn-primary inline-block">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Parallax - Rock Solid Background */}
      <section className="relative py-32 bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url("/images/rock-solid-bg.jpg?v=2")' }}>
        <div className="absolute inset-0 bg-navy/60"></div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center fade-in">
          <svg className="w-12 h-12 mx-auto text-gold mb-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 5 L50 95 M30 25 L70 25" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
          </svg>
          <p className="font-lora italic text-2xl md:text-3xl text-white leading-relaxed mb-6">
            "For their rock is not as our Rock, even our enemies themselves being judges."
          </p>
          <p className="font-cinzel text-gold text-lg">— Deuteronomy 32:31</p>
        </div>
      </section>

      {/* What We Believe Preview */}
      <section className="section-padding bg-cream-dark">
        <div className="container-wide">
          <div className="text-center mb-12 fade-in">
            <p className="font-lora italic text-gold mb-2">Our Foundation</p>
            <h2 className="font-cinzel text-3xl md:text-4xl text-navy mb-4">What We Believe</h2>
            <div className="w-16 h-1 bg-gold mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'The Bible',
                text: 'We believe the Bible is the inspired, infallible, and authoritative Word of God.',
              },
              {
                icon: Heart,
                title: 'Salvation',
                text: 'We believe salvation is by grace alone through faith alone in Jesus Christ alone.',
              },
              {
                icon: Users,
                title: 'The Church',
                text: 'We believe the local church is an autonomous body of baptized believers.',
              },
            ].map((belief, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-sm text-center fade-in">
                <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <belief.icon className="text-gold" size={28} />
                </div>
                <h3 className="font-cinzel text-xl text-navy mb-3">{belief.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{belief.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 fade-in">
            <Link href="/beliefs" className="btn-primary inline-block">
              Full Statement of Faith
            </Link>
          </div>
        </div>
      </section>

      {/* Ministries Preview */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          <div className="text-center mb-12 fade-in">
            <p className="font-lora italic text-gold mb-2">Get Involved</p>
            <h2 className="font-cinzel text-3xl md:text-4xl text-navy mb-4">Our Ministries</h2>
            <div className="w-16 h-1 bg-gold mx-auto"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Children's Ministry", desc: 'Building faith foundations' },
              { icon: Users, title: 'Youth Ministry', desc: 'Equipping teens for Christ' },
              { icon: BookOpen, title: 'Adult Bible Study', desc: 'Deep dives into God\'s Word' },
              { icon: Music, title: 'Music Ministry', desc: 'Glorifying God in song' },
            ].map((ministry, index) => (
              <div key={index} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 fade-in">
                <div className="h-32 bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                  <ministry.icon className="text-gold" size={40} />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-cinzel text-lg text-navy mb-2">{ministry.title}</h3>
                  <p className="text-gray-500 text-sm">{ministry.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 fade-in">
            <Link href="/ministries" className="btn-primary inline-block">
              Explore All Ministries
            </Link>
          </div>
        </div>
      </section>

      {/* Contact/Location */}
      <section className="section-padding bg-navy">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white fade-in">
              <p className="font-lora italic text-gold mb-2">Visit Us</p>
              <h2 className="font-cinzel text-3xl md:text-4xl text-white mb-6">Plan Your Visit</h2>
              <div className="w-16 h-1 bg-gold mb-6"></div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="text-gold mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold mb-1">Address</p>
                    <p className="text-gray-300">10245 Broad River Rd.<br />Irmo, SC 29063</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-gold mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold mb-1">Phone</p>
                    <p className="text-gray-300">(803) 781-6970</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="text-gold mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-semibold mb-1">Service Times</p>
                    <p className="text-gray-300">Sunday: 9:15 AM, 10:30 AM, 6:00 PM<br />Wednesday: 7:15 PM</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <a 
                  href="https://maps.google.com/?q=10245+Broad+River+Rd+Irmo+SC+29063" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary inline-block"
                >
                  Get Directions
                </a>
              </div>
            </div>
            <div className="fade-in">
              <div className="aspect-video bg-navy-light rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.5!2d-81.2!3d34.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s10245+Broad+River+Rd%2C+Irmo%2C+SC+29063!5e0!3m2!1sen!2sus!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="min-h-[300px]"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold">
        <div className="max-w-3xl mx-auto px-6 text-center fade-in">
          <h2 className="font-cinzel text-3xl text-navy mb-4">Do You Know God?</h2>
          <p className="text-navy/80 mb-8">
            The most important decision you'll ever make is where you'll spend eternity. 
            Learn how you can know for certain that you'll go to Heaven.
          </p>
          <Link href="/how-to-know-god" className="bg-navy text-white font-cinzel px-8 py-4 rounded inline-block hover:bg-navy-dark transition-colors">
            Learn More
          </Link>
        </div>
      </section>
    </>
  )
}
