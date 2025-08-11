import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase not configured',
        env_vars: {
          has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          has_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      }, { status: 503 })
    }

    // Récupérer tous les rapports en cache
    const { data: reports, error } = await supabase
      .from('ai_reports')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ 
        error: 'Database query failed', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      total_reports: reports?.length || 0,
      reports: reports?.map(r => ({
        spot_name: r.spot_name,
        locale: r.locale,
        updated_at: r.updated_at,
        expires_at: r.expires_at,
        conditions_hash: r.conditions_hash,
        verdict: r.verdict
      })) || [],
      environment: {
        is_vercel: !!process.env.VERCEL,
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabase_url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}