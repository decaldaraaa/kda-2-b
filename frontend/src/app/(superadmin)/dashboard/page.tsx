'use client';
import Link from 'next/link'; // Tambahkan ini
import React, { useEffect, useState } from 'react';
import { Search, Bell, ShieldAlert, X, Download, Calendar } from 'lucide-react';
// Ikon navigasi dihapus karena sudah pindah ke layout

export default function Dashboard() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  
  const [dashboardData, setDashboardData] = useState({
    total_logs: 0,
    average_score: 0,
    recent_activities: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // State untuk mengontrol visibilitas Pop-up
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    // RBAC dihapus, sudah diurus oleh layout.tsx
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);

    const fetchStats = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/?q=${encodeURIComponent(debouncedSearch)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Gagal mengambil data analitik", error);
      }
    };

    fetchStats();
    const intervalId = setInterval(fetchStats, 5000);
    return () => clearInterval(intervalId);

  }, [debouncedSearch]); 

  // KONTEN UTAMA LANGSUNG DIMULAI DARI <main>
  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
      <header className="flex justify-between items-center p-8">
        <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 w-1/3 backdrop-blur-md">
          <Search className="text-gray-400 mr-3" size={20} />
          <input 
            type="text" 
            placeholder="Search logs, IPs, or users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-[#E0E1DD] w-full placeholder-gray-500" 
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
            <ShieldAlert size={18} className="text-[#FFD166]" />
            <span className="text-sm font-semibold">System Secure</span>
          </div>
            <Link href="/notifications">
              <button className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition relative">
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0D1B2A]"></div>
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

      <div className="p-8 pt-0 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900/50 to-[#0D1B2A] border border-white/10 p-10 flex items-center justify-between">
            <div className="z-10 w-2/3">
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Monitor <span className="text-[#FFD166]">Authentication</span><br/> Anomalies in Real-Time
              </h1>
              <p className="text-gray-400 mb-8 max-w-md">
                Mesin Fuzzy Logic Mamdani sedang aktif menganalisis pola masuk, mendeteksi perpindahan IP, dan mencegah serangan siber otomatis.
              </p>
                <div className="flex gap-4">
                {/* REVISI: Menghapus onClick modal dan menggantinya dengan navigasi rute */}
                <Link href="/threat-logs">
                  <button className="bg-[#FFD166] text-[#0D1B2A] px-6 py-3 rounded-full font-bold hover:bg-yellow-500 transition">
                    View Full Logs
                  </button>
                </Link>
                <Link href="/threat-logs">
                  <button 
                    className="bg-white/10 border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/20 transition backdrop-blur-md"
                  >
                    Export Report
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#FFD166]/20 rounded-full blur-[80px]"></div>
            <div className="absolute right-20 bottom-10 w-40 h-40 bg-blue-500/30 rounded-full blur-[60px]"></div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Suspicious Activities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {dashboardData.recent_activities.length > 0 ? (
                dashboardData.recent_activities.slice(0, 20).map((act: any, idx: number) => (
                  <LogCard 
                    key={idx}
                    ip={act.ip} 
                    user={act.user} 
                    score={act.score} 
                    status={act.status} 
                    time={act.time} 
                    isDanger={act.status === "Untrusted"} 
                  />
                ))
              ) : (
                <p className="text-gray-500 col-span-3">Belum ada data login yang terekam atau ditemukan...</p>
              )}

            </div>
          </div>
        </div>

        <div className="xl:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-xl">
          <h3 className="text-xl font-bold mb-6">System Health</h3>
          
          <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-[#0D1B2A] to-blue-900/40 border border-[#FFD166]/30 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 rounded-full border-[1px] border-[#FFD166]/20 animate-[spin_4s_linear_infinite]"></div>
               <div className="absolute w-24 h-24 rounded-full border-[1px] border-[#FFD166]/40 animate-[spin_3s_linear_infinite_reverse]"></div>
            </div>
            {/* Menggunakan div placeholder untuk Activity icon agar tidak error karena Activity tidak diimport */}
            <div className="text-[#FFD166] z-10 mb-2 font-bold text-3xl">~</div>
            <p className="z-10 font-bold text-lg text-[#FFD166]">Fuzzy Engine Active</p>
          </div>

          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
            <div>
              <p className="text-sm text-gray-400">Average Trust Score</p>
              <p className="text-3xl font-bold mt-1 text-[#FFD166]">{dashboardData.average_score}<span className="text-lg text-white"> / 100</span></p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
             <div>
               <p className="text-sm text-gray-400">Total Analyzed Logs</p>
               <div className="flex items-center gap-3 mt-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#0D1B2A]"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#0D1B2A]"></div>
                  </div>
                  <span className="font-bold text-xl">{dashboardData.total_logs} <span className="text-sm font-normal text-gray-400">requests</span></span>
               </div>
             </div>
          </div>

          <button className="mt-auto w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-4 rounded-xl hover:bg-yellow-500 transition">
            Run Manual Audit
          </button>
        </div>

      </div>

      {/* MODAL EXPORT REPORT */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0D1B2A] border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl flex flex-col">
            <button onClick={() => setShowExportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-[#FFD166] mb-2">Export Security Data</h2>
            <p className="text-gray-400 text-sm mb-6">Unduh log analisis mesin Fuzzy Logic untuk keperluan audit.</p>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition">
                <Calendar className="text-blue-400" size={24} />
                <div>
                  <h3 className="font-bold">Last 7 Days (PDF)</h3>
                  <p className="text-xs text-gray-400">Executive summary report</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition">
                <Download className="text-green-400" size={24} />
                <div>
                  <h3 className="font-bold">Full Raw Data (CSV)</h3>
                  <p className="text-xs text-gray-400">Seluruh riwayat untuk analisis lanjutan</p>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-3 rounded-xl hover:bg-yellow-500 transition mt-auto">
              Generate Export
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

// Hanya LogCard yang tersisa karena NavItem dipindah ke layout
function LogCard({ ip, user, score, status, time, isDanger = false }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition backdrop-blur-md flex flex-col relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 ${isDanger ? 'bg-red-500 shadow-[0_0_10px_red]' : status === 'Suspicious' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
      
      <div className="flex justify-between items-start mb-4 mt-2">
        <div className="bg-[#0D1B2A] px-3 py-1 rounded-lg text-xs font-mono border border-white/5 text-gray-300">
          {ip}
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${isDanger ? 'bg-red-500/20 text-red-400' : status === 'Suspicious' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
          {time}
        </div>
      </div>
      
      <h3 className="font-bold text-lg truncate mb-1">{user}</h3>
      
      <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-gray-400">Trust Score</p>
          <p className="font-bold text-xl">{score}</p>
        </div>
        <div className={`text-sm font-semibold ${isDanger ? 'text-red-400' : status === 'Suspicious' ? 'text-yellow-400' : 'text-green-400'}`}>
          {status}
        </div>
      </div>
    </div>
  );
}