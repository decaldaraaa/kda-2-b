import os
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mengambil kunci rahasia dari .env
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

# Menginisialisasi mesin cipher (AES)
cipher_suite = Fernet(ENCRYPTION_KEY.encode('utf-8'))

def encrypt_data(data: str) -> str:
    """Mengubah teks terang menjadi teks acak"""
    return cipher_suite.encrypt(data.encode('utf-8')).decode('utf-8')

def decrypt_data(encrypted_data: str) -> str:
    """Mengembalikan teks acak menjadi teks asli"""
    return cipher_suite.decrypt(encrypted_data.encode('utf-8')).decode('utf-8')

# Ambil kunci rahasia JWT dari .env
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "fallback_secret")
ALGORITHM = "HS256"

def create_access_token(data: dict):
    """Men-generate JWT dengan algoritma HS256"""
    to_encode = data.copy()
    
    # Token akan kadaluarsa dalam 1 jam
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    to_encode.update({"exp": expire})
    
    # Membuat signature digital HS256
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt