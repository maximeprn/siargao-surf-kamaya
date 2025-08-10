import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Siargao Surf',
  description: 'Surf conditions and spots in Siargao',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
