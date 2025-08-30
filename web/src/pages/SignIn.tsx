import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NavLink } from "react-router-dom"
import { toast } from "sonner"
import type { FormEvent } from "react"
import AuthCard from "@/components/auth/AuthCard"

export default function SignIn() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "").trim()
    const password = String(fd.get("password") || "").trim()

    if (!email || !password) {
      toast.error("Please fill in both fields")
      return
    }
    toast("Submitting…", { description: "Real auth wired in Phase 2" })
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your project management account"
      footer={
        <>
          Don’t have an account?{" "}
          <NavLink
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </NavLink>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black"
        >
          Sign In
        </Button>
      </form>
    </AuthCard>
  )
}
