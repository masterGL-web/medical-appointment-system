//src/components/doctor/TodaySchedule.tsx
'use client';

import { AppointmentWithPatient } from '@/types/appointment.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { AppointmentRow } from './AppointmentRow';

interface TodayScheduleProps {
  appointments: AppointmentWithPatient[];
  doctorName:   string;
  onUpdate?:    () => void;
}

export function TodaySchedule({ appointments, doctorName, onUpdate }: TodayScheduleProps) {
  return (
    <Card className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
      <CardHeader className="border-b border-slate-100 px-6 py-4">
        <CardTitle className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-100 p-2">
            <Calendar className="h-5 w-5 text-teal-600" />
          </div>
          <span className="text-lg font-bold text-slate-900">Today's Schedule</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Patient</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {appointments.map((appointment, index) => (
              <AppointmentRow
                key={appointment.$id}
                appointment={appointment}
                doctorName={doctorName}
                onUpdate={onUpdate || (() => {})}
                isToday={true}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Calendar className="h-14 w-14 text-slate-200" />
            <p className="text-base font-semibold text-slate-400">No appointments today</p>
            <p className="text-sm text-slate-400">Enjoy your day off!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}