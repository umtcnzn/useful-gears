import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getAllProducts } from '@/lib/supabase'
import { TikTokEmbed } from '@/components/TikTokEmbed'
import { ViewBadge } from '@/components/ViewBadge'
import { AmazonButton } from '@/components/AmazonButton'
import Link from 'next/link'

export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getAllProducts()
  return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.seo_title,
    description: product.seo_description,
    openGraph: {
      title: product.seo_title,
      description: product.seo_description,
      type: 'website',
    },
  }
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#5a6070] mb-12">
        <Link href="/" className="hover:text-[#c9a55a] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-[#c9a55a] transition-colors">Products</Link>
        <span>/</span>
        <span className="text-[#9a9488]">{product.product_name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

        {/* Left — TikTok embed */}
        <div className="animate-fade-up">
          <p className="text-xs text-[#c9a55a] font-medium tracking-widest uppercase mb-4">
            As Seen on TikTok
          </p>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(201,165,90,0.15)' }}
          >
            <TikTokEmbed videoUrl={product.video_url} />
          </div>
          <p className="text-xs text-[#3a4458] mt-3 line-clamp-1">
            {product.video_title}
          </p>
        </div>

        {/* Right — Product info */}
        <div className="animate-fade-up-delay-1 flex flex-col gap-6">

          {/* View badge */}
          <ViewBadge count={product.view_count} />

          {/* Product name */}
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 700,
              color: '#ede8dc',
              lineHeight: 1.15,
            }}
          >
            {product.product_name}
          </h1>

          {/* SEO title as subtitle */}
          <p
            className="text-lg leading-relaxed"
            style={{ color: '#c9a55a', fontFamily: 'var(--font-cormorant)', fontStyle: 'italic', fontWeight: 400 }}
          >
            {product.seo_title}
          </p>

          {/* Divider */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(201,165,90,0.25), transparent)' }} />

          {/* Description */}
          <p className="text-[#9a9488] leading-relaxed text-base">
            {product.seo_description}
          </p>

          {/* Viral proof callout */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(201,165,90,0.07)', border: '1px solid rgba(201,165,90,0.15)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="mt-0.5 shrink-0">
              <path d="M9 1C9 1 16 6 16 10.5C16 14.09 12.866 17 9 17C5.134 17 2 14.09 2 10.5C2 8.4 3.1 6.5 4.8 5.3C4.8 7.2 6.1 8.5 7.5 9.1C7 7.5 7.2 5.2 9 1Z" fill="#c9a55a" opacity="0.8"/>
            </svg>
            <div>
              <p className="text-sm font-semibold text-[#c9a55a] mb-0.5">Viral Verified</p>
              <p className="text-xs text-[#9a9488]">
                This product has been viewed over{' '}
                <strong className="text-[#ede8dc]">{product.view_count.toLocaleString()}</strong>{' '}
                times on TikTok
              </p>
            </div>
          </div>

          {/* CTA */}
          <AmazonButton slug={product.slug} />

          <p className="text-xs text-[#3a4458] text-center">
            As an Amazon Associate we may earn from qualifying purchases.
          </p>
        </div>
      </div>
    </div>
  )
}
