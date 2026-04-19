// //src/app/doctor/appointments/page.tsx
// 'use client';

// import { useEffect, useState, useMemo, useCallback } from 'react';
// import { useAuth } from '@/lib/hooks/useAuth';
// import { appointmentService } from '@/services/appointment.service';
// import { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment.types';
// import { AppointmentsTable } from '@/components/doctor/AppointmentsTable';
// import { FilterPanel, type Filters } from '@/components/doctor/FilterPanel';
// import { PaginationControls } from '@/components/doctor/PaginationControls';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Skeleton } from '@/components/ui/skeleton';
// import { AlertCircle, Calendar, RefreshCw, Filter, Clock, History } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useDebounceValue } from 'usehooks-ts';
// import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// export type SortField = 'date' | 'time' | 'status';
// export type SortDirection = 'asc' | 'desc';

// const ITEMS_PER_PAGE = 10;

// export default function DoctorAppointmentsPage() {
//   const { doctor } = useAuth('doctor');
//   const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithPatient[]>([]);
//   const [pastAppointments, setPastAppointments] = useState<AppointmentWithPatient[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const pathname = usePathname();

//   const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>(
//     (searchParams.get('tab') as 'upcoming' | 'history') || 'upcoming'
//   );

//   const [filters, setFilters] = useState<Filters>({
//     searchQuery: searchParams.get('search') || '',
//     status: (searchParams.get('status') as AppointmentStatus | 'all' | 'all') || 'all',
//     dateRange: (searchParams.get('dateRange') as 'all' | 'today' | 'week' | 'month' | 'year') || 'all',
//   });

//   const [sortField, setSortField] = useState<SortField>(
//     (searchParams.get('sortField') as SortField) || 'date'
//   );
//   const [sortDirection, setSortDirection] = useState<SortDirection>(
//     (searchParams.get('sortDirection') as SortDirection) || 'asc'
//   );
//   const [currentPage, setCurrentPage] = useState(
//     parseInt(searchParams.get('page') || '1', 10)
//   );

//   // Type guard for dateRange
//   const validDateRanges: Filters['dateRange'][] = ['all', 'today', 'week', 'month', 'year'];
//   const safeFilters = {
//     ...filters,
//     dateRange: (validDateRanges.includes(filters.dateRange) ? filters.dateRange : 'all') as Filters['dateRange'],
//   };

//   const [debouncedSearch] = useDebounceValue(safeFilters.searchQuery, 300);

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

//       // Get all appointments (upcoming + past)
//       const allData = await appointmentService.getAppointmentsWithPatient(doctor.$id);

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);

//       // Split into upcoming and past
//       const upcoming = allData.filter((apt) => {
//         const aptDate = new Date(apt.date);
//         return aptDate >= today && apt.status !== 'cancelled';
//       });

//       const past = allData.filter((apt) => {
//         const aptDate = new Date(apt.date);
//         return aptDate < today || apt.status === 'cancelled' || apt.status === 'completed';
//       });

//       setUpcomingAppointments(upcoming);
//       setPastAppointments(past);
//     } catch (err) {
//       console.error('Failed to load appointments:', err);
//       setError('Failed to load appointments. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadAppointments();
//     setRefreshing(false);
//   };

//   // Get current appointments based on active tab
//   const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

//   // Filter and sort appointments
//   const filteredAndSortedAppointments = useMemo(() => {
//     let filtered = [...currentAppointments];

//     // Apply search filter
//     if (debouncedSearch) {
//       const searchLower = debouncedSearch.toLowerCase();
//       filtered = filtered.filter(
//         (apt) =>
//           apt.patient.fullName.toLowerCase().includes(searchLower) ||
//           apt.patient.phone?.includes(searchLower) ||
//           apt.reason?.toLowerCase().includes(searchLower)
//       );
//     }

//     // Apply status filter
//     if (filters.status !== 'all') {
//       filtered = filtered.filter((apt) => apt.status === filters.status);
//     }

