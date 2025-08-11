import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SurfQualityGauge from '@/components/ui/SurfQualityGauge'
import SwellCompassWithLegend from '@/components/ui/SwellCompassWithLegend'
import TideCurve from '@/components/ui/TideCurve'
import AISpotReport from '@/components/ui/AISpotReport'
import SpotLayoutNew from '@/components/ui/SpotLayoutNew'
import SurfPhotoCardAqua from '@/components/ui/SurfPhotoCardAqua'
import SpotDetailsOverlay from '@/components/ui/SpotDetailsOverlay'
import { supabase } from '@/lib/supabase'
import { getMarineWeatherData, getWaveQuality } from '@/lib/marine-weather'
import { spotConfigs, defaultSpotConfig, siargaoSpotsComplete } from '@/lib/spot-configs'
import type { SpotMeta } from '@/lib/spot-configs'
import { effectiveWaveHeight } from '@/lib/wave-height-correction'

// Convert degrees to cardinal direction
function degreesToCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// Calculate wave energy index
function calculateWaveEnergy(height: number, period: number): number {
  // Wave energy index formula: E_index[kJ] = 50 × H_s² × T
  // H_s = significant wave height (m)
  // T = wave period (s)
  const energy = 50 * height * height * period
  return Math.round(energy)
}

