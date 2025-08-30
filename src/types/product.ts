
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Mudança: usar 'price' ao invés de base_price para consistência
  category: string;
  image: string;
  variations: ProductVariation[];
  status: 'active' | 'inactive';
  featured: boolean;
  tags: string[];
  stock: number;
}

export interface ProductVariation {
  id: string;
  name: string;
  weight: string;
  price: number; // Mudança: usar 'price' diretamente
  stock: number;
}

export interface CartItem {
  productId: string;
  variationId?: string;
  quantity: number;
  product: Product;
  variation?: ProductVariation;
}

export interface Order {
  id: string;
  userId?: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  shippingAddress: Address;
  customerInfo: CustomerInfo;
}

export interface Address {
  name: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  document?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'affiliate' | 'manager' | 'admin';
  createdAt: Date;
}
