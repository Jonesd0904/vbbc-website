'use client'

import { useEffect, useState } from 'react'
import { MapPin, Phone, Clock, Send, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Contact form messages are emailed via FormSubmit (formsubmit.co) and also
// saved to the Supabase table `contact_messages` as a backup.
// NOTE: FormSubmit sends a one-time activation email to this address on the
// first submission - someone must click "Activate Form" in that email.
const CONTACT_EMAIL = 'vbbc@att.net'
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Spam bots fill the hidden field - pretend success, send nothing
    if (honeypot) {
      setSubmitted(true)
      return
    }

    setIsSubmitting(true)
    const { name, email, phone, message } = formData

    const sendEmail = fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone: phone || '-',
        message,
        _subject: `New website message from ${name}`,
        _replyto: email,
        _template: 'table',
        _captcha: 'false',
      }),
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false || data.success === 'false') {
        throw new Error(data.message || 'Email could not be sent')
      }
    })

    const saveToDb = supabase
      ? supabase
          .from('contact_messages')
          .insert({ name, email, phone: phone || null, message })
          .then(({ error }) => {
            if (error) throw error
          })
      : Promise.reject(new Error('Supabase not configured'))

    const [mailResult, dbResult] = await Promise.allSettled([sendEmail, saveToDb])
    if (mailResult.status === 'rejected') console.error('[contact] email failed:', mailResult.reason)
    if (dbResult.status === 'rejected') console.error('[contact] save failed:', dbResult.reason)

    if (mailResult.status === 'rejected' && dbResult.status === 'rejected') {
      setError(`Sorry, your message could not be sent. Please call us at (803) 781-6970 or email ${CONTACT_EMAIL}.`)
    } else {
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }
    setIsSubmitting(false)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Get In Touch</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Contact Us</h1>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-cream">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="fade-in">
              <h2 className="font-cinzel text-3xl text-navy mb-6">We'd Love to Hear From You</h2>
              <div className="w-16 h-1 bg-gold mb-6"></div>
              <p className="text-gray-600 leading-relaxed mb-8">
                Whether you have questions, prayer requests, or just want to say hello, 
                we'd love to connect with you. Feel free to reach out anytime!
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-gold" size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-cinzel text-navy text-lg mb-1">Address</h3>
                    <p className="text-gray-600">10245 Broad River Rd.<br />Irmo, SC 29063</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="text-gold" size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-cinzel text-navy text-lg mb-1">Phone</h3>
                    <p className="text-gray-600">
                      <a href="tel:8037816970" className="hover:text-gold transition-colors">(803) 781-6970</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-gold" size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-cinzel text-navy text-lg mb-1">Email</h3>
                    <p className="text-gray-600">
                      <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gold transition-colors">{CONTACT_EMAIL}</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-gold" size={20} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-cinzel text-navy text-lg mb-1">Service Times</h3>
                    <p className="text-gray-600">
                      Sunday: 9:15 AM, 10:30 AM, 6:00 PM<br />
                      Wednesday: 7:15 PM
                    </p>
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

            {/* Contact Form */}
            <div className="fade-in">
              <div className="bg-cream-dark p-8 rounded-xl">
                <h3 className="font-cinzel text-2xl text-navy mb-6">Send Us a Message</h3>
                
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="text-green-600" size={32} />
                    </div>
                    <h4 className="font-cinzel text-xl text-navy mb-2">Message Sent!</h4>
                    <p className="text-gray-600">Thank you for reaching out. We'll get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        placeholder="(803) 555-1234"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent transition-colors resize-none"
                        placeholder="How can we help you?"
                      ></textarea>
                    </div>

                    {/* Honeypot: hidden from people, bots fill it in */}
                    <input
                      type="text"
                      name="_honey"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                    />

                    {error && (
                      <p role="alert" className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-gray-200">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3302.5!2d-81.2!3d34.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s10245+Broad+River+Rd%2C+Irmo%2C+SC+29063!5e0!3m2!1sen!2sus!4v1234567890"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>
    </>
  )
}
