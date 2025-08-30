import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NavLink } from "react-router-dom"
import { toast } from "sonner"
import type { FormEvent } from "react"

export default function Register() {
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get("email") || "").trim()
    const password = String(fd.get("password") || "").trim()
    const confirm = String(fd.get("confirm") || "").trim()

    if (!email || !password || !confirm) {
      toast.error("Please fill in all fields")
      return
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    // Phase 2: call API to create account
    toast("Creating account…", { description: "Backend wiring comes in Phase 2" })
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start managing and ranking ideas in minutes"
      footer={
        <>
          Already have an account?{" "}
          <NavLink to="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </NavLink>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2 text-left">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-2 text-left">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black"
        >
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
