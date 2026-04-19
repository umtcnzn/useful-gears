'use client'

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
    <div className="flex justify-center w-full">
      <iframe
        src={`https://www.tiktok.com/embed/v2/${videoId}`}
        style={{ maxWidth: '605px', width: '100%', height: '740px', border: 'none' }}
        allow="encrypted-media"
        allowFullScreen
      />
    </div>
  )
}
