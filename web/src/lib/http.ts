import { API_BASE_URL } from "@/config"
import { getToken } from "@/lib/session"
import { AUTH_MODE } from "@/config"

export type ApiError = {
  status: number
  message: string
  details?: unknown
}
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError }

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

function joinURL(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}

export async function request<T>(
  path: string,
  options: {
    method?: Method
    body?: unknown
    headers?: Record<string, string>
    timeoutMs?: number
    auth?: boolean // default true
  } = {}
): Promise<ApiResult<T>> {
  const {
    method = "GET",
    body,
    headers = {},
    timeoutMs = 15000,
    auth = true,
  } = options

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)

  const token = auth && AUTH_MODE === "bearer" ? getToken() : ""

  const isFormLike = body instanceof FormData || body instanceof URLSearchParams
  const isString = typeof body === "string"

  const res: Response = await fetch(joinURL(path), {
    method,
    headers: {
      Accept: "application/json",
      // Only set JSON header when we're actually sending JSON
      ...(isFormLike || isString ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body != null
      ? (isFormLike || isString ? (body as any) : JSON.stringify(body))
      : undefined,
    signal: ctrl.signal,
    // IMPORTANT: include cookies
    credentials: "include",
  }).catch((e) => {
    clearTimeout(t)
    return Promise.reject({
      status: 0,
      message: e?.name === "AbortError" ? "Request timed out" : "Network error",
    } as ApiError)
  })

  clearTimeout(t)

  let payload: any = null
  const text = await res.text()
  try { payload = text ? JSON.parse(text) : null } catch { payload = text }

  if (!res.ok) {
    const errMsg =
      (payload && ((payload.error && (payload.error.message || payload.error)) || payload.detail || payload.message)) ||
      res.statusText ||
      "Request failed"
    const err: ApiError = {
      status: res.status,
      message: errMsg,
      details: payload,
    }
    return { ok: false, error: err }
  }

  return { ok: true, data: payload as T }
}

// Convenience helpers
export const http = {
  get: <T>(p: string, o?: Omit<Parameters<typeof request<T>>[1], "method" | "body">) =>
    request<T>(p, { ...o, method: "GET" }),
  post: <T>(p: string, body?: unknown, o?: Omit<Parameters<typeof request<T>>[1], "method">) =>
    request<T>(p, { ...o, method: "POST", body }),
  put:  <T>(p: string, body?: unknown, o?: Omit<Parameters<typeof request<T>>[1], "method">) =>
    request<T>(p, { ...o, method: "PUT", body }),
  patch:<T>(p: string, body?: unknown, o?: Omit<Parameters<typeof request<T>>[1], "method">) =>
    request<T>(p, { ...o, method: "PATCH", body }),
  del:  <T>(p: string, o?: Omit<Parameters<typeof request<T>>[1], "method" | "body">) =>
    request<T>(p, { ...o, method: "DELETE" }),
}
