from sqlalchemy.orm import Session
from app.models import User, UserLogin


class CreateUserRepository:
    """
    Repository class to handle User and UserLogin related DB operations.
    Keeps business logic separate from database logic.
    """

    def __init__(self, db: Session):
        self.db = db

    # -------------------- USER -------------------- #
    def get_user_by_email(self, email: str):
        """Fetch user by email."""
        return self.db.query(User).filter(User.email == email).first()

    def add_user(self, user: User):
        """Insert new user record into database."""
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    # -------------------- LOGIN -------------------- #
    def get_user_login(self, user_id: int):
        """Fetch login record for a specific user."""
        return self.db.query(UserLogin).filter(UserLogin.user_id == user_id).first()

    def add_user_login(self, login: UserLogin):
        """Insert new login record."""
        self.db.add(login)
        self.db.commit()
        self.db.refresh(login)
        return login

    def update_user_login(self, login: UserLogin):
        """Update existing login record."""
        self.db.commit()
        self.db.refresh(login)
        return login

    def deactivate_user_login(self, login_id: int):
        """Deactivate a user's login (logout)."""
        login = self.db.query(UserLogin).filter(UserLogin.id == login_id).first()
        if not login:
            return None
        login.status = "suspended"
        self.db.commit()
        return login

    
