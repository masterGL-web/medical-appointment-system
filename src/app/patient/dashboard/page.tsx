'use client';

export default function PatientDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome to your patient dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm text-gray-500">Upcoming Appointments</h3>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm text-gray-500">Total Appointments</h3>
          <p className="text-2xl font-semibold mt-2">0</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-sm text-gray-500">Profile Status</h3>
          <p className="text-2xl font-semibold mt-2 text-green-600">
            Active
          </p>
        </div>
      </div>
    </div>
  );
}
