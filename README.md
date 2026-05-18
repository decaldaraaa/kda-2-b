```markdown
# Sistem Autentikasi Dinamis - Backend (Kelompok 2 - B)

Repositori ini berisi kode *backend* untuk Sistem Autentikasi Dinamis menggunakan **FastAPI**, **PostgreSQL (Docker)**, **Scikit-Fuzzy**, dan **Enkripsi AES-256**. 

## 🛠️ Persyaratan Sistem
Sebelum memulai, pastikan laptop kamu sudah terinstal:
* **Python** (Versi 3.10 atau lebih baru)
* **Docker Desktop** (Pastikan sudah *running* di *background*)
* **Git**

## 🚀 Cara Setup di Laptop Lokal

**1. Clone Repositori dan Masuk ke Branch Backend**
```bash
git clone [https://github.com/decaldaraaa/kda-2-b.git](https://github.com/decaldaraaa/kda-2-b.git)
cd kda-2-b
git checkout feature/backend-init

```

**2. Nyalakan Database PostgreSQL dengan Docker**
Jalankan perintah ini di *root* folder proyek untuk membuat *container* *database*:

```bash
docker-compose up -d

```

**3. Setup Environment Variables**
Masuk ke folder `backend/`, lalu duplikat file template `.env.example` menjadi `.env`:

* Copy file `.env.example` dan ubah namanya menjadi `.env`.
* (Khusus untuk `ENCRYPTION_KEY`, minta kunci aslinya ke Kunto di grup, atau *generate* kunci baru jika ingin database yang sepenuhnya baru).

**4. Buat Virtual Environment & Install Dependencies**
Masih di dalam folder `backend/`, jalankan perintah berikut:

```bash
# Untuk Windows:
python -m venv venv
venv\Scripts\activate

# Install semua library yang dibutuhkan
pip install -r requirements.txt

```

**5. Jalankan Server FastAPI**
Gunakan *port* 8080 untuk menghindari bentrok dengan servis Windows lainnya:

```bash
uvicorn main:app --port 8080

```

## 🧪 Cara Pengujian

Jika terminal sudah memunculkan tulisan `Application startup complete`, buka browser kamu dan akses:
👉 **http://127.0.0.1:8080/docs**

Kamu bisa langsung mengetes *endpoint* `/login/` melalui antarmuka Swagger UI tersebut.

---

**Catatan untuk Tim:**

* Database Schema akan ter-generate secara otomatis saat Uvicorn pertama kali dijalankan.
* Pastikan selalu bekerja di *branch* masing-masing (misal: `feature/frontend-nextjs`) sebelum melakukan *commit*.