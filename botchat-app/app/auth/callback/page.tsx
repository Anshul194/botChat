'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, fetchMe } from '@/store/slices/authSlice';
import { toast } from 'sonner';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        // Check if we are currently inside a popup window
        const isPopup = window.opener && window.opener !== window;

        if (error) {
            toast.error(error || 'Authentication failed');
            if (isPopup) {
                window.close();
            } else {
                router.push('/auth/sign-in');
            }
            return;
        }

        if (token) {
            // Save token to localStorage so the main window can pick it up
            localStorage.setItem('token', token);
            
            if (isPopup) {
                // If it's a popup, just close it. The parent window's pollTimer will 
                // detect the closure, check localStorage, fetch user, and navigate to dashboard.
                window.close();
                return; // Stop execution here
            }

            // Fallback for non-popup flow (e.g., standard browser redirect)
            dispatch(fetchMe()).then((action) => {
                if (fetchMe.fulfilled.match(action)) {
                    const user = action.payload;
                    const name = user?.name || user?.email?.split('@')[0] || 'User';
                    
                    toast.success(`Welcome back, ${name}!`, {
                        description: "You've successfully connected via social login."
                    });
                    
                    router.push('/dashboard');
                } else {
                    toast.error('Failed to retrieve user information');
                    router.push('/auth/sign-in');
                }
            });
        } else {
            // No token found, redirect back
            if (isPopup) {
                window.close();
            } else {
                router.push('/auth/sign-in');
            }
        }
    }, [router, searchParams, dispatch]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#06030f] text-white">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-pink-500 rounded-full blur-xl animate-pulse" />
                </div>
            </div>
            <h2 className="mt-8 text-xl font-bold tracking-tight">Finalizing authentication...</h2>
            <p className="mt-2 text-muted-foreground text-sm">Please wait while we set up your session.</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#06030f]">
                <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
