import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Membuat engine koneksi ke PostgreSQL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Membuat session (sesi interaksi database)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk model tabel kita nanti
Base = declarative_base()