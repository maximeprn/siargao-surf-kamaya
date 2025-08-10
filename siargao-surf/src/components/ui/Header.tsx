import Link from 'next/link'
import SpotSelector from './SpotSelector'
import ThemeToggle from './ThemeToggle'

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
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 text-theme-muted text-sm">
            <Link href="/" className="hover:text-theme-primary transition-colors">Surf</Link>
            <SpotSelector />
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}



