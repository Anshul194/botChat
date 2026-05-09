'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setInitialized, fetchMe } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const user = JSON.parse(userStr);
                    dispatch(setCredentials({ user, token }));
                    
                    // Always try to sync with server to get fresh email_verified_at
                    try {
                        await dispatch(fetchMe()).unwrap();
                    } catch (fetchErr) {
                        console.warn('Silent sync failed:', fetchErr);
                    }
                }
            } catch (e) {
                console.error('Auth initialization error:', e);
            } finally {
                dispatch(setInitialized());
            }
        };

        initAuth();
    }, [dispatch]);

    return <>{children}</>;
}
