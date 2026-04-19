'use server'

import { cookies, headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createHmac } from 'crypto'
import type { Product, Click } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'admin_session'
const MAX_ATTEMPTS = 5
const BLOCK_MINUTES = 30

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSessionToken(): string {
  return createHmac('sha256', process.env.ADMIN_PASSWORD!)
    .update('useful-gears-admin-session')
    .digest('hex')
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getClientIp(): Promise<string> {
  const h = await headers()
  return (
    h.get('cf-connecting-ip') ||
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === makeSessionToken()
}

export async function getIpBlockStatus(): Promise<{ blocked: boolean; minutesLeft?: number }> {
  const ip = await getClientIp()
  const client = getServiceClient()

  const { data } = await client
    .from('login_attempts')
    .select('blocked_until')
    .eq('ip', ip)
    .single()

  if (data?.blocked_until && new Date(data.blocked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(data.blocked_until).getTime() - Date.now()) / 60000
    )
    return { blocked: true, minutesLeft }
  }

  return { blocked: false }
}

export async function loginAction(formData: FormData): Promise<void> {
  const password = formData.get('password') as string
  const ip = await getClientIp()
  const client = getServiceClient()

  // Check if IP is blocked
  const { data: attempt } = await client
    .from('login_attempts')
    .select('count, blocked_until')
    .eq('ip', ip)
    .single()

  if (attempt?.blocked_until && new Date(attempt.blocked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(attempt.blocked_until).getTime() - Date.now()) / 60000
    )
    redirect(`/admin?error=blocked&min=${minutesLeft}`)
  }

  // Wrong password
  if (password !== process.env.ADMIN_PASSWORD) {
    const newCount = (attempt?.count ?? 0) + 1
    const blocked = newCount >= MAX_ATTEMPTS
    const blockedUntil = blocked
      ? new Date(Date.now() + BLOCK_MINUTES * 60 * 1000).toISOString()
      : null

    await client.from('login_attempts').upsert({
      ip,
      count: newCount,
      blocked_until: blockedUntil,
      last_attempt: new Date().toISOString(),
    })

    if (blocked) {
      redirect('/admin?error=blocked')
    }

    redirect('/admin?error=wrong')
  }

  // Correct password — clear attempts, set session cookie
  await client.from('login_attempts').delete().eq('ip', ip)

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, makeSessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/admin')
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export async function updateProductAction(id: number, price: string, amazonUrl: string) {
  if (!(await isAuthenticated())) redirect('/admin')
  const client = getServiceClient()
  await client
    .from('products')
    .update({
      price: price ? parseFloat(price) : null,
      amazon_product_url: amazonUrl.trim() || null,
    })
    .eq('id', id)
}

export async function getAdminData(): Promise<{ products: Product[]; clicks: Click[] } | null> {
  if (!(await isAuthenticated())) return null
  const client = getServiceClient()

  const [{ data: products }, { data: clicks }] = await Promise.all([
    client
      .from('products')
      .select('id, slug, product_name, view_count, price, amazon_product_url, image_url')
      .order('view_count', { ascending: false }),
    client
      .from('clicks')
      .select('slug, product_name, clicked_at')
      .order('clicked_at', { ascending: false })
      .limit(500),
  ])

  return {
    products: (products ?? []) as Product[],
    clicks: (clicks ?? []) as Click[],
  }
}
