"use client";

import { useState } from "react";
import { AlertCircle, Mail, Loader2, CheckCircle2, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resendVerification } from "@/store/slices/authSlice";

export default function VerificationBanner() {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    // If user is already verified or banner is dismissed, don't show it
    if (!user || user.email_verified_at || dismissed) {
        return null;
    }

    const handleResend = async () => {
        setLoading(true);
        setError(null);
        try {
            await dispatch(resendVerification()).unwrap();
            setSent(true);
            // Reset "sent" state after 5 seconds to allow retry if needed
            setTimeout(() => setSent(false), 5000);
        } catch (err: any) {
            setError(typeof err === 'string' ? err : err?.message || "Failed to send email.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div 
                className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 mb-6 rounded-2xl border transition-all duration-300"
                style={{ 
                    background: "linear-gradient(90deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)",
                    borderColor: "rgba(236,72,153,0.2)",
                    backdropFilter: "blur(8px)"
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                        style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}>
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-[#f8fafc] flex items-center gap-2">
                            Verify your email address
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                                REQUIRED
                            </span>
                        </h4>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                            Check your inbox for a verification link to unlock all features of BotChat.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {sent ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-4 h-4" />
                            Email Sent!
                        </div>
                    ) : error ? (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                            <button onClick={() => setError(null)} className="ml-1 hover:text-white">Retry</button>
                        </div>
                    ) : (
                        <button
                            onClick={handleResend}
                            disabled={loading}
                            className="flex-1 md:flex-none h-10 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-xs text-white transition-all active:scale-95 disabled:opacity-70 shadow-lg shadow-pink-500/20"
                            style={{ background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)" }}
                        >
                            {loading ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                            ) : (
                                <>Resend Verification Email</>
                            )}
                        </button>
                    )}

                    <button 
                        onClick={() => setDismissed(true)}
                        className="p-2 rounded-lg hover:bg-white/10 text-[#64748b] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-xl opacity-50 -z-10" />
        </div>
    );
}
