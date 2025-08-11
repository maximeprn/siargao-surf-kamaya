import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SurfPhotoCardAqua from '@/components/ui/SurfPhotoCardAqua'
import SpotDetailsOverlay from '@/components/ui/SpotDetailsOverlay'
import ClientSpotData from '@/components/ClientSpotData'
import { getSpotImage } from '@/lib/cdn-images'

export default async function SpotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  if (!supabase) {
    notFound()
  }

  // MINIMAL SSR - Only fetch spot coordinates (fast query)
  const spotNameFromSlug = id.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const { data: spot, error } = await supabase
    .from('spots')
    .select('id, name, latitude, longitude')
    .eq('name', spotNameFromSlug)
    .single()

  if (error || !spot) {
    notFound()
  }

  const coords = { lat: spot.latitude, lon: spot.longitude }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 space-y-20">
        {/* Hero Image - loads immediately with preload */}
        <SurfPhotoCardAqua 
          src={getSpotImage(spot.name)}
          causticsOpacity={0.28}
        >
          <SpotDetailsOverlay spotName={spot.name} />
        </SurfPhotoCardAqua>

        {/* Weather data loads client-side for fast LCP */}
        <ClientSpotData
          spotId={spot.id}
          spotName={spot.name}
          coords={coords}
        />
      </main>
      <Footer />
    </div>
  )
}