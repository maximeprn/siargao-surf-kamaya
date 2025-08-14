import { NextResponse } from 'next/server'
import { shouldDoBulkFetch, logBulkFetch, replaceTideDataRange } from '@/lib/tide-cache-optimized'
import { getTideCacheForDate } from '@/lib/tide-cache'

const WORLDTIDES_API_KEY = 'cce16f26-abf6-4a27-ab4c-504e626631fb'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action = 'test', simulatedDate, forceRefresh = false } = body
    
    console.log('\n🧪 === BULK FETCH TEST ===')
    console.log('Action:', action)
    console.log('Simulated date:', simulatedDate)
    console.log('Force refresh:', forceRefresh)
    
    if (action === 'inspect-before') {
      return await inspectCacheState()
    }
    
    if (action === 'real-fetch') {
      return await doRealBulkFetch(simulatedDate, forceRefresh)
    }
    
    if (action === 'inspect-after') {
      return await inspectCacheState()
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: inspect-before, real-fetch, inspect-after'
    }, { status: 400 })
    
  } catch (error) {
    console.error('❌ Bulk fetch test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function inspectCacheState() {
  console.log('\n🔍 === INSPECTION CACHE STATE ===')
  
  const results = []
  const today = new Date()
  
  for (let i = -2; i <= 10; i++) {
    const testDate = new Date(today)
    testDate.setDate(testDate.getDate() + i)
    const dateStr = testDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    
    const cachedData = await getTideCacheForDate(dateStr)
    
    const result = {
      date: dateStr,
      offset: i,
      label: i === 0 ? 'AUJOURD\'HUI' : 
             i === 1 ? 'DEMAIN' : 
             i > 0 ? `J+${i}` : `J${i}`,
      hasData: !!cachedData,
      heights: cachedData?.heights.length || 0,
      extremes: cachedData?.extremes.length || 0
    }
    
    results.push(result)
    
    const status = cachedData ? 
      `✅ ${cachedData.heights.length}h + ${cachedData.extremes.length}e` : 
      '❌ Vide'
    
    console.log(`${dateStr} ${result.label}: ${status}`)
  }
  
  return NextResponse.json({
    success: true,
    action: 'inspect',
    results,
    message: 'Cache inspection completed'
  })
}

async function doRealBulkFetch(simulatedDate?: string, forceRefresh = false) {
  console.log('\n🚀 === REAL BULK FETCH TEST ===')
  
  // Vérifier si on a besoin de faire un bulk fetch
  const bulkCheck = await shouldDoBulkFetch(simulatedDate)
  
  console.log('📋 Bulk fetch check:')
  console.log(`   Should fetch: ${bulkCheck.shouldFetch}`)
  console.log(`   Reason: ${bulkCheck.reason}`)
  
  if (!bulkCheck.shouldFetch && !forceRefresh) {
    return NextResponse.json({
      success: true,
      action: 'real-fetch',
      skipped: true,
      reason: bulkCheck.reason,
      message: 'Bulk fetch not needed. Use forceRefresh: true to override.'
    })
  }
  
  let startDate = bulkCheck.startDate
  let endDate = bulkCheck.endDate
  
  if (forceRefresh && (!startDate || !endDate)) {
    // Si on force le refresh mais qu'on n'a pas de dates, utiliser aujourd'hui
    const today = new Date()
    startDate = today.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    const endDateObj = new Date(today)
    endDateObj.setDate(endDateObj.getDate() + 6)
    endDate = endDateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    console.log('🔄 Force refresh enabled - using today as start date')
  }
  
  console.log(`🌊 Fetching 6 days: ${startDate} → ${endDate}`)
  
  try {
    // Faire le vrai appel API WorldTides
    const lat = 9.80
    const lon = 126.17
    
    const url = new URL('https://www.worldtides.info/api/v3')
    url.searchParams.append('lat', lat.toString())
    url.searchParams.append('lon', lon.toString())
    url.searchParams.append('localtime', '')
    url.searchParams.append('timezone', '')
    url.searchParams.append('datum', 'CD')
    url.searchParams.append('date', startDate)
    url.searchParams.append('days', '6') // Fetch 6 jours
    url.searchParams.append('step', '3600') // Hourly data
    url.searchParams.append('StationDistance', '0')
    url.searchParams.append('key', WORLDTIDES_API_KEY)
    url.searchParams.append('heights', '')
    url.searchParams.append('extremes', '')
    url.searchParams.append('datums', '')

    console.log('🌐 Calling WorldTides API:', url.toString())

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`WorldTides API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.status !== 200) {
      throw new Error(`WorldTides API returned status: ${data.status}`)
    }

    console.log('✅ WorldTides API Response:', {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.heights.forEach((height: any) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.extremes.forEach((extreme: any) => {
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

    const datesSaved = Object.keys(heightsDataByDate).sort()
    console.log('📊 Organized bulk data by date:', datesSaved)

    // Remplacer toutes les données dans Supabase
    console.log('💾 Replacing data in Supabase...')
    const success = await replaceTideDataRange(startDate, heightsDataByDate, extremesDataByDate)
    
    if (success) {
      // Logger le bulk fetch
      await logBulkFetch(startDate, endDate, 7, simulatedDate)
      console.log('✅ Bulk fetch completed successfully')
      
      return NextResponse.json({
        success: true,
        action: 'real-fetch',
        bulkCheck: { ...bulkCheck, startDate, endDate },
        apiResponse: {
          status: data.status,
          callCount: data.callCount,
          heightsCount: data.heights?.length || 0,
          extremesCount: data.extremes?.length || 0
        },
        datesSaved,
        message: `Successfully fetched and saved ${datesSaved.length} days of tide data`
      })
    } else {
      throw new Error('Failed to save bulk data to cache')
    }

  } catch (error) {
    console.error('❌ Real bulk fetch error:', error)
    throw error
  }
}