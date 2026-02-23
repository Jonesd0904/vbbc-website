'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  List,
  LayoutGrid,
  Tag,
} from 'lucide-react'
import { getUpcomingEvents, getCalendarVisible, Event } from '@/lib/events'

// ─── Helpers ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  service: 'Service',
  conference: 'Conference',
  ministry: 'Ministry',
  community: 'Community',
  other: 'Event',
}

const CATEGORY_COLORS: Record<string, string> = {
  service: 'bg-navy/10 text-navy border-navy/20',
  conference: 'bg-purple-100 text-purple-700 border-purple-200',
  ministry: 'bg-gold/10 text-gold-dark border-gold/20',
  community: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-gray-100 text-gray-600 border-gray-200',
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function groupByMonth(events: Event[]): Map<string, Event[]> {
  const map = new Map<string, Event[]>()
  events.forEach((ev) => {
    if (!ev.date) return // coming-soon events handled separately
    const d = new Date(ev.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ev)
  })
  return map
}

// ─── Event Card ─────────────────────────────────────────────────────────────

const DESCRIPTION_LIMIT = 120

function EventCard({ event }: { event: Event }) {
  const catColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other
  const catLabel = CATEGORY_LABELS[event.category] || 'Event'
  const hasDate = !!event.date
  const d = hasDate ? new Date(event.date!) : null
  const [expanded, setExpanded] = useState(false)
  const isLong = event.description.length > DESCRIPTION_LIMIT

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row">
      {/* Date Stamp */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center w-full sm:w-24 py-5 sm:py-0"
        style={{ backgroundColor: event.color || '#c9a227' }}
      >
        {d ? (
          <>
            <span className="font-cinzel text-white/80 text-xs uppercase tracking-widest">
              {d.toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span className="font-cinzel text-white text-4xl font-bold leading-none">
              {d.getDate()}
            </span>
            <span className="font-cinzel text-white/80 text-xs">
              {d.toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
          </>
        ) : (
          <>
            <span className="font-cinzel text-white/80 text-xs uppercase tracking-widest">Date</span>
            <span className="font-cinzel text-white text-lg font-bold leading-tight">TBD</span>
          </>
        )}
      </div>

      {/* Image (optional) */}
      {event.image_url && (
        <div className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
          <Image src={event.image_url} alt={event.title} fill className="object-cover transition-transform duration-500" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${catColor}`}>
              <Tag size={10} />
              {catLabel}
            </span>
            {event.is_featured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-medium">
                Featured
              </span>
            )}
          </div>
          <h3 className="font-cinzel text-navy text-lg leading-snug mb-2">{event.title}</h3>

          {/* Description with expand toggle */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {expanded || !isLong
              ? event.description
              : `${event.description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 flex items-center gap-1 text-xs font-cinzel text-gold hover:text-navy transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={13} /> Show Less</>
              ) : (
                <><ChevronDown size={13} /> Read More</>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          {d ? (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-gold" />
              {formatTime(event.date!)}
              {event.end_date && ` – ${formatTime(event.end_date)}`}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600">
              <Clock size={14} className="text-amber-500" />
              Date to be announced
            </span>
          )}
          {event.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gold" />
              {event.location}
            </span>
          )}
        </div>

        {event.registration_url && (
          <a
            href={event.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start flex items-center gap-1.5 text-sm font-cinzel text-navy hover:text-gold transition-colors"
          >
            {event.cta_text || 'Learn More'}
            <ExternalLink size={13} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Grid Event Card ───────────────────────────────────────────────────────────

function GridEventCard({ event: ev }: { event: Event }) {
  const hasDate = !!ev.date
  const d = hasDate ? new Date(ev.date!) : null
  const catColor = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.other
  const catLabel = CATEGORY_LABELS[ev.category] || 'Event'
  const [expanded, setExpanded] = useState(false)
  const isLong = ev.description.length > DESCRIPTION_LIMIT

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image or color banner */}
      <div className="relative h-40 overflow-hidden flex-shrink-0">
        {ev.image_url ? (
          <Image src={ev.image_url} alt={ev.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: ev.color || '#c9a227' }}>
            <CalendarDays className="text-white/40" size={48} />
          </div>
        )}
        {/* Date badge */}
        <div className="absolute top-3 left-3 bg-white/95 rounded-lg px-3 py-1.5 text-center shadow-sm">
          {d ? (
            <>
              <p className="font-cinzel text-gray-500 text-xs uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
              <p className="font-cinzel text-navy text-xl font-bold leading-none">{d.getDate()}</p>
            </>
          ) : (
            <p className="font-cinzel text-navy text-xs font-bold">Coming<br/>Soon</p>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium w-fit ${catColor}`}>
          <Tag size={10} />
          {catLabel}
        </span>
        <h3 className="font-cinzel text-navy text-base leading-snug">{ev.title}</h3>

        {/* Description with expand toggle */}
        <div>
          <p className="text-gray-500 text-sm leading-relaxed">
            {expanded || !isLong
              ? ev.description
              : `${ev.description.slice(0, DESCRIPTION_LIMIT).trimEnd()}…`}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 flex items-center gap-1 text-xs font-cinzel text-gold hover:text-navy transition-colors"
            >
              {expanded ? (
                <><ChevronUp size={13} /> Show Less</>
              ) : (
                <><ChevronDown size={13} /> Read More</>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs text-gray-400 mt-auto pt-2">
          {d ? (
            <span className="flex items-center gap-1.5"><Clock size={12} className="text-gold" />{formatTime(ev.date!)}{ev.end_date && ` – ${formatTime(ev.end_date)}`}</span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600"><Clock size={12} className="text-amber-500" />Date to be announced</span>
          )}
          {ev.location && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-gold" />{ev.location}</span>}
        </div>

        {ev.registration_url && (
          <a
            href={ev.registration_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-cinzel text-navy hover:text-gold transition-colors"
          >
            {ev.cta_text || 'Learn More'} <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}

// ─── Mini Calendar ───────────────────────────────────────────────────────────

function MiniCalendar({ events }: { events: Event[] }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selected, setSelected] = useState<Date | null>(null)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const eventDates = events.map((e) => new Date(e.date))

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const selectedEvents = selected
    ? events.filter((e) => sameDay(new Date(e.date), selected))
    : []

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Month Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-navy">
        <button onClick={prevMonth} className="p-1 text-gray-300 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-cinzel text-white text-sm">{formatMonthYear(viewDate)}</h3>
        <button onClick={nextMonth} className="p-1 text-gray-300 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 text-center text-xs font-cinzel text-gray-400 bg-gray-50 border-b border-gray-100">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 text-center text-sm p-2 gap-1">
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const isToday = sameDay(date, today)
          const hasEvent = eventDates.some((ed) => sameDay(ed, date))
          const isSelected = selected ? sameDay(date, selected) : false

          return (
            <button
              key={day}
              onClick={() => setSelected(isSelected ? null : date)}
              className={`relative w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors font-lora text-sm
                ${isSelected ? 'bg-gold text-white' : isToday ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-700'}
              `}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Day Events */}
      {selected && (
        <div className="border-t border-gray-100 p-4">
          <p className="font-cinzel text-navy text-xs mb-3">
            {selected.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="text-gray-400 text-xs">No events this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: ev.color || '#c9a227' }} />
                  <div>
                    <p className="text-sm font-medium text-navy leading-snug">{ev.title}</p>
                    <p className="text-xs text-gray-500">{formatTime(ev.date)}{ev.location ? ` · ${ev.location}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          Event on this day
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [calendarVisible, setCalendarVisible] = useState(true)
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [loading])

  useEffect(() => {
    Promise.all([getUpcomingEvents(), getCalendarVisible()]).then(([data, visible]) => {
      setEvents(data)
      setCalendarVisible(visible)
      setLoading(false)
    })
  }, [])

  const categories = ['all', ...Array.from(new Set(events.map((e) => e.category)))]

  const filtered = filter === 'all' ? events : events.filter((e) => e.category === filter)
  const comingSoon = filtered.filter((e) => !e.date)
  const withDate = filtered.filter((e) => !!e.date)
  const grouped = groupByMonth(withDate)

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-navy-dark via-navy to-navy-light pt-20">
        <div className="text-center px-6">
          <p className="font-lora italic text-gold text-lg mb-4">Join Us</p>
          <h1 className="font-cinzel text-4xl md:text-6xl text-white font-semibold">Events & Calendar</h1>
          <p className="font-lora text-gray-300 mt-4 max-w-lg mx-auto">
            Stay connected with what's happening at Victory Bible Baptist Church.
          </p>
        </div>
      </section>

      {/* Hidden State */}
      {!loading && !calendarVisible && (
        <section className="section-padding bg-cream flex-1">
          <div className="max-w-lg mx-auto px-6 text-center py-16">
            <div className="w-20 h-20 bg-gold/10 border border-gold/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="text-gold" size={36} />
            </div>
            <h2 className="font-cinzel text-navy text-2xl mb-3">Calendar Coming Soon</h2>
            <p className="font-lora text-gray-500 leading-relaxed mb-8">
              We're getting our events calendar ready. Check back soon, or follow us on Facebook to stay up to date with everything happening at Victory Bible Baptist Church.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.facebook.com/profile.php?id=100064556957430"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#1877f2] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-cinzel text-sm"
              >
                Follow on Facebook
              </a>
              <a href="/contact" className="flex items-center justify-center gap-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-light transition-colors font-cinzel text-sm">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      {(loading || calendarVisible) && (
      <section className="section-padding bg-cream">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Left: Events List ───────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 fade-in">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilter(cat)}
                      className={`px-3 py-1 rounded-full text-sm font-cinzel transition-colors border ${
                        filter === cat
                          ? 'bg-navy text-white border-navy'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-navy hover:text-navy'
                      }`}
                    >
                      {cat === 'all' ? 'All Events' : CATEGORY_LABELS[cat] || cat}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex gap-1 bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'}`}
                  >
                    <List size={18} />
                  </button>
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-24">
                  <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* No Events */}
              {!loading && filtered.length === 0 && (
                <div className="text-center py-24 fade-in">
                  <CalendarDays className="mx-auto text-gray-300 mb-4" size={56} />
                  <h3 className="font-cinzel text-navy text-xl mb-2">No Upcoming Events</h3>
                  <p className="text-gray-500">
                    Check back soon — events will appear here when they're added.
                  </p>
                </div>
              )}

              {/* Events — List View (grouped by month) */}
              {!loading && filtered.length > 0 && view === 'list' && (
                <div className="space-y-10 fade-in">

                  {/* Coming Soon section */}
                  {comingSoon.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                          <Clock size={15} className="text-gold" />
                        </div>
                        <h2 className="font-cinzel text-navy text-lg">Coming Soon</h2>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <div className="space-y-4">
                        {comingSoon.map((ev) => (
                          <EventCard key={ev.id} event={ev} />
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.from(grouped.entries()).map(([key, monthEvents]) => {
                    const [y, m] = key.split('-').map(Number)
                    const label = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    return (
                      <div key={key}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                            <Calendar size={15} className="text-gold" />
                          </div>
                          <h2 className="font-cinzel text-navy text-lg">{label}</h2>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                        <div className="space-y-4">
                          {monthEvents.map((ev) => (
                            <EventCard key={ev.id} event={ev} />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Events — Grid View */}
              {!loading && filtered.length > 0 && view === 'grid' && (
                <div className="grid sm:grid-cols-2 gap-5 fade-in">
                  {filtered.map((ev) => (
                    <GridEventCard key={ev.id} event={ev} />
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Mini Calendar Sidebar ────────────────────────── */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-28 space-y-6 fade-in">
                <MiniCalendar events={events} />

                {/* CTA */}
                <div className="bg-navy rounded-xl p-5 text-center">
                  <CalendarDays className="mx-auto text-gold mb-3" size={28} />
                  <h4 className="font-cinzel text-white mb-2">Don't Miss Out</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Follow us on Facebook to get notified about upcoming events.
                  </p>
                  <a
                    href="https://www.facebook.com/profile.php?id=100064556957430"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1877f2] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-cinzel"
                  >
                    Follow on Facebook
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      )}

      {/* CTA Strip */}
      <section className="py-16 bg-navy">
        <div className="container-narrow text-center fade-in">
          <p className="text-white text-lg mb-6">Nothing beats worshipping together in person. We'd love to see you!</p>
          <a href="/contact" className="btn-primary inline-block">Plan Your Visit</a>
        </div>
      </section>
    </>
  )
}
