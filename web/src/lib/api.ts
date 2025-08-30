import { http } from "@/lib/http"

// Health
export type Health = { status: string } // FastAPI returns {"status":"ok"}
export const health = () => http.get<Health>("/health")

// Auth (used in Phase 2)
export const auth = {
  login: (email: string, password: string) =>
    http.post<{ access_token: string; token_type: string }>("/auth/login", { email, password }, { auth: false }),
  register: (email: string, password: string) =>
    http.post<{ id: string; email: string }>("/auth/register", { email, password }, { auth: false }),
}
