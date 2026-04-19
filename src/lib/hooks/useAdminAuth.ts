// src/lib/hooks/useAdminAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import type { Models } from 'appwrite';

interface AdminAuthState {
  user:    Models.User<Models.Preferences> | null;
  isAdmin: boolean;
  loading: boolean;
}

export function useAdminAuth() {
  const router = useRouter();
  const [state, setState] = useState<AdminAuthState>({
    user:    null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const check = async () => {
      try {
        const user = await account.get();
        const isAdmin = Array.isArray(user.labels) && user.labels.includes('admin');

        if (!isAdmin) {
          router.replace('/auth/login');
          return;
        }

        setState({ user, isAdmin: true, loading: false });
      } catch {
        router.replace('/auth/login');
      }
    };

    check();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    await account.deleteSession('current').catch(() => null);
    router.push('/auth/login');
  };

  return { ...state, logout };
}