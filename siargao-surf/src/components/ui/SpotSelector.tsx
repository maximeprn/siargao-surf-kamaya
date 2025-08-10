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
    other: spots.filter(spot => !['walk', 'boat'].includes(spot.access))
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
    }, 300) // Délai de 300ms avant fermeture
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <span 
        className="hover:text-white cursor-pointer px-3 py-2 rounded-lg transition-all duration-200"
        style={{
          background: isOpen ? 'rgba(27, 51, 64, 0.6)' : 'transparent',
          backdropFilter: isOpen ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: isOpen ? 'blur(10px)' : 'none',
          border: isOpen ? '1px solid rgba(255, 255, 255, 0.14)' : '1px solid transparent',
          borderRadius: '8px'
        }}
      >
        Spots
      </span>
      
      {/* Dropdown */}
      {isOpen && (
        <div 
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 z-50"
          style={{ 
            background: 'rgba(27, 51, 64, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4">
            <h3 className="text-white/90 font-medium text-sm mb-3">Siargao Surf Spots</h3>
            
            {/* Walk-accessible spots */}
            <div className="mb-4">
              <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Walk Access</h4>
              <div className="space-y-1">
                {groupedSpots.walk.map((spot) => (
                  <Link 
                    key={spot.name}
                    href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
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

            {/* Boat-accessible spots */}
            <div className="mb-4">
              <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Boat Access</h4>
              <div className="space-y-1">
                {groupedSpots.boat.map((spot) => (
                  <Link 
                    key={spot.name}
                    href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
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

            {/* Other access spots */}
            {groupedSpots.other.length > 0 && (
              <div>
                <h4 className="text-white/60 text-xs uppercase tracking-wide mb-2">Other Access</h4>
                <div className="space-y-1">
                  {groupedSpots.other.map((spot) => (
                    <Link 
                      key={spot.name}
                      href={`/spots/${encodeURIComponent(spot.name.toLowerCase().replace(/\s+/g, '-'))}`}
                      className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
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