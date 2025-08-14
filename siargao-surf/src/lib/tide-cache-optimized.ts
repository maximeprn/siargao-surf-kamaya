import { supabase } from './supabase'
import { getTideCacheForDate, saveTideDataToCache } from './tide-cache'

// Table pour tracker les bulk fetches
// CREATE TABLE tide_fetch_log (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   fetch_date DATE NOT NULL,
//   start_date DATE NOT NULL,
//   end_date DATE NOT NULL,
//   days_fetched INTEGER NOT NULL,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   UNIQUE(fetch_date)
// );

export interface TideFetchLog {
  fetch_date: string
  start_date: string
  end_date: string
  days_fetched: number
  created_at: string
}

// Vérifie si on a besoin de faire un bulk fetch
export async function shouldDoBulkFetch(simulatedDate?: string): Promise<{
  shouldFetch: boolean
  startDate: string
  endDate: string
  reason: string
}> {
  // Utiliser la date simulée ou la vraie date d'aujourd'hui
  const today = simulatedDate ? new Date(simulatedDate + 'T00:00:00') : new Date()
  const todayStr = simulatedDate || today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
  
  if (simulatedDate) {
    console.log(`[TideCacheOptimized] 🕒 SIMULATION: Date actuelle simulée = ${todayStr}`)
  }
  
  try {
    // 1. Vérifier si on a les données d'aujourd'hui
    const todayData = await getTideCacheForDate(todayStr)
    if (!todayData) {
      return {
        shouldFetch: true,
        startDate: todayStr,
        endDate: getDatePlusDays(todayStr, 6), // 7 jours au total
        reason: 'No data for today'
      }
    }
    
    // 2. Vérifier le dernier bulk fetch
    if (!supabase) {
      return {
        shouldFetch: true,
        startDate: todayStr,
        endDate: getDatePlusDays(todayStr, 6),
        reason: 'No Supabase connection'
      }
    }
    
    const { data: lastFetch } = await supabase
      .from('tide_fetch_log')
      .select('*')
      .order('fetch_date', { ascending: false })
      .limit(1)
      .single()
    
    if (!lastFetch) {
      return {
        shouldFetch: true,
        startDate: todayStr,
        endDate: getDatePlusDays(todayStr, 6),
        reason: 'No previous bulk fetch found'
      }
    }
    
    // 3. Calculer les jours depuis le dernier fetch
    const lastFetchDate = new Date(lastFetch.fetch_date)
    const daysSinceLastFetch = Math.floor((today.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('[TideCacheOptimized] Last fetch:', lastFetch.fetch_date, 'Days since:', daysSinceLastFetch)
    
    // 4. Fetch tous les 5 jours
    if (daysSinceLastFetch >= 5) {
      return {
        shouldFetch: true,
        startDate: todayStr,
        endDate: getDatePlusDays(todayStr, 6),
        reason: `${daysSinceLastFetch} days since last fetch (>= 5)`
      }
    }
    
    // 5. Vérifier qu'on a assez de données futures
    const futureDaysNeeded = 3 // Au moins 3 jours d'avance
    const futureDate = getDatePlusDays(todayStr, futureDaysNeeded)
    const futureData = await getTideCacheForDate(futureDate)
    
    if (!futureData) {
      return {
        shouldFetch: true,
        startDate: todayStr,
        endDate: getDatePlusDays(todayStr, 6),
        reason: `Missing future data for ${futureDate}`
      }
    }
    
    return {
      shouldFetch: false,
      startDate: '',
      endDate: '',
      reason: 'Cache is sufficient'
    }
    
  } catch (error) {
    console.error('[TideCacheOptimized] Error checking bulk fetch:', error)
    return {
      shouldFetch: true,
      startDate: todayStr,
      endDate: getDatePlusDays(todayStr, 6),
      reason: 'Error checking cache'
    }
  }
}

// Log un bulk fetch
export async function logBulkFetch(startDate: string, endDate: string, daysFetched: number, simulatedDate?: string): Promise<void> {
  if (!supabase) return
  
  const today = simulatedDate ? new Date(simulatedDate + 'T00:00:00') : new Date()
  const todayStr = simulatedDate || today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
  
  if (simulatedDate) {
    console.log(`[TideCacheOptimized] 🕒 SIMULATION: Logging fetch pour date simulée = ${todayStr}`)
  }
  
  try {
    await supabase
      .from('tide_fetch_log')
      .upsert({
        fetch_date: todayStr,
        start_date: startDate,
        end_date: endDate,
        days_fetched: daysFetched
      }, {
        onConflict: 'fetch_date'
      })
    
    console.log('[TideCacheOptimized] Logged bulk fetch:', {
      fetch_date: todayStr,
      start_date: startDate,
      end_date: endDate,
      days_fetched: daysFetched
    })
  } catch (error) {
    console.error('[TideCacheOptimized] Error logging bulk fetch:', error)
  }
}

// Upsert les données pour une plage de dates (non-destructif)
export async function replaceTideDataRange(
  startDate: string,
  heightsDataByDate: Record<string, { hour: number, height: number }[]>,
  extremesDataByDate: Record<string, { time: string, height: number, type: 'High' | 'Low' }[]>
): Promise<boolean> {
  if (!supabase) return false
  
  try {
    const dates = Object.keys(heightsDataByDate).sort()
    const endDate = dates[dates.length - 1]
    
    console.log('[TideCacheOptimized] Upserting tide data from', startDate, 'to', endDate, '(non-destructive)')
    
    // Upsert données jour par jour
    for (const date of dates) {
      const heightsData = heightsDataByDate[date] || []
      const extremesData = extremesDataByDate[date] || []
      
      console.log('[TideCacheOptimized] Upserting data for:', date, 'heights:', heightsData.length, 'extremes:', extremesData.length)
      
      // Préparer les données heights pour upsert
      if (heightsData.length > 0) {
        const heightsToUpsert = heightsData.map(point => ({
          date,
          hour: point.hour,
          height: point.height
        }))
        
        const { error: heightsError } = await supabase
          .from('tide_heights')
          .upsert(heightsToUpsert, {
            onConflict: 'date,hour'
          })
        
        if (heightsError) {
          console.error('[TideCacheOptimized] Error upserting heights for', date, ':', heightsError)
          return false
        }
      }
      
      // Pour les extremes, faire delete + insert car pas de contrainte unique
      if (extremesData.length > 0) {
        // D'abord supprimer les extremes existants pour cette date
        const { error: deleteError } = await supabase
          .from('tide_extremes')
          .delete()
          .eq('date', date)
        
        if (deleteError) {
          console.error('[TideCacheOptimized] Error deleting old extremes for', date, ':', deleteError)
          return false
        }
        
        // Puis insérer les nouveaux
        const extremesToInsert = extremesData.map(extreme => ({
          date,
          time: extreme.time,
          height: extreme.height,
          type: extreme.type
        }))
        
        const { error: insertError } = await supabase
          .from('tide_extremes')
          .insert(extremesToInsert)
        
        if (insertError) {
          console.error('[TideCacheOptimized] Error inserting extremes for', date, ':', insertError)
          return false
        }
      }
    }
    
    console.log('[TideCacheOptimized] Successfully upserted data for', dates.length, 'days')
    return true
    
  } catch (error) {
    console.error('[TideCacheOptimized] Error upserting tide data range:', error)
    return false
  }
}

// Utilitaire pour ajouter des jours à une date
function getDatePlusDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
}