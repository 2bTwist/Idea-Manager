export const APP_NAME = import.meta.env.VITE_APP_NAME || "Idea Manager"

// always without trailing slash
export const API_BASE_URL = String(import.meta.env.VITE_API_URL || "")
  .replace(/\/+$/, "")

export const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "cookie") as "cookie" | "bearer"
