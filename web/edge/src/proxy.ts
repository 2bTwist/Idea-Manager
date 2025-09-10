// A minimal, safe proxy for your FastAPI.
// Mount this Worker on /api/* at app.eddyb.dev so cookies are first-party.

function parseAllowed(origins: string | undefined) {
  return (origins ?? "").split(",").map(s => s.trim()).filter(Boolean)
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    const apiOrigin = (env.API_ORIGIN as string) || "https://api.eddyb.dev"
    const allowed = new Set(parseAllowed(env.ALLOWED_ORIGINS as string))

    // Only handle /api/* here; everything else should be served by Cloudflare Pages
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 })
    }

    // CORS preflight
    if (req.method === "OPTIONS") {
      return corsResponse(null, req, allowed)
    }

    // Rewrite /api/xyz -> <API_ORIGIN>/xyz
    const upstream = new URL(url.toString())
    const api = new URL(apiOrigin)
    upstream.hostname = api.hostname
    upstream.protocol = api.protocol
    upstream.port = api.port
    upstream.pathname = url.pathname.replace(/^\/api/, "")

    // Copy headers (excluding hop-by-hop)
    const headers = new Headers(req.headers)
    const hopByHopHeaders = ["host", "cf-connecting-ip", "x-forwarded-host", "x-real-ip"]
    hopByHopHeaders.forEach(h => headers.delete(h))

    // Tell the API the real outer scheme/host so it generates HTTPS absolute redirects
    headers.set("x-forwarded-proto", "https")
    headers.set("x-forwarded-host", api.host)

    // Forward the request with body & cookies
    const init: RequestInit = {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      // we’ll rewrite Location headers, so don't auto-follow
      redirect: "manual",
    }

    let res: Response
    try {
      res = await fetch(upstream.toString(), init)
    } catch {
      return corsResponse(new Response(JSON.stringify({ error: "Upstream not reachable" }), {
        status: 502, headers: { "content-type": "application/json" }
      }), req, allowed)
    }

    // Pass through body & headers, but apply CORS and clean Set-Cookie
    const outHeaders = new Headers(res.headers)
    const setCookies = res.headers.getSetCookie?.() ?? []
    outHeaders.delete("set-cookie")

    // If upstream sent a redirect, normalize the Location to stay on the current origin under /api/*
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = outHeaders.get("location")
      if (loc) {
        try {
          const locUrl = new URL(loc, upstream) // handle relative too
          // Build a new URL on the requester’s origin (the Pages app)
          const reqUrl = new URL(req.url)
          const newPath = locUrl.pathname.startsWith("/api/")
            ? locUrl.pathname
            : "/api" + locUrl.pathname
          const rewritten = new URL(reqUrl.origin + newPath + locUrl.search + locUrl.hash)
          outHeaders.set("location", rewritten.toString())
        } catch {
          // if it's malformed, drop it to avoid mixed-content
          outHeaders.delete("location")
        }
      }
    }

    const out = new Response(res.body, { status: res.status, statusText: res.statusText, headers: outHeaders })
    setCookies.forEach(c => out.headers.append("set-cookie", c))
    return corsResponse(out, req, allowed)
  }
}

type Env = {
  API_ORIGIN: string
  ALLOWED_ORIGINS: string
}

// Adds CORS for allowed origins & credentials
function corsResponse(res: Response | null, req: Request, allowed: Set<string>) {
  const origin = req.headers.get("origin") || ""
  const isAllowed = allowed.has(origin)

  const base = res ?? new Response(null, { status: 204 })
  base.headers.set("vary", "Origin")
  if (isAllowed) {
    base.headers.set("access-control-allow-origin", origin)
    base.headers.set("access-control-allow-credentials", "true")
    base.headers.set("access-control-allow-headers", req.headers.get("access-control-request-headers") ?? "content-type,authorization")
    base.headers.set("access-control-allow-methods", req.headers.get("access-control-request-method") ?? "GET,POST,PATCH,PUT,DELETE,OPTIONS")
  }
  return base
}