export default async function Home() {
  // Flag pour tester le nouveau layout - changez à true pour le nouveau layout
  const useNewLayout = true
  // Use Cloud 9 as the hero spot (fallback to static meta coords when DB is unavailable)
  type Coords = { latitude: number; longitude: number } | null
  let c9: Coords = null
  if (supabase) {
    const { data } = await supabase
      .from('spots')
      .select('latitude, longitude')
      .eq('name', 'Cloud 9')
      .single()
    c9 = data as Coords
  }

  const meta = siargaoSpotsComplete['Cloud 9'] as SpotMeta
  const coords = c9 ? { lat: c9.latitude, lon: c9.longitude } : (meta?.coords ? { lat: meta.coords.lat, lon: meta.coords.lon } : null)
  const weather = coords ? await getMarineWeatherData(coords.lat, coords.lon) : null
  const tideHeight = weather?.current.sea_level_height_msl ?? 1.0
  const effective = weather && meta ? effectiveWaveHeight({
    waveHeight: weather.current.wave_height,
    swellHeight: weather.current.swell_wave_height,
    windWaveHeight: weather.current.wind_wave_height,
    wavePeriod: weather.current.wave_period,
    swellPeriod: weather.current.swell_wave_period,
    waveDirection: weather.current.wave_direction,
    swellDirection: weather.current.swell_wave_direction,
    tideHeight
  }, meta) : null

  // Compute live surf quality -> gauge label
  const quality = weather && effective != null ? getWaveQuality({
    waveHeight: effective,
    wavePeriod: weather.current.wave_period,
    waveDirection: weather.current.wave_direction,
    windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed / 3.6 : undefined,
    windDirection: weather.weather.current.winddirection,
    tideStage: undefined
  }, spotConfigs['Cloud 9'] || defaultSpotConfig) : null

  // Apply size-based score limits
  let gaugeLabel = 'POOR'
  if (quality && effective !== null) {
    if (effective < 0.3) {
      // Size < 0.3m: maximum POOR
      gaugeLabel = 'POOR'
    } else if (effective < 0.5) {
      // Size < 0.5m: maximum POOR-FAIR
      gaugeLabel = quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    } else if (effective < 0.8) {
      // Size < 0.8m: maximum FAIR
      gaugeLabel = quality.score >= 45 ? 'FAIR' :
                   quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    } else {
      // Size >= 0.8m: full range
      gaugeLabel = quality.score >= 96 ? 'EXCELLENT' :
                   quality.score >= 90 ? 'EPIC' :
                   quality.score >= 75 ? 'VERY GOOD' :
                   quality.score >= 60 ? 'GOOD' :
                   quality.score >= 45 ? 'FAIR' :
                   quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    }
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 space-y-20">
        {/* Hero Image avec effets aquatiques et spot details */}
        <SurfPhotoCardAqua 
          src="/images/CloudNine.webp"
          causticsOpacity={0.28}
        >
          <SpotDetailsOverlay spotName="Cloud 9" />
        </SurfPhotoCardAqua>
        {useNewLayout ? (
          <SpotLayoutNew
            spotName="Cloud 9"
            location="Siargao Island, Philippines"
            effectiveHeight={effective}
            gaugeLabel={gaugeLabel}
            weather={weather}
            tideHeight={tideHeight}
            calculateWaveEnergy={calculateWaveEnergy}
            degreesToCardinal={degreesToCardinal}
            fallbackText={weather ? (
              `Swell ${Math.round(weather.current.swell_wave_period)}s from ${Math.round(weather.current.swell_wave_direction)}°, wind ${Math.round((weather.weather.current.windspeed||0))} km/h at ${Math.round(weather.weather.current.winddirection||0)}°. Tide ${tideHeight.toFixed(1)}m.`
            ) : (
              'Loading live report…'
            )}
          />
        ) : (
          <section>
            <div className="eyebrow">Now · Quick spot summary</div>
            <div className="rule mt-4" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 mt-10 items-start">
              <div className="lg:col-span-7 text-center lg:text-left">
                <div className="subtle">Today at</div>
                <h1 className="display mt-2">Cloud&nbsp;9</h1>
                <div className="subtle mt-2">Siargao Island, Philippines</div>
                <div className="eyebrow mt-10">Wave height</div>
                <div className="big-metric mt-4 sm:mt-5">
                  {effective ? `${effective.toFixed(1)} m` : '—'}
                </div>
                <div className="mt-12 max-w-[440px] mx-auto lg:mx-0">
                  <SurfQualityGauge rating={gaugeLabel} />
                </div>
                <div className="mt-16 lg:hidden text-center">
                  <div className="eyebrow">Swell and Wind direction</div>
                  <div className="mt-3 inline-block">
                    <SwellCompassWithLegend 
                      size={240} 
                      swellDirection={weather?.current.swell_wave_direction || 0}
                      windDirection={weather?.weather.current.winddirection || 0}
                      swellHeight={weather?.current.swell_wave_height || 0}
                      windSpeed={weather?.weather.current.windspeed || 0}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div>
                  <div className="eyebrow">Surf report</div>
                  <div className="rule mt-4" />
                  <div className="mt-5">
                    <AISpotReport 
                      spotName="Cloud 9"
                      fallbackText={weather ? (
                        `Swell ${Math.round(weather.current.swell_wave_period)}s from ${Math.round(weather.current.swell_wave_direction)}°, wind ${Math.round((weather.weather.current.windspeed||0))} km/h at ${Math.round(weather.weather.current.winddirection||0)}°. Tide ${tideHeight.toFixed(1)}m.`
                      ) : (
                        'Loading live report…'
                      )}
                    />
                  </div>
                </div>
                <div className="rule mt-12 mb-10 lg:w-full hidden lg:block" />
                {/* Desktop grid with all items */}
                <div className="hidden lg:block">
                  <div className="kv-grid">
                  <div className="kv"><div className="kv-k">Wind</div><div className="kv-v">{weather ? `${Math.round(weather.weather.current.windspeed)} km/h` : '—'}</div></div>
                  <div className="kv"><div className="kv-k">Wind Dir</div><div className="kv-v">{weather ? `${Math.round(weather.weather.current.winddirection)}° (${degreesToCardinal(weather.weather.current.winddirection)})` : '—'}</div></div>
                  <div className="kv"><div className="kv-k">Swell</div><div className="kv-v">{weather ? `${weather.current.swell_wave_height?.toFixed(1)} m` : '—'}</div></div>
                  <div className="kv"><div className="kv-k">Swell Dir</div><div className="kv-v">{weather ? `${Math.round(weather.current.swell_wave_direction)}° (${degreesToCardinal(weather.current.swell_wave_direction)})` : '—'}</div></div>
                  <div className="kv"><div className="kv-k">Period</div><div className="kv-v">{weather ? `${weather.current.wave_period?.toFixed(1)} s` : '—'}</div></div>
                  <div className="kv"><div className="kv-k">Energy</div><div className="kv-v">{weather ? `${calculateWaveEnergy(weather.current.swell_wave_height, weather.current.wave_period)} kJ` : '—'}</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-20 lg:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 lg:gap-20 items-stretch">
              <div className="lg:col-span-7 text-center lg:text-left flex flex-col">
                <div className="eyebrow">Tide chart</div>
                <div className="rule mt-4" />
                <div className="flex-grow flex items-end mt-2">
                  <div className="w-full max-w-[440px] mx-auto lg:mx-0">
                    <TideCurve 
                      tideData={{
                        current: tideHeight,
                        hourly: weather?.hourly || { time: [], sea_level_height_msl: [] }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="hidden lg:block">
                  <div className="eyebrow">Swell and Wind direction</div>
                  <div className="rule mt-4" />
                  <div className="mt-6">
                    <SwellCompassWithLegend 
                      size={240} 
                      swellDirection={weather?.current.swell_wave_direction || 0}
                      windDirection={weather?.weather.current.winddirection || 0}
                      swellHeight={weather?.current.swell_wave_height || 0}
                      windSpeed={weather?.weather.current.windspeed || 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
