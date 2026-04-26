// ============================================================
// CRAFT BY MIKA — Models
// ============================================================

export interface DeliveryService {
  name: string;
  price: number;
  eta: string;
  available: boolean;
}

export interface Product {
  id: number | string;
  name: string;
  price: number;
  img: string;
  tag?: string;
  rating?: number;
  isFavorite?: boolean;
  available?: boolean;
  description?: string;
  deliveryServices?: DeliveryService[];
}

// OrderItem — used by shared.service.ts
export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id?: number | string;
  product?: Product;
  quantity?: number;
  status: 'cart' | 'pending' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';

  // Delivery & logistics
  deliveryStatus?: string;
  deliveryService?: string;
  deliveryFee?: number;     // delivery fee amount
  totalAmount?: number;     // subtotal + delivery fee
  address?: string;

  // Customer contact info
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  user?: string;

  // Payment
  paymentMethod?: string;

  // Multi-item support
  items?: OrderItem[];

  // Order date
  orderDate?: string;
}