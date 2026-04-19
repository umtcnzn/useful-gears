import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50"
      style={{ background: 'rgba(7,9,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,165,90,0.1)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="text-2xl tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 700, color: '#c9a55a' }}
          >
            Useful
          </span>
          <span
            className="text-2xl tracking-tight"
            style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 300, color: '#ede8dc' }}
          >
            Gears
          </span>
          <div className="w-1 h-1 rounded-full bg-[#c9a55a] mb-0.5" />
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-sm text-[#9a9488] hover:text-[#ede8dc] transition-colors duration-200 tracking-wide"
          >
            Home
          </Link>
          <Link
            href="/products"
            className="text-sm text-[#9a9488] hover:text-[#ede8dc] transition-colors duration-200 tracking-wide"
          >
            All Products
          </Link>
          <Link
            href="/play"
            className="text-sm font-semibold transition-colors duration-200 tracking-wide"
            style={{ color: '#c9a55a' }}
          >
            🎮 Play
          </Link>
          <a
            href="https://www.amazon.com/s?k=Useful+Gears&tag=usefulgears-20"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-amazon-btn text-sm font-semibold px-4 py-1.5 rounded-full transition-all duration-200"
          >
            Shop Amazon
          </a>
        </div>
      </div>
    </nav>
  )
}
