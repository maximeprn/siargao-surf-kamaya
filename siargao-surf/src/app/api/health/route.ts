import { NextResponse } from 'next/server'
import { getEnvironmentInfo } from '@/lib/env-check'
import { supabase } from '@/lib/supabase'

/**
 * Health check endpoint for debugging production issues
 * Access at /api/health to check system status
 */
export async function GET() {
  const health: any = {
    status: 'checking',
    timestamp: new Date().toISOString(),
    environment: getEnvironmentInfo(),
    services: {
      openai: 'unknown',
      supabase: 'unknown',
      weatherApi: 'unknown'
    },
    errors: []
  }

  // Check OpenAI configuration
  if (process.env.OPENAI_API_KEY) {
    const key = process.env.OPENAI_API_KEY
    health.services.openai = {
      configured: true,
      keyPreview: `${key.substring(0, 7)}...${key.substring(key.length - 4)}`
    }
  } else {
    health.services.openai = { configured: false, error: 'API key not set' }
    health.errors.push('OpenAI API key not configured')
  }

  // Check Supabase connection
  try {
    if (supabase) {
      const { count, error } = await supabase
        .from('spots')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        health.services.supabase = { connected: false, error: error.message }
        health.errors.push(`Supabase error: ${error.message}`)
      } else {
        health.services.supabase = { connected: true, spotsCount: count }
      }
    } else {
      health.services.supabase = { connected: false, error: 'Client not initialized' }
      health.errors.push('Supabase client not initialized')
    }
  } catch (error: any) {
    health.services.supabase = { connected: false, error: error.message }
    health.errors.push(`Supabase connection error: ${error.message}`)
  }

  // Test weather API
  try {
    const testLat = 9.8432
    const testLon = 126.0586
    
    const weatherTest = await Promise.race([
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${testLat}&longitude=${testLon}&current=wave_height&timezone=Asia%2FManila`),
      new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      )
    ])
    
    if (weatherTest.ok) {
      const data = await weatherTest.json()
      health.services.weatherApi = { 
        connected: true, 
        hasData: !!data.current 
      }
    } else {
      health.services.weatherApi = { 
        connected: false, 
        status: weatherTest.status 
      }
      health.errors.push(`Weather API returned status ${weatherTest.status}`)
    }
  } catch (error: any) {
    health.services.weatherApi = { 
      connected: false, 
      error: error.message 
    }
    health.errors.push(`Weather API error: ${error.message}`)
  }

  // Overall health status
  health.status = health.errors.length === 0 ? 'healthy' : 'unhealthy'
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  })
}