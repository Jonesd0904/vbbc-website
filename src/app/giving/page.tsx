'use client'

import { useState, useEffect } from 'react'
import { Heart, Gift, CreditCard, Repeat, Shield, ExternalLink } from 'lucide-react'
import { getAllContent, defaultContent } from '@/lib/content'

export default function GivingPage() {
  const [content, setContent] = useState<Record<string, string>>(defaultContent)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadContent = async () => {
      const data = await getAllContent()
      setContent(data)
      setIsLoading(false)
    }
    loadContent()
  }, [])

  const tithelyFormId = content.tithely_form_id || ''
  const tithelyChurchId = content.tithely_church_id || ''
  const givingEnabled = content.giving_enabled === 'true'
  const givingMessage = content.giving_message || 'Your generous giving supports our church ministries, missions, and community outreach. Thank you for partnering with us to share the love of Christ.'

  // Build the Tithe.ly embed URL
  const tithelyUrl = tithelyFormId 
    ? `https://give.tithe.ly/?formId=${tithelyFormId}`
    : tithelyChurchId 
    ? `https://tithe.ly/give?c=${tithelyChurchId}`
    : ''

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
            {givingMessage}
          </p>
        </div>
      </section>

      {/* Giving Options */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
                <CreditCard className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-cinzel text-lg text-navy mb-2">One-Time Gift</h3>
              <p className="text-gray-600 text-sm">
                Give a single donation to support our church ministries and missions.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
                <Repeat className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-cinzel text-lg text-navy mb-2">Recurring Giving</h3>
              <p className="text-gray-600 text-sm">
                Set up automatic recurring donations weekly, bi-weekly, or monthly.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-navy/10 rounded-full mb-4">
                <Shield className="w-8 h-8 text-navy" />
              </div>
              <h3 className="font-cinzel text-lg text-navy mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm">
                Your information is protected with bank-level security through Tithe.ly.
              </p>
            </div>
          </div>

          {/* Tithe.ly Embed or Setup Message */}
          {givingEnabled && tithelyUrl ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                <iframe
                  src={tithelyUrl}
                  width="100%"
                  height="700"
                  frameBorder="0"
                  className="w-full"
                  title="Give to Victory Bible Baptist Church"
                  allow="payment"
                />
              </div>
              <p className="text-center text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                <Shield size={14} />
                Powered by Tithe.ly - Secure, encrypted giving
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gold/20 rounded-full mb-6">
                  <Gift className="w-10 h-10 text-gold" />
                </div>
                <h2 className="font-cinzel text-2xl text-navy mb-4">
                  Online Giving Coming Soon
                </h2>
                <p className="text-gray-600 mb-8">
                  We are setting up our online giving platform. In the meantime, you can give during our services or mail your donation to the church.
                </p>
                
                <div className="bg-white rounded-xl p-6 text-left">
                  <h3 className="font-cinzel text-lg text-navy mb-4">Other Ways to Give</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gold text-sm font-bold">1</span>
                      </span>
                      <span><strong>In Person:</strong> During any of our worship services</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-gold text-sm font-bold">2</span>
                      </span>
                      <span><strong>By Mail:</strong> {content.church_address}, {content.church_city}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
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

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-cinzel text-3xl text-navy text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-cinzel text-lg text-navy mb-2">Is online giving secure?</h3>
              <p className="text-gray-600">
                Yes! We use Tithe.ly, a trusted platform used by thousands of churches. All transactions are encrypted with bank-level security, and your personal information is never shared.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-cinzel text-lg text-navy mb-2">Can I set up recurring donations?</h3>
              <p className="text-gray-600">
                Absolutely! You can set up automatic recurring gifts on a weekly, bi-weekly, or monthly basis. You can modify or cancel your recurring gift at any time through your Tithe.ly account.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-cinzel text-lg text-navy mb-2">Will I receive a giving statement?</h3>
              <p className="text-gray-600">
                Yes, you will receive an email receipt for each donation. At the end of the year, you can also access a complete giving statement through your Tithe.ly account for tax purposes.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-cinzel text-lg text-navy mb-2">What payment methods are accepted?</h3>
              <p className="text-gray-600">
                We accept credit cards, debit cards, and bank transfers (ACH). You can also give using Apple Pay or Google Pay on supported devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            Have questions about giving? Contact us at{' '}
            <a href={`tel:${content.church_phone}`} className="text-gold hover:underline">
              {content.church_phone}
            </a>
            {' '}or visit us during service times.
          </p>
        </div>
      </section>
    </main>
  )
}
