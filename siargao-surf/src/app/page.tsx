import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SurfPhotoCardAqua from '@/components/ui/SurfPhotoCardAqua'
import SpotDetailsOverlay from '@/components/ui/SpotDetailsOverlay'
import ClientWeatherData from '@/components/ClientWeatherData'
import ScrollReveal from '@/components/ui/ScrollReveal'
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
        <ScrollReveal direction="up" intensity="medium" delay={0.1}>
          <ClientWeatherData
            spotName="Cloud 9"
            location="Siargao Island, Philippines"
            coords={coords}
          />
        </ScrollReveal>

        {/* Additional sections to demonstrate scroll reveal */}
        <ScrollReveal direction="left" intensity="strong" delay={0.05}>
          <section className="bg-glass border border-glass rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-theme-primary mb-4">Découvrez Siargao</h2>
            <p className="text-theme-muted text-lg leading-relaxed">
              Siargao Island est considérée comme la capitale du surf des Philippines. 
              Avec ses vagues de classe mondiale et ses paysages tropicaux époustouflants, 
              c&apos;est un paradis pour les surfeurs du monde entier.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="right" intensity="strong" delay={0.05}>
          <section className="bg-glass border border-glass rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-theme-primary mb-4">Conditions en Temps Réel</h2>
            <p className="text-theme-muted text-lg leading-relaxed">
              Notre système analyse en permanence les conditions de surf, 
              intégrant données météorologiques, marées et caractéristiques uniques de chaque spot 
              pour vous offrir les prévisions les plus précises.
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal direction="fade" intensity="medium" delay={0.1}>
          <section className="bg-glass border border-glass rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-theme-primary mb-4">Intelligence Artificielle</h2>
            <p className="text-theme-muted text-lg leading-relaxed">
              Nos rapports de surf sont générés par IA, analysant une multitude de facteurs 
              pour vous donner des recommandations personnalisées et des insights approfondis 
              sur les conditions de chaque session.
            </p>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  )
}