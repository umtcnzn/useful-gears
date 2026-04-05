import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/Navbar'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Useful Gears — Products Trending on TikTok', template: '%s | Useful Gears' },
  description: 'Discover the best products going viral on TikTok. Curated picks with Amazon affiliate links.',
  openGraph: {
    siteName: 'Useful Gears',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-36ZK2FM3NG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-36ZK2FM3NG');
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <footer style={{ borderTop: '1px solid rgba(201,165,90,0.1)', background: 'rgba(7,9,15,0.9)' }}>
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#5a6070]">
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.1rem', color: '#c9a55a' }}>
              Useful Gears
            </span>
            <p>As an Amazon Associate we earn from qualifying purchases.</p>
            <span>© {new Date().getFullYear()} Useful Gears</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
