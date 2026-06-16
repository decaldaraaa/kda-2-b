'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, Users, Shield, UserPlus, MoreVertical, CheckCircle, XCircle, Edit, Trash2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function UserAccess() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);

    // Fungsi fetch untuk mengambil daftar pengguna
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Asumsi: Kita akan membuat endpoint /api/users/ nanti di backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`);
        if (response.ok) {
          const data = await response.json();
          setUsersList(data);
        } else {
          // Fallback dummy data jika endpoint belum ada (untuk visualisasi UI)
          setUsersList([
            { id: 1, username: "kun", email: "kuntohidayat20@gmail.com", role: "ceo", status: "Active", last_login: "17 Jun, 05:30" },
            { id: 2, username: "decal", email: "decal@example.com", role: "employee", status: "Active", last_login: "16 Jun, 22:03" },
            { id: 3, username: "admin_test", email: "admin@example.com", role: "admin", status: "Locked", last_login: "10 Jun, 14:20" }
          ]);
        }
      } catch (error) {
        console.error("Gagal mengambil data pengguna", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter lokal untuk UI pencarian
  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOPBAR KHUSUS USER ACCESS */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Identity & <span className="text-[#FFD166]">Access</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manajemen kredensial dan Role-Based Access Control (RBAC)</p>
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
      <div className="p-8 flex-1 flex flex-col min-h-0 z-10">
        
        {/* Toolbar (Search & Add User) */}
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-1/3 backdrop-blur-md focus-within:border-purple-500/50 transition-colors">
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Cari Username, Email, atau Role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#E0E1DD] w-full text-sm placeholder-gray-500" 
            />
          </div>

          <button className="flex items-center gap-2 bg-[#FFD166] text-[#0D1B2A] border border-[#FFD166] px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition text-sm shadow-[0_0_15px_rgba(255,209,102,0.2)]">
            <UserPlus size={18} />
            Add New User
          </button>
        </div>

        {/* Tabel Data Pengguna */}
        <div className="flex-1 bg-[#050B14]/80 border border-white/10 rounded-2xl flex flex-col relative shadow-2xl backdrop-blur-xl overflow-hidden">
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-[#0A111E] border-b border-white/10 z-10">
                <tr className="text-gray-400 text-xs tracking-wider">
                  <th className="p-5 font-medium">ACCOUNT DETAILS</th>
                  <th className="p-5 font-medium">ROLE (RBAC)</th>
                  <th className="p-5 font-medium">STATUS</th>
                  <th className="p-5 font-medium">LAST ACTIVE</th>
                  <th className="p-5 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        Memuat data pengguna...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      
                      {/* Kolom Detail Akun */}
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#0D1B2A] ${u.role === 'ceo' ? 'bg-[#FFD166]' : u.role === 'admin' ? 'bg-blue-400' : 'bg-gray-400'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.username}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kolom Role */}
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                          u.role === 'ceo' ? 'bg-[#FFD166]/10 text-[#FFD166] border-[#FFD166]/20' : 
                          u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-gray-500/10 text-gray-300 border-gray-500/20'
                        }`}>
                          {u.role === 'ceo' && <Shield size={14} />}
                          {u.role.toUpperCase()}
                        </div>
                      </td>

                      {/* Kolom Status */}
                      <td className="p-5">
                        <div className={`flex items-center gap-2 text-sm font-bold ${u.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                          {u.status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                          {u.status}
                        </div>
                      </td>

                      {/* Kolom Last Active */}
                      <td className="p-5 text-sm text-gray-400">
                        {u.last_login}
                      </td>
                      
                      {/* Kolom Action */}
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-white/10 rounded-lg transition" title="Edit Role">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 border border-white/10 rounded-lg transition" title="Reset Password">
                            <Lock size={16} />
                          </button>
                          <button className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-lg transition" title="Nonaktifkan Akun" disabled={u.role === 'ceo'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center text-gray-500">
                      Pengguna tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Statistik */}
          <div className="p-4 border-t border-white/10 bg-[#0A111E] flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-400">
              Total <span className="text-white font-bold">{usersList.length}</span> akun terdaftar di sistem.
            </span>
          </div>

        </div>
      </div>
    </main>
  );
}