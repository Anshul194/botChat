'use client';

import { useEffect, Suspense } from 'react';
import { CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function SocialSuccessContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get('status');
    const skipped = searchParams.get('skipped');
    
    const isPartial = status === 'partial';

    useEffect(() => {
        // Notify the opener window that the connection was successful (even if partial)
        if (window.opener) {
            window.opener.postMessage({ type: 'SOCIAL_CONNECTION_SUCCESS' }, window.location.origin);
        }

        // Automatically close the popup after a short delay
        const timer = setTimeout(() => {
            window.close();
            // Fallback for some browsers if window.close() is blocked
            setTimeout(() => {
                if (!window.closed) {
                    console.log("Window could not be closed automatically.");
                }
            }, 500);
        }, isPartial ? 5000 : 2000); // Wait longer if partial so user can read it

        return () => clearTimeout(timer);
    }, [isPartial]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#06030f] text-white p-6 overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none ${isPartial ? 'bg-orange-600/10' : 'bg-blue-600/10'}`} />
            
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
                        className={`w-24 h-24 rounded-[32px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] ${isPartial ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-[0_0_40px_rgba(249,115,22,0.4)]' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}
                    >
                        {isPartial ? (
                            <AlertTriangle className="w-12 h-12 text-white" />
                        ) : (
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        )}
                    </motion.div>
                    
                    {/* Animated Sparkles */}
                    {!isPartial && (
                        <div className="absolute -top-4 -right-4">
                            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black tracking-tight mb-4 uppercase">
                    {isPartial ? 'Partial Success' : 'Identity Connected'}
                </h1>
                
                {isPartial ? (
                    <div className="text-neutral-400 font-medium leading-relaxed">
                        <p className="mb-2 text-orange-400">Some pages were not connected because they already belong to another workspace.</p>
                        {skipped && (
                            <p className="text-sm opacity-80 break-words">Skipped: {skipped}</p>
                        )}
                        <p className="mt-4 text-xs opacity-50">This window will close automatically.</p>
                    </div>
                ) : (
                    <p className="text-neutral-400 font-medium leading-relaxed">
                        Your account has been securely linked to your dashboard. This window will close automatically.
                    </p>
                )}

                <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    <div className={`w-1.5 h-1.5 rounded-full animate-ping ${isPartial ? 'bg-orange-500' : 'bg-blue-500'}`} />
                    Syncing Workspace...
                </div>

                <button 
                    onClick={() => window.close()}
                    className="mt-8 px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-colors uppercase tracking-widest"
                >
                    Close Window
                </button>
            </motion.div>
        </div>
    );
}

export default function SocialSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#06030f]" />}>
            <SocialSuccessContent />
        </Suspense>
    );
}
