'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Users, BookOpen, Music, Globe } from 'lucide-react'

const ministries = [
  {
    icon: Users,
    title: "Children's Ministry",
    description: "Building a foundation of faith for the next generation through Bible teaching and fun activities. Our children's ministry provides age-appropriate lessons that teach biblical truths in engaging ways. We believe that children are a heritage from the Lord and we are committed to helping them grow in their knowledge and love of God.",
  },
  {
    icon: Users,
    title: "Youth Ministry",
    description: "Equipping teens to stand firm in their faith and become leaders for Christ. Our youth ministry provides a place for teenagers to grow spiritually, build friendships with other Christian young people, and learn to apply God's Word to their daily lives. We focus on relevant Bible teaching, fellowship, and outreach opportunities.",
  },
  {
    icon: BookOpen,
    title: "Adult Bible Study",
    description: "Deep dives into God's Word for spiritual growth and practical application. Our Sunday School classes offer verse-by-verse Bible study for adults of all ages. Whether you're a new believer or have been walking with Christ for years, there's a place for you to learn and grow in our adult education program.",
  },
  {
    icon: Music,
    title: "Music Ministry",
    description: "Glorifying God through traditional hymns and Christ-honoring music. Our music ministry includes our church choir, special music, and congregational singing. We believe that music is a powerful tool for worship and use it to praise the Lord and encourage one another in the faith.",
  },
  {
    icon: Globe,
    title: "Outreach & Missions",
    description: "Reaching the world with the Gospel of Jesus Christ. We are committed to the Great Commission and support missionaries both locally and around the world. Our church regularly participates in outreach events, door-to-door evangelism, and community service projects to share God's love with others.",
  },
]

export default function MinistriesPage() {
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
          <p className="font-lora italic text-gold text-lg mb-4">Get Involved</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Our Ministries</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 bg-cream">
        <div className="container-narrow text-center fade-in">
          <p className="text-gray-600 text-lg leading-relaxed">
            At Victory Bible Baptist Church, we believe that every member has a place to serve and grow. 
            Our ministries are designed to help you connect with God, grow in your faith, and serve others.
          </p>
        </div>
      </section>

      {/* Ministries List */}
      <section className="py-8 bg-cream">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          {ministries.map((ministry, index) => (
            <div 
              key={index} 
              className={`flex flex-col md:flex-row items-start gap-6 p-8 rounded-lg fade-in ${
                index % 2 === 0 ? 'bg-white' : 'bg-cream-dark'
              }`}
            >
              <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                <ministry.icon className="text-gold" size={36} />
              </div>
              <div>
                <h2 className="font-cinzel text-2xl text-navy mb-3">{ministry.title}</h2>
                <p className="text-gray-600 leading-relaxed">{ministry.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Want to get involved? We'd love to help you find your place to serve.</p>
          <Link href="/contact" className="btn-primary inline-block">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
