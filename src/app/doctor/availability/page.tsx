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
import { Clock, Save, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SLOT_DURATIONS = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
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
                    Set your working hours for each day of the week
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Availability Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Weekly Schedule</span>
                    </CardTitle>
                    <CardDescription>
                        Enable days you're available and set your working hours
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
                        const dayState = weekAvailability[day];

                        return (
                            <div
                                key={day}
                                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50"
                            >
                                {/* Day Name & Enable Switch */}
                                <div className="flex items-center space-x-3 md:w-40">
                                    <Switch
                                        checked={dayState.enabled}
                                        onCheckedChange={(checked) =>
                                            updateDay(day, { enabled: checked })
                                        }
                                        disabled={saving}
                                    />
                                    <Label className="text-base font-medium cursor-pointer">
                                        {DAY_NAMES[day]}
                                    </Label>
                                </div>

                                {/* Time Inputs */}
                                {dayState.enabled ? (
                                    <>
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`start-${day}`} className="text-xs text-gray-600">
                                                Start Time
                                            </Label>
                                            <Input
                                                id={`start-${day}`}
                                                type="time"
                                                value={dayState.startTime}
                                                onChange={(e) => updateDay(day, { startTime: e.target.value })}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`end-${day}`} className="text-xs text-gray-600">
                                                End Time
                                            </Label>
                                            <Input
                                                id={`end-${day}`}
                                                type="time"
                                                value={dayState.endTime}
                                                onChange={(e) => updateDay(day, { endTime: e.target.value })}
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor={`slot-${day}`} className="text-xs text-gray-600">
                                                Slot Duration
                                            </Label>
                                            <Select
                                                value={String(dayState.slotDuration)}
                                                onValueChange={(value) =>
                                                    updateDay(day, { slotDuration: Number(value) })
                                                }
                                                disabled={saving}
                                            >
                                                <SelectTrigger id={`slot-${day}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SLOT_DURATIONS.map((duration) => (
                                                        <SelectItem key={duration.value} value={String(duration.value)}>
                                                            {duration.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 text-sm text-gray-500 italic">
                                        Not available on this day
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Save Button */}
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

            {/* Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                    <p>• Toggle the switch to enable or disable availability for each day</p>
                    <p>• Set start and end times for your working hours</p>
                    <p>• Choose slot duration based on your consultation time</p>
                    <p>• Changes are saved only when you click "Save Availability"</p>
                </CardContent>
            </Card>
        </div>
    );
}