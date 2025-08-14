import { getTideCacheForDate, saveTideDataToCache } from './tide-cache'
import { shouldDoBulkFetch, logBulkFetch, replaceTideDataRange } from './tide-cache-optimized'

export interface WorldTidesResponse {
  status: number
  callCount: number
  copyright: string
  requestLat: number
  requestLon: number
  responseLat: number
  responseLon: number
  atlas: string
  timezone: string
  requestDatum: string
  responseDatum: string
  heights: {
    dt: number
    date: string
    height: number
  }[]
  extremes: {
    dt: number
    date: string
    height: number
    type: string
  }[]
  datums: {
    name: string
    height: number
  }[]
}

export interface TideData {
  current: number
  hourly: {
    time: string[]
    sea_level_height_msl: number[]
  }
  extremes: {
    time: string
    height: number
    type: 'High' | 'Low'
    timestamp: number // Unix timestamp for precise filtering
  }[]
}

const WORLDTIDES_API_KEY = 'cce16f26-abf6-4a27-ab4c-504e626631fb'

export async function getWorldTidesData(lat: number, lon: number): Promise<TideData | null> {
  try {
    // Get today's date in Philippines timezone
    const philippinesTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    const todayInPhilippines = new Date(philippinesTime)
    const dateStr = todayInPhilippines.toISOString().split('T')[0] // YYYY-MM-DD format
    
    console.log('[WorldTides] Requesting data for date:', dateStr)
    
    // 1. Vérifier si on a besoin d'un bulk fetch optimisé
    const bulkCheck = await shouldDoBulkFetch()
    
    if (bulkCheck.shouldFetch) {
      console.log('[WorldTides] Need bulk fetch:', bulkCheck.reason)
      console.log('[WorldTides] Fetching 7 days from', bulkCheck.startDate, 'to', bulkCheck.endDate)
      
      // Faire un fetch bulk de 7 jours
      await doBulkFetch(lat, lon, bulkCheck.startDate, bulkCheck.endDate)
    }
    
    // 2. Essayer le cache maintenant
    const cachedData = await getTideCacheForDate(dateStr)
    if (cachedData) {
      console.log('[WorldTides] Using cached data for:', dateStr)
      
      // Convertir les données du cache au format attendu
      const hourlyData = {
        time: cachedData.heights.map(h => {
          // Créer un timestamp Unix fictif pour l'heure (format compatible avec TideCurve)
          const today = new Date(dateStr + 'T00:00:00')
          today.setHours(h.hour)
          return Math.floor(today.getTime() / 1000).toString() // Unix timestamp as string
        }),
        sea_level_height_msl: cachedData.heights.map(h => h.height)
      }
      
      const extremes = cachedData.extremes.map(e => ({
        time: e.time.substring(0, 5), // HH:MM from HH:MM:SS
        height: e.height,
        type: e.type,
        timestamp: 0 // Pas utilisé depuis le cache
      }))
      
      // Trouver la hauteur actuelle (la plus proche de l'heure actuelle)
      const currentHour = todayInPhilippines.getHours()
      const currentHeight = cachedData.heights.find(h => h.hour === currentHour)?.height || 1.0
      
      return {
        current: currentHeight,
        hourly: hourlyData,
        extremes
      }
    }
    
    // 3. Si toujours pas en cache après bulk fetch, fallback vers ancien système
    console.log('[WorldTides] Still no cache after bulk fetch, trying single day fetch')
    
    const url = new URL('https://www.worldtides.info/api/v3')
    url.searchParams.append('lat', lat.toString())
    url.searchParams.append('lon', lon.toString())
    url.searchParams.append('localtime', '')
    url.searchParams.append('timezone', '')
    url.searchParams.append('datum', 'CD')
    url.searchParams.append('date', dateStr)
    url.searchParams.append('days', '2') // Next 2 days for 48h data
    url.searchParams.append('step', '3600') // Hourly data
    url.searchParams.append('StationDistance', '0')
    url.searchParams.append('key', WORLDTIDES_API_KEY)
    url.searchParams.append('heights', '')
    url.searchParams.append('extremes', '')
    url.searchParams.append('datums', '')

    console.log('Fetching WorldTides data from:', url.toString())

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`WorldTides API error: ${response.status} ${response.statusText}`)
    }

    const data: WorldTidesResponse = await response.json()
    
    if (data.status !== 200) {
      throw new Error(`WorldTides API returned status: ${data.status}`)
    }

    console.log('WorldTides API Response:', {
      status: data.status,
      callCount: data.callCount,
      timezone: data.timezone,
      heightsCount: data.heights?.length || 0,
      extremesCount: data.extremes?.length || 0
    })

    // Find current tide height (closest to current time)
    const now = Date.now() / 1000 // Unix timestamp
    let currentHeight = 1.0 // Default fallback
    
    if (data.heights && data.heights.length > 0) {
      const closestHeight = data.heights.reduce((closest, height) => {
        return Math.abs(height.dt - now) < Math.abs(closest.dt - now) ? height : closest
      })
      currentHeight = closestHeight.height
    }

    // Process hourly data - let's see what we get for Aug 14
    const hourlyData = {
      time: [] as string[],
      sea_level_height_msl: [] as number[]
    }

    if (data.heights && data.heights.length > 0) {
      console.log('[WorldTides] First 10 heights data points:')
      data.heights.slice(0, 10).forEach((height, i) => {
        const date = new Date(height.dt * 1000)
        const philTime = date.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
        console.log(`  ${i}: ${height.date} → ${philTime} (height: ${height.height}m)`)
      })
      
      // Process all heights data (48h worth) - keep Unix timestamps for consistency
      for (const height of data.heights) {
        // Store the Unix timestamp instead of ISO string to avoid timezone confusion
        hourlyData.time.push(height.dt.toString()) // Unix timestamp as string
        hourlyData.sea_level_height_msl.push(height.height)
      }
      
      console.log(`[WorldTides] Total hourly points processed: ${hourlyData.time.length}`)
    }

    // Process extremes (high/low tides)
    console.log('[WorldTides] Raw extremes data:', data.extremes)
    console.log('[WorldTides] Extremes breakdown by date:')
    data.extremes?.forEach((extreme, i) => {
      const date = new Date(extreme.dt * 1000)
      const philTime = date.toLocaleString('en-US', { timeZone: 'Asia/Manila' })
      const philDateOnly = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) // YYYY-MM-DD format
      console.log(`  ${i}: ${extreme.date} → ${philTime} (${philDateOnly}) ${extreme.type} ${extreme.height}m`)
    })
    
    const extremes = data.extremes ? data.extremes.map(extreme => {
      const result = {
        time: new Date(extreme.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false,
          timeZone: 'Asia/Manila' // Philippines timezone
        }),
        height: extreme.height,
        type: extreme.type as 'High' | 'Low',
        timestamp: extreme.dt // Keep Unix timestamp for precise filtering
      }
      console.log('[WorldTides] Processed extreme:', {
        raw: { dt: extreme.dt, date: extreme.date, height: extreme.height, type: extreme.type },
        processed: result
      })
      return result
    }) : []

    // 3. Sauvegarder les nouvelles données dans le cache
    console.log('[WorldTides] Saving API data to cache for:', dateStr)
    
    // Préparer les données horaires pour le cache
    const heightsForCache = data.heights
      .slice(0, 24) // Premier 24h seulement
      .map((height, i) => {
        return {
          hour: i, // 0-23 pour les 24 premières heures
          height: height.height
        }
      })
    
    // Préparer les extremes pour le cache (seulement ceux d'aujourd'hui)
    const extremesForCache = data.extremes
      .filter(extreme => {
        const date = new Date(extreme.dt * 1000)
        const philDateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
        return philDateStr === dateStr // Seulement les extremes d'aujourd'hui
      })
      .map(extreme => {
        const date = new Date(extreme.dt * 1000)
        return {
          time: date.toLocaleTimeString('en-US', { 
            hour12: false, 
            timeZone: 'Asia/Manila',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          height: extreme.height,
          type: extreme.type as 'High' | 'Low'
        }
      })
    
    // Sauvegarder dans le cache (en arrière-plan, ne pas attendre)
    saveTideDataToCache(dateStr, heightsForCache, extremesForCache)
      .then(success => {
        if (success) {
          console.log('[WorldTides] Successfully cached data for:', dateStr)
        } else {
          console.log('[WorldTides] Failed to cache data for:', dateStr)
        }
      })
      .catch(error => {
        console.error('[WorldTides] Error caching data:', error)
      })

    return {
      current: currentHeight,
      hourly: hourlyData,
      extremes
    }

  } catch (error) {
    console.error('Error fetching WorldTides data:', error)
    return null
  }
}

