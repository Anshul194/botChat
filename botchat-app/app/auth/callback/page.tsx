'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials, fetchMe } from '@/store/slices/authSlice';
import { useModal } from '@/components/providers/ModalProvider';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const { showModal } = useModal();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        // Check if we are currently inside a popup window
        const isPopup = window.opener && window.opener !== window;

        if (error) {
            if (isPopup) {
                window.opener.postMessage({ type: 'oauth-error', error: error || 'Authentication failed' }, window.location.origin);
                window.close();
                return;
            }
            showModal("error", "Auth Error", error || 'Authentication failed');
            router.push('/auth/sign-in');
            return;
        }

        if (token) {
            if (isPopup) {
                window.opener.postMessage({ type: 'oauth-success', token }, window.location.origin);
                window.close();
                return;
            }

            localStorage.setItem('token', token);

            // Fallback for non-popup flow (e.g., standard browser redirect)
            dispatch(fetchMe()).then((action) => {
                if (fetchMe.fulfilled.match(action)) {
                    const user = action.payload;
                    const name = user?.name || user?.email?.split('@')[0] || 'User';
                    
                    showModal("success", "Welcome Back!", `Welcome back, ${name}! You've successfully connected via social login.`);
                    
                    router.push('/dashboard');
                } else {
                    showModal("error", "Error", 'Failed to retrieve user information');
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
    }, [router, searchParams, dispatch, showModal]);

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
