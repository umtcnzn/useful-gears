import { Suspense } from 'react'
import { getFeaturedProducts, getAllProducts } from '@/lib/supabase'
import { ProductCard } from '@/components/ProductCard'
import { formatViews } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 3600

async function HeroStats() {
  const products = await getAllProducts()
  const totalViews = products.reduce((sum, p) => sum + p.view_count, 0)
  return (
    <div className="flex flex-wrap justify-center gap-10 animate-fade-up-delay-3">
      {[
        { label: 'Curated Products', value: products.length.toString() },
        { label: 'Total TikTok Views', value: formatViews(totalViews) },
        { label: 'Amazon Links', value: `${products.length} Ready` },
      ].map(stat => (
        <div key={stat.label} className="text-center">
          <div
            className="text-gradient-gold"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700 }}
          >
            {stat.value}
          </div>
          <div className="text-xs text-[#5a6070] mt-1 tracking-widest uppercase">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

async function FeaturedGrid() {
  const products = await getFeaturedProducts()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 0.08}s`, animationFillMode: 'both' }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24">
        <div
          className="orb w-[600px] h-[600px] -top-40 -left-32 opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(201,165,90,0.35) 0%, transparent 70%)' }}
        />
        <div
          className="orb w-[400px] h-[400px] top-20 right-0 opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(100,140,255,0.2) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-up"
            style={{ background: 'rgba(201,165,90,0.1)', border: '1px solid rgba(201,165,90,0.22)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a55a] animate-pulse" />
            <span className="text-xs text-[#c9a55a] font-medium tracking-widest uppercase">
              Updated Daily
            </span>
          </div>

          <h1
            className="text-gradient-gold animate-fade-up-delay-1"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '0.4em',
              paddingBottom: '0.05em',
            }}
          >
            Trending on TikTok.
          </h1>
          <h2
            className="animate-fade-up-delay-2"
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
              fontWeight: 300,
              lineHeight: 1.1,
              color: '#ede8dc',
              letterSpacing: '-0.01em',
              marginBottom: '2.5rem',
            }}
          >
            Worth Every Penny.
          </h2>

          <p className="text-[#9a9488] text-lg max-w-xl mx-auto mb-12 leading-relaxed animate-fade-up-delay-2">
            We watch the viral videos so you don&apos;t have to. Every product is curated
            from millions of views and links directly to Amazon.
          </p>

          <Suspense fallback={<div className="h-20" />}>
            <HeroStats />
          </Suspense>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.25), transparent)' }} />
      </div>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-[#c9a55a] font-medium tracking-widest uppercase mb-2">
              Top Picks
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
                fontWeight: 600,
                color: '#ede8dc',
                lineHeight: 1.2,
              }}
            >
              Most Viral Products
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm text-[#9a9488] hover:text-[#c9a55a] transition-colors duration-200"
          >
            View all
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card h-52 animate-pulse" style={{ opacity: 0.5 }} />
            ))}
          </div>
        }>
          <FeaturedGrid />
        </Suspense>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: 'rgba(201,165,90,0.1)',
              border: '1px solid rgba(201,165,90,0.28)',
              color: '#c9a55a',
            }}
          >
            Explore All Products
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </section>
    </>
  )
}
