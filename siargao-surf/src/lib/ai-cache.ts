import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export interface CachedReport {
  id: string
  spot_name: string
  spot_id: string | null
  locale: string
  title: string
  summary: string
  verdict: 'GO' | 'CONDITIONAL' | 'NO-GO'
  created_at: string
  updated_at: string
  expires_at: string
  conditions_hash: string
}

export interface ReportConditions {
  effectiveHeight: number | null
  tideHeight: number | null
  wavePeriod: number | null
  swellHeight: number | null
  swellDir: number | null
  windKmh: number | null
  windDir: number | null
  qualityScore: number | null
}

// Génère un hash des conditions pour détecter les changements significatifs
export function generateConditionsHash(conditions: ReportConditions): string {
  // Arrondir les valeurs pour éviter les régénérations trop fréquentes pour des micro-changements
  const rounded = {
    effectiveHeight: conditions.effectiveHeight ? Math.round(conditions.effectiveHeight * 10) / 10 : null,
    tideHeight: conditions.tideHeight ? Math.round(conditions.tideHeight * 10) / 10 : null,
    wavePeriod: conditions.wavePeriod ? Math.round(conditions.wavePeriod) : null,
    swellHeight: conditions.swellHeight ? Math.round(conditions.swellHeight * 10) / 10 : null,
    swellDir: conditions.swellDir ? Math.round(conditions.swellDir / 10) * 10 : null, // Grouper par 10°
    windKmh: conditions.windKmh ? Math.round(conditions.windKmh / 5) * 5 : null, // Grouper par 5 km/h
    windDir: conditions.windDir ? Math.round(conditions.windDir / 10) * 10 : null, // Grouper par 10°
    qualityScore: conditions.qualityScore ? Math.round(conditions.qualityScore / 5) * 5 : null, // Grouper par 5 points
    // Version key to invalidate cache when AI logic changes
    aiVersion: 'v2.0_workable_angle'
  }
  
  return crypto.createHash('md5').update(JSON.stringify(rounded)).digest('hex')
}

// Calcule la prochaine heure de régénération (4am ou 11pm PH time)
export function getNextScheduledUpdate(): Date {
  const now = new Date()
  // Convertir en heure des Philippines (UTC+8)
  const phTime = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  
  // Heures cibles: 4:00 et 23:00
  const targetHours = [4, 23]
  
  let nextUpdate = new Date(phTime)
  nextUpdate.setMinutes(0, 0, 0)
  
  // Trouver la prochaine heure cible
  for (const hour of targetHours) {
    const candidateTime = new Date(phTime)
    candidateTime.setHours(hour, 0, 0, 0)
    
    if (candidateTime > phTime) {
      nextUpdate = candidateTime
      break
    }
  }
  
  // Si aucune heure aujourd'hui, prendre 4am demain
  if (nextUpdate <= phTime) {
    nextUpdate.setDate(nextUpdate.getDate() + 1)
    nextUpdate.setHours(4, 0, 0, 0)
  }
  
  // Reconvertir en UTC
  return new Date(nextUpdate.getTime() - (8 * 60 * 60 * 1000))
}

// Vérifie si un rapport doit être régénéré
export function shouldRegenerateReport(
  cachedReport: CachedReport | null,
  currentConditionsHash: string
): boolean {
  if (!cachedReport) {
    console.log('[AI-CACHE] No cached report - regeneration needed')
    return true
  }
  
  const now = new Date()
  const expiresAt = new Date(cachedReport.expires_at)
  const updatedAt = new Date(cachedReport.updated_at)
  
  console.log('[AI-CACHE] Checking regeneration conditions:', {
    now: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    updated_at: updatedAt.toISOString(),
    current_hash: currentConditionsHash,
    cached_hash: cachedReport.conditions_hash,
    is_expired: now > expiresAt
  })
  
  // Régénérer si expiré (passé 4am ou 11pm)
  if (now > expiresAt) {
    console.log('[AI-CACHE] Report expired - regeneration needed')
    return true
  }
  
  // Régénérer si les conditions ont significativement changé (immediate for testing AI changes)
  if (cachedReport.conditions_hash !== currentConditionsHash) {
    console.log('[AI-CACHE] Conditions hash changed - regeneration needed')
    return true
  }
  
  console.log('[AI-CACHE] Using cached report - no regeneration needed')
  return false
}

// Récupère un rapport depuis le cache
export async function getCachedReport(
  spotName: string, 
  locale: string = 'en'
): Promise<CachedReport | null> {
  if (!supabase) {
    console.log('[AI-CACHE] Supabase client not available')
    return null
  }
  
  console.log(`[AI-CACHE] Searching for cached report: spot="${spotName}", locale="${locale}"`)
  
  const { data, error } = await supabase
    .from('ai_reports')
    .select('*')
    .eq('spot_name', spotName)
    .eq('locale', locale)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.log(`[AI-CACHE] Database error:`, error.message)
    return null
  }
  
  if (!data) {
    console.log(`[AI-CACHE] No cached report found for spot="${spotName}", locale="${locale}"`)
    return null
  }
  
  console.log(`[AI-CACHE] Found cached report:`, {
    spot: data.spot_name,
    locale: data.locale,
    updated_at: data.updated_at,
    expires_at: data.expires_at,
    conditions_hash: data.conditions_hash
  })
  
  return data as CachedReport
}

// Sauvegarde un rapport dans le cache
export async function saveCachedReport(
  spotName: string,
  spotId: string | null,
  locale: string,
  report: { title: string; summary: string; verdict: 'GO' | 'CONDITIONAL' | 'NO-GO' },
  conditionsHash: string
): Promise<void> {
  if (!supabase) return
  
  const expiresAt = getNextScheduledUpdate()
  
  await supabase
    .from('ai_reports')
    .upsert({
      spot_name: spotName,
      spot_id: spotId,
      locale,
      title: report.title,
      summary: report.summary,
      verdict: report.verdict,
      conditions_hash: conditionsHash,
      expires_at: expiresAt.toISOString()
    }, {
      onConflict: 'spot_name,locale'
    })
}