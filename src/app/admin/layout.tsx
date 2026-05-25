// src/app/admin/layout.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Stethoscope, Users, Calendar,
  LogOut, ShieldCheck,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard',    href: '/admin/dashboard',   icon: LayoutDashboard },
  { name: 'Doctors',      href: '/admin/doctors',      icon: Stethoscope    },
  { name: 'Patients',     href: '/admin/patients',     icon: Users          },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar       },
];

const STORAGE_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAdminAuth();
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    return false;
  });

  function handleToggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <div className={cn(
        'flex h-full flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}>

        {/* Brand — click to toggle */}
        <div
          className="flex h-16 items-center border-b border-slate-100 px-3 cursor-pointer select-none"
          onClick={handleToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg shadow-purple-500/20 flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-slate-900 whitespace-nowrap">MediCare</span>
            )}
          </div>
        </div>

        {/* Admin info */}
        <div className="border-b border-slate-100 px-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name ?? 'Admin'}
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon     = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-600'
                )} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-2">
          <Button
            variant="ghost"
            onClick={logout}
            title={collapsed ? 'Logout' : undefined}
            className={cn(
              'w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors',
              collapsed ? 'justify-center px-0' : 'justify-start gap-3'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && 'Logout'}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto transition-all duration-300">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}