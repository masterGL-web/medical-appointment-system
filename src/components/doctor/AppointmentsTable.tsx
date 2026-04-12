//src/components/doctor/AppointmentsTable.tsx
// import { Appointment } from '@/types/appointment.types';
// import { AppointmentRow } from './AppointmentRow';
// import { ScrollArea } from '@/components/ui/scroll-area';

// interface AppointmentsTableProps {
//   appointments: Appointment[];
//   onUpdate: () => void;
// }

// export function AppointmentsTable({ appointments, onUpdate }: AppointmentsTableProps) {
//   return (
//     <ScrollArea className="h-[600px]">
//       <div className="divide-y divide-gray-100">
//         {appointments.map((appointment, index) => (
//           <AppointmentRow
//             key={appointment.$id}
//             appointment={appointment}
//             onUpdate={onUpdate}
//             isToday={isToday(appointment.date)}
//             index={index}
//           />
//         ))}
//       </div>
//     </ScrollArea>
//   );
// }

// function isToday(dateString: string): boolean {
//   const today = new Date().toISOString().split('T')[0];
//   const apptDate = new Date(dateString).toISOString().split('T')[0];
//   return today === apptDate;
// }
//src/components/doctor/AppointmentsTable.tsx
import { AppointmentWithPatient } from '@/types/appointment.types'; // CHANGED
import { AppointmentRow } from '@/components/doctor/AppointmentRow';
import { SortField, SortDirection } from '@/app/doctor/dashboard/page';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppointmentsTableProps {
  appointments: AppointmentWithPatient[]; // CHANGED
  onUpdate: () => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
}

export function AppointmentsTable({
  appointments,
  onUpdate,
  sortField,
  sortDirection,
  onSortChange,
}: AppointmentsTableProps) {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 ml-1 text-emerald-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 ml-1 text-emerald-600" />
    );
  };

  const isToday = (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    const apptDate = new Date(dateString).toISOString().split('T')[0];
    return today === apptDate;
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div className="col-span-4">Patient</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('date')}
          className="col-span-2 justify-start px-0 h-auto font-medium text-xs text-gray-500 uppercase hover:text-emerald-600"
        >
          Date
          <SortIcon field="date" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('time')}
          className="col-span-2 justify-start px-0 h-auto font-medium text-xs text-gray-500 uppercase hover:text-emerald-600"
        >
          Time
          <SortIcon field="time" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange('status')}
          className="col-span-2 justify-start px-0 h-auto font-medium text-xs text-gray-500 uppercase hover:text-emerald-600"
        >
          Status
          <SortIcon field="status" />
        </Button>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Table Rows */}
      {appointments.map((appointment, index) => (
        <AppointmentRow
          key={appointment.$id}
          appointment={appointment}
          onUpdate={onUpdate}
          isToday={isToday(appointment.date)}
          index={index}
        />
      ))}
    </div>
  );
}