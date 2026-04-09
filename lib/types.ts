export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category?: string | null // Mantenemos como opcional por compatibilidad
  tags: string[] // Nueva columna array real
  image_url: string | null
  is_active: boolean
  usage_mode?: string | null
  usage_results?: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "customer" | "admin"
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  total: number
  status: "pending" | "paid" | "cancelled"
  payment_id: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: string | null
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}