// Fonction pour faire un bulk fetch de plusieurs jours
async function doBulkFetch(lat: number, lon: number, startDate: string, endDate: string): Promise<void> {
  try {
    console.log('[WorldTides] Starting bulk fetch from', startDate, 'to', endDate)
    
    const url = new URL('https://www.worldtides.info/api/v3')
    url.searchParams.append('lat', lat.toString())
    url.searchParams.append('lon', lon.toString())
    url.searchParams.append('localtime', '')
    url.searchParams.append('timezone', '')
    url.searchParams.append('datum', 'CD')
    url.searchParams.append('date', startDate)
    url.searchParams.append('days', '7') // Fetch 7 jours
    url.searchParams.append('step', '3600') // Hourly data
    url.searchParams.append('StationDistance', '0')
    url.searchParams.append('key', WORLDTIDES_API_KEY)
    url.searchParams.append('heights', '')
    url.searchParams.append('extremes', '')
    url.searchParams.append('datums', '')

    console.log('[WorldTides] Bulk fetching from API:', url.toString())

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`WorldTides bulk API error: ${response.status} ${response.statusText}`)
    }

    const data: WorldTidesResponse = await response.json()
    
    if (data.status !== 200) {
      throw new Error(`WorldTides bulk API returned status: ${data.status}`)
    }

    console.log('[WorldTides] Bulk API Response:', {
      status: data.status,
      callCount: data.callCount,
      timezone: data.timezone,
      heightsCount: data.heights?.length || 0,
      extremesCount: data.extremes?.length || 0
    })

    // Organiser les données par date
    const heightsDataByDate: Record<string, { hour: number, height: number }[]> = {}
    const extremesDataByDate: Record<string, { time: string, height: number, type: 'High' | 'Low' }[]> = {}

    // Traiter les données horaires
    if (data.heights && data.heights.length > 0) {
      data.heights.forEach(height => {
        const date = new Date(height.dt * 1000)
        const philDateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
        // Get hour in Philippines timezone (GMT+8)
        const philippinesDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }))
        const hour = philippinesDate.getHours()
        
        if (!heightsDataByDate[philDateStr]) {
          heightsDataByDate[philDateStr] = []
        }
        
        heightsDataByDate[philDateStr].push({
          hour,
          height: height.height
        })
      })
    }

    // Traiter les extremes
    if (data.extremes && data.extremes.length > 0) {
      data.extremes.forEach(extreme => {
        const date = new Date(extreme.dt * 1000)
        const philDateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
        const time = date.toLocaleTimeString('en-US', { 
          hour12: false, 
          timeZone: 'Asia/Manila',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
        
        if (!extremesDataByDate[philDateStr]) {
          extremesDataByDate[philDateStr] = []
        }
        
        extremesDataByDate[philDateStr].push({
          time,
          height: extreme.height,
          type: extreme.type as 'High' | 'Low'
        })
      })
    }

    console.log('[WorldTides] Organized bulk data by date:', Object.keys(heightsDataByDate).sort())

    // Remplacer toutes les données dans Supabase
    const success = await replaceTideDataRange(startDate, heightsDataByDate, extremesDataByDate)
    
    if (success) {
      // Logger le bulk fetch
      await logBulkFetch(startDate, endDate, 7)
      console.log('[WorldTides] Bulk fetch completed successfully')
    } else {
      throw new Error('Failed to save bulk data to cache')
    }

  } catch (error) {
    console.error('[WorldTides] Bulk fetch error:', error)
    throw error
  }
}

// Helper function to get tide stage based on current height and daily range
export function getTideStage(currentHeight: number, extremes: TideData['extremes']): 'low' | 'mid' | 'high' {
  if (extremes.length === 0) return 'mid'
  
  const highs = extremes.filter(e => e.type === 'High').map(e => e.height)
  const lows = extremes.filter(e => e.type === 'Low').map(e => e.height)
  
  if (highs.length === 0 || lows.length === 0) return 'mid'
  
  const maxHigh = Math.max(...highs)
  const minLow = Math.min(...lows)
  const range = maxHigh - minLow
  
  const lowThreshold = minLow + range * 0.3
  const highThreshold = minLow + range * 0.7
  
  if (currentHeight <= lowThreshold) return 'low'
  if (currentHeight >= highThreshold) return 'high'
  return 'mid'
}