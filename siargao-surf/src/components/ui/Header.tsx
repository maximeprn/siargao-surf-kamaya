'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu } from 'lucide-react'
import SideMenu from './SideMenu'
import ThemeToggle from './ThemeToggle'
import { useThemeOptional } from '@/contexts/ThemeContext'

function ByKamaya() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  
  return (
    <a 
      href="https://www.kamaya-siargao.com/exclusive-offer" 
      target="_blank" 
      rel="noopener noreferrer"
      className="select-none cursor-pointer hover:opacity-80 transition-opacity duration-200"
    >
      <Image 
        src={isDark ? "/branding/by-kamaya.svg?v=4" : "/branding/by-kamaya-light.svg"} 
        alt="by Kamaya" 
        width={120}
        height={40}
        className="w-auto transition-all duration-300"
        style={{ height: 'var(--logo-svg)' }}
      />
    </a>
  )
}

function KamayaSurfLogo() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  
  return (
    <div className="select-none absolute left-1/2 transform -translate-x-1/2">
      <Image 
        src={isDark ? "/branding/surf-report-logo.svg" : "/branding/surf-report-logo-light.svg"} 
        alt="Surf Report" 
        width={150}
        height={50}
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
        <div className="w-full px-6 lg:px-10 h-14 flex items-center justify-between relative">
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
                className="text-theme-primary hover:font-medium cursor-pointer transition-all duration-200 text-base px-3 py-2 font-normal"
              >
                Surf Spots
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



