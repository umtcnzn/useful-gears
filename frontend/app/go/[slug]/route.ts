import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch product to get affiliate URL
  const { data: product } = await client
    .from('products')
    .select('product_name, affiliate_url')
    .eq('slug', slug)
    .single()

  if (!product?.affiliate_url) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Log the click
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    null

  await client.from('clicks').insert({
    slug,
    product_name: product.product_name,
    affiliate_url: product.affiliate_url,
    ip_address: ip,
    user_agent: req.headers.get('user-agent') || null,
    referer: req.headers.get('referer') || null,
  })

  return NextResponse.redirect(product.affiliate_url)
}
