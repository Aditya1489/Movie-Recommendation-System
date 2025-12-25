from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_access_token
from app.core.logging_config import logger
from types import SimpleNamespace

class AttachUserMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        open_paths = [
            "/docs", "/openapi.json", "/redoc",
            "/auth/register", "/auth/login", "/auth/validate_token"
        ]

        if any(request.url.path.startswith(path) for path in open_paths):
            return await call_next(request)

        request.state.user = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.lower().startswith("bearer "):
            try:
                token = auth_header.split(" ")[1]
                payload = decode_access_token(token)
                
                if payload:
                    request.state.user = SimpleNamespace(
                        user_id=payload.get("user_id"),
                        email=payload.get("email"),
                        role=payload.get("role"),
                        username=payload.get("username")
                    )
                    logger.debug(f"Attached user: {payload.get('email')}")
            except Exception as e:
                logger.warning(f"Auth middleware error: {e}")
        
        return await call_next(request)
