import axios from 'axios';
import Cookies from 'js-cookie';
import { User } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;

export const AdminService = {
    async getPendingUsers(): Promise<User[]> {
        const token = Cookies.get('session_token');
        const response = await axios.get<User[]>(`${API_URL}/admin/pending-users`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async approveUser(userId: number): Promise<void> {
        const token = Cookies.get('session_token');
        await axios.post(`${API_URL}/admin/approve-user/${userId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}
