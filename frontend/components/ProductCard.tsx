import Link from 'next/link'
import type { Product } from '@/lib/types'
import { ViewBadge } from './ViewBadge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <article className="glass-card card-gold-line relative h-full flex flex-col p-6 overflow-hidden">

        {/* Ambient hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,165,90,0.07) 0%, transparent 70%)' }}
        />

        {/* Top section */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <ViewBadge count={product.view_count} />
          <span className="text-[#3a4458] text-xs font-mono mt-0.5">
            #{product.slug.slice(0, 8)}
          </span>
        </div>

        {/* Product name */}
        <h2
          className="font-display text-2xl leading-tight text-parchment mb-2 flex-1"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 600 }}
        >
          {product.product_name}
        </h2>

        {/* SEO title as subtitle */}
        <p className="text-parchment-dim text-sm leading-relaxed mb-5 line-clamp-2">
          {product.seo_title}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[rgba(201,165,90,0.1)]">
          <span className="text-xs text-[#3a4458] font-medium tracking-wide uppercase">
            Useful Gear
          </span>
          <span
            className="text-sm font-semibold text-gold group-hover:text-gold-bright transition-colors duration-200 flex items-center gap-1"
            style={{ color: '#c9a55a' }}
          >
            Shop Now
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 transition-transform duration-200">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </article>
    </Link>
  )
}
