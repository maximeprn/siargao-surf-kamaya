'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="
        relative p-2 rounded-lg transition-all duration-300 ease-out
        dark:bg-white/10 dark:hover:bg-white/20 dark:ring-1 dark:ring-white/20
        light:bg-[#1C3340]/10 light:hover:bg-[#1C3340]/20 light:ring-1 light:ring-[#1C3340]/20
        group
      "
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun icon for light mode */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
            dark:text-white/70 light:text-[#1C3340]/70
          `}
        />
        
        {/* Moon icon for dark mode */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-out
            ${isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
            dark:text-white/70 light:text-[#1C3340]/70
          `}
        />
      </div>
    </button>
  )
}