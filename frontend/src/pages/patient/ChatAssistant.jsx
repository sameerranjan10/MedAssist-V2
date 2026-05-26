/**
 * pages/patient/ChatAssistant.jsx
 * RAG-powered chat UI. User selects a report, then asks questions.
 * Messages are stored in DB and recalled on revisit.
 */
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiRobot2Line, RiSendPlane2Line, RiRefreshLine,
  RiLoader4Line, RiFileList3Line,
} from 'react-icons/ri'
import { reportsAPI, chatAPI } from '@/api/services'
import useAuthStore from '@/store/authStore'
import { LoadingSpinner } from '@/components/common'
import toast from 'react-hot-toast'

const QUICK_CHIPS = [
  'Why is my hemoglobin low?',
  'What foods can increase iron?',
  'Is my condition serious?',
  'Explain my RBC count',
  'Compare with normal values',
  'What should I do next?',
]

function ChatBubble({ msg, initials }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 items-end ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${
        isUser ? 'bg-brand text-white' : 'bg-primary-50 text-brand border border-primary-100'
      }`}>
        {isUser ? initials : <RiRobot2Line />}
      </div>
      <div className={`max-w-[85%] md:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-brand text-white rounded-br-sm'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-card'
      }`}>
        {msg.message || msg.content}
      </div>
    </motion.div>
  )
}

export default function ChatAssistant() {
  const { user, getInitials } = useAuthStore()
  const [reports, setReports]     = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [sending, setSending]     = useState(false)
  const [loadingReports, setLoadingReports] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef(null)

  // Load processed reports
  useEffect(() => {
    reportsAPI.list()
      .then(r => {
        const processed = r.data.filter(x => !['uploaded','processing'].includes(x.status))
        setReports(processed)
        if (processed.length > 0) setSelectedId(String(processed[0].id))
      })
      .catch(() => toast.error('Could not load reports'))
      .finally(() => setLoadingReports(false))
  }, [])

  // Load chat history when report changes
  useEffect(() => {
    if (!selectedId) return
    setLoadingHistory(true)
    chatAPI.history(selectedId)
      .then(r => setMessages(r.data))
      .catch(() => setMessages([]))
      .finally(() => setLoadingHistory(false))
  }, [selectedId])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || !selectedId || sending) return

    const userMsg = { role: 'user', message: msg, created_at: new Date().toISOString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setSending(true)

    try {
      const { data } = await chatAPI.ask({ report_id: Number(selectedId), message: msg })
      setMessages(m => [...m, {
        role: 'assistant',
        message: data.answer,
        created_at: new Date().toISOString(),
      }])
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        message: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setSending(false)
    }
  }

  const clearChat = async () => {
    if (!selectedId) return
    await chatAPI.clearHistory(selectedId).catch(() => {})
    setMessages([])
    toast.success('Chat cleared')
  }

  return (
    <div className="p-4 md:p-6 flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">AI Chat Assistant</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ask questions about your medical reports</p>
        </div>
        <button onClick={clearChat}
          title="Clear conversation"
          className="btn-secondary flex items-center gap-1.5 text-xs">
          <RiRefreshLine /> Clear chat
        </button>
      </div>

      {/* Report selector */}
      {loadingReports ? <LoadingSpinner text="Loading reports…" /> : (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Chatting about report</label>
          <div className="relative">
            <RiFileList3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="input pl-9 pr-4 text-sm font-medium">
              {reports.length === 0 && <option value="">No processed reports available</option>}
              {reports.map(r => (
                <option key={r.id} value={r.id}>{r.file_name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="card flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingHistory ? <LoadingSpinner text="Loading conversation…" /> :
            messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-3">
                  <RiRobot2Line className="text-brand text-2xl" />
                </div>
                <p className="text-sm font-medium text-slate-600">Ask me anything about your report</p>
                <p className="text-xs text-slate-400 mt-1">{"I'll explain your results in simple language"}</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <ChatBubble key={i} msg={msg} initials={getInitials()} />
                ))}
              </AnimatePresence>
            )
          }

          {/* Typing indicator */}
          {sending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-2.5 items-end">
              <div className="w-7 h-7 rounded-full bg-primary-50 text-brand border border-primary-100 flex items-center justify-center flex-shrink-0">
                <RiRobot2Line className="text-sm" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-card">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick chips */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-50 dark:border-slate-800 pt-2">
          {QUICK_CHIPS.map(chip => (
            <button key={chip} onClick={() => send(chip)}
              className="bg-primary-50 text-brand border border-primary-200 rounded-full px-2.5 py-1 text-xs font-medium hover:bg-brand hover:text-white transition-colors flex-shrink-0">
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder={selectedId ? 'Type your question…' : 'Select a report first'}
            disabled={!selectedId || sending}
            className="input flex-1 text-sm"
          />
          <button onClick={() => send()}
            disabled={!input.trim() || !selectedId || sending}
            className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-700 transition-colors">
            {sending ? <RiLoader4Line className="animate-spin" /> : <RiSendPlane2Line />}
          </button>
        </div>
      </div>
    </div>
  )
}
