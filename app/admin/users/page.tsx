"use client";
import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AdminService } from '@/lib/services/admin';
import { User } from '@/lib/services/auth';

export default function AdminUsersPage() {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const users = await AdminService.getPendingUsers();
            setPendingUsers(users);
        } catch (error) {
            console.error("Failed to fetch pending users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: number) => {
        try {
            await AdminService.approveUser(id);
            setPendingUsers(prev => prev.filter(u => u.id !== id));
            alert("User approved successfully!");
        } catch (error) {
            alert("Failed to approve user.");
            console.error(error);
        }
    }

    return (
        <ProtectedRoute requireAdmin={true}>
            <div className="p-8">
                <h1 className="text-3xl font-bold mb-6">Pending Approvals</h1>

                {loading ? (
                    <div className="text-gray-500">Loading users...</div>
                ) : pendingUsers.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
                        No users pending approval.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pendingUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleApprove(user.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
