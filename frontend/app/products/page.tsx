import { getAllProducts } from '@/lib/supabase'
import { ProductsClient } from '@/components/ProductsClient'

export const revalidate = 3600

export const metadata = {
  title: 'All Products',
  description: 'Browse all viral products trending on TikTok. Find the best gadgets and gear with Amazon links.',
}

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs text-[#c9a55a] font-medium tracking-widest uppercase mb-3">
          The Collection
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 600,
            color: '#ede8dc',
            lineHeight: 1.1,
          }}
        >
          All Viral Products
        </h1>
      </div>

      <ProductsClient products={products} />
    </div>
  )
}
