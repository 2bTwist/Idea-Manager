import AuthCard from "@/components/auth/AuthCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate, NavLink } from "react-router-dom"
import { toast } from "sonner"
import type { FormEvent } from "react"
import * as api from "@/lib/api"

export default function Register() {
  const navigate = useNavigate()

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const full_name = String(fd.get("full_name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const password = String(fd.get("password") || "").trim();
    const confirm = String(fd.get("confirm") || "").trim();

    if (!full_name || !email || !password || !confirm) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const t = toast.loading("Creating your account…");
    const res = await api.auth.register(email, password, full_name);
    toast.dismiss(t);

    if (!res.ok) {
      toast.error(`Sign up failed (${res.error.status})`, { description: res.error.message });
      return;
    }

    toast.success("Account created!", {
      description: res.data.is_verified
        ? "You can sign in now."
        : "Check your email to verify your account.",
    });

    navigate(res.data.is_verified ? "/signin" : "/verify-email");
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
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ada Lovelace"
                autoComplete="name"
                required
              />
            </div>
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
      );
    }
