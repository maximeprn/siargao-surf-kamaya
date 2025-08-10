import { SpotMeta } from './spot-configs'
import { swellWindowScore } from './marine-weather'

export interface WaveConditions {
  waveHeight?: number           // optional; we'll prefer components if present
  swellHeight?: number          // m
  windWaveHeight?: number       // m
  wavePeriod: number            // s (dominant/combined)
  swellPeriod?: number          // s (groundswell)
  waveDirection: number         // deg FROM (dominant)
  swellDirection?: number       // deg FROM (groundswell)
  tideHeight?: number           // m
}

/** clamp helper */
const clamp = (x:number,a:number,b:number)=>Math.max(a,Math.min(b,x))

/**
 * Effective WAVE height for a spot:
 *  - Combine swell & wind waves via RSS with a wind-sea weight gamma (spot-type dependent)
 *  - Apply spot factor (dir/period/tide) multiplicatively to the combined height
 *  - NEVER modify swellHeight itself
 */
export function effectiveWaveHeight(
  conditions: WaveConditions,
  spot: SpotMeta
): number {
  const Hs = conditions.swellHeight ?? 0
  const Hw = conditions.windWaveHeight ?? 0

  // 1) Wind-sea contribution factor by spot type (reefs discount wind chop the most)
  const gamma =
    spot.type === 'reef' ? 0.35 :
    spot.type === 'point' ? 0.40 :
    spot.type === 'beach' ? 0.55 : 0.50

  // 2) Combined face height (fallback to provided waveHeight if components missing)
  const combined =
    (Hs > 0 || Hw > 0)
      ? Math.sqrt(Hs*Hs + (gamma*Hw)*(gamma*Hw))
      : (conditions.waveHeight ?? 0)

  // 3) Spot factor from swell exposure / period / tide
  const sr = spot.sizeResponse ?? { base: 1 }

  // Direction score: prefer SWELL direction if available, else dominant wave dir
  const swellDir = conditions.swellDirection ?? conditions.waveDirection
  const sDir01 = swellWindowScore(swellDir, spot.swellWindow) // 0..1
  const dirBoost = sr.dirBoost ?? 0
  const fDir = 1 + dirBoost * (sDir01 - 0.5) * 2                // (1-boost)..(1+boost)

  // Period factor: prefer swellPeriod if available
  const T = conditions.swellPeriod ?? conditions.wavePeriod
  const pref = sr.periodRef ?? (spot.swellPeriod ? spot.swellPeriod[0] : 8)
  const perExcess = Math.max(0, T - pref)
  const fPer = 1 + (sr.periodSlope ?? 0) * perExcess

  // Tide factor
  let fTide = 1
  if (spot.tideWindow && conditions.tideHeight != null) {
    const [tMin, tMax] = spot.tideWindow
    const inWin = conditions.tideHeight >= tMin && conditions.tideHeight <= tMax
    const boost = sr.tideBoost ?? 0
    const pen = sr.tidePenalty ?? boost * 0.6
    fTide = inWin ? (1 + boost) : (1 - pen)
  }

  // 4) Compose bounded factor
  let factor = (sr.base ?? 1) * fDir * fPer * fTide
  if (sr.min != null) factor = Math.max(sr.min, factor)
  if (sr.max != null) factor = Math.min(sr.max, factor)

  // 5) Return adjusted *wave* height (not modifying swellHeight)
  return combined * factor
}

/**
 * Helper function to get tide height estimate
 * For now returns a simple mid-tide estimate, could be enhanced with real tide API
 */
export function estimateTideHeight(tideStage: 'low' | 'mid' | 'high' = 'mid'): number {
  switch (tideStage) {
    case 'low': return 0.3
    case 'mid': return 1.0  
    case 'high': return 1.7
    default: return 1.0
  }
}