import axios from "axios";
import api from "./api";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  AddDish,
  AddToCartRequest,
  AddToCartResponse,
  ApiResponse,
  ApiResponseInterface,
  AuthTokens,
  EditDish,
  EditUserDetails,
  GetMyDataResponse,
  GetOrderDetailResponse,
  GetOrderQuery,
  GetOrderResponse,
  MenuQuery,
  MenuResponse,
  signinInterface,
  signupInterface,
} from "./types";

const REQUEST_TIMEOUT = 10_000;

function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function toApiError<T>(err: unknown, fallback: string): ApiResponse<T> {
  if (axios.isAxiosError(err)) {
    const payload = err.response?.data as Partial<ApiResponse<T>> | undefined;

    if (payload && typeof payload === "object" && "message" in payload) {
      return {
        success: false,
        message: payload.message ?? fallback,
        ...(payload.data !== undefined ? { data: payload.data } : {}),
        ...(payload.error !== undefined ? { error: payload.error } : {}),
      } as ApiResponse<T>;
    }

    if (err.code === "ERR_NETWORK" || err.code === "ECONNABORTED" || !err.response) {
      return {
        success: false,
        message: "Could not reach the server. Is the backend running?",
      } as ApiResponse<T>;
    }

    return {
      success: false,
      message: fallback,
    } as ApiResponse<T>;
  }

  return {
    success: false,
    message: fallback,
  } as ApiResponse<T>;
}

function persistTokens(payload: AuthTokens | undefined) {
  const token = payload?.access_token;
  if (typeof token === "string" && token) {
    useAuthStore.getState().setToken(token);
  }
}

export const authService = {
  signup: async (data: signupInterface): Promise<ApiResponse<AuthTokens>> => {
    try {
      // Relative URL — baseURL is owned by the shared `api` client
      // (nginx /env.js → Vite env → localhost fallback).
      const response = await api.post<ApiResponse<AuthTokens>>("/auth/signup", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: REQUEST_TIMEOUT,
      });

      persistTokens(response.data?.data);
      return response.data;
    } catch (err) {
      return toApiError<AuthTokens>(err, "Signup failed. Please try again.");
    }
  },

  signin: async (data: signinInterface): Promise<ApiResponse<AuthTokens>> => {
    try {
      const response = await api.post<ApiResponse<AuthTokens>>("/auth/login", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: REQUEST_TIMEOUT,
      });

      persistTokens(response.data?.data);
      return response.data;
    } catch (err) {
      return toApiError<AuthTokens>(err, "Login failed. Please try again.");
    }
  },

  getMe: async (): Promise<ApiResponse<GetMyDataResponse>> => {
    try {
      const response = await api.get<ApiResponse<GetMyDataResponse>>("/auth/me", {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (err) {
      return toApiError<GetMyDataResponse>(err, "Failed to get your data.");
    }
  },

  editMe: async (data: EditUserDetails): Promise<ApiResponse<GetMyDataResponse>> => {
    try {
      const response = await api.patch<ApiResponse<GetMyDataResponse>>("/auth/edit", data, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: REQUEST_TIMEOUT,
      });
      return response.data;
    } catch (err) {
      return toApiError<GetMyDataResponse>(err, "Failed to get your data.");
    }
  },

  deleteAccount: async (): Promise<ApiResponseInterface> => {
    try {
      const response = await api.delete<ApiResponseInterface>(`/auth/delete`, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: REQUEST_TIMEOUT,
      });

      return response.data;
    } catch (err) {
      return toApiError(err, "Failed to delete your account.");
    }
  },
};

export const menuService = {
  getMenu: async (query: MenuQuery = {}): Promise<ApiResponse<MenuResponse[]>> => {
    try {
      const response = await api.get<ApiResponse<MenuResponse[]>>(
        `/menu/${buildQuery(query as Record<string, unknown>)}`,
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: REQUEST_TIMEOUT
        },
      )

      return response.data
    } catch (err) {
      return toApiError<MenuResponse[]>(err, "Failed to fetch the menu.");
    }
  },
  addDish: async (data: AddDish): Promise<ApiResponse<MenuResponse>> => {
    try {
      const response = await api.post<ApiResponse<MenuResponse>>(`/menu/create`, data, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: REQUEST_TIMEOUT
      })
      return response.data
    } catch (err) {
      return toApiError<MenuResponse>(err, "Failed to add your dish.");
    }
  },
  editDish: async (id: string, data: EditDish):Promise<ApiResponseInterface> => {
    try {
      const response = await api.patch(`/menu/edit/${id}`, data, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: REQUEST_TIMEOUT
      })

      return response.data
    } catch (err) {
      return toApiError(err, "Failed to edit your dish.");
    }
  },
  deleteDish: async(id: string):Promise<ApiResponseInterface> => {
    try {
      const response = await api.delete(`/menu/delete/${id}`, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: REQUEST_TIMEOUT
      })

      return response.data
    } catch (err) {
      return toApiError(err, "Failed to delete your dish.");
    }
  }
};

export const orderService = {
  getOrders: async (
    query: GetOrderQuery = {},
  ): Promise<ApiResponse<GetOrderResponse[]>> => {
    try {
      const response = await api.get<ApiResponse<GetOrderResponse[]>>(
        `/orders/${buildQuery(query as Record<string, unknown>)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError<GetOrderResponse[]>(err, "Failed to fetch orders.");
    }
  },

  getOrder: async (
    query: GetOrderQuery = {},
  ): Promise<ApiResponse<GetOrderResponse[]>> => {
    return orderService.getOrders(query);
  },

  getOrderById: async (
    orderId: string,
  ): Promise<ApiResponse<GetOrderDetailResponse>> => {
    try {
      const response = await api.get<ApiResponse<GetOrderDetailResponse>>(
        `/orders/${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError<GetOrderDetailResponse>(err, "Failed to fetch the order.");
    }
  },

  addToCart: async (
    data: AddToCartRequest,
  ): Promise<ApiResponse<AddToCartResponse>> => {
    try {
      const response = await api.post<ApiResponse<AddToCartResponse>>(
        `/orders/add-cart`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError<AddToCartResponse>(err, "Failed to add items to cart.");
    }
  },

  completeOrder: async (orderId: string): Promise<ApiResponseInterface> => {
    try {
      const response = await api.patch<ApiResponseInterface>(
        `/orders/complete/${orderId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError(err, "Failed to complete the order.");
    }
  },

  cancelOrder: async (orderId: string): Promise<ApiResponseInterface> => {
    try {
      const response = await api.delete<ApiResponseInterface>(
        `/orders/cancel/${orderId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError(err, "Failed to cancel the order.");
    }
  },

  payOrder: async (orderId: string): Promise<ApiResponseInterface> => {
    try {
      const response = await api.patch<ApiResponseInterface>(
        `/orders/pay/${orderId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: REQUEST_TIMEOUT,
        },
      );
      return response.data;
    } catch (err) {
      return toApiError(err, "Failed to pay for the order.");
    }
  },
};
