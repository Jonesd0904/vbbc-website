'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

const staff = [
  {
    name: 'Pastor John Seydlitz',
    role: 'Senior Pastor',
    bio: [
      "Pastor John Seydlitz was saved at the age of 8 in the basement of his church after a Sunday evening service. The Lord directed him to Pensacola Christian College where he graduated with a degree in accounting in 1994.",
      "After college, the Lord opened the door for him to serve in his home church in the Chicago area. He then returned to Pensacola Christian College to earn a Master's degree in Bible Exposition.",
      "Upon graduation in 2000, the Lord brought him to Victory Bible Baptist Church as our assistant. In May 2017, Pastor Seydlitz became the Senior Pastor of our church. He has served at our church faithfully for many years with his wife, Rachel. The Seydlitz family has 3 children.",
    ],
  },
  {
    name: 'Dr. Chris Shepler',
    role: 'Pastor Emeritus & Founding Pastor',
    bio: [
      "Dr. Chris Shepler was saved at the age of 16, after hearing a clear gospel presentation at a youth meeting. He accepted Christ at home in his own bedroom as he thought on John 3:16. God led him to Florida Bible College, where he received his Bachelor's degree.",
      "He was the founding pastor of our church in 1979, and has been in full-time ministry for over 40 years. In 2002, he earned his Master's of Ministry degree from Pensacola Christian College. In 2005, he was awarded an Honorary Doctorate from Pensacola Christian College.",
      "He married his wife Peggy in 1973, and they have 4 grown children together.",
    ],
  },
]

export default function StaffPage() {
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
          {staff.map((person, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden fade-in">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 bg-gradient-to-br from-navy to-navy-light p-8 flex items-center justify-center">
                  <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center">
                    <User className="text-gold" size={64} />
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <h2 className="font-cinzel text-2xl md:text-3xl text-navy mb-2">{person.name}</h2>
                  <p className="font-lora italic text-gold text-lg mb-6">{person.role}</p>
                  <div className="space-y-4 text-gray-600 leading-relaxed">
                    {person.bio.map((paragraph, pIndex) => (
                      <p key={pIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </>
  )
}
