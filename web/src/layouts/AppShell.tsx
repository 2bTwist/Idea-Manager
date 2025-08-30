import { Outlet, NavLink, useLocation } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

function Brand() {
  return (
    <NavLink to="/" className="flex items-center gap-2">
      <div className="size-7 rounded-md bg-primary text-primary-foreground grid place-items-center shadow-xs">
        {/* simple placeholder icon (emoji). swap for an SVG later */}
        <span className="text-sm">⚙️</span>
      </div>
      <span className="font-semibold tracking-tight">Idea Manager</span>
      {/* If you want “ProjectFlow”, just change the text above */}
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b fixed top-0 left-0 w-full z-30 bg-background">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center gap-3">
          <Brand />

          {/* keep main app nav hidden on landing/early – we’ll use it later */}
          <nav className="ml-6 hidden md:flex items-center gap-1">
            <NavLinkBase to="/ideas">Ideas</NavLinkBase>
            <NavLinkBase to="/profile">Profile</NavLinkBase>
            <NavLinkBase to="/admin/users">Admin</NavLinkBase>
          </nav>

          <div className="ml-auto">
            <Button asChild size="sm" variant="outline">
              <NavLink to="/signin">Sign In</NavLink>
            </Button>
          </div>
        </div>
      </header>

      {/* Page outlet */}
      <main className="flex-1 mx-auto max-w-7xl px-4 py-10 pt-20">
        <Outlet />
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
