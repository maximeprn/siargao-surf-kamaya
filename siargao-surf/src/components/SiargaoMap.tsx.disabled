'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLngBounds, Map as LeafletMap } from 'leaflet'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getMarineWeatherData, getWaveQuality } from '@/lib/marine-weather'
import { spotConfigs, defaultSpotConfig } from '@/lib/spot-configs'
import { effectiveWaveHeight } from '@/lib/wave-height-correction'
import { siargaoSpotsComplete } from '@/lib/spot-configs'

// Fix for default markers in Next.js
delete (Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Create quality-based surf spot icons
const createSurfSpotIcon = (quality: 'poor' | 'fair' | 'good' | 'epic' | 'loading') => {
  const colors = {
    poor: { bg: '#dc2626', border: '#b91c1c' },    // Red
    fair: { bg: '#f59e0b', border: '#d97706' },    // Orange  
    good: { bg: '#10b981', border: '#059669' },    // Green
    epic: { bg: '#8b5cf6', border: '#7c3aed' },    // Purple
    loading: { bg: '#6b7280', border: '#4b5563' }  // Gray
  }
  
  const color = colors[quality]
  
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="${color.bg}" stroke="${color.border}" stroke-width="2"/>
        <path d="M8 16c2-4 6-4 8 0s6 4 8 0" stroke="white" stroke-width="2" fill="none"/>
        <circle cx="16" cy="16" r="2" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

interface Spot {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  difficulty_level: string
  wave_type: string
}

interface SpotWithQuality extends Spot {
  quality?: 'poor' | 'fair' | 'good' | 'epic'
  score?: number
}

export default function SiargaoMap() {
  const [spots, setSpots] = useState<SpotWithQuality[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    async function fetchSpots() {
      try {
        const client = supabase
        if (!client) {
          console.warn('Supabase not configured. Skipping spots fetch for map.')
          setSpots([])
          setLoading(false)
          return
        }
        const { data, error } = await client
          .from('spots')
          .select('id, name, description, latitude, longitude, difficulty_level, wave_type')
          .order('name')

        if (error) {
          console.error('Error fetching spots:', error)
          return
        }

        if (data) {
          console.log('Fetched spots from database:', data.length, 'spots')
          // Fetch surf quality for each spot
          const spotsWithQuality: SpotWithQuality[] = await Promise.all(
            data.map(async (spot): Promise<SpotWithQuality> => {
              try {
                const weather = await getMarineWeatherData(spot.latitude, spot.longitude)
                if (weather) {
                  const spotConfig = spotConfigs[spot.name] || defaultSpotConfig
                  const spotMeta = siargaoSpotsComplete[spot.name]
                  
                  // Calculate effective wave height
                  const effectiveWaves = spotMeta ? effectiveWaveHeight({
                    waveHeight: weather.current.wave_height,
                    swellHeight: weather.current.swell_wave_height,
                    windWaveHeight: weather.current.wind_wave_height,
                    wavePeriod: weather.current.wave_period,
                    swellPeriod: weather.current.swell_wave_period,
                    waveDirection: weather.current.wave_direction,
                    swellDirection: weather.current.swell_wave_direction,
                    tideHeight: weather.current.sea_level_height_msl
                  }, spotMeta) : weather.current.wave_height
                  
                  // Get tide stage
                  const todaysTides = weather.hourly.sea_level_height_msl.slice(0, 24)
                  const minTide = Math.min(...todaysTides)
                  const maxTide = Math.max(...todaysTides)
                  const range = maxTide - minTide
                  const third = range / 3
                  const tideHeight = weather.current.sea_level_height_msl
                  const tideStage = tideHeight <= minTide + third ? 'low' : 
                                   tideHeight >= maxTide - third ? 'high' : 'mid'
                  
                  // Calculate surf quality
                  const quality = getWaveQuality({
                    waveHeight: effectiveWaves,
                    wavePeriod: weather.current.wave_period,
                    waveDirection: weather.current.wave_direction,
                    windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed / 3.6 : undefined,
                    windDirection: weather.weather.current.winddirection,
                    tideStage: tideStage
                  }, spotConfig)
                  
                  // Determine quality category (typed)
                  const qualityCategory: SpotWithQuality['quality'] = quality.score >= 85 ? 'epic' :
                                        quality.score >= 70 ? 'good' :
                                        quality.score >= 55 ? 'fair' : 'poor'
                  
                  return { ...spot, quality: qualityCategory, score: quality.score }
                }
              } catch (error) {
                console.error(`Error fetching quality for ${spot.name}:`, error)
              }
              return { ...spot } as SpotWithQuality
            })
          )
          setSpots(spotsWithQuality)
          console.log('Final spots with quality:', spotsWithQuality.length, 'spots')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpots()
  }, [])

  // Force map resize when component mounts
  useEffect(() => {
    const map = mapRef.current
    if (map) {
      setTimeout(() => {
        map.invalidateSize()
      }, 100)
    }
  }, [loading])

  if (loading) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-black">Loading map...</div>
      </div>
    )
  }

  // Siargao bounds (covering the actual surf spots area)
  const siargaoBounds = new LatLngBounds(
    [9.72, 126.14], // Southwest corner  
    [9.84, 126.19]  // Northeast corner
  )

  return (
    <div className="space-y-4">
      {/* Map Legend */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h4 className="font-semibold text-black mb-2">Surf Quality Legend</h4>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-black">Poor (0-54)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-black">Fair (55-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-black">Good (70-84)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-black">Epic (85-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span className="text-black">Loading...</span>
          </div>
        </div>
      </div>
      
      <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
        <MapContainer
        ref={mapRef}
        center={[9.813, 126.167]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={true}
        whenReady={() => {
          const map = mapRef.current
          if (map) {
            setTimeout(() => {
              map.invalidateSize()
            }, 200)
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {spots.map((spot) => {
          const quality = spot.quality || 'loading'
          const icon = createSurfSpotIcon(quality)
          
          return (
          <Marker
            key={spot.id}
            position={[spot.latitude, spot.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-48 p-2">
                <h3 className="text-lg font-semibold text-black mb-1">{spot.name}</h3>
                <p className="text-sm text-black mb-2 line-clamp-3">{spot.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    spot.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                    spot.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    spot.difficulty_level === 'advanced' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {spot.difficulty_level}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
                    {spot.wave_type}
                  </span>
                  {spot.quality && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      spot.quality === 'epic' ? 'bg-purple-100 text-purple-800' :
                      spot.quality === 'good' ? 'bg-green-100 text-green-800' :
                      spot.quality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {spot.quality} ({spot.score?.toFixed(0)}/100)
                    </span>
                  )}
                </div>
                
                <Link 
                  href={`/spots/${spot.id}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded transition-colors"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
          )
        })}
      </MapContainer>
      </div>
    </div>
  )
}