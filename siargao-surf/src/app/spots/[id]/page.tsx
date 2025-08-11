import { supabase } from '@/lib/supabase'
import { getMarineWeatherData, getWaveQuality } from '@/lib/marine-weather'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SurfPhotoCardAqua from '@/components/ui/SurfPhotoCardAqua'
import SpotDetailsOverlay from '@/components/ui/SpotDetailsOverlay'
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

  // Convert slug to spot name (e.g., "cloud-9" to "Cloud 9")
  const spotNameFromSlug = id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  // Try with the slug-converted name (e.g., "cloud-9" to "Cloud 9")
  const { data: spot, error } = await supabase
    .from('spots')
    .select('*')
    .eq('name', spotNameFromSlug)
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

  // helper removed (not used)

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 space-y-20">
        {/* Hero Image avec effets aquatiques et spot details */}
        <SurfPhotoCardAqua 
          src="/images/CloudNine.png"
          causticsOpacity={0.28}
        >
          <SpotDetailsOverlay spotName={spot.name} />
        </SurfPhotoCardAqua>

        <SpotLayoutNew 
          spotId={spot.id}
          spotName={spot.name}
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
      </main>
      <Footer />
    </div>
  )
}