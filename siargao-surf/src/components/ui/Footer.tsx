'use client'

import { useThemeOptional } from '@/contexts/ThemeContext'

function ByKamayaFooter() {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true
  
  return (
    <a 
      href="https://www.kamaya-siargao.com/exclusive-offer" 
      target="_blank" 
      rel="noopener noreferrer"
      className="select-none cursor-pointer hover:opacity-80 transition-opacity duration-200"
    >
      <img 
        src={isDark ? "/branding/by-kamaya.svg?v=4" : "/branding/by-kamaya-light.svg"} 
        alt="by Kamaya" 
        className="w-auto transition-all duration-300"
        style={{ height: '20px' }}
      />
    </a>
  )
}

export default function Footer(){
  return (
    <footer className="mt-20 py-10 text-white/70 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 text-sm flex items-center justify-between">
        <ByKamayaFooter />
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  )
}



