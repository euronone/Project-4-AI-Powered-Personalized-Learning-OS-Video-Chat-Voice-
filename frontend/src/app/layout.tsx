import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/common/Sidebar'
import { AuthProvider } from '@/context/AuthContext'

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
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen text-slate-900">
            <Sidebar />
            <main className="min-h-screen overflow-y-auto">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
