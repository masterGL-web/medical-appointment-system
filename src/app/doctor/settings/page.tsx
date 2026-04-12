// src/app/doctor/settings/page.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function DoctorSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardContent className="p-16 text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h3>
          <p className="text-gray-600">
            This feature is under development. You'll be able to manage your settings here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}