'use client';
import { useState } from 'react';

export default function TestConnectionPage() {
    const [status, setStatus] = useState('Idle');
    const [result, setResult] = useState('');

    const testConnection = async () => {
        setStatus('Testing...');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/auth/me', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (res.status === 401) {
                setResult('✅ Connection Successful (401 Unauthorized - Expected)');
            } else if (res.ok) {
                setResult('✅ Connection Successful (200 OK)');
            } else {
                setResult(`❌ Connection Failed (Status: ${res.status})`);
            }
        } catch (e: any) {
            setResult(`❌ Network Error: ${e.message}`);
        } finally {
            setStatus('Done');
        }
    };

    return (
        <div className="p-10">
            <h1 className="text-2xl mb-4">Test Backend Connection</h1>
            <button
                onClick={testConnection}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Test Connection to 127.0.0.1:8000
            </button>
            <div className="mt-4">
                <p>Status: {status}</p>
                <p className="font-bold">{result}</p>
            </div>
        </div>
    );
}
