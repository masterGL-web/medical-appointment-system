// src/app/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link"; // ← Add this

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Medical Appointment System
          </h1>
          <p className="text-lg text-gray-600">
            Master 2 Project - Healthcare Management Platform
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-green-600">✓ Next.js 14.2.3 Running</p>
              <p className="text-sm text-green-600">✓ TypeScript Configured</p>
              <p className="text-sm text-green-600">✓ Tailwind CSS Active</p>
              <p className="text-sm text-green-600">✓ shadcn/ui Installed</p>
              <p className="text-sm text-green-600">✓ Appwrite Connected</p>
            </div>
            
            {/* ← Add these buttons */}
            <div className="flex gap-3 mt-4">
              <Link href="/auth/register" className="flex-1">
                <Button className="w-full">Register as Patient</Button>
              </Link>
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" className="w-full">Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}