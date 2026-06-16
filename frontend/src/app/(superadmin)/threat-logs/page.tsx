'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, ShieldAlert, Download, AlertTriangle, ShieldCheck, ShieldBan, MoreVertical, ChevronLeft, ChevronRight, Mail, Ban } from 'lucide-react';
import Link from 'next/link';

export default function ThreatLogs() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [logs, setLogs] = useState<any[]>([]);
  
  // State Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState(""); // kosong = Semua Waktu
  const [isLoading, setIsLoading] = useState(true);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State Action Menu
  const [openActionIdx, setOpenActionIdx] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  // Efek Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Data (Otomatis terpanggil jika debouncedSearch atau timeFilter berubah)
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/?q=${encodeURIComponent(debouncedSearch)}`;
        if (timeFilter) {
          url += `&days=${timeFilter}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setLogs(data.recent_activities);
          setCurrentPage(1); // Reset ke halaman 1 setiap kali filter/search berubah
        }
      } catch (error) {
        console.error("Gagal mengambil log ancaman", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [debouncedSearch, timeFilter]);

  // Kalkulasi Pagination
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // FUNGSI 1: Export CSV
  const handleExportCSV = () => {
    const headers = ["TIMESTAMP", "IP ADDRESS", "TARGET ACCOUNT", "FUZZY SCORE", "SECURITY VERDICT"];
    // Mapping data ke format CSV
    const csvData = logs.map(log => `${log.time},${log.ip},${log.user},${log.score},${log.status}`);
    const csvContent = [headers.join(","), ...csvData].join("\n");
    
    // Proses pembuatan file unduhan
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SECURE_IT_ThreatLogs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FUNGSI 4: Simulasi Action
  const handleAction = (actionType: string, user: string, ip: string) => {
    setOpenActionIdx(null); // Tutup menu
    if (actionType === 'warn') {
      setActionMessage(`✅ Email peringatan keamanan sedang dikirim ke ${user}...`);
    } else {
      setActionMessage(`🛑 IP ${ip} telah dimasukkan ke dalam Blacklist Firewall.`);
    }
    
    // Hilangkan notifikasi setelah 3 detik
    setTimeout(() => setActionMessage(""), 3000);
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* POPUP NOTIFIKASI ACTION (Muncul jika ada aksi) */}
      {actionMessage && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#0D1B2A] border border-[#FFD166]/50 text-[#FFD166] px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,209,102,0.2)] z-50 flex items-center gap-3 animate-bounce">
          <ShieldAlert size={20} />
          <span className="font-bold text-sm">{actionMessage}</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">System <span className="text-[#FFD166]">Threat Logs</span></h1>
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
        
        {/* Toolbar (Search, Filter Waktu, Export) */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center gap-4 w-2/3">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-1/2 backdrop-blur-md">
              <Search className="text-gray-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Cari IP, Akun, atau Status..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[#E0E1DD] w-full text-sm placeholder-gray-500" 
              />
            </div>
            
            {/* FUNGSI 3: Dropdown Filter Waktu */}
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-[#E0E1DD] outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23E0E1DD%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7em top 50%', backgroundSize: '.65em auto', paddingRight: '2.5em' }}
            >
              <option value="" className="bg-[#0D1B2A]">Semua Waktu</option>
              <option value="1" className="bg-[#0D1B2A]">24 Jam Terakhir</option>
              <option value="7" className="bg-[#0D1B2A]">7 Hari Terakhir</option>
              <option value="30" className="bg-[#0D1B2A]">30 Hari Terakhir</option>
              <option value="365" className="bg-[#0D1B2A]">1 Tahun Terakhir</option>
            </select>
          </div>

          {/* FUNGSI 1: Tombol Export */}
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition text-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
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
              <tbody className="divide-y divide-white/5 pb-20">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-[#FFD166] border-t-transparent rounded-full animate-spin mb-4"></div>
                        Memuat data forensik...
                      </div>
                    </td>
                  </tr>
                ) : currentLogs.length > 0 ? (
                  currentLogs.map((log: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group relative">
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
                      
                      {/* FUNGSI 4: Menu Action */}
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => setOpenActionIdx(openActionIdx === idx ? null : idx)}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Dropdown Menu (Muncul jika diklik) */}
                        {openActionIdx === idx && (
                          <div className="absolute right-12 mt-2 w-48 bg-[#0A111E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
                            <button 
                              onClick={() => handleAction('warn', log.user, log.ip)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition text-left"
                            >
                              <Mail size={16} className="text-blue-400" /> Kirim Warning
                            </button>
                            <button 
                              onClick={() => handleAction('block', log.user, log.ip)}
                              className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition border-t border-white/5 text-left"
                            >
                              <Ban size={16} /> Block IP Gateway
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-gray-500">
                      Tidak ada log yang ditemukan untuk filter/pencarian tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FUNGSI 2: Pagination Footer */}
          <div className="p-4 border-t border-white/10 bg-[#0A111E] flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-400">
              Menampilkan {logs.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, logs.length)} dari {logs.length} log
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 disabled:opacity-30 transition"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button className="px-4 py-1.5 rounded-lg bg-[#FFD166] text-[#0D1B2A] font-bold text-sm">
                Hal {currentPage} / {totalPages || 1}
              </button>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 disabled:opacity-30 transition"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}