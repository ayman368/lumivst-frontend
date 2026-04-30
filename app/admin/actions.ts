"use server";

export async function triggerScraperAction(endpointPath: string) {
    // 1. يبني الـ URL الكامل من متغير السيرفر (مش من المتصفح)
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    const internalKey = process.env.INTERNAL_API_KEY || '';
    const fullUrl = `${backendUrl}${endpointPath}`;
    
    try {
        const res = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });
        
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { success: false, error: data.detail || `Failed (Status ${res.status})` };
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
