'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import type { MarineWeatherData } from '@/lib/marine-weather'
import type { SpotMeta } from '@/lib/spot-configs'

interface ConditionsSliderProps {
  weather: MarineWeatherData | null
  spotMeta: SpotMeta | undefined
  calculateWaveEnergy: (height: number, period: number) => number
  degreesToCardinal: (degrees: number) => string
}

export default function ConditionsSlider({ 
  weather, 
  spotMeta,
  calculateWaveEnergy,
  degreesToCardinal
}: ConditionsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { isDark } = useTheme()

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % 2)
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + 2) % 2)

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentSlide < 1) {
      nextSlide()
    }
    if (isRightSwipe && currentSlide > 0) {
      prevSlide()
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="eyebrow">Conditions</div>
          
          {/* Mobile slide indicators - visible on mobile only */}
          <div className="flex gap-1.5 md:hidden items-center">
            {[0, 1].map((slide) => (
              <div
                key={slide}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === slide 
                    ? isDark ? 'bg-white' : 'bg-gray-900'
                    : isDark ? 'bg-white/30' : 'bg-gray-900/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Desktop navigation - SVG toggle switch */}
        <div className="hidden md:flex flex-col items-center gap-2">
          {/* SVG Toggle switch */}
          <button
            onClick={() => setCurrentSlide(currentSlide === 0 ? 1 : 0)}
            className="focus:outline-none transition-transform duration-200 hover:scale-105"
          >
            <Image
              src={
                currentSlide === 1 
                  ? (isDark ? '/branding/switch-on.svg?v=2' : '/branding/switch-on-light.svg?v=2')
                  : (isDark ? '/branding/switch-off.svg?v=2' : '/branding/switch-off-light.svg?v=2')
              }
              alt={currentSlide === 1 ? 'Switch On' : 'Switch Off'}
              width={44}
              height={24}
              className="transition-all duration-200"
            />
          </button>
          
          {/* Label below switch */}
          <span className="text-[10px] font-medium text-theme-muted">
            {currentSlide === 0 ? 'Current' : 'Optimal'}
          </span>
        </div>
      </div>

      <div className="rule" />

      {/* Slider container */}
      <div 
        className="overflow-hidden mt-5"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 1: Current Conditions */}
          <div className="w-full flex-shrink-0">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">WIND</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${Math.round(weather.weather.current.windspeed)} km/h` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">SWELL</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${weather.current.swell_wave_height?.toFixed(1)} m` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">PERIOD</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${weather.current.wave_period?.toFixed(1)} s` : '—'}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">WIND DIR</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${Math.round(weather.weather.current.winddirection)}° (${degreesToCardinal(weather.weather.current.winddirection)})` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">SWELL DIR</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${Math.round(weather.current.swell_wave_direction)}° (${degreesToCardinal(weather.current.swell_wave_direction)})` : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-theme-muted uppercase tracking-wider">ENERGY</div>
                  <div className="text-lg font-medium text-theme-primary">
                    {weather ? `${calculateWaveEnergy(weather.current.swell_wave_height, weather.current.wave_period)} kJ` : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slide 2: Optimal Conditions */}
          <div className="w-full flex-shrink-0">
            <div className="grid grid-cols-2 gap-6">
              {spotMeta ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">OPTIMAL WIND</div>
                      <div className="text-lg font-medium text-theme-primary">
                        5-15 km/h
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">OPTIMAL SWELL</div>
                      <div className="text-lg font-medium text-theme-primary">
                        {spotMeta.optimalHeight 
                          ? `${spotMeta.optimalHeight[0]}-${spotMeta.optimalHeight[1]} m`
                          : '1.5-3.0 m'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">OPTIMAL PERIOD</div>
                      <div className="text-lg font-medium text-theme-primary">
                        {spotMeta.swellPeriod 
                          ? `${spotMeta.swellPeriod[0]}-${spotMeta.swellPeriod[1]} s`
                          : '8-14 s'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">WIND DIR</div>
                      <div className="text-lg font-medium text-theme-primary">
                        {spotMeta.bestWind 
                          ? `${degreesToCardinal(spotMeta.bestWind[0])}-${degreesToCardinal(spotMeta.bestWind[1])}`
                          : 'Offshore'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">SWELL DIR</div>
                      <div className="text-lg font-medium text-theme-primary">
                        {spotMeta.swellWindow 
                          ? `${degreesToCardinal(spotMeta.swellWindow[0])}-${degreesToCardinal(spotMeta.swellWindow[1])}`
                          : 'E-SE'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-theme-muted uppercase tracking-wider">BEST TIDE</div>
                      <div className="text-lg font-medium text-theme-primary">
                        {spotMeta.tideWindow 
                          ? `${spotMeta.tideWindow[0]}-${spotMeta.tideWindow[1]} m`
                          : spotMeta.tidalRange || 'Mid-High'
                        }
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center text-theme-muted">
                  <p>Optimal conditions data not available for this spot.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}