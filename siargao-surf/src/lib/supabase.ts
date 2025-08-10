import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const HAS_SUPABASE = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export type Spot = {
  id: string
  name: string
  label: string | null
  description: string | null
  latitude: number
  longitude: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  wave_type: 'reef' | 'beach' | 'point' | 'rivermouth'
  best_swell_direction: string | null
  best_wind_direction: string | null
  best_tide: 'low' | 'mid' | 'high' | 'all'
  access_info: string | null
  facilities: string[] | null
  images: string[] | null
  hazards: string[] | null
  
  // Enhanced fields
  optimal_height_min: number | null
  optimal_height_max: number | null
  swell_window_start: number | null
  swell_window_end: number | null
  orientation: number | null
  wind_sensitivity: number | null
  min_skill: 'beginner' | 'intermediate' | 'advanced' | null
  max_skill: 'beginner' | 'intermediate' | 'advanced' | null
  bottom_type: string | null
  swell_period_min: number | null
  swell_period_max: number | null
  best_wind_start: number | null
  best_wind_end: number | null
  crowd_factor: number | null
  access_details: string | null
  boat_cost: string | null
  tide_window_min: number | null
  tide_window_max: number | null
  
  // JSON fields
  features: Record<string, unknown> | null
  local_tips: Record<string, string> | null
  alternative_names: string[] | null
  nearby_amenities: string[] | null
  seasonality: Record<string, number[]> | null
  
  created_at: string
  updated_at: string
}