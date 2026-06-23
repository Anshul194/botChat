'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, setInitialized, fetchMe } from '@/store/slices/authSlice';
import { fetchPlans, fetchMyPlan } from '@/store/slices/plansSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');

                if (token && userStr) {
                    const rawUser = JSON.parse(userStr);
                    const user = {
                        ...rawUser,
                        role: rawUser.type === 'Super Admin' ? 'SUPER_ADMIN' :
                            rawUser.type === 'Reseller' ? 'RESELLER' :
                                rawUser.type === 'Tenant' ? 'TENANT' :
                                    rawUser.type === 'Admin' ? 'SUPER_ADMIN' : rawUser.type
                    };
                    // 1. Restore auth immediately from localStorage
                    dispatch(setCredentials({ user, token }));
                    // 2. Fetch critical app data right away
                    dispatch(fetchMyPlan());
                    dispatch(fetchPlans());
                    // 3. Silently validate & refresh user from server
                    dispatch(fetchMe());
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
