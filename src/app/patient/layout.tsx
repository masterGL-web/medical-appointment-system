// src/app/patient/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { PatientSidebar } from '@/components/patient/PatientSidebar';

const STORAGE_KEY = 'sidebar-collapsed';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, patient, role, loading, logout } = useAuth('patient');

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

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && (!user || role !== 'patient')) {
      const returnUrl = encodeURIComponent(pathname + (typeof window !== 'undefined' ? window.location.search : ''));
      router.replace(`/auth/login?redirect=${returnUrl}`);
    }
  }, [loading, user, role, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || !patient || role !== 'patient') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <PatientSidebar
        patientName={`${patient.firstName} ${patient.lastName}`}
        userId={patient.userId}
        onLogout={logout}
        collapsed={collapsed}
        onToggle={handleToggle}
      />
      <main className="flex-1 overflow-y-auto transition-all duration-300">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}