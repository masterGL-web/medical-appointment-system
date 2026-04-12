//src/components/patient/DoctorsMap.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Doctor } from '@/types/doctor.types';
import { formatDistance } from '@/lib/geolocation';
import type { Coordinates } from '@/lib/geolocation';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DoctorWithDistance {
  doctor: Doctor;
  distance?: number;
}

interface DoctorsMapProps {
  doctors: DoctorWithDistance[];
  patientLocation: Coordinates | null;
  hoveredDoctorId: string | null;
  onMarkerHover: (id: string | null) => void;
  onBoundsChange?: (ids: string[]) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  selectedDoctorId: string | null; // ← ADDED
}

// ─── Popup HTML builder ───────────────────────────────────────────────────────

function buildPopupHTML(doctor: Doctor, distance?: number): string {
  const initials = `${doctor.firstName[0]}${doctor.lastName[0]}`;
  const distanceLine = distance !== undefined
    ? `<p style="margin:2px 0;font-size:12px;color:#2563eb;">📍 ${formatDistance(distance)}</p>`
    : '';
  const feeLine = doctor.consultationFee
    ? `<p style="margin:2px 0;font-size:12px;color:#059669;">💰 ${doctor.consultationFee} DZD</p>`
    : '';

  return `
    <div style="min-width:180px;font-family:system-ui,sans-serif;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#10b981,#0d9488);
                    display:flex;align-items:center;justify-content:center;
                    color:white;font-weight:600;font-size:13px;flex-shrink:0;">
          ${initials}
        </div>
        <div>
          <p style="margin:0;font-weight:600;font-size:14px;color:#111827;">
            Dr. ${doctor.firstName} ${doctor.lastName}
          </p>
          <p style="margin:0;font-size:12px;color:#6b7280;">${doctor.specialization}</p>
        </div>
      </div>
      ${distanceLine}
      ${feeLine}
      <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">📌 ${doctor.city}</p>
      <a href="/patient/doctors/${doctor.$id}"
         style="display:block;margin-top:10px;padding:6px 12px;
                background:#111827;color:white;text-align:center;
                border-radius:6px;font-size:13px;font-weight:500;
                text-decoration:none;">
        View Profile
      </a>
    </div>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DoctorsMap({
  doctors,
  patientLocation,
  hoveredDoctorId,
  onMarkerHover,
  onBoundsChange,
  isFullscreen,
  onToggleFullscreen,
  selectedDoctorId, // ← ADDED
}: DoctorsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef  = useRef<any>(null);
  const markersRef      = useRef<Map<string, any>>(new Map());
  const isInitialized   = useRef(false);

  // ── Initialize Leaflet once on mount ───────────────────────────────────────

  useEffect(() => {
    if (isInitialized.current || !mapContainerRef.current) return;
    isInitialized.current = true;

    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current!, {
        center: [36.737, 3.086] as [number, number],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (onBoundsChange) {
        const emitBounds = () => {
          const bounds = map.getBounds();
          const visible: string[] = [];
          markersRef.current.forEach((marker, id) => {
            if (bounds.contains(marker.getLatLng())) visible.push(id);
          });
          onBoundsChange(visible);
        };
        map.on('moveend', emitBounds);
        map.on('zoomend', emitBounds);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        isInitialized.current = false;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync markers when doctors list changes ─────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      const existing = markersRef.current;
      const newIds = new Set(
        doctors
          .filter((d) => d.doctor.latitude != null && d.doctor.longitude != null)
          .map((d) => d.doctor.$id)
      );

      existing.forEach((marker, id) => {
        if (!newIds.has(id)) { marker.remove(); existing.delete(id); }
      });

      doctors.forEach(({ doctor, distance }) => {
        if (doctor.latitude == null || doctor.longitude == null) return;
        if (existing.has(doctor.$id)) return;

        const icon = makeIcon(L, false);
        const marker = L.marker([doctor.latitude, doctor.longitude], { icon });

        marker.bindPopup(buildPopupHTML(doctor, distance), {
          maxWidth: 240,
          className: 'doctor-popup',
        });

        marker.on('mouseover', () => { onMarkerHover(doctor.$id); marker.openPopup(); });
        marker.on('mouseout',  () => { onMarkerHover(null); });
        marker.on('click',     () => { marker.openPopup(); });

        marker.addTo(map);
        existing.set(doctor.$id, marker);
      });

      const validDoctors = doctors.filter(
        (d) => d.doctor.latitude != null && d.doctor.longitude != null
      );
      if (validDoctors.length > 0) {
        const bounds = L.latLngBounds(
          validDoctors.map((d) => [d.doctor.latitude!, d.doctor.longitude!])
        );
        if (patientLocation) {
          bounds.extend([patientLocation.latitude, patientLocation.longitude]);
        }
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
      }
    });
  }, [doctors]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Patient location marker ────────────────────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current || !patientLocation) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      if ((map as any)._patientMarker) {
        (map as any)._patientMarker.remove();
      }

      const patientIcon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#3b82f6;border:3px solid white;
          box-shadow:0 0 0 3px rgba(59,130,246,0.4);
        "></div>`,
        className: '',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const marker = L.marker(
        [patientLocation.latitude, patientLocation.longitude],
        { icon: patientIcon }
      )
        .bindPopup('<b style="font-size:13px">📍 Your location</b>')
        .addTo(map);

      (map as any)._patientMarker = marker;
    });
  }, [patientLocation]);

  // ── Hover sync: highlight marker when card is hovered ─────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      markersRef.current.forEach((marker, id) => {
        const isHovered = id === hoveredDoctorId;
        marker.setIcon(makeIcon(L, isHovered));
        marker.setZIndexOffset(isHovered ? 1000 : 0);
      });
    });
  }, [hoveredDoctorId]);

  // ── ADDED: center map + open popup when a card is clicked ──────────────────

  useEffect(() => {
    if (!selectedDoctorId || !mapInstanceRef.current) return;

    const marker = markersRef.current.get(selectedDoctorId);
    if (!marker) return;

    // Fly smoothly to the marker, then open its popup
    mapInstanceRef.current.setView(marker.getLatLng(), 14, {
      animate: true,
      duration: 0.5,
    });

    const t = setTimeout(() => marker.openPopup(), 300);
    return () => clearTimeout(t);
  }, [selectedDoctorId]);

  // ── Invalidate size after fullscreen toggle ────────────────────────────────

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const t = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 320);
    return () => clearTimeout(t);
  }, [isFullscreen]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full">
      <style>{`
        @import url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css');
        .doctor-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          padding: 0;
        }
        .doctor-popup .leaflet-popup-content { margin: 14px 16px; }
        .doctor-popup .leaflet-popup-tip { background: white; }
        .marker-normal {
          width: 28px; height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #10b981;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .marker-hovered {
          width: 36px; height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg) scale(1.1);
          background: #2563eb;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(37,99,235,0.5);
        }
      `}</style>

      <div ref={mapContainerRef} className="w-full h-full rounded-xl overflow-hidden" />

      {/* Expand / Exit button */}
      <div className="absolute top-3 right-3 z-[1000]">
        <Button
          size="sm"
          variant="secondary"
          onClick={onToggleFullscreen}
          className="shadow-md bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
        >
          {isFullscreen
            ? <><Minimize2 className="h-4 w-4 mr-1.5" />Exit</>
            : <><Maximize2 className="h-4 w-4 mr-1.5" />Expand</>
          }
        </Button>
      </div>

      {/* Marker count badge */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <div className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-600 shadow-sm">
          {doctors.filter((d) => d.doctor.latitude != null).length} doctors on map
        </div>
      </div>
    </div>
  );
}

// ─── Icon factory ─────────────────────────────────────────────────────────────

function makeIcon(L: any, hovered: boolean) {
  return L.divIcon({
    html: `<div class="${hovered ? 'marker-hovered' : 'marker-normal'}"></div>`,
    className: '',
    iconSize:    hovered ? [36, 36] : [28, 28],
    iconAnchor:  hovered ? [18, 36] : [14, 28],
    popupAnchor: [0, hovered ? -36 : -28],
  });
}