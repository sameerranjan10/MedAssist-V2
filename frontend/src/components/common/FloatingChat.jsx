import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RiRobot2Line, RiCloseLine, RiFullscreenLine,
  RiSendPlane2Line, RiLoader4Line, RiFileList3Line
} from 'react-icons/ri'
import { reportsAPI, chatAPI } from '@/api/services'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

function MiniChatBubble({ msg, initials }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2 items-end mb-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold ${
        isUser ? 'bg-brand text-white' : 'bg-primary-50 text-brand border border-primary-100'
      }`}>
        {isUser ? initials : <RiRobot2Line />}
      </div>
      <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-xs leading-relaxed ${
        isUser
          ? 'bg-brand text-white rounded-br-sm'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-sm'
      }`}>
        {msg.message || msg.content}
      </div>
    </div>
  )
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, getInitials } = useAuthStore()
  
  const [reports, setReports] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  // Only show for patients, and hide on the actual chat page
  const isPatient = user?.role === 'patient'
  const isChatPage = location.pathname.includes('/chat')

  useEffect(() => {
    if (isOpen && isPatient) {
      reportsAPI.list()
        .then(r => {
          const processed = r.data.filter(x => !['uploaded','processing'].includes(x.status))
          setReports(processed)
          if (processed.length > 0 && !selectedId) {
            setSelectedId(String(processed[0].id))
          }
        })
        .catch(() => {})
    }
  }, [isOpen, isPatient])

  useEffect(() => {
    if (!selectedId || !isOpen) return
    chatAPI.history(selectedId)
      .then(r => setMessages(r.data))
      .catch(() => setMessages([]))
  }, [selectedId, isOpen])

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, sending])

  if (!isPatient || isChatPage) return null

  const handleMaximize = () => {
    setIsOpen(false)
    navigate('/chat')
  }

  const send = async () => {
    const msg = input.trim()
    if (!msg || !selectedId || sending) return

    setMessages(m => [...m, { role: 'user', message: msg }])
    setInput('')
    setSending(true)

    try {
      const { data } = await chatAPI.ask({ report_id: Number(selectedId), message: msg })
      setMessages(m => [...m, { role: 'assistant', message: data.answer }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', message: 'Sorry, I encountered an error.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed bottom-28 md:bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4"
            style={{ width: 340, height: 480 }}
          >
            {/* Header */}
            <div className="bg-brand text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiRobot2Line className="text-lg" />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={handleMaximize} title="Maximize" className="p-1 hover:bg-white/20 rounded transition-colors">
                  <RiFullscreenLine />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close" className="p-1 hover:bg-white/20 rounded transition-colors">
                  <RiCloseLine />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-hidden">
              <div className="px-3 py-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs">
                <RiFileList3Line className="text-slate-400 flex-shrink-0" />
                <select 
                  value={selectedId} 
                  onChange={e => setSelectedId(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="" disabled>Select a report to chat</option>
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>{r.file_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-10 h-10 rounded-full bg-primary-50 text-brand flex items-center justify-center mb-2">
                      <RiRobot2Line className="text-xl" />
                    </div>
                    <p className="text-xs text-slate-500">Ask me anything about your report.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <MiniChatBubble key={i} msg={msg} initials={getInitials()} />
                  ))
                )}
                {sending && (
                  <div className="flex gap-2 items-end mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary-50 text-brand border border-primary-100 flex items-center justify-center flex-shrink-0">
                      <RiRobot2Line className="text-[10px]" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2 shadow-sm flex gap-1">
                       <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'0ms'}}/>
                       <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}/>
                       <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}/>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Type a message..."
                  className="flex-1 text-xs py-1.5 px-3 bg-transparent text-slate-800 dark:text-slate-200 outline-none"
                  disabled={!selectedId || sending}
                />
                <button onClick={send} disabled={!input.trim() || !selectedId || sending}
                  className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-lg disabled:opacity-50 hover:bg-brand-dark transition-colors">
                  {sending ? <RiLoader4Line className="animate-spin text-sm" /> : <RiSendPlane2Line className="text-sm" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-brand text-white'
        }`}
      >
        {isOpen ? <RiCloseLine className="text-2xl" /> : <RiRobot2Line className="text-2xl" />}
      </button>
    </div>
  )
}
