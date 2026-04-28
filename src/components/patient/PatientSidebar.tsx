// src/components/patient/PatientSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/patient/NotificationBell';
import {
  LayoutDashboard,
  Calendar,
  User,
  LogOut,
  Activity,
  Search,
} from 'lucide-react';

interface PatientSidebarProps {
  patientName: string;
  userId:      string;   // ← NEW: needed for NotificationBell
  onLogout:    () => void;
}

const navigation = [
  { name: 'Dashboard',       href: '/patient/dashboard',    icon: LayoutDashboard },
  { name: 'Find Doctors',    href: '/patient/doctors',      icon: Search          },
  { name: 'My Appointments', href: '/patient/appointments', icon: Calendar        },
  { name: 'Profile',         href: '/patient/profile',      icon: User            },
];

export function PatientSidebar({ patientName, userId, onLogout }: PatientSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200 shadow-sm">

      {/* Brand header */}
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">MediCare</span>
        </div>
      </div>

      {/* Patient info + notification bell */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{patientName}</p>
            <p className="text-xs text-gray-500">Patient</p>
          </div>
          {/* Bell sits right-aligned next to the patient name */}
          <NotificationBell userId={userId} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive ? 'text-blue-600' : 'text-gray-500')} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}