from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.schema.user import RegisterSchema, LoginSchema
from app.models import User, UserLogin
from app.repositories.create_user_repositories import CreateUserRepository
from app.core.security import create_access_token, Hashing, Verify
from app.utils.validators import is_strong_password
from app.core.logging_config import logger
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES as ACCESS_EXPIRE_MINUTES

def register_user(payload: RegisterSchema, db: Session):
    repo = CreateUserRepository(db)

    existing = repo.get_user_by_email(payload.email)
    if existing:
        logger.warning(f"Attempt to register existing email: {payload.email}")
        raise HTTPException(400, "User already exists")

    if not is_strong_password(payload.password):
        raise HTTPException(400, "Weak password")

    hashed = Hashing(payload.password)
    user = User(
        username=payload.username,
        email=payload.email,
        password=hashed,
        role=payload.role.value if hasattr(payload.role, "value") else payload.role, # Handle Enum or str
    )

    repo.add_user(user)
    logger.info(f"User registered: {payload.email}")
    return {"message": "Registered", "user_id": user.id}


def login_user(payload: LoginSchema, db: Session):
    repo = CreateUserRepository(db)

    user = repo.get_user_by_email(payload.email)
    if not user or not Verify(payload.password, user.password):
        logger.warning(f"Login failed for {payload.email}")
        raise HTTPException(401, "Invalid credentials")

    token_data = {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "user_id": user.id,
    }
    
    token = create_access_token(token_data, expire_minutes=ACCESS_EXPIRE_MINUTES)

    login = repo.get_user_login(user.id)
    if login:
        login.token = token
        login.status = "active"
        repo.update_user_login(login)
    else:
        login = UserLogin(user_id=user.id, token=token)
        repo.add_user_login(login)

    logger.info(f"User logged in: {payload.email}")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_login_id": login.id,
        "role": user.role,
    }


def validate_token(db: Session, token: str): # Added db argument just in case logic needs it, though original function arg list might differ. Check carefully.
    # Anjali's version of validate_token only took token?
    # "def validate_token(token: str):"
    pass
    # I will stick to what auth_routes passes.
    # auth_routes passes: "payload = Create_User.validate_token(db, token)" in HEAD.
    # Anjali's auth_routes line 133: "payload = decode_access_token(token)" directly in route!
    # So `create_user.py` might not need validate_token if route does it.
    # But Anjali's `create_user.py` line 225 had `validate_token` which called `decode_access_token`.
    # I'll include it.

def logout_user(user_login_id: int, db: Session):
    repo = CreateUserRepository(db)
    login = repo.deactivate_user_login(user_login_id)
    if not login:
        raise HTTPException(404, "Login not found")
    logger.info(f"User logout: {login.user_id}")
    return {"message": "Logged out"}
