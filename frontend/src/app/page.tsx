import React from 'react';
import Link from 'next/link';
import { Shield, Zap, Lock, ChevronRight, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0D1B2A] text-[#E0E1DD] font-sans selection:bg-[#FFD166] selection:text-[#0D1B2A] overflow-hidden scroll-smooth">
      
      {/* NAVBAR PUBLIK */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 lg:px-16 py-6 border-b border-white/5 bg-[#0D1B2A]/80 backdrop-blur-md">
        <div className="text-[#FFD166] font-bold text-2xl tracking-widest">
          SECURE.IT
        </div>
        
        {/* Menu Tengah (Anchor Links) */}
        <div className="hidden md:flex gap-10 font-medium text-sm text-gray-300">
          <Link href="/" className="text-[#FFD166] hover:text-[#FFD166] transition">Home</Link>
          <a href="#about" className="hover:text-[#FFD166] transition">About Us</a>
          <a href="#features" className="hover:text-[#FFD166] transition">Features</a>
        </div>

        {/* Tombol Login */}
        <div>
          <Link href="/login" className="flex items-center gap-2 bg-white/5 border border-white/20 px-6 py-2.5 rounded-full font-bold hover:bg-white/10 hover:border-[#FFD166]/50 transition backdrop-blur-md">
            <Lock size={16} className="text-[#FFD166]" />
            <span>Login</span>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-40 pb-20 lg:pt-56 lg:pb-32">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-[#FFD166]/10 rounded-full blur-[100px] -z-10"></div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD166]/10 border border-[#FFD166]/20 text-[#FFD166] text-sm font-semibold mb-8">
          <Shield size={16} />
          <span>Powered by Fuzzy Logic Mamdani</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl leading-tight">
          Next-Generation <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] to-orange-400">
            Dynamic Authentication
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mb-12">
          Platform keamanan siber adaptif yang mengamankan identitas digital Anda secara real-time. Memblokir anomali, mencegah brute-force, dan menjamin otorisasi presisi tinggi.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" className="flex items-center justify-center gap-2 bg-[#FFD166] text-[#0D1B2A] px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-[0_0_30px_rgba(255,209,102,0.3)]">
            Access System
            <ChevronRight size={20} />
          </Link>
          <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition">
            Preview Dashboard
          </Link>
        </div>
      </main>

      {/* ABOUT US (CONTRIBUTORS) SECTION */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 scroll-mt-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-4 text-[#FFD166]">
            <Users size={24} />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Meet The <span className="text-[#FFD166]">Security Team</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Dari perancangan arsitektur Fuzzy Logic hingga implementasi sistem enkripsi mutakhir, tim kami mendedikasikan diri untuk merancang ekosistem autentikasi yang adaptif dan tahan terhadap ancaman siber modern.
          </p>
        </div>

        {/* Grid 4 Kolom untuk 4 Anggota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <TeamCard 
            name="Stefani Ayudya P." 
            nim="L0224011" 
            role="AI & Logic Engineer" 
            imgUrl="stefani.jpeg" 
          />
          <TeamCard 
            name="Kunto Rossindu H." 
            nim="L0224020" 
            role="Lead Backend & Database" 
            imgUrl="/kunto.jpg" 
          />
          <TeamCard 
            name="Michael Christian" 
            nim="L0224035" 
            role="Security Analyst" 
            imgUrl="/mikel.jpeg" 
          />
          <TeamCard 
            name="Maulana Naufal H." 
            nim="L0224051" 
            role="UI/UX & Frontend Dev" 
            imgUrl="/maul.jpeg" 
          />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 scroll-mt-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Core <span className="text-[#FFD166]">Features</span></h2>
          <p className="text-gray-400">Pilar utama yang membangun pertahanan sistem otentikasi kami.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap size={32} className="text-[#FFD166]" />}
            title="Real-Time Analysis"
            desc="Mendeteksi perubahan IP dan anomali waktu dalam hitungan milidetik sebelum akses diberikan."
          />
          <FeatureCard 
            icon={<Shield size={32} className="text-[#FFD166]" />}
            title="AES-256 Encryption"
            desc="Seluruh log riwayat dan data sensitif dienkripsi dua arah di level database (Privacy by Design)."
          />
          <FeatureCard 
            icon={<Lock size={32} className="text-[#FFD166]" />}
            title="Stateless JWT"
            desc="Otorisasi sesi aman dan cepat menggunakan JSON Web Token dengan algoritma penandatanganan HS256."
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-500 text-sm bg-[#0D1B2A]">
        <p>© 2026 Kelompok 2 - B | Keamanan Data & Aplikasi. Universitas Sebelas Maret.</p>
      </footer>

    </div>
  );
}

// Komponen Pembantu: Team Card (Desain Referensi)
function TeamCard({ name, nim, role, imgUrl }: { name: string, nim: string, role: string, imgUrl: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl group aspect-[4/5] border border-white/10 shadow-lg">
      {/* Gambar Background dengan Efek Zoom Saat Hover */}
      <div 
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-gray-800"
        style={{ backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Overlay gradient tipis agar tidak terlalu terang */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D1B2A]/20 to-[#0D1B2A]/90"></div>
      </div>
      
      {/* Panel Glassmorphism di Bawah */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-[#0D1B2A]/60 backdrop-blur-md border-t border-white/10 translate-y-0 transition-transform duration-300">
        <h3 className="font-bold text-lg text-white mb-1 leading-tight">{name}</h3>
        <p className="text-[#FFD166] text-xs font-bold tracking-widest mb-1.5">{nim}</p>
        <p className="text-gray-300 text-xs font-medium">{role}</p>
      </div>
    </div>
  );
}

// Komponen Pembantu: Feature Card
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition duration-300 backdrop-blur-sm group">
      <div className="bg-[#0D1B2A] w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-[#FFD166]/30 transition shadow-[0_0_15px_rgba(0,0,0,0.5)]">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}