'use client';
import React, { useEffect, useState } from 'react';
import { Grid, Activity, ShieldAlert, Users, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Hook canggih Next.js untuk membaca URL aktif
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // PEMUSATAN KEAMANAN: RBAC kini berjalan otomatis di semua halaman superadmin
    const role = localStorage.getItem("user_role");
    if (role !== "ceo") {
      window.location.href = "/login"; 
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "/login";
  };

  // Mencegah error Hydration Mismatch dari Next.js saat membaca localStorage
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] flex font-sans overflow-hidden">
      
      {/* SIDEBAR GLOBAL */}
      <aside className="w-24 lg:w-64 border-r border-white/10 flex flex-col items-center lg:items-start py-8 px-4 bg-white/5 backdrop-blur-xl shrink-0 z-50">
        <div className="text-[#FFD166] font-bold text-2xl mb-12 hidden lg:block px-4 tracking-widest">
          SECURE.IT
        </div>
        <div className="text-[#FFD166] font-bold text-2xl mb-12 lg:hidden">
          S.IT
        </div>

          <nav className="flex flex-col gap-6 w-full">
            
            <Link href="/dashboard" className="w-full">
              <NavItem icon={<Grid size={24} />} label="Dashboard" active={pathname === '/dashboard'} />
            </Link>

            <Link href="/live-traffic" className="w-full">
              <NavItem icon={<Activity size={24} />} label="Live Traffic" active={pathname === '/live-traffic'} />
            </Link>

            <Link href="/threat-logs" className="w-full">
              <NavItem icon={<ShieldAlert size={24} />} label="Threat Logs" active={pathname === '/threat-logs'} />
            </Link>

            <Link href="/user-access" className="w-full">
              <NavItem icon={<Users size={24} />} label="User Access" active={pathname === '/user-access'} />
            </Link>

            <Link href="/settings" className="w-full">
              <NavItem icon={<Settings size={24} />} label="Settings" active={pathname === '/settings'} />
            </Link>

          </nav>

        <div className="mt-auto w-full">
          <NavItem icon={<LogOut size={24} />} label="Logout" onClick={handleLogout} />
        </div>
      </aside>

      {/* AREA KONTEN DINAMIS (Pages) */}
      {children}

    </div>
  );
}

// Komponen Reusable khusus Layout
function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: (e: React.MouseEvent) => void }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition cursor-pointer ${active ? 'bg-[#FFD166] text-[#0D1B2A] font-bold shadow-[0_0_15px_rgba(255,209,102,0.3)]' : 'text-gray-400 hover:text-[#E0E1DD] hover:bg-white/5'}`}>
      {icon}
      <span className="hidden lg:block">{label}</span>
    </div>
  );
}