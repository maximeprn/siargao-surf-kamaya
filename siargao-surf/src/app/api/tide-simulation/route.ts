import { NextResponse } from 'next/server'
import { simulateFutureDate, inspectCurrentCache } from '@/lib/tide-simulation'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'inspect'
    const days = parseInt(url.searchParams.get('days') || '6')
    
    console.log('\n🧪 === SIMULATION DE CACHE TIDE ===')
    console.log('Action:', action)
    console.log('Days:', days)
    
    if (action === 'simulate') {
      await simulateFutureDate(days)
      return NextResponse.json({ 
        success: true, 
        action: 'simulate',
        days,
        message: `Simulation effectuée pour ${days} jours dans le futur. Vérifiez les logs.`
      })
    } else {
      await inspectCurrentCache()
      return NextResponse.json({ 
        success: true, 
        action: 'inspect',
        message: 'Inspection du cache effectuée. Vérifiez les logs.'
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur de simulation:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action = 'simulate', days = 6 } = body
    
    console.log('\n🧪 === SIMULATION POST ===')
    console.log('Body:', body)
    
    if (action === 'simulate') {
      await simulateFutureDate(days)
      return NextResponse.json({ 
        success: true, 
        action: 'simulate',
        days,
        message: `Simulation POST effectuée pour ${days} jours dans le futur.`
      })
    } else {
      await inspectCurrentCache()
      return NextResponse.json({ 
        success: true, 
        action: 'inspect',
        message: 'Inspection POST effectuée.'
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur de simulation POST:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}