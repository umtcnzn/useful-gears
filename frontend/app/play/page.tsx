import type { Metadata } from 'next'
import PlayClient from './PlayClient'
import { getPlayProducts } from '@/lib/supabase'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Price Guesser — Useful Gears',
  description: 'Can you guess the price of viral TikTok products? Play Price Guesser and find your next Amazon buy.',
  openGraph: {
    title: 'Price Guesser — Useful Gears',
    description: 'Guess the price of viral TikTok products. Play for free!',
    type: 'website',
  },
}

export default async function PlayPage() {
  const products = await getPlayProducts()

  return (
    <main className="min-h-screen relative pt-8 pb-20 overflow-x-hidden">
      {/* Ambient orbs */}
      <div
        className="orb pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: -120,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, rgba(201,165,90,0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="orb pointer-events-none"
        style={{
          width: 320,
          height: 320,
          bottom: 80,
          right: -80,
          background: 'radial-gradient(circle, rgba(201,165,90,0.04) 0%, transparent 70%)',
        }}
      />

      <PlayClient initialProducts={products} />
    </main>
  )
}
