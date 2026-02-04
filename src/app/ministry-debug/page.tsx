'use client'

import { useEffect, useState } from 'react'
import { getMinistries, Ministry } from '@/lib/content'

export default function MinistryDebugPage() {
  const [ministries, setMinistries] = useState<Ministry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await getMinistries()
      setMinistries(data)
      setLoading(false)
      console.log('Ministries data:', data)
    }
    load()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ministry Debug Info</h1>
        
        {ministries.map((ministry, index) => (
          <div key={ministry.id} className="bg-white rounded-lg p-6 mb-4 shadow">
            <h2 className="text-xl font-bold mb-4">#{index + 1}: {ministry.title}</h2>
            
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <strong>ID:</strong>
                <span className="font-mono">{ministry.id}</span>
                
                <strong>Has image_url:</strong>
                <span className={ministry.image_url ? 'text-green-600' : 'text-red-600'}>
                  {ministry.image_url ? 'YES' : 'NO'}
                </span>
                
                <strong>Image URL:</strong>
                <span className="font-mono text-xs break-all">
                  {ministry.image_url || '(empty)'}
                </span>
                
                <strong>Carousel Enabled:</strong>
                <span className={ministry.carousel_enabled ? 'text-green-600' : 'text-gray-600'}>
                  {ministry.carousel_enabled ? 'YES' : 'NO'}
                </span>
                
                <strong>Carousel Images Count:</strong>
                <span>{ministry.carousel_images?.length || 0}</span>
              </div>

              {ministry.carousel_images && ministry.carousel_images.length > 0 && (
                <div className="mt-4">
                  <strong>Carousel Image URLs:</strong>
                  <ul className="list-disc list-inside font-mono text-xs mt-2">
                    {ministry.carousel_images.map((url, i) => (
                      <li key={i} className="break-all">{url}</li>
                    ))}
                  </ul>
                </div>
              )}

              {ministry.image_url && (
                <div className="mt-4">
                  <strong>Image Preview:</strong>
                  <img 
                    src={ministry.image_url} 
                    alt={ministry.title}
                    className="w-64 h-48 object-cover rounded mt-2"
                    onError={(e) => {
                      e.currentTarget.src = ''
                      e.currentTarget.alt = 'Failed to load image'
                      e.currentTarget.className = 'w-64 h-48 bg-red-100 flex items-center justify-center rounded mt-2'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold mb-2">🔍 What to check:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>If &quot;Has image_url&quot; is NO, the image wasn&apos;t saved - click &quot;Save Ministry&quot; in admin</li>
            <li>If &quot;Has image_url&quot; is YES but preview fails, check Supabase Storage permissions</li>
            <li>Image URLs should start with your Supabase project URL</li>
            <li>If data looks old, try hard refresh (Ctrl+Shift+R)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
