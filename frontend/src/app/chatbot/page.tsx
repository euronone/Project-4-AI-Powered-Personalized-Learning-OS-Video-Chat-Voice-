'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Loader2, RotateCcw } from 'lucide-react'
import ChatBubble from '@/components/chatbot/ChatBubble'
import { API_URL } from '@/lib/constants'

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
      content: 'Hi! I am your AI Tutor. I can help explain concepts, answer questions about your subjects, or walk you through problems step by step. What would you like to learn today?'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getConversationHistory = useCallback(() => {
    // Send last 20 messages as context (skip the initial greeting)
    return messages.slice(1).slice(-20).map(m => ({
      role: m.role,
      content: m.content,
    }))
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantId = (Date.now() + 1).toString()

    // Try streaming first, fall back to sync
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

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No readable stream')

      const decoder = new TextDecoder()
      let assistantContent = ''

      // Add an empty assistant message that we'll stream into
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }])
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
            assistantContent += '\n\n⚠️ An error occurred. Please try again.'
            break
          }
          try {
            const chunk = JSON.parse(payload)
            assistantContent += chunk
            setMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
            )
          } catch {
            // skip unparseable lines
          }
        }
      }

      // If we got nothing from streaming, show a fallback
      if (!assistantContent.trim()) {
        setMessages(prev =>
          prev.map(m => m.id === assistantId
            ? { ...m, content: 'I received your message but couldn\'t generate a response. Please try again.' }
            : m
          )
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return

      // Fallback: try the sync endpoint
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
          setMessages(prev => [...prev, {
            id: assistantId,
            role: 'assistant',
            content: data.content || 'Sorry, I could not process your request.',
          }])
        } else {
          throw new Error('Sync endpoint failed')
        }
      } catch {
        // Both endpoints failed — show error
        setMessages(prev => [...prev, {
          id: assistantId,
          role: 'assistant',
          content: '⚠️ Unable to reach the AI Tutor backend. Make sure the backend server is running on ' + API_URL + ' and the ANTHROPIC_API_KEY is configured.',
        }])
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const handleClearChat = () => {
    if (abortRef.current) abortRef.current.abort()
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Chat cleared! How can I help you today?'
    }])
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto p-6 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Tutor</h1>
          <p className="text-white/40 text-sm">Your personalized learning assistant</p>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 bg-dark-100/60 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
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
              <div className="w-8 h-8 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-dark-50 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                <span className="text-sm text-white/40">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-end gap-3 max-w-4xl mx-auto">
            <div className="flex-1">
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
                className="w-full resize-none rounded-xl bg-dark-50 border border-white/10 p-4 pr-12 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/50 max-h-32 min-h-[52px]"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-accent text-white p-3.5 rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-white/15 mt-2">
            AI Tutor can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </div>
  )
}
