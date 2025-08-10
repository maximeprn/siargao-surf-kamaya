import Link from 'next/link'

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
      <div className="w-full px-12 h-14 flex items-center">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-white/80 text-sm">
            <Link href="/" className="hover:text-white">Surf</Link>
            <Link href="/spots" className="hover:text-white">Spots</Link>
          </nav>
        </div>
      </div>
    </div>
  )
}



