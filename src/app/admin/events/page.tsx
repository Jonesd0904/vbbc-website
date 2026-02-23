'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  MapPin,
  ExternalLink,
  ImageIcon,
  Loader2,
  Eye,
  EyeOff,
  Star,
  Clock,
  Lock,
} from 'lucide-react'
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  toggleEventActive,
  toggleEventFeatured,
  getCalendarVisible,
  setCalendarVisible,
  Event,
} from '@/lib/events'

const ADMIN_PASSWORD = 'vbbc2024'

type EventInput = Omit<Event, 'id' | 'created_at'>

export default function EventsAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [calendarVisible, setCalendarVisibleState] = useState(true)
  const [togglingVisibility, setTogglingVisibility] = useState(false)

  const [formData, setFormData] = useState<EventInput>({
    title: '',
    description: '',
    date: '',
    end_date: '',
    image_url: '',
    category: 'service',
    location: '',
    registration_url: '',
    cta_text: 'Learn More',
    color: '#c9a227',
    is_active: true,
    is_featured: false,
    priority: 1,
  })

  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const auth = sessionStorage.getItem('vbbc_admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents()
      getCalendarVisible().then(setCalendarVisibleState)
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('vbbc_admin_auth', 'true')
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  const loadEvents = async () => {
    setLoading(true)
    const data = await getAllEvents()
    setEvents(data)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      end_date: '',
      image_url: '',
      category: 'service',
      location: '',
      registration_url: '',
      cta_text: 'Learn More',
      color: '#c9a227',
      is_active: true,
      is_featured: false,
      priority: 1,
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      end_date: event.end_date || '',
      image_url: event.image_url || '',
      category: event.category,
      location: event.location || '',
      registration_url: event.registration_url || '',
      cta_text: event.cta_text || 'Learn More',
      color: event.color || '#c9a227',
      is_active: event.is_active,
      is_featured: event.is_featured,
      priority: event.priority,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!formData.title || !formData.date) {
      alert('Title and date are required')
      return
    }

    setSaving(true)

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData)
      } else {
        await createEvent(formData)
      }
      await loadEvents()
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event')
    }

    setSaving(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return

    const success = await deleteEvent(id)
    if (success) {
      await loadEvents()
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    const url = await uploadEventImage(file, formData.title || 'event')
    if (url) {
      setFormData({ ...formData, image_url: url })
    }

    setUploadingImage(false)
  }

  const handleToggleVisibility = async () => {
    setTogglingVisibility(true)
    const newVal = !calendarVisible
    const ok = await setCalendarVisible(newVal)
    if (ok) setCalendarVisibleState(newVal)
    setTogglingVisibility(false)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await toggleEventActive(id, !currentStatus)
    await loadEvents()
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    await toggleEventFeatured(id, !currentStatus)
    await loadEvents()
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 pt-24">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="text-gold" size={32} />
            </div>
            <h1 className="font-cinzel text-2xl text-navy">Events Management</h1>
            <p className="text-gray-500 mt-2">Victory Bible Baptist Church</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-gold focus:border-transparent`}
                placeholder="Enter admin password"
              />
              {passwordError && <p className="text-red-500 text-sm mt-2">Incorrect password</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-navy text-white py-3 rounded-lg font-cinzel hover:bg-navy-light transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-navy" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Admin
            </Link>
            <div className="w-px h-6 bg-gray-600" />
            <div>
              <h1 className="font-cinzel text-xl">Events Management</h1>
              <p className="text-gray-300 text-sm">Manage the public calendar & homepage spotlight</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg hover:bg-gold-light transition-colors font-medium"
            >
              <Plus size={18} />
              New Event
            </button>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Calendar Visibility Banner */}
        <div className={`flex items-center justify-between gap-4 rounded-xl p-4 mb-6 border ${
          calendarVisible
            ? 'bg-green-50 border-green-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${calendarVisible ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`} />
            <div>
              <p className={`font-cinzel text-sm font-semibold ${calendarVisible ? 'text-green-800' : 'text-amber-800'}`}>
                Public Calendar is {calendarVisible ? 'Visible' : 'Hidden'}
              </p>
              <p className={`text-xs mt-0.5 ${calendarVisible ? 'text-green-600' : 'text-amber-600'}`}>
                {calendarVisible
                  ? 'The /events page is live and visible to all visitors.'
                  : 'The /events page is hidden — visitors see a "coming soon" message.'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleVisibility}
            disabled={togglingVisibility}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-cinzel transition-colors flex-shrink-0 ${
              togglingVisibility
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : calendarVisible
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {togglingVisibility ? 'Saving...' : calendarVisible ? 'Hide Calendar' : 'Make Visible'}
          </button>
        </div>

        {/* Event Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-cinzel text-xl text-navy">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Easter Sunday Service"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Join us for a special celebration..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventInput['category'] })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                  >
                    <option value="service">Service</option>
                    <option value="conference">Conference</option>
                    <option value="ministry">Ministry Event</option>
                    <option value="community">Community</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="Main Sanctuary"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {formData.image_url ? (
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                      <Image src={formData.image_url} alt="Event" fill className="object-cover" />
                      <button
                        onClick={() => setFormData({ ...formData, image_url: '' })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gold transition-colors"
                    >
                      {uploadingImage ? (
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                      ) : (
                        <>
                          <ImageIcon className="text-gray-400" size={32} />
                          <span className="text-gray-500 text-sm">Click to upload image</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration/Info URL</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="url"
                      value={formData.registration_url}
                      onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="https://example.com/register"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Learn More"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      placeholder="#c9a227"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1 = Highest)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (show on website)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Featured (show in spotlight)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="font-cinzel text-xl text-navy">All Events ({events.length})</h2>
            <p className="text-gray-500 text-sm mt-1">
              Active events appear on the public <strong>/events</strong> calendar. Starred events also show in the homepage spotlight.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">No events yet. Create your first event!</p>
            </div>
          ) : (
            <div className="divide-y">
              {events.map((event) => (
                <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex gap-4">
                    {/* Event Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {event.image_url ? (
                        <Image src={event.image_url} alt={event.title} width={96} height={96} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="text-gray-300" size={32} />
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-navy text-lg">{event.title}</h3>
                            {event.is_featured && <Star className="text-gold fill-gold" size={16} />}
                            {!event.is_active && <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Inactive</span>}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(event.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Priority {event.priority}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(event.id, event.is_active)}
                            className={`p-2 rounded-lg transition-colors ${
                              event.is_active
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={event.is_active ? 'Active' : 'Inactive'}
                          >
                            {event.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(event.id, event.is_featured)}
                            className={`p-2 rounded-lg transition-colors ${
                              event.is_featured
                                ? 'text-gold hover:bg-yellow-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={event.is_featured ? 'Featured' : 'Not Featured'}
                          >
                            <Star size={18} className={event.is_featured ? 'fill-current' : ''} />
                          </button>
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 text-navy hover:bg-navy-light/10 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id, event.title)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
