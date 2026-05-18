from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, security
import fuzzy_engine
from fastapi import HTTPException
from database import engine, SessionLocal

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistem Autentikasi Dinamis")

# Fungsi untuk membuka dan menutup koneksi database setiap ada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/test-log-history/")
def create_dummy_history(
    ip_address: str, 
    user_agent: str, 
    jml_gagal: int,       # <-- Input Fuzzy 1
    jml_ganti_ip: int,    # <-- Input Fuzzy 2
    tingkat_anomali: int, # <-- Input Fuzzy 3
    db: Session = Depends(get_db)
):
    
    user = db.query(models.User).filter(models.User.id == 1).first()
    if not user:
        dummy_user = models.User(username="kunto_test", password_hash="rahasia123")
        db.add(dummy_user)
        db.commit()
        db.refresh(dummy_user)

    ip_acak = security.encrypt_data(ip_address)
    agent_acak = security.encrypt_data(user_agent)
    
    # --- PROSES EVALUASI FUZZY ---
    skor_dinamis, status_login = fuzzy_engine.hitung_skor(jml_gagal, jml_ganti_ip, tingkat_anomali)
    
    new_log = models.LoginHistory(
        user_id=1, 
        encrypted_ip=ip_acak,
        encrypted_user_agent=agent_acak,
        trust_score=skor_dinamis, # <-- Nilai cerdas dari scikit-fuzzy
        status=status_login       # <-- Status otomatis
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

@app.post("/login/")
def login_dinamis(
    username: str, 
    ip_address: str, 
    user_agent: str, 
    jml_gagal: int,
    jml_ganti_ip: int,
    tingkat_anomali: int,
    db: Session = Depends(get_db)
):
    # 1. Cek apakah user ada (simulasi sederhana)
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    # 2. Hitung Trust Score dengan Fuzzy Logic
    skor_dinamis, status_login = fuzzy_engine.hitung_skor(jml_gagal, jml_ganti_ip, tingkat_anomali)
    
    # 3. Simpan riwayat login yang terenkripsi AES-256
    new_log = models.LoginHistory(
        user_id=user.id,
        encrypted_ip=security.encrypt_data(ip_address),
        encrypted_user_agent=security.encrypt_data(user_agent),
        trust_score=skor_dinamis,
        status=status_login
    )
    db.add(new_log)
    db.commit()

    # 4. KEPUTUSAN: Berikan JWT hanya jika Trusted
    if status_login == "Trusted":
        # Generate token HS256
        token_data = {"sub": user.username, "score": skor_dinamis}
        jwt_token = security.create_access_token(token_data)
        
        return {
            "pesan": "Login Berhasil! Anda Terverifikasi Aman.",
            "trust_score": skor_dinamis,
            "access_token": jwt_token,
            "token_type": "bearer"
        }
    else:
        # Tolak akses jika Suspicious atau Untrusted
        raise HTTPException(
            status_code=403, 
            detail=f"Akses Ditolak! Terdeteksi anomali. Status: {status_login} (Skor: {skor_dinamis})"
        )