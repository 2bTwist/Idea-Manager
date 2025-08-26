from slowapi import Limiter

def _real_ip(request):
	# Cloudflare passes the original client IP here
	return request.headers.get("CF-Connecting-IP") or (request.client.host if request.client else "-")

limiter = Limiter(key_func=_real_ip)
