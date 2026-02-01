'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, ExternalLink } from 'lucide-react'
import { getFeaturedEvent, Event } from '@/lib/events'

export default function EventSpotlight() {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadEvent() {
      const featuredEvent = await getFeaturedEvent()
      setEvent(featuredEvent)
      setLoading(false)
    }
    loadEvent()
  }, [])

  if (loading || !event) {
    return null
  }

  const eventDate = new Date(event.date)
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  const handleClick = () => {
    if (event.registration_url) {
      window.open(event.registration_url, '_blank', 'noopener,noreferrer')
    }
  }

  const themeColor = event.color || '#c9a227' // Default to gold

  return (
    <div 
      className="event-spotlight-container"
      onClick={handleClick}
      style={{ cursor: event.registration_url ? 'pointer' : 'default' }}
    >
      {/* Pulsating glow effect */}
      <div 
        className="event-spotlight-glow"
        style={{ 
          '--glow-color': themeColor,
          boxShadow: `0 0 40px ${themeColor}40, 0 0 80px ${themeColor}20`
        } as React.CSSProperties}
      />
      
      {/* Main circular portal */}
      <div className="event-spotlight-portal">
        {/* Background image with blur */}
        {event.image_url && (
          <div className="event-spotlight-bg">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        {/* Frosted glass overlay */}
        <div className="event-spotlight-glass" />
        
        {/* Content */}
        <div className="event-spotlight-content">
          {/* Date badge */}
          <div 
            className="event-date-badge"
            style={{ backgroundColor: themeColor }}
          >
            <Calendar size={14} />
            <span>{eventDate.getDate()}</span>
            <span className="text-xs">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
          </div>
          
          {/* Event details */}
          <div className="event-details">
            <h3 className="event-title">{event.title}</h3>
            <p className="event-description">{event.description}</p>
            
            <div className="event-meta">
              <div className="event-meta-item">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
              <div className="event-meta-item">
                <span>{formattedTime}</span>
              </div>
              {event.location && (
                <div className="event-meta-item">
                  <MapPin size={14} />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            {event.registration_url && (
              <button 
                className="event-cta"
                style={{ 
                  backgroundColor: themeColor,
                  borderColor: themeColor
                }}
              >
                {event.cta_text || 'Learn More'}
                <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Edge fade effect */}
        <div className="event-spotlight-fade" />
      </div>

      <style jsx>{`
        .event-spotlight-container {
          position: relative;
          width: 280px;
          height: 280px;
          flex-shrink: 0;
        }

        .event-spotlight-glow {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          opacity: 0.6;
          animation: pulse-glow 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.7;
          }
        }

        .event-spotlight-portal {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          transition: transform 0.3s ease;
        }

        .event-spotlight-container:hover .event-spotlight-portal {
          transform: scale(1.05);
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
          background: rgba(15, 37, 64, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .event-spotlight-content {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          z-index: 2;
        }

        .event-date-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 12px;
          border-radius: 12px;
          color: #0f2540;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .event-date-badge span:first-of-type {
          font-size: 24px;
          line-height: 1;
        }

        .event-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 220px;
        }

        .event-title {
          font-family: 'Cinzel', serif;
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.2;
          margin: 0;
        }

        .event-description {
          font-size: 13px;
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
          font-size: 12px;
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
          padding: 8px 16px;
          border: 2px solid;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #0f2540;
          background-color: #c9a227;
          transition: all 0.2s ease;
          cursor: pointer;
          margin-top: 4px;
        }

        .event-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.4);
        }

        .event-spotlight-fade {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle at center,
            transparent 40%,
            rgba(15, 37, 64, 0.4) 70%,
            rgba(15, 37, 64, 0.9) 100%
          );
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .event-spotlight-container {
            width: 240px;
            height: 240px;
          }

          .event-title {
            font-size: 16px;
          }

          .event-description {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