//     // Apply date range filter
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (filters.dateRange === 'today') {
//       const todayStr = today.toISOString().split('T')[0];
//       filtered = filtered.filter((apt) => apt.date.split('T')[0] === todayStr);
//     } else if (filters.dateRange === 'week') {
//       const weekAgo = new Date(today);
//       weekAgo.setDate(weekAgo.getDate() - 7);
//       const weekFromNow = new Date(today);
//       weekFromNow.setDate(weekFromNow.getDate() + 7);
      
//       filtered = filtered.filter((apt) => {
//         const aptDate = new Date(apt.date);
//         return aptDate >= weekAgo && aptDate <= weekFromNow;
//       });
//     } else if (filters.dateRange === 'month') {
//       const monthAgo = new Date(today);
//       monthAgo.setMonth(monthAgo.getMonth() - 1);
//       const monthFromNow = new Date(today);
//       monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      
//       filtered = filtered.filter((apt) => {
//         const aptDate = new Date(apt.date);
//         return aptDate >= monthAgo && aptDate <= monthFromNow;
//       });
//     } else if (filters.dateRange === 'year') {
//       const yearAgo = new Date(today);
//       yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      
//       filtered = filtered.filter((apt) => {
//         const aptDate = new Date(apt.date);
//         return aptDate >= yearAgo;
//       });
//     }

//     // Sort
//     filtered.sort((a, b) => {
//       let comparison = 0;

//       if (sortField === 'date') {
//         comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
//       } else if (sortField === 'time') {
//         comparison = a.startTime.localeCompare(b.startTime);
//       } else if (sortField === 'status') {
//         comparison = a.status.localeCompare(b.status);
//       }

//       // For history tab, default to descending (newest first)
//       if (activeTab === 'history' && sortField === 'date') {
//         return sortDirection === 'asc' ? -comparison : comparison;
//       }

//       return sortDirection === 'asc' ? comparison : -comparison;
//     });

//     return filtered;
//   }, [currentAppointments, debouncedSearch, filters, sortField, sortDirection, activeTab]);

//   // Pagination
//   const totalPages = Math.ceil(filteredAndSortedAppointments.length / ITEMS_PER_PAGE);
//   const paginatedAppointments = useMemo(() => {
//     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredAndSortedAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
//   }, [filteredAndSortedAppointments, currentPage]);

//   // Update URL params
//   useEffect(() => {
//     const params = new URLSearchParams();
//     if (activeTab !== 'upcoming') params.set('tab', activeTab);
//     if (filters.searchQuery) params.set('search', filters.searchQuery);
//     if (filters.status !== 'all') params.set('status', filters.status);
//     if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
//     if (sortField !== 'date') params.set('sortField', sortField);
//     if (sortDirection !== 'asc') params.set('sortDirection', sortDirection);
//     if (currentPage > 1) params.set('page', currentPage.toString());

//     router.replace(`${pathname}?${params.toString()}`, { scroll: false });
//   }, [activeTab, filters, sortField, sortDirection, currentPage, pathname, router]);

//   const handleFilterChange = useCallback((changedFilters: Partial<Filters>) => {
//     setFilters((prev) => ({ ...prev, ...changedFilters }));
//     setCurrentPage(1);
//   }, []);

//   const clearFilters = useCallback(() => {
//     setFilters({
//       searchQuery: '',
//       status: 'all' as const,
//       dateRange: 'all' as const,
//     });
//     setSortField('date');
//     setSortDirection(activeTab === 'history' ? 'desc' : 'asc');
//     setCurrentPage(1);
//   }, [activeTab]);

//   const handleSortChange = useCallback((field: SortField) => {
//     setSortField((prev) => {
//       if (prev === field) {
//         setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
//       } else {
//         setSortDirection(activeTab === 'history' ? 'desc' : 'asc');
//       }
//       return field;
//     });
//   }, [activeTab]);

//   const handleTabChange = (value: string) => {
//     setActiveTab(value as 'upcoming' | 'history');
//     setCurrentPage(1);
//     // Auto-adjust sort direction for history
//     if (value === 'history' && sortField === 'date') {
//       setSortDirection('desc');
//     }
//   };

//   const hasActiveFilters =
//     filters.searchQuery !== '' || filters.status !== 'all' || filters.dateRange !== 'all';

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <Skeleton className="h-8 w-64" />
//         <Skeleton className="h-96 w-full" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <Alert variant="destructive">
//         <AlertCircle className="h-4 w-4" />
//         <AlertDescription>{error}</AlertDescription>
//       </Alert>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
//           <p className="text-gray-600 mt-1">Manage and view your appointments history</p>
//         </div>
//         <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
//           <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </Button>
//       </div>

//       {/* Tabs */}
//       <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
//         <TabsList className="grid w-full max-w-md grid-cols-2">
//           <TabsTrigger value="upcoming" className="flex items-center gap-2">
//             <Clock className="h-4 w-4" />
//             Upcoming ({upcomingAppointments.length})
//           </TabsTrigger>
//           <TabsTrigger value="history" className="flex items-center gap-2">
//             <History className="h-4 w-4" />
//             History ({pastAppointments.length})
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value={activeTab} className="space-y-6">
//           {/* Filter Panel */}
//           <FilterPanel
//             filters={filters}
//             onFilterChange={handleFilterChange}
//             onClearFilters={clearFilters}
//             hasActiveFilters={hasActiveFilters}
//             totalResults={filteredAndSortedAppointments.length}
//           />

//           {/* Appointments Table */}
//           <Card className="border-gray-200 shadow-sm">
//             <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white flex flex-row items-center justify-between">
//               <CardTitle className="flex items-center gap-2 text-lg">
//                 <Calendar className="h-5 w-5 text-emerald-600" />
//                 {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Appointments (
//                 {filteredAndSortedAppointments.length})
//               </CardTitle>
//               {hasActiveFilters && (
//                 <Badge variant="secondary" className="ml-2">
//                   <Filter className="h-3 w-3 mr-1" />
//                   Filtered
//                 </Badge>
//               )}
//             </CardHeader>
//             <CardContent className="p-0">
//               {paginatedAppointments.length > 0 ? (
//                 <>
//                   <AppointmentsTable
//                     appointments={paginatedAppointments}
//                     onUpdate={handleRefresh}
//                     sortField={sortField}
//                     sortDirection={sortDirection}
//                     onSortChange={handleSortChange}
//                   />
//                   {totalPages > 1 && (
//                     <div className="border-t p-4">
//                       <PaginationControls
//                         currentPage={currentPage}
//                         totalPages={totalPages}
//                         onPageChange={setCurrentPage}
//                         totalItems={filteredAndSortedAppointments.length}
//                         itemsPerPage={ITEMS_PER_PAGE}
//                       />
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <div className="text-center py-16">
//                   <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
//                   <p className="text-gray-600">
//                     {hasActiveFilters
//                       ? 'No appointments match your filters'
//                       : activeTab === 'upcoming'
//                       ? 'No upcoming appointments'
//                       : 'No appointment history yet'}
//                   </p>
//                   {hasActiveFilters && (
//                     <Button variant="link" onClick={clearFilters} className="mt-2">
//                       Clear filters
//                     </Button>
//                   )}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }

//src/app/doctor/appointments/page.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { appointmentService } from '@/services/appointment.service';
import { AppointmentWithPatient, AppointmentStatus } from '@/types/appointment.types';
import { AppointmentsTable } from '@/components/doctor/AppointmentsTable';
import { FilterPanel, type Filters } from '@/components/doctor/FilterPanel';
import { PaginationControls } from '@/components/doctor/PaginationControls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, RefreshCw, Filter, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDebounceValue } from 'usehooks-ts';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export type SortField = 'date' | 'time' | 'status';
export type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export default function DoctorAppointmentsPage() {
  const { doctor } = useAuth('doctor');
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithPatient[]>([]);
  const [pastAppointments, setPastAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>(
    (searchParams.get('tab') as 'upcoming' | 'history') || 'upcoming'
  );

  const [filters, setFilters] = useState<Filters>({
    searchQuery: searchParams.get('search') || '',
    status: (searchParams.get('status') as AppointmentStatus | 'all' | 'all') || 'all',
    dateRange: (searchParams.get('dateRange') as 'all' | 'today' | 'week' | 'month' | 'year') || 'all',
  });

  const [sortField, setSortField] = useState<SortField>(
    (searchParams.get('sortField') as SortField) || 'date'
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    (searchParams.get('sortDirection') as SortDirection) || 'asc'
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );

  // Type guard for dateRange
  const validDateRanges: Filters['dateRange'][] = ['all', 'today', 'week', 'month', 'year'];
  const safeFilters = {
    ...filters,
    dateRange: (validDateRanges.includes(filters.dateRange) ? filters.dateRange : 'all') as Filters['dateRange'],
  };

  const [debouncedSearch] = useDebounceValue(safeFilters.searchQuery, 300);

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

      // Get all appointments (upcoming + past)
      const allData = await appointmentService.getAppointmentsWithPatient(doctor.$id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Split into upcoming and past
      const upcoming = allData.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && apt.status !== 'cancelled';
      });

      const past = allData.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate < today || apt.status === 'cancelled' || apt.status === 'completed';
      });

      setUpcomingAppointments(upcoming);
      setPastAppointments(past);
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

  // Get current appointments based on active tab
  const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...currentAppointments];

    // Apply search filter
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patient.fullName.toLowerCase().includes(searchLower) ||
          apt.patient.phone?.includes(searchLower) ||
          apt.reason?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    // Apply date range filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filters.dateRange === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter((apt) => apt.date.split('T')[0] === todayStr);
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= weekAgo && aptDate <= weekFromNow;
      });
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(monthFromNow.getMonth() + 1);
      
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= monthAgo && aptDate <= monthFromNow;
      });
    } else if (filters.dateRange === 'year') {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= yearAgo;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'time') {
        comparison = a.startTime.localeCompare(b.startTime);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      // For history tab, default to descending (newest first)
      if (activeTab === 'history' && sortField === 'date') {
        return sortDirection === 'asc' ? -comparison : comparison;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentAppointments, debouncedSearch, filters, sortField, sortDirection, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedAppointments.length / ITEMS_PER_PAGE);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedAppointments, currentPage]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'upcoming') params.set('tab', activeTab);
    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.dateRange !== 'all') params.set('dateRange', filters.dateRange);
    if (sortField !== 'date') params.set('sortField', sortField);
    if (sortDirection !== 'asc') params.set('sortDirection', sortDirection);
    if (currentPage > 1) params.set('page', currentPage.toString());

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [activeTab, filters, sortField, sortDirection, currentPage, pathname, router]);

  const handleFilterChange = useCallback((changedFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...changedFilters }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      status: 'all' as const,
      dateRange: 'all' as const,
    });
    setSortField('date');
    setSortDirection(activeTab === 'history' ? 'desc' : 'asc');
    setCurrentPage(1);
  }, [activeTab]);

  const handleSortChange = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortDirection(activeTab === 'history' ? 'desc' : 'asc');
      }
      return field;
    });
  }, [activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'upcoming' | 'history');
    setCurrentPage(1);
    // Auto-adjust sort direction for history
    if (value === 'history' && sortField === 'date') {
      setSortDirection('desc');
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== '' || filters.status !== 'all' || filters.dateRange !== 'all';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
          <p className="text-gray-600 mt-1">Manage and view your appointments history</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            totalResults={filteredAndSortedAppointments.length}
          />

          {/* Appointments Table */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
                {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Appointments (
                {filteredAndSortedAppointments.length})
              </CardTitle>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  <Filter className="h-3 w-3 mr-1" />
                  Filtered
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {paginatedAppointments.length > 0 ? (
                <>
                  <AppointmentsTable
                    appointments={paginatedAppointments}
                    onUpdate={handleRefresh}
                    doctorName={doctor ? `${doctor.firstName} ${doctor.lastName}` : ''}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                  />
                  {totalPages > 1 && (
                    <div className="border-t p-4">
                      <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredAndSortedAppointments.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {hasActiveFilters
                      ? 'No appointments match your filters'
                      : activeTab === 'upcoming'
                      ? 'No upcoming appointments'
                      : 'No appointment history yet'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="link" onClick={clearFilters} className="mt-2">
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}