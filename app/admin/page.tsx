"use client";
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminDashboard() {
    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/users" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                        <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
                        <p className="text-gray-600">Approve pending registrations and manage existing users.</p>
                    </Link>
                    {/* Add more admin links here */}
                </div>
            </div>
        </ProtectedRoute>
    );
}
