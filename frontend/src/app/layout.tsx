import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/common/Sidebar'

export const metadata: Metadata = {
  title: 'LearnOS — AI-Powered Learning',
  description: 'Your personalized AI-powered learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <div className="flex h-screen bg-dark text-white">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
