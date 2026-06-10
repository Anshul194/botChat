"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, MessageSquare, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import PageMeta from "@/components/PageMeta";
import { useTheme } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppDispatch } from "@/store/hooks";
import { verifyEmail } from "@/store/slices/authSlice";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { theme } = useTheme();
    const isLight = theme === "light";

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email address...");
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid or missing verification token.");
            return;
        }

        const handleVerify = async () => {
            try {
                await dispatch(verifyEmail(token)).unwrap();
                setStatus("success");
                setMessage("Your email has been successfully verified! You can now access all features of BotChat.");
                
                // Auto redirect after 3 seconds
                setTimeout(() => {
                    router.push("/dashboard");
                }, 3000);
            } catch (err: any) {
                setStatus("error");
                setMessage(typeof err === 'string' ? err : err?.message || "Verification failed. The link may have expired.");
            }
        };

        handleVerify();
    }, [token, dispatch, router]);

    return (
        <>
            <PageMeta
                title="Verify Email — BotChat"
                description="Verify your email address to activate your BotChat account."
                noindex
            />
            <div className="min-h-screen flex flex-col" style={{ background: isLight ? "#fdf2f8" : "#06030f" }}>
            {/* Topbar */}
            <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}>
                        <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight" style={{
                        background: "linear-gradient(135deg, #ec4899, #a855f7)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                    }}>BotChat</span>
                </div>
                <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md relative">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
                        style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }} />
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
                        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />

                    <div className="relative z-10 p-8 rounded-3xl shadow-2xl border transition-all duration-500"
                        style={{ 
                            background: isLight ? "rgba(255,255,255,0.8)" : "rgba(15,10,31,0.6)",
                            backdropFilter: "blur(20px)",
                            borderColor: isLight ? "rgba(236,72,153,0.1)" : "rgba(236,72,153,0.1)"
                        }}>
                        
                        <div className="flex flex-col items-center text-center">
                            {status === "loading" && (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                    style={{ background: "rgba(236,72,153,0.1)" }}>
                                    <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
                                </div>
                            )}

                            {status === "success" && (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                    style={{ background: "rgba(34,197,94,0.1)" }}>
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                            )}

                            {status === "error" && (
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                    style={{ background: "rgba(239,68,68,0.1)" }}>
                                    <XCircle className="w-10 h-10 text-red-500" />
                                </div>
                            )}

                            <h1 className="text-2xl font-extrabold mb-3" style={{ color: isLight ? "#1e1b4b" : "#f8fafc" }}>
                                {status === "loading" && "Verifying Email"}
                                {status === "success" && "Success!"}
                                {status === "error" && "Verification Failed"}
                            </h1>

                            <p className="text-sm leading-relaxed mb-8" style={{ color: isLight ? "#64748b" : "#94a3b8" }}>
                                {message}
                            </p>

                            {status === "success" && (
                                <Link href="/dashboard"
                                    className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                                    style={{
                                        background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                                        boxShadow: "0 4px 20px rgba(236,72,153,0.35)"
                                    }}>
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}

                            {status === "error" && (
                                <div className="w-full space-y-3">
                                    <Link href="/auth/sign-in"
                                        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                                        style={{
                                            background: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
                                            boxShadow: "0 4px 20px rgba(236,72,153,0.35)"
                                        }}>
                                        Back to Sign In
                                    </Link>
                                    <p className="text-xs" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                                        Need help? <Link href="#" className="underline">Contact Support</Link>
                                    </p>
                                </div>
                            )}

                            {status === "loading" && (
                                <div className="flex items-center gap-2 text-xs font-medium" style={{ color: isLight ? "#94a3b8" : "#64748b" }}>
                                    <Mail className="w-3.5 h-3.5" />
                                    Security check in progress...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-8 text-center text-xs" style={{ color: isLight ? "#94a3b8" : "#475569" }}>
                &copy; 2026 BotChat. All rights reserved.
            </div>
        </div>
        </>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#06030f]">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
