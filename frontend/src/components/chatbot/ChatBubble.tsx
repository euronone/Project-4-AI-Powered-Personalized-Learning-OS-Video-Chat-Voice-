import { User, Bot } from 'lucide-react'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-700'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={`flex max-w-[80%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm bg-slate-900 text-white'
              : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'
          }`}
        >
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && <span className="mt-1 px-1 text-[10px] text-slate-400">{timestamp}</span>}
      </div>
    </div>
  )
}
