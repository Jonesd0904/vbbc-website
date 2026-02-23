'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react'
import { getFeaturedEvent, Event } from '@/lib/events'

export default function EventSpotlight() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadEvent() {
      const featuredEvent = await getFeaturedEvent()
      setEvent(featuredEvent)
      setLoading(false)
    }
    loadEvent()
  }, [])

  if (loading || !event) return null

  const hasDate = !!event.date
  // Strip timezone so times display as-entered, not shifted to UTC
  const parseLocal = (s: string) => new Date(s.replace(/([+-]\d{2}:?\d{2}|Z)$/, ''))
  const eventDate = hasDate ? parseLocal(event.date!) : null
  const formattedDate = eventDate
    ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null
  const formattedTime = eventDate
    ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : null
  const themeColor = event.color || '#c9a227'

  // Whole portal navigates to /events
  const handlePortalClick = () => router.push('/events')

  // CTA button opens registration URL (or falls back to /events)
  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (event.registration_url) {
      window.open(event.registration_url, '_blank', 'noopener,noreferrer')
    } else {
      router.push('/events')
    }
  }

  return (
    <div
      className="event-spotlight-container"
      onClick={handlePortalClick}
      style={{ cursor: 'pointer' }}
      title="View all events"
    >
      {/* Pulsating glow */}
      <div
        className="event-spotlight-glow"
        style={{ '--glow-color': themeColor, boxShadow: `0 0 40px ${themeColor}40, 0 0 80px ${themeColor}20` } as React.CSSProperties}
      />

      {/* Portal circle */}
      <div className="event-spotlight-portal">
        {event.image_url && (
          <div className="event-spotlight-bg">
            <Image src={event.image_url} alt={event.title} fill className="object-cover" />
          </div>
        )}
        <div className="event-spotlight-glass" />

        <div className="event-spotlight-content">
          {/* Date badge — or "Coming Soon" */}
          <div className="event-date-badge" style={{ backgroundColor: themeColor }}>
            {hasDate && eventDate ? (
              <>
                <Calendar size={14} />
                <span>{eventDate.getDate()}</span>
                <span className="badge-month">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
              </>
            ) : (
              <>
                <Clock size={14} />
                <span className="badge-soon">Coming</span>
                <span className="badge-month">Soon</span>
              </>
            )}
          </div>

          <div className="event-details">
            <h3 className="event-title">{event.title}</h3>
            <p className="event-description">{event.description}</p>

            <div className="event-meta">
              {hasDate && formattedDate ? (
                <>
                  <div className="event-meta-item"><Calendar size={14} /><span>{formattedDate}</span></div>
                  {formattedTime && <div className="event-meta-item"><span>{formattedTime}</span></div>}
                </>
              ) : (
                <div className="event-meta-item"><Clock size={14} /><span>Date to be announced</span></div>
              )}
              {event.location && (
                <div className="event-meta-item"><MapPin size={14} /><span>{event.location}</span></div>
              )}
            </div>

            <button
              className="event-cta"
              style={{ backgroundColor: themeColor, borderColor: themeColor }}
              onClick={handleCtaClick}
            >
              {event.registration_url ? (event.cta_text || 'Learn More') : 'View Events'}
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        <div className="event-spotlight-fade" />
      </div>

      <style jsx>{`
        .event-spotlight-container {
          position: relative;
          width: 350px;
          height: 350px;
          flex-shrink: 0;
        }
        .event-spotlight-glow {
          position: absolute;
          inset: -30px;
          border-radius: 50%;
          opacity: 0.7;
          animation: pulse-glow 3s ease-in-out infinite;
          pointer-events: none;
          filter: blur(25px);
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(0.92); opacity: 0.4; }
          50%       { transform: scale(1.08); opacity: 0.9; }
        }
        .event-spotlight-portal {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          transition: all 0.4s ease;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .event-spotlight-container:hover .event-spotlight-portal {
          transform: scale(1.08);
          box-shadow: 0 20px 60px rgba(201,162,39,0.4);
        }
        .event-spotlight-bg {
          position: absolute;
          inset: -10%;
          width: 120%;
          height: 120%;
        }
        .event-spotlight-bg img {
          filter: blur(8px) brightness(0.7);
        }
        .event-spotlight-glass {
          position: absolute;
          inset: 0;
          background: rgba(15,37,64,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .event-spotlight-content {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 40px 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 2;
        }
        .event-date-badge {
          position: absolute;
          top: 25px;
          right: 25px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 14px;
          border-radius: 12px;
          color: #0f2540;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .event-date-badge span:first-of-type { font-size: 28px; line-height: 1; }
        .badge-soon { font-size: 13px !important; line-height: 1 !important; }
        .badge-month { font-size: 12px; }
        .event-details {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 280px;
        }
        .event-title {
          font-family: 'Cinzel', serif;
          font-size: 22px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          margin: 0;
        }
        .event-description {
          font-size: 15px;
          color: #f5f5dc;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          color: #c9a227;
        }
        .event-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          justify-content: center;
        }
        .event-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border: 2px solid;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #0f2540;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-top: 6px;
        }
        .event-cta:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(201,162,39,0.5);
        }
        .event-spotlight-fade {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(circle at center, transparent 35%, rgba(15,37,64,0.3) 65%, rgba(15,37,64,0.8) 100%);
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .event-spotlight-container { width: 280px; height: 280px; }
          .event-title { font-size: 18px; }
          .event-description { font-size: 13px; }
        }
      `}</style>
    </div>
  )
}
