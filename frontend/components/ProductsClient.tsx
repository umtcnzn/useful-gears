'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from './ProductCard'
import type { Product } from '@/lib/types'

export function ProductsClient({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return products
    const q = query.toLowerCase()
    return products.filter(
      p =>
        p.product_name.toLowerCase().includes(q) ||
        p.seo_title.toLowerCase().includes(q) ||
        p.seo_description?.toLowerCase().includes(q)
    )
  }, [products, query])

  return (
    <>
      {/* Search */}
      <div className="relative mb-10 max-w-md">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a6070]"
          width="16" height="16" viewBox="0 0 16 16" fill="none"
        >
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          placeholder="Search products…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="search-input w-full pl-11 pr-4 py-3 text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a6070] hover:text-[#9a9488] transition-colors"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-[#5a6070] mb-6">
        {filtered.length} of {products.length} products
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24 text-[#5a6070]">
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem' }}>
            No products found
          </div>
          <p className="text-sm mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s`, animationFillMode: 'both' }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
