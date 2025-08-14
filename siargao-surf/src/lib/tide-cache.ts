import { supabase } from './supabase'

// Types pour les données de marée en cache
export interface CachedTideHeight {
  date: string // YYYY-MM-DD
  hour: number // 0-23
  height: number
}

export interface CachedTideExtreme {
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  height: number
  type: 'High' | 'Low'
}

// Vérifier si on a déjà les données de marée pour une date
export async function getTideCacheForDate(date: string): Promise<{
  heights: CachedTideHeight[]
  extremes: CachedTideExtreme[]
} | null> {
  if (!supabase) return null

  try {
    // Récupérer les données horaires
    const { data: heights, error: heightsError } = await supabase
      .from('tide_heights')
      .select('date, hour, height')
      .eq('date', date)
      .order('hour')

    if (heightsError) {
      console.error('[TideCache] Error fetching heights:', heightsError)
      return null
    }

    // Récupérer les extremes
    const { data: extremes, error: extremesError } = await supabase
      .from('tide_extremes')
      .select('date, time, height, type')
      .eq('date', date)
      .order('time')

    if (extremesError) {
      console.error('[TideCache] Error fetching extremes:', extremesError)
      return null
    }

    // Si on n'a pas 24 points horaires, les données sont incomplètes
    if (!heights || heights.length < 24) {
      console.log('[TideCache] Incomplete hourly data for date:', date, 'found:', heights?.length || 0)
      return null
    }

    console.log('[TideCache] Found cached data for:', date, 
      'heights:', heights.length, 'extremes:', extremes?.length || 0)

    return {
      heights: heights as CachedTideHeight[],
      extremes: (extremes || []) as CachedTideExtreme[]
    }

  } catch (error) {
    console.error('[TideCache] Error checking cache:', error)
    return null
  }
}

// Sauvegarder les données de marée dans le cache
export async function saveTideDataToCache(
  date: string,
  heightsData: { hour: number, height: number }[],
  extremesData: { time: string, height: number, type: 'High' | 'Low' }[]
): Promise<boolean> {
  if (!supabase) return false

  try {
    console.log('[TideCache] Saving tide data for:', date)

    // Préparer les données horaires
    const heightsToInsert = heightsData.map(point => ({
      date,
      hour: point.hour,
      height: point.height
    }))

    // Préparer les extremes
    const extremesToInsert = extremesData.map(point => ({
      date,
      time: point.time,
      height: point.height,
      type: point.type
    }))

    // Insérer les données horaires (avec upsert pour éviter les doublons)
    const { error: heightsError } = await supabase
      .from('tide_heights')
      .upsert(heightsToInsert, { 
        onConflict: 'date,hour',
        ignoreDuplicates: false 
      })

    if (heightsError) {
      console.error('[TideCache] Error saving heights:', heightsError)
      return false
    }

    // Insérer les extremes (avec upsert pour éviter les doublons)
    if (extremesToInsert.length > 0) {
      const { error: extremesError } = await supabase
        .from('tide_extremes')
        .upsert(extremesToInsert, { 
          onConflict: 'date,time,type',
          ignoreDuplicates: false 
        })

      if (extremesError) {
        console.error('[TideCache] Error saving extremes:', extremesError)
        return false
      }
    }

    console.log('[TideCache] Successfully saved data for:', date, 
      'heights:', heightsToInsert.length, 'extremes:', extremesToInsert.length)

    return true

  } catch (error) {
    console.error('[TideCache] Error saving to cache:', error)
    return false
  }
}

// Nettoyer les données anciennes (garder 7 jours)
export async function cleanupOldTideData(): Promise<void> {
  if (!supabase) return

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoffDate = sevenDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD

    // Nettoyer les données horaires
    const { error: heightsError } = await supabase
      .from('tide_heights')
      .delete()
      .lt('date', cutoffDate)

    if (heightsError) {
      console.error('[TideCache] Error cleaning old heights:', heightsError)
    }

    // Nettoyer les extremes
    const { error: extremesError } = await supabase
      .from('tide_extremes')
      .delete()
      .lt('date', cutoffDate)

    if (extremesError) {
      console.error('[TideCache] Error cleaning old extremes:', extremesError)
    }

    console.log('[TideCache] Cleaned data older than:', cutoffDate)

  } catch (error) {
    console.error('[TideCache] Error during cleanup:', error)
  }
}