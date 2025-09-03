import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function RequireVerified({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const loc = useLocation()
  if (!user) return <Navigate to="/signin" replace state={{ from: loc }} />
  if (!user.is_verified) return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email)}`} replace />
  return <>{children}</>
}
