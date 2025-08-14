'use client'

import { MarineWeatherData, getWindDirection, getSwellDirection, getWeatherDescription, getWaveQuality, metersToFeet, Conditions } from '@/lib/marine-weather'
import { spotConfigs, defaultSpotConfig, siargaoSpotsComplete } from '@/lib/spot-configs'
import { effectiveWaveHeight, estimateTideHeight } from '@/lib/wave-height-correction'
import { Waves, Wind, Compass, TrendingUp, Thermometer, Clock, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MarineWeatherWidgetProps {
  weather: MarineWeatherData
  spotName: string
}

export default function MarineWeatherWidget({ weather, spotName }: MarineWeatherWidgetProps) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [showDebug, setShowDebug] = useState(false)
  const [forecastLayout, setForecastLayout] = useState<'cards' | 'table'>('cards')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Get spot configuration
  const spotConfig = spotConfigs[spotName] || defaultSpotConfig
  const spotMeta = siargaoSpotsComplete[spotName]
  
  // Calculate effective wave height using spot-specific corrections
  // Use estimated tide height for now (API property not available)
  const tideHeight = 1.0 // Default tide height, replace with actual data when available
  
  // Get today's tide range from hourly data to determine relative tide stage
  const getTideStage = (currentHeight: number, hourlyTides: number[]): 'low' | 'mid' | 'high' => {
    const todaysTides = hourlyTides.slice(0, 24) // next 24 hours
    const minTide = Math.min(...todaysTides)
    const maxTide = Math.max(...todaysTides)
    const range = maxTide - minTide
    const third = range / 3
    
    if (currentHeight <= minTide + third) return 'low'
    if (currentHeight >= maxTide - third) return 'high'
    return 'mid'
  }
  
  // For now, use wave height as a proxy for tide stage (temporary fix)
  const tideStage = getTideStage(tideHeight, weather.hourly.wave_height || [])
  
  const effectiveWaves = spotMeta ? effectiveWaveHeight(
    {
      waveHeight: weather.current.wave_height,
      swellHeight: weather.current.swell_wave_height,
      windWaveHeight: weather.current.wind_wave_height,
      wavePeriod: weather.current.wave_period,
      swellPeriod: weather.current.swell_wave_period,
      waveDirection: weather.current.wave_direction,
      swellDirection: weather.current.swell_wave_direction,
      tideHeight: tideHeight
    },
    spotMeta
  ) : weather.current.wave_height
  
  // Prepare conditions for scoring (use corrected wave height)
  const conditions: Conditions = {
    waveHeight: effectiveWaves, // Use spot-corrected wave height for scoring
    wavePeriod: weather.current.wave_period,
    waveDirection: weather.current.wave_direction,
    windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed / 3.6 : undefined, // Convert km/h to m/s
    windDirection: weather.weather.current.winddirection,
    tideStage: tideStage
  }
  
  // Calculate surf quality with the new advanced algorithm
  const surfQuality = getWaveQuality(conditions, spotConfig)
  
  // Debug: log raw API data (using wave height as proxy temporarily)
  const todaysTides = weather.hourly.wave_height.slice(0, 24)
  const tideRange = {
    min: Math.min(...todaysTides),
    max: Math.max(...todaysTides),
    current: tideHeight
  }
  
  // Calculate RSS combined height for comparison
  const Hs = weather.current.swell_wave_height
  const Hw = weather.current.wind_wave_height
  const gamma = spotMeta?.type === 'reef' ? 0.35 : spotMeta?.type === 'point' ? 0.40 : spotMeta?.type === 'beach' ? 0.55 : 0.50
  const rssComputedHeight = Math.sqrt(Hs*Hs + (gamma*Hw)*(gamma*Hw))
  
  console.log(`🌊 ${spotName} Wave Height Analysis:`, {
    // Three data points for comparison:
    apiWaveHeight: weather.current.wave_height,           // API's combined wave height
    rssComputedHeight: rssComputedHeight,                // Our RSS computation
    effectiveWaveHeight: effectiveWaves,                 // Final spot-corrected height
    
    // Component breakdown:
    swellComponent: weather.current.swell_wave_height,
    windWaveComponent: weather.current.wind_wave_height,
    windWaveWeight: gamma,
    
    // Corrections applied:
    spotCorrection: `${((effectiveWaves / rssComputedHeight - 1) * 100).toFixed(1)}%`,
    spotType: spotMeta?.type || 'unknown',
    
    // Additional data:
    swellDirection: weather.current.swell_wave_direction,
    swellPeriod: weather.current.swell_wave_period,
    tideHeight: tideHeight,
    tideStage: tideStage,
    tideRange: tideRange
  })
  
  const formatWaveHeight = (meters: number) => {
    if (unit === 'imperial') {
      const feet = metersToFeet(meters)
      return `${feet.toFixed(1)}ft`
    }
    return `${meters.toFixed(1)}m`
  }

  const formatWindSpeed = (ms: number) => {
    if (unit === 'imperial') {
      const mph = ms * 2.237
      return `${Math.round(mph)} mph`
    }
    const kmh = ms * 3.6
    return `${Math.round(kmh)} km/h`
  }

  const formatTemp = (celsius: number) => {
    if (unit === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32
      return `${Math.round(fahrenheit)}°F`
    }
    return `${Math.round(celsius)}°C`
  }

  // Create a more deterministic date formatter
  const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions) => {
    const date = new Date(dateString + 'T12:00:00.000Z') // Force noon UTC
    return new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' }).format(date)
  }

  // Calculate surf quality scores for sessions (shared between card and table layouts)
  type SessionData = {
    waveHeight: number
    swellHeight: number
    windWaveHeight: number
    wavePeriod: number
    swellPeriod: number
    waveDirection: number
    swellDirection: number
    seaLevel: number
  } | null

  const calculateSurfQuality = (sessionData: SessionData, effectiveHeight: number, hourIndex: number) => {
    if (!sessionData) return { score: 0, rating: 'No data' }
    
    const sessionTideStage = getTideStage(sessionData.seaLevel, weather.hourly.sea_level_height_msl)
    
    // Get real hourly wind data
    const windSpeedKmh = hourIndex < weather.weather.hourly.windspeed_10m.length ? 
      weather.weather.hourly.windspeed_10m[hourIndex] : 15 // fallback
    const windDirection = hourIndex < weather.weather.hourly.winddirection_10m.length ? 
      weather.weather.hourly.winddirection_10m[hourIndex] : 250 // fallback
    
    const sessionConditions = {
      waveHeight: effectiveHeight,
      wavePeriod: sessionData.swellPeriod || sessionData.wavePeriod,
      waveDirection: sessionData.swellDirection || sessionData.waveDirection,
      windSpeed: windSpeedKmh / 3.6, // Convert km/h to m/s for getWaveQuality
      windDirection: windDirection,
      tideStage: sessionTideStage
    }
    
    return getWaveQuality(sessionConditions, spotConfig)
  }

  // Calculate effective wave heights for sessions (shared between layouts)
  const calculateEffectiveHeight = (sessionData: SessionData) => {
    if (!sessionData || !spotMeta) return sessionData?.waveHeight || 0
    return effectiveWaveHeight({
      waveHeight: sessionData.waveHeight,
      swellHeight: sessionData.swellHeight,
      windWaveHeight: sessionData.windWaveHeight,
      wavePeriod: sessionData.wavePeriod,
      swellPeriod: sessionData.swellPeriod,
      waveDirection: sessionData.waveDirection,
      swellDirection: sessionData.swellDirection,
      tideHeight: sessionData.seaLevel
    }, spotMeta)
  }

  // Get quality badge styling based on score (shared between layouts)
  const getQualityBadgeStyle = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800"      // Epic/All-time - Green
    if (score >= 70) return "bg-emerald-100 text-emerald-700"  // Good - Emerald
    if (score >= 55) return "bg-yellow-100 text-yellow-700"    // Fair - Yellow
    if (score >= 30) return "bg-orange-100 text-orange-700"    // Poor-Fair - Orange
    return "bg-red-100 text-red-700"                           // Flat/Poor - Red
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <Waves className="h-5 w-5" />
            Surf Conditions
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
            >
              {unit === 'metric' ? 'Switch to ft/mph' : 'Switch to m/km/h'}
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
            >
              Debug API
            </button>
            <button
              onClick={() => setForecastLayout(forecastLayout === 'cards' ? 'table' : 'cards')}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
            >
              {forecastLayout === 'cards' ? 'Table View' : 'Card View'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 bg-gray-900 text-white rounded-lg p-4 border border-gray-700">
            <h3 className="font-bold mb-3 text-yellow-300">🔍 Raw API Data Debug</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-bold text-blue-300 mb-2">Marine API Data:</div>
                <ul className="space-y-1 font-mono">
                  <li className="flex justify-between">
                    <span>Wave Height:</span>
                    <span className="text-cyan-300">{weather.current.wave_height?.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wave Period:</span>
                    <span className="text-cyan-300">{weather.current.wave_period?.toFixed(1)}s</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wave Direction:</span>
                    <span className="text-cyan-300">{weather.current.wave_direction}°</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Swell Height:</span>
                    <span className="text-green-300">{weather.current.swell_wave_height?.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wind Wave:</span>
                    <span className="text-orange-300">{weather.current.wind_wave_height?.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tide Height:</span>
                    <span className="text-purple-300">{tideHeight?.toFixed(2)}m</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="font-bold text-pink-300 mb-2">Wave Height Comparison:</div>
                <ul className="space-y-1 font-mono">
                  <li className="flex justify-between">
                    <span>API Wave Height:</span>
                    <span className="text-red-300">{weather.current.wave_height?.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>RSS Computed:</span>
                    <span className="text-orange-300">{rssComputedHeight.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spot Corrected:</span>
                    <span className="text-green-300 font-bold">{effectiveWaves.toFixed(2)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wind Wave γ:</span>
                    <span className="text-cyan-300">{gamma.toFixed(2)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Base Factor:</span>
                    <span className="text-purple-300">{spotMeta?.sizeResponse?.base || 1}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tide Stage:</span>
                    <span className="text-cyan-300">{tideStage.toUpperCase()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Today&apos;s Range:</span>
                    <span className="text-indigo-300">{tideRange.min.toFixed(1)}m → {tideRange.max.toFixed(1)}m</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spot:</span>
                    <span className="text-white font-bold">{spotName}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-black">
              <div className="font-mono">API: marine-api.open-meteo.com</div>
              <div className="font-mono">Time: {weather.current.time}</div>
            </div>
          </div>
        )}

        {/* Current Conditions */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-black">Current Conditions</h3>
          
          {/* Wave Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Waves className="h-4 w-4" />
                <span className="text-sm font-medium text-blue-600">Wave Height</span>
              </div>
              <div className="text-2xl font-bold text-black">
                {formatWaveHeight(effectiveWaves)}
              </div>
              <div className="text-xs text-black">
                Period: {weather.current.wave_period?.toFixed(1)}s
                {effectiveWaves !== weather.current.wave_height && (
                  <div className="text-xs text-blue-500 mt-1">
                    ↗ Spot-adjusted ({formatWaveHeight(weather.current.wave_height)} raw)
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium text-green-600">Swell</span>
              </div>
              <div className="text-2xl font-bold text-black">
                {formatWaveHeight(weather.current.swell_wave_height)}
              </div>
              <div className="text-xs text-black">
                {getSwellDirection(weather.current.swell_wave_direction)} @ {weather.current.swell_wave_period?.toFixed(1)}s
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-600 mb-1">
                <Wind className="h-4 w-4" />
                <span className="text-sm font-medium text-orange-600">Wind</span>
              </div>
              <div className="text-2xl font-bold text-black">
                {weather.weather.current.windspeed ? formatWindSpeed(weather.weather.current.windspeed) : 'N/A'}
              </div>
              <div className="text-xs text-black">
                {weather.weather.current.winddirection ? getWindDirection(weather.weather.current.winddirection) : 'N/A'}
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium text-purple-600">Tide</span>
              </div>
              <div className="text-2xl font-bold text-black">
                {tideHeight.toFixed(1)}m
              </div>
              <div className="text-xs text-black">
                {tideStage.charAt(0).toUpperCase() + tideStage.slice(1)} tide
              </div>
            </div>
          </div>

          {/* Quality Indicator */}
          <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="text-sm text-black mb-2">Surf Quality</div>
                <div className="text-xl font-bold text-black mb-3">
                  {surfQuality.rating.toUpperCase()}
                </div>
                
                {/* Rating Bar */}
                <div className="mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    {/* Rating segments */}
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 15 ? 'bg-red-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 30 ? 'bg-orange-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 55 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 70 ? 'bg-lime-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 85 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    <div className={`h-2 w-8 rounded-sm ${surfQuality.score >= 95 ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                  </div>
                  <div className="text-xs text-black">
                    Score: {Math.round(surfQuality.score)}/100
                  </div>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-sm text-black mb-1">Temperature</div>
                <div className="text-xl font-bold text-black">
                  {weather.weather.current.temperature ? formatTemp(weather.weather.current.temperature) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Description */}
          <div className="text-center text-black text-sm">
            {getWeatherDescription(weather.weather.current.weathercode)}
          </div>

          {/* Surf Warnings */}
          {surfQuality.warnings.length > 0 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium text-yellow-800">Surf Conditions Alert</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {surfQuality.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 7-Day Detailed Forecast */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-black">7-Day Surf Forecast</h3>
          
          {forecastLayout === 'table' ? (
            /* Table Layout */
            <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
              {/* Table Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-black uppercase tracking-wide">
                  <div className="col-span-2">Session</div>
                  <div className="col-span-1 text-center">Surf (m)</div>
                  <div className="col-span-2 text-center">Primary Swell</div>
                  <div className="col-span-2 text-center">Secondary Swell</div>
                  <div className="col-span-1 text-center">Wind</div>
                  <div className="col-span-1 text-center">Weather</div>
                  <div className="col-span-1 text-center">Pressure</div>
                  <div className="col-span-2 text-center">Quality</div>
                </div>
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {weather.daily.time.slice(0, 7).map((date, dayIndex) => {
                  const dayName = dayIndex === 0 ? 'Today' : formatDate(date, { weekday: 'short' })
                  const shortDate = formatDate(date, { month: 'numeric', day: 'numeric' })
                  
                  // Get morning and afternoon data (same logic as cards)
                  const morningHourIndex = dayIndex * 24 + 9
                  const afternoonHourIndex = dayIndex * 24 + 15
                  
                  const getMorningData = () => {
                    if (morningHourIndex >= weather.hourly.wave_height.length) return null
                    return {
                      waveHeight: weather.hourly.wave_height[morningHourIndex],
                      swellHeight: weather.hourly.swell_wave_height[morningHourIndex],
                      windWaveHeight: weather.hourly.wind_wave_height[morningHourIndex],
                      wavePeriod: weather.hourly.wave_period[morningHourIndex],
                      swellPeriod: weather.hourly.swell_wave_period[morningHourIndex],
                      waveDirection: weather.hourly.wave_direction[morningHourIndex],
                      swellDirection: weather.hourly.swell_wave_direction[morningHourIndex],
                      seaLevel: weather.hourly.sea_level_height_msl[morningHourIndex]
                    }
                  }
                  
                  const getAfternoonData = () => {
                    if (afternoonHourIndex >= weather.hourly.wave_height.length) return null
                    return {
                      waveHeight: weather.hourly.wave_height[afternoonHourIndex],
                      swellHeight: weather.hourly.swell_wave_height[afternoonHourIndex],
                      windWaveHeight: weather.hourly.wind_wave_height[afternoonHourIndex],
                      wavePeriod: weather.hourly.wave_period[afternoonHourIndex],
                      swellPeriod: weather.hourly.swell_wave_period[afternoonHourIndex],
                      waveDirection: weather.hourly.wave_direction[afternoonHourIndex],
                      swellDirection: weather.hourly.swell_wave_direction[afternoonHourIndex],
                      seaLevel: weather.hourly.sea_level_height_msl[afternoonHourIndex]
                    }
                  }
                  
                  const morningData = getMorningData()
                  const afternoonData = getAfternoonData()
                  
                  // Calculate effective heights using shared function
                  
                  const morningEffectiveHeight = calculateEffectiveHeight(morningData)
                  const afternoonEffectiveHeight = calculateEffectiveHeight(afternoonData)
                  
                  const morningQuality = calculateSurfQuality(morningData, morningEffectiveHeight, morningHourIndex)
                  const afternoonQuality = calculateSurfQuality(afternoonData, afternoonEffectiveHeight, afternoonHourIndex)
                  
                  // Get wind data for sessions
                  const getWindData = (hourIndex: number) => {
                    if (hourIndex >= weather.weather.hourly.windspeed_10m.length) return { speed: 0, direction: 0 }
                    return {
                      speed: weather.weather.hourly.windspeed_10m[hourIndex],
                      direction: weather.weather.hourly.winddirection_10m[hourIndex]
                    }
                  }
                  
                  const morningWind = getWindData(morningHourIndex)
                  const afternoonWind = getWindData(afternoonHourIndex)
                  
                  return (
                    <div key={date}>
                      {/* Morning Session Row */}
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="grid grid-cols-12 gap-2 items-center text-sm">
                          {/* Session */}
                          <div className="col-span-2">
                            <div className="font-medium text-black">{dayName} {shortDate}</div>
                            <div className="text-xs text-orange-700 font-medium">🌅 6am</div>
                          </div>
                          
                          {/* Surf Height */}
                          <div className="col-span-1 text-center">
                            <div className="font-semibold text-black">
                              {morningData ? formatWaveHeight(morningEffectiveHeight).replace(/[^\d.]/g, '') : '0'}
                            </div>
                          </div>
                          
                          {/* Primary Swell */}
                          <div className="col-span-2 text-center">
                            {morningData ? (
                              <>
                                <div className="font-medium text-black">{formatWaveHeight(morningData.swellHeight).replace(/[^\d.]/g, '')}m</div>
                                <div className="text-xs text-black">{morningData.swellPeriod?.toFixed(0)}s</div>
                                <div className="text-xs text-black">{getSwellDirection(morningData.swellDirection)}</div>
                              </>
                            ) : (
                              <div className="text-black">-</div>
                            )}
                          </div>
                          
                          {/* Secondary Swell */}
                          <div className="col-span-2 text-center">
                            {morningData ? (
                              <>
                                <div className="font-medium text-black">{formatWaveHeight(morningData.windWaveHeight).replace(/[^\d.]/g, '')}m</div>
                                <div className="text-xs text-black">{morningData.wavePeriod?.toFixed(0)}s</div>
                                <div className="text-xs text-black">{getSwellDirection(morningData.waveDirection)}</div>
                              </>
                            ) : (
                              <div className="text-black">-</div>
                            )}
                          </div>
                          
                          {/* Wind */}
                          <div className="col-span-1 text-center">
                            <div className="font-medium text-black">{Math.round(morningWind.speed)}</div>
                            <div className="text-xs text-black">km/h</div>
                            <div className="text-xs text-black">{getWindDirection(morningWind.direction)}</div>
                          </div>
                          
                          {/* Weather */}
                          <div className="col-span-1 text-center">
                            <div className="text-sm">☀️</div>
                            <div className="text-xs text-black">{formatTemp(weather.weather.daily.temperature_2m_max[dayIndex])}</div>
                          </div>
                          
                          {/* Pressure */}
                          <div className="col-span-1 text-center">
                            <div className="text-xs text-black">1012mb</div>
                          </div>
                          
                          {/* Quality */}
                          <div className="col-span-2 text-center">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeStyle(morningQuality.score)}`}>
                              {morningQuality.rating}
                            </div>
                            <div className="text-xs text-black mt-1">{Math.round(morningQuality.score)}%</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Afternoon Session Row */}
                      <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-l-2 border-transparent">
                        <div className="grid grid-cols-12 gap-2 items-center text-sm">
                          {/* Session */}
                          <div className="col-span-2">
                            <div className="text-xs text-blue-700 font-medium">☀️ Noon</div>
                          </div>
                          
                          {/* Surf Height */}
                          <div className="col-span-1 text-center">
                            <div className="font-semibold text-black">
                              {afternoonData ? formatWaveHeight(afternoonEffectiveHeight).replace(/[^\d.]/g, '') : '0'}
                            </div>
                          </div>
                          
                          {/* Primary Swell */}
                          <div className="col-span-2 text-center">
                            {afternoonData ? (
                              <>
                                <div className="font-medium text-black">{formatWaveHeight(afternoonData.swellHeight).replace(/[^\d.]/g, '')}m</div>
                                <div className="text-xs text-black">{afternoonData.swellPeriod?.toFixed(0)}s</div>
                                <div className="text-xs text-black">{getSwellDirection(afternoonData.swellDirection)}</div>
                              </>
                            ) : (
                              <div className="text-black">-</div>
                            )}
                          </div>
                          
                          {/* Secondary Swell */}
                          <div className="col-span-2 text-center">
                            {afternoonData ? (
                              <>
                                <div className="font-medium text-black">{formatWaveHeight(afternoonData.windWaveHeight).replace(/[^\d.]/g, '')}m</div>
                                <div className="text-xs text-black">{afternoonData.wavePeriod?.toFixed(0)}s</div>
                                <div className="text-xs text-black">{getSwellDirection(afternoonData.waveDirection)}</div>
                              </>
                            ) : (
                              <div className="text-black">-</div>
                            )}
                          </div>
                          
                          {/* Wind */}
                          <div className="col-span-1 text-center">
                            <div className="font-medium text-black">{Math.round(afternoonWind.speed)}</div>
                            <div className="text-xs text-black">km/h</div>
                            <div className="text-xs text-black">{getWindDirection(afternoonWind.direction)}</div>
                          </div>
                          
                          {/* Weather */}
                          <div className="col-span-1 text-center">
                            <div className="text-sm">☀️</div>
                            <div className="text-xs text-black">{formatTemp(weather.weather.daily.temperature_2m_min[dayIndex])}</div>
                          </div>
                          
                          {/* Pressure */}
                          <div className="col-span-1 text-center">
                            <div className="text-xs text-black">1011mb</div>
                          </div>
                          
                          {/* Quality */}
                          <div className="col-span-2 text-center">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getQualityBadgeStyle(afternoonQuality.score)}`}>
                              {afternoonQuality.rating}
                            </div>
                            <div className="text-xs text-black mt-1">{Math.round(afternoonQuality.score)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Card Layout (existing) */
          <div className="space-y-4">
            {weather.daily.time.slice(0, 7).map((date, dayIndex) => {
              const dayName = dayIndex === 0 ? 'Today' : formatDate(date, { weekday: 'long' })
              const shortDate = formatDate(date, { month: 'short', day: 'numeric' })
              
              // Get morning (6-12) and afternoon (12-18) data from hourly
              const morningHourIndex = dayIndex * 24 + 9  // 9am
              const afternoonHourIndex = dayIndex * 24 + 15 // 3pm
              
              const getMorningData = () => {
                if (morningHourIndex >= weather.hourly.wave_height.length) return null
                return {
                  waveHeight: weather.hourly.wave_height[morningHourIndex],
                  swellHeight: weather.hourly.swell_wave_height[morningHourIndex],
                  windWaveHeight: weather.hourly.wind_wave_height[morningHourIndex],
                  wavePeriod: weather.hourly.wave_period[morningHourIndex],
                  swellPeriod: weather.hourly.swell_wave_period[morningHourIndex],
                  waveDirection: weather.hourly.wave_direction[morningHourIndex],
                  swellDirection: weather.hourly.swell_wave_direction[morningHourIndex],
                  seaLevel: weather.hourly.sea_level_height_msl[morningHourIndex]
                }
              }
              
              const getAfternoonData = () => {
                if (afternoonHourIndex >= weather.hourly.wave_height.length) return null
                return {
                  waveHeight: weather.hourly.wave_height[afternoonHourIndex],
                  swellHeight: weather.hourly.swell_wave_height[afternoonHourIndex],
                  windWaveHeight: weather.hourly.wind_wave_height[afternoonHourIndex],
                  wavePeriod: weather.hourly.wave_period[afternoonHourIndex],
                  swellPeriod: weather.hourly.swell_wave_period[afternoonHourIndex],
                  waveDirection: weather.hourly.wave_direction[afternoonHourIndex],
                  swellDirection: weather.hourly.swell_wave_direction[afternoonHourIndex],
                  seaLevel: weather.hourly.sea_level_height_msl[afternoonHourIndex]
                }
              }
              
              const morningData = getMorningData()
              const afternoonData = getAfternoonData()
              
              // Calculate effective wave heights and quality scores using shared functions
              const morningEffectiveHeight = calculateEffectiveHeight(morningData)
              const afternoonEffectiveHeight = calculateEffectiveHeight(afternoonData)
              
              const morningQuality = calculateSurfQuality(morningData, morningEffectiveHeight, morningHourIndex)
              const afternoonQuality = calculateSurfQuality(afternoonData, afternoonEffectiveHeight, afternoonHourIndex)
              
              return (
                <div key={date} className="bg-gray-50 rounded-lg p-4">
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <div>
                      <h4 className="font-semibold text-black">{dayName}</h4>
                      <p className="text-sm text-black">{shortDate}</p>
                    </div>
                    <div className="text-right text-sm text-black">
                      <div>{formatTemp(weather.weather.daily.temperature_2m_max[dayIndex])}/{formatTemp(weather.weather.daily.temperature_2m_min[dayIndex])}</div>
                      <div>Max wind: {formatWindSpeed(weather.weather.daily.windspeed_10m_max[dayIndex])}</div>
                    </div>
                  </div>
                  
                  {/* Morning & Afternoon Sessions */}
                  <div className="grid md:grid-cols-2 gap-4">
                    
                    {/* Morning Session */}
                    <div className="bg-white rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-orange-600">🌅 Morning (9 AM)</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getQualityBadgeStyle(morningQuality.score)}`}>
                          {morningQuality.rating}
                        </div>
                      </div>
                      
                      {morningData ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black">Wave Height:</span>
                            <span className="font-medium text-black">{formatWaveHeight(morningEffectiveHeight)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Swell:</span>
                            <span className="text-black">{formatWaveHeight(morningData.swellHeight)} @ {morningData.swellPeriod?.toFixed(0)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Direction:</span>
                            <span className="text-black">{getSwellDirection(morningData.swellDirection)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Tide:</span>
                            <span className="text-black">{morningData.seaLevel?.toFixed(1)}m ({getTideStage(morningData.seaLevel, weather.hourly.sea_level_height_msl)})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Score:</span>
                            <span className="font-medium text-black">{Math.round(morningQuality.score)}/100</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-black">No data available</div>
                      )}
                    </div>
                    
                    {/* Afternoon Session */}
                    <div className="bg-white rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-blue-600">☀️ Afternoon (3 PM)</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getQualityBadgeStyle(afternoonQuality.score)}`}>
                          {afternoonQuality.rating}
                        </div>
                      </div>
                      
                      {afternoonData ? (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-black">Wave Height:</span>
                            <span className="font-medium text-black">{formatWaveHeight(afternoonEffectiveHeight)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Swell:</span>
                            <span className="text-black">{formatWaveHeight(afternoonData.swellHeight)} @ {afternoonData.swellPeriod?.toFixed(0)}s</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Direction:</span>
                            <span className="text-black">{getSwellDirection(afternoonData.swellDirection)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Tide:</span>
                            <span className="text-black">{afternoonData.seaLevel?.toFixed(1)}m ({getTideStage(afternoonData.seaLevel, weather.hourly.sea_level_height_msl)})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-black">Score:</span>
                            <span className="font-medium text-black">{Math.round(afternoonQuality.score)}/100</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-black">No data available</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* Hourly Chart Preview */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4 text-black">Next 24 Hours</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weather.hourly.time.slice(0, 24).map((time, index) => {
              const hour = new Date(time).getUTCHours()
              const height = weather.hourly.wave_height[index]
              const maxHeight = Math.max(...weather.hourly.wave_height.slice(0, 24))
              const barHeight = (height / maxHeight) * 60
              
              return (
                <div key={time} className="flex flex-col items-center min-w-[40px]">
                  <div className="text-xs text-black mb-1">
                    {hour === 0 ? '12am' : hour === 12 ? '12pm' : hour > 12 ? `${hour-12}pm` : `${hour}am`}
                  </div>
                  <div className="relative h-16 w-8 bg-gray-100 rounded">
                    <div 
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded"
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <div className="text-xs mt-1">{formatWaveHeight(height)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}