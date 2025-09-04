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
  logout: () => http.post<void>("/auth/logout", undefined, { auth: false }),
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

// ---------- Ideas ----------
export type Idea = {
  id: string
  title: string
  description: string
  scalability: number
  ease_to_build: number
  uses_ai: boolean
  ai_complexity: number
  tags?: string[]
  score: number
  created_at: string
  updated_at: string
  owner?: { id: string; full_name?: string | null } | null
}

export type IdeasPage = {
  items: Idea[]
  total: number
  limit: number
  offset: number
}

export const ideas = {
  list: (params: {
    limit?: number
    offset?: number
    q?: string
    sort?: "created_at" | "score"
    order?: "asc" | "desc"
    uses_ai?: boolean | null
    min_score?: number | null
    max_score?: number | null
    tags?: string[] | null
  }) => {
    const qs = new URLSearchParams()
    if (params.limit != null) qs.set("limit", String(params.limit))
    if (params.offset != null) qs.set("offset", String(params.offset))
    if (params.q) qs.set("q", params.q)
    if (params.sort) qs.set("sort", params.sort)
    if (params.order) qs.set("order", params.order)
    if (params.uses_ai != null) qs.set("uses_ai", String(params.uses_ai))
    if (params.min_score != null) qs.set("min_score", String(params.min_score))
    if (params.max_score != null) qs.set("max_score", String(params.max_score))
    if (params.tags && params.tags.length) {
      for (const t of params.tags) qs.append("tags", t)
    }
    return http.get<IdeasPage>(`/ideas?${qs.toString()}`)
  },

  create: (payload: {
    title: string
    description: string
    scalability: number
    ease_to_build: number
    uses_ai: boolean
    ai_complexity: number
    tags?: string[]
  }) => http.post<Idea>("/ideas", payload),

  update: (id: string, patch: Partial<Omit<Idea, "id" | "created_at" | "updated_at" | "score" | "owner">>) =>
    http.patch<Idea>(`/ideas/${encodeURIComponent(id)}`, patch),

  del: (id: string) => http.del<{ message: string }>(`/ideas/${encodeURIComponent(id)}`),

  addTags: (id: string, tags: string[]) =>
    http.post<Idea>(`/ideas/${encodeURIComponent(id)}/tags`, { tags }),

  removeTags: (id: string, tags: string[]) =>
    http.del<Idea>(`/ideas/${encodeURIComponent(id)}/tags`, { body: { tags } }),

  listAvailableTags: () => http.get<{ available: string[] }>("/ideas/meta/tags"),
}
