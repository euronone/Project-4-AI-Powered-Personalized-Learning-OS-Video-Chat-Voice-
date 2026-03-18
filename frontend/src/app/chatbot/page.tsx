'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, Loader2, RotateCcw } from 'lucide-react'
import ChatBubble from '@/components/chatbot/ChatBubble'
import { API_URL } from '@/lib/constants'
import SubjectVisual from '@/components/common/SubjectVisual'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello. I am your AI Tutor. I can explain concepts, help solve doubts step-by-step, and create focused practice plans. What would you like to learn today?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getConversationHistory = useCallback(() => {
    return messages.slice(1).slice(-20).map((m) => ({
      role: m.role,
      content: m.content,
    }))
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()

    try {
      abortRef.current = new AbortController()

      const response = await fetch(`${API_URL}/api/lessons/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: getConversationHistory(),
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No readable stream')

      const decoder = new TextDecoder()
      let assistantContent = ''

      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }])
      setIsLoading(false)

      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') break
          if (payload === '"[ERROR]"') {
            assistantContent += '\n\nI encountered an error. Please try again.'
            break
          }
          try {
            const chunk = JSON.parse(payload)
            assistantContent += chunk
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantContent } : m))
            )
          } catch {
            // ignore malformed chunks
          }
        }
      }

      if (!assistantContent.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: 'I received your message but could not generate a response. Please retry.' }
              : m
          )
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return

      try {
        const response = await fetch(`${API_URL}/api/lessons/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userMessage.content,
            conversation_history: getConversationHistory(),
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: data.content || 'Sorry, I could not process your request.',
            },
          ])
        } else {
          throw new Error('Sync endpoint failed')
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content:
              'Unable to reach AI Tutor backend. Ensure backend is running on ' +
              API_URL +
              ' and ANTHROPIC_API_KEY is configured.',
          },
        ])
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleClearChat = () => {
    if (abortRef.current) abortRef.current.abort()
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Chat reset. What topic would you like to continue with?',
      },
    ])
    setIsLoading(false)
  }

  return (
    <div className="app-shell space-y-6">
      <section className="surface-card overflow-hidden p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">AI Tutor Workspace</h1>
            <p className="mt-1 text-sm text-slate-500">
              Concept explanations, guided problem solving, and focused revision support in one place.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06]">
            <SubjectVisual subject="cs" className="h-28 w-full md:h-32" />
            <div className="absolute bottom-2 left-2 rounded-lg bg-[#0f1629]/90 px-2 py-1 text-[11px] font-semibold text-slate-300">
              Personalized learning assistant
            </div>
          </div>
        </div>
      </section>

      <div className="surface-card flex h-[calc(100vh-16rem)] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">AI Tutor</h1>
            <p className="text-xs text-slate-500">Ask doubts, get explanations, and build confidence.</p>
          </div>
          <button
            onClick={handleClearChat}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.08]"
          >
            <RotateCcw className="h-4 w-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0a0e1a]/60 px-5 py-5">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                isUser={message.role === 'user'}
                message={message.content}
                timestamp={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-[#131b30] px-4 py-2.5 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-white/[0.06] bg-[#0f1629] px-5 py-4">
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask your tutor anything..."
              className="min-h-[52px] max-h-36 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-xl bg-blue-600 p-3.5 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400">
            AI Tutor can make mistakes. Verify important details.
          </p>
        </div>
      </div>
    </div>
  )
}
