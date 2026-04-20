"use server";

export async function triggerScraperAction(endpointUrl: string) {
    // 1. يقرأ الـ Key بشكل سري على السيرفر (لن يذهب للمتصفح أبداً)
    const internalKey = process.env.INTERNAL_API_KEY || ''; 
    
    try {
        // 2. السيرفر هو من ينادي الـ Backend ويرفق المفتاح بأمان
        const res = await fetch(endpointUrl, {
            method: 'GET',
            headers: {
                'X-Internal-Key': internalKey,
                'Content-Type': 'application/json'
            },
            cache: 'no-store' // لضمان عدم تخزين النتيجة مؤقتاً
        });
        
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { success: false, error: data.detail || `Failed to trigger scraper (Status ${res.status})` };
        }
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
