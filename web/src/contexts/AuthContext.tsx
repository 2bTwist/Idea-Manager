import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { AUTH_MODE } from "@/config"
import * as api from "@/lib/api"
import { clearToken, getToken, setToken } from "@/lib/session"

type User = api.Me | null

type AuthContextShape = {
  user: User
  isAuthed: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [booted, setBooted] = useState(false)

  // On boot: if a token exists assume authed (Phase 2.5 will verify /me)
  useEffect(() => {
    (async () => {
      // In cookie mode, just ask the server who we are.
      // In bearer mode, only try if a token exists.
      if (AUTH_MODE === "cookie" || getToken()) {
        try {
          console.log("AuthProvider: checking /auth/me (boot)")
          const me = await api.auth.me()
          console.log("AuthProvider: /auth/me (boot) result:", me)
          if (me.ok) setUser(me.data)
          else setUser(null)
        } catch (e) {
          console.error("AuthProvider: error calling /auth/me (boot)", e)
          setUser(null)
        }
      }
      setBooted(true)
    })()
  }, [])

  async function login(email: string, password: string) {
    console.log("AuthProvider: login attempt for", email)
    const res = await api.auth.login(email, password)
    console.log("AuthProvider: login response:", res)
    if (!res.ok) {
      console.error("AuthProvider: login failed:", res.error)
      // prefer nested message if present
      const details = res.error.details as any
      const nested = details && (details.error?.message || details.message || details.detail)
      throw new Error(nested || res.error.message)
    }
    // bearer-only: store token for old mode
    if (AUTH_MODE === "bearer") setToken(res.data.access_token)

    try {
      console.log("AuthProvider: fetching /auth/me after login")
      const me = await api.auth.me()
      console.log("AuthProvider: /auth/me after login result:", me)
      if (!me.ok) {
        if (AUTH_MODE === "bearer") clearToken()
        console.error("AuthProvider: /auth/me returned error:", me.error)
        throw new Error(me.error.message)
      }
      if (!me.data.is_verified) {
        // optional: route them to verify page instead
        throw new Error("Please verify your email before continuing.")
      }
      setUser(me.data)
    } catch (e) {
      // rethrow to be handled by caller
      throw e
    }
    
  }

  async function register(email: string, password: string, full_name: string) {
    const res = await api.auth.register(email, password, full_name)
    if (!res.ok) throw new Error(res.error.message)
    // optional: auto-login if backend returns token; for now require manual sign-in
  }

  function logout() {
    // call backend to clear cookie
    api.auth.logout().finally(() => {
      clearToken()
      setUser(null)
    })
  }

  const value = useMemo(
    () => ({ user, isAuthed: !!user, login, register, logout }),
    [user]
  )

  // Hold children until we’ve checked local storage once
  if (!booted) return null
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
