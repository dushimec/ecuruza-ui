
export enum UserMode {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  shopId?: string;
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  contact: string;
  isVerified: boolean;
  ownerId: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  isSponsored?: boolean;
  isVerifiedSeller?: boolean;
  sellerName: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SellerStats {
  totalSales: number;
  revenue: number;
  activeListings: number;
  customerRating: number;
}

export interface GeminiSearchResponse {
  recommendedProductIds: string[];
  reasoning: string;
}

export interface FilterState {
  categories: string[];
  minPrice: string;
  maxPrice: string;
  verifiedOnly: boolean;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating_desc';
