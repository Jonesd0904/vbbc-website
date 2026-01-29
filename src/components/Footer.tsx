import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Clock, Facebook, Youtube } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Victory Bible Baptist Church"
              width={180}
              height={54}
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="font-lora text-gray-300 text-sm leading-relaxed">
              Living by Faith. Enjoying Victory in Christ.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors">
                <Facebook size={24} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-cinzel text-lg text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/about', label: 'About Us' },
                { href: '/beliefs', label: 'What We Believe' },
                { href: '/sermons', label: 'Sermons' },
                { href: '/livestream', label: 'Livestream' },
                { href: '/how-to-know-god', label: 'How to Know God' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-gold transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Times */}
          <div>
            <h3 className="font-cinzel text-lg text-white mb-4">Service Times</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <Clock size={16} className="mr-2 mt-1 text-gold" />
                <div>
                  <span className="block text-white">Sunday</span>
                  9:15 AM | 10:30 AM | 6:00 PM
                </div>
              </li>
              <li className="flex items-start">
                <Clock size={16} className="mr-2 mt-1 text-gold" />
                <div>
                  <span className="block text-white">Wednesday</span>
                  7:15 PM
                </div>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-cinzel text-lg text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start">
                <MapPin size={16} className="mr-2 mt-1 text-gold flex-shrink-0" />
                <span>10245 Broad River Rd.<br />Irmo, SC 29063</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2 text-gold" />
                <a href="tel:8037816970" className="hover:text-gold transition-colors">(803) 781-6970</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Victory Bible Baptist Church. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
