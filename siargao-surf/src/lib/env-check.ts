/**
 * Environment variable validation for production
 * This helps identify configuration issues on Vercel
 */

export function checkEnvironmentVariables() {
  const required = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ]

  const missing: string[] = []
  const configured: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key)
    } else {
      // Log first/last 4 chars for verification (security: don't log full keys)
      const value = process.env[key]
      const masked = value.length > 8 
        ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
        : '***'
      configured.push(`${key}: ${masked}`)
    }
  }

  if (missing.length > 0) {
    console.error('[ENV CHECK] Missing required environment variables:', missing)
    return false
  }

  console.log('[ENV CHECK] All required environment variables are configured:', configured)
  return true
}

export function getEnvironmentInfo() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: process.env.VERCEL || 'false',
    VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
    VERCEL_URL: process.env.VERCEL_URL || 'not set',
    API_KEY_STATUS: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
    SUPABASE_STATUS: process.env.SUPABASE_URL ? 'configured' : 'missing'
  }
}