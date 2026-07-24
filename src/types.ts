export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'superadmin';
  phone?: string;
  address?: string;
  isSuspended?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  model: string;
  images: string[];
  thumbnail: string;
  description: string;
  technicalSpecifications: Record<string, string>;
  price: number;
  discount: number; // Percentage, e.g. 10 for 10%
  availableStock: number;
  warranty: string;
  deliveryInfo: string;
  returnPolicy: string;
  ratings: number; // Average rating
  reviewsCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  isNewArrival: boolean;
  isActive: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase: number;
  isActive: boolean;
  expiryDate: string;
}

export interface SupportTicketResponse {
  role: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'replied' | 'closed';
  responses: SupportTicketResponse[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatLog {
  id: string;
  userId?: string;
  userName?: string;
  query: string;
  response: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}
