import axios from 'axios';
import { API_BASE_URL } from '@/lib/api/config';

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_verified: boolean;
  is_approved: boolean;
  is_admin: boolean;
}

export const AdminService = {
    async getPendingUsers(): Promise<User[]> {
        const response = await axios.get<User[]>(`${API_BASE_URL}/api/admin/pending-users`, {
            withCredentials: true
        });
        return response.data;
    },

    async approveUser(userId: number): Promise<void> {
        await axios.post(`${API_BASE_URL}/api/admin/approve-user/${userId}`, {}, {
            headers: { 'x-csrf-token': '1' },
            withCredentials: true
        });
    }
}
