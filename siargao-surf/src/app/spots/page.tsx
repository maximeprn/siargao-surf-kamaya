import { supabase } from '@/lib/supabase'
import Header from '@/components/ui/Header'
import Footer from '@/components/ui/Footer'
import Link from 'next/link'

export default async function SpotsPage() {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-theme-primary text-theme-primary">
        <Header />
        <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
          <div className="eyebrow">All spots</div>
          <div className="rule mt-4" />
          <p className="mt-6">Database connection is not configured.</p>
        </main>
        <Footer />
      </div>
    )
  }
  const { data: spots } = await supabase
    .from('spots')
    .select('*')
    .order('name')

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="eyebrow">All spots</div>
        <div className="rule mt-4" />
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
          {spots?.map((spot) => (
            <Link
              key={spot.id}
              href={`/spots/${spot.id}`}
              className="rounded-lg overflow-hidden bg-white/5 dark:bg-white/5 light:bg-black/5 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-black/10 transition-colors border border-white/10 dark:border-white/10 light:border-black/10 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-theme-primary">{spot.name}</h3>
                <span className="text-xs uppercase tracking-wider text-ink-muted">{spot.wave_type}</span>
              </div>
              <p className="mt-3 text-sm text-ink-muted line-clamp-3">{spot.description}</p>
              <div className="mt-4 text-xs text-ink-muted">
                Difficulty: <span className="capitalize">{spot.difficulty_level}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}



