import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth()
  const loc = useLocation()
  if (isAuthed) return <Navigate to="/ideas" replace state={{ from: loc }} />
  return <>{children}</>
}
