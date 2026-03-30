'use client';

import { useEffect } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SocialSuccessPage() {
    useEffect(() => {
        // Notify the opener window that the connection was successful
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
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#06030f] text-white p-6 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            
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
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)]"
                    >
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </motion.div>
                    
                    {/* Animated Sparkles */}
                    <div className="absolute -top-4 -right-4">
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                    </div>
                </div>

                <h1 className="text-3xl font-black tracking-tight mb-4 uppercase">Identity Connected</h1>
                <p className="text-neutral-400 font-medium leading-relaxed">
                    Your Facebook identity has been securely linked to your dashboard. This window will close automatically.
                </p>

                <div className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
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
