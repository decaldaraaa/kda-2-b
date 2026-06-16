'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, ShieldAlert, Filter, Download, AlertTriangle, ShieldCheck, ShieldBan, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function ThreatLogs() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [logs, setLogs] = useState<any[]>([]);
  
  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Efek Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Data
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/?q=${encodeURIComponent(debouncedSearch)}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Kita asumsikan endpoint yang sama mengembalikan recent_activities
          setLogs(data.recent_activities);
        }
      } catch (error) {
        console.error("Gagal mengambil log ancaman", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [debouncedSearch]);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOPBAR KHUSUS THREAT LOGS */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              System <span className="text-[#FFD166]">Threat Logs</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Audit forensik dan riwayat autentikasi menyeluruh</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
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

      {/* CONTENT AREA */}
      <div className="p-8 flex-1 flex flex-col min-h-0 z-10">
        
        {/* Toolbar (Search & Actions) */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4 w-1/2">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full backdrop-blur-md focus-within:border-[#FFD166]/50 transition-colors">
              <Search className="text-gray-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Cari IP Address, Username, atau Status (Cth: Suspicious)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[#E0E1DD] w-full text-sm placeholder-gray-500" 
              />
            </div>
            <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white flex items-center gap-2">
              <Filter size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition text-sm">
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tabel Data Forensik */}
        <div className="flex-1 bg-[#050B14]/80 border border-white/10 rounded-2xl flex flex-col relative shadow-2xl backdrop-blur-xl overflow-hidden">
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#0A111E] border-b border-white/10 z-10">
                <tr className="text-gray-400 text-xs tracking-wider">
                  <th className="p-5 font-medium">TIMESTAMP</th>
                  <th className="p-5 font-medium">IP ADDRESS</th>
                  <th className="p-5 font-medium">TARGET ACCOUNT</th>
                  <th className="p-5 font-medium">FUZZY SCORE</th>
                  <th className="p-5 font-medium">SECURITY VERDICT</th>
                  <th className="p-5 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#FFD166] border-t-transparent rounded-full animate-spin mb-4"></div>
                        Memuat data forensik...
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5 text-sm text-gray-300">{log.time}</td>
                      <td className="p-5 text-sm font-mono text-blue-300">{log.ip}</td>
                      <td className="p-5 text-sm font-bold">{log.user}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white w-6">{log.score}</span>
                          <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${log.score >= 70 ? 'bg-green-500' : log.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.max(0, Math.min(100, log.score))}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                          log.status === 'Trusted' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          log.status === 'Suspicious' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {log.status === 'Trusted' && <ShieldCheck size={14} />}
                          {log.status === 'Suspicious' && <AlertTriangle size={14} />}
                          {log.status === 'Untrusted' && <ShieldBan size={14} />}
                          {log.status.toUpperCase()}
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition opacity-0 group-hover:opacity-100">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-500">
                      Tidak ada log yang ditemukan untuk pencarian tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer (Visual Only untuk saat ini) */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-400">Menampilkan {logs.length} hasil terbaru</span>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 transition cursor-not-allowed opacity-50">
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#FFD166] text-[#0D1B2A] font-bold text-sm">1</button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">2</button>
              <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">3</button>
              <span className="text-gray-500 px-2">...</span>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}