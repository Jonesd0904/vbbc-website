'use client'

import { useCallback, useEffect, useState } from 'react'
import { Mail, MailOpen, Phone, Reply, Trash2, RefreshCw, AlertCircle, Inbox } from 'lucide-react'

interface ContactMessage {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  message: string
  read: boolean
}

export default function MessagesTab({ adminPassword, onUnreadChange }: { adminPassword: string; onUnreadChange?: (n: number) => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const headers = { 'Content-Type': 'application/json', 'x-admin-password': adminPassword }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/messages', { headers: { 'x-admin-password': adminPassword }, cache: 'no-store' })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Could not load messages')
      setMessages(data.messages)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load messages')
    } finally {
      setLoading(false)
    }
  }, [adminPassword])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    onUnreadChange?.(messages.filter((m) => !m.read).length)
  }, [messages, onUnreadChange])

  const setRead = async (id: string, read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)))
    const res = await fetch('/api/admin/messages', { method: 'PATCH', headers, body: JSON.stringify({ id, read }) })
    if (!res.ok) load()
  }

  const remove = async (id: string) => {
    setConfirmDeleteId(null)
    setMessages((prev) => prev.filter((m) => m.id !== id))
    const res = await fetch('/api/admin/messages', { method: 'DELETE', headers, body: JSON.stringify({ id }) })
    if (!res.ok) load()
  }

  const toggleOpen = (m: ContactMessage) => {
    const next = openId === m.id ? null : m.id
    setOpenId(next)
    if (next && !m.read) setRead(m.id, true)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

  const unread = messages.filter((m) => !m.read).length
  const shown = filter === 'unread' ? messages.filter((m) => !m.read) : messages

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <h2 className="font-cinzel text-xl text-navy">
          Messages {unread > 0 && <span className="ml-2 align-middle text-xs font-sans bg-gold text-navy px-2 py-0.5 rounded-full">{unread} new</span>}
        </h2>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden text-sm">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 capitalize ${filter === f ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button onClick={load} className="flex items-center gap-1 text-sm text-gray-600 hover:text-navy px-3 py-1.5 rounded-lg border hover:bg-gray-50">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Messages sent through the contact form on the website. Each one is also emailed to vbbc@att.net.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!error && !loading && shown.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Inbox size={48} className="mx-auto mb-3" />
          <p>{filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}</p>
        </div>
      )}

      <div className="divide-y border rounded-lg overflow-hidden">
        {shown.map((m) => {
          const isOpen = openId === m.id
          return (
            <div key={m.id} className={`${m.read ? 'bg-white' : 'bg-gold/5'} transition-colors`}>
              <button onClick={() => toggleOpen(m)} className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                <span className="mt-1 flex-shrink-0">
                  {m.read ? <MailOpen size={18} className="text-gray-400" /> : <Mail size={18} className="text-gold-dark" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className={`truncate ${m.read ? 'text-gray-700' : 'text-navy font-semibold'}`}>{m.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(m.created_at)}</span>
                  </span>
                  {!isOpen && <span className="block text-sm text-gray-500 truncate">{m.message}</span>}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pl-11 space-y-4">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><a href={`mailto:${m.email}`} className="text-navy hover:text-gold">{m.email}</a></p>
                    {m.phone && (
                      <p className="flex items-center gap-1"><Phone size={14} /> <a href={`tel:${m.phone}`} className="hover:text-gold">{m.phone}</a></p>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap text-gray-800 bg-gray-50 rounded-lg p-4 leading-relaxed">{m.message}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent('Re: Your message to Victory Bible Baptist Church')}`}
                      className="flex items-center gap-1 text-sm bg-navy text-white px-3 py-1.5 rounded-lg hover:bg-navy-light"
                    >
                      <Reply size={14} /> Reply
                    </a>
                    <button onClick={() => setRead(m.id, !m.read)} className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      {m.read ? <><Mail size={14} /> Mark unread</> : <><MailOpen size={14} /> Mark read</>}
                    </button>
                    {confirmDeleteId === m.id ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-red-700">Delete permanently?</span>
                        <button onClick={() => remove(m.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Yes, delete</button>
                        <button onClick={() => setConfirmDeleteId(null)} className="border px-3 py-1.5 rounded-lg hover:bg-gray-50">Cancel</button>
                      </span>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(m.id)} className="flex items-center gap-1 text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
