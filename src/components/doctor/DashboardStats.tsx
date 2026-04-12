// This component displays the dashboard statistics for the doctor, including total appointments, pending appointments, confirmed appointments, and today's appointments. Each statistic is displayed in a card with an icon and a title.
//src/components/doctor/DashboardStats.tsx
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// interface DashboardStatsProps {
//   total: number;
//   pending: number;
//   confirmed: number;
//   today: number;
// }

// export function DashboardStats({ total, pending, confirmed, today }: DashboardStatsProps) {
//   const stats = [
//     {
//       title: 'Total Appointments',
//       value: total,
//       icon: Calendar,
//       color: 'text-blue-600',
//       bg: 'bg-blue-50',
//     },
//     {
//       title: 'Pending',
//       value: pending,
//       icon: Clock,
//       color: 'text-yellow-600',
//       bg: 'bg-yellow-50',
//     },
//     {
//       title: 'Confirmed',
//       value: confirmed,
//       icon: CheckCircle,
//       color: 'text-green-600',
//       bg: 'bg-green-50',
//     },
//     {
//       title: "Today's Appointments",
//       value: today,
//       icon: AlertCircle,
//       color: 'text-purple-600',
//       bg: 'bg-purple-50',
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//       {stats.map((stat) => {
//         const Icon = stat.icon;
//         return (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-sm font-medium text-gray-600">
//                 {stat.title}
//               </CardTitle>
//               <div className={`${stat.bg} p-2 rounded-lg`}>
//                 <Icon className={`h-4 w-4 ${stat.color}`} />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stat.value}</div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }
//src/components/doctor/DashboardStats.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardStatsProps {
  total: number;
  pending: number;
  confirmed: number;
  today: number;
}

export function DashboardStats({ total, pending, confirmed, today }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Appointments',
      value: total,
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Pending',
      value: pending,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100',
      iconColor: 'text-amber-600',
      change: '+3',
      changeType: 'neutral' as const,
    },
    {
      title: 'Confirmed',
      value: confirmed,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      iconColor: 'text-emerald-600',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: "Today's Schedule",
      value: today,
      icon: Activity,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
      iconColor: 'text-purple-600',
      change: 'Active',
      changeType: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                      {stat.changeType === 'increase' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <TrendingUp className="h-3 w-3" />
                          {stat.change}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgGradient} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
              <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}