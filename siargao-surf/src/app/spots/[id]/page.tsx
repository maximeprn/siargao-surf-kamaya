import { supabase } from '@/lib/supabase'
import { getMarineWeatherData, getWaveQuality } from '@/lib/marine-weather'
import MarineWeatherWidget from '@/components/MarineWeatherWidget'
import Link from 'next/link'
import { ArrowLeft, MapPin, Waves, AlertTriangle, Car } from 'lucide-react'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SpotLayoutNew from '@/components/ui/SpotLayoutNew'
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

export default async function SpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!supabase) {
    notFound()
  }
  const { data: spot, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !spot) {
    notFound()
  }

  // Get marine weather data for this spot
  const weather = await getMarineWeatherData(spot.latitude, spot.longitude)

  // Compute effective wave height and surf quality for this spot
  const meta = siargaoSpotsComplete[spot.name] as SpotMeta | undefined
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
  }, meta) : (weather?.current.wave_height ?? null)

  const quality = weather && effective != null ? getWaveQuality({
    waveHeight: effective,
    wavePeriod: weather.current.wave_period,
    waveDirection: weather.current.wave_direction,
    windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed / 3.6 : undefined,
    windDirection: weather.weather.current.winddirection,
    tideStage: undefined
  }, spotConfigs[spot.name] || defaultSpotConfig) : null

  const gaugeLabel = quality ? (
    quality.score >= 96 ? 'EXCELLENT' :
    quality.score >= 90 ? 'EPIC' :
    quality.score >= 75 ? 'VERY GOOD' :
    quality.score >= 60 ? 'GOOD' :
    quality.score >= 45 ? 'FAIR' :
    quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
  ) : 'FAIR'

  // helper removed (not used)

  return (
    <div className="min-h-screen bg-teal text-ink-on-teal">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="mb-6">
          <Link href="/spots" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" />
            All spots
          </Link>
        </div>

        {/* Nouveau layout pour tous les spots */}
        <SpotLayoutNew
          spotId={spot.id}
          spotName={spot.name}
          location="Siargao Island, Philippines"
          effectiveHeight={effective}
          gaugeLabel={gaugeLabel}
          weather={weather}
          tideHeight={tideHeight}
          quality={quality}
          calculateWaveEnergy={calculateWaveEnergy}
          degreesToCardinal={degreesToCardinal}
          fallbackText={weather ? (
            `Swell ${Math.round(weather.current.swell_wave_period)}s from ${Math.round(weather.current.swell_wave_direction)}°, wind ${Math.round((weather.weather.current.windspeed||0))} km/h at ${Math.round(weather.weather.current.winddirection||0)}°. Tide ${tideHeight.toFixed(1)}m.`
          ) : (
            'Loading live report…'
          )}
        />

        {/* Optional: original description block */}
        {spot.description && (
          <div className="rounded-lg overflow-hidden my-8 border border-white/10 bg-white/5 p-6">
            <p className="text-ink-on-teal/90 text-base leading-relaxed">{spot.description}</p>
          </div>
        )}

        {/* Detailed Marine Weather */}
        {weather && (
          <div className="mb-8">
            <MarineWeatherWidget weather={weather} spotName={spot.name} />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-lg p-6 bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Waves className="h-5 w-5" />
              Wave Conditions
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Best Swell:</span><span className="font-medium">{spot.best_swell_direction || 'Any'}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Best Wind:</span><span className="font-medium">{spot.best_wind_direction || 'Any'}</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Best Tide:</span><span className="font-medium capitalize">{spot.best_tide || 'All'}</span></div>
            </div>
          </div>

          <div className="rounded-lg p-6 bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-muted">Latitude:</span><span className="font-medium">{spot.latitude}°</span></div>
              <div className="flex justify-between"><span className="text-ink-muted">Longitude:</span><span className="font-medium">{spot.longitude}°</span></div>
            </div>
          </div>
        </div>

        {spot.access_info && (
          <div className="rounded-lg p-6 mt-8 bg-white/5 border border-white/10">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Car className="h-5 w-5" />
              Access Information
            </h2>
            <p>{spot.access_info}</p>
          </div>
        )}

        {spot.hazards && spot.hazards.length > 0 && (
          <div className="rounded-lg p-6 mt-8 bg-yellow-950/20 border border-yellow-500/30">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Safety Information
            </h2>
            <ul className="space-y-1 text-yellow-200/90 text-sm">
              {spot.hazards.map((hazard: string, index: number) => (
                <li key={index}>• {hazard}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}