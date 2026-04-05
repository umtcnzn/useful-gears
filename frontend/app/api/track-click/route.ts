import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { slug, product_name, affiliate_url } = await req.json()

    if (!slug) return NextResponse.json({ ok: true })

    // Extract IP — Cloudflare sets cf-connecting-ip, fallback to x-forwarded-for
    const ip =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      null

    const user_agent = req.headers.get('user-agent') || null
    const referer = req.headers.get('referer') || null

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    await client.from('clicks').insert({
      slug,
      product_name,
      affiliate_url,
      ip_address: ip,
      user_agent,
      referer,
    })
  } catch {
    // Never block the user for a tracking failure
  }

  return NextResponse.json({ ok: true })
}
