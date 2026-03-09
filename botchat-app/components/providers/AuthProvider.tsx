'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { fetchMe } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(fetchMe());
        }
    }, [dispatch]);

    return <>{children}</>;
}
