'use client';
import React, { useEffect, useState } from 'react';
import { LogOut, User, Film, BarChart2, Star, TrendingUp, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';

// 1. Penyesuaian Interface yang Selaras dengan Kolom Database Riil
interface MovieData {
  movie: string;
  avg_rating: number;
  avg_sentiment: number;
  klasifikasi: string;
}

export default function SentimentDashboard() {
  const [username, setUsername] = useState("Tim Data Mining");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [movieData, setMovieData] = useState<MovieData[]>([]);

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);

    // 2. Simulasi Ingest Data Riil dari Hasil Query Database Analitik Anda
    const fetchData = () => {
      const realDatabaseRows: MovieData[] = [
        { movie: "After Life (2019– )", avg_rating: 8.996478873, avg_sentiment: 0.8415492958, klasifikasi: "Hits" },
        { movie: "The Valhalla Murders (2019– )", avg_rating: 5.925531915, avg_sentiment: 0.4042553191, klasifikasi: "Average" },
        { movie: "Special OPS (2020– )", avg_rating: 8.708624709, avg_sentiment: 0.8275058275, klasifikasi: "Hits" },
        { movie: "#BlackAF (2020– )", avg_rating: 7.181818182, avg_sentiment: 0.6363636364, klasifikasi: "Hits" },
        { movie: "The Droving (2020)", avg_rating: 6.928571429, avg_sentiment: 0.7619047619, klasifikasi: "Hits" },
        { movie: "All About Eve (1950)", avg_rating: 8.850000000, avg_sentiment: 0.8500000000, klasifikasi: "Hits" }
      ];
      
      setMovieData(realDatabaseRows);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  // 3. Logika Pemfilteran dan Pencarian Data Secara Real-Time
  const filteredMovies = movieData.filter(item => {
    const matchesSearch = item.movie.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterClass === "All" || item.klasifikasi === filterClass;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-[#E0E1DD]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Menghubungkan ke Database Analitik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans p-8">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {username}</h1>
            <p className="text-gray-400 text-sm">IMDb Real-Time Sentiment Evaluation Dashboard</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-5 py-2.5 rounded-xl hover:bg-red-500/20 transition font-medium">
          <LogOut size={18} /> Exit System
        </button>
      </header>

      {/* METRICS SUMMARY */}
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
            <BarChart2 size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Indexed Movies</p>
            <h3 className="text-3xl font-bold text-white">{movieData.length} Film</h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5">
          <div className="p-4 bg-green-500/20 text-green-400 rounded-xl">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Model Classifier Base</p>
            <h3 className="text-3xl font-bold text-white">SVM + Bagging</h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5">
          <div className="p-4 bg-yellow-500/20 text-yellow-400 rounded-xl">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Uncertainty Data Area</p>
            <h3 className="text-3xl font-bold text-white">Active Evaluation</h3>
          </div>
        </div>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari judul film..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="text-gray-400" size={18} />
          <select 
            value={filterClass} 
            onChange={(e) => setFilterClass(e.target.value)}
            className="bg-[#0D1B2A] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="All">Semua Klasifikasi</option>
            <option value="Hits">Hits</option>
            <option value="Average">Average</option>
            <option value="Flop">Flop</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Film className="text-blue-400" size={28} /> Database Mining Query Result
          </h2>
          <span className="text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-1.5 rounded-full uppercase tracking-wider">
            Connected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                <th className="pb-4 px-4 font-medium">Movie Title</th>
                <th className="pb-4 px-4 font-medium">Avg Rating (Numerical)</th>
                <th className="pb-4 px-4 font-medium">Avg Sentiment Score</th>
                <th className="pb-4 px-4 font-medium">Business Classification</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.length > 0 ? (
                filteredMovies.map((item, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/[0.07] transition duration-200">
                    <td className="py-5 px-4 font-bold text-white">{item.movie}</td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Star size={16} className="text-yellow-400" fill="currentColor" />
                        <span className="font-semibold text-lg">{item.avg_rating.toFixed(4)}</span>
                        <span className="text-gray-500 text-sm">/10</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono text-lg font-bold ${item.avg_sentiment >= 0.5 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {item.avg_sentiment.toFixed(4)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(item.avg_sentiment * 100).toFixed(1)}% Positif)
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                        item.klasifikasi === 'Hits' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        item.klasifikasi === 'Flop' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {item.klasifikasi}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Tidak ada data film yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}