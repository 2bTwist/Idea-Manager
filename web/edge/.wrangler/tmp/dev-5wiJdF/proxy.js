var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/proxy.ts
function parseAllowed(origins) {
  return (origins ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}
__name(parseAllowed, "parseAllowed");
var proxy_default = {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const apiOrigin = env.API_ORIGIN || "https://api.eddyb.dev";
    const allowed = new Set(parseAllowed(env.ALLOWED_ORIGINS));
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }
    if (req.method === "OPTIONS") {
      return corsResponse(null, req, allowed);
    }
    const upstream = new URL(url.toString());
    upstream.hostname = new URL(apiOrigin).hostname;
    upstream.protocol = new URL(apiOrigin).protocol;
    upstream.port = new URL(apiOrigin).port;
    upstream.pathname = url.pathname.replace(/^\/api/, "");
    const headers = new Headers(req.headers);
    const hopByHopHeaders = ["host", "cf-connecting-ip", "x-forwarded-host", "x-real-ip"];
    hopByHopHeaders.forEach((h) => headers.delete(h));
    const init = {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method) ? void 0 : await req.arrayBuffer(),
      redirect: "manual"
    };
    let res;
    try {
      res = await fetch(upstream.toString(), init);
    } catch (e) {
      return corsResponse(new Response(JSON.stringify({ error: "Upstream not reachable" }), {
        status: 502,
        headers: { "content-type": "application/json" }
      }), req, allowed);
    }
    const outHeaders = new Headers(res.headers);
    const setCookies = res.headers.getSetCookie?.() ?? [];
    outHeaders.delete("set-cookie");
    const out = new Response(res.body, { status: res.status, statusText: res.statusText, headers: outHeaders });
    setCookies.forEach((c) => out.headers.append("set-cookie", c));
    return corsResponse(out, req, allowed);
  }
};
function corsResponse(res, req, allowed) {
  const origin = req.headers.get("origin") || "";
  const isAllowed = allowed.has(origin);
  const base = res ?? new Response(null, { status: 204 });
  base.headers.set("vary", "Origin");
  if (isAllowed) {
    base.headers.set("access-control-allow-origin", origin);
    base.headers.set("access-control-allow-credentials", "true");
    base.headers.set("access-control-allow-headers", req.headers.get("access-control-request-headers") ?? "content-type,authorization");
    base.headers.set("access-control-allow-methods", req.headers.get("access-control-request-method") ?? "GET,POST,PATCH,PUT,DELETE,OPTIONS");
  }
  return base;
}
__name(corsResponse, "corsResponse");

// ../../../../../../AppData/Roaming/nvm/v22.12.0/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../../AppData/Roaming/nvm/v22.12.0/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-EhBDtQ/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = proxy_default;

// ../../../../../../AppData/Roaming/nvm/v22.12.0/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-EhBDtQ/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=proxy.js.map
