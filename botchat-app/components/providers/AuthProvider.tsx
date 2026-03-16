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
        
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                dispatch(setCredentials({ user, token }));
            } catch (e) {
                // Invalid stored data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
    }, [dispatch]);

    return <>{children}</>;
}
