from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from passlib.hash import pbkdf2_sha256
from app.core.logging_config import logger
from functools import wraps
from fastapi import HTTPException, status, Request

def create_access_token(data: dict, expire_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def Hashing(password: str) -> str:
    return pbkdf2_sha256.hash(password)

def Verify(plain_password: str, hashed_password: str) -> bool:
    return pbkdf2_sha256.verify(plain_password, hashed_password)

def user_required(func):
    """Allow both user and admin roles to access"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        request = kwargs.get("request") or (args[0] if args else None)
        user = getattr(request.state, "user", None) if request else None
        
        if not user:
            logger.warning("Unauthorized attempt (user required) without valid token")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Authenticated")
        
        # Allow both user and admin roles
        role = getattr(user, "role", None)
        if role not in ["user", "admin"]:
            logger.warning(f"Forbidden access: Invalid role '{role}' tried to access route")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
        return await func(*args, **kwargs)
    return wrapper


def hash_password(password: str) -> str:
    """Hash password for user creation"""
    return pbkdf2_sha256.hash(password)

def _get_user_from_request(request: Request):
    user = getattr(request.state, "user", None)
    if not user:
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Authenticated")
    return user

