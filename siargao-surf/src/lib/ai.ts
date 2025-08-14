import type { SpotMeta } from '@/lib/spot-configs'

type PromptInputs = {
  spotName: string
  meta: SpotMeta
  effectiveHeight: number | null
  tideHeight: number | null
  tideRange?: { min: number; max: number } | null // Pour calculer le stage
  tideExtremes?: { time: string; height: number; type: 'High' | 'Low' }[] | null // Pour calculer le stage précis
  wavePeriod: number | null
  swellHeight: number | null
  swellDir: number | null
  windKmh: number | null
  windDir: number | null
  quality: { score: number; rating: string } | null
  locale?: 'en'|'fr'
}

const degToCard = (deg:number)=>['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg/22.5)%16]

// Direction analysis helpers
const angDiff = (a:number,b:number)=>{ const d=Math.abs(a-b)%360; return d>180?360-d:d; };
const inRangeWrap = (x:number,[a,b]:[number,number])=>{
  const n = (v:number)=> (v+360)%360;
  const A=n(a), B=n(b), X=n(x);
  return A<=B ? (X>=A && X<=B) : (X>=A || X<=B);
};

/**
 * Period-aware shoulder around the swell window.
 * Inside window => "prime window".
 * Within soft degrees of an edge => "workable angle".
 * Farther => "outside window".
 */
export function dirLabel(
  swellFromDeg:number,
  window:[number,number],
  periodSec:number
): 'prime window' | 'workable angle' | 'outside window' {
  if (inRangeWrap(swellFromDeg, window)) return 'prime window';
  const toEdge = Math.min(angDiff(swellFromDeg, window[0]), angDiff(swellFromDeg, window[1]));
  const baseSoft = 12;                            // baseline shoulder
  const extra = Math.max(0, periodSec - 10) * 0.8;// widen for long-period wrap
  const soft = Math.min(24, baseSoft + extra);    // cap widening
  return toEdge <= soft ? 'workable angle' : 'outside window';
}

// Déterminer le stage de marée basé sur la hauteur actuelle, les extremes et l'heure
function getTideStage(
  currentHeight: number | null, 
  extremes?: { time: string; height: number; type: 'High' | 'Low' }[] | null,
  currentTime?: string
): string {
  if (!currentHeight || !extremes || extremes.length === 0) return 'n/a'
  
  // Obtenir l'heure actuelle en format HH:MM si pas fournie
  if (!currentTime) {
    const philippinesTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' })
    const now = new Date(philippinesTime)
    currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  }
  
  // Convertir les heures en minutes pour faciliter les calculs
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    return hours * 60 + minutes
  }
  
  const currentMinutes = timeToMinutes(currentTime)
  
  // Trier les extremes par heure
  const sortedExtremes = [...extremes].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
  
  // Trouver les extremes avant et après l'heure actuelle
  let previousExtreme = null
  let nextExtreme = null
  
  for (let i = 0; i < sortedExtremes.length; i++) {
    const extremeMinutes = timeToMinutes(sortedExtremes[i].time)
    
    if (extremeMinutes <= currentMinutes) {
      previousExtreme = sortedExtremes[i]
    } else if (extremeMinutes > currentMinutes && !nextExtreme) {
      nextExtreme = sortedExtremes[i]
      break
    }
  }
  
  // Si pas d'extreme suivant, prendre le premier du jour suivant (cyclique)
  if (!nextExtreme && sortedExtremes.length > 0) {
    nextExtreme = sortedExtremes[0]
  }
  
  // Si pas d'extreme précédent, prendre le dernier du jour précédent (cyclique)
  if (!previousExtreme && sortedExtremes.length > 0) {
    previousExtreme = sortedExtremes[sortedExtremes.length - 1]
  }
  
  if (!previousExtreme || !nextExtreme) return 'n/a'
  
  // Déterminer si la marée monte ou descend
  const isRising = previousExtreme.type === 'Low'
  const direction = isRising ? 'incoming' : 'outgoing'
  
  // Calculer la position relative entre les deux extremes
  const rangeHeight = Math.abs(nextExtreme.height - previousExtreme.height)
  const currentRelative = Math.abs(currentHeight - previousExtreme.height) / rangeHeight
  
  // Déterminer le stage basé sur la position et la direction
  let stage: string
  let useDirection = true
  
  if (currentRelative < 0.25) {
    stage = previousExtreme.type === 'Low' ? 'low' : 'high'
    // Si très proche de l'extreme (95%+ du chemin), ne pas utiliser de direction
    if (currentRelative < 0.05) {
      useDirection = false
    }
  } else if (currentRelative > 0.75) {
    stage = nextExtreme.type === 'High' ? 'high' : 'low'
    // Si très proche de l'extreme (95%+ du chemin), ne pas utiliser de direction
    if (currentRelative > 0.95) {
      useDirection = false
    }
  } else {
    stage = 'mid'
  }
  
  return useDirection ? `${stage} ${direction}` : stage
}

export function buildSpotReportPrompt(p: PromptInputs){
  const lang = p.locale || 'en'
  const txt = (en:string, fr:string)=> lang==='fr' ? fr : en
  const tideStage = getTideStage(p.tideHeight, p.tideExtremes)
  
  // Compute swell direction label
  const swellDirLabel = (p.swellDir !== null && p.meta?.swellWindow && p.wavePeriod !== null) 
    ? dirLabel(p.swellDir, p.meta.swellWindow, p.wavePeriod)
    : null

  return [
    `System: ${txt(`
  You are a surf reporter for Siargao. Output STRICT JSON only.
  Do NOT invent or forecast. Use ONLY provided fields.
  When describing any direction (swell, wind, orientation, bestWind, swellWindow), 
  convert degrees to 16-point compass cardinals (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW).
  Never print degrees in the output. If input is missing, don't mention it. 
  `, `
  You are a surf reporter for Siargao. Output STRICT JSON only.
  Do NOT invent or forecast. Use ONLY provided fields.
  When describing any direction (swell, wind, orientation, bestWind, swellWindow), 
  convert degrees to 16-point compass cardinals (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW).
  Never print degrees in the output. If input is missing, don't mention it. 
  `)}`,
    `Data:
  {
    "spot": "${p.spotName}",
    "type": "${p.meta?.type}",
    "optimalHeight_m": ${JSON.stringify(p.meta?.optimalHeight || null)},
    "swellWindow_deg": ${JSON.stringify(p.meta?.swellWindow || null)},
    "orientation_deg": ${JSON.stringify(p.meta?.orientation || null)},
    "bestWind_deg": ${JSON.stringify(p.meta?.bestWind || null)},
    "tidalRange": "${p.meta?.tidalRange || 'n/a'}",
    "live": {
      "height_m": ${p.effectiveHeight ?? null},
      "period_s": ${p.wavePeriod ?? null},
      "swell_m": ${p.swellHeight ?? null},
      "swell_dir_deg": ${p.swellDir ?? null},
      "swell_dir_label": ${swellDirLabel ? `"${swellDirLabel}"` : null},
      "wind_kmh": ${p.windKmh ?? null},
      "wind_dir_deg": ${p.windDir ?? null},
      "tide_m": ${p.tideHeight ?? null},
      "tide_stage": "${tideStage}"
    },
    "quality": ${p.quality ? JSON.stringify({
      rating: p.quality.rating,
      score: Math.round(p.quality.score)
    }) : 'null'}
  }
  `,
  `Task: ${txt(`
    Write for casual surfers; 2 short sentences, 35–55 words total. Keep it simple: Users already see the numbers on the dashboard—don't repeat every number. Cite only size & period when size ≥ 0.5 m; otherwise describe ("tiny/small").
    Style:
    - Punchy, field-report tone, not explanatory. Short sentences.
    - Use cardinals for ALL directions. For windows/ranges, convert both bounds to cardinals (e.g., 45→120° -> NE→SE). If missing, don't mention it. 
    - Use the precomputed swell_dir_label directly: "prime window", "workable angle", or "outside window".
    - Wind effect labels: offshore / cross / onshore. No Geometry.  
    - Tide: Use the provided tide_stage (e.g., "low", "high", "low incoming", "mid outgoing", "high incoming") directly in your report.
    - End with a verdict word and reason.
    Never include emojis, code blocks, or degrees.
    `, `
    Write for casual surfers; 2 short sentences, 35–55 words total. Keep it simple: Users already see the numbers on the dashboard—don't repeat every number. Cite only size & period when size ≥ 0.5 m; otherwise describe ("tiny/small").
    Style:
    - Punchy, field-report tone, not explanatory. Short sentences.
    - Use cardinals for ALL directions. For windows/ranges, convert both bounds to cardinals (e.g., 45→120° -> NE→SE). If missing, don't mention it. 
    - Use the precomputed swell_dir_label directly: "prime window", "workable angle", or "outside window".
    - Wind effect labels: offshore / cross / onshore. No Geometry.  
    - Tide: Use the provided tide_stage (e.g., "low", "high", "low incoming", "mid outgoing", "high incoming") directly in your report.
    - End with a verdict word and reason.
    Never include emojis, code blocks, or degrees.
    `)}`,
    
      `Wind/Orientation Rule:
    If both orientation_deg and wind_dir_deg are present:
    - Offshore if wind_dir ≈ orientation_deg + 180 ±45
    - Cross if ≈ orientation_deg ±90 ±30
    - Onshore if ≈ orientation_deg ±45
    If missing data, don't mention it.  Use these labels only in text (offshore/cross/onshore).`,
    
      `Verdict Scoring (use first that applies):
    - "GO" if: height within optimalHeight AND swell_dir_label="prime window" AND wind offshore or light (<=12 km/h) AND tide within range.
    - "CONDITIONAL" if: swell_dir_label="workable angle" OR one or more items borderline/missing but potentially surfable.
    - "NO-GO" if: height well below optimal OR strong onshore (>25 km/h) OR swell_dir_label="outside window".`,
    
      `TitlePolicy:
    - Goal: a compact headline that SUMS UP conditions.
    - Prefer formats (use first that fits available data):
      A) "<height_m> m @ <period_s> s — <windEffect>, <tideStage>"
      B) "<sizeLabel> — <windEffect>, <tideStage>"
      C) "<sizeLabel>, <windEffect> — <swell_card> swell"
    - sizeLabel thresholds:
      <0.4 m: "tiny"; 0.4–0.7: "small"; 0.7–1.0: "waist"; 1.0–1.4: "chest"; 1.4–1.8: "head"; >1.8: "overhead".
    - windEffect ∈ {offshore, cross, onshore}. tideStage ∈ {low, mid, high}. Use cardinals for swell/spot orientation if needed.
    - Hard bans: generic titles ("Current Surf Conditions"), dates like "Today", the spot name, and any degrees/°.
    - 3–7 words, ≤ 55 chars, no filler.
    If the drafted title violates these rules, rewrite it once to comply.`,
    
      `Output format:
    Write a simple surf report in plain text. Start with a short title (3-7 words describing conditions), then write 2-3 sentences about the conditions (60-90 words total), and end with a verdict (GO/CONDITIONAL/NO-GO) and brief reason.
    
    Example:
    Small offshore waves
    
    Tiny 0.5m surf from the E with light offshore winds from the W. Faces are clean but underpowered, breaking weak on the reef. Mid tide keeps it soft but rideable for beginners.
    
    Verdict: NO-GO — too small for a proper session.`
  ].join('\\n')
}