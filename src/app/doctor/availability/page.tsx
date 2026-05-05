// src/app/doctor/availability/page.tsx
'use client';

import { useDoctorAvailability } from '@/lib/hooks/useDoctorAvailability';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { DAY_NAMES, DayOfWeek } from '@/types/availability.types';
import { Clock, Save, AlertCircle, Loader2, Coffee, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SLOT_DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour'     },
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
          <p className="text-sm text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
        <p className="text-gray-600 mt-1">
          Set your working hours for each day of the week. You can add a break for lunch or rest.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Schedule form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Enable days you&apos;re available and set your working hours
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
            const d = weekAvailability[day];

            return (
              <div
                key={day}
                className={`rounded-xl border transition-colors ${
                  d.enabled
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                {/* ── Main row ── */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-4">

                  {/* Day toggle */}
                  <div className="flex items-center gap-3 md:w-36 flex-shrink-0">
                    <Switch
                      checked={d.enabled}
                      onCheckedChange={(checked) => updateDay(day, { enabled: checked })}
                      disabled={saving}
                    />
                    <Label className="text-sm font-semibold cursor-pointer">
                      {DAY_NAMES[day]}
                    </Label>
                  </div>

                  {d.enabled ? (
                    <div className="flex-1 space-y-3">

                      {/* Work hours row */}
                      <div className="flex flex-wrap items-end gap-3">
                        {/* Start time */}
                        <div className="space-y-1 flex-1 min-w-[100px]">
                          <Label className="text-xs text-gray-500 font-medium">
                            Start
                          </Label>
                          <Input
                            type="time"
                            value={d.startTime}
                            onChange={(e) => updateDay(day, { startTime: e.target.value })}
                            disabled={saving}
                            className="bg-white"
                          />
                        </div>

                        <span className="text-gray-400 pb-2.5 text-sm flex-shrink-0">→</span>

                        {/* End time */}
                        <div className="space-y-1 flex-1 min-w-[100px]">
                          <Label className="text-xs text-gray-500 font-medium">
                            End
                          </Label>
                          <Input
                            type="time"
                            value={d.endTime}
                            onChange={(e) => updateDay(day, { endTime: e.target.value })}
                            disabled={saving}
                            className="bg-white"
                          />
                        </div>

                        {/* Slot duration */}
                        <div className="space-y-1 w-36 flex-shrink-0">
                          <Label className="text-xs text-gray-500 font-medium">
                            Slot duration
                          </Label>
                          <Select
                            value={String(d.slotDuration)}
                            onValueChange={(v) => updateDay(day, { slotDuration: Number(v) })}
                            disabled={saving}
                          >
                            <SelectTrigger className="bg-white">
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

                        {/* Add / remove break button */}
                        {!d.hasBreak ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={saving}
                            onClick={() =>
                              updateDay(day, {
                                hasBreak:       true,
                                breakStartTime: '12:00',
                                breakEndTime:   '14:00',
                              })
                            }
                            className="flex-shrink-0 gap-1.5 text-xs border-dashed
                                       border-amber-400 text-amber-600 hover:bg-amber-50
                                       hover:text-amber-700 mb-0.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add break
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={saving}
                            onClick={() =>
                              updateDay(day, {
                                hasBreak:       false,
                                breakStartTime: null,
                                breakEndTime:   null,
                              })
                            }
                            className="flex-shrink-0 gap-1.5 text-xs text-gray-400
                                       hover:text-red-500 hover:bg-red-50 mb-0.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove break
                          </Button>
                        )}
                      </div>

                      {/* ── Break row (shown only when hasBreak) ── */}
                      {d.hasBreak && (
                        <div className="flex flex-wrap items-end gap-3 pl-4 pt-2
                                        border-l-2 border-amber-300">
                          <Coffee className="h-4 w-4 text-amber-500 pb-0.5 self-end flex-shrink-0" />

                          <div className="space-y-1 flex-shrink-0">
                            <Label className="text-xs text-amber-600 font-medium">
                              Break from
                            </Label>
                            <Input
                              type="time"
                              value={d.breakStartTime ?? '12:00'}
                              onChange={(e) =>
                                updateDay(day, { breakStartTime: e.target.value })
                              }
                              disabled={saving}
                              className="bg-white w-32"
                            />
                          </div>

                          <span className="text-amber-400 pb-2.5 text-sm flex-shrink-0">→</span>

                          <div className="space-y-1 flex-shrink-0">
                            <Label className="text-xs text-amber-600 font-medium">
                              Break until
                            </Label>
                            <Input
                              type="time"
                              value={d.breakEndTime ?? '14:00'}
                              onChange={(e) =>
                                updateDay(day, { breakEndTime: e.target.value })
                              }
                              disabled={saving}
                              className="bg-white w-32"
                            />
                          </div>

                          {/* Visual summary */}
                          <div className="pb-2 text-xs text-amber-600 font-medium bg-amber-50
                                          border border-amber-200 rounded-lg px-3 py-2 flex-shrink-0">
                            🌅 {d.startTime} – {d.breakStartTime ?? '12:00'}
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            ☕ break
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            🌆 {d.breakEndTime ?? '14:00'} – {d.endTime}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="flex-1 text-sm text-gray-400 italic">
                      Not available on this day
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Save button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Availability
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>• Toggle the switch to enable or disable a day</p>
          <p>• Set your overall start and end times for the day</p>
          <p>• Click <strong>Add break</strong> to define a lunch or rest break — no slots will be generated during that window</p>
          <p>• Choose slot duration based on your average consultation time</p>
          <p>• Changes are saved only when you click &quot;Save Availability&quot;</p>
        </CardContent>
      </Card>
    </div>
  );
}