'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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
  const [groupedSpots, setGroupedSpots] = useState<Record<string, Spot[]>>({})

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
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ 
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--glass-border)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-glass">
          <h2 className="text-lg font-medium text-theme-primary">Surf Spots</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-theme-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-full pb-20">
          <div className="p-6 space-y-8">
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
                            <div className="text-theme-primary font-normal text-lg">{spot.name}</div>
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