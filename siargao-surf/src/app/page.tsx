import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SurfPhotoCardAqua from '@/components/ui/SurfPhotoCardAqua'
import SpotDetailsOverlay from '@/components/ui/SpotDetailsOverlay'
import ClientWeatherData from '@/components/ClientWeatherData'
import { CDN_IMAGES } from '@/lib/cdn-images'
import { supabase } from '@/lib/supabase'
import { siargaoSpotsComplete } from '@/lib/spot-configs'
import type { SpotMeta } from '@/lib/spot-configs'

export default async function Home() {
  // MINIMAL SSR - Only fetch coordinates (fast query)
  type Coords = { latitude: number; longitude: number } | null
  let c9: Coords = null
  
  if (supabase) {
    const { data } = await supabase
      .from('spots')
      .select('latitude, longitude')
      .eq('name', 'Cloud 9')
      .single()
    c9 = data as Coords
  }

  const meta = siargaoSpotsComplete['Cloud 9'] as SpotMeta
  const coords = c9 ? { lat: c9.latitude, lon: c9.longitude } : (meta?.coords ? { lat: meta.coords.lat, lon: meta.coords.lon } : null)

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 space-y-20">
        {/* Hero Image - loads immediately with preload */}
        <SurfPhotoCardAqua 
          src={CDN_IMAGES.cloudNine}
          causticsOpacity={0.28}
        >
          <SpotDetailsOverlay spotName="Cloud 9" />
        </SurfPhotoCardAqua>

        {/* Weather data loads client-side for fast LCP */}
        <ClientWeatherData
          spotName="Cloud 9"
          location="Siargao Island, Philippines"
          coords={coords}
        />
      </main>
      <Footer />
    </div>
  )
}