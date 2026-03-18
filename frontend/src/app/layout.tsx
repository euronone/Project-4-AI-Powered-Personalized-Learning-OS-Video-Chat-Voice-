import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/common/Sidebar'

export const metadata: Metadata = {
  title: 'LearnOS | AI Learning Platform',
  description: 'A modern and personalized AI-powered learning platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#070b14]">
        <div className="min-h-screen text-slate-200">
          <Sidebar />
          <main className="min-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
