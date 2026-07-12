import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface AIProvider {
    id: string;
    name: string;
    active: boolean;
}

export function useAIProviders() {
    const [providers, setProviders] = useState<AIProvider[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProviders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get('/settings/ai/providers');
                if (res.data?.is_success) {
                    setProviders(res.data.data);
                } else {
                    throw new Error(res.data?.message || 'Failed to fetch providers');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProviders();
    }, []);

    return { providers, isLoading, error };
}
