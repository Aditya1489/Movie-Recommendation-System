from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from app.core.config import url

# For SQLite, use StaticPool and connect_args for multi-threaded access
if url.startswith("sqlite"):
    engine = create_engine(url, connect_args={"check_same_thread": False}, poolclass=StaticPool)
else:
    engine = create_engine(url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
