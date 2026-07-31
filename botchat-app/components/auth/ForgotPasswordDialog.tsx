"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export function ForgotPasswordDialog() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [step, setStep] = useState<"email" | "sent" | "error">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            setStep("sent");
        } catch (err: any) {
            setStep("error");
            setError(err?.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setStep("email");
        setEmail("");
        setError("");
    };

    return (
        <>
            <Button
                variant="link"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--primary)" }}
                onClick={() => setOpen(true)}
            >
                Forgot password?
            </Button>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[420px] rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl p-0 overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary to-primary" />
                    <div className="px-5 sm:px-8 pt-8 pb-6">
                        <DialogHeader>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-primary" />
                            </div>
                            <DialogTitle className="text-xl font-black tracking-tight">
                                Reset your password
                            </DialogTitle>
                            <DialogDescription className="text-sm mt-2">
                                Enter your email and we&apos;ll send you a link to reset your password.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "email" ? (
                            <motion.form
                                key="email-form"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                onSubmit={handleSubmit}
                                className="px-5 sm:px-8 pb-6 space-y-4"
                            >
                                <div className="space-y-1.5">
                                    <Label htmlFor="reset-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Email address
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                                        <Input
                                            id="reset-email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="you@company.com"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                            className="w-full pl-10 h-12 rounded-xl text-sm"
                                        />
                                    </div>
                                </div>
                                {error && (
                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                        className="text-xs flex items-center gap-1.5 px-3 py-2.5 rounded-lg"
                                        style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--destructive) 25%, transparent)" }}>
                                        {error}
                                    </motion.p>
                                )}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl font-black text-sm text-white gap-2"
                                    style={{ background: "linear-gradient(135deg, #1e5fd4 0%, #6366f1 100%)", boxShadow: "0 4px 20px rgba(30,95,212,0.30)" }}
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Mail className="w-4 h-4" /> Send Reset Link</>
                                    )}
                                </Button>
                            </motion.form>
                        ) : step === "sent" ? (
                            <motion.div
                                key="sent"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="px-5 sm:px-8 pb-8 pt-4 flex flex-col items-center text-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: "color-mix(in srgb, #10b981 12%, transparent)" }}>
                                    <CheckCircle2 className="w-8 h-8" style={{ color: "#10b981" }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black tracking-tight">Check your inbox</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We&apos;ve sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Didn&apos;t receive it? Check your spam folder or{" "}
                                        <button onClick={() => setStep("email")} className="font-semibold underline" style={{ color: "var(--primary)" }}>
                                            try again
                                        </button>.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full rounded-xl font-bold mt-2" onClick={handleClose}>
                                    Back to Sign In
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="px-5 sm:px-8 pb-8 pt-4 flex flex-col items-center text-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ background: "color-mix(in srgb, var(--destructive) 12%, transparent)" }}>
                                    <Mail className="w-8 h-8" style={{ color: "var(--destructive)" }} />
                                </div>
                                <h3 className="text-lg font-black tracking-tight">Something went wrong</h3>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <Button className="w-full rounded-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #1e5fd4 0%, #6366f1 100%)" }} onClick={() => setStep("email")}>
                                    Try Again
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
    );
}