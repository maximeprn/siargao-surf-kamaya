'use client'

import { useThemeOptional } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const themeContext = useThemeOptional()
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted || !themeContext) {
    // Return a placeholder during SSR or if context isn't available
    return (
      <div className="p-2 rounded-lg w-9 h-9" style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
        <Moon className="w-5 h-5 text-theme-muted" />
      </div>
    )
  }

  const { theme, toggleTheme, isDark } = themeContext

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-all duration-300 ease-out group"
      style={{ 
        backgroundColor: 'var(--glass-bg)', 
        border: '1px solid var(--glass-border)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--glass-bg)'
        e.currentTarget.style.opacity = '0.8'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1'
      }}
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
            text-theme-muted
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
            text-theme-muted
          `}
        />
      </div>
    </button>
  )
}