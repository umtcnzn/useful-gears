'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Product } from '@/lib/types'
import { TikTokEmbed } from '@/components/TikTokEmbed'
import Image from 'next/image'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generatePriceOptions(realPrice: number): number[] {
  const candidates = [
    0.45, 0.55, 0.62, 0.70, 0.78, 0.85,
    1.18, 1.28, 1.40, 1.55, 1.72, 1.90, 2.2,
  ]
  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  const decoys: number[] = []

  for (const m of shuffled) {
    const val = Math.round(realPrice * m)
    const tooClose = [realPrice, ...decoys].some(
      (p) => Math.abs(p - val) / realPrice < 0.13
    )
    if (!tooClose && val > 0) {
      decoys.push(val)
      if (decoys.length === 3) break
    }
  }

  // fallback if not enough decoys
  while (decoys.length < 3) {
    const fallback = Math.round(realPrice * (1.5 + decoys.length * 0.3))
    decoys.push(fallback)
  }

  return [Math.round(realPrice), ...decoys].sort(() => Math.random() - 0.5)
}

function formatPrice(price: number): string {
  return `$${price.toLocaleString('en-US')}`
}

// ─── Confetti ────────────────────────────────────────────────────────────────

function fireConfetti() {
  const GOLD = ['#c9a55a', '#f0c060', '#e8c878']
  const WHITE = ['#ede8dc', '#ffffff']
  const colors = [...GOLD, ...WHITE]

  confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 }, colors })
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 90, origin: { x: 0.1, y: 0.6 }, colors })
    confetti({ particleCount: 60, spread: 90, origin: { x: 0.9, y: 0.6 }, colors })
  }, 200)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GameState = 'loading' | 'playing' | 'correct' | 'empty'

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PlayClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState<Product[]>(initialProducts)
  const [shownIds, setShownIds] = useState<Set<number>>(new Set())
  const [product, setProduct] = useState<Product | null>(null)
  const [options, setOptions] = useState<number[]>([])
  const [gameState, setGameState] = useState<GameState>('playing')
  const [selectedWrong, setSelectedWrong] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pick a random unseen product
  const loadNext = useCallback(
    (productList: Product[], seen: Set<number>) => {
      const pool = productList.filter((p) => !seen.has(p.id))
      const source = pool.length > 0 ? pool : productList // reset if all seen

      const pick = source[Math.floor(Math.random() * source.length)]
      const newSeen = pool.length > 0 ? new Set(seen).add(pick.id) : new Set<number>([pick.id])

      setShownIds(newSeen)
      setProduct(pick)
      setOptions(generatePriceOptions(pick.price!))
      setSelectedWrong(null)
      setGameState('playing')
    },
    []
  )

  // Kick off the first round on mount
  useEffect(() => {
    if (products.length === 0) {
      setGameState('empty')
    } else {
      loadNext(products, new Set())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = (option: number) => {
    if (gameState !== 'playing' || !product) return
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current)

    const correct = Math.round(product.price!)

    if (option === correct) {
      setGameState('correct')
      setStreak((s) => s + 1)
      setScore((s) => s + 1)
      fireConfetti()
    } else {
      setSelectedWrong(option)
      shakeTimeoutRef.current = setTimeout(() => setSelectedWrong(null), 600)
    }
  }

  const handleNext = () => {
    setGameState('loading')
    setTimeout(() => loadNext(products, shownIds), 250)
  }

  // ── Render: empty state ──
  if (gameState === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
        <div className="text-6xl">🎮</div>
        <h2
          style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700 }}
          className="text-gradient-gold"
        >
          Game Coming Soon
        </h2>
        <p className="text-[#9a9488] max-w-sm">
          We're adding prices to our product database. Check back soon!
        </p>
      </div>
    )
  }

  // ── Render: loading ──
  if (gameState === 'loading' || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 rounded-full border-2 border-[rgba(201,165,90,0.2)] border-t-[#c9a55a]"
        />
      </div>
    )
  }

  const amazonUrl = product.amazon_product_url || product.affiliate_url

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">

      {/* ── Header: Score + Streak ── */}
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-gradient-gold"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}
          >
            Price Guesser
          </p>
          <p className="text-xs text-[#5a6070] mt-0.5 tracking-wide">
            Guess the Amazon price of viral products
          </p>
        </div>
        <div className="flex items-center gap-3">
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(201,165,90,0.15)', border: '1px solid rgba(201,165,90,0.3)', color: '#f0c060' }}
            >
              🔥 {streak}
            </motion.div>
          )}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
            style={{ background: 'rgba(201,165,90,0.1)', border: '1px solid rgba(201,165,90,0.2)', color: '#c9a55a' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1l1.4 3h3l-2.4 1.8.9 3L6 7.2 3.1 8.8l.9-3L1.6 4h3z" />
            </svg>
            {score}
          </div>
        </div>
      </div>

      {/* ── Product Card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="glass-card overflow-hidden"
        >
          {/* Product Image */}
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: '16/9', background: '#0d1421' }}
          >
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.product_name}
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 672px"
                unoptimized
              />
            ) : (
              /* TikTok embed fallback when no image */
              <div className="w-full h-full flex items-center justify-center p-4">
                <TikTokEmbed key={product.id} videoUrl={product.video_url} />
              </div>
            )}

            {/* Overlay: product name */}
            <div
              className="absolute bottom-0 left-0 right-0 px-5 py-4"
              style={{ background: 'linear-gradient(transparent, rgba(7,9,15,0.92))' }}
            >
              <p className="text-xs text-[#c9a55a] font-medium tracking-widest uppercase mb-1">
                As Seen on TikTok
              </p>
              <h2
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', fontWeight: 700, color: '#ede8dc', lineHeight: 1.2 }}
              >
                {product.product_name}
              </h2>
            </div>

            {/* TikTok link badge (top-right) */}
            {product.image_url && (
              <a
                href={product.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#ede8dc', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.15 8.15 0 0 0 4.77 1.52V6.76a4.85 4.85 0 0 1-1-.07z" />
                </svg>
                Watch
              </a>
            )}
          </div>

          {/* Question */}
          <div className="px-5 pt-5 pb-2">
            <p className="text-[#9a9488] text-sm text-center">
              What's the price of this product on Amazon?
            </p>
          </div>

          {/* ── Price Buttons ── */}
          <div className="grid grid-cols-2 gap-3 p-5">
            {options.map((option, i) => {
              const isCorrect = Math.round(product.price!) === option
              const isWrongSelected = selectedWrong === option
              const isAnswered = gameState === 'correct'

              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 12 }}
                  animate={
                    isWrongSelected
                      ? { x: [-8, 8, -7, 7, -4, 4, 0], opacity: 1, y: 0 }
                      : { opacity: 1, y: 0 }
                  }
                  transition={
                    isWrongSelected
                      ? { duration: 0.45, ease: 'easeOut' }
                      : { delay: i * 0.07, duration: 0.3 }
                  }
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className="relative py-4 px-3 rounded-xl text-xl font-bold transition-all duration-200 focus:outline-none"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 'clamp(1.3rem, 4vw, 1.6rem)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    background: isAnswered && isCorrect
                      ? 'rgba(34,197,94,0.12)'
                      : isWrongSelected
                      ? 'rgba(239,68,68,0.12)'
                      : 'rgba(13,20,33,0.8)',
                    border: isAnswered && isCorrect
                      ? '2px solid rgba(34,197,94,0.5)'
                      : isWrongSelected
                      ? '2px solid rgba(239,68,68,0.5)'
                      : '1px solid rgba(201,165,90,0.22)',
                    color: isAnswered && isCorrect
                      ? '#4ade80'
                      : isWrongSelected
                      ? '#f87171'
                      : '#ede8dc',
                    boxShadow: isAnswered && isCorrect
                      ? '0 0 20px rgba(34,197,94,0.15)'
                      : 'none',
                  }}
                  whileHover={!isAnswered ? { scale: 1.03, borderColor: 'rgba(201,165,90,0.5)' } : {}}
                  whileTap={!isAnswered ? { scale: 0.97 } : {}}
                >
                  {isAnswered && isCorrect && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">✓</span>
                  )}
                  {formatPrice(option)}
                </motion.button>
              )
            })}
          </div>

          {/* ── Correct Answer State ── */}
          <AnimatePresence>
            {gameState === 'correct' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 flex flex-col gap-3">
                  {/* Divider */}
                  <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.25), transparent)' }} />

                  {/* Correct message */}
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                    className="text-center py-2"
                  >
                    <p
                      className="text-gradient-gold"
                      style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 700 }}
                    >
                      Worth Every Penny! 🎉
                    </p>
                    <p className="text-[#9a9488] text-sm mt-1">
                      The price is{' '}
                      <strong className="text-[#c9a55a]">{formatPrice(Math.round(product.price!))}</strong>
                    </p>
                  </motion.div>

                  {/* Amazon CTA */}
                  <motion.a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="btn-amazon flex items-center justify-center gap-2.5 w-full py-4 rounded-xl text-base font-bold"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.93 17.09c-2.5 1.72-6.13 2.63-9.26 1.4A13.36 13.36 0 0 1 2 15.18l-.3.27c2.32 3.4 7.5 5.43 12.23 3.56a9.73 9.73 0 0 0 5-4.43c-.33.15-.66.32-1 .47l-2 2.04z" />
                      <path d="M20.39 17.14c-.3-.38-.88-.58-1.65-.48-.77.1-1.2.53-1.5 1.07l.35.14c.18-.42.55-.73 1.14-.8.58-.07.92.12 1.12.43l.54-.36z" />
                    </svg>
                    Buy on Amazon
                  </motion.a>

                  {/* Next product */}
                  <motion.button
                    onClick={handleNext}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: 'rgba(201,165,90,0.08)',
                      border: '1px solid rgba(201,165,90,0.2)',
                      color: '#c9a55a',
                    }}
                    whileHover={{ background: 'rgba(201,165,90,0.14)', borderColor: 'rgba(201,165,90,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Next Product →
                  </motion.button>

                  <p className="text-xs text-[#3a4458] text-center">
                    As an Amazon Associate we may earn from qualifying purchases.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* ── How to play hint (only first load) ── */}
      {score === 0 && gameState === 'playing' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-[#3a4458]"
        >
          Tap the correct price to win 🎯
        </motion.p>
      )}
    </div>
  )
}
