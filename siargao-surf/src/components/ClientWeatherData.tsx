'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const SpotLayoutNew = dynamic(() => import('@/components/ui/SpotLayoutNew'), {
  loading: () => (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto"></div>
        <p className="mt-4 text-theme-muted">Loading spot layout...</p>
      </div>
    </div>
  )
})
import { spotConfigs, defaultSpotConfig, siargaoSpotsComplete } from '@/lib/spot-configs'
import { effectiveWaveHeight } from '@/lib/wave-height-correction'
import type { SpotMeta } from '@/lib/spot-configs'
import type { MarineWeatherData } from '@/lib/marine-weather'

interface ClientWeatherDataProps {
  spotName: string
  location: string
  coords: { lat: number; lon: number } | null
}

// Helper functions inside the client component
function calculateWaveEnergy(height: number, period: number): number {
  const energy = 50 * height * height * period
  return Math.round(energy)
}

function degreesToCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export default function ClientWeatherData({ 
  spotName, 
  location, 
  coords
}: ClientWeatherDataProps) {
  const [weather, setWeather] = useState<MarineWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [getWaveQuality, setGetWaveQuality] = useState<typeof import('@/lib/marine-weather').getWaveQuality | null>(null)

  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    async function fetchWeatherData() {
      try {
        // Dynamic import to avoid including server code in client bundle
        const { getMarineWeatherData, getWaveQuality } = await import('@/lib/marine-weather')
        const weatherData = await getMarineWeatherData(coords!.lat, coords!.lon)
        setWeather(weatherData)
        setGetWaveQuality(() => getWaveQuality)
      } catch (error) {
        console.error('Failed to fetch weather data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeatherData()
  }, [coords])

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mx-auto"></div>
          <p className="mt-4 text-theme-muted">Loading surf conditions...</p>
        </div>
      </div>
    )
  }

  // Calculate surf data
  const meta = siargaoSpotsComplete[spotName] as SpotMeta | undefined
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

  const quality = weather && effective != null && getWaveQuality ? getWaveQuality({
    waveHeight: effective,
    wavePeriod: weather.current.wave_period,
    waveDirection: weather.current.wave_direction,
    windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed / 3.6 : undefined,
    windDirection: weather.weather.current.winddirection,
    tideStage: undefined
  }, spotConfigs[spotName] || defaultSpotConfig) : null

  // Apply size-based score limits
  let gaugeLabel = 'POOR'
  if (quality && effective !== null) {
    if (effective < 0.3) {
      gaugeLabel = 'POOR'
    } else if (effective < 0.5) {
      gaugeLabel = quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    } else if (effective < 0.8) {
      gaugeLabel = quality.score >= 45 ? 'FAIR' :
                   quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    } else {
      gaugeLabel = quality.score >= 96 ? 'EXCELLENT' :
                   quality.score >= 90 ? 'EPIC' :
                   quality.score >= 75 ? 'VERY GOOD' :
                   quality.score >= 60 ? 'GOOD' :
                   quality.score >= 45 ? 'FAIR' :
                   quality.score >= 25 ? 'POOR-FAIR' : 'POOR'
    }
  }

  const fallbackText = weather ? (
    `Swell ${Math.round(weather.current.swell_wave_period)}s from ${Math.round(weather.current.swell_wave_direction)}°, wind ${Math.round((weather.weather.current.windspeed||0))} km/h at ${Math.round(weather.weather.current.winddirection||0)}°. Tide ${tideHeight.toFixed(1)}m.`
  ) : 'Loading surf conditions...'

  return (
    <SpotLayoutNew
      spotName={spotName}
      location={location}
      effectiveHeight={effective}
      gaugeLabel={gaugeLabel}
      weather={weather}
      tideHeight={tideHeight}
      calculateWaveEnergy={calculateWaveEnergy}
      degreesToCardinal={degreesToCardinal}
      fallbackText={fallbackText}
    />
  )
}