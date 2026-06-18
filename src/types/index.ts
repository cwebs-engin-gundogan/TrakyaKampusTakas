export type UUID = string;

export type ThemeMode = 'light' | 'dark';
export type Language = 'tr' | 'en';

export type ConditionEnum = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
export type CategoryEnum =
  | 'HOUSEHOLD_GOODS'
  | 'TEXTBOOKS'
  | 'STUDENT_ESSENTIALS'
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'SPORTS'
  | 'OTHER';

export interface AdvertisementResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  is_swap: boolean;
  condition: ConditionEnum;
  category: CategoryEnum;
  location: string;
  image_urls: string[];
  seller_id: UUID;
  seller_full_name: string;
  created_at: string;
  is_active: boolean;
}

export interface AdvertisementCreate {
  title: string;
  description: string;
  price: number;
  is_swap: boolean;
  condition: ConditionEnum;
  category: CategoryEnum;
  location: string;
  image_urls?: string[];
}

export interface UserResponse {
  id: UUID;
  full_name: string;
  email: string;
  university: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  member_since: string;
  is_email_verified: boolean;
}

export interface SellerProfileResponse {
  id: UUID;
  full_name: string;
  university: string;
  city: string | null;
  avatar_url: string | null;
  phone: string | null;
  rating: number;
  total_sales: number;
  total_reviews: number;
  member_since: string;
  is_email_verified: boolean;
  ads: AdvertisementResponse[];
}

export interface Conversation {
  id: number;
  user1_id: UUID;
  user2_id: UUID;
  participant_name: string;
  participant_image_url: string | null;
  last_message: string;
  last_message_timestamp: string;
  unread_count: number;
  is_online: boolean;
  target_user_id?: UUID;
}

export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface MessageResponse {
  id: number;
  conversation_id: number;
  sender_id: UUID;
  text: string;
  timestamp: string;
  status: MessageStatus;
  attachment_url: string | null;
  attachment_type: string | null;
}

export interface AttachmentResponse {
  url: string;
  mime_type: string;
  file_name: string;
}

export interface Review {
  id: number;
  seller_id: UUID;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface Filters {
  q: string;
  category: CategoryEnum | 'ALL';
  condition: ConditionEnum | 'ALL';
  min_price: string;
  max_price: string;
  is_swap: 'ALL' | 'true' | 'false';
}

export interface AppPreferences {
  theme: ThemeMode;
  language: Language;
  notifications: boolean;
}
