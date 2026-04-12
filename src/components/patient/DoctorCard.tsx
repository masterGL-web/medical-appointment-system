//src/components/patient/DoctorCard.tsx
'use client';

import { memo } from 'react';
import { Doctor } from '@/types/doctor.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { formatDistance } from '@/lib/geolocation';
import type { Coordinates } from '@/lib/geolocation';

interface DoctorCardProps {
  doctor: Doctor;
  distance?: number;
  patientLocation: Coordinates | null;
  isHovered: boolean;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onClick: (id: string) => void; // ← ADDED
}

const DoctorCard = memo(function DoctorCard({
  doctor,
  distance,
  patientLocation,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick, // ← ADDED
}: DoctorCardProps) {
  return (
    <Card
      onMouseEnter={() => onMouseEnter(doctor.$id)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(doctor.$id)} // ← ADDED
      className={`
        transition-all duration-200 cursor-pointer
        ${isHovered
          ? 'shadow-lg border-blue-400 ring-2 ring-blue-200 -translate-y-0.5'
          : 'hover:shadow-md border-gray-200'
        }
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
            {doctor.firstName[0]}{doctor.lastName[0]}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">
              Dr. {doctor.firstName} {doctor.lastName}
            </CardTitle>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {doctor.specialization}
              </Badge>
              {distance !== undefined && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  {formatDistance(distance)}
                </Badge>
              )}
              {patientLocation && distance === undefined && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-200">
                  no coords
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-1.5">
        {doctor.yearsOfExperience && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{doctor.yearsOfExperience} years experience</span>
          </div>
        )}
        {doctor.clinicName && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{doctor.clinicName}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{doctor.city}</span>
        </div>
        {doctor.consultationFee && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <DollarSign className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{doctor.consultationFee} DZD</span>
          </div>
        )}
        {doctor.bio && (
          <p className="text-xs text-gray-500 line-clamp-2 pt-0.5">{doctor.bio}</p>
        )}

        {/* Actions — stopPropagation so button clicks don't re-trigger card onClick */}
        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
            <Link href={`/patient/doctors/${doctor.$id}`}>
              <User className="h-3.5 w-3.5 mr-1.5" />
              View Profile
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1 text-xs">
            <Link href={`/patient/book/${doctor.$id}`}>Book</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default DoctorCard;