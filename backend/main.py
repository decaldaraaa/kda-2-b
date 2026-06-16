from fastapi import FastAPI, Request, HTTPException, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func
import datetime
from pydantic import BaseModel
import models, security
import fuzzy_engine
from database import engine, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
import os
import smtplib
import logging
from email.message import EmailMessage # Impor pembuat pesan
import random # Impor generator angka acak
from fastapi import Request
from fastapi.responses import JSONResponse
import requests
from fastapi import Query
from typing import Optional
from sqlalchemy import or_

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistem Autentikasi Dinamis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- 1. SKEMA PYDANTIC ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    ip_address: str = "127.0.0.1"
    user_agent: str = "Next.js Browser"
    jml_gagal: int = 0
    jml_ganti_ip: int = 0
    tingkat_anomali: int = 0

# Skema baru untuk Verifikasi OTP
class MFAVerify(BaseModel):
    username: str
    otp_code: str

# --- 2. PENYIMPANAN OTP SEMENTARA ---
# (Di sistem nyata, simpan di Redis atau Database. Untuk demo, dictionary memori sudah sangat cukup)
otp_storage = {}

# --- 3. FUNGSI PENGIRIM EMAIL (HTTP API PRODUCTION) ---
def send_otp_email(receiver_email: str, otp_code: str):
    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("EMAIL_SENDER") # Harus email yang sudah diverifikasi di Brevo

    if not api_key:
        logger.error("❌ CRITICAL: BREVO_API_KEY tidak ditemukan di environment!")
        return

    # Endpoint resmi Brevo API
    url = "https://api.brevo.com/v3/smtp/email"
    
    # Payload data yang akan dikirim (menggunakan HTML agar rapi)
    payload = {
        "sender": {"name": "SECURE.IT System", "email": sender_email},
        "to": [{"email": receiver_email}],
        "subject": "SECURE.IT - Security Alert (MFA Code)",
        "htmlContent": f"""
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
            <h2 style="color: #0D1B2A; text-align: center;">Security Check</h2>
            <p>Halo,</p>
            <p>Mesin AI kami mendeteksi pola login anomali pada akun Anda. Untuk melindungi identitas digital Anda, silakan masukkan kode OTP berikut:</p>
            <div style="background-color: #0D1B2A; color: #FFD166; font-size: 28px; font-weight: bold; text-align: center; padding: 15px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
                {otp_code}
            </div>
            <p style="font-size: 12px; color: #666;">Kode ini bersifat rahasia dan hanya berlaku untuk satu kali percobaan. Jangan berikan kepada siapa pun.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">Secure.IT Security Systems &copy; 2026</p>
        </div>
        """
    }
    
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }

    try:
        logger.info(f"⏳ Mengirim instruksi OTP ke API Brevo untuk {receiver_email}...")
        
        # Kirim request POST ke port 443 (HTTPS) yang mustahil diblokir firewall
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code in [200, 201, 202]:
            logger.info(f"✅ SUKSES API: Email OTP terkirim ke {receiver_email}")
        else:
            logger.error(f"❌ GAGAL API: Server merespons {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"❌ ERROR KONEKSI API: {str(e)}")

# --- 4. FUNGSI DATABASE ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- 3. ENDPOINTS ---

@app.post("/test-log-history/")
def create_dummy_history(
    ip_address: str, 
    user_agent: str, 
    jml_gagal: int,       
    jml_ganti_ip: int,    
    tingkat_anomali: int, 
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        dummy_user = models.User(username="kunto_test", email="test@fatisda.uns.ac.id", password_hash="rahasia123")
        db.add(dummy_user)
        db.commit()
        db.refresh(dummy_user)

    ip_acak = security.encrypt_data(ip_address)
    agent_acak = security.encrypt_data(user_agent)
    
    skor_dinamis, status_login = fuzzy_engine.hitung_skor(jml_gagal, jml_ganti_ip, tingkat_anomali)
    
    new_log = models.LoginHistory(
        user_id=1, 
        encrypted_ip=ip_acak,
        encrypted_user_agent=agent_acak,
        trust_score=skor_dinamis, 
        status=status_login       
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return {
        "pesan": "Evaluasi perilaku selesai dan disimpan!",
        "hasil_fuzzy": {
            "skor": skor_dinamis,
            "keputusan": status_login
        }
    }


@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Cek apakah username atau email sudah pernah terdaftar
    existing_user = db.query(models.User).filter(
        (models.User.username == user.username) | (models.User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username atau Email sudah digunakan oleh orang lain")
    
    # 2. Amankan password menggunakan bcrypt hash sebelum disimpan
    hashed_pwd = security.hash_password(user.password)
    
    # 3. Simpan ke database (menggunakan object properties)
    new_user = models.User(
        username=user.username, 
        email=user.email, 
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "pesan": f"User '{user.username}' berhasil didaftarkan!",
        "status_password_di_database": "Terproteksi Bcrypt Hash"
    }

@app.post("/login/")
async def login_dinamis(
    req: UserLogin,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. EKSTRAKSI METADATA (SERVER-SIDE / ZERO-TRUST)
    forwarded_for = request.headers.get("X-Forwarded-For")
    client_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host
    user_agent = request.headers.get("User-Agent", "Unknown")

    # 2. VALIDASI PENGGUNA EKSISTING
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username atau password salah")

# 3. KALKULASI 3 VARIABEL INTI DENGAN COOLDOWN 1 JAM
    time_threshold = datetime.datetime.now() - datetime.timedelta(hours=1)

    recent_logs = db.query(models.LoginHistory).filter(
        models.LoginHistory.user_id == user.id,
        models.LoginHistory.login_time >= time_threshold  
    ).order_by(models.LoginHistory.login_time.desc()).limit(10).all()

    # Variabel 1: Jumlah Gagal Aktual
    jml_gagal = sum(1 for log in recent_logs if log.status in ["Failed", "Untrusted"])
    
    # Variabel 2: Jumlah Ganti IP (Menghitung IP unik dalam 1 jam terakhir)
    ip_history = set()
    for log in recent_logs:
        try:
            # Dekripsi log historis untuk membandingkan IP
            decrypted_ip = security.decrypt_data(log.encrypted_ip)
            ip_history.add(decrypted_ip)
        except Exception:
            pass
            
    # Jika set memiliki lebih dari 1 IP unik, berarti ada perpindahan
    jml_ganti_ip = len(ip_history) - 1 if len(ip_history) > 0 else 0

    # Variabel 3: Tingkat Anomali (Deteksi lompatan perilaku)
    tingkat_anomali = 0
    if recent_logs:
        last_log = recent_logs[0] # Log paling baru sebelum percobaan ini
        try:
            last_ip = security.decrypt_data(last_log.encrypted_ip)
            last_ua = security.decrypt_data(last_log.encrypted_user_agent)
            
            # Jika percobaan saat ini berbeda dari percobaan terakhir (lompatan instan)
            if last_ip != client_ip:
                tingkat_anomali += 3  # Bobot tinggi untuk pindah IP mendadak
            if last_ua != user_agent:
                tingkat_anomali += 2  # Bobot menengah untuk ganti device/browser
        except Exception:
            pass
        
    # 4. VERIFIKASI PASSWORD & PENCATATAN KEGAGALAN
    if not security.verify_password(req.password, user.password_hash):
        failed_log = models.LoginHistory(
            user_id=user.id,
            encrypted_ip=security.encrypt_data(client_ip),
            encrypted_user_agent=security.encrypt_data(user_agent),
            trust_score=0,
            status="Failed"
        )
        db.add(failed_log)
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Username atau password salah")

    # 5. JIKA PASSWORD BENAR, EVALUASI FUZZY LOGIC
    # Skor dihitung secara adil, "dosa" lebih dari 1 jam lalu sudah dihapus (jml_gagal = 0)
    skor_dinamis, status_login = fuzzy_engine.hitung_skor(jml_gagal, jml_ganti_ip, tingkat_anomali)

    # 6. CATAT HISTORI LOGIN (TRUSTED / SUSPICIOUS / UNTRUSTED)
    new_log = models.LoginHistory(
        user_id=user.id,
        encrypted_ip=security.encrypt_data(client_ip),
        encrypted_user_agent=security.encrypt_data(user_agent),
        trust_score=skor_dinamis,
        status=status_login
    )
    db.add(new_log)
    db.commit()

    # 7. KEPUTUSAN FINAL BERDASARKAN STATUS FIS
    if status_login == "Trusted":
        token_data = {"sub": user.username, "score": skor_dinamis, "role": user.role}
        jwt_token = security.create_access_token(token_data)
        
        return {
            "status": status_login,
            "pesan": "Login Berhasil! Anda Terverifikasi Aman.",
            "trust_score": skor_dinamis,
            "access_token": jwt_token,
            "token_type": "bearer",
            "role": user.role
        }
        
    elif status_login == "Suspicious":
        otp = str(random.randint(100000, 999999))
        
        # PENTING: Gunakan sistem penyimpanan yang valid untuk production
        otp_storage[user.username] = otp 
        
        # Mendaftarkan task ke dalam antrean
        background_tasks.add_task(send_otp_email, user.email, otp)

        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN, 
            content={"detail": f"Terdeteksi anomali. OTP telah dikirim ke email Anda. (Skor: {skor_dinamis})"},
            background=background_tasks
        )

    else:
        # UNTRUSTED
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Akses Diblokir! Sistem mendeteksi aktivitas Brute-Force berbahaya. (Skor: {skor_dinamis})"
        )

# ENDPOINT BARU UNTUK VERIFIKASI MFA
@app.post("/verify-mfa/")
def verify_mfa_code(req: MFAVerify, db: Session = Depends(get_db)):
    # 1. Cek apakah OTP cocok dengan yang ada di memori
    saved_otp = otp_storage.get(req.username)
    
    if not saved_otp or saved_otp != req.otp_code:
        raise HTTPException(status_code=400, detail="Kode OTP tidak valid atau sudah kadaluarsa.")
    
    # 2. Jika valid, hapus OTP dari memori agar tidak dipakai 2 kali
    del otp_storage[req.username]
    
    # 3. Terbitkan JWT Token
    user = db.query(models.User).filter(models.User.username == req.username).first()
    token_data = {"sub": user.username, "score": 100, "role": user.role} # Skor anggap aman setelah MFA
    jwt_token = security.create_access_token(token_data)
    
    return {
        "pesan": "MFA Verifikasi Berhasil!",
        "access_token": jwt_token,
        "token_type": "bearer",
        "role": user.role
    }
    
@app.get("/api/dashboard-stats/")
def get_dashboard_stats(
    q: Optional[str] = Query(None, description="Query pencarian username atau status"),
    days: Optional[int] = Query(None, description="Filter rentang hari ke belakang"), # [BARU] Parameter dari dropdown frontend
    db: Session = Depends(get_db)
):
    # 1. Inisialisasi kueri dengan operasi JOIN (LoginHistory + User)
    query = db.query(models.LoginHistory, models.User).outerjoin(
        models.User, models.LoginHistory.user_id == models.User.id
    )
    
    # 2. Terapkan filter pencarian teks jika ada input dari Frontend
    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                models.User.username.ilike(search_pattern),
                models.LoginHistory.status.ilike(search_pattern)
            )
        )
        
    # [BARU] 3. Terapkan filter batas waktu jika user memilih dari dropdown
    if days:
        time_threshold = datetime.datetime.now() - datetime.timedelta(days=days)
        query = query.filter(models.LoginHistory.login_time >= time_threshold)
        
    # 4. Hitung metrik dinamis (Total & Rata-rata Skor) dari data yang terfilter
    total_logs = query.count()
    
    avg_score = query.with_entities(func.avg(models.LoginHistory.trust_score)).scalar()
    avg_score = round(avg_score, 1) if avg_score else 0.0
    
    # [UPDATE] 5. Batas pencarian dinaikkan ke 200 agar fitur Pagination frontend memiliki data untuk dipotong-potong
    recent_records = query.order_by(models.LoginHistory.id.desc()).limit(200).all()
    
    activities = []
    # SQLAlchemy mengembalikan Tuple (log, user) karena kita melakukan JOIN
    for log, user in recent_records:
        
        # Kembalikan fitur Dekripsi AES-256 untuk audit CEO
        try:
            real_ip = security.decrypt_data(log.encrypted_ip)
        except Exception:
            real_ip = "Encrypted IP"
            
        activities.append({
            "ip": real_ip,
            "user": user.username if user else "UNKNOWN",
            "score": log.trust_score,
            "status": log.status,
            "time": log.login_time.strftime("%d %b, %H:%M") if log.login_time else "Unknown"
        })
        
    return {
        "total_logs": total_logs,
        "average_score": avg_score,
        "recent_activities": activities
    }