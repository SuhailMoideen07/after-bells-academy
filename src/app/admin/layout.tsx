"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Teachers', href: '/admin/teachers', icon: Users },
  { label: 'Students', href: '/admin/students', icon: GraduationCap },
  { label: 'Batches', href: '/admin/batches', icon: Layers },
  { label: 'Schedules', href: '/admin/schedules', icon: Calendar },
  { label: 'Class Logs', href: '/admin/logs', icon: FileSpreadsheet },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminName, setAdminName] = useState('Administrator');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setAdminName(data.user.name || 'Administrator');
          setAdminEmail(data.user.email || '');
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-navy-dark text-white border-r border-gold-accent/20 p-6 shrink-0 justify-between min-h-screen sticky top-0">
        <div>
          {/* Logo Header */}
          <Link href="/admin" className="flex items-center gap-3 mb-8 group">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto bg-white/10 p-1 rounded-lg" />
            <div>
              <span className="text-sm font-black tracking-tight text-white block">After Bells</span>
              <span className="text-[10px] font-bold text-gold-accent uppercase tracking-widest block">Admin Console</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="space-y-1">
            {ADMIN_NAV.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all ${
                    isActive
                      ? 'bg-gold-accent text-navy-dark shadow-md font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & logout */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-gold-accent" />
            <div>
              <p className="text-xs font-bold text-white">{adminName}</p>
              <p className="text-[10px] text-slate-400">{adminEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout Session
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-navy-dark text-white p-4 sticky top-0 z-40 flex items-center justify-between border-b border-gold-accent/20">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xs font-black tracking-wide text-gold-accent">Admin Console</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-dark text-white p-4 border-b border-slate-800 space-y-2 animate-in slide-in-from-top-2">
          {ADMIN_NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl ${
                pathname === item.href ? 'bg-gold-accent text-navy-dark' : 'text-slate-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2.5 bg-red-500/20 text-red-300 text-xs font-bold rounded-xl"
          >
            Logout Session
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
