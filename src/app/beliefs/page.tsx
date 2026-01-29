'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const beliefs = [
  {
    title: 'The Bible',
    content: 'We believe the Bible is the inspired, infallible, and authoritative Word of God. It is our sole guide for faith and practice. We believe that the King James Bible is the preserved Word of God for the English-speaking people.',
    verse: '"All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness." — 2 Timothy 3:16',
  },
  {
    title: 'God',
    content: 'We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit—equal in power and glory. God is the Creator and Sustainer of all things.',
    verse: '"For there are three that bear record in heaven, the Father, the Word, and the Holy Ghost: and these three are one." — 1 John 5:7',
  },
  {
    title: 'Jesus Christ',
    content: 'We believe in the deity of Jesus Christ, His virgin birth, His sinless life, His miracles, His vicarious and atoning death through His shed blood, His bodily resurrection, His ascension to the right hand of the Father, and His personal return in power and glory.',
    verse: '"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." — John 3:16',
  },
  {
    title: 'Salvation',
    content: 'We believe salvation is by grace alone through faith alone in Jesus Christ alone—not by works, but as a gift from God. We believe that all have sinned and come short of the glory of God, and that repentance and faith in the Lord Jesus Christ is the only way of salvation.',
    verse: '"For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." — Ephesians 2:8-9',
  },
  {
    title: 'Eternal Security',
    content: 'We believe that once a person is genuinely saved, they are eternally secure in Christ and can never lose their salvation. Salvation is kept by the power of God, not by human effort.',
    verse: '"And I give unto them eternal life; and they shall never perish, neither shall any man pluck them out of my hand." — John 10:28',
  },
  {
    title: 'The Church',
    content: 'We believe the local church is an autonomous body of baptized believers, united in faith for worship, fellowship, and service. We believe in the ordinances of baptism by immersion and the Lord\'s Supper.',
    verse: '"Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching." — Hebrews 10:25',
  },
]

export default function BeliefsPage() {
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
          <p className="font-lora italic text-gold text-lg mb-4">Our Foundation</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">What We Believe</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <p className="text-gray-600 text-lg leading-relaxed">
            At Victory Bible Baptist Church, we hold firmly to the fundamental truths of God's Word. 
            Our beliefs are not based on tradition or human wisdom, but on the unchanging, eternal Word of God.
          </p>
        </div>
      </section>

      {/* Beliefs */}
      <section className="py-8 bg-cream">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          {beliefs.map((belief, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-sm border-t-4 border-gold fade-in">
              <h2 className="font-cinzel text-2xl text-navy mb-4">{belief.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{belief.content}</p>
              <p className="font-lora italic text-gray-500 text-sm">{belief.verse}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Want to learn more about what we believe? We'd love to talk with you.</p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
