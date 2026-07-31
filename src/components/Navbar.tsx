'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, GraduationCap } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/beliefs', label: 'What We Believe' },
  { href: '/ministries', label: 'Ministries' },
  { href: '/staff', label: 'Staff' },
  { href: '/sermons', label: 'Sermons' },
  { href: '/events', label: 'Events' },
  { href: '/livestream', label: 'Livestream' },
  { href: '/giving', label: 'Give' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="Victory Bible Baptist Church"
              width={200}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link font-lora text-gray-700 text-sm"
              >
                {link.label}
              </Link>
            ))}
            {/* School Link - Highlighted */}
            <a
              href="https://www.victorybible.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine flex items-center gap-1.5 font-lora text-sm bg-gold text-white px-3 py-1.5 rounded-md hover:bg-gold/80 transition-all duration-300 whitespace-nowrap"
            >
              <GraduationCap size={15} />
              VBCS
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-navy"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block font-lora text-gray-700 hover:text-gold transition-colors duration-300 py-2"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {/* School Link - Mobile */}
            <a
              href="https://www.victorybible.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-lora text-white bg-gold px-4 py-2 rounded-md hover:bg-gold/80 transition-colors duration-300 w-fit"
              onClick={() => setIsOpen(false)}
            >
              <GraduationCap size={16} />
              Victory Bible Christian School
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
