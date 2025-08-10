'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { siargaoSpotsComplete } from '@/lib/spot-configs'

export default function SpotSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const spots = Object.entries(siargaoSpotsComplete).map(([name, meta]) => ({
    name,
    label: meta.label,
    skill: meta.minSkill,
    access: meta.access
  }))

  // Group spots by access type for better organization
  const groupedSpots = {
    walk: spots.filter(spot => spot.access === 'walk'),
    boat: spots.filter(spot => spot.access === 'boat'),
    other: spots.filter(spot => spot.access && !['walk', 'boat'].includes(spot.access))
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 1000) // Délai très long de 1 seconde
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <span 
        className="text-white hover:font-semibold cursor-pointer transition-all duration-200"
      >
        Spots
      </span>
      
      {/* Large invisible bridge area */}
      {isOpen && (
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-96 h-4 z-40"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
      
      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 z-50"
          style={{ 
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px var(--glass-border)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4">
            <h3 className="text-theme-primary font-medium text-sm mb-3">Siargao Surf Spots</h3>
            
            {/* Walk-accessible spots */}
            <div className="mb-4">
              <h4 className="text-theme-muted text-xs uppercase tracking-wide mb-2">Walk Access</h4>
              <div className="space-y-1">
                {groupedSpots.walk.map((spot) => (
                  <Link 
                    key={spot.name}
                    href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-theme-primary text-sm font-medium">{spot.name}</div>
                        <div className="text-theme-muted text-xs">{spot.label.split('—')[1]?.trim() || spot.label}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          spot.skill === 'beginner' ? 'bg-green-500/20 text-green-300' :
                          spot.skill === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {spot.skill}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Boat-accessible spots */}
            <div className="mb-4">
              <h4 className="text-theme-muted text-xs uppercase tracking-wide mb-2">Boat Access</h4>
              <div className="space-y-1">
                {groupedSpots.boat.map((spot) => (
                  <Link 
                    key={spot.name}
                    href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-theme-primary text-sm font-medium">{spot.name}</div>
                        <div className="text-theme-muted text-xs">{spot.label.split('—')[1]?.trim() || spot.label}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          spot.skill === 'beginner' ? 'bg-green-500/20 text-green-300' :
                          spot.skill === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {spot.skill}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other access spots */}
            {groupedSpots.other.length > 0 && (
              <div>
                <h4 className="text-theme-muted text-xs uppercase tracking-wide mb-2">Other Access</h4>
                <div className="space-y-1">
                  {groupedSpots.other.map((spot) => (
                    <Link 
                      key={spot.name}
                      href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/5 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white/90 text-sm font-medium">{spot.name}</div>
                          <div className="text-white/60 text-xs">{spot.label.split('—')[1]?.trim() || spot.label}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            spot.skill === 'beginner' ? 'bg-green-500/20 text-green-300' :
                            spot.skill === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {spot.skill}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}