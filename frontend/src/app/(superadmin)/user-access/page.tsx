'use client';
import React, { useEffect, useState } from 'react';
import { Search, Bell, Users, Shield, UserPlus, CheckCircle, XCircle, Edit, Trash2, Lock, X, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function UserAccess() {
  const [adminName, setAdminName] = useState("SuperAdmin");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // States untuk Modals & Actions
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/`);
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (error) {
      console.error("Gagal mengambil data pengguna", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) setAdminName(storedName);
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. ACTION: Edit Role
  const handleUpdateRole = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_role: newRole })
      });
      if (res.ok) {
        setAlertMessage(`✅ Role ${selectedUser.username} berhasil diubah menjadi ${newRole}`);
        setIsEditRoleOpen(false);
        fetchUsers(); // Refresh data
      }
    } catch (error) {
      setAlertMessage("❌ Gagal merubah role.");
    }
    setTimeout(() => setAlertMessage(""), 4000);
  };

  // 2. ACTION: Reset Password
  const handleResetPassword = async (user: any) => {
    if(!confirm(`Anda yakin ingin me-reset sandi akun ${user.username}?`)) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/reset-password`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Untuk keperluan demo, kita tampilkan sandi baru di alert
        alert(`SUKSES RESET SANDI!\n\nUser: ${user.username}\nSandi Baru: ${data.new_password}\n\nPastikan untuk mencatatnya.`);
      }
    } catch (error) {
      alert("Gagal mereset sandi");
    }
  };

  // 3. ACTION: Delete Account
  const handleDeleteUser = async (user: any) => {
    if(user.role === 'ceo') {
      alert("Akses ditolak: Tidak dapat menghapus akun CEO.");
      return;
    }
    if(!confirm(`PERINGATAN!\n\nMenghapus ${user.username} akan menghapus seluruh riwayat log yang terkait. Anda yakin?`)) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        setAlertMessage(`🛑 Akun ${user.username} telah dihapus permanen.`);
        fetchUsers();
      }
    } catch (error) {
      alert("Gagal menghapus akun");
    }
    setTimeout(() => setAlertMessage(""), 4000);
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
      <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* NOTIFIKASI */}
      {alertMessage && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-[#0D1B2A] border border-[#FFD166]/50 text-[#FFD166] px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3">
          <span className="font-bold text-sm">{alertMessage}</span>
        </div>
      )}

      {/* MODAL EDIT ROLE */}
      {isEditRoleOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0D1B2A] border border-white/10 rounded-3xl w-full max-w-sm p-6 relative shadow-2xl flex flex-col">
            <button onClick={() => setIsEditRoleOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-[#FFD166] mb-2">Edit Role (RBAC)</h2>
            <p className="text-gray-400 text-sm mb-6">Ubah hak akses untuk akun <strong>{selectedUser.username}</strong>.</p>
            
            <select 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-[#FFD166] w-full outline-none"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="ceo">CEO</option>
            </select>
            
            <button onClick={handleUpdateRole} className="w-full bg-[#FFD166] text-[#0D1B2A] font-bold py-3 rounded-xl hover:bg-yellow-500">
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* TOPBAR */}
      <header className="flex justify-between items-center p-8 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Identity & <span className="text-[#FFD166]">Access</span></h1>
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
        <div className="flex justify-between items-center mb-6 shrink-0">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-1/3 backdrop-blur-md">
            <Search className="text-gray-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Cari Username, Email, atau Role..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[#E0E1DD] w-full text-sm placeholder-gray-500" 
            />
          </div>
          <button className="flex items-center gap-2 bg-[#FFD166] text-[#0D1B2A] border border-[#FFD166] px-5 py-3 rounded-xl font-bold hover:bg-yellow-500 transition text-sm">
            <UserPlus size={18} /> Add New User
          </button>
        </div>

        {/* Tabel Data */}
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
                      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      Memuat data pengguna...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#0D1B2A] ${u.role === 'CEO' || u.role === 'ceo' ? 'bg-[#FFD166]' : u.role === 'admin' ? 'bg-blue-400' : 'bg-gray-400'}`}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.username}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${
                          u.role === 'CEO' || u.role === 'ceo' ? 'bg-[#FFD166]/10 text-[#FFD166] border-[#FFD166]/20' : 
                          u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-gray-500/10 text-gray-300 border-gray-500/20'
                        }`}>
                          {(u.role === 'CEO' || u.role === 'ceo') && <Shield size={14} />}
                          {u.role.toUpperCase()}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-green-400">
                          <CheckCircle size={16} /> Active
                        </div>
                      </td>
                      <td className="p-5 text-sm text-gray-400">{u.last_login}</td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setSelectedUser(u); setNewRole(u.role); setIsEditRoleOpen(true); }} className="p-2 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 border border-white/10 rounded-lg" title="Edit Role">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleResetPassword(u)} className="p-2 bg-white/5 hover:bg-yellow-500/20 text-gray-400 hover:text-yellow-400 border border-white/10 rounded-lg" title="Reset Password">
                            <KeyRound size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(u)} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-lg" title="Hapus Akun" disabled={u.role === 'CEO' || u.role === 'ceo'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-16 text-center text-gray-500">Pengguna tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-white/10 bg-[#0A111E] flex justify-between items-center shrink-0">
            <span className="text-sm text-gray-400">Total <span className="text-white font-bold">{usersList.length}</span> akun terdaftar di sistem.</span>
          </div>
        </div>
      </div>
    </main>
  );
}