"use server";

const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
const internalKey = process.env.INTERNAL_API_KEY || '';

const headers = {
    'X-Internal-Key': internalKey,
    'Content-Type': 'application/json',
};

export async function fetchReportsSummary() {
    try {
        const res = await fetch(`${backendUrl}/api/reports/admin/summary`, {
            headers, cache: 'no-store',
        });
        if (!res.ok) return { success: false, error: `Status ${res.status}` };
        const data = await res.json();
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function fetchCompanyDetails(symbol: string) {
    try {
        const res = await fetch(`${backendUrl}/api/reports/admin/${symbol}/details`, {
            headers, cache: 'no-store',
        });
        if (!res.ok) return { success: false, error: `Status ${res.status}` };
        const data = await res.json();
        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteFiling(symbol: string, filingId: number) {
    try {
        const res = await fetch(`${backendUrl}/api/reports/admin/${symbol}/${filingId}`, {
            method: 'DELETE',
            headers,
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { success: false, error: data.detail || `Status ${res.status}` };
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
