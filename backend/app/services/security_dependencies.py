from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.security import decode_access_token

bearer_scheme = HTTPBearer()

def require_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    """
    Extracts JWT token from Authorization header and validates it.
    Returns payload if valid, raises 401 if invalid.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return payload
