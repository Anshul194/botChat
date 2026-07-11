import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { isCentralAdminApp } from '@/lib/config';

let cachedSettings: { facebookEnabled: boolean; googleEnabled: boolean } | null = null;
let fetchPromise: Promise<{ facebookEnabled: boolean; googleEnabled: boolean }> | null = null;

export function useSocialLoginSettings() {
    const [settings, setSettings] = useState<{ facebookEnabled: boolean; googleEnabled: boolean }>({
        facebookEnabled: false,
        googleEnabled: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If this is the central admin app, social login is ALWAYS disabled
        if (isCentralAdminApp()) {
            setIsLoading(false);
            return;
        }

        // If we already have the settings in memory, use them immediately
        if (cachedSettings) {
            setSettings(cachedSettings);
            setIsLoading(false);
            return;
        }

        // Avoid multiple concurrent API calls if multiple components mount simultaneously
        if (!fetchPromise) {
            fetchPromise = api.get('/settings/social-login')
                .then(response => {
                    const data = response.data.data;
                    const parsedSettings = {
                        facebookEnabled: !!data?.facebook?.enabled,
                        googleEnabled: !!data?.google?.enabled,
                    };
                    cachedSettings = parsedSettings;
                    return parsedSettings;
                })
                .catch(err => {
                    console.error('Failed to fetch social login settings', err);
                    return { facebookEnabled: false, googleEnabled: false };
                });
        }

        fetchPromise.then(resolvedSettings => {
            setSettings(resolvedSettings);
            setIsLoading(false);
        });
    }, []);

    return {
        facebookEnabled: settings.facebookEnabled,
        googleEnabled: settings.googleEnabled,
        isLoading
    };
}
