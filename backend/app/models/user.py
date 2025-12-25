from sqlalchemy import Column, BIGINT, Integer, String, Enum, TIMESTAMP, func, ForeignKey, Text, Float, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.session import engine

# USERS
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    
    # Using Enum as per Anjali/Adarsh latest pattern
    role = Column(Enum("admin", "user", name="user_roles"), default="user")
    status = Column(Enum("active", "suspended", name="user_status"), default="active")
    
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    movies = relationship("Movies", back_populates="creator", cascade="all, delete-orphan")
    # logins = relationship("UserLogin", back_populates="user", cascade="all, delete-orphan") # UserLogin needs relationship back

# USER LOGINS
class UserLogin(Base):
    __tablename__ = "user_logins"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    token = Column(Text, nullable=False)
    status = Column(Enum("active", "suspended", name="login_status"), default="active")
    created_at = Column(TIMESTAMP, server_default=func.now())
    expiration_date = Column(TIMESTAMP, nullable=True)
    
    # user = relationship("User", back_populates="logins")

# Recommendation table (from Adarsh)
class Recommendation(Base):
    __tablename__ = "recommendations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    recommended_movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"))
    reason = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

# Activity Log (from Adarsh)
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(100))
    description = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

# Base.metadata.create_all(bind=engine)
