'use client'

import { useState, useTransition } from 'react'
import { updateProductAction } from './actions'
import type { Product, Click } from '@/lib/types'

type Props = {
  products: Product[]
  clicks: Click[]
  logoutAction: () => Promise<void>
}

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

function ClicksPanel({ clicks }: { clicks: Click[] }) {
  const bySlug = clicks.reduce<Record<string, number>>((acc, c) => {
    acc[c.slug] = (acc[c.slug] || 0) + 1
    return acc
  }, {})

  const top = Object.entries(bySlug)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const today = new Date().toDateString()
  const todayCount = clicks.filter(
    (c) => new Date(c.clicked_at).toDateString() === today
  ).length

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clicks', value: clicks.length },
          { label: 'Today', value: todayCount },
          { label: 'Products Clicked', value: Object.keys(bySlug).length },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(201,165,90,0.07)', border: '1px solid rgba(201,165,90,0.15)' }}
          >
            <div
              className="text-gradient-gold"
              style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700 }}
            >
              {s.value}
            </div>
            <div className="text-xs text-[#5a6070] mt-1 tracking-widest uppercase">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Top products */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(201,165,90,0.15)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,165,90,0.1)', background: 'rgba(201,165,90,0.05)' }}>
          <p className="text-xs text-[#c9a55a] font-semibold tracking-widest uppercase">Top Products by Clicks</p>
        </div>
        {top.length === 0 ? (
          <p className="p-6 text-[#5a6070] text-sm text-center">No clicks yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(201,165,90,0.08)' }}>
            {top.map(([slug, count], i) => {
              const name = clicks.find((c) => c.slug === slug)?.product_name || slug
              return (
                <div key={slug} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#3a4458] w-4">{i + 1}</span>
                    <span className="text-sm text-[#ede8dc]">{name}</span>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(201,165,90,0.1)', color: '#c9a55a' }}
                  >
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent clicks */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(201,165,90,0.15)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(201,165,90,0.1)', background: 'rgba(201,165,90,0.05)' }}>
          <p className="text-xs text-[#c9a55a] font-semibold tracking-widest uppercase">Recent Clicks</p>
        </div>
        <div className="divide-y max-h-64 overflow-y-auto" style={{ borderColor: 'rgba(201,165,90,0.08)' }}>
          {clicks.slice(0, 50).map((c, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-[#9a9488] truncate max-w-[60%]">{c.product_name}</span>
              <span className="text-xs text-[#3a4458]">
                {new Date(c.clicked_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductRow({ product }: { product: Product }) {
  const [price, setPrice] = useState(product.price?.toString() ?? '')
  const [amazonUrl, setAmazonUrl] = useState(product.amazon_product_url ?? '')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      await updateProductAction(product.id, price, amazonUrl)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const dirty =
    price !== (product.price?.toString() ?? '') ||
    amazonUrl !== (product.amazon_product_url ?? '')

  return (
    <div
      className="p-4 rounded-xl flex flex-col gap-3"
      style={{ background: 'rgba(13,20,33,0.6)', border: '1px solid rgba(201,165,90,0.12)' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#ede8dc] truncate">{product.product_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#5a6070]">{formatViews(product.view_count)} views</span>
            {product.image_url && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>img</span>
            )}
            {product.amazon_product_url && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(201,165,90,0.1)', color: '#c9a55a' }}>amazon</span>
            )}
            {product.price && (
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,140,255,0.1)', color: '#7fa4ff' }}>${product.price}</span>
            )}
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-[#5a6070] mb-1 block">Price ($)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 29.99"
            className="w-full px-3 py-2 rounded-lg text-sm text-[#ede8dc] outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,90,0.2)' }}
          />
        </div>
        <div>
          <label className="text-xs text-[#5a6070] mb-1 block">Amazon Product URL</label>
          <input
            type="url"
            value={amazonUrl}
            onChange={(e) => setAmazonUrl(e.target.value)}
            placeholder="https://amazon.com/dp/..."
            className="w-full px-3 py-2 rounded-lg text-sm text-[#ede8dc] outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,90,0.2)' }}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending || (!dirty && !saved)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: saved
              ? 'rgba(34,197,94,0.15)'
              : dirty
              ? 'rgba(201,165,90,0.15)'
              : 'rgba(255,255,255,0.04)',
            border: saved
              ? '1px solid rgba(34,197,94,0.4)'
              : dirty
              ? '1px solid rgba(201,165,90,0.4)'
              : '1px solid rgba(255,255,255,0.08)',
            color: saved ? '#4ade80' : dirty ? '#c9a55a' : '#3a4458',
            cursor: isPending || (!dirty && !saved) ? 'default' : 'pointer',
          }}
        >
          {isPending ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default function AdminClient({ products, clicks, logoutAction }: Props) {
  const [tab, setTab] = useState<'products' | 'analytics'>('products')
  const [search, setSearch] = useState('')

  const filtered = products.filter((p) =>
    p.product_name.toLowerCase().includes(search.toLowerCase())
  )

  const missingData = products.filter((p) => !p.price || !p.amazon_product_url).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-gradient-gold"
            style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 700 }}
          >
            Admin
          </h1>
          <p className="text-xs text-[#5a6070] mt-0.5">
            {products.length} products · {missingData} missing price or Amazon URL
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-xs text-[#5a6070] hover:text-[#9a9488] transition-colors px-3 py-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Logout
          </button>
        </form>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,90,0.1)' }}>
        {(['products', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(201,165,90,0.12)' : 'transparent',
              color: tab === t ? '#c9a55a' : '#5a6070',
              border: tab === t ? '1px solid rgba(201,165,90,0.25)' : '1px solid transparent',
            }}
          >
            {t === 'products' ? `Products (${products.length})` : `Analytics (${clicks.length})`}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl text-sm text-[#ede8dc] outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,165,90,0.15)' }}
          />
          {filtered.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Analytics tab */}
      {tab === 'analytics' && <ClicksPanel clicks={clicks} />}
    </div>
  )
}
