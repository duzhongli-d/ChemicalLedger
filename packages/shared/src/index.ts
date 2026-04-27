export type UserRole = 'user' | 'admin';
export type LedgerStatus = 'active' | 'archived';
export type NotificationType = 'expiry_warning' | 'expiry_alert' | 'system';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  department?: string;
  created_at: string;
}

export interface CategoryResponse {
  id: string;
  level1: string;
  level2: string;
  warning_threshold_days: number;
  unopened_shelf_months: number;
  opened_shelf_months: number;
}

export interface LedgerResponse {
  id: string;
  internal_batch_no: string;
  product_name: string;
  batch_no: string;
  cas_no: string;
  weight_capacity: string;
  supplier: string;
  quantity: number;
  category: CategoryResponse;
  cert_expiry_date: string;
  open_date?: string;
  effective_expiry_date: string;
  is_opened: boolean;
  status: LedgerStatus;
  created_at: string;
  created_by_id: string;
  remarks?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface QuotaResponse {
  used_today: number;
  limit: number;
  notebooks_count: number;
  notebooks_limit: number;
}
