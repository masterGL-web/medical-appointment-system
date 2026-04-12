// //src/components/doctor/QuickActions.tsx
// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Calendar, Settings, FileText, Users } from 'lucide-react';
// import Link from 'next/link';
// import { motion } from 'framer-motion';

// export function QuickActions() {
//   const actions = [
//     {
//       label: 'Manage Availability',
//       icon: Calendar,
//       href: '/doctor/availability',
//       color: 'text-blue-600',
//       bg: 'bg-blue-50',
//       hoverBg: 'hover:bg-blue-100',
//     },
//     {
//       label: 'View All Patients',
//       icon: Users,
//       href: '/doctor/patients',
//       color: 'text-emerald-600',
//       bg: 'bg-emerald-50',
//       hoverBg: 'hover:bg-emerald-100',
//     },
//     {
//       label: 'Reports',
//       icon: FileText,
//       href: '/doctor/reports',
//       color: 'text-purple-600',
//       bg: 'bg-purple-50',
//       hoverBg: 'hover:bg-purple-100',
//     },
//     {
//       label: 'Settings',
//       icon: Settings,
//       href: '/doctor/settings',
//       color: 'text-gray-600',
//       bg: 'bg-gray-50',
//       hoverBg: 'hover:bg-gray-100',
//     },
//   ];

//   return (
//     <Card className="border-gray-200 shadow-sm">
//       <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
//         <CardTitle className="text-lg">Quick Actions</CardTitle>
//       </CardHeader>
//       <CardContent className="p-4">
//         <div className="grid grid-cols-2 gap-3">
//           {actions.map((action, index) => {
//             const Icon = action.icon;
//             return (
//               <Link key={action.label} href={action.href}>
//                 <motion.div
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ delay: index * 0.05 }}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     variant="outline"
//                     className={`w-full h-auto flex-col gap-2 p-4 ${action.bg} ${action.hoverBg} border-gray-200 transition-all duration-200`}
//                   >
//                     <Icon className={`h-5 w-5 ${action.color}`} />
//                     <span className="text-xs font-medium text-gray-700">{action.label}</span>
//                   </Button>
//                 </motion.div>
//               </Link>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }