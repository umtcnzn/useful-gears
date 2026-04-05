'use client'

import Script from 'next/script'
import { extractTikTokVideoId } from '@/lib/utils'

interface TikTokEmbedProps {
  videoUrl: string
}

export function TikTokEmbed({ videoUrl }: TikTokEmbedProps) {
  const videoId = extractTikTokVideoId(videoUrl)

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-48 rounded-xl border border-[rgba(201,165,90,0.15)] text-[#5a6070] text-sm">
        Video unavailable
      </div>
    )
  }

  return (
    <div className="tiktok-wrapper flex justify-center">
      <blockquote
        className="tiktok-embed"
        cite={videoUrl}
        data-video-id={videoId}
        style={{ maxWidth: '605px', minWidth: '325px' }}
      >
        <section />
      </blockquote>
      <Script src="https://www.tiktok.com/embed.js" strategy="afterInteractive" />
    </div>
  )
}
