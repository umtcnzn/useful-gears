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

  // Fetch product — prefer amazon_product_url, fallback to affiliate_url
  const { data: product } = await client
    .from('products')
    .select('product_name, affiliate_url, amazon_product_url')
    .eq('slug', slug)
    .single()

  const destination = product?.amazon_product_url || product?.affiliate_url
  if (!destination) {
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
    affiliate_url: destination,
    ip_address: ip,
    user_agent: req.headers.get('user-agent') || null,
    referer: req.headers.get('referer') || null,
  })

  return NextResponse.redirect(destination)
}
