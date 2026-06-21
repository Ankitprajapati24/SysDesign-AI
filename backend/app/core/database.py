from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

<<<<<<< HEAD
is_sqlite = settings.DATABASE_URL.startswith("sqlite")

if is_sqlite:
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,      # test connection before using it
        pool_recycle=300,        # recycle connections every 5 min
        pool_size=5,             # smaller pool for serverless DB
        max_overflow=10,
    )
=======
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # test connection before using it
    pool_recycle=300,        # recycle connections every 5 min
    pool_size=5,             # smaller pool for serverless DB
    max_overflow=10,
)
>>>>>>> origin/feat/admin
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
