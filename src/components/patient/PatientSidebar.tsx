// src/components/patient/PatientSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/patient/NotificationBell';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  LogOut,
  Stethoscope,
  Search,
} from 'lucide-react';

interface PatientSidebarProps {
  patientName: string;
  userId:      string;
  onLogout:    () => void;
  collapsed:   boolean;
  onToggle:    () => void;
}

const navigation = [
  { name: 'Find Doctors',    href: '/patient/doctors',      icon: Search   },
  { name: 'My Appointments', href: '/patient/appointments', icon: Calendar },
  { name: 'Profile',         href: '/patient/profile',      icon: User     },
];

export function PatientSidebar({ patientName, userId, onLogout, collapsed, onToggle }: PatientSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >

      {/* Brand header — click to toggle */}
      <div
        className="flex h-16 items-center border-b border-slate-100 px-3 cursor-pointer select-none"
        onClick={onToggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-slate-900 whitespace-nowrap overflow-hidden">MediCare</span>
          )}
        </div>
      </div>

      {/* Patient info + notification bell */}
      <div className="border-b border-slate-100 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0">
            <User className="h-5 w-5 text-emerald-600" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{patientName}</p>
              <p className="text-xs text-slate-500">Patient</p>
            </div>
          )}
          {!collapsed && <NotificationBell userId={userId} />}
        </div>
        {collapsed && (
          <div className="mt-2 flex justify-center">
            <NotificationBell userId={userId} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer rounded-xl',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600')} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors',
            collapsed ? 'justify-center px-0' : 'justify-start gap-3'
          )}
          onClick={onLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </div>
  );
}