import { Outlet, NavLink, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NavLinkBase: React.FC<React.ComponentProps<typeof NavLink>> = (props) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 text-sm rounded-md transition",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )
      }
    />
  )
}

export default function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Top nav */}
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Idea Manager</span>
          </div>

          <nav className="ml-6 hidden md:flex items-center gap-1">
            <NavLinkBase to="/">Home</NavLinkBase>
            <NavLinkBase to="/ideas">Ideas</NavLinkBase>
            <NavLinkBase to="/profile">Profile</NavLinkBase>
            <NavLinkBase to="/admin/users">Admin</NavLinkBase>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {/* These will be conditionally rendered once auth is wired */}
            <Button asChild variant="outline">
              <NavLink to="/signin">Sign in</NavLink>
            </Button>
            <Button asChild>
              <NavLink to="/register">Create account</NavLink>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      <footer className="mt-10 border-t">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Idea Manager
          <span className="ml-auto">{location.pathname}</span>
        </div>
      </footer>
    </div>
  )
}
