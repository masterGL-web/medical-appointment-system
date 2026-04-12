//src/app/doctor/dashboard/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { appointmentService } from '@/services/appointment.service';
// import { Appointment } from '@/types/appointment.types';
// import { DashboardStats } from '@/components/doctor/DashboardStats';
// import { AppointmentsTable } from '@/components/doctor/AppointmentsTable';
// import { TodaySchedule } from '@/components/doctor/TodaySchedule';
// import { QuickActions } from '@/components/doctor/QuickActions';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AlertCircle, Calendar, RefreshCw } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export default function DoctorDashboardPage() {
//   const { doctor } = useAuth('doctor');
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     if (doctor) {
//       loadAppointments();
//     }
//   }, [doctor]);

//   const loadAppointments = async () => {
//     if (!doctor) return;

//     try {
//       setLoading(true);
//       setError(null);

//       const data = await appointmentService.getUpcomingAppointmentsByDoctor(doctor.$id);
//       setAppointments(data);
//     } catch (err: any) {
//       console.error('Failed to load appointments:', err);
//       setError(err.message || 'Failed to load appointments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadAppointments();
//     setRefreshing(false);
//   };

//   // Calculate statistics
//   const totalAppointments = appointments.length;
//   const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
//   const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;

//   const today = new Date().toISOString().split('T')[0];
//   const todayAppointments = appointments.filter((a) => {
//     const apptDate = new Date(a.date).toISOString().split('T')[0];
//     return apptDate === today;
//   });

//   if (loading) {
//     return <DashboardSkeleton />;
//   }

//   if (error) {
//     return (
//       <div className="space-y-6">
//         <Alert variant="destructive" className="border-red-200 bg-red-50">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//         <Button onClick={handleRefresh} variant="outline">
//           <RefreshCw className="mr-2 h-4 w-4" />
//           Try Again
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 pb-8">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
//             Good {getGreeting()}, Dr. {doctor?.lastName}
//           </h1>
//           <p className="text-gray-600 mt-1">Here's what's happening with your practice today</p>
//         </div>
//         <Button
//           onClick={handleRefresh}
//           variant="outline"
//           size="sm"
//           disabled={refreshing}
//           className="gap-2"
//         >
//           <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Statistics */}
//       <DashboardStats
//         total={totalAppointments}
//         pending={pendingAppointments}
//         confirmed={confirmedAppointments}
//         today={todayAppointments.length}
//       />

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Appointments Table */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="flex items-center gap-2 text-lg">
//                   <Calendar className="h-5 w-5 text-emerald-600" />
//                   Upcoming Appointments
//                 </CardTitle>
//                 <span className="text-sm text-gray-500 font-normal">
//                   {appointments.length} total
//                 </span>
//               </div>
//             </CardHeader>
//             <CardContent className="p-0">
//               {appointments.length > 0 ? (
//                 <AppointmentsTable appointments={appointments} onUpdate={handleRefresh} />
//               ) : (
//                 <div className="text-center py-16">
//                   <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
//                     <Calendar className="h-8 w-8 text-gray-400" />
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments yet</h3>
//                   <p className="text-gray-500 text-sm">
//                     New appointments will appear here once patients book
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Right Column - Sidebar */}
//         <div className="space-y-6">
//           {/* Today's Schedule */}
//           <TodaySchedule appointments={todayAppointments} />

//           {/* Quick Actions */}
//           <QuickActions />
//         </div>
//       </div>
//     </div>
//   );
// }

// // Helper function
// function getGreeting() {
//   const hour = new Date().getHours();
//   if (hour < 12) return 'morning';
//   if (hour < 18) return 'afternoon';
//   return 'evening';
// }

// // Loading Skeleton
// function DashboardSkeleton() {
//   return (
//     <div className="space-y-8 pb-8">
//       <div>
//         <Skeleton className="h-8 w-64 mb-2" />
//         <Skeleton className="h-4 w-96" />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {[1, 2, 3, 4].map((i) => (
//           <Card key={i}>
//             <CardContent className="p-6">
//               <Skeleton className="h-4 w-24 mb-4" />
//               <Skeleton className="h-8 w-16" />
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2">
//           <Skeleton className="h-96 w-full" />
//         </div>
//         <div className="space-y-6">
//           <Skeleton className="h-64 w-full" />
//           <Skeleton className="h-48 w-full" />
//         </div>
//       </div>
//     </div>
//   );
// }
//src/app/doctor/dashboard/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithPatient } from '@/types/appointment.types';
import { DashboardStats } from '@/components/doctor/DashboardStats';
import { TodaySchedule } from '@/components/doctor/TodaySchedule';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DoctorDashboardPage() {
  const { doctor } = useAuth('doctor');
  const [allAppointments, setAllAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (doctor) {
      loadAppointments();
    }
  }, [doctor]);

  const loadAppointments = async () => {
    if (!doctor) return;

    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getUpcomingAppointmentsWithPatient(doctor.$id);
      setAllAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  // Statistics
  const { totalAppointments, pendingAppointments, confirmedAppointments, todayAppointments } =
    useMemo(() => {
      const today = new Date().toISOString().split('T')[0];

      return {
        totalAppointments: allAppointments.length,
        pendingAppointments: allAppointments.filter((a) => a.status === 'pending').length,
        confirmedAppointments: allAppointments.filter((a) => a.status === 'confirmed').length,
        todayAppointments: allAppointments.filter(
          (a) => a.date.split('T')[0] === today && a.status !== 'cancelled'
        ),
      };
    }, [allAppointments]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good morning, Dr. {doctor?.lastName}
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your practice today</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <DashboardStats
        total={totalAppointments}
        pending={pendingAppointments}
        confirmed={confirmedAppointments}
        today={todayAppointments.length}
      />

      {/* Today's Schedule - Full Width */}
      <div className="max-w-4xl">
        <TodaySchedule appointments={todayAppointments} onUpdate={handleRefresh} />
      </div>
    </div>
  );
}