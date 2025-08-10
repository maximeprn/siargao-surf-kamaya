'use client'

import SwellCompass from './SwellCompass'
import { useState, useRef } from 'react'

interface SwellCompassWithLegendProps {
  size?: number
  swellDirection?: number
  windDirection?: number
  swellHeight?: number
  windSpeed?: number
}

export default function SwellCompassWithLegend({
  size = 240,
  swellDirection = 0,
  windDirection = 0,
  swellHeight = 0,
  windSpeed = 0
}: SwellCompassWithLegendProps) {
  const [transform, setTransform] = useState('perspective(400px) rotateX(0deg) rotateY(0deg)')
  const [isHovered, setIsHovered] = useState(false)
  const compassRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!compassRef.current) return
    
    const rect = compassRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculer la distance et l'angle par rapport au centre
    const deltaX = e.clientX - centerX
    const deltaY = e.clientY - centerY
    
    // Limiter l'inclinaison (max 12 degrés pour plus de subtilité)
    const maxTilt = 12
    const tiltX = Math.max(-maxTilt, Math.min(maxTilt, (deltaY / rect.height) * maxTilt * 2))
    const tiltY = Math.max(-maxTilt, Math.min(maxTilt, (-deltaX / rect.width) * maxTilt * 2))
    
    setTransform(`perspective(400px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTransform('perspective(400px) rotateX(0deg) rotateY(0deg)')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        ref={compassRef}
        className={`transition-transform ease-out ${
          isHovered ? 'duration-100' : 'duration-700'
        }`}
        style={{ 
          transform,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SwellCompass 
          size={size}
          swellDirection={swellDirection}
          windDirection={windDirection}
          showWind={true}
        />
      </div>
      
      {/* Legend - horizontale en dessous */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: 'var(--swell-color)', borderColor: 'var(--swell-color)', opacity: 0.75 }}></div>
          <div>
            <div className="text-theme-primary">Swell</div>
            <div className="text-theme-muted text-xs">{swellHeight?.toFixed(1) || '0.0'}m from {Math.round(swellDirection)}°</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: 'var(--wind-color)', borderColor: 'var(--wind-color)', opacity: 0.6 }}></div>
          <div>
            <div className="text-theme-primary">Wind</div>
            <div className="text-theme-muted text-xs">{Math.round(windSpeed)}km/h from {Math.round(windDirection)}°</div>
          </div>
        </div>
      </div>
    </div>
  )
}