'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark') // Default to dark mode
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check localStorage only after component mounts
    const savedTheme = localStorage.getItem('siargao-surf-theme') as Theme
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('siargao-surf-theme', theme)
      // Apply theme class to html element
      document.documentElement.className = theme
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="dark">{children}</div>
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      toggleTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light'
    }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}