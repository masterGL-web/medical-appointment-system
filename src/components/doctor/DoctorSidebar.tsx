//src/components/doctor/DoctorSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Calendar, Users, User, LogOut,
  CalendarClock, Stethoscope,
} from 'lucide-react';

interface DoctorSidebarProps {
  doctorName: string;
  onLogout:   () => void;
  collapsed:  boolean;
  onToggle:   () => void;
}

const navigation = [
  { name: 'Dashboard',    href: '/doctor/dashboard',    icon: LayoutDashboard },
  { name: 'Availability', href: '/doctor/availability', icon: CalendarClock   },
  { name: 'Appointments', href: '/doctor/appointments', icon: Calendar        },
  { name: 'Patients',     href: '/doctor/patients',     icon: Users           },
  { name: 'Profile',      href: '/doctor/profile',      icon: User            },
];

export function DoctorSidebar({ doctorName, onLogout, collapsed, onToggle }: DoctorSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      'flex h-full flex-col bg-white border-r border-slate-100 shadow-sm transition-all duration-300 flex-shrink-0',
      collapsed ? 'w-16' : 'w-64'
    )}>

      {/* Brand — click to toggle */}
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
            <span className="text-lg font-bold text-slate-900 whitespace-nowrap">MediCare</span>
          )}
        </div>
      </div>

      {/* Doctor info */}
      <div className="border-b border-slate-100 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex-shrink-0">
            <User className="h-5 w-5 text-emerald-600" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">Dr. {doctorName}</p>
              <p className="text-xs text-slate-500">Doctor</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-600'
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
          onClick={onLogout}
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
  );
}