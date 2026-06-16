'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, Radio, ArrowRight, ShieldCheck, ShieldBan, ShieldAlert, Activity } from 'lucide-react';
import Link from 'next/link';

export default function LiveTraffic() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // RBAC dihapus dari sini karena sudah ditangani oleh layout.tsx
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);

    const fetchTraffic = async () => {
      if (!isLive) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard-stats/`);
        if (response.ok) {
          const data = await response.json();
          setTrafficData(data.recent_activities);
        }
      } catch (error) {
        console.error("Gagal mengambil live traffic", error);
      }
    };

    fetchTraffic();
    const intervalId = setInterval(fetchTraffic, 3000);
    return () => clearInterval(intervalId);
  }, [isLive]);

  // handleLogout juga dihapus karena sudah ada di layout.tsx

  // LANGSUNG RETURN MAIN CONTENT
  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      {/* Glow Effects Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* TOPBAR KHUSUS LIVE TRAFFIC */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Network <span className="text-[#FFD166]">Traffic</span>
          </h1>
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

        {/* TRAFFIC CONTENT */}
        <div className="p-8 pt-0 flex-1 flex flex-col min-h-0 z-10">
          
          {/* Toolbar Control */}
          <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isLive ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-gray-800 text-gray-400 border border-gray-600'}`}
              >
                <Radio size={16} className={isLive ? "animate-pulse" : ""} />
                {isLive ? 'LIVE FEED ACTIVE' : 'FEED PAUSED'}
              </button>
              <span className="text-gray-400 text-sm hidden md:block">| Memantau arus data masuk dari gateway FastAPI</span>
            </div>
            
            <div className="flex items-center bg-[#0D1B2A] border border-white/10 rounded-full px-4 py-2 w-64">
              <Search className="text-gray-400 mr-2" size={16} />
              <input type="text" placeholder="Filter stream..." className="bg-transparent border-none outline-none text-[#E0E1DD] w-full text-sm placeholder-gray-500" />
            </div>
          </div>

          {/* Terminal-style Data Stream */}
          <div className="flex-1 bg-[#050B14] border border-white/10 rounded-2xl overflow-hidden flex flex-col relative shadow-2xl">
            {/* Header Tabel */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-xs font-bold text-gray-400 tracking-wider shrink-0">
              <div className="col-span-2">TIMESTAMP</div>
              <div className="col-span-3">IP ADDRESS</div>
              <div className="col-span-2">TARGET USER</div>
              <div className="col-span-2">FUZZY SCORE</div>
              <div className="col-span-3">VERDICT</div>
            </div>

            {/* Isi Stream (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2 font-mono text-sm">
              {trafficData.length > 0 ? (
                trafficData.map((log: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 p-3 mb-1 rounded-lg hover:bg-white/5 transition-colors items-center group">
                    <div className="col-span-2 text-gray-500 text-xs">
                      {log.time}
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <ArrowRight size={14} className="text-[#FFD166] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-blue-300">{log.ip}</span>
                    </div>
                    <div className="col-span-2 text-gray-300">
                      {log.user}
                    </div>
                    <div className="col-span-2">
                      <span className="bg-white/10 px-2 py-1 rounded text-[#FFD166] font-bold">
                        {log.score}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      {log.status === 'Trusted' && <ShieldCheck size={16} className="text-green-500" />}
                      {log.status === 'Suspicious' && <ShieldAlert size={16} className="text-yellow-500" />}
                      {log.status === 'Untrusted' && <ShieldBan size={16} className="text-red-500" />}
                      
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        log.status === 'Trusted' ? 'text-green-400 bg-green-500/10' : 
                        log.status === 'Suspicious' ? 'text-yellow-400 bg-yellow-500/10' : 
                        'text-red-400 bg-red-500/10'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p>Mendengarkan jaringan... Belum ada lalu lintas baru.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}