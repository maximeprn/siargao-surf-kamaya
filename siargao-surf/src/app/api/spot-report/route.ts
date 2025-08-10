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

export const revalidate = 0

export async function POST(req: Request){
  let spotId: string | undefined
  let spotName: string | undefined  
  let locale: 'en' | 'fr' = 'en'
  
  try{
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

    // Récupérer les données météo actuelles
    const weather = await getMarineWeatherData(spot.latitude, spot.longitude)
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

    const client = wrapOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }))
    console.log('Making OpenAI API call with model: gpt-5-mini (plain text)')
    console.log('Prompt length:', prompt.length, 'characters')
    
    const resp = await client.chat.completions.create({
      model: 'gpt-5-mini',
      max_completion_tokens: 200,
      messages: [
        { role:'system', content:'Write a simple surf report in plain text format as specified.' },
        { role:'user', content: prompt }
      ]
    })
    
    console.log('OpenAI response metadata:', {
      model: resp.model,
      usage: resp.usage,
      finish_reason: resp.choices[0]?.finish_reason
    })

    const text = resp.choices[0]?.message?.content?.trim() || ''
    
    // Debug logging for API costs investigation
    console.log('=== AI RESPONSE DEBUG ===')
    console.log('Response length:', text.length, 'characters')
    console.log('Input tokens estimate:', Math.ceil(prompt.length / 4))
    console.log('Full AI response:')
    console.log(text)
    console.log('=== END DEBUG ===')
    
    // Try to parse as JSON first, fallback to plain text parsing
    let json
    try {
      json = JSON.parse(text)
    } catch {
      // Fallback to plain text parsing
      const lines = text.split('\n').filter(line => line.trim())
      const title = lines[0] || 'Surf Report'
      const summaryLines = lines.slice(1, -1)
      const verdictLine = lines[lines.length - 1] || 'Verdict: NO-GO'
      
      const summary = summaryLines.join(' ').trim()
      const verdict = verdictLine.includes('GO —') ? 'GO' : 
                     verdictLine.includes('CONDITIONAL') ? 'CONDITIONAL' : 'NO-GO'
                     
      json = { title, summary, verdict }
    }

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
    // En cas d'erreur, essayer de retourner le dernier rapport en cache
    if(spotName || spotId) {
      try {
        const name = spotName || (spotId && await supabase?.from('spots').select('name').eq('id', spotId).single().then(r => r.data?.name))
        if(name) {
          const cachedReport = await getCachedReport(name, locale || 'en')
          if(cachedReport) {
            return new NextResponse(JSON.stringify({ 
              report: {
                title: cachedReport.title,
                summary: cachedReport.summary,
                verdict: cachedReport.verdict,
                timestamp: cachedReport.updated_at
              },
              cached: true,
              fallback: true,
              updated_at: cachedReport.updated_at
            }), {
              status: 200,
              headers: { 'Content-Type':'application/json' }
            })
          }
        }
      } catch {
        // Ignore les erreurs de fallback
      }
    }
    
    return NextResponse.json({ error: error?.message || 'ai_error' }, { status:500 })
  }
}