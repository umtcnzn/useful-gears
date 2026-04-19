export interface Product {
  id: number
  slug: string
  video_url: string
  video_title: string
  view_count: number
  product_name: string
  seo_title: string
  seo_description: string
  affiliate_url: string
  created_at: string
  price: number | null
  image_url: string | null
  amazon_product_url: string | null
}

export interface Click {
  id?: number
  slug: string
  product_name: string
  affiliate_url?: string
  ip_address?: string
  user_agent?: string
  referer?: string
  clicked_at: string
}
