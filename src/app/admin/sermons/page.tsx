'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  Trash2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  FileAudio,
  Youtube,
  BookOpen,
  Calendar,
  User,
  Edit,
  FolderOpen,
  ImageIcon,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lock,
  Link as LinkIcon,
  Music,
  ExternalLink,
  FileText,
  ClipboardPaste,
} from 'lucide-react'
import {
  getSermonSeries,
  SermonSeries,
  SermonWithAI,
  createSermon,
  bulkCreateSermons,
  initializeSermonSeries,
  upsertSermonSeries,
  uploadSeriesImage,
  uploadSermonAudio,
  defaultSermonSeries,
} from '@/lib/sermons'
import { isSupabaseConfigured, supabase, Sermon } from '@/lib/supabase'
import { compressAudio, needsCompression, formatFileSize } from '@/lib/audioCompression'
import * as musicMetadata from 'music-metadata-browser'

type Tab = 'import' | 'series' | 'manage'
type AudioSourceType = 'youtube' | 'mp3_upload' | 'external_link'

const ADMIN_PASSWORD = 'vbbc2024'

// AI Summary Generator Component
function AISummaryGenerator({
  sermon,
  onSummaryGenerated,
}: {
  sermon: SermonWithAI
  onSummaryGenerated: (theme: string, keyPoints: string[], description: string) => void
}) {
  const [generating, setGenerating] = useState(false)

  const generateSummary = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sermon.title,
          scripture: sermon.scripture,
          series: sermon.series,
          speaker: sermon.speaker,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }

      const data = await response.json()
      onSummaryGenerated(data.theme, data.keyPoints, data.description)
    } catch (err) {
      const fallbackTheme = sermon.scripture 
        ? `A study from ${sermon.scripture}` 
        : `Exploring "${sermon.title}"`
      
      const fallbackKeyPoints = [
        'Understanding the biblical context',
        'Practical application for daily life',
        'Growing in faith through God\'s Word',
      ]
      
      const fallbackDescription = sermon.scripture
        ? `In this message from ${sermon.series || 'our sermon series'}, ${sermon.speaker} explores ${sermon.scripture}, sharing insights for spiritual growth.`
        : `${sermon.speaker} presents "${sermon.title}" with biblical teaching and practical application.`

      onSummaryGenerated(fallbackTheme, fallbackKeyPoints, fallbackDescription)
    }

    setGenerating(false)
  }

  return (
    <button
      onClick={generateSummary}
      disabled={generating}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
        generating
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      }`}
    >
      {generating ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Sparkles size={14} />
      )}
      {generating ? 'Generating...' : 'AI Summary'}
    </button>
  )
}

// Bulk Import Component
interface ParsedSermon {
  date: string
  title: string
  scripture: string
}

function BulkImportPanel({
  onImport,
  defaultSpeaker,
}: {
  onImport: (sermons: SermonWithAI[]) => void
  defaultSpeaker: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [inputText, setInputText] = useState('')
  const [parsedSermons, setParsedSermons] = useState<ParsedSermon[]>([])
  const [speaker, setSpeaker] = useState(defaultSpeaker)
  const [parseError, setParseError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse date from various formats
  const parseDate = (dateStr: string): string => {
    // Clean up the string
    dateStr = dateStr.trim()
    
    // Try various date formats
    const formats = [
      // MM/DD/YYYY or MM-DD-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // YYYY-MM-DD (ISO)
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // Month DD, YYYY
      /^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/,
      // DD Month YYYY
      /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/,
    ]

    // MM/DD/YYYY format
    let match = dateStr.match(formats[0])
    if (match) {
      const [, month, day, year] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }

    // ISO format (already correct)
    match = dateStr.match(formats[1])
    if (match) {
      return dateStr
    }

    // Month DD, YYYY
    match = dateStr.match(formats[2])
    if (match) {
      const [, monthName, day, year] = match
      const monthNum = getMonthNumber(monthName)
      if (monthNum) {
        return `${year}-${monthNum}-${day.padStart(2, '0')}`
      }
    }

    // DD Month YYYY
    match = dateStr.match(formats[3])
    if (match) {
      const [, day, monthName, year] = match
      const monthNum = getMonthNumber(monthName)
      if (monthNum) {
        return `${year}-${monthNum}-${day.padStart(2, '0')}`
      }
    }

    // Fallback: try JavaScript Date parsing
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }

    return ''
  }

  const getMonthNumber = (monthName: string): string | null => {
    const months: Record<string, string> = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09', 'sept': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12',
    }
    return months[monthName.toLowerCase()] || null
  }

  // Parse scripture reference from title or separate field
  const extractScripture = (text: string): { title: string; scripture: string } => {
    // Common scripture patterns
    const scripturePatterns = [
      // "Title - Scripture" or "Title | Scripture"
      /^(.+?)\s*[-|]\s*([1-3]?\s*[A-Za-z]+\.?\s+\d+[:\-\d,\s]*)/,
      // Scripture at end in parentheses "Title (Scripture)"
      /^(.+?)\s*\(([1-3]?\s*[A-Za-z]+\.?\s+\d+[:\-\d,\s]*)\)$/,
      // Scripture pattern anywhere: "Book Chapter:Verse"
      /([1-3]?\s*[A-Za-z]+\.?\s+\d+:\d+[\-\d,]*)/,
    ]

    // Try pattern with separator
    let match = text.match(scripturePatterns[0])
    if (match) {
      return { title: match[1].trim(), scripture: match[2].trim() }
    }

    // Try parentheses pattern
    match = text.match(scripturePatterns[1])
    if (match) {
      return { title: match[1].trim(), scripture: match[2].trim() }
    }

    // Check if just scripture reference at end (after title)
    match = text.match(scripturePatterns[2])
    if (match) {
      const scriptureRef = match[1]
      const titlePart = text.replace(scriptureRef, '').trim().replace(/[-|]\s*$/, '').trim()
      if (titlePart.length > 5) {
        return { title: titlePart, scripture: scriptureRef.trim() }
      }
    }

    return { title: text.trim(), scripture: '' }
  }

  // Parse input text (CSV or line-based)
  const parseInput = (text: string) => {
    setParseError('')
    const lines = text.trim().split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      setParsedSermons([])
      return
    }

    const results: ParsedSermon[] = []
    
    // Detect format: CSV (comma or tab separated) vs line-based
    const firstLine = lines[0]
    const isCSV = firstLine.includes(',') || firstLine.includes('\t')
    const separator = firstLine.includes('\t') ? '\t' : ','

    // Check if first line is a header
    const headerKeywords = ['date', 'title', 'scripture', 'sermon', 'reference', 'passage']
    const isHeader = headerKeywords.some(kw => firstLine.toLowerCase().includes(kw))
    const startIndex = isHeader ? 1 : 0

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      let date = ''
      let title = ''
      let scripture = ''

      if (isCSV) {
        // CSV format: expect Date, Title, Scripture (in various orders)
        const parts = line.split(separator).map(p => p.trim().replace(/^"|"$/g, ''))
        
        if (parts.length >= 2) {
          // Try to identify which column is what
          for (const part of parts) {
            const parsedDate = parseDate(part)
            if (parsedDate && !date) {
              date = parsedDate
            } else if (!title && part.length > 3 && !parsedDate) {
              // Check if it's a scripture reference
              if (/^[1-3]?\s*[A-Za-z]+\.?\s+\d+/.test(part)) {
                scripture = part
              } else {
                title = part
              }
            } else if (!scripture && /^[1-3]?\s*[A-Za-z]+\.?\s+\d+/.test(part)) {
              scripture = part
            } else if (!title && part.length > 3) {
              title = part
            }
          }
        }
      } else {
        // Line-based: try to extract date from beginning
        // Format might be: "MM/DD/YYYY Title - Scripture" or "Date: Title (Scripture)"
        const dateMatch = line.match(/^([\d\/\-]+|[A-Za-z]+\s+\d+,?\s+\d{4})\s*[:\-]?\s*/)
        
        if (dateMatch) {
          date = parseDate(dateMatch[1])
          const remainder = line.substring(dateMatch[0].length)
          const extracted = extractScripture(remainder)
          title = extracted.title
          scripture = extracted.scripture
        } else {
          // No clear date, try to extract title and scripture
          const extracted = extractScripture(line)
          title = extracted.title
          scripture = extracted.scripture
        }
      }

      // If we found at least a title, add it
      if (title) {
        results.push({ date, title, scripture })
      }
    }

    if (results.length === 0) {
      setParseError('Could not parse any sermons from the input. Try a different format.')
    }

    setParsedSermons(results)
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setInputText(text)
      parseInput(text)
    }
    reader.readAsText(file)
  }

  // Import parsed sermons
  const handleImport = () => {
    const sermonsToImport: SermonWithAI[] = parsedSermons.map(ps => ({
      title: ps.title,
      speaker: speaker,
      date: ps.date || new Date().toISOString().split('T')[0],
      scripture: ps.scripture,
      series: '',
      description: '',
      youtube_url: '',
      audio_url: '',
    }))

    onImport(sermonsToImport)
    setInputText('')
    setParsedSermons([])
    setExpanded(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <ClipboardPaste className="text-purple-600" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-navy">Bulk Import from Text/CSV</h3>
            <p className="text-sm text-gray-500">Paste sermon data or upload a CSV file</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4 border-t">
          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2"><strong>Supported formats:</strong></p>
            <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
              <li>CSV: Date, Title, Scripture (columns in any order)</li>
              <li>Tab-separated: Date &lt;tab&gt; Title &lt;tab&gt; Scripture</li>
              <li>Line format: <code className="bg-gray-200 px-1 rounded">01/15/2024 Sermon Title - John 3:16</code></li>
              <li>Or just titles: <code className="bg-gray-200 px-1 rounded">Walking by Faith (Hebrews 11:1-6)</code></li>
            </ul>
          </div>

          {/* Default Speaker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Speaker for Imported Sermons
            </label>
            <select
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            >
              <option value="Pastor John Seydlitz">Pastor John Seydlitz</option>
              <option value="Dr. Chris Shepler">Dr. Chris Shepler</option>
              <option value="Guest Speaker">Guest Speaker</option>
            </select>
          </div>

          {/* Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Paste Data or Upload File</label>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.txt,.tsv"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                >
                  <FileText size={14} />
                  Upload CSV
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                parseInput(e.target.value)
              }}
              placeholder={`Paste your sermon data here...\n\nExamples:\n01/15/2024, Walking by Faith, Hebrews 11:1-6\n01/22/2024, The Power of Prayer, James 5:13-18\n\nOr:\nJanuary 15, 2024 - Walking by Faith (Hebrews 11:1-6)\nJanuary 22, 2024 - The Power of Prayer (James 5:13-18)`}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm font-mono"
            />
          </div>

          {/* Error Message */}
          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{parseError}</p>
            </div>
          )}

          {/* Preview */}
          {parsedSermons.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Preview: {parsedSermons.length} sermon{parsedSermons.length !== 1 ? 's' : ''} found
                </span>
                <span className="text-xs text-gray-500">Speaker: {speaker}</span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Date</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Title</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Scripture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {parsedSermons.map((sermon, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-gray-600">
                          {sermon.date || <span className="text-yellow-600 italic">Not found</span>}
                        </td>
                        <td className="px-4 py-2 text-navy font-medium">{sermon.title}</td>
                        <td className="px-4 py-2 text-gold">
                          {sermon.scripture || <span className="text-gray-400">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Button */}
          {parsedSermons.length > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImport}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={18} />
                Import {parsedSermons.length} Sermon{parsedSermons.length !== 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Batch Audio Upload Component
interface AudioFileItem {
  id: string
  file: File
  title: string
  speaker: string
  date: string
  scripture: string
  status: 'pending' | 'reading' | 'compressing' | 'uploading' | 'generating' | 'saving' | 'complete' | 'error'
  progress: number
  statusText: string
  audioUrl?: string
  description?: string
  error?: string
}

function BatchAudioUpload({
  onComplete,
}: {
  onComplete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [files, setFiles] = useState<AudioFileItem[]>([])
  const [speaker, setSpeaker] = useState('Pastor John Seydlitz')
  const [processing, setProcessing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Read metadata from audio file
  const readMetadata = async (file: File): Promise<{ title: string; date: string; artist: string }> => {
    try {
      const metadata = await musicMetadata.parseBlob(file)
      const common = metadata.common
      
      // Try to get date from various tags
      let date = ''
      if (common.year) {
        date = `${common.year}-01-01`
      }
      if (common.date) {
        // Try to parse the date
        const parsed = new Date(common.date)
        if (!isNaN(parsed.getTime())) {
          date = parsed.toISOString().split('T')[0]
        }
      }
      
      return {
        title: common.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        date: date || new Date().toISOString().split('T')[0],
        artist: common.artist || '',
      }
    } catch (error) {
      console.error('Error reading metadata:', error)
      // Fallback: use filename
      return {
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        date: new Date().toISOString().split('T')[0],
        artist: '',
      }
    }
  }

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return
    
    // Limit to 10 files
    const filesToProcess = selectedFiles.slice(0, 10)
    
    const newFiles: AudioFileItem[] = []
    
    for (const file of filesToProcess) {
      const metadata = await readMetadata(file)
      newFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        title: metadata.title,
        speaker: speaker,
        date: metadata.date,
        scripture: '',
        status: 'pending',
        progress: 0,
        statusText: `Ready (${formatFileSize(file.size)})`,
      })
    }
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Update a specific file
  const updateFile = (id: string, updates: Partial<AudioFileItem>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // Generate AI summary for a sermon
  const generateSummary = async (title: string, scripture: string, sermonSpeaker: string): Promise<string> => {
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, scripture, speaker: sermonSpeaker }),
      })
      
      if (!response.ok) throw new Error('Failed to generate summary')
      
      const data = await response.json()
      return data.description || `${sermonSpeaker} presents "${title}" with biblical teaching and practical application.`
    } catch (error) {
      // Fallback description
      return scripture
        ? `In this message, ${sermonSpeaker} explores ${scripture}, sharing insights for spiritual growth.`
        : `${sermonSpeaker} presents "${title}" with biblical teaching and practical application.`
    }
  }

  // Process all files
  const processAllFiles = async () => {
    setProcessing(true)
    
    const pendingFiles = files.filter(f => f.status === 'pending')
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileItem = pendingFiles[i]
      setCurrentIndex(i)
      
      try {
        // Step 1: Reading metadata
        updateFile(fileItem.id, { status: 'reading', progress: 10, statusText: 'Reading file metadata...' })
        await new Promise(resolve => setTimeout(resolve, 300)) // Small delay for UI
        
        // Step 2: Compress if needed
        let fileToUpload = fileItem.file
        if (needsCompression(fileItem.file, 40)) {
          updateFile(fileItem.id, { status: 'compressing', progress: 20, statusText: 'Compressing audio...' })
          
          fileToUpload = await compressAudio(fileItem.file, {
            targetBitrate: 64,
            mono: true,
            onProgress: (prog, status) => {
              updateFile(fileItem.id, { 
                progress: 20 + Math.round(prog * 0.4), // 20-60%
                statusText: status 
              })
            }
          })
        }
        
        // Step 3: Upload to Supabase
        updateFile(fileItem.id, { status: 'uploading', progress: 65, statusText: 'Uploading to storage...' })
        
        const audioUrl = await uploadSermonAudio(fileToUpload, fileItem.title)
        if (!audioUrl) {
          throw new Error('Failed to upload audio file')
        }
        
        updateFile(fileItem.id, { audioUrl, progress: 80 })
        
        // Step 4: Generate AI summary
        updateFile(fileItem.id, { status: 'generating', progress: 85, statusText: 'Generating AI summary...' })
        
        const description = await generateSummary(fileItem.title, fileItem.scripture, fileItem.speaker)
        updateFile(fileItem.id, { description, progress: 90 })
        
        // Step 5: Save to database
        updateFile(fileItem.id, { status: 'saving', progress: 95, statusText: 'Saving to database...' })
        
        const sermonData: SermonWithAI = {
          title: fileItem.title,
          speaker: fileItem.speaker,
          date: fileItem.date,
          scripture: fileItem.scripture,
          description: description,
          audio_url: audioUrl,
          youtube_url: '',
        }
        
        await createSermon(sermonData)
        
        // Complete!
        updateFile(fileItem.id, { 
          status: 'complete', 
          progress: 100, 
          statusText: '✓ Saved to database!' 
        })
        
      } catch (error) {
        console.error('Error processing file:', error)
        updateFile(fileItem.id, { 
          status: 'error', 
          progress: 0, 
          statusText: 'Error processing file',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    setProcessing(false)
    setCurrentIndex(-1)
    
    // Refresh the sermon list
    onComplete()
  }

  const pendingCount = files.filter(f => f.status === 'pending').length
  const completedCount = files.filter(f => f.status === 'complete').length
  const errorCount = files.filter(f => f.status === 'error').length

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Upload className="text-green-600" size={20} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-navy">Batch Audio Upload</h3>
            <p className="text-sm text-gray-500">Upload multiple MP3 files with automatic metadata extraction</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4 border-t">
          {/* Instructions */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-sm text-green-800 mb-2"><strong>How it works:</strong></p>
            <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
              <li>Select up to 10 MP3 files at once</li>
              <li>Metadata (title, date) is read automatically from ID3 tags</li>
              <li>Large files are compressed automatically</li>
              <li>AI generates descriptions for each sermon</li>
              <li>All sermons are saved directly to the database</li>
            </ul>
          </div>

          {/* Speaker Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Speaker for All Uploads
            </label>
            <select
              value={speaker}
              onChange={(e) => {
                setSpeaker(e.target.value)
                // Update all pending files
                setFiles(prev => prev.map(f => 
                  f.status === 'pending' ? { ...f, speaker: e.target.value } : f
                ))
              }}
              disabled={processing}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
            >
              <option value="Pastor John Seydlitz">Pastor John Seydlitz</option>
              <option value="Dr. Chris Shepler">Dr. Chris Shepler</option>
              <option value="Guest Speaker">Guest Speaker</option>
            </select>
          </div>

          {/* File Input */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,.mp3,.wav,.m4a"
              multiple
              disabled={processing || files.length >= 10}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing || files.length >= 10}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileAudio size={24} className="text-green-500" />
              <div className="text-left">
                <span className="text-green-700 font-medium">Click to select audio files</span>
                <span className="text-gray-500 text-sm block">MP3, WAV, M4A • Up to 10 files • {10 - files.length} slots remaining</span>
              </div>
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Files ({files.length}/10)
                  {completedCount > 0 && <span className="text-green-600 ml-2">• {completedCount} complete</span>}
                  {errorCount > 0 && <span className="text-red-600 ml-2">• {errorCount} failed</span>}
                </span>
                {!processing && files.some(f => f.status === 'pending') && (
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {files.map((fileItem, index) => (
                  <div
                    key={fileItem.id}
                    className={`p-3 rounded-lg border ${
                      fileItem.status === 'complete' ? 'bg-green-50 border-green-200' :
                      fileItem.status === 'error' ? 'bg-red-50 border-red-200' :
                      processing && currentIndex === files.filter(f => f.status !== 'complete' && f.status !== 'error').indexOf(fileItem)
                        ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {fileItem.status === 'complete' ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : fileItem.status === 'error' ? (
                          <AlertCircle className="text-red-600" size={20} />
                        ) : fileItem.status !== 'pending' ? (
                          <Loader2 className="text-blue-600 animate-spin" size={20} />
                        ) : (
                          <FileAudio className="text-gray-400" size={20} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Editable Title */}
                        <input
                          type="text"
                          value={fileItem.title}
                          onChange={(e) => updateFile(fileItem.id, { title: e.target.value })}
                          disabled={fileItem.status !== 'pending'}
                          className="font-medium text-navy w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none disabled:border-transparent"
                          placeholder="Sermon title"
                        />
                        
                        <div className="flex gap-4 mt-1">
                          {/* Date */}
                          <input
                            type="date"
                            value={fileItem.date}
                            onChange={(e) => updateFile(fileItem.id, { date: e.target.value })}
                            disabled={fileItem.status !== 'pending'}
                            className="text-xs text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none disabled:border-transparent"
                          />
                          
                          {/* Scripture */}
                          <input
                            type="text"
                            value={fileItem.scripture}
                            onChange={(e) => updateFile(fileItem.id, { scripture: e.target.value })}
                            disabled={fileItem.status !== 'pending'}
                            placeholder="Scripture (optional)"
                            className="text-xs text-gold flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none disabled:border-transparent"
                          />
                        </div>
                        
                        {/* Status */}
                        <p className={`text-xs mt-1 ${
                          fileItem.status === 'complete' ? 'text-green-600' :
                          fileItem.status === 'error' ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {fileItem.statusText}
                        </p>
                        
                        {/* Progress Bar */}
                        {fileItem.status !== 'pending' && fileItem.status !== 'complete' && fileItem.status !== 'error' && (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Remove Button */}
                      {fileItem.status === 'pending' && !processing && (
                        <button
                          type="button"
                          onClick={() => removeFile(fileItem.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          {pendingCount > 0 && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={processAllFiles}
                disabled={processing}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing {currentIndex + 1} of {pendingCount}...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Process &amp; Save {pendingCount} Sermon{pendingCount !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Completion Message */}
          {completedCount > 0 && pendingCount === 0 && !processing && (
            <div className="p-4 bg-green-100 border border-green-300 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle size={20} />
                <span className="font-medium">
                  {completedCount} sermon{completedCount !== 1 ? 's' : ''} uploaded and saved successfully!
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                The sermons are now available for visitors to listen to.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Audio Source Selector Component
function AudioSourceSelector({
  audioSourceType,
  youtubeUrl,
  audioUrl,
  onSourceTypeChange,
  onYoutubeUrlChange,
  onAudioUrlChange,
  onAudioFileUpload,
  sermonTitle,
}: {
  audioSourceType: AudioSourceType
  youtubeUrl: string
  audioUrl: string
  onSourceTypeChange: (type: AudioSourceType) => void
  onYoutubeUrlChange: (url: string) => void
  onAudioUrlChange: (url: string) => void
  onAudioFileUpload: (file: File) => Promise<void>
  sermonTitle: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const externalLinkInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState('')
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [wasCompressed, setWasCompressed] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadedFileName(file.name)
    setOriginalSize(file.size)
    setCompressedSize(0)
    setWasCompressed(false)
    setProgress(0)
    setProgressStatus(`Selected: ${formatFileSize(file.size)}`)

    try {
      let fileToUpload = file
      const willCompress = needsCompression(file, 40)

      if (willCompress) {
        setProgressStatus(`Large file detected (${formatFileSize(file.size)}) - compressing...`)
        
        // Compress the audio file automatically
        fileToUpload = await compressAudio(file, {
          targetBitrate: 64, // 64kbps is great for speech
          mono: true,
          onProgress: (prog, status) => {
            setProgress(Math.round(prog * 0.8)) // Compression is 80% of progress
            setProgressStatus(status)
          }
        })
        
        setCompressedSize(fileToUpload.size)
        setWasCompressed(true)
        
        const reduction = Math.round((1 - fileToUpload.size / file.size) * 100)
        setProgressStatus(`Compressed: ${formatFileSize(file.size)} → ${formatFileSize(fileToUpload.size)} (${reduction}% smaller)`)
      } else {
        setProgress(10)
        setProgressStatus(`File size OK (${formatFileSize(file.size)}) - uploading...`)
      }

      setProgress(85)
      setProgressStatus('Uploading to storage...')
      
      await onAudioFileUpload(fileToUpload)
      
      setProgress(100)
      if (wasCompressed || willCompress) {
        const finalSize = willCompress ? fileToUpload.size : file.size
        setProgressStatus(`✓ Uploaded successfully (${formatFileSize(finalSize)})`)
      } else {
        setProgressStatus(`✓ Uploaded successfully`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setProgressStatus('Error - please try again')
      setProgress(0)
    }

    setUploading(false)
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Audio/Video Source
      </label>
      
      {/* Source Type Tabs */}
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          onClick={() => onSourceTypeChange('youtube')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors ${
            audioSourceType === 'youtube'
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Youtube size={16} />
          YouTube
        </button>
        <button
          type="button"
          onClick={() => onSourceTypeChange('mp3_upload')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border-l border-r border-gray-300 transition-colors ${
            audioSourceType === 'mp3_upload'
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Music size={16} />
          MP3 Upload
        </button>
        <button
          type="button"
          onClick={() => onSourceTypeChange('external_link')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm transition-colors ${
            audioSourceType === 'external_link'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ExternalLink size={16} />
          External Link
        </button>
      </div>

      {/* YouTube Input */}
      {audioSourceType === 'youtube' && (
        <div>
          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={18} />
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Paste the full YouTube video URL
          </p>
        </div>
      )}

      {/* MP3 Upload */}
      {audioSourceType === 'mp3_upload' && (
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,.mp3,.wav,.m4a"
            className="hidden"
          />
          
          {audioUrl && !uploading ? (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileAudio className="text-green-600 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {uploadedFileName || 'Audio uploaded'}
                  </p>
                  <p className="text-xs text-green-600 truncate">{audioUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onAudioUrlChange('')
                    setUploadedFileName('')
                    setOriginalSize(0)
                    setCompressedSize(0)
                    setWasCompressed(false)
                  }}
                  className="text-green-600 hover:text-green-800 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
              {wasCompressed && originalSize > 0 && compressedSize > 0 && (
                <div className="mt-2 pt-2 border-t border-green-200 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-600" />
                  <p className="text-xs text-green-700">
                    Compressed from {formatFileSize(originalSize)} to {formatFileSize(compressedSize)}
                    <span className="ml-1 font-medium">(↓{Math.round((1 - compressedSize / originalSize) * 100)}% smaller)</span>
                  </p>
                </div>
              )}
            </div>
          ) : uploading ? (
            <div className="p-4 border-2 border-green-300 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 size={20} className="animate-spin text-green-600" />
                <span className="text-sm font-medium text-green-800">{progressStatus}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-green-600">
                  {progress < 80 
                    ? 'Large files are automatically optimized for faster upload' 
                    : progress < 100 
                    ? 'Uploading to Supabase storage...' 
                    : 'Complete!'}
                </p>
                <span className="text-xs font-medium text-green-700">{progress}%</span>
              </div>
              {originalSize > 0 && progress < 100 && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="text-xs text-green-700">
                    <span className="font-medium">Original:</span> {formatFileSize(originalSize)}
                    {compressedSize > 0 && (
                      <span className="ml-3">
                        <span className="font-medium">Compressed:</span> {formatFileSize(compressedSize)}
                        <span className="ml-1 text-green-600">(↓{Math.round((1 - compressedSize / originalSize) * 100)}%)</span>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Upload size={20} className="text-gray-400" />
              <span className="text-gray-600">Click to upload audio file</span>
            </button>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Supports MP3, WAV, M4A • Large files automatically optimized
          </p>
        </div>
      )}

      {/* External Link Input */}
      {audioSourceType === 'external_link' && (
        <div>
          {audioUrl ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <LinkIcon className="text-blue-600 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-800">External Link Added</p>
                  <p className="text-xs text-blue-600 truncate">{audioUrl}</p>
                </div>
                <a
                  href={audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  title="Test link"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => onAudioUrlChange('')}
                  className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input
                  type="url"
                  ref={externalLinkInputRef}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                  placeholder="https://example.com/sermon-audio.mp3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      if (input.value) {
                        onAudioUrlChange(input.value)
                      }
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (externalLinkInputRef.current?.value) {
                    onAudioUrlChange(externalLinkInputRef.current.value)
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Use Link
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Direct link to audio file or streaming page (e.g., SermonAudio, Dropbox, Google Drive)
          </p>
        </div>
      )}
    </div>
  )
}

// Sermon Entry Card Component
function SermonEntryCard({
  sermon,
  index,
  series,
  onUpdate,
  onRemove,
}: {
  sermon: SermonWithAI
  index: number
  series: SermonSeries[]
  onUpdate: (index: number, updates: Partial<SermonWithAI>) => void
  onRemove: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [audioSourceType, setAudioSourceType] = useState<AudioSourceType>(
    sermon.youtube_url ? 'youtube' : sermon.audio_url ? 'external_link' : 'youtube'
  )

  const handleSummaryGenerated = (theme: string, keyPoints: string[], description: string) => {
    onUpdate(index, { theme, key_points: keyPoints, description })
  }

  const handleAudioSourceTypeChange = (type: AudioSourceType) => {
    setAudioSourceType(type)
    // Clear the other field when switching
    if (type === 'youtube') {
      onUpdate(index, { audio_url: '' })
    } else {
      onUpdate(index, { youtube_url: '' })
    }
  }

  const handleAudioFileUpload = async (file: File) => {
    const url = await uploadSermonAudio(file, sermon.title || `sermon-${index}`)
    if (url) {
      onUpdate(index, { audio_url: url })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-medium">
            {index + 1}
          </span>
          <div>
            <h4 className="font-medium text-navy">
              {sermon.title || 'Untitled Sermon'}
            </h4>
            <p className="text-sm text-gray-500">
              {sermon.speaker || 'No speaker'} • {sermon.date || 'No date'}
              {sermon.youtube_url && <span className="ml-2 text-red-500">• YouTube</span>}
              {sermon.audio_url && !sermon.youtube_url && <span className="ml-2 text-green-500">• Audio</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove(index)
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sermon Title *
              </label>
              <input
                type="text"
                value={sermon.title}
                onChange={(e) => onUpdate(index, { title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                placeholder="Enter sermon title"
              />
            </div>

            {/* Speaker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speaker *
              </label>
              <select
                value={sermon.speaker}
                onChange={(e) => onUpdate(index, { speaker: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              >
                <option value="">Select speaker</option>
                <option value="Pastor John Seydlitz">Pastor John Seydlitz</option>
                <option value="Dr. Chris Shepler">Dr. Chris Shepler</option>
                <option value="Guest Speaker">Guest Speaker</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={sermon.date}
                onChange={(e) => onUpdate(index, { date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              />
            </div>

            {/* Series */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Series
              </label>
              <select
                value={sermon.series || ''}
                onChange={(e) => onUpdate(index, { series: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              >
                <option value="">Select series</option>
                {series.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scripture */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scripture Reference
              </label>
              <input
                type="text"
                value={sermon.scripture || ''}
                onChange={(e) => onUpdate(index, { scripture: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                placeholder="e.g., John 3:16 or Romans 8:28-30"
              />
            </div>
          </div>

          {/* Audio/Video Source */}
          <AudioSourceSelector
            audioSourceType={audioSourceType}
            youtubeUrl={sermon.youtube_url || ''}
            audioUrl={sermon.audio_url || ''}
            onSourceTypeChange={handleAudioSourceTypeChange}
            onYoutubeUrlChange={(url) => onUpdate(index, { youtube_url: url })}
            onAudioUrlChange={(url) => onUpdate(index, { audio_url: url })}
            onAudioFileUpload={handleAudioFileUpload}
            sermonTitle={sermon.title}
          />

          {/* Description with AI */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <AISummaryGenerator
                sermon={sermon}
                onSummaryGenerated={handleSummaryGenerated}
              />
            </div>
            <textarea
              rows={3}
              value={sermon.description || ''}
              onChange={(e) => onUpdate(index, { description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
              placeholder="Brief description of the sermon message..."
            />
          </div>

          {/* AI Generated Fields */}
          {(sermon.theme || sermon.key_points) && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-purple-600 font-medium mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                AI Generated Insights
              </p>
              {sermon.theme && (
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Theme:</strong> {sermon.theme}
                </p>
              )}
              {sermon.key_points && sermon.key_points.length > 0 && (
                <div>
                  <strong className="text-sm">Key Points:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                    {sermon.key_points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Series Card Component
function SeriesCard({
  series,
  onUpdate,
  onImageUpload,
}: {
  series: SermonSeries
  onUpdate: (updates: Partial<SermonSeries>) => void
  onImageUpload: (file: File) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    onImageUpload(file)
    setUploading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
      {/* Image */}
      <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
        {series.image_url ? (
          <Image
            src={series.image_url}
            alt={series.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={24} />
          </div>
        )}
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
          className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs"
        >
          {uploading ? 'Uploading...' : 'Change'}
        </button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={series.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="font-medium text-navy w-full border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none"
        />
        <input
          type="text"
          value={series.scripture_ref || ''}
          onChange={(e) => onUpdate({ scripture_ref: e.target.value })}
          className="text-sm text-gold w-full border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none"
          placeholder="Scripture reference"
        />
        <textarea
          value={series.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          className="text-sm text-gray-600 w-full resize-none border-b border-transparent hover:border-gray-300 focus:border-gold focus:outline-none mt-1"
          placeholder="Description..."
          rows={2}
        />
      </div>
    </div>
  )
}

export default function SermonImportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  const [activeTab, setActiveTab] = useState<Tab>('import')
  const [sermonSeries, setSermonSeries] = useState<SermonSeries[]>([])
  const [sermons, setSermons] = useState<SermonWithAI[]>([])
  const [existingSermons, setExistingSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')

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

  const loadData = async () => {
    setLoading(true)
    
    const seriesData = await getSermonSeries()
    setSermonSeries(seriesData)

    await initializeSermonSeries()

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('sermons')
        .select('*')
        .order('date', { ascending: false })
      
      if (data) {
        setExistingSermons(data)
      }
    }

    setLoading(false)
  }

  const addNewSermon = () => {
    setSermons(prev => [
      ...prev,
      {
        title: '',
        speaker: 'Pastor John Seydlitz',
        date: new Date().toISOString().split('T')[0],
        series: '',
        scripture: '',
        description: '',
        youtube_url: '',
        audio_url: '',
      },
    ])
  }

  const updateSermon = (index: number, updates: Partial<SermonWithAI>) => {
    setSermons(prev =>
      prev.map((sermon, i) => (i === index ? { ...sermon, ...updates } : sermon))
    )
  }

  const removeSermon = (index: number) => {
    setSermons(prev => prev.filter((_, i) => i !== index))
  }

  const handleBulkImport = (importedSermons: SermonWithAI[]) => {
    setSermons(prev => [...prev, ...importedSermons])
  }

  const saveSermons = async () => {
    setSaving(true)
    setSaveStatus('idle')

    try {
      const validSermons = sermons.filter(
        (s) => s.title && s.speaker && s.date
      )

      if (validSermons.length === 0) {
        setSaveStatus('error')
        setSaving(false)
        return
      }

      const result = await bulkCreateSermons(validSermons)

      if (result.success > 0) {
        setSaveStatus('success')
        setSermons([])
        if (isSupabaseConfigured && supabase) {
          const { data } = await supabase
            .from('sermons')
            .select('*')
            .order('date', { ascending: false })
          
          if (data) {
            setExistingSermons(data)
          }
        }
      } else {
        setSaveStatus('error')
      }

      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Error saving sermons:', error)
      setSaveStatus('error')
    }

    setSaving(false)
  }

  const updateSeries = async (index: number, updates: Partial<SermonSeries>) => {
    const updated = { ...sermonSeries[index], ...updates }
    setSermonSeries(prev =>
      prev.map((s, i) => (i === index ? updated : s))
    )

    await upsertSermonSeries(updated)
  }

  const handleSeriesImageUpload = async (index: number, file: File) => {
    const series = sermonSeries[index]
    const url = await uploadSeriesImage(file, series.name)
    
    if (url) {
      updateSeries(index, { image_url: url })
    }
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
            <h1 className="font-cinzel text-2xl text-navy">Sermon Import</h1>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-navy" size={48} />
      </div>
    )
  }

  const tabs = [
    { id: 'import' as Tab, label: 'Import Sermons', icon: <Upload size={18} /> },
    { id: 'series' as Tab, label: 'Manage Series', icon: <FolderOpen size={18} /> },
    { id: 'manage' as Tab, label: 'All Sermons', icon: <BookOpen size={18} /> },
  ]

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
              <h1 className="font-cinzel text-xl">Sermon Import</h1>
              <p className="text-gray-300 text-sm">Bulk add and manage sermons</p>
            </div>
          </div>
          {!isSupabaseConfigured && (
            <span className="text-yellow-300 text-sm flex items-center gap-1">
              <AlertCircle size={16} />
              Supabase not connected
            </span>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-navy text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div className="space-y-6">
            {/* Bulk Import Panel */}
            <BulkImportPanel
              onImport={handleBulkImport}
              defaultSpeaker="Pastor John Seydlitz"
            />

            {/* Batch Audio Upload */}
            <BatchAudioUpload onComplete={loadData} />

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Audio Sources:</strong> You can add sermons with YouTube videos, upload MP3 files directly, 
                or link to external audio sources like SermonAudio, Dropbox, or Google Drive.
              </p>
              <p className="text-blue-700 text-xs mt-2">
                💡 <strong>Auto-compression:</strong> Large MP3 files (over 40MB) are automatically compressed to 64kbps mono 
                before upload — perfect for speech content while staying under Supabase&apos;s 50MB limit.
              </p>
            </div>

            {/* Add Sermon Button */}
            <div className="flex justify-between items-center">
              <h2 className="font-cinzel text-xl text-navy">
                Sermons to Import ({sermons.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={addNewSermon}
                  className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy-light transition-colors"
                >
                  <Plus size={18} />
                  Add Sermon
                </button>
                {sermons.length > 0 && (
                  <button
                    onClick={saveSermons}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      saving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : saveStatus === 'success'
                        ? 'bg-green-500 text-white'
                        : saveStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-gold text-navy hover:bg-gold-light'
                    }`}
                  >
                    {saving ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : saveStatus === 'success' ? (
                      <CheckCircle size={18} />
                    ) : saveStatus === 'error' ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {saving
                      ? 'Saving...'
                      : saveStatus === 'success'
                      ? 'Saved!'
                      : saveStatus === 'error'
                      ? 'Error'
                      : `Save All (${sermons.filter(s => s.title && s.speaker && s.date).length})`}
                  </button>
                )}
              </div>
            </div>

            {/* Sermon Cards */}
            {sermons.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-gray-400" size={32} />
                </div>
                <h3 className="font-cinzel text-lg text-navy mb-2">
                  No Sermons to Import
                </h3>
                <p className="text-gray-500 mb-4">
                  Click &quot;Add Sermon&quot; to start adding sermons to import.
                </p>
                <button
                  onClick={addNewSermon}
                  className="inline-flex items-center gap-2 bg-navy text-white px-6 py-3 rounded-lg hover:bg-navy-light transition-colors"
                >
                  <Plus size={18} />
                  Add Your First Sermon
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sermons.map((sermon, index) => (
                  <SermonEntryCard
                    key={index}
                    sermon={sermon}
                    index={index}
                    series={sermonSeries}
                    onUpdate={updateSermon}
                    onRemove={removeSermon}
                  />
                ))}
              </div>
            )}

            {/* Quick Add Multiple */}
            {sermons.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={addNewSermon}
                  className="flex items-center gap-2 text-navy hover:text-navy-light transition-colors"
                >
                  <Plus size={18} />
                  Add Another Sermon
                </button>
              </div>
            )}
          </div>
        )}

        {/* Series Tab */}
        {activeTab === 'series' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-cinzel text-xl text-navy">
                Sermon Series ({sermonSeries.length})
              </h2>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Tip:</strong> Each series can have a custom image that displays
                on the sermons page. Click on the image to upload a new one.
              </p>
            </div>

            <div className="grid gap-4">
              {sermonSeries.map((series, index) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  onUpdate={(updates) => updateSeries(index, updates)}
                  onImageUpload={(file) => handleSeriesImageUpload(index, file)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-cinzel text-xl text-navy">
                All Sermons ({existingSermons.length})
              </h2>
            </div>

            {existingSermons.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500">
                  No sermons in database yet. Import some sermons to get started!
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Title
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Speaker
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Series
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                        Media
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {existingSermons.map((sermon) => (
                      <tr key={sermon.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-navy font-medium">
                          {sermon.title}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {sermon.speaker}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(sermon.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gold">
                          {sermon.series || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            {sermon.youtube_url && (
                              <span className="inline-flex items-center gap-1 text-red-500">
                                <Youtube size={14} />
                              </span>
                            )}
                            {sermon.audio_url && (
                              <span className="inline-flex items-center gap-1 text-green-500">
                                <Music size={14} />
                              </span>
                            )}
                            {!sermon.youtube_url && !sermon.audio_url && (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
