'use client'

import Link from 'next/link'
import SpotSelector from './SpotSelector'
import ThemeToggle from './ThemeToggle'
import { useThemeOptional } from '@/contexts/ThemeContext'

function Logo() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  
  return (
    <div className="select-none">
      <img 
        src={isDark ? "/branding/by-kamaya.svg?v=4" : "/branding/by-kamaya-light.svg"} 
        alt="Siargao Surf by Kamaya" 
        className="w-auto transition-all duration-300"
        style={{ height: 'var(--logo-svg)' }}
      />
    </div>
  )
}

export default function Header() {
  return (
    <div className="sticky top-0 z-30 header">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-theme-muted text-sm">
            <Link href="/" className="hover:text-theme-primary hover:font-medium transition-all duration-200">Surf</Link>
            <SpotSelector />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}



