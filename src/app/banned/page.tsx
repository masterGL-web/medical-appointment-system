// src/app/banned/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { patientService } from '@/services/patient.service';
import { Button } from '@/components/ui/button';
import { ShieldBan, Clock, LogOut } from 'lucide-react';
import type { BanStatus } from '@/types/patient.types';

interface BanInfo {
  banStatus: BanStatus;
  banUntil:  string | null;
  banReason: string | null;
}

function formatAlgerianDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    weekday:  'long',
    year:     'numeric',
    month:    'long',
    day:      'numeric',
  });
}

export default function BannedPage() {
  const router = useRouter();
  const [banInfo, setBanInfo]   = useState<BanInfo | null>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const user    = await account.get();
        const patient = await patientService.getPatientByUserId(user.$id);

        if (!patient) {
          router.replace('/auth/login');
          return;
        }

        // If not actually banned, send them to dashboard
        const banStatus = patient.banStatus ?? 'none';
        const banUntil  = patient.banUntil ?? null;

        if (banStatus === 'none') {
          router.replace('/patient/dashboard');
          return;
        }

        if (banStatus === 'temporary' && banUntil && new Date(banUntil) <= new Date()) {
          router.replace('/patient/dashboard');
          return;
        }

        setBanInfo({
          banStatus,
          banUntil,
          banReason: patient.banReason ?? null,
        });
      } catch {
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await account.deleteSession('current').catch(() => null);
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!banInfo) return null;

  const isPermanent = banInfo.banStatus === 'permanent';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isPermanent ? 'bg-red-50' : 'bg-amber-50'
    }`}>
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isPermanent ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <ShieldBan className={`h-10 w-10 ${
              isPermanent ? 'text-red-600' : 'text-amber-600'
            }`} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className={`text-2xl font-bold ${
            isPermanent ? 'text-red-700' : 'text-amber-700'
          }`}>
            {isPermanent ? 'Account Permanently Banned' : 'Account Temporarily Suspended'}
          </h1>

          {isPermanent ? (
            <p className="text-gray-600 leading-relaxed">
              Your account has been permanently banned due to repeated no-shows.
              Please contact support if you believe this is an error.
            </p>
          ) : (
            <p className="text-gray-600 leading-relaxed">
              Your account has been temporarily suspended due to repeated no-shows.
            </p>
          )}
        </div>

        {/* Ban details */}
        <div className={`p-4 rounded-lg border text-left space-y-2 ${
          isPermanent
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          {banInfo.banReason && (
            <p className={`text-sm ${isPermanent ? 'text-red-800' : 'text-amber-800'}`}>
              <strong>Reason:</strong> {banInfo.banReason}
            </p>
          )}

          {!isPermanent && banInfo.banUntil && (
            <p className={`text-sm flex items-center gap-1.5 ${
              isPermanent ? 'text-red-800' : 'text-amber-800'
            }`}>
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong>Suspended until:</strong>{' '}
                {formatAlgerianDate(banInfo.banUntil)}
              </span>
            </p>
          )}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </Button>
      </div>
    </div>
  );
}