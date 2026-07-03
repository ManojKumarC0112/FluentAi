from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Supabase Postgres connection URL
# Important: sqlalchemy requires postgresql:// instead of postgres:// 
SQLALCHEMY_DATABASE_URL = settings.SUPABASE_URL.replace("https://", "postgresql://postgres:").replace(".supabase.co", ".supabase.co:5432/postgres")

# NOTE: Since we only have SUPABASE_URL and SUPABASE_KEY in the config right now (based on standard Supabase setup), 
# Supabase Postgres connection string actually requires the DB password.
# To properly connect via SQLAlchemy, we need a DATABASE_URL. 
# We'll use a placeholder environment variable here that the user will need to provide for direct DB access,
# OR we can just use the Supabase Python Client (PostgREST) for MVP since it's easier and uses the anon/service keys.

# Actually, since this is a robust backend, SQLAlchemy is best. But it requires the Postgres password.
# Let's provide a robust fallback or raise an error if a direct DB connection string isn't provided.
import os

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    # We will just print a warning and not crash until the DB is actually accessed.
    print("WARNING: DATABASE_URL not set. SQLAlchemy will fail to connect.")
    db_url = "sqlite:///./fluentai.db" # Fallback to local SQLite for immediate dev testing

engine = create_engine(
    db_url, connect_args={"check_same_thread": False} if "sqlite" in db_url else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
