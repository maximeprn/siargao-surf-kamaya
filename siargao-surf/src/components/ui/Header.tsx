'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import SideMenu from './SideMenu'
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
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-30 header">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between relative">
          <div className="hidden lg:block">
            <ByKamaya />
          </div>
          
          <div className="flex items-center gap-4">
            <KamayaSurfLogo />
            
            {/* ThemeToggle - à droite du logo central */}
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setIsSideMenuOpen(true)}
                className="text-theme-primary hover:font-semibold cursor-pointer transition-all duration-200 text-base px-3 py-2 rounded-lg hover:bg-white/10"
              >
                Spots
              </button>
            </nav>
            
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile menu button - complètement à droite */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu size={20} className="text-theme-primary" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Side menu */}
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
      />
    </>
  )
}



