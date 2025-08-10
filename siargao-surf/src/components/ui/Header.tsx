'use client'

import Link from 'next/link'
import SpotSelector from './SpotSelector'
import ThemeToggle from './ThemeToggle'
import { useThemeOptional } from '@/contexts/ThemeContext'

function ByKamaya() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  
  return (
    <div className="select-none">
      <img 
        src={isDark ? "/branding/by-kamaya.svg?v=4" : "/branding/by-kamaya-light.svg"} 
        alt="by Kamaya" 
        className="w-auto transition-all duration-300"
        style={{ height: 'var(--logo-svg)' }}
      />
    </div>
  )
}

function KamayaSurfLogo() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  
  return (
    <div className="select-none absolute left-1/2 transform -translate-x-1/2">
      <img 
        src={isDark ? "/branding/surf-report-logo.svg" : "/branding/surf-report-logo-light.svg"} 
        alt="Surf Report" 
        className="w-auto transition-all duration-300"
        style={{ height: 'var(--logo-center-svg)' }}
      />
    </div>
  )
}

export default function Header() {
  return (
    <div className="sticky top-0 z-30 header">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between relative">
        <ByKamaya />
        <KamayaSurfLogo />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-white text-sm">
            <Link href="/" className="hover:font-medium transition-all duration-200">Surf</Link>
            <SpotSelector />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}



