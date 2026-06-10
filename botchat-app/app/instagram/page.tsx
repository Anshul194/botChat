'use client';

import { useEffect } from 'react';
import { CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import PageMeta from '@/components/PageMeta';
import { Suspense } from 'react';

function InstagramCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const status = searchParams.get('status');

    useEffect(() => {
        // If it's a popup, notify the opener and close
        if (typeof window !== 'undefined' && window.opener) {
            if (status === 'success') {
                window.opener.postMessage({ type: 'SOCIAL_CONNECTION_SUCCESS' }, window.location.origin);
            }
            
            // Automatically close the popup after a short delay
            const timer = setTimeout(() => {
                window.close();
            }, 2000);

            return () => clearTimeout(timer);
        } else if (typeof window !== 'undefined') {
            // If it's not a popup (user navigated directly), redirect to dashboard
            if (status === 'success') {
                const timer = setTimeout(() => {
                    router.push('/dashboard/instagram');
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [status, router]);

    return (
        <>
            <PageMeta
                title="Connecting Instagram — BotChat"
                description="Connecting your Instagram account to BotChat."
                noindex
            />
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#06030f] text-white p-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative z-10 flex flex-col items-center text-center max-w-sm"
            >
                <div className="relative mb-8">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2 
                        }}
                        className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[32px] flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.4)]"
                    >
                        {status === 'success' ? (
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        ) : (
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        )}
                    </motion.div>
                    
                    {/* Animated Sparkles */}
                    {status === 'success' && (
                        <div className="absolute -top-4 -right-4">
                            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black tracking-tight mb-4 uppercase">
                    {status === 'success' ? 'Instagram Linked' : 'Processing...'}
                </h1>
                <p className="text-neutral-400 font-medium leading-relaxed">
                    {status === 'success' 
                        ? 'Your Instagram account has been securely connected. This window will close automatically.' 
                        : 'We are completing your connection. Please wait a moment.'}
                </p>

                <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
                    Finalizing Connection...
                </div>

                <button 
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.opener) window.close();
                        else router.push('/dashboard/instagram');
                    }}
                    className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-widest"
                >
                    {(typeof window !== 'undefined' && window.opener) ? 'Close Window' : 'Go to Dashboard'}
                </button>
            </motion.div>
        </div>
        </>
    );
}

export default function InstagramCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#06030f]">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            </div>
        }>
            <InstagramCallback />
        </Suspense>
    );
}

