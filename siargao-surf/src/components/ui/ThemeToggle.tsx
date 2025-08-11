'use client'

import { useThemeOptional } from '@/contexts/ThemeContext'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const animationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const themeContext = useThemeOptional()
  
  // Prevent hydration mismatch and show initial animation
  useEffect(() => {
    setMounted(true)
    
    // Show animation after page loads
    const initialTimeout = setTimeout(() => {
      setShowAnimation(true)
      animationTimeoutRef.current = setTimeout(() => setShowAnimation(false), 1500)
    }, 800)
    
    return () => {
      clearTimeout(initialTimeout)
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current)
    }
  }, [])
  
  if (!mounted || !themeContext) {
    // Return a clickable placeholder during SSR or if context isn't available
    return (
      <button 
        className="p-2 w-9 h-9 flex items-center justify-center"
        onClick={() => {
          // Try to toggle theme even during hydration
          if (themeContext?.toggleTheme) {
            themeContext.toggleTheme()
          }
        }}
        aria-label="Toggle theme"
      >
        <Image 
          src="/branding/moon-icon-round.svg" 
          alt="Dark mode" 
          width={20} 
          height={20} 
          className="w-5 h-5" 
          style={{ filter: 'brightness(0) invert(1)' }} 
        />
      </button>
    )
  }

  const { toggleTheme, isDark } = themeContext
  
  // Only show preview on hover (desktop only), not during animation on mobile
  const showPreview = isHovering
  
  // Handle proximity detection (desktop only)
  const handleMouseProximity = () => {
    // Only trigger on devices that support hover (desktop)
    if (window.matchMedia('(hover: hover)').matches) {
      if (!showAnimation && !animationTimeoutRef.current) {
        setShowAnimation(true)
        animationTimeoutRef.current = setTimeout(() => {
          setShowAnimation(false)
          animationTimeoutRef.current = undefined
        }, 1500)
      }
    }
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseProximity}
    >
      {/* Invisible expanded hover area for proximity detection - desktop only */}
      <div className="absolute -inset-4 z-0 hidden md:block" />
      
      <button
        onClick={toggleTheme}
        className={`relative p-2 transition-all duration-300 ease-out group z-10 ${
          showAnimation ? 'animate-pulse' : ''
        }`}
        onMouseEnter={() => {
          // Only set hovering on devices that support hover
          if (window.matchMedia('(hover: hover)').matches) {
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => setIsHovering(false)}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
      <div className="relative w-5 h-5">
        {/* Sun icon - show in light mode, OR when hovering/animating in dark mode */}
        <Image 
          src="/branding/sun-icon.svg"
          alt="Light mode"
          width={20}
          height={20}
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-out
            ${(!isDark && !showPreview) || (isDark && showPreview)
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
            }
          `}
          style={{ 
            // Always use the color of the current theme
            filter: isDark 
              ? 'brightness(0) invert(1)' // White in dark mode (even on hover)
              : 'brightness(0) saturate(100%) invert(15%) sepia(25%) saturate(1352%) hue-rotate(161deg) brightness(94%) contrast(92%)' // Blue in light mode
          }}
        />
        
        {/* Moon icon - show in dark mode, OR when hovering/animating in light mode */}
        <Image 
          src="/branding/moon-icon-round.svg"
          alt="Dark mode"
          width={20}
          height={20}
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 ease-out
            ${(isDark && !showPreview) || (!isDark && showPreview)
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
          style={{ 
            // Always use the color of the current theme
            filter: isDark 
              ? 'brightness(0) invert(1)' // White in dark mode
              : 'brightness(0) saturate(100%) invert(15%) sepia(25%) saturate(1352%) hue-rotate(161deg) brightness(94%) contrast(92%)' // Blue in light mode (even on hover)
          }}
        />
      </div>
    </button>
    </div>
  )
}