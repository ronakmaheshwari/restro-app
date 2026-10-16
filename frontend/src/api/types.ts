export type Role = "USER" | "ADMIN" | "CHEF" | "MANAGER" | "WAITER";
export type Status = "ACTIVE" | "UNVERIFIED" | "INACTIVE" | "DELETED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
export type BillStatus = "PAID" | "UNPAID"

export interface SignupRequest {
  email: string;
  name: string;
  role: Role;
  password: string;
}

export interface signinInterface {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface ApiResponseInterface {
  success: boolean;
  message: string;
  error?: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface GetMyDataResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  user_status: Status;
  created_at: string | null;
}

export interface EditUserDetails {
  name: string | null;
  email: string | null;
  role: Role | null;
  user_status: Status | null;
}

export interface MenuQuery {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  status?: "ACTIVE" | "INACTIVE" | null;
  isDeleted?: boolean | null;
  min_price?: number | null;
  max_price?: number | null;
  sortBy?: "name" | "price" | null;
  sortOrder?: "asc" | "desc" | null;
  page?: number | null;
  limit?: number | null;
}

export interface MenuResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  status: "ACTIVE" | "INACTIVE" | null;
  is_deleted: boolean;
  admin_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AddDish {
  name: string;
  description: string;
  price: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface EditDish {
  name?: string | null;
  description?: string | null;
  price?: number | null;
  status?: "ACTIVE" | "INACTIVE" | null;
}

export interface GetOrderQuery {
  total?: number | null;
  user_name?: string | null;
  bill_status?: BillStatus | null;
  status?: OrderStatus | null;
  user_id?: string | null;
  sortBy?: "user_name" | "price" | "total" | "quantity" | "created_at" | null;
  sortOrder?: "asc" | "desc" | null;
  limit?: number | null;
  page?: number | null;
}

export interface OrderItemInput {
  menu_id: string;
  quantity: number;
}

export interface AddToCartRequest {
  orders: OrderItemInput[];
}

export interface OrderItemResponse {
  id: string;
  menu_id: string;
  quantity: number;
  price: number;
}

export interface GetOrderResponse {
  id: string;
  user_id: string;
  total_amount: number;
  bill_status: BillStatus | null;
  status: OrderStatus | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GetOrderDetailResponse extends GetOrderResponse {
  items: OrderItemResponse[];
}

export interface AddToCartResponse {
  id: string;
  user_id: string;
  total_amount: number;
  items: OrderItemResponse[];
}

export type signupInterface = SignupRequest;
export type SignupResponse = ApiResponse<AuthTokens>;
export type GetMyData = ApiResponse<GetMyDataResponse>;

