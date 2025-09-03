import { createContext, useContext, useEffect, useMemo, useState } from "react"
import * as api from "@/lib/api"
import { clearToken, getToken, setToken } from "@/lib/session"

type User = { email: string } | null

type AuthContextShape = {
  user: User
  isAuthed: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [booted, setBooted] = useState(false)

  // On boot: if a token exists assume authed (Phase 2.5 will verify /me)
  useEffect(() => {
    const token = getToken()
    if (token) setUser({ email: "you@session" })
    setBooted(true)
  }, [])

  async function login(email: string, password: string) {
    const res = await api.auth.login(email, password)
    if (!res.ok) throw new Error(res.error.message)
    setToken(res.data.access_token)
    setUser({ email })
  }

  async function register(email: string, password: string) {
    const res = await api.auth.register(email, password)
    if (!res.ok) throw new Error(res.error.message)
    // optional: auto-login if backend returns token; for now require manual sign-in
  }

  function logout() {
    clearToken()
    setUser(null)
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
