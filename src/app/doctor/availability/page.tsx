// src/app/doctor/availability/page.tsx
'use client';

import { useDoctorAvailability } from '@/lib/hooks/useDoctorAvailability';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DAY_NAMES, DayOfWeek } from '@/types/availability.types';
import {
  Clock, Save, AlertCircle, Loader2, Coffee, Plus, X,
  CalendarClock, Lightbulb, CheckCircle2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SLOT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour'     },
];

const TIPS = [
  'Toggle the switch to enable or disable a day',
  'Set your overall start and end times for the day',
  'Click Add break to define a lunch or rest break — no slots will be generated during that window',
  'Choose slot duration based on your average consultation time',
  'Changes are saved only when you click "Save Availability"',
];

export default function DoctorAvailabilityPage() {
  const { weekAvailability, loading, saving, error, updateDay, saveAvailability } =
    useDoctorAvailability();

  const handleSave = async () => {
    const success = await saveAvailability();
    if (success) {
      toast.success('Availability saved successfully');
    } else {
      toast.error('Failed to save availability. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm text-slate-500">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header banner ────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl px-8 py-6 shadow-lg">
        <h1 className="text-3xl font-bold text-white">Manage Availability</h1>
        <p className="text-slate-300 mt-1">
          Set your working hours for each day of the week. You can add a break for lunch or rest.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ── Weekly schedule card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">

        {/* Card header */}
        <div className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2 flex-shrink-0">
            <CalendarClock className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">Weekly Schedule</p>
            <p className="text-sm text-slate-500">Enable days you're available and set your working hours</p>
          </div>
        </div>

        {/* Day rows */}
        {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
          const d = weekAvailability[day];

          return (
            <div
              key={day}
              className={`border-b border-slate-100 last:border-b-0 transition-colors ${
                d.enabled ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {/* ── Top row ── */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4">

                {/* Toggle + day name */}
                <div className="flex items-center gap-3 md:w-36 flex-shrink-0">
                  <Switch
                    checked={d.enabled}
                    onCheckedChange={(checked) => updateDay(day, { enabled: checked })}
                    disabled={saving}
                  />
                  <Label className={`text-sm font-semibold cursor-pointer ${
                    d.enabled ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {DAY_NAMES[day]}
                  </Label>
                </div>

                {d.enabled ? (
                  <div className="flex-1 space-y-3">

                    {/* Work hours row */}
                    <div className="flex flex-wrap items-end gap-3">

                      {/* Start time */}
                      <div className="space-y-1 flex-1 min-w-[100px]">
                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Start
                        </Label>
                        <Input
                          type="time"
                          value={d.startTime}
                          onChange={(e) => updateDay(day, { startTime: e.target.value })}
                          disabled={saving}
                          className="h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:border-emerald-400 focus:ring-emerald-400 text-sm font-medium text-slate-700"
                        />
                      </div>

                      <span className="text-slate-300 pb-2.5 text-sm flex-shrink-0">→</span>

                      {/* End time */}
                      <div className="space-y-1 flex-1 min-w-[100px]">
                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          End
                        </Label>
                        <Input
                          type="time"
                          value={d.endTime}
                          onChange={(e) => updateDay(day, { endTime: e.target.value })}
                          disabled={saving}
                          className="h-10 rounded-xl border-slate-200 bg-white shadow-sm focus:border-emerald-400 focus:ring-emerald-400 text-sm font-medium text-slate-700"
                        />
                      </div>

                      {/* Slot duration */}
                      <div className="space-y-1 w-36 flex-shrink-0">
                        <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Slot duration
                        </Label>
                        <Select
                          value={String(d.slotDuration)}
                          onValueChange={(v) => updateDay(day, { slotDuration: Number(v) })}
                          disabled={saving}
                        >
                          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SLOT_DURATIONS.map((s) => (
                              <SelectItem key={s.value} value={String(s.value)}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Add break button */}
                      {!d.hasBreak && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => updateDay(day, {
                            hasBreak:       true,
                            breakStartTime: '12:00',
                            breakEndTime:   '14:00',
                          })}
                          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-300 transition-colors disabled:opacity-40 mb-0.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add break
                        </button>
                      )}
                    </div>

                    {/* ── Break section ── */}
                    {d.hasBreak && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">

                        {/* Break header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Coffee className="h-4 w-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                              Break window
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => updateDay(day, {
                              hasBreak:       false,
                              breakStartTime: null,
                              breakEndTime:   null,
                            })}
                            className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove break
                          </button>
                        </div>

                        {/* Break time inputs */}
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="space-y-1 flex-shrink-0">
                            <Label className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                              Break from
                            </Label>
                            <Input
                              type="time"
                              value={d.breakStartTime ?? '12:00'}
                              onChange={(e) => updateDay(day, { breakStartTime: e.target.value })}
                              disabled={saving}
                              className="h-10 rounded-xl border-amber-200 bg-white shadow-sm w-32 text-sm font-medium text-slate-700 focus:border-amber-400"
                            />
                          </div>

                          <span className="text-amber-400 pb-2.5 text-sm flex-shrink-0">→</span>

                          <div className="space-y-1 flex-shrink-0">
                            <Label className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                              Break until
                            </Label>
                            <Input
                              type="time"
                              value={d.breakEndTime ?? '14:00'}
                              onChange={(e) => updateDay(day, { breakEndTime: e.target.value })}
                              disabled={saving}
                              className="h-10 rounded-xl border-amber-200 bg-white shadow-sm w-32 text-sm font-medium text-slate-700 focus:border-amber-400"
                            />
                          </div>

                          {/* Visual timeline summary */}
                          <div className="pb-0 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex-shrink-0">
                            🌅 {d.startTime} – {d.breakStartTime ?? '12:00'}
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            ☕ break
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            🌆 {d.breakEndTime ?? '14:00'} – {d.endTime}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <p className="flex-1 text-sm text-slate-300 italic">
                    Not available on this day
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Save button */}
        <div className="flex justify-end px-6 py-5 border-t border-slate-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <><Save className="h-4 w-4" /> Save Availability</>
            )}
          </button>
        </div>
      </div>

      {/* ── Tips card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-amber-100 p-2 flex-shrink-0">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Tips</h2>
        </div>
        <div className="space-y-2.5">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}