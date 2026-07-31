'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, GraduationCap, ChevronDown } from 'lucide-react'

type NavChild = { href: string; label: string; sub: string }
type NavItem =
  | { type: 'link'; href: string; label: string }
  | { type: 'group'; label: string; children: NavChild[] }

const navItems: NavItem[] = [
  { type: 'link', href: '/', label: 'Home' },
  {
    type: 'group',
    label: 'About',
    children: [
      { href: '/about', label: 'About Us', sub: 'Who we are' },
      { href: '/beliefs', label: 'What We Believe', sub: 'Our statement of faith' },
      { href: '/staff', label: 'Staff', sub: 'Pastor & team' },
    ],
  },
  {
    type: 'group',
    label: 'Media',
    children: [
      { href: '/sermons', label: 'Sermons', sub: 'Listen & watch messages' },
      { href: '/livestream', label: 'Livestream', sub: 'Join a service live' },
    ],
  },
  {
    type: 'group',
    label: 'Connect',
    children: [
      { href: '/ministries', label: 'Ministries', sub: 'Ways to get involved' },
      { href: '/events', label: 'Events', sub: 'Calendar & upcoming dates' },
      { href: '/contact', label: 'Contact', sub: 'Plan your visit' },
    ],
  },
  { type: 'link', href: '/giving', label: 'Give' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isGroupActive = (item: NavItem) =>
    item.type === 'group' && item.children.some((c) => c.href === pathname)

  const topLevelClasses = (active: boolean) =>
    `flex items-center gap-1.5 font-cinzel text-[13.5px] tracking-wide px-3.5 py-2.5 rounded-lg transition-all duration-300 ${
      active
        ? 'bg-gold/10 text-navy font-semibold'
        : 'text-navy/75 hover:bg-navy/5 hover:text-navy'
    }`

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
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.type === 'link' ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={topLevelClasses(pathname === item.href)}
                >
                  {item.label}
                </Link>
              ) : (
                <div key={item.label} className="relative group">
                  <button className={topLevelClasses(isGroupActive(item))}>
                    {item.label}
                    <ChevronDown
                      size={13}
                      className="text-gold transition-transform duration-300 group-hover:rotate-180"
                    />
                  </button>

                  {/* Dropdown (pt-2 bridges the hover gap) */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                    <div className="bg-white rounded-xl shadow-2xl border-t-[3px] border-gold p-2.5 min-w-[235px]">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block px-3.5 py-2.5 rounded-lg transition-colors duration-200 ${
                            pathname === child.href ? 'bg-gold/10' : 'hover:bg-gold/10'
                          }`}
                        >
                          <span className="block font-cinzel text-[13.5px] text-navy">
                            {child.label}
                          </span>
                          <span className="block text-xs italic text-gray-400 mt-0.5">
                            {child.sub}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}

            {/* School Link - Highlighted */}
            <a
              href="https://www.victorybible.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-shine ml-2 flex items-center gap-1.5 font-lora text-sm bg-gold text-white px-3 py-1.5 rounded-md hover:bg-gold/80 transition-all duration-300 whitespace-nowrap"
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
        <div className="lg:hidden bg-white border-t max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) =>
              item.type === 'link' ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block font-cinzel py-2.5 px-2 rounded-lg transition-colors duration-300 ${
                    pathname === item.href ? 'bg-gold/10 text-navy' : 'text-gray-700 hover:text-gold'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <div key={item.label} className="pt-2">
                  <p className="px-2 pb-1 text-[11px] uppercase tracking-[0.2em] text-gold font-medium">
                    {item.label}
                  </p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block font-lora py-2 px-4 rounded-lg transition-colors duration-300 ${
                        pathname === child.href
                          ? 'bg-gold/10 text-navy'
                          : 'text-gray-700 hover:text-gold'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* School Link - Mobile */}
            <div className="pt-3">
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
        </div>
      )}
    </nav>
  )
}
