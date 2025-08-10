import type { Metadata } from 'next'
import './globals.css'
import ThemeProviderWrapper from '@/components/providers/ThemeProviderWrapper'

export const metadata: Metadata = {
  title: 'Siargao Surf',
  description: 'Surf conditions and spots in Siargao',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
