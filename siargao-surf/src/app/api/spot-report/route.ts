import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getMarineWeatherData, getWaveQuality } from '@/lib/marine-weather'
import { effectiveWaveHeight } from '@/lib/wave-height-correction'
import { siargaoSpotsComplete, spotConfigs, defaultSpotConfig } from '@/lib/spot-configs'
import { buildSpotReportPrompt } from '@/lib/ai'
import { 
  getCachedReport, 
  saveCachedReport, 
  shouldRegenerateReport, 
  generateConditionsHash,
  type ReportConditions 
} from '@/lib/ai-cache'
import OpenAI from 'openai'
import { wrapOpenAI } from 'langsmith/wrappers'
import { checkEnvironmentVariables, getEnvironmentInfo } from '@/lib/env-check'

// Use Node.js runtime (not edge) because we need crypto module for cache hashing
// Increase timeout for Vercel Functions
export const maxDuration = 30 // 30 seconds timeout

export const revalidate = 0

export async function POST(req: Request){
  let spotId: string | undefined
  let spotName: string | undefined  
  let locale: 'en' | 'fr' = 'en'
  
  try{
    // Check environment variables on first run
    if (process.env.VERCEL) {
      const envInfo = getEnvironmentInfo()
      console.log('[SPOT-REPORT] Environment info:', envInfo)
      
      if (!checkEnvironmentVariables()) {
        throw new Error('Missing required environment variables - check Vercel dashboard')
      }
    }
    
    // Check for OpenAI API key first
    if(!process.env.OPENAI_API_KEY) {
      console.error('[SPOT-REPORT ERROR] OPENAI_API_KEY is not configured')
      throw new Error('AI service not configured - missing API key')
    }
    
    const requestData = await req.json()
    spotId = requestData.spotId
    spotName = requestData.spotName
    locale = (requestData.locale === 'fr') ? 'fr' : 'en'
    
    if(!spotId && !spotName) return NextResponse.json({ error:'missing spotId or spotName' }, { status:400 })

    if(!supabase) return NextResponse.json({ error:'DB not configured' }, { status:503 })

    const { data: spot } = spotId
      ? await supabase.from('spots').select('*').eq('id', spotId).single()
      : await supabase.from('spots').select('*').eq('name', spotName).single()
    if(!spot) return NextResponse.json({ error:'spot not found' }, { status:404 })

    // Récupérer les données météo actuelles avec timeout
    console.log(`[SPOT-REPORT] Fetching weather data for ${spot.name} at ${spot.latitude}, ${spot.longitude}`)
    const weatherStartTime = Date.now()
    
    const weather = await Promise.race([
      getMarineWeatherData(spot.latitude, spot.longitude),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Weather API timeout after 10s')), 10000)
      )
    ])
    
    const weatherDuration = Date.now() - weatherStartTime
    console.log(`[SPOT-REPORT] Weather data fetched in ${weatherDuration}ms`)
    const meta = siargaoSpotsComplete[spot.name]
    const tideHeight = weather?.current.sea_level_height_msl ?? null
    const effective = weather && meta ? effectiveWaveHeight({
      waveHeight: weather.current.wave_height,
      swellHeight: weather.current.swell_wave_height,
      windWaveHeight: weather.current.wind_wave_height,
      wavePeriod: weather.current.wave_period,
      swellPeriod: weather.current.swell_wave_period,
      waveDirection: weather.current.wave_direction,
      swellDirection: weather.current.swell_wave_direction,
      tideHeight: tideHeight ?? undefined
    }, meta) : null

    const cfg = spotConfigs[spot.name] || defaultSpotConfig
    const quality = weather && effective!=null ? getWaveQuality({
      waveHeight: effective,
      wavePeriod: weather.current.wave_period,
      waveDirection: weather.current.wave_direction,
      windSpeed: weather.weather.current.windspeed ? weather.weather.current.windspeed/3.6 : undefined,
      windDirection: weather.weather.current.winddirection
    }, cfg) : null

    // Générer le hash des conditions actuelles
    const currentConditions: ReportConditions = {
      effectiveHeight: effective,
      tideHeight,
      wavePeriod: weather?.current.wave_period ?? null,
      swellHeight: weather?.current.swell_wave_height ?? null,
      swellDir: weather?.current.swell_wave_direction ?? null,
      windKmh: weather?.weather.current.windspeed ?? null,
      windDir: weather?.weather.current.winddirection ?? null,
      qualityScore: quality?.score ?? null
    }
    const conditionsHash = generateConditionsHash(currentConditions)

    // Vérifier le cache
    const cachedReport = await getCachedReport(spot.name, locale)
    
    if (cachedReport && !shouldRegenerateReport(cachedReport, conditionsHash)) {
      // Retourner le rapport mis en cache
      return new NextResponse(JSON.stringify({ 
        report: {
          title: cachedReport.title,
          summary: cachedReport.summary,
          verdict: cachedReport.verdict,
          timestamp: cachedReport.updated_at
        },
        cached: true,
        updated_at: cachedReport.updated_at
      }), {
        status: 200,
        headers: { 
          'Content-Type':'application/json', 
          'Cache-Control':'s-maxage=1800, stale-while-revalidate=3600' 
        }
      })
    }

    // Calculer la range de marée du jour
    let tideRange = null
    if (weather?.hourly?.sea_level_height_msl) {
      const tideLevels = weather.hourly.sea_level_height_msl.slice(0, 24) // Prochaines 24h
      if (tideLevels.length > 0) {
        tideRange = {
          min: Math.min(...tideLevels),
          max: Math.max(...tideLevels)
        }
      }
    }

    // Générer un nouveau rapport avec l'IA
    const prompt = buildSpotReportPrompt({
      spotName: spot.name,
      meta,
      effectiveHeight: effective,
      tideHeight,
      tideRange,
      wavePeriod: weather?.current.wave_period ?? null,
      swellHeight: weather?.current.swell_wave_height ?? null,
      swellDir: weather?.current.swell_wave_direction ?? null,
      windKmh: weather?.weather.current.windspeed ?? null,
      windDir: weather?.weather.current.winddirection ?? null,
      quality,
      locale
    })

    const client = wrapOpenAI(new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 20000, // 20 second timeout for OpenAI API
    }))
    
    console.log('[SPOT-REPORT] Starting OpenAI API call:', {
      model: 'gpt-4.1',
      promptLength: prompt.length,
      spot: spot.name,
      locale,
      timestamp: new Date().toISOString()
    })
    
    const startTime = Date.now()
    
    const resp = await client.chat.completions.create({
      model: 'gpt-4.1',
      max_completion_tokens: 200,
      messages: [
        { role:'system', content:'You must respond with valid JSON containing exactly these fields: {"title": "...", "summary": "...", "verdict": "..."}. The verdict must be GO, CONDITIONAL, or NO-GO. Do not include any text outside the JSON object.' },
        { role:'user', content: prompt + '\n\nRespond with JSON only.' }
      ]
    })
    
    const apiDuration = Date.now() - startTime
    console.log(`[SPOT-REPORT] OpenAI API call completed in ${apiDuration}ms`)
    
    console.log('OpenAI response metadata:', {
      model: resp.model,
      usage: resp.usage,
      finish_reason: resp.choices[0]?.finish_reason
    })

    const text = resp.choices[0]?.message?.content?.trim() || ''
    
    // Debug logging for API costs investigation
    // Fonction pour nettoyer et valider le JSON
    function ensureValidJSON(text: string): { title: string; summary: string; verdict: 'GO' | 'CONDITIONAL' | 'NO-GO' } {
      // Enlever les blocs markdown si présents
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      
      // Chercher un objet JSON dans le texte
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        text = jsonMatch[0]
      }
      
      try {
        const parsed = JSON.parse(text)
        
        // Valider et nettoyer les champs requis
        const result = {
          title: parsed.title || parsed.Title || 'Surf Report',
          summary: parsed.summary || parsed.Summary || parsed.report || '',
          verdict: (parsed.verdict || parsed.Verdict || 'NO-GO').toUpperCase()
        }
        
        // S'assurer que le verdict est valide
        if (!['GO', 'CONDITIONAL', 'NO-GO'].includes(result.verdict)) {
          if (result.verdict.includes('GO') && !result.verdict.includes('NO')) {
            result.verdict = result.verdict.includes('CONDITIONAL') ? 'CONDITIONAL' : 'GO'
          } else {
            result.verdict = 'NO-GO'
          }
        }
        
        return result
      } catch {
        // Fallback: essayer de construire manuellement
        const lines = text.split('\n').filter(line => line.trim())
        return {
          title: lines[0] || 'Surf Report',
          summary: lines.slice(1, -1).join(' ').trim() || 'No detailed report available.',
          verdict: 'NO-GO'
        }
      }
    }

    console.log('=== AI RESPONSE DEBUG ===')
    console.log('Response length:', text.length, 'characters')
    console.log('Input tokens estimate:', Math.ceil(prompt.length / 4))
    console.log('Full AI response:')
    console.log(text)
    console.log('=== END DEBUG ===')
    
    // Utiliser notre fonction de nettoyage JSON
    const json = ensureValidJSON(text)

    // Sauvegarder le nouveau rapport dans le cache
    await saveCachedReport(spot.name, spot.id, locale, json, conditionsHash)

    const now = new Date().toISOString()
    return new NextResponse(JSON.stringify({ 
      report: {
        ...json,
        timestamp: now
      },
      cached: false,
      generated_at: now
    }), {
      status: 200,
      headers: { 
        'Content-Type':'application/json', 
        'Cache-Control':'s-maxage=1800, stale-while-revalidate=3600' 
      }
    })
  }catch(e: unknown){
    const error = e as Error
    
    // Log detailed error information for debugging
    console.error('[SPOT-REPORT ERROR] Main error:', {
      message: error?.message,
      stack: error?.stack,
      spotName,
      spotId,
      locale,
      timestamp: new Date().toISOString()
    })
    
    // En cas d'erreur, essayer de retourner le dernier rapport en cache
    if(spotName || spotId) {
      try {
        const name = spotName || (spotId && await supabase?.from('spots').select('name').eq('id', spotId).single().then(r => r.data?.name))
        if(name) {
          const cachedReport = await getCachedReport(name, locale || 'en')
          if(cachedReport) {
            console.log('[SPOT-REPORT] Returning fallback cached report for:', name)
            return new NextResponse(JSON.stringify({ 
              report: {
                title: cachedReport.title,
                summary: cachedReport.summary,
                verdict: cachedReport.verdict,
                timestamp: cachedReport.updated_at
              },
              cached: true,
              fallback: true,
              error_reason: error?.message?.substring(0, 100), // Include truncated error reason
              updated_at: cachedReport.updated_at
            }), {
              status: 200,
              headers: { 'Content-Type':'application/json' }
            })
          }
        }
      } catch (fallbackError) {
        console.error('[SPOT-REPORT ERROR] Fallback error:', fallbackError)
      }
    }
    
    return NextResponse.json({ 
      error: error?.message || 'ai_error',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status:500 })
  }
}