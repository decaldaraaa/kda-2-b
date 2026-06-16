import os
import jwt
from datetime import datetime, timedelta, timezone
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import bcrypt

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

import bcrypt

# --- FUNGSI BARU UNTUK PASSWORD HASHING ---

def hash_password(password: str) -> str:
    """Mengubah plaintext password menjadi hash secure bcript"""
    # Mengubah string menjadi bytes
    pwd_bytes = password.encode('utf-8')
    # Membuat salt otomatis
    salt = bcrypt.gensalt()
    # Lakukan hashing
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Kembalikan dalam bentuk string untuk disimpan di karakter varchar DB
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Mengecek apakah password yang diketik cocok dengan hash di database"""
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

def get_password_hash(password: str):
    # Hash password menggunakan Bcrypt dengan cost standard (12)
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')