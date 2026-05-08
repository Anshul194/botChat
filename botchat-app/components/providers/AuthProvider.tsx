'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setInitialized, fetchMe } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Only access localStorage on client after mount
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        const initAuth = async () => {
            if (token && userStr) {
                try {
                    const user = JSON.parse(userStr);
                    dispatch(setCredentials({ user, token }));
                    
                    // Sync with server to get latest data (like email_verified_at)
                    await dispatch(fetchMe()).unwrap();
                } catch (e) {
                    // Invalid stored data or fetch failed
                    console.error('Auth initialization failed:', e);
                    // We don't remove token immediately on fetch failure to allow retry 
                    // unless it's a parse error
                    if (e instanceof SyntaxError) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                }
            }
            dispatch(setInitialized());
        };

        initAuth();
    }, [dispatch]);

    return <>{children}</>;
}
