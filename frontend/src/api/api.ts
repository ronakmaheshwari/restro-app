import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Runtime config resolution order (first defined wins):
 *
 *   1. Nginx runtime injection — style A (generated /env.js):
 *        window.env_ = { VITE_API_URL: "https://api.example.com/api/v1" };
 *   2. Nginx runtime injection — style B (alternative template name):
 *        window.__APP_ENV__ = { VITE_API_URL: "..." };
 *        (window._env_ is accepted as an alias of style B)
 *   3. Vite build/dev env: import.meta.env.VITE_API_URL
 *   4. Fallback: http://localhost:8000/api/v1
 *
 * Nginx contract: at container start, generate /usr/share/nginx/html/env.js
 * from $API_URL, e.g.:
 *   printf 'window.env_={VITE_API_URL:"%s"};' "$API_URL" > /usr/share/nginx/html/env.js
 * and ensure index.html loads <script src="/env.js"></script> before /src/main.tsx.
 */

interface RuntimeEnv {
  VITE_API_URL?: string;
  VITE_WEBSOCKET_URL?: string;
}

declare global {
  interface Window {
    env_?: RuntimeEnv;
    __APP_ENV__?: RuntimeEnv;
    _env_?: RuntimeEnv;
  }
}

const DEFAULT_API_URL = "http://localhost:8000/api/v1";

function normalizeUrl(url: string): string {
  return url
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim()
    .replace(/\/+$/, "");
}

function readViteEnv(): string | undefined {
  try {
    const viteUrl =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (import.meta as any)?.env?.VITE_API_URL as string | undefined;
    return typeof viteUrl === "string" && viteUrl.trim() ? viteUrl : undefined;
  } catch {
    return undefined;
  }
}

function readRuntimeEnv(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const candidates: Array<string | undefined> = [
    window.env_?.VITE_API_URL,
    window.__APP_ENV__?.VITE_API_URL,
    window._env_?.VITE_API_URL,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return undefined;
}

/** Synchronous — safe to call at module init, in dev and behind nginx. */
export function getApiBaseUrl(): string {
  const raw = readRuntimeEnv() ?? readViteEnv();
  if (!raw || !String(raw).trim()) return DEFAULT_API_URL;
  const normalized = normalizeUrl(String(raw));
  return normalized || DEFAULT_API_URL;
}

/** Single source of truth: the zustand store (persisted as "auth-storage"). */
export function getAuthToken(): string | null {
  try {
    const fromStore = useAuthStore.getState().token;
    if (typeof fromStore === "string" && fromStore) return fromStore;
  } catch {
    // store not ready — fall through to storage fallbacks
  }
  if (typeof localStorage === "undefined") return null;
  try {
    // Legacy key, kept for backwards compat with older builds.
    const legacy = localStorage.getItem("token");
    if (legacy) return legacy;
    // Read the zustand/persist blob directly (covers pre-rehydration).
    const raw = localStorage.getItem("auth-storage");
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: unknown } };
      const t = parsed?.state?.token;
      if (typeof t === "string" && t) return t;
    }
  } catch {
    // corrupted storage — treat as logged out
  }
  return null;
}

/** Kept for backwards compat (`await getConfig()` still works). */
export function getConfig() {
  return { apiUrl: getApiBaseUrl() };
}

/** Public endpoints that must never carry a (possibly stale) token. */
const PUBLIC_PATHS = ["/auth/signup", "/auth/login"];

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Re-resolve synchronously so a late-injected /env.js is picked up
  // without paying for an async hop on every request.
  config.baseURL = getApiBaseUrl();

  const url = String(config.url ?? "");
  const isPublic = PUBLIC_PATHS.some((p) => url === p || url.endsWith(p));
  if (!isPublic) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
  } else {
    delete config.headers.Authorization;
  }
  config.headers.Accept = "application/json";
  return config;
});

api.interceptors.response.use(
  (response) => {
    const ct = String(response.headers?.["content-type"] ?? "");
    const dataStr =
      typeof response.data === "string" ? response.data : "";
    const looksLikeHtml =
      ct.includes("text/html") ||
      dataStr.includes("<html") ||
      dataStr.includes("<!doctype html");
    if (looksLikeHtml) {
      const attempted = `${response.config.baseURL ?? ""}${response.config.url ?? ""}`;
      return Promise.reject(
        new Error(
          `Received HTML instead of JSON – check VITE_API_URL (current: ${attempted}). Backend not reachable.`,
        ),
      );
    }
    return response;
  },
  (error) => Promise.reject(error),
);

export default api;
