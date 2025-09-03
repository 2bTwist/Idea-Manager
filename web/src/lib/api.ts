import { http } from "@/lib/http"

export type Health = { status: string }
export const health = () => http.get<Health>("/health")

export type RegisteredUser = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export type Me = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

export const auth = {
  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.set("grant_type", "password")
    form.set("username", email)
    form.set("password", password)
    form.set("scope", "")
    return http.post<{ access_token: string; token_type: string }>(
      "/auth/token",
      form,
      { auth: false, headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
  },

  register: (email: string, password: string, full_name: string) =>
    http.post<RegisteredUser>("/auth/register", { email, password, full_name }, { auth: false }),

  // helper exposed by your backend email
  validateVerifyToken: (token: string) =>
    http.get<{ valid: boolean }>(`/auth/tokens/verify/validate?token=${encodeURIComponent(token)}`),

  // if your backend exposes this (common), we’ll use it to check is_verified after login.
  me: () => http.get<Me>("/auth/me"),

  // POST /auth/verify-email  (body: { email, token })
  verifyEmail: (email: string, token: string) =>
    http.post<{ message: string }>("/auth/verify-email", { email, token }, { auth: false }),

  // POST /auth/request-verify (body: { email })
  requestVerify: (email: string) =>
    http.post<{ message: string; dev_verify_link?: string; dev_token?: string }>(
      "/auth/request-verify",
      { email },
      { auth: false }
    ),
  
}
