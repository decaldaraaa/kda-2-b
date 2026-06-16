'use client';
import React, { useEffect, useState } from 'react';
import { ShieldCheck, LogOut, User } from 'lucide-react';

export default function UserDashboard() {
  const [username, setUsername] = useState("Employee");
  const [userIp, setUserIp] = useState("Loading IP...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Client-side Guard (Kelemahan: Mudah bypass, tapi berguna untuk UX)
    const role = localStorage.getItem("user_role");
    const token = localStorage.getItem("access_token");
    
    if (!token || role !== "employee") {
      window.location.href = "/login";
      return;
    }

    const storedName = localStorage.getItem("username");
    if (storedName) {
      setUsername(storedName);
    }

    // 2. Mengambil IP Pengguna secara Dinamis
    // Di produksi, ganti URL ini dengan endpoint Backend Anda untuk validasi Fuzzy Logic
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        setUserIp(data.ip);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal mengambil IP:", err);
        setUserIp("Gagal mendeteksi IP");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("username"); // Bersihkan username saat logout
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-white">
        <p className="animate-pulse">Memuat data keamanan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans p-8">
      
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
            <User size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {username}</h1>
            <p className="text-gray-400 text-sm">Personal Security Status</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-xl hover:bg-red-500/20 transition">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center mb-6">
            <ShieldCheck size={48} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account is Secure</h2>
          <p className="text-gray-400 mb-6">
            Sistem Fuzzy Logic tidak mendeteksi adanya aktivitas login yang mencurigakan dari akun Anda akhir-akhir ini.
          </p>
          <div className="w-full bg-[#0D1B2A] rounded-xl p-4 text-left">
             <p className="text-sm text-gray-400">Current Login IP</p>
             <p className="font-mono text-lg text-[#FFD166]">{userIp}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
           <h3 className="text-xl font-bold mb-6">Recent Activity Logs</h3>
           <div className="space-y-4">
              <div className="border-l-2 border-green-500 pl-4 py-1">
                 <p className="font-bold text-sm">Login Success</p>
                 <p className="text-xs text-gray-500">Today • {userIp}</p>
              </div>
              <div className="border-l-2 border-green-500 pl-4 py-1">
                 <p className="font-bold text-sm">Session Verified</p>
                 <p className="text-xs text-gray-500">Fuzzy Logic Score: Safe</p>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}