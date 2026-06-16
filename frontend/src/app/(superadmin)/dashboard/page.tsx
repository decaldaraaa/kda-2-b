'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, Grid, Activity, ShieldAlert, Users, Settings, LogOut, X, Download, Calendar } from 'lucide-react';

export default function Dashboard() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  
  const [dashboardData, setDashboardData] = useState({
    total_logs: 0,
    average_score: 0,
    recent_activities: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const role = localStorage.getItem("user_role");
    if (role !== "ceo") {
      window.location.href = "/login"; 
    }

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

  // State untuk mengontrol visibilitas Pop-up
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] flex font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-24 lg:w-64 border-r border-white/10 flex flex-col items-center lg:items-start py-8 px-4 bg-white/5 backdrop-blur-xl">
        <div className="text-[#FFD166] font-bold text-2xl mb-12 hidden lg:block px-4 tracking-widest">
          SECURE.IT
        </div>
        <div className="text-[#FFD166] font-bold text-2xl mb-12 lg:hidden">
          S.IT
        </div>

        <nav className="flex flex-col gap-6 w-full">
          <NavItem icon={<Grid size={24} />} label="Dashboard" active />
          <NavItem icon={<Activity size={24} />} label="Live Traffic" />
          <NavItem icon={<ShieldAlert size={24} />} label="Threat Logs" />
          <NavItem icon={<Users size={24} />} label="User Access" />
          <NavItem icon={<Settings size={24} />} label="Settings" />
        </nav>

        <div className="mt-auto w-full">
          <NavItem icon={<LogOut size={24} />} label="Logout" onClick={handleLogout} />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
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
            <button className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition">
              <Bell size={20} />
            </button>
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
                  <button 
                    onClick={() => setShowLogsModal(true)} 
                    className="bg-[#FFD166] text-[#0D1B2A] px-6 py-3 rounded-full font-bold hover:bg-yellow-500 transition"
                  >
                    View Full Logs
                  </button>
                  <button 
                    onClick={() => setShowExportModal(true)} 
                    className="bg-white/10 border border-white/20 px-6 py-3 rounded-full font-bold hover:bg-white/20 transition backdrop-blur-md"
                  >
                    Export Report
                  </button>
                </div>
              </div>
              <div className="absolute right-0 top-0 w-64 h-64 bg-[#FFD166]/20 rounded-full blur-[80px]"></div>
              <div className="absolute right-20 bottom-10 w-40 h-40 bg-blue-500/30 rounded-full blur-[60px]"></div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Recent Suspicious Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {dashboardData.recent_activities.length > 0 ? (
                  dashboardData.recent_activities.map((act: any, idx: number) => (
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
              <Activity size={48} className="text-[#FFD166] z-10 mb-2" />
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
      </main>

      {/* ================= MODAL EXPORT REPORT (SEKARANG ADA DI DALAM DASHBOARD SCOPE) ================= */}
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

      {/* ================= MODAL VIEW FULL LOGS (SEKARANG ADA DI DALAM DASHBOARD SCOPE) ================= */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0D1B2A] border border-white/10 rounded-3xl w-full max-w-5xl h-[80vh] p-6 relative shadow-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">System <span className="text-[#FFD166]">Threat Logs</span></h2>
              <button onClick={() => setShowLogsModal(false)} className="text-gray-400 hover:text-white transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-gray-400 text-sm border-b border-white/10">
                     <th className="pb-3 font-medium">TIMESTAMP</th>
                     <th className="pb-3 font-medium">IP ADDRESS</th>
                     <th className="pb-3 font-medium">USERNAME</th>
                     <th className="pb-3 font-medium">TRUST SCORE</th>
                     <th className="pb-3 font-medium">STATUS</th>
                   </tr>
                 </thead>
                 <tbody>
                   {dashboardData.recent_activities.map((log: any, idx: number) => (
                     <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                       <td className="py-4 text-sm text-gray-300">{log.time}</td>
                       <td className="py-4 text-sm font-mono">{log.ip}</td>
                       <td className="py-4 text-sm font-bold">{log.user}</td>
                       <td className="py-4 text-sm font-bold text-[#FFD166]">{log.score}</td>
                       <td className="py-4 text-sm">
                         <span className={`px-2 py-1 rounded-md text-xs font-bold ${log.status === 'Untrusted' ? 'bg-red-500/20 text-red-400' : log.status === 'Suspicious' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                           {log.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}