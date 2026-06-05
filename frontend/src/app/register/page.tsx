'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // State baru untuk email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Password tidak cocok! Silakan periksa kembali.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }) 
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        alert("Registrasi berhasil! Silakan Sign In.");
        window.location.href = "/login";
      } else {
        // Menangani format error dari Pydantic FastAPI
        const errorMessage = typeof data.detail === 'object' 
          ? JSON.stringify(data.detail, null, 2) 
          : data.detail;
          
        alert(`Gagal: \n${errorMessage}`);
      }
    } catch (error) {
      setIsLoading(false);
      alert("Tidak dapat terhubung ke server Backend.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden font-sans">
      
      {/* BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('konoha1.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A]/90 via-[#0D1B2A]/70 to-[#0D1B2A]/40 backdrop-blur-[2px]"></div>
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
            Join <br/>
            The <br/>
            Future
          </h1>
          
          <p className="text-xl font-medium mb-3 text-white">
            Create your secure digital identity today.
          </p>
          
          <p className="text-gray-300 max-w-md text-sm leading-relaxed">
            By creating an account, you gain access to our advanced Fuzzy Logic protection ecosystem. Your credentials will be heavily encrypted and shielded from modern cyber threats.
          </p>
        </div>

        {/* SISI KANAN - GLASSMORPHISM FORM REGISTER */}
        <div className="w-full sm:w-[450px]">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              
              {/* Input Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  className="bg-white/90 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                  required
                />
              </div>

              {/* Input Email (BARU) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-white/90 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                  required
                />
              </div>

              {/* Input Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-white">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="bg-white/90 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                  required
                />
              </div>

              {/* Input Confirm Password */}
              <div className="flex flex-col gap-1.5 mb-2">
                <label className="text-sm font-medium text-white">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="bg-white/90 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition placeholder-gray-500"
                  required
                />
              </div>

              {/* Tombol Register */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-3.5 rounded-xl hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(255,209,102,0.4)] transition flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:shadow-none"
              >
                {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'} <UserPlus size={18} />
              </button>

              {/* Link Kembali ke Login */}
              <div className="text-center mt-3 text-sm text-gray-300">
                Already have an account? <Link href="/login" className="text-[#FFD166] font-bold hover:underline">Sign In here</Link>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}