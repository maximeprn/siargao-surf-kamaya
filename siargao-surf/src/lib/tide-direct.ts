import { getTideCacheForDate } from './tide-cache'

export interface SimpleTideData {
  current: number // Current tide height for calculations
  hourly: {
    time: string[] // HH:MM format
    height: number[]
  }
  extremes: {
    time: string // HH:MM format
    height: number
    type: 'High' | 'Low'
  }[]
}

export async function getSimpleTideData(): Promise<SimpleTideData | null> {
  try {
    // Get today's date in Philippines timezone
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }) // YYYY-MM-DD format
    
    console.log('[TideDirect] Fetching cached data for:', dateStr)
    
    const cachedData = await getTideCacheForDate(dateStr)
    if (!cachedData) {
      console.log('[TideDirect] No cached data found')
      return null
    }
    
    console.log('[TideDirect] Found cached data:', {
      heights: cachedData.heights.length,
      extremes: cachedData.extremes.length
    })
    
    // Convert to simple format - 24h from 00:00 to 23:00
    const hourlyTimes = cachedData.heights.map(h => {
      return h.hour.toString().padStart(2, '0') + ':00' // Convert hour to HH:00
    })
    
    const hourlyHeights = cachedData.heights.map(h => h.height)
    
    const extremes = cachedData.extremes.map(e => ({
      time: e.time.substring(0, 5), // HH:MM from HH:MM:SS
      height: e.height,
      type: e.type
    }))
    
    // Calculate current tide height (closest to current hour in Philippines timezone)
    const philippinesTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    const currentHour = new Date(philippinesTime).getHours()
    const currentHeight = cachedData.heights.find(h => h.hour === currentHour)?.height || 1.0
    
    console.log('[TideDirect] Current hour:', currentHour, 'Current height:', currentHeight)
    
    const result = {
      current: currentHeight,
      hourly: {
        time: hourlyTimes,
        height: hourlyHeights
      },
      extremes
    }
    
    console.log('[TideDirect] Processed data:', result)
    
    return result
    
  } catch (error) {
    console.error('[TideDirect] Error:', error)
    return null
  }
}