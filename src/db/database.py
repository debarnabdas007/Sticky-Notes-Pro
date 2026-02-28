from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from src.core.config import settings

# check_same_thread is needed only for SQLite in FastAPI
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to inject the database session into our routes later
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()