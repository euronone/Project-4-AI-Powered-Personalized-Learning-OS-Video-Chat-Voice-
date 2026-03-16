import { User, Bot } from 'lucide-react'

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: string
}

export default function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-accent/20 text-accent' : 'bg-neon-purple/20 text-neon-purple'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser 
            ? 'bg-accent text-white rounded-tr-sm' 
            : 'bg-dark-50 border border-white/5 text-white/90 rounded-tl-sm'
        }`}>
          <p className="whitespace-pre-wrap">{message}</p>
        </div>
        {timestamp && (
          <span className="text-[10px] text-white/20 mt-1 px-1">{timestamp}</span>
        )}
      </div>
    </div>
  )
}
