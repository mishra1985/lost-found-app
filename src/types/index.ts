// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string; // ✅ snake_case to match Supabase
}

// Item types
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'pending' | 'matched' | 'completed';
export type ItemCategory =
  | 'electronics'
  | 'jewelry'
  | 'clothing'
  | 'accessories'
  | 'documents'
  | 'pets'
  | 'other';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  image_url: string | null; // ✅ updated to snake_case
  image_features: number[] | null; // ✅ updated
  text_features: string[] | null; // ✅ updated
  status: ItemStatus;
  reported_by: string; // ✅ updated
  matched_with: string | null; // ✅ updated
  created_at: string; // ✅ updated
  updated_at: string; // ✅ updated
}

// Match types
export type MatchStatus = 'pending' | 'approved' | 'rejected';

export interface Match {
  id: string;
  lost_item: string; // ✅ updated
  found_item: string; // ✅ updated
  match_confidence: number; // ✅ updated
  status: MatchStatus;
  admin_notes: string | null; // ✅ updated
  created_at: string; // ✅ updated
}

// Notification types
export type NotificationType = 'match' | 'status' | 'system';

export interface Notification {
  id: string;
  user_id: string; // ✅ updated
  item_id: string | null; // ✅ updated
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string; // ✅ updated
}

// Auth types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

// AI Matching types
export interface MatchingThresholds {
  imageConfidence: number;
  textSimilarity: number;
  combinedThreshold: number;
}

export interface MatchingWeights {
  imageWeight: number;
  textWeight: number;
}

export interface MatchingConfig {
  thresholds: MatchingThresholds;
  weights: MatchingWeights;
}

// Item Form type (used in UI)
export interface ItemFormData {
  title: string;
  description: string;
  category: ItemCategory;
  location: string;
  image: File | null;
}
