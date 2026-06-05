from fastapi import FastAPI, Request, HTTPException, Depends, BackgroundTasks, status
from sqlalchemy.orm import Session
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

# --- 3. FUNGSI PENGIRIM EMAIL (DIJALANKAN DI BACKGROUND) ---
def send_otp_email(receiver_email: str, otp_code: str):
    # Mengambil kredensial
    sender_email = os.getenv("EMAIL_SENDER")
    sender_password = os.getenv("EMAIL_PASSWORD")

    # PROTEKSI EKSTRA: Mencegah eksekusi jika variabel lingkungan gagal dimuat
    if not sender_email or not sender_password:
        logger.error("❌ CRITICAL: EMAIL_SENDER atau EMAIL_PASSWORD kosong atau tidak terbaca oleh Render!")
        return

    msg = EmailMessage()
    msg.set_content(f"Halo!\n\nMesin Fuzzy Logic kami mendeteksi pola login yang tidak biasa pada akun Anda.\n\nUntuk melindungi identitas digital Anda, silakan masukkan kode OTP berikut pada halaman Security Check:\n\nKODE OTP: {otp_code}\n\nKode ini bersifat rahasia. Jangan berikan kepada siapapun.\n\nSalam Aman,\nTim Keamanan Sistem")
    
    msg["Subject"] = "SECURE.IT - Security Alert (MFA Code)"
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        logger.info(f"⏳ Mencoba menghubungi SMTP Gmail untuk mengirim ke {receiver_email}...")
        
        # PENAMBAHAN TIMEOUT (10 Detik) agar background task tidak hang selamanya jika port diblokir
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
            logger.info(f"✅ SUKSES: Email OTP berhasil dikirim ke {receiver_email}")
            
    except smtplib.SMTPAuthenticationError:
        logger.error("❌ GAGAL AUTENTIKASI: Sandi Aplikasi (App Password) ditolak oleh Google. Periksa EMAIL_PASSWORD.")
    except TimeoutError:
        logger.error("❌ TIMEOUT: Tidak dapat menembus port 465 smtp.gmail.com. Koneksi terputus.")
    except Exception as e:
        logger.error(f"❌ ERROR TIDAK DIKENAL pada SMTP: {str(e)}")

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
    req: UserLogin, # SEKARANG FRONTEND HANYA BOLEH MENGIRIM USERNAME & PASSWORD
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

    # 3. KALKULASI 3 VARIABEL INTI SECARA MANDIRI (DARI DATABASE, BUKAN FRONTEND)
    # Mengambil 10 log terakhir dari user ini
    recent_logs = db.query(models.LoginHistory).filter(
        models.LoginHistory.user_id == user.id
    ).order_by(models.LoginHistory.login_time.desc()).limit(10).all()

    # Hitung berapa kali gagal berturut-turut di masa lalu
    jml_gagal = sum(1 for log in recent_logs if log.status in ["Failed", "Untrusted"])
    
    # Hitung indikasi anomali (Contoh: Bisa diisi dengan deteksi IP baru, sesuaikan logika Anda)
    jml_ganti_ip = 0 # Implementasikan logika pengecekan IP unik di sini
    tingkat_anomali = 0 # Implementasikan logika anomali waktu/lokasi di sini

    # 4. VERIFIKASI PASSWORD & PENCATATAN KEGAGALAN
    if not security.verify_password(req.password, user.password_hash):
        # WAJIB DICATAT SEBAGAI FAILED AGAR JML_GAGAL BERTAMBAH DI PERCOBAAN BERIKUTNYA
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
    # Skor dihitung berdasarkan rekam jejak kegagalan (jml_gagal) sebelumnya
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
        
        # PENTING: Gunakan sistem penyimpanan yang valid untuk production (misal: Redis atau DB)
        otp_storage[user.username] = otp 
        
        # Mendaftarkan task ke dalam antrean
        background_tasks.add_task(send_otp_email, user.email, otp)

        # REVISI ARSITEKTURAL: Mengembalikan JSONResponse alih-alih melempar Exception
        # Ini memastikan background_tasks tetap tereksekusi di server setelah status 403 dikirim ke Vercel.
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN, 
            content={"detail": f"Terdeteksi anomali. OTP telah dikirim ke email Anda. (Skor: {skor_dinamis})"},
            background=background_tasks
        )

    else:
        # UNTRUSTED
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED, # 423 Locked sangat tepat untuk pemblokiran siber
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
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Hitung total log yang pernah dianalisis
    total_logs = db.query(models.LoginHistory).count()
    
    # 2. Hitung rata-rata Trust Score sistem
    avg_score = db.query(func.avg(models.LoginHistory.trust_score)).scalar()
    avg_score = round(avg_score, 1) if avg_score else 0.0
    
    # 3. Ambil 3 aktivitas terbaru
    recent_logs = db.query(models.LoginHistory).order_by(models.LoginHistory.id.desc()).limit(3).all()
    
    activities = []
    for log in recent_logs:
        user = db.query(models.User).filter(models.User.id == log.user_id).first()
        
        # Lakukan Dekripsi AES-256 khusus untuk audit forensik CEO
        try:
            real_ip = security.decrypt_data(log.encrypted_ip)
        except:
            real_ip = "Encrypted IP"
            
        activities.append({
            "ip": real_ip,
            "user": user.username if user else "UNKNOWN",
            "score": log.trust_score,
            "status": log.status,
            "time": "Recent" # Bisa disesuaikan dengan format waktu DB Anda nanti
        })
        
    return {
        "total_logs": total_logs,
        "average_score": avg_score,
        "recent_activities": activities
    }