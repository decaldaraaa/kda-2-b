'use client';
import React, { useEffect, useState } from 'react';
import { Bell, Settings, Shield, Server, Mail, Save, Sliders, Key, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [activeTab, setActiveTab] = useState("security");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // State untuk parameter sistem
  const [settings, setSystemSettings] = useState({
    fuzzyThreshold: 70, // Batas minimum skor Trusted
    maxFailedAttempts: 3,
    cooldownHours: 1,
    jwtExpiry: 24,
    enableMFA: true,
    emailAlerts: true,
    strictMode: false
  });

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSystemSettings(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulasi penyimpanan ke backend API
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage("Konfigurasi sistem berhasil diperbarui!");
      setTimeout(() => setSaveMessage(""), 4000);
    }, 1500);
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-[30%] right-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* NOTIFIKASI SIMPAN */}
      {saveMessage && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#0D1B2A] border border-green-500/50 text-green-400 px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3">
          <CheckCircle size={20} />
          <span className="font-bold text-sm">{saveMessage}</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Settings size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              System <span className="text-[#FFD166]">Settings</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Konfigurasi mesin Fuzzy Logic dan parameter keamanan global</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/notifications">
            <button className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition relative">
              <Bell size={20} />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFD166] to-orange-500 border-2 border-[#0D1B2A]"></div>
            <div className="hidden md:block text-sm">
              <p className="text-[#FFD166] text-xs font-bold">CEO / SuperAdmin</p>
              <p className="font-medium">{adminName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="p-8 flex-1 flex min-h-0 z-10 gap-8">
        
        {/* Navigasi Tab Kiri */}
        <div className="w-64 shrink-0 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition text-sm ${activeTab === 'security' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Shield size={18} className={activeTab === 'security' ? 'text-emerald-400' : ''} />
            Security & Fuzzy
          </button>
          <button 
            onClick={() => setActiveTab('session')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition text-sm ${activeTab === 'session' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Clock size={18} className={activeTab === 'session' ? 'text-blue-400' : ''} />
            Session Limits
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold transition text-sm ${activeTab === 'notifications' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <Mail size={18} className={activeTab === 'notifications' ? 'text-yellow-400' : ''} />
            Alerts & Email
          </button>
        </div>

        {/* Area Konten Tab Kanan */}
        <div className="flex-1 bg-[#050B14]/80 border border-white/10 rounded-3xl p-8 overflow-y-auto shadow-2xl backdrop-blur-xl relative">
          
          {activeTab === 'security' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <Sliders className="text-emerald-400" /> Fuzzy Engine Parameters
              </h2>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Trusted Threshold Score</label>
                  <p className="text-xs text-gray-500 mb-4">Skor minimum dari FIS Mamdani agar login dianggap aman tanpa OTP.</p>
                  <div className="flex items-center gap-4">
                    <input type="range" name="fuzzyThreshold" min="50" max="95" value={settings.fuzzyThreshold} onChange={handleChange} className="w-full accent-[#FFD166]" />
                    <span className="font-mono bg-[#0D1B2A] px-3 py-1 rounded-lg text-[#FFD166] font-bold border border-white/10">{settings.fuzzyThreshold}</span>
                  </div>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <label className="block text-sm font-bold text-gray-300 mb-2">Max Failed Attempts</label>
                  <p className="text-xs text-gray-500 mb-4">Jumlah kegagalan sebelum skor anomali dikalikan secara eksponensial.</p>
                  <input type="number" name="maxFailedAttempts" value={settings.maxFailedAttempts} onChange={handleChange} className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFD166]/50" />
                </div>
              </div>

              <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2 mt-8">
                <Shield className="text-emerald-400" /> Global Security Policies
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div>
                    <h3 className="font-bold text-gray-200">Strict Mode (Zero-Trust)</h3>
                    <p className="text-xs text-gray-500 mt-1">Hanya percayai IP internal kampus/kantor. Tolak otomatis semua VPN & Proxy.</p>
                  </div>
                  <Toggle switch={settings.strictMode} onClick={() => handleToggle('strictMode')} />
                </div>

                <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div>
                    <h3 className="font-bold text-gray-200">Force Multi-Factor Authentication (MFA)</h3>
                    <p className="text-xs text-gray-500 mt-1">Wajibkan OTP Email untuk semua pengguna berstatus Admin dan CEO.</p>
                  </div>
                  <Toggle switch={settings.enableMFA} onClick={() => handleToggle('enableMFA')} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'session' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <Key className="text-blue-400" /> Session Management
              </h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <label className="block text-sm font-bold text-gray-300 mb-2">JWT Token Expiry (Hours)</label>
                  <p className="text-xs text-gray-500 mb-4">Batas waktu sesi login. Pengguna harus login ulang setelah durasi ini habis.</p>
                  <input type="number" name="jwtExpiry" value={settings.jwtExpiry} onChange={handleChange} className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                  <label className="block text-sm font-bold text-gray-300 mb-2">IP Cooldown Window (Hours)</label>
                  <p className="text-xs text-gray-500 mb-4">Waktu yang dibutuhkan sistem untuk memaafkan log kegagalan (*Time Decay*).</p>
                  <input type="number" name="cooldownHours" value={settings.cooldownHours} onChange={handleChange} className="w-full bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-3 text-white outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex items-center gap-2">
                <Server className="text-yellow-400" /> System Alerts
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div>
                    <h3 className="font-bold text-gray-200">Critical Threat Alerts</h3>
                    <p className="text-xs text-gray-500 mt-1">Kirim email langsung ke CEO jika terjadi serangan Brute-Force tingkat tinggi.</p>
                  </div>
                  <Toggle switch={settings.emailAlerts} onClick={() => handleToggle('emailAlerts')} />
                </div>
              </div>
            </div>
          )}

          {/* Tombol Simpan Mengambang di Bawah */}
          <div className="absolute bottom-8 left-8">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-[#FFD166] text-[#0D1B2A] px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition shadow-[0_0_20px_rgba(255,209,102,0.3)] disabled:opacity-70"
            >
              {isSaving ? <div className="w-5 h-5 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}
              {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

// Komponen UI Toggle Switch Reusable
function Toggle({ switch: isOn, onClick }: { switch: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick} 
      className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isOn ? 'bg-emerald-500' : 'bg-gray-700'}`}
    >
      <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-7' : 'translate-x-0'}`}></div>
    </div>
  );
}