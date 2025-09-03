import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export default function Home() {
  const { isAuthed } = useAuth()
  return (
    <section className="relative isolate">
      <div className="mx-auto max-w-5xl text-center py-16 sm:py-24 lg:py-28">
        <h1 className="font-extrabold tracking-tight leading-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
          Manage Ideas Like
          <br className="hidden sm:block" />
          <span className="block">Never Before</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your project management workflow with our intuitive kanban
          board platform. Track ideas, monitor progress, and deliver results.
        </p>

        <div className="mt-8 flex items-center justify-center">
          <Button asChild className="gap-2">
            <NavLink to={isAuthed ? "/ideas" : "/register"}>
              {isAuthed ? "Go to Ideas" : "Get Started Free"}
              <ArrowRight className="size-4" />
            </NavLink>
          </Button>
        </div>
      </div>
    </section>
  )
}
