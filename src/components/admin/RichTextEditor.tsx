'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Check,
  Upload,
  Loader2,
} from 'lucide-react'
import { uploadImage } from '@/lib/content'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  rows = 6,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [])

  // Save selection before opening modals
  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange())
    }
  }

  // Restore selection
  const restoreSelection = () => {
    if (savedSelection) {
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(savedSelection)
    }
  }

  // Execute formatting command
  const execCommand = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    handleContentChange()
  }

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Handle paste - strip formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    handleContentChange()
  }

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      restoreSelection()
      editorRef.current?.focus()
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      document.execCommand('createLink', false, url)
      handleContentChange()
    }
    setShowLinkModal(false)
    setLinkUrl('')
  }

  // Insert image from URL
  const insertImageFromUrl = () => {
    if (imageUrl) {
      restoreSelection()
      editorRef.current?.focus()
      document.execCommand('insertImage', false, imageUrl)
      handleContentChange()
    }
    setShowImageModal(false)
    setImageUrl('')
  }

  // Upload and insert image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileName = `content-${Date.now()}.${file.name.split('.').pop()}`
      const uploadedUrl = await uploadImage(file, fileName)
      if (uploadedUrl) {
        restoreSelection()
        editorRef.current?.focus()
        document.execCommand('insertImage', false, uploadedUrl)
        handleContentChange()
        setShowImageModal(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
    }
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-navy text-white'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  )

  const minHeight = rows * 24 + 16

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-gold focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {/* Text Formatting */}
        <ToolbarButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
          <Underline size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Align Left">
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Align Center">
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('justifyRight')} title="Align Right">
          <AlignRight size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              saveSelection()
              setShowLinkModal(!showLinkModal)
              setShowImageModal(false)
            }}
            title="Insert Link"
          >
            <LinkIcon size={16} />
          </ToolbarButton>

          {showLinkModal && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border p-3 w-72">
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-gold focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      insertLink()
                    }
                    if (e.key === 'Escape') {
                      setShowLinkModal(false)
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={insertLink}
                  className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                  title="Insert"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton
            onClick={() => {
              saveSelection()
              setShowImageModal(!showImageModal)
              setShowLinkModal(false)
            }}
            title="Insert Image"
          >
            <ImageIcon size={16} />
          </ToolbarButton>

          {showImageModal && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-lg shadow-lg border p-3 w-72">
              {/* Upload */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold/5 transition-colors text-sm text-gray-600"
                >
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>

              <div className="relative flex items-center my-2">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-2 text-xs text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-gold focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        insertImageFromUrl()
                      }
                      if (e.key === 'Escape') {
                        setShowImageModal(false)
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={insertImageFromUrl}
                    className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600"
                    title="Insert"
                  >
                    <Check size={14} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand('undo')} title="Undo (Ctrl+Z)">
          <Undo size={16} />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('redo')} title="Redo (Ctrl+Y)">
          <Redo size={16} />
        </ToolbarButton>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onPaste={handlePaste}
        onBlur={handleContentChange}
        className="px-4 py-3 outline-none prose prose-sm max-w-none"
        style={{ minHeight: `${minHeight}px` }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Placeholder styles */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        [contenteditable] a {
          color: #d4af37;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
