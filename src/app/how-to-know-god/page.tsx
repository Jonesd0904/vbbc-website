'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const steps = [
  {
    number: 1,
    title: 'Realize You Are a Sinner',
    content: "The Bible says that all of us have sinned and fallen short of God's perfect standard.",
    verses: [
      '"For all have sinned, and come short of the glory of God." — Romans 3:23',
      '"As it is written, There is none righteous, no, not one." — Romans 3:10',
    ],
  },
  {
    number: 2,
    title: 'Realize the Penalty for Sin',
    content: 'Sin separates us from God. The consequence of sin is eternal death and separation from God.',
    verses: [
      '"For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord." — Romans 6:23',
    ],
  },
  {
    number: 3,
    title: "Realize God's Provision",
    content: 'God loves you so much that He sent His Son Jesus to die on the cross to pay the penalty for your sins.',
    verses: [
      '"But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us." — Romans 5:8',
      '"For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." — John 3:16',
    ],
  },
  {
    number: 4,
    title: 'Receive Christ as Your Savior',
    content: 'Salvation is not earned by good works. It is a free gift received by faith in Jesus Christ alone.',
    verses: [
      '"For by grace are ye saved through faith; and that not of yourselves: it is the gift of God: Not of works, lest any man should boast." — Ephesians 2:8-9',
      '"That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved." — Romans 10:9',
    ],
  },
]

export default function HowToKnowGodPage() {
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
          <p className="font-lora italic text-gold text-lg mb-4">The Most Important Decision</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">How to Know God</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <p className="text-xl text-navy font-semibold mb-4">
            Do you know for certain that if you died today, you would go to Heaven?
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            The Bible says you CAN know! God loves you and wants you to spend eternity with Him. 
            Here's what the Bible says about how you can know God personally and have eternal life.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-8 bg-cream">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-gold fade-in">
              <div className="flex items-center mb-4">
                <span className="text-gold text-sm font-cinzel uppercase tracking-widest">Step {step.number}</span>
              </div>
              <h2 className="font-cinzel text-2xl text-navy mb-4">{step.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{step.content}</p>
              <div className="space-y-3">
                {step.verses.map((verse, index) => (
                  <p key={index} className="font-lora italic text-gray-500 text-sm bg-cream p-4 rounded-lg">
                    {verse}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prayer */}
      <section className="py-20 bg-navy">
        <div className="max-w-3xl mx-auto px-6 text-center fade-in">
          <h2 className="font-cinzel text-3xl text-gold mb-6">A Prayer You Can Pray</h2>
          <p className="text-white mb-8">
            If you would like to receive Jesus Christ as your Savior today, you can pray a prayer like this from your heart:
          </p>
          <div className="bg-white/10 p-8 rounded-xl mb-8">
            <p className="font-lora italic text-xl text-white leading-relaxed">
              "Dear God, I know that I am a sinner. I believe that Jesus died on the cross to pay for my sins. 
              I believe He rose again from the dead. Right now, I trust Jesus Christ alone as my Savior. 
              Thank You for saving me. In Jesus' name, Amen."
            </p>
          </div>
          <p className="text-gray-300 mb-8">
            If you prayed that prayer and meant it from your heart, the Bible says you are now saved! 
            We would love to hear from you and help you grow in your new faith.
          </p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </section>

      {/* Assurance */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <h2 className="font-cinzel text-2xl text-navy mb-6">You Can Know You're Saved</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <p className="font-lora italic text-gray-600 text-lg">
              "These things have I written unto you that believe on the name of the Son of God; 
              that ye may know that ye have eternal life, and that ye may believe on the name of the Son of God."
            </p>
            <p className="font-cinzel text-gold mt-4">— 1 John 5:13</p>
          </div>
        </div>
      </section>
    </>
  )
}
