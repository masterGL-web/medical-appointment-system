// src/lib/hooks/useDoctorAvailability.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { availabilityService } from '@/services/availability.service';
import { DoctorAvailability, DayOfWeek, DAY_NAMES } from '@/types/availability.types';

interface DayAvailabilityState {
  enabled: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  availabilityId?: string;
}

type WeekAvailability = Record<DayOfWeek, DayAvailabilityState>;

const DEFAULT_DAY_STATE: DayAvailabilityState = {
  enabled: false,
  startTime: '09:00',
  endTime: '17:00',
  slotDuration: 30,
};

export function useDoctorAvailability() {
  const { doctor } = useAuth('doctor');
  const [weekAvailability, setWeekAvailability] = useState<WeekAvailability>({
    0: { ...DEFAULT_DAY_STATE },
    1: { ...DEFAULT_DAY_STATE },
    2: { ...DEFAULT_DAY_STATE },
    3: { ...DEFAULT_DAY_STATE },
    4: { ...DEFAULT_DAY_STATE },
    5: { ...DEFAULT_DAY_STATE },
    6: { ...DEFAULT_DAY_STATE },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing availability on mount
  useEffect(() => {
    if (doctor) {
      loadAvailability();
    }
  }, [doctor]);

  const loadAvailability = async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      setError(null);

      const availabilities = await availabilityService.getDoctorAvailability(doctor.$id);

      // Always start from a clean default — never spread stale state
      const loadedWeek: WeekAvailability = {
        0: { ...DEFAULT_DAY_STATE },
        1: { ...DEFAULT_DAY_STATE },
        2: { ...DEFAULT_DAY_STATE },
        3: { ...DEFAULT_DAY_STATE },
        4: { ...DEFAULT_DAY_STATE },
        5: { ...DEFAULT_DAY_STATE },
        6: { ...DEFAULT_DAY_STATE },
      };

      availabilities.forEach((availability) => {
        loadedWeek[availability.dayOfWeek] = {
          enabled: true,
          startTime: availability.startTime,
          endTime: availability.endTime,
          slotDuration: availability.slotDuration,
          availabilityId: availability.$id,
        };
      });

      setWeekAvailability(loadedWeek);
    } catch (err: any) {
      console.error('Failed to load availability:', err);
      setError(err.message || 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const updateDay = useCallback(
    (day: DayOfWeek, updates: Partial<DayAvailabilityState>) => {
      setWeekAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], ...updates },
      }));
    },
    []
  );

  const saveAvailability = async () => {
    if (!doctor) return;

    try {
      setSaving(true);
      setError(null);

      // Delete disabled days
      const disabledDays = (Object.entries(weekAvailability) as [string, DayAvailabilityState][])
        .filter(([_, state]) => !state.enabled && state.availabilityId)
        .map(([_, state]) => state.availabilityId!);

      await Promise.all(
        disabledDays.map((id) => availabilityService.deleteAvailability(id))
      );

      // Prepare enabled days for bulk upsert
      const enabledDays = (Object.entries(weekAvailability) as [string, DayAvailabilityState][])
        .filter(([_, state]) => state.enabled)
        .map(([dayStr, state]) => ({
          doctorId: doctor.$id,
          dayOfWeek: Number(dayStr) as DayOfWeek,
          startTime: state.startTime,
          endTime: state.endTime,
          slotDuration: state.slotDuration,
        }));

      if (enabledDays.length > 0) {
        await availabilityService.bulkSetAvailability(doctor.$id, enabledDays);
      }

      // Reload BEFORE releasing saving state so UI never shows stale data
      await loadAvailability();
      return true;

    } catch (err: any) {
      console.error('Failed to save availability:', err);
      setError(err.message || 'Failed to save availability');
      return false;
    } finally {
      setSaving(false); // only releases after loadAvailability completes
    }
  };

  return {
    weekAvailability,
    loading,
    saving,
    error,
    updateDay,
    saveAvailability,
    refetch: loadAvailability,
  };
}