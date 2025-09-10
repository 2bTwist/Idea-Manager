import { useAuth } from "@/contexts/AuthContext"
import { Outlet, NavLink, useLocation, useNavigate} from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/system/Loading"
import { ErrorBoundary } from "@/components/system/ErrorBoundary"


function Brand() {
  const { isAuthed } = useAuth()
  return (
    <NavLink to={isAuthed ? "/ideas" : "/"} className="flex items-center gap-2">
      <div className="size-8 rounded-md grid place-items-center">
        <img src="/fancy-icon.svg" alt="Idea Manager" className="w-8 h-8" />
      </div>
      <span className="font-semibold tracking-tight">Idea Manager</span>
    </NavLink>
  )
}


const NavLinkBase: React.FC<React.ComponentProps<typeof NavLink>> = (props) => (
  <NavLink
    {...props}
    className={({ isActive }) =>
      cn(
        "px-4 py-2 text-lg font-medium rounded-md transition",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )
    }
  />
)

export default function AppShell() {
  const location = useLocation()
  const { isAuthed, logout } = useAuth()
  const navigate = useNavigate()


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b fixed top-0 left-0 w-full z-30 bg-background">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <Brand />
          <nav className="ml-6 hidden md:flex items-center gap-1">
            <NavLinkBase to="/ideas">Ideas</NavLinkBase>
            <NavLinkBase to="/profile">Profile</NavLinkBase>
            <NavLinkBase to="/admin/users">Admin</NavLinkBase>
          </nav>

          <div className="ml-auto">
            {isAuthed ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  logout()
                  navigate("/", { replace: true })
                }}
              >
                Logout
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline">
                <NavLink to="/signin">Sign In</NavLink>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Page outlet */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-10 pt-20">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Idea Manager. All rights reserved.
          <span className="ml-auto hidden sm:inline">{location.pathname}</span>
        </div>
      </footer>

        {/* Bottom-right help button (non-functional for now) */}
        <div className="fixed bottom-3 right-4">
            <Button variant="outline" size="icon" aria-label="Help">
            <HelpCircle className="size-4" />
            </Button>
        </div>

        <Toaster richColors closeButton position="top-center" />
    </div>
  )
}
