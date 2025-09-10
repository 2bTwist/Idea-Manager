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
    upstream.hostname = new URL(apiOrigin).hostname
    upstream.protocol = new URL(apiOrigin).protocol
    upstream.port = new URL(apiOrigin).port
    upstream.pathname = url.pathname.replace(/^\/api/, "")

    // Copy headers (excluding hop-by-hop)
    const headers = new Headers(req.headers)
    const hopByHopHeaders = ["host", "cf-connecting-ip", "x-forwarded-host", "x-real-ip"]
    hopByHopHeaders.forEach(h => headers.delete(h))

    // Forward the request with body & cookies
    const init: RequestInit = {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
      redirect: "manual",
    }

    let res: Response
    try {
      res = await fetch(upstream.toString(), init)
    } catch (e) {
      return corsResponse(new Response(JSON.stringify({ error: "Upstream not reachable" }), {
        status: 502, headers: { "content-type": "application/json" }
      }), req, allowed)
    }

    // Pass through body & headers, but apply CORS
    const outHeaders = new Headers(res.headers)
    // Ensure Set-Cookie passes through (don’t coalesce)
    const setCookies = res.headers.getSetCookie?.() ?? []
    outHeaders.delete("set-cookie")
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
