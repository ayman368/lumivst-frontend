import axios from 'axios';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_approved: boolean;
  is_admin: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const AdminService = {
    async getPendingUsers(): Promise<User[]> {
        const response = await axios.get<User[]>(`${API_URL}/admin/pending-users`, {
            withCredentials: true
        });
        return response.data;
    },

    async approveUser(userId: number): Promise<void> {
        await axios.post(`${API_URL}/admin/approve-user/${userId}`, {}, {
            headers: { 'x-csrf-token': '1' },
            withCredentials: true
        });
    }
}
