'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useThemeOptional } from '@/contexts/ThemeContext'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface Spot {
  id: string
  name: string
  Area: string
  min_skill: string | null
  wave_type?: string
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const themeContext = useThemeOptional()
  const isDark = themeContext?.isDark ?? true // Default to dark if no context
  const [groupedSpots, setGroupedSpots] = useState<Record<string, Spot[]>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch spots from Supabase when menu opens
  useEffect(() => {
    if (isOpen && supabase) {
      const fetchSpots = async () => {
        const { data } = await supabase!
          .from('spots')
          .select('id, name, Area, min_skill, wave_type')
          .order('name')
        
        if (data) {
          
          // Group by area
          const grouped = data.reduce((acc: Record<string, Spot[]>, spot) => {
            const area = spot.Area || 'Other'
            if (!acc[area]) {
              acc[area] = []
            }
            acc[area].push(spot)
            return acc
          }, {})
          
          // Sort areas by number of spots (most spots first)
          const sortedGrouped = Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length)
            .reduce((acc, [area, spots]) => {
              acc[area] = spots
              return acc
            }, {} as Record<string, Spot[]>)
          
          setGroupedSpots(sortedGrouped)
        }
      }
      
      fetchSpots()
    }
  }, [isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Invisible backdrop to capture clicks outside */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side menu */}
      <div 
        className={`fixed w-80 max-w-[90vw] z-50 rounded-2xl overflow-hidden ${
          isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}
        style={{ 
          top: '72px', // 56px navbar height + 16px spacing
          right: '24px', // Fixed position - translate handles the movement
          height: 'calc(100vh - 88px)', // Full height minus navbar and spacing
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1)',
          transformOrigin: 'top right',
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div 
          className={`p-6 border-b border-glass text-center ${
            isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          }`}
          style={{
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            transitionDelay: isOpen ? '0.2s' : '0s'
          }}
        >
          <h2 className="text-xl font-medium text-theme-primary font-analogue">Surf Spots</h2>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full pb-20">
          <div 
            className={`p-6 space-y-8 ${
              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{
              transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: isOpen ? '0.3s' : '0s'
            }}
          >
            {Object.entries(groupedSpots).length === 0 ? (
              <div className="text-theme-muted text-center">Loading spots...</div>
            ) : (
              Object.entries(groupedSpots).map(([area, areaSpots]) => (
                <div key={area}>
                  <h3 className="text-theme-muted text-xs uppercase tracking-wider mb-4">
                    {area} ({areaSpots.length})
                  </h3>
                  <div className="space-y-2">
                    {areaSpots.map((spot) => (
                      <Link 
                        key={spot.id}
                        href={`/spots/${spot.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="block p-4 rounded-lg transition-colors duration-200 sidemenu-spot-hover"
                        onClick={onClose}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-theme-primary text-lg ${isMobile && !isDark ? 'font-medium' : 'font-normal'}`}>{spot.name}</div>
                            <div className="text-theme-muted text-sm mt-1">
                              {spot.wave_type || 'Reef break'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              spot.min_skill === 'beginner' ? 'bg-green-500/20 text-theme-primary' :
                              spot.min_skill === 'intermediate' ? 'bg-yellow-500/20 text-theme-primary' :
                              spot.min_skill === 'advanced' ? 'bg-red-500/20 text-theme-primary' :
                              'bg-gray-500/20 text-theme-primary'
                            }`}>
                              {spot.min_skill || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}