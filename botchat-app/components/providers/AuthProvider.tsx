'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Only access localStorage on client after mount
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('[Auth] Restoring session from localStorage...');
        console.log('[Auth] Token found:', !!token);
        console.log('[Auth] User found:', !!userStr);

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                console.log('[Auth] Session restored for:', user.email);
                dispatch(setCredentials({ user, token }));
            } catch (e) {
                console.error('[Auth] Failed to parse stored user data:', e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            console.warn('[Auth] No session found in localStorage.');
        }
    }, [dispatch]);

    return <>{children}</>;
}
