import { useEffect, useMemo, useState, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/system/Loading"
import { toast } from "sonner"
import * as api from "@/lib/api"

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function VerifyEmail() {
  const shownInvalidToast = useRef(false)
  const q = useQuery()
  const navigate = useNavigate()
  const token = q.get("token") || ""
  const emailFromNav = q.get("email") || ""

  const [email, setEmail] = useState(emailFromNav)
  const [checking, setChecking] = useState<boolean>(!!token)
  const [tokenValid, setTokenValid] = useState<boolean | null>(token ? null : true)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  // If a token is present, validate it (doesn't consume the token)
  useEffect(() => {
    let timer: number | undefined
    if (!token) return
    ;(async () => {
      setChecking(true)
      const res = await api.auth.validateVerifyToken(token)
      setChecking(false)
      if (!res.ok) {
        setTokenValid(false)
        toast.error("Could not validate the link", { description: res.error.message })
        return
      }
      setTokenValid(res.data.valid)
      if (res.data.valid) {
        toast.success("Verification link is valid")
      } else if (!shownInvalidToast.current) {
        toast.error("This verification link is invalid or has expired")
        shownInvalidToast.current = true
      }
    })()
    return () => { if (timer) window.clearTimeout(timer) }
  }, [token])

  async function onVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !token) return
    setVerifying(true)
    const res = await api.auth.verifyEmail(email.trim(), token)
    setVerifying(false)
    if (!res.ok) {
      toast.error("Verification failed", { description: res.error.message })
      return
    }
    toast.success("Email verified. You can sign in now.")
    navigate("/signin", { replace: true })
  }

  async function onResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setResending(true)
    const res = await api.auth.requestVerify(email.trim())
    setResending(false)
    if (!res.ok) {
      toast.error("Could not send verification", { description: res.error.message })
      return
    }
    toast.success("If the account exists and is not verified, we sent a new link.", {
      description: res.data.dev_verify_link ? `Dev link: ${res.data.dev_verify_link}` : undefined,
    })
  }

  // ------------- RENDER -------------
  // Case A: direct visit after register (no token) => “email sent” + resend option
  if (!token) {
    return (
      <section className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a verification link{email ? <> to <span className="font-medium">{email}</span></> : null}. Click the link to verify your account.
        </p>

        <form onSubmit={onResend} className="space-y-3">
          <Label htmlFor="email">Didn’t get it? Resend verification</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={resending}>{resending ? "Sending…" : "Resend"}</Button>
          </div>
        </form>

        <div className="pt-2">
          <Button variant="outline" onClick={() => navigate("/signin")}>Go to Sign In</Button>
        </div>
      </section>
    )
  }

  // Case B: coming from email (has token). Validate and show verify form.
  return (
    <section className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Verify your email</h1>

      {checking && <LoadingSpinner label="Validating your link…" />}

      {!checking && tokenValid === true && (
        <>
          <p className="text-muted-foreground">Enter your email to confirm and complete verification.</p>
          <form onSubmit={onVerify} className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={verifying}>{verifying ? "Verifying…" : "Verify"}</Button>
            </div>
          </form>
        </>
      )}

      {!checking && tokenValid === false && (
        <>
          <p className="text-destructive">This verification link is invalid or has expired.</p>
          <form onSubmit={onResend} className="space-y-3">
            <Label htmlFor="email">Request a new verification email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={resending}>{resending ? "Sending…" : "Resend"}</Button>
            </div>
          </form>
          <div className="pt-2">
            <Button variant="outline" onClick={() => navigate("/signin")}>Back to Sign In</Button>
          </div>
        </>
      )}
    </section>
  )
}
