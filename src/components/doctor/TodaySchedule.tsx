//src/components/doctor/TodaySchedule.tsx
'use client';

import { AppointmentWithPatient } from '@/types/appointment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { AppointmentRow } from './AppointmentRow';

interface TodayScheduleProps {
  appointments: AppointmentWithPatient[];
  onUpdate?: () => void;
}

export function TodaySchedule({ appointments, onUpdate }: TodayScheduleProps) {
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-4">Patient</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Appointment Rows */}
            {appointments.map((appointment, index) => (
              <AppointmentRow
                key={appointment.$id}
                appointment={appointment}
                onUpdate={onUpdate || (() => {})}
                isToday={true}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900 mb-1">No appointments today</p>
            <p className="text-sm text-gray-600">Enjoy your day off!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}