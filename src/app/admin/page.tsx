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
  X,
  FileAudio,
  ArrowRight,
  Heart,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import {
  getAllContent,
  updateContent,
  getServiceTimes,
  updateServiceTime,
  getStaff,
  updateStaffMember,
  deleteStaffMember,
  addStaffMember,
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
import RichTextEditor from '@/components/admin/RichTextEditor'

type Tab = 'general' | 'services' | 'staff' | 'ministries' | 'scripture' | 'livestream' | 'giving' | 'images'

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

// Ministry Card Component with expand/collapse
function MinistryCard({
  ministry,
  index,
  onChange,
  onImageUpload,
  onImageDelete,
  onCarouselToggle,
  onCarouselImageAdd,
  onCarouselImageRemove,
  onSave
}: {
  ministry: Ministry
  index: number
  onChange: (index: number, field: keyof Ministry, value: string) => void
  onImageUpload: (index: number, file: File) => Promise<void>
  onImageDelete: (index: number) => void
  onCarouselToggle: (index: number, enabled: boolean) => void
  onCarouselImageAdd: (index: number, file: File) => Promise<void>
  onCarouselImageRemove: (index: number, imageIndex: number) => void
  onSave: (index: number) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const carouselInputRef = useRef<HTMLInputElement>(null)
  const [uploadingMain, setUploadingMain] = useState(false)
  const [uploadingCarousel, setUploadingCarousel] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)
    await onSave(index)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingMain(true)
      await onImageUpload(index, file)
      setUploadingMain(false)
    }
  }

  const handleCarouselImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingCarousel(true)
      await onCarouselImageAdd(index, file)
      setUploadingCarousel(false)
    }
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
            {ministry.image_url ? (
              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                <Image src={ministry.image_url} alt={ministry.title} fill className="object-cover" />
              </div>
            ) : (
              <BookOpen className="text-gold" size={20} />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{ministry.title || 'New Ministry'}</h4>
            <p className="text-xs text-gray-500">
              {ministry.image_url && 'Has image'}
              {ministry.carousel_enabled && ` • Carousel (${ministry.carousel_images?.length || 0} images)`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Ministry Name & Icon */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ministry Name</label>
              <input
                type="text"
                value={ministry.title}
                onChange={(e) => onChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Ministry name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Type</label>
              <select
                value={ministry.icon}
                onChange={(e) => onChange(index, 'icon', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
              >
                <option value="users">Users</option>
                <option value="book">Book</option>
                <option value="music">Music</option>
                <option value="globe">Globe</option>
                <option value="heart">Heart</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <RichTextEditor
              value={ministry.description}
              onChange={(value) => onChange(index, 'description', value)}
              placeholder="Describe this ministry..."
              rows={4}
            />
          </div>

          {/* Main Image Upload */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Ministry Image</label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative group">
                {ministry.image_url ? (
                  <>
                    <Image src={ministry.image_url} alt={ministry.title} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => onImageDelete(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete image"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleMainImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingMain}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                    uploadingMain
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : 'bg-navy text-white hover:bg-navy-light'
                  }`}
                >
                  {uploadingMain ? (
                    'Uploading...'
                  ) : (
                    <>
                      <Upload size={14} />
                      {ministry.image_url ? 'Change Image' : 'Upload Image'}
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2">Landscape image (16:9) recommended</p>
              </div>
            </div>
          </div>

          {/* Carousel Feature */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Image Carousel</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={ministry.carousel_enabled || false}
                  onChange={(e) => onCarouselToggle(index, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
              </label>
            </div>
            
            {ministry.carousel_enabled && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">Add multiple images to display as a carousel on the ministries page.</p>
                
                {/* Carousel Images Grid */}
                {ministry.carousel_images && ministry.carousel_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {ministry.carousel_images.map((imageUrl, imageIndex) => (
                      <div key={imageIndex} className="relative group">
                        <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden relative">
                          <Image src={imageUrl} alt={`Carousel ${imageIndex + 1}`} fill className="object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => onCarouselImageRemove(index, imageIndex)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Carousel Image Button */}
                <div>
                  <input
                    type="file"
                    ref={carouselInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleCarouselImageAdd}
                  />
                  <button
                    type="button"
                    onClick={() => carouselInputRef.current?.click()}
                    disabled={uploadingCarousel}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                      uploadingCarousel
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-gold text-navy hover:bg-gold-light'
                    }`}
                  >
                    {uploadingCarousel ? (
                      'Uploading...'
                    ) : (
                      <>
                        <Plus size={14} />
                        Add Carousel Image
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                saveSuccess 
                  ? 'bg-green-500 text-white'
                  : saving
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gold text-navy hover:bg-gold-light'
              }`}
            >
              {saveSuccess ? (
                <><CheckCircle size={18} /> Saved!</>
              ) : saving ? (
                'Saving...'
              ) : (
                <><Save size={18} /> Save Ministry</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Staff Card Component with expand/collapse
function StaffCard({
  person,
  index,
  onChange,
  onImageUpload,
  onDelete,
  onSave,
  isOnly
}: {
  person: StaffMember
  index: number
  onChange: (index: number, field: keyof StaffMember, value: string) => void
  onImageUpload: (index: number, file: File) => void
  onDelete: (index: number) => void
  onSave: (index: number) => Promise<void>
  isOnly: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const isNew = person.id.startsWith('new-')

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setSaving(true)
    await onSave(index)
    setSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  return (
    <div className={`rounded-lg overflow-hidden border ${isNew ? 'border-gold bg-gold/5' : 'border-gray-200 bg-gray-50'}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden relative flex-shrink-0">
            {person.image_url ? (
              <Image src={person.image_url} alt={person.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Users size={20} />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{person.name || 'New Staff Member'}</h4>
            <p className="text-sm text-gray-500">{person.role || 'No role set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="text-xs bg-gold/20 text-gold-dark px-2 py-1 rounded font-medium">
              Unsaved
            </span>
          )}
          {!isOnly && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(true)
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete staff member"
            >
              <Trash2 size={18} />
            </button>
          )}
          {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </div>
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="p-4 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700 mb-3">Are you sure you want to delete {person.name || 'this staff member'}?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDelete(index)}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      {expanded && !confirmDelete && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {/* Photo Upload */}
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0 relative">
              {person.image_url ? (
                <Image src={person.image_url} alt={person.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Users size={32} />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                id={`staff-img-${index}`}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload(index, file)
                }}
              />
              <label
                htmlFor={`staff-img-${index}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-light transition-colors cursor-pointer text-sm"
              >
                <Upload size={14} />
                Upload Photo
              </label>
              <p className="text-xs text-gray-500 mt-2">Square image (400x400) recommended</p>
            </div>
          </div>

          {/* Name & Role */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={person.name}
                onChange={(e) => onChange(index, 'name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role/Title</label>
              <input
                type="text"
                value={person.role}
                onChange={(e) => onChange(index, 'role', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="e.g., Senior Pastor"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <RichTextEditor
              value={person.bio}
              onChange={(value) => onChange(index, 'bio', value)}
              placeholder="Write a biography for this staff member..."
              rows={8}
            />
          </div>

          {/* Save Button for new staff */}
          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                saveSuccess 
                  ? 'bg-green-500 text-white'
                  : saving
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gold text-navy hover:bg-gold-light'
              }`}
            >
              {saveSuccess ? (
                <><CheckCircle size={18} /> Saved!</>
              ) : saving ? (
                'Saving...'
              ) : (
                <><Save size={18} /> {isNew ? 'Save Staff Member' : 'Save Changes'}</>
              )}
            </button>
          </div>
        </div>
      )}
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
    const fileName = `staff-${Date.now()}.${file.name.split('.').pop()}`
    const url = await uploadImage(file, fileName)
    
    if (url) {
      setStaff(prev => prev.map((s, i) => 
        i === index ? { ...s, image_url: url } : s
      ))
    }
  }

  const [addingStaff, setAddingStaff] = useState(false)

  const handleAddStaff = () => {
    // Prevent double-adds
    if (addingStaff) return
    setAddingStaff(true)
    
    const newStaff: StaffMember = {
      id: `new-${Date.now()}`,
      name: '',
      role: '',
      bio: '',
      image_url: '',
      order_index: staff.length + 1
    }
    setStaff(prev => [...prev, newStaff])
    
    // Reset after a short delay
    setTimeout(() => setAddingStaff(false), 500)
  }

  const handleDeleteStaff = async (index: number) => {
    const staffToDelete = staff[index]
    
    // If it's a saved staff member (has real ID), delete from database
    if (staffToDelete.id && !staffToDelete.id.startsWith('new-')) {
      await deleteStaffMember(staffToDelete.id)
    }
    
    // Remove from local state
    setStaff(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveStaff = async (index: number) => {
    const staffMember = staff[index]
    const result = await updateStaffMember({ ...staffMember, order_index: index + 1 })
    
    if (result) {
      // Update local state with the real ID from database
      setStaff(prev => prev.map((s, i) => 
        i === index ? result : s
      ))
    }
  }

  const handleMinistryChange = (index: number, field: keyof Ministry, value: string) => {
    setMinistries(prev => prev.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    ))
  }

  const handleMinistryImageUpload = async (index: number, file: File) => {
    const fileName = `ministry-${Date.now()}.${file.name.split('.').pop()}`
    const url = await uploadImage(file, fileName)
    
    if (url) {
      setMinistries(prev => prev.map((m, i) => 
        i === index ? { ...m, image_url: url } : m
      ))
    }
  }

  const handleMinistryImageDelete = (index: number) => {
    setMinistries(prev => prev.map((m, i) => 
      i === index ? { ...m, image_url: '' } : m
    ))
  }

  const handleMinistryCarouselToggle = (index: number, enabled: boolean) => {
    setMinistries(prev => prev.map((m, i) => 
      i === index ? { ...m, carousel_enabled: enabled, carousel_images: enabled ? (m.carousel_images || []) : [] } : m
    ))
  }

  const handleMinistryCarouselImageAdd = async (index: number, file: File) => {
    const fileName = `ministry-carousel-${Date.now()}.${file.name.split('.').pop()}`
    const url = await uploadImage(file, fileName)
    
    if (url) {
      setMinistries(prev => prev.map((m, i) => {
        if (i === index) {
          const currentImages = m.carousel_images || []
          return { ...m, carousel_images: [...currentImages, url] }
        }
        return m
      }))
    }
  }

  const handleMinistryCarouselImageRemove = (index: number, imageIndex: number) => {
    setMinistries(prev => prev.map((m, i) => {
      if (i === index && m.carousel_images) {
        return { ...m, carousel_images: m.carousel_images.filter((_, imgIdx) => imgIdx !== imageIndex) }
      }
      return m
    }))
  }

  const handleSaveMinistry = async (index: number) => {
    const ministry = ministries[index]
    await updateMinistry(ministry)
  }

  const saveChanges = async () => {
    setSaving(true)
    setSaveStatus('idle')
    
    try {
      const contentPromises = Object.entries(content).map(([key, value]) => 
        updateContent(key, value)
      )
      
      const servicePromises = serviceTimes.map(st => updateServiceTime(st))
      
      // Handle staff members - need to update state with real IDs for new members
      const updatedStaff: StaffMember[] = []
      for (let i = 0; i < staff.length; i++) {
        const s = staff[i]
        const result = await updateStaffMember({ ...s, order_index: i + 1 })
        if (result) {
          updatedStaff.push(result)
        } else {
          // Keep original if update failed
          updatedStaff.push(s)
        }
      }
      // Update local state with real IDs
      setStaff(updatedStaff)
      
      const ministryPromises = ministries.map(m => updateMinistry(m))
      
      await Promise.all([
        ...contentPromises,
        ...servicePromises,
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-gold focus:border-transparent`}
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

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General Info', icon: <Church size={20} /> },
    { id: 'images', label: 'Images', icon: <ImageIcon size={20} /> },
    { id: 'services', label: 'Service Times', icon: <Clock size={20} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={20} /> },
    { id: 'ministries', label: 'Ministries', icon: <BookOpen size={20} /> },
    { id: 'scripture', label: 'Scripture', icon: <BookOpen size={20} /> },
    { id: 'livestream', label: 'Livestream', icon: <Youtube size={20} /> },
    { id: 'giving', label: 'Giving', icon: <Heart size={20} /> },
  ]

  const SermonImportCard = () => (
    <Link 
      href="/admin/sermons"
      className="block bg-gradient-to-br from-navy to-navy-light rounded-xl p-6 text-white hover:shadow-lg transition-all group mt-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <FileAudio className="text-gold" size={24} />
        </div>
        <ArrowRight className="text-white/60 group-hover:text-gold group-hover:translate-x-1 transition-all" size={24} />
      </div>
      <h3 className="font-cinzel text-lg mb-2">Sermon Import</h3>
      <p className="text-gray-300 text-sm">Bulk import sermons with AI-powered summaries</p>
    </Link>
  )

  const EventsCard = () => (
    <Link 
      href="/admin/events"
      className="block bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-6 text-white hover:shadow-lg transition-all group mt-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
          <Calendar className="text-gold" size={24} />
        </div>
        <ArrowRight className="text-white/60 group-hover:text-gold group-hover:translate-x-1 transition-all" size={24} />
      </div>
      <h3 className="font-cinzel text-lg mb-2">Event Spotlight</h3>
      <p className="text-gray-300 text-sm">Manage featured events on homepage portal</p>
    </Link>
  )

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
                    activeTab === tab.id ? 'bg-navy text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <SermonImportCard />
            <EventsCard />

            {/* Save Button */}
            <button
              onClick={saveChanges}
              disabled={saving}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl font-cinzel transition-colors ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gold text-navy hover:bg-gold-light'
              }`}
            >
              {saving ? 'Saving...' : saveStatus === 'success' ? (
                <><CheckCircle size={20} /> Saved!</>
              ) : saveStatus === 'error' ? (
                <><AlertCircle size={20} /> Error</>
              ) : (
                <><Save size={20} /> Save Changes</>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Church Name</label>
                      <input
                        type="text"
                        value={content.church_name}
                        onChange={(e) => handleContentChange('church_name', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <input
                        type="text"
                        value={content.church_address}
                        onChange={(e) => handleContentChange('church_address', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City, State ZIP</label>
                      <input
                        type="text"
                        value={content.church_city}
                        onChange={(e) => handleContentChange('church_city', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                      <input
                        type="url"
                        value={content.facebook_url}
                        onChange={(e) => handleContentChange('facebook_url', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
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

              {/* Staff Tab */}
              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h2 className="font-cinzel text-xl text-navy">Staff Members</h2>
                    <button
                      type="button"
                      onClick={handleAddStaff}
                      className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-lg hover:bg-gold-light transition-colors font-medium text-sm"
                    >
                      <Plus size={18} />
                      Add Staff Member
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Tip:</strong> Use the rich text editor to format biographies with <strong>bold</strong>, <em>italic</em>, lists, and links. 
                      You can also add images directly into the bio text.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {staff.map((person, index) => (
                      <StaffCard
                        key={person.id}
                        person={person}
                        index={index}
                        onChange={handleStaffChange}
                        onImageUpload={handleStaffImageUpload}
                        onDelete={handleDeleteStaff}
                        onSave={handleSaveStaff}
                        isOnly={staff.length === 1}
                      />
                    ))}
                  </div>

                  {staff.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No staff members yet.</p>
                      <button
                        type="button"
                        onClick={handleAddStaff}
                        className="mt-4 text-gold hover:underline"
                      >
                        Add your first staff member
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ministries Tab */}
              {activeTab === 'ministries' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Ministries</h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Tip:</strong> Upload a main image for each ministry. You can also enable a carousel to show multiple images that visitors can browse through on the ministries page.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {ministries.map((ministry, index) => (
                      <MinistryCard
                        key={ministry.id}
                        ministry={ministry}
                        index={index}
                        onChange={handleMinistryChange}
                        onImageUpload={handleMinistryImageUpload}
                        onImageDelete={handleMinistryImageDelete}
                        onCarouselToggle={handleMinistryCarouselToggle}
                        onCarouselImageAdd={handleMinistryCarouselImageAdd}
                        onCarouselImageRemove={handleMinistryCarouselImageRemove}
                        onSave={handleSaveMinistry}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Scripture Tab */}
              {activeTab === 'scripture' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Scripture & Verses</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Hero Section Verse</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verse Text</label>
                      <textarea
                        rows={2}
                        value={content.hero_verse}
                        onChange={(e) => handleContentChange('hero_verse', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Verse Text</label>
                      <textarea
                        rows={2}
                        value={content.scripture_verse}
                        onChange={(e) => handleContentChange('scripture_verse', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
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

              {/* Service Times Tab */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Service Times</h2>
                  
                  {serviceTimes.map((service, index) => (
                    <div key={service.id} className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                        <input
                          type="text"
                          value={service.day}
                          onChange={(e) => handleServiceTimeChange(index, 'day', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={service.label}
                          onChange={(e) => handleServiceTimeChange(index, 'label', e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
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

              {/* Livestream Tab */}
              {activeTab === 'livestream' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Livestream Settings</h2>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Facebook Live</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Video/Live URL</label>
                      <input
                        type="url"
                        value={content.facebook_live_url}
                        onChange={(e) => handleContentChange('facebook_live_url', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="https://www.facebook.com/yourpage/videos/123456789"
                      />
                      <p className="text-sm text-gray-500 mt-1">Paste the URL of your Facebook Live video or page</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">YouTube</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Channel ID</label>
                      <input
                        type="text"
                        value={content.youtube_channel_id}
                        onChange={(e) => handleContentChange('youtube_channel_id', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="UCxxxxxxxxxxxxxxxxxx"
                      />
                      <p className="text-sm text-gray-500 mt-1">Find this in your YouTube channel settings under &quot;Channel ID&quot;</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Giving Tab */}
              {activeTab === 'giving' && (
                <div className="space-y-6">
                  <h2 className="font-cinzel text-xl text-navy border-b pb-3">Online Giving Settings</h2>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Tithe.ly Integration:</strong> To enable online giving, you&apos;ll need a Tithe.ly account. 
                      Sign up at <a href="https://tithe.ly" target="_blank" rel="noopener noreferrer" className="underline">tithe.ly</a> and 
                      get your Form ID from your Giving Form settings.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Enable Online Giving</h3>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={content.giving_enabled === 'true'}
                          onChange={(e) => handleContentChange('giving_enabled', e.target.checked ? 'true' : 'false')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                      </label>
                      <span className="text-sm text-gray-700">
                        {content.giving_enabled === 'true' ? 'Giving form is visible on the website' : 'Giving form is hidden'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Tithe.ly Configuration</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tithe.ly Form ID <span className="text-gray-400">(Recommended)</span>
                      </label>
                      <input
                        type="text"
                        value={content.tithely_form_id || ''}
                        onChange={(e) => handleContentChange('tithely_form_id', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="a1ca4c5d-6865-11ee-90fc-1260ab546d11"
                      />
                      <p className="text-sm text-gray-500 mt-1">Find this in Tithe.ly → Giving → Giving Form</p>
                    </div>

                    <div className="border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tithe.ly Church ID <span className="text-gray-400">(Alternative)</span>
                      </label>
                      <input
                        type="text"
                        value={content.tithely_church_id || ''}
                        onChange={(e) => handleContentChange('tithely_church_id', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent"
                        placeholder="123456"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-semibold text-gray-700">Giving Page Content</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                      <RichTextEditor
                        value={content.giving_message || ''}
                        onChange={(value) => handleContentChange('giving_message', value)}
                        placeholder="Your generous giving supports our church ministries..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {content.giving_enabled === 'true' && (content.tithely_form_id || content.tithely_church_id) && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">✓ Giving is Active</h3>
                      <p className="text-green-700 text-sm">
                        Your online giving form will be displayed on the <a href="/giving" target="_blank" className="underline">/giving</a> page.
                      </p>
                    </div>
                  )}
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
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
