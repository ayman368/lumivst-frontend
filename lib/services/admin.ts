import axios from 'axios';
import { User } from './auth';

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
            withCredentials: true
        });
    }
}
