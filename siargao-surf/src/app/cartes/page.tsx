import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import SiargaoMapWrapper from '@/components/SiargaoMapWrapper'

export default function MapsPage(){
  return (
    <div className="min-h-screen bg-teal text-ink-on-teal">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="eyebrow">Maps</div>
        <div className="rule mt-4 mb-8" />
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <SiargaoMapWrapper />
        </div>
      </main>
      <Footer />
    </div>
  )
}



