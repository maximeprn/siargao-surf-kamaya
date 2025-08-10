import type { SpotMeta } from '@/lib/spot-configs'

type PromptInputs = {
  spotName: string
  meta: SpotMeta
  effectiveHeight: number | null
  tideHeight: number | null
  tideRange?: { min: number; max: number } | null // Pour calculer le stage
  wavePeriod: number | null
  swellHeight: number | null
  swellDir: number | null
  windKmh: number | null
  windDir: number | null
  quality: { score: number; rating: string } | null
  locale?: 'en'|'fr'
}

const degToCard = (deg:number)=>['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(deg/22.5)%16]

// Déterminer le stage de marée basé sur la hauteur actuelle et la range du jour
function getTideStage(currentHeight: number | null, range?: { min: number; max: number } | null): string {
  if (!currentHeight || !range) return 'n/a'
  
  const { min, max } = range
  const tideRange = max - min
  const relativeHeight = (currentHeight - min) / tideRange
  
  // Déterminer le stage basé sur la position relative
  if (relativeHeight < 0.25) return 'low'
  if (relativeHeight < 0.75) return 'mid'
  return 'high'
}

export function buildSpotReportPrompt(p: PromptInputs){
  const lang = p.locale || 'en'
  const dir = (d:number|null)=> d==null ? '—' : `${Math.round(d)}° (${degToCard(d)})`
  const txt = (en:string, fr:string)=> lang==='fr' ? fr : en
  const tideStage = getTideStage(p.tideHeight, p.tideRange)

  return [
    `System: ${txt(`
  You are a surf reporter for Siargao. Output STRICT JSON only.
  Do NOT invent or forecast. Use ONLY provided fields.
  When describing any direction (swell, wind, orientation, bestWind, swellWindow), 
  convert degrees to 16-point compass cardinals (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW).
  Never print degrees in the output. If input is missing, write "n/a".
  `, `
  You are a surf reporter for Siargao. Output STRICT JSON only.
  Do NOT invent or forecast. Use ONLY provided fields.
  When describing any direction (swell, wind, orientation, bestWind, swellWindow), 
  convert degrees to 16-point compass cardinals (N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW).
  Never print degrees in the output. If input is missing, write "n/a".
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
    - Use cardinals for ALL directions. For windows/ranges, convert both bounds to cardinals (e.g., 45→120° -> NE→SE). If missing, say "n/a".
    - Do NOT describe geometry step-by-step ("placing it within…"). Instead: "window OK" or "outside window".
    - Wind effect labels: offshore / cross / onshore. No Geometry.  
    - Tide: Use the provided tide_stage (low/mid/high) directly in your report.
    - End with a verdict word and reason.
    Never include emojis, code blocks, or degrees.
    `, `
    Write for casual surfers; 2 short sentences, 35–55 words total. Keep it simple: Users already see the numbers on the dashboard—don't repeat every number. Cite only size & period when size ≥ 0.5 m; otherwise describe ("tiny/small").
    Style:
    - Punchy, field-report tone, not explanatory. Short sentences.
    - Use cardinals for ALL directions. For windows/ranges, convert both bounds to cardinals (e.g., 45→120° -> NE→SE). If missing, say "n/a".
    - Do NOT describe geometry step-by-step ("placing it within…"). Instead: "window OK" or "outside window".
    - Wind effect labels: offshore / cross / onshore. No Geometry.  
    - Tide: Use the provided tide_stage (low/mid/high) directly in your report.
    - End with a verdict word and reason.
    Never include emojis, code blocks, or degrees.
    `)}`,
    
      `Wind/Orientation Rule:
    If both orientation_deg and wind_dir_deg are present:
    - Offshore if wind_dir ≈ orientation_deg + 180 ±45
    - Cross if ≈ orientation_deg ±90 ±30
    - Onshore if ≈ orientation_deg ±45
    If missing data, write "wind effect: n/a". Use these labels only in text (offshore/cross/onshore).`,
    
      `Verdict Scoring (use first that applies):
    - "GO" if: height within optimalHeight AND swell inside window AND wind offshore or light (<=12 km/h) AND tide within range.
    - "CONDITIONAL" if: one or more items borderline/missing but potentially surfable for the spot type.
    - "NO-GO" if: height well below optimal OR strong onshore (>25 km/h) OR tiny swell outside window.`,
    
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
    
      `Output JSON schema EXACTLY:
    {
      "title": string,        // 3–7 words describing conditions (no spot mention, no figures only words) ex: "Onshore wind and small waves"
      "summary": string,      // 60–90 words, punchy field report. Don't repeat title exact words. ex: "Small, weak waves with a light onshore breeze from the SE. Faces stay soft and break quickly; expect very short rides. Better for a log or a quick splash than a real session. Verdict: NO-GO — too little push today."
      "verdict": "GO" | "CONDITIONAL" | "NO-GO"
    }
    Do not include any other keys. Do not wrap output in markdown.`
  ].join('\\n')
}