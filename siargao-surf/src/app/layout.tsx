import type { Metadata } from 'next'
import './globals.css'
import ThemeProviderWrapper from '@/components/providers/ThemeProviderWrapper'
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider'
import BackToTopButton from '@/components/ui/BackToTopButton'

export const metadata: Metadata = {
  title: 'Siargao Surf',
  description: 'Surf conditions and spots in Siargao',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical hero image - starts loading immediately */}
        <link 
          rel="preload" 
          as="image" 
          href="https://raw.githubusercontent.com/maximeprn/siargao-surf-kamaya/main/siargao-surf/public/images/CloudNine.webp"
          fetchPriority="high"
        />
      </head>
      <body className="antialiased">
        <ThemeProviderWrapper>
          <SmoothScrollProvider>
            {children}
            <BackToTopButton />
          </SmoothScrollProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  )
}
