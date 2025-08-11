'use client'

import { useState } from 'react'
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
        <div className="eyebrow">Conditions</div>
        
        {/* Desktop navigation - toggle button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Toggle button labeled "Optimal" */}
          <button
            onClick={() => setCurrentSlide(currentSlide === 0 ? 1 : 0)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
              currentSlide === 1
                ? 'bg-theme-primary text-white'
                : 'bg-glass text-theme-muted hover:bg-theme-primary/20 hover:text-theme-primary'
            }`}
          >
            Optimal
          </button>
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

      {/* Mobile slide indicator */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {[0, 1].map((slide) => (
          <button
            key={slide}
            onClick={() => setCurrentSlide(slide)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === slide 
                ? 'bg-theme-primary' 
                : 'bg-theme-muted opacity-40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}