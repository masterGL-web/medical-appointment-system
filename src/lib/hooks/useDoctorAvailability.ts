// src/lib/hooks/useDoctorAvailability.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { availabilityService } from '@/services/availability.service';
import { DayOfWeek, DAY_NAMES } from '@/types/availability.types';

// ─── State shape ──────────────────────────────────────────────────────────────
// Now includes break fields so the availability page can read/write them.

interface DayAvailabilityState {
  enabled:        boolean;
  startTime:      string;
  endTime:        string;
  slotDuration:   number;
  hasBreak:       boolean;
  breakStartTime: string | null;
  breakEndTime:   string | null;
  availabilityId?: string;
}

type WeekAvailability = Record<DayOfWeek, DayAvailabilityState>;

const DEFAULT_DAY_STATE: DayAvailabilityState = {
  enabled:        false,
  startTime:      '09:00',
  endTime:        '17:00',
  slotDuration:   30,
  hasBreak:       false,
  breakStartTime: null,
  breakEndTime:   null,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

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
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // ── Load ─────────────────────────────────────────────────────────────────

  const loadAvailability = useCallback(async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      setError(null);

      const availabilities = await availabilityService.getDoctorAvailability(doctor.$id);

      // Start from clean defaults every time — never spread stale state
      const loadedWeek: WeekAvailability = {
        0: { ...DEFAULT_DAY_STATE },
        1: { ...DEFAULT_DAY_STATE },
        2: { ...DEFAULT_DAY_STATE },
        3: { ...DEFAULT_DAY_STATE },
        4: { ...DEFAULT_DAY_STATE },
        5: { ...DEFAULT_DAY_STATE },
        6: { ...DEFAULT_DAY_STATE },
      };

      availabilities.forEach((avail) => {
        loadedWeek[avail.dayOfWeek] = {
          enabled:        true,
          startTime:      avail.startTime,
          endTime:        avail.endTime,
          slotDuration:   avail.slotDuration,
          hasBreak:       avail.hasBreak       ?? false,
          breakStartTime: avail.breakStartTime ?? null,
          breakEndTime:   avail.breakEndTime   ?? null,
          availabilityId: avail.$id,
        };
      });

      setWeekAvailability(loadedWeek);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load availability';
      console.error('Failed to load availability:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [doctor]);

  useEffect(() => {
    if (doctor) loadAvailability();
  }, [doctor, loadAvailability]);

  // ── Update a single day ───────────────────────────────────────────────────

  const updateDay = useCallback(
    (day: DayOfWeek, updates: Partial<DayAvailabilityState>) => {
      setWeekAvailability((prev) => ({
        ...prev,
        [day]: { ...prev[day], ...updates },
      }));
    },
    []
  );

  // ── Save ─────────────────────────────────────────────────────────────────

  const saveAvailability = useCallback(async (): Promise<boolean> => {
    if (!doctor) return false;

    try {
      setSaving(true);
      setError(null);

      // 1. Delete records for days that were disabled
      const toDelete = (
        Object.entries(weekAvailability) as [string, DayAvailabilityState][]
      )
        .filter(([, state]) => !state.enabled && state.availabilityId)
        .map(([, state]) => state.availabilityId!);

      await Promise.all(toDelete.map((id) => availabilityService.deleteAvailability(id)));

      // 2. Upsert records for enabled days — now includes break fields
      const toUpsert = (
        Object.entries(weekAvailability) as [string, DayAvailabilityState][]
      )
        .filter(([, state]) => state.enabled)
        .map(([dayStr, state]) => ({
          doctorId:       doctor.$id,
          dayOfWeek:      Number(dayStr) as DayOfWeek,
          startTime:      state.startTime,
          endTime:        state.endTime,
          slotDuration:   state.slotDuration,
          hasBreak:       state.hasBreak,
          breakStartTime: state.hasBreak ? (state.breakStartTime ?? null) : null,
          breakEndTime:   state.hasBreak ? (state.breakEndTime   ?? null) : null,
        }));

      if (toUpsert.length > 0) {
        await availabilityService.bulkSetAvailability(doctor.$id, toUpsert);
      }

      // 3. Reload so local state matches what was actually saved
      await loadAvailability();
      return true;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save availability';
      console.error('Failed to save availability:', err);
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [doctor, weekAvailability, loadAvailability]);

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