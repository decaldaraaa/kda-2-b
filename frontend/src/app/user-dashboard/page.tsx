'use client';
import React, { useEffect, useState } from 'react';
import { LogOut, User, Film, BarChart2, Star, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

// Mendefinisikan tipe data untuk film (opsional namun sangat disarankan di TypeScript)
interface MovieData {
  id: string;
  title: string;
  rating: number;
  category: string;
  sentiment: string;
}

export default function SentimentDashboard() {
  const [username, setUsername] = useState("Tim Data Mining");
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState<MovieData[]>([]);

  useEffect(() => {
    // 1. Validasi Sesi (Opsional, dipertahankan dari template sebelumnya)
    const storedName = localStorage.getItem("username");
    if (storedName) setUsername(storedName);

    // 2. Simulasi Fetch API dari Backend AI (Flask/FastAPI Python Anda)
    // Di deployment asli, data ini didapatkan dari hasil prediksi model SVM/Random Forest
    setTimeout(() => {
      setMovieData([
        { id: "rw0983001", title: "Last Tango in Paris", rating: 6, category: "Average", sentiment: "Positif" },
        { id: "rw0983002", title: "The Room (2003)", rating: 3, category: "Flop", sentiment: "Negatif" },
        { id: "rw0983003", title: "The Dark Knight", rating: 9, category: "Hits", sentiment: "Positif" },
        { id: "rw0983004", title: "Twilight", rating: 5, category: "Average", sentiment: "Negatif" },
        { id: "rw0983005", title: "Inception", rating: 8, category: "Hits", sentiment: "Positif" },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const handleLogout = () => {
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center text-[#E0E1DD]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="animate-pulse">Menyiapkan Model Machine Learning...</p>
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
            <p className="text-gray-400 text-sm">IMDb Sentiment Analytics System</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-400 px-5 py-2.5 rounded-xl hover:bg-red-500/20 transition font-medium">
          <LogOut size={18} /> Exit System
        </button>
      </header>

      {/* SUMMARY CARDS (Untuk Nilai Jual Presentasi) */}
      <div className="grid md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-10">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5 hover:bg-white/10 transition">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
            <BarChart2 size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Data Analyzed</p>
            <h3 className="text-3xl font-bold text-white">197,000</h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5 hover:bg-white/10 transition">
          <div className="p-4 bg-green-500/20 text-green-400 rounded-xl">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Best Model Performer</p>
            <h3 className="text-3xl font-bold text-white">SVM <span className="text-lg text-green-400 font-medium ml-1">(92.4%)</span></h3>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex items-center gap-5 hover:bg-white/10 transition">
          <div className="p-4 bg-yellow-500/20 text-yellow-400 rounded-xl">
            <AlertCircle size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Average Category Analysis</p>
            <h3 className="text-3xl font-bold text-white">Active</h3>
          </div>
        </div>
      </div>

      {/* DATA TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Film className="text-blue-400" size={28} /> Recent Classification Results
          </h2>
          <span className="text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5 rounded-full uppercase tracking-wider">
            Live Prediction
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                <th className="pb-4 px-4 font-medium">Review ID</th>
                <th className="pb-4 px-4 font-medium">Movie Title</th>
                <th className="pb-4 px-4 font-medium">Rating</th>
                <th className="pb-4 px-4 font-medium">Business Category</th>
                <th className="pb-4 px-4 font-medium">Predicted Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {movieData.map((movie, index) => (
                <tr key={index} className="border-b border-white/5 hover:bg-white/[0.07] transition duration-200">
                  <td className="py-5 px-4 font-mono text-sm text-gray-400">{movie.id}</td>
                  <td className="py-5 px-4 font-bold text-white">{movie.title}</td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={16} className="text-yellow-400" fill="currentColor" />
                      <span className="font-semibold text-lg">{movie.rating}</span>
                      <span className="text-gray-500 text-sm">/10</span>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                      movie.category === 'Hits' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      movie.category === 'Flop' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {movie.category}
                    </span>
                  </td>
                  <td className="py-5 px-4">
                    <span className={`flex items-center gap-2 font-bold ${
                      movie.sentiment === 'Positif' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {movie.sentiment === 'Positif' ? <TrendingUp size={20} /> : <TrendingUp size={20} className="rotate-180" />}
                      {movie.sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}