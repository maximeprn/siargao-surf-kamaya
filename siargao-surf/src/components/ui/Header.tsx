import Link from 'next/link'
import SpotSelector from './SpotSelector'

function Logo() {
  return (
    <div className="select-none">
      <img 
        src="/branding/kamaya-surf-logo.svg?v=4" 
        alt="Siargao Surf by Kamaya" 
        className="w-auto"
        style={{ height: 'var(--logo-svg)' }}
      />
    </div>
  )
}

export default function Header() {
  return (
    <div className="sticky top-0 z-30 header">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-white/80 text-sm">
          <Link href="/" className="hover:text-white">Surf</Link>
          <SpotSelector />
        </nav>
      </div>
    </div>
  )
}



