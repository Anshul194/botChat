import { useState, useEffect } from 'react';
import api from '../lib/api';

export interface AIModel {
    id: string;
    name: string;
}

export function useAIModels(provider: string | undefined, apiKey: string | undefined) {
    const [models, setModels] = useState<AIModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!provider || !apiKey) {
            setModels([]);
            setError(null);
            return;
        }

        const fetchModels = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get(`/settings/ai/providers/${provider}/models`, {
                    params: { api_key: apiKey }
                });
                if (res.data?.is_success) {
                    setModels(res.data.data);
                } else {
                    throw new Error(res.data?.message || 'Failed to fetch models');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setModels([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchModels();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [provider, apiKey]);

    return { models, isLoading, error };
}
