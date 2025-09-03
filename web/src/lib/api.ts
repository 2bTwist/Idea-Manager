import { http } from "@/lib/http"

// Health
export type Health = { status: string } // FastAPI returns {"status":"ok"}
export const health = () => http.get<Health>("/health")

// Auth (used in Phase 2)
export const auth = {
  login: (email: string, password: string) => {
    const form = new URLSearchParams()
    form.set("grant_type", "password")
    form.set("username", email)
    form.set("password", password)
    form.set("scope", "")
    // client_id / client_secret only if your server requires them
    return http.post<{ access_token: string; token_type: string }>(
      "/auth/token",
      form,
      {
        auth: false,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    )
  },
  register: (email: string, password: string, full_name: string) =>
    http.post<RegisteredUser>(
      "/auth/register",
      { email, password, full_name },
      { auth: false }
    ),
}
export type RegisteredUser = {
  id: string
  email: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}
