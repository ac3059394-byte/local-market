export type Role = "CUSTOMER" | "SHOP_OWNER" | "ADMIN";
export type ProductStatus = "IN_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED";

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  mobileNumber: string;
  whatsappNumber?: string;
  email?: string;
  addressLine: string;
  pincode: string;
  state: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  logoUrl?: string;
  bannerUrl?: string;
  photos: string[];
  openingTime?: string;
  closingTime?: string;
  weeklyHoliday?: string;
  description?: string;
  isVerified: boolean;
  isFeatured: boolean;
  membershipTier: "FREE" | "PREMIUM";
  averageRating: number;
  reviewCount: number;
  distanceKm?: number;
}

export interface Product {
  id: string;
  shopId: string;
  shop?: Pick<Shop, "id" | "name" | "city" | "state" | "isVerified" | "membershipTier" | "averageRating">;
  categoryId?: string;
  name: string;
  description?: string;
  images: string[];
  brand?: string;
  model?: string;
  sku?: string;
  sellingPrice: number;
  mrp?: number;
  discountPercent?: number;
  quantity: number;
  unit: string;
  status: ProductStatus;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
}

export interface Review {
  id: string;
  userId: string;
  user?: { name: string; avatarUrl?: string };
  shopId: string;
  rating: number;
  comment?: string;
  photos: string[];
  likeCount: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  children?: Category[];
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
