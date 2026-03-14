
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  image: string;
  features: string[];
  isVisible: boolean;
  secretContent: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'crypto';
  name: string;
  details: string;
  isActive: boolean;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  walletAddress?: string;
  network?: string;
  // API Configuration
  isAutomated: boolean;
  apiPublicKey?: string;
  apiSecretKey?: string;
  merchantId?: string;
  webhookUrl?: string;
}

export interface SiteSettings {
  currency: string;
  currencySymbol: string;
  storeName: string;
  logoUrl?: string;
  paymentMethods: PaymentMethod[];
  usdtToNairaRate: number;
  categories: Category[];
}

export interface UserOrder {
  id: string;
  productId: string;
  productName: string;
  content: string;
  price: number;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  balance: number;
  orders: UserOrder[];
}

export interface AdminUser {
  id: string;
  username: string;
  role: 'super' | 'editor';
}

export type ViewState = 'home' | 'category' | 'product' | 'cart' | 'profile' | 'admin_login' | 'admin_dashboard' | 'user_auth' | 'fund_wallet';
