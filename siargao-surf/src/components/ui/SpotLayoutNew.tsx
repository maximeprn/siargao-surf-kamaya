import SurfQualityGauge from '@/components/ui/SurfQualityGauge'
import SwellCompassWithLegend from '@/components/ui/SwellCompassWithLegend'
import TideCurve from '@/components/ui/TideCurve'
import AISpotReport from '@/components/ui/AISpotReport'
import { siargaoSpotsComplete } from '@/lib/spot-configs'
import type { SpotMeta } from '@/lib/spot-configs'
import type { MarineWeatherData } from '@/lib/marine-weather'

interface SpotLayoutNewProps {
  spotId?: string
  spotName: string
  location: string
  effectiveHeight: number | null
  gaugeLabel: string
  weather: MarineWeatherData | null
  tideHeight: number
  quality: Record<string, unknown> | null
  calculateWaveEnergy: (height: number, period: number) => number
  degreesToCardinal: (degrees: number) => string
  fallbackText: string
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-glass last:border-b-0">
      <span className="text-theme-muted text-sm">{label}</span>
      <span className="text-theme-primary font-medium text-sm">{value}</span>
    </div>
  )
}

export default function SpotLayoutNew({ 
  spotId, 
  spotName, 
  location, 
  effectiveHeight, 
  gaugeLabel, 
  weather, 
  tideHeight, 
  quality,
  calculateWaveEnergy,
  degreesToCardinal,
  fallbackText
}: SpotLayoutNewProps) {
  return (
    <section>
      <div className="eyebrow">Now · Quick spot summary</div>
      <div className="rule mt-4" />
      
      <div className="grid grid-cols-1 lg:grid-cols-[0.6fr_0.4fr] gap-12 lg:gap-24 mt-10 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
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

          {/* Tide Chart - réduit de 20% */}
          <div>
            <div className="eyebrow">Tide chart</div>
            <div className="rule mt-4" />
            <div className="mt-4 scale-80 origin-left">
              <TideCurve 
                tideData={{
                  current: tideHeight,
                  hourly: weather?.hourly || { time: [], sea_level_height_msl: [] }
                }}
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

          {/* Weather Stats - grille 2x3 comme dans l'image demandée */}
          <div>
            <div className="eyebrow">Conditions</div>
            <div className="rule mt-4" />
            <div className="mt-5 grid grid-cols-2 gap-6">
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

          {/* Spot Details simplifiés - Features et Hazards seulement */}
          <div>
            <div className="eyebrow">Spot details</div>
            <div className="rule mt-4" />
            <div className="mt-5 space-y-4">
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
    </section>
  )
}