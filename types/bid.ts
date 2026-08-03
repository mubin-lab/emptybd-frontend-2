// types/bid.ts
export interface Seller {
  seller_id: string
  email: string
  seller_img?: string
}

export interface Product {
  title: string
  media_url: string
  media_type: "image" | "video"
  base_price: number
  description?: string
}

export interface BidPost {
  seller: Seller
  product: Product

  start_bid: number
  bidding_price: number 

  start_bid_time: string
  end_bid_time: string

  currency: "BDT" | "USD"
  user_bidded: string[]

  status: "draft" | "active" | "ended"

  created_at: string
  updated_at: string
}
