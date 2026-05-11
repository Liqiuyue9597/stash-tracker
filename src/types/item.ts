export interface Item {
  id: string
  user_id: string
  name: string
  image_url: string | null
  quantity: number
  purchased_at: string | null  // ISO date string "YYYY-MM-DD"
  price: number | null
  category: string | null
  barcode: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type NewItem = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export type UpdateItem = Partial<NewItem>
