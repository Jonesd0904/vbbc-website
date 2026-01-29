'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { 
  Save, 
  Church, 
  Clock, 
  Users, 
  BookOpen, 
  Youtube,
  Lock,
  CheckCircle,
  AlertCircle,
  LogOut,
  ImageIcon,
  Upload,
  X
} from 'lucide-react'
import {
  getAllContent,
  updateContent,
  getServiceTimes,
  updateServiceTime,
  getStaff,
  updateStaffMember,
  getMinistries,
  updateMinistry,
  uploadImage,
  defaultContent,
  defaultServiceTimes,
  defaultStaff,
  defaultMinistries,
  ServiceTime,
  StaffMember,
  Ministry
} from '@/lib/content'
import { isSupabaseConfigured } from '@/lib/supabase'

type Tab = 'general' | 'services' | 'staff' | 'ministries' | 'scripture' | 'livestream' | 'images'

// Simple password - in production, use proper authentication!
const ADMIN_PASSWORD = 'vbbc2024'

// Image upload component
function ImageUploader({ 
  label, 
  currentImage, 
  imageKey,
  onUpload 
}: { 
  label: string
  currentImage: string
  imageKey: string
  onUpload: (key: string, url: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase
    setUploading(true)
    const fileName = `${imageKey}-${Date.now()}.${file.name.split('.').pop()}`
    const url = await uploadImage(file, fileName)
    
    if (url) {
      onUpload(imageKey, url)
    }
    setUploading(false)
  }

  const displayImage = preview || currentImage

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label}
      </label>
      
      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="w-40 h-28 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={label}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={32} />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              uploading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-navy text-white hover:bg-navy-light'
            }`}
          >
            {uploading ? (
              <>Uploading...</>
            ) : (
              <>
                <Upload size={16} />
                Change Image
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Recommended: JPG or PNG, max 2MB
          </p>
          {preview && (
            <button
              onClick={() => setPreview(null)}
              className="text-xs text-red-500 mt-1 flex items-center gap-1"
            >
              <X size={12} />
              Cancel preview
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [content, setContent] = useState<Record<string, string>>(defaultContent)
  const [serviceTimes, setServiceTimes] = useState<ServiceTime[]>(defaultServiceTimes)
  const [staff, setStaff] = useState<StaffMember[]>(defaultStaff)
  const [ministries, setMinistries] = useState<Ministry[]>(defaultMinistries)
  
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('vbbc_admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
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

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('vbbc_admin_auth')
  }

  const loadData = async () => {
    try {
      const [contentData, serviceData, staffData, ministryData] = await Promise.all([
        getAllContent(),
        getServiceTimes(),
        getStaff(),
        getMinistries()
      ])
      
      setContent(contentData)
      setServiceTimes(serviceData)
      setStaff(staffData)
      setMinistries(ministryData)
      
      // Check if Supabase is configured
      setIsSupabaseConnected(isSupabaseConfigured)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const handleContentChange = (key: string, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }))
  }

  const handleImageUpload = (key: string, url: string) => {
    setContent(prev => ({ ...prev, [key]: url }))
  }

  const handleServiceTimeChange = (index: number, field: keyof ServiceTime, value: string) => {
    setServiceTimes(prev => prev.map((st, i) => 
      i === index ? { ...st, [field]: value } : st
    ))
  }

  const handleStaffChange = (index: number, field: keyof StaffMember, value: string) => {
    setStaff(prev => prev.map((s, i) => 
      i === index ? { ...s, [field]: value } : s
    ))
  }

  const handleStaffImageUpload = async (index: number, file: File) => {
    const fileName = `staff-${index}-${Date.now()}.${file.name.split('.').pop()}`
    const url = await uploadImage(file, fileName)
    
    if (url) {
      setStaff(prev => prev.map((s, i) => 
        i === index ? { ...s, image_url: url } : s
      ))
    }
  }

  const handleMinistryChange = (index: number, field: keyof Ministry, value: string) => {
    setMinistries(prev => prev.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    ))
  }

  const saveChanges = async () => {
    setSaving(true)
    setSaveStatus('idle')
    
    try {
      // Save all content
      const contentPromises = Object.entries(content).map(([key, value]) => 
        updateContent(key, value)
      )
      
      const servicePromises = serviceTimes.map(st => updateServiceTime(st))
      const staffPromises = staff.map(s => updateStaffMember(s))
      const ministryPromises = ministries.map(m => updateMinistry(m))
      
      await Promise.all([
        ...contentPromises,
        ...servicePromises,
        ...staffPromises,
        ...ministryPromises
      ])
      
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving:', error)
      setSaveStatus('error')
    }
    
    setSaving(false)
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
            <h1 className="font-cinzel text-2xl text-navy">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Victory Bible Baptist Church</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-gold focus:border-transparent`}
                placeholder="Enter admin password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-2">Incorrect password</p>
              )}
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General Info', icon: <Church size={20} /> },
    { id: 'images', label: 'Images', icon: <ImageIcon size={20} /> },
    { id: 'services', label: 'Service Times', icon: <Clock size={20} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={20} /> },
    { id: 'ministries', label: 'Ministries', icon: <BookOpen size={20} /> },
    { id: 'scripture', label: 'Scripture', icon: <BookOpen size={20} /> },
    { id: 'livestream', label: 'Livestream', icon: <Youtube size={20} /> },
  ]

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Header */}
      <header className="bg-navy text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-cinzel text-xl">VBBC Admin Dashboard</h1>
            <p className="text-gray-300 text-sm">Manage your website content</p>
          </div>
          <div className="flex items-center gap-4">
            {!isSupabaseConnected && (
              <span className="text-yellow-300 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                Supabase not connected
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-navy text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Save Button */}
            <button
              onClick={saveChanges}
              disabled={saving}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel transition-colors ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gold text-navy hover:bg-gold-light'
              }`}
            >
              {saving ? (
                'Saving...'
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle size={20} />
                  Saved!
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle size={20} />
                  Error
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* General Info Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">General Information</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Church Name
                      </label>
                      <input
                        type="text"
                        value={content.church_name}
                        onChange={(e) => handleContentChange('church_name', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={content.church_tagline}
                        onChange={(e) => handleContentChange('church_tagline', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={content.church_address}
                        onChange={(e) => handleContentChange('church_address', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City, State ZIP
                      </label>
                      <input
                        type="text"
                        value={content.church_city}
                        onChange={(e) => handleContentChange('church_city', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={content.church_phone}
                      onChange={(e) => handleContentChange('church_phone', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                    />
                  </div>

                  <h3 className="font-cinzel text-lg text-navy border-b pb-2 pt-4">Social Media</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={content.facebook_url}
                        onChange={(e) => handleContentChange('facebook_url', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={content.youtube_url}
                        onChange={(e) => handleContentChange('youtube_url', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="https://youtube.com/yourchannel"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Website Images</h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-blue-800 text-sm">
                      <strong>Note:</strong> Image uploads require Supabase Storage. Make sure you have created an &quot;images&quot; bucket in your Supabase project with public access enabled.
                    </p>
                  </div>

                  <ImageUploader
                    label="Church Logo"
                    currentImage={content.image_logo || '/images/logo.png'}
                    imageKey="image_logo"
                    onUpload={handleImageUpload}
                  />

                  <ImageUploader
                    label="Church Building Photo"
                    currentImage={content.image_church_building || '/images/church-building.jpg'}
                    imageKey="image_church_building"
                    onUpload={handleImageUpload}
                  />

                  <ImageUploader
                    label="Rock Solid Background"
                    currentImage={content.image_rock_solid || '/images/rock-solid-bg.jpg'}
                    imageKey="image_rock_solid"
                    onUpload={handleImageUpload}
                  />

                  <h3 className="font-cinzel text-lg text-navy border-b pb-2 pt-4">Staff Photos</h3>
                  
                  {staff.map((person, index) => (
                    <div key={person.id} className="p-4 bg-gray-50 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        {person.name}
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
                          {person.image_url ? (
                            <Image
                              src={person.image_url}
                              alt={person.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Users size={32} />
                            </div>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id={`staff-image-${index}`}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleStaffImageUpload(index, file)
                            }}
                          />
                          <label
                            htmlFor={`staff-image-${index}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors cursor-pointer"
                          >
                            <Upload size={16} />
                            Upload Photo
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Square image recommended (e.g., 400x400)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Service Times Tab */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Service Times</h2>
                  
                  {serviceTimes.map((service, index) => (
                    <div key={service.id} className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Day
                        </label>
                        <input
                          type="text"
                          value={service.day}
                          onChange={(e) => handleServiceTimeChange(index, 'day', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Label
                        </label>
                        <input
                          type="text"
                          value={service.label}
                          onChange={(e) => handleServiceTimeChange(index, 'label', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time
                        </label>
                        <input
                          type="text"
                          value={service.time}
                          onChange={(e) => handleServiceTimeChange(index, 'time', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Staff Tab */}
              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Staff Members</h2>
                  
                  {staff.map((person, index) => (
                    <div key={person.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={person.name}
                            onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role
                          </label>
                          <input
                            type="text"
                            value={person.role}
                            onChange={(e) => handleStaffChange(index, 'role', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bio
                        </label>
                        <textarea
                          rows={6}
                          value={person.bio}
                          onChange={(e) => handleStaffChange(index, 'bio', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ministries Tab */}
              {activeTab === 'ministries' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Ministries</h2>
                  
                  {ministries.map((ministry, index) => (
                    <div key={ministry.id} className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ministry Name
                        </label>
                        <input
                          type="text"
                          value={ministry.title}
                          onChange={(e) => handleMinistryChange(index, 'title', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={ministry.description}
                          onChange={(e) => handleMinistryChange(index, 'description', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scripture Tab */}
              {activeTab === 'scripture' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Scripture & Verses</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Hero Section Verse</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verse Text
                      </label>
                      <textarea
                        rows={2}
                        value={content.hero_verse}
                        onChange={(e) => handleContentChange('hero_verse', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference
                      </label>
                      <input
                        type="text"
                        value={content.hero_verse_ref}
                        onChange={(e) => handleContentChange('hero_verse_ref', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Rock Solid Section Verse</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verse Text
                      </label>
                      <textarea
                        rows={2}
                        value={content.scripture_verse}
                        onChange={(e) => handleContentChange('scripture_verse', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reference
                      </label>
                      <input
                        type="text"
                        value={content.scripture_ref}
                        onChange={(e) => handleContentChange('scripture_ref', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Livestream Tab */}
              {activeTab === 'livestream' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Livestream Settings</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Facebook Live</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook Video/Live URL
                      </label>
                      <input
                        type="url"
                        value={content.facebook_live_url}
                        onChange={(e) => handleContentChange('facebook_live_url', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="https://www.facebook.com/yourpage/videos/123456789"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Paste the URL of your Facebook Live video or page
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">YouTube</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube Channel ID
                      </label>
                      <input
                        type="text"
                        value={content.youtube_channel_id}
                        onChange={(e) => handleContentChange('youtube_channel_id', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="UCxxxxxxxxxxxxxxxxxx"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Find this in your YouTube channel settings under &quot;Channel ID&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
