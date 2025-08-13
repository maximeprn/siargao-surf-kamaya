'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      className="select-none cursor-pointer group"
    >
      <Image 
        src={isDark ? "/branding/by-kamaya.svg?v=4" : "/branding/by-kamaya-light.svg"} 
        alt="by Kamaya" 
        width={120}
        height={40}
        className="w-auto transition-transform duration-300 ease-out group-hover:scale-105"
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
      <div className="sticky top-0 z-60 header">
        <div className="w-full px-6 lg:px-10 h-14 flex items-center justify-between relative">
          <div className="flex items-center gap-4">
            {/* ThemeToggle - tout à gauche sur desktop et mobile */}
            <ThemeToggle />
            <div className="hidden lg:block">
              <ByKamaya />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <KamayaSurfLogo />
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => {
                  console.log('Button clicked, current state:', isSideMenuOpen)
                  setIsSideMenuOpen(!isSideMenuOpen)
                }}
                className="text-theme-primary hover:scale-105 cursor-pointer text-lg px-3 py-2 font-normal relative font-analogue"
                style={{ 
                  overflow: 'hidden', 
                  minHeight: '2rem',
                  transition: 'transform 0.3s ease-out'
                }}
              >
                <span 
                  className={`block ${isSideMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    transition: 'all 0.5s ease-out',
                    transform: isSideMenuOpen ? 'translateY(-100%)' : 'translateY(0)',
                  }}
                >
                  Surf Spots
                </span>
                <span 
                  className={`absolute inset-0 flex items-center justify-center ${isSideMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    transition: 'all 0.5s ease-out',
                    transform: isSideMenuOpen ? 'translateY(0)' : 'translateY(100%)',
                  }}
                >
                  Close
                </span>
              </button>
            </nav>
            
            {/* Mobile menu button - complètement à droite */}
            <button
              onClick={() => {
                console.log('Mobile button clicked, current state:', isSideMenuOpen)
                setIsSideMenuOpen(!isSideMenuOpen)
              }}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <div className="w-5 h-5 relative flex flex-col justify-center items-center">
                <span 
                  className="absolute w-5 bg-current"
                  style={{
                    height: '1.5px',
                    borderRadius: '1px',
                    transition: 'all 0.3s ease-out',
                    transform: isSideMenuOpen ? 'rotate(45deg)' : 'rotate(0deg) translateY(-6px)',
                  }}
                />
                <span 
                  className="absolute w-5 bg-current"
                  style={{
                    height: '1.5px',
                    borderRadius: '1px',
                    transition: 'all 0.3s ease-out',
                    opacity: isSideMenuOpen ? 0 : 1,
                  }}
                />
                <span 
                  className="absolute w-5 bg-current"
                  style={{
                    height: '1.5px',
                    borderRadius: '1px',
                    transition: 'all 0.3s ease-out',
                    transform: isSideMenuOpen ? 'rotate(-45deg)' : 'rotate(0deg) translateY(6px)',
                  }}
                />
              </div>
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



