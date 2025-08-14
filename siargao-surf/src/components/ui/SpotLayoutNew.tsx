import SurfQualityGauge from '@/components/ui/SurfQualityGauge'
import SwellCompassWithLegend from '@/components/ui/SwellCompassWithLegend'
import TideCurve from '@/components/ui/TideCurve'
import dynamic from 'next/dynamic'

const SevenDayPrimarySwell = dynamic(() => import('@/components/ui/SevenDayPrimarySwell'), {
  loading: () => (
    <div className="bg-feature-bg border border-feature-ring rounded-lg p-6">
      <div className="eyebrow mb-4">7-Day Forecast</div>
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
      </div>
    </div>
  ),
  ssr: false
})
import AISpotReport from '@/components/ui/AISpotReport'
import ConditionsSlider from '@/components/ui/ConditionsSlider'
import { siargaoSpotsComplete } from '@/lib/spot-configs'
import type { SpotMeta } from '@/lib/spot-configs'
import type { MarineWeatherData } from '@/lib/marine-weather'
import type { TideData } from '@/lib/worldtides'

interface SpotLayoutNewProps {
  spotId?: string
  spotName: string
  location: string
  effectiveHeight: number | null
  gaugeLabel: string
  weather: MarineWeatherData | null
  tideData: TideData | null
  tideHeight: number
  calculateWaveEnergy: (height: number, period: number) => number
  degreesToCardinal: (degrees: number) => string
  fallbackText: string
}


export default function SpotLayoutNew({ 
  spotId, 
  spotName, 
  location, 
  effectiveHeight, 
  gaugeLabel, 
  weather, 
  tideData,
  tideHeight,
  calculateWaveEnergy,
  degreesToCardinal,
  fallbackText
}: SpotLayoutNewProps) {
  return (
    <section>
      <div className="eyebrow">Now · Quick spot summary</div>
      <div className="rule mt-4" />
      
      <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_0.4fr] gap-12 lg:gap-24 mt-10 items-stretch">
        {/* LEFT COLUMN */}
        <div className="flex flex-col h-full">
          {/* Top row: Title à gauche, Compass à droite */}
          <div className="grid grid-cols-2 gap-8 items-end">
            {/* Spot Title + Wave Height + Quality */}
            <div>
              <div className="subtle">Today at</div>
              <h1 className="display mt-2">{spotName}</h1>
              <div className="subtle mt-2">{location}</div>
              
              {/* Wave Height sous le titre, aligné à gauche */}
              <div className="mt-8 text-left">
                <div className="eyebrow">Wave height</div>
                <div className="big-metric mt-4">
                  {effectiveHeight ? `${effectiveHeight.toFixed(1)} m` : '—'}
                </div>
              </div>
              
              {/* Quality gauge sous wave height */}
              <div className="mt-8">
                <SurfQualityGauge rating={gaugeLabel} />
              </div>
            </div>

            {/* Compass à droite - bas aligné avec le bas du gauge */}
            <div className="flex justify-center">
              <SwellCompassWithLegend 
                size={200} 
                swellDirection={weather?.current.swell_wave_direction || 0}
                windDirection={weather?.weather.current.winddirection || 0}
                swellHeight={weather?.current.swell_wave_height || 0}
                windSpeed={weather?.weather.current.windspeed || 0}
              />
            </div>
          </div>

          {/* Tide Chart - centré verticalement sur mobile, ancré en bas sur desktop */}
          <div className="mt-8 lg:mt-auto text-left">
            <div className="eyebrow mt-4">Tide chart</div>
            <div className="rule mt-4" />
            <div className="mt-4 w-[80vw] max-w-[500px] lg:w-full lg:max-w-none lg:scale-80 lg:origin-bottom-left">
              <TideCurve 
                tideData={tideData ? {
                  current: tideData.current,
                  hourly: tideData.hourly,
                  extremes: tideData.extremes
                } : undefined}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Surf Report */}
          <div>
            <div className="eyebrow">Surf report</div>
            <div className="rule mt-4" />
            <div className="mt-5">
              <AISpotReport 
                spotId={spotId}
                spotName={spotName}
                fallbackText={fallbackText}
              />
            </div>
          </div>

          {/* Conditions Slider - 2 slides avec conditions actuelles et optimales */}
          <div>
            <ConditionsSlider 
              weather={weather}
              spotMeta={siargaoSpotsComplete[spotName] as SpotMeta | undefined}
              calculateWaveEnergy={calculateWaveEnergy}
              degreesToCardinal={degreesToCardinal}
            />
          </div>

          {/* Spot Details simplifiés - Features et Hazards seulement */}
          <div>
            <div className="eyebrow">Spot details</div>
            <div className="rule mt-4" />
            <div className="mt-4 space-y-4 pb-4">
              {(() => {
                const spotMeta = siargaoSpotsComplete[spotName] as SpotMeta | undefined
                if (!spotMeta) return (
                  <div className="text-theme-muted text-sm">No detailed information available for this spot.</div>
                )

                return (
                  <>
                    {/* Features */}
                    {spotMeta.features && Object.keys(spotMeta.features).length > 0 && (
                      <div>
                        <div className="text-theme-muted text-xs uppercase tracking-wider mb-3">FEATURES</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(spotMeta.features).map(([key, value]) => (
                            value === true && (
                              <span key={key} className="px-3 py-1.5 rounded-md text-xs ring-1 ring-white/20" style={{ backgroundColor: 'var(--feature-bg)', color: 'var(--feature-text)' }}>
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hazards avec étiquettes */}
                    {spotMeta.hazards && spotMeta.hazards.length > 0 && (
                      <div>
                        <div className="text-red-400 text-xs uppercase tracking-wider mb-3">HAZARDS</div>
                        <div className="flex flex-wrap gap-2">
                          {spotMeta.hazards.map((hazard, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-md text-xs ring-1 ring-red-500/30" style={{ backgroundColor: 'var(--hazard-bg)', color: 'var(--hazard-text)' }}>
                              {hazard.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Full-width 7-day Primary Swell section after existing blocks */}
          <div className="mt-16">
            <SevenDayPrimarySwell weather={weather} />
      </div>
    </section>
  )
}