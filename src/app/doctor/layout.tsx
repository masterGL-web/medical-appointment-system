//src/app/doctor/layout.tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, doctor, role, loading, logout } = useAuth('doctor');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !doctor || role !== 'doctor') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DoctorSidebar
        doctorName={`${doctor.firstName} ${doctor.lastName}`}
        onLogout={logout}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}