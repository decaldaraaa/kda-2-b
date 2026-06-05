'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, MailWarning, Shield, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  // State untuk form login
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk mengontrol alur layar (credentials -> mfa)
  const [loginStep, setLoginStep] = useState<'credentials' | 'mfa'>('credentials');
  
  // State untuk input kode OTP MFA
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          password: password
          // ZERO-TRUST: Hanya mengirimkan kredensial.
        }) 
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        // TRUSTED STATUS
        localStorage.setItem("access_token", data.access_token);
        const safeRole = (data.role || "employee").toLowerCase().trim();
        localStorage.setItem("user_role", safeRole); 
        localStorage.setItem("username", username);

        if (safeRole === "ceo") {
          router.push("/dashboard");
        } else {
          router.push("/user-dashboard");
        }

      } else {
        // FILTER PENOLAKAN BERDASARKAN STATUS HTTP
        if (response.status === 401) {
            // Kredensial Salah
            alert(`Akses Ditolak: ${data.detail}`);
        } 
        else if (response.status === 403) {
            // SUSPICIOUS -> Backend memicu OTP
            setLoginStep('mfa'); // 1. Ubah UI ke form OTP
            setTimeout(() => {
                alert(`Peringatan: ${data.detail}`); // 2. Tampilkan pesan backend (tanpa hitungan gagal)
            }, 100);
        } 
        else if (response.status === 423) {
            // UNTRUSTED -> Pemblokiran Keras
            alert(`🚨 TERKUNCI: ${data.detail}`);
        } 
        else {
            // Error lainnya
            alert(`Sistem merespons anomali: ${data.detail || "Kesalahan internal."}`);
        }
      }

    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert("Tidak dapat menghubungi server pengamanan. Periksa koneksi Anda.");
    }
};

const handleVerifyMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-mfa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username, 
          otp_code: otpCode 
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        alert("Kode Valid! Autentikasi dua faktor berhasil diverifikasi.");
        
        // Simpan token yang baru diterbitkan
        localStorage.setItem("access_token", data.access_token);
        
        const safeRole = (data.role || "employee").toLowerCase().trim();
        localStorage.setItem("user_role", safeRole); 
        localStorage.setItem("username", username);

        // Arahkan ke dashboard yang sesuai
        if (safeRole === "ceo") {
          window.location.href = "/dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      } else {
        alert(`Gagal: ${data.detail}`);
      }
    } catch (error) {
      setIsLoading(false);
      alert("Tidak dapat terhubung ke server verifikasi.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('konoha2.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/60 to-[#0D1B2A]/40 backdrop-blur-[2px]"></div>
      </div>

      {/* CONTAINER UTAMA */}
      <div className="z-10 flex flex-col lg:flex-row w-full max-w-6xl justify-between items-center gap-12 lg:gap-24">
        
        {/* SISI KIRI - TEKS & BRANDING */}
        <div className="text-[#E0E1DD] w-full lg:w-1/2 flex flex-col justify-center">
          <Link href="/" className="flex items-center gap-2 mb-8 text-[#FFD166] hover:opacity-80 transition w-fit">
            <ShieldCheck size={32} />
            <span className="text-2xl font-bold tracking-widest">SECURE.IT</span>
          </Link>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 uppercase tracking-tight leading-[1.1]">
            Secure <br/>
            Your <br/>
            Horizons
          </h1>
          
          <p className="text-xl font-medium mb-3 text-white">
            Where Enterprise Security Meets Intelligent AI.
          </p>
          
          <p className="text-gray-300 max-w-md text-sm leading-relaxed">
            Embark on a journey where your digital identity is protected by advanced Fuzzy Logic and real-time anomaly detection. Your gateway to a safer ecosystem.
          </p>
        </div>

        {/* SISI KANAN - GLASSMORPHISM FORM */}
        <div className="w-full sm:w-[450px]">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-500">
            
            {/* ALUR 1: FORM LOGIN NORMAL */}
            {loginStep === 'credentials' && (
              <form onSubmit={handleLogin} className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="bg-white/90 text-gray-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-white/90 text-gray-900 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(255,209,102,0.4)] transition flex justify-center items-center gap-2 mt-2 disabled:opacity-70"
                >
                  {isLoading ? 'ANALYZING...' : 'SIGN IN'} <ArrowRight size={18} />
                </button>

                <div className="flex items-center gap-4 my-2">
                  <div className="h-[1px] flex-1 bg-white/20"></div>
                  <span className="text-xs text-gray-400 font-medium uppercase">or</span>
                  <div className="h-[1px] flex-1 bg-white/20"></div>
                </div>

                <div className="text-center mt-2 text-sm text-gray-300">
                  Are you new? <Link href="/register" className="text-[#FFD166] font-bold hover:underline">Create an Account</Link>
                </div>
              </form>
            )}

            {/* ALUR 2: FORM MFA (MUNCUL JIKA SUSPICIOUS) */}
            {loginStep === 'mfa' && (
              <form onSubmit={handleVerifyMFA} className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
                
                <div className="text-center flex flex-col items-center mb-2">
                  <div className="bg-yellow-500/20 p-4 rounded-full mb-4 border border-yellow-500/30">
                    <MailWarning size={36} className="text-[#FFD166]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Security Check</h2>
                  <p className="text-sm text-gray-300">
                    Our AI detected an unusual login pattern. To secure your account, please enter the 6-digit code sent to your registered email.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-white text-center">Verification Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Hanya menerima angka
                    placeholder="000000"
                    className="bg-white/90 text-gray-900 px-4 py-4 rounded-xl text-center text-3xl tracking-[0.5em] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-400"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || otpCode.length < 6}
                  className="w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(255,209,102,0.4)] transition flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:hover:shadow-none"
                >
                  {isLoading ? 'VERIFYING...' : 'VERIFY CODE'} <Shield size={18} />
                </button>

                <div className="flex justify-between items-center mt-2">
                  <button 
                    type="button" 
                    onClick={() => setLoginStep('credentials')}
                    className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                  <button type="button" className="text-xs text-[#FFD166] hover:underline font-medium">
                    Resend Code
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}