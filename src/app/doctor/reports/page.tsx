//src/app/doctor/reports/page.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DoctorReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600 mt-1">View your practice analytics and reports</p>
      </div>

      <Card>
        <CardContent className="p-16 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports Coming Soon</h3>
          <p className="text-gray-600">
            This feature is under development. You'll be able to view detailed analytics and
            reports here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}