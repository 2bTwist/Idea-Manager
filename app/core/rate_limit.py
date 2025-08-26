from slowapi import Limiter
from slowapi.util import get_remote_address

# Per-IP key; works behind Docker/local dev too
limiter = Limiter(key_func=get_remote_address)
