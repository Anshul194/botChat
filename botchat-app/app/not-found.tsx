"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center min-h-screen"
            style={{
                background: "color-mix(in srgb, var(--background) 96%, transparent)",
                color: "var(--foreground)",
                fontFamily: "var(--app-font-family, var(--font-inter), sans-serif)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center text-center px-6">
                <motion.div
                    initial={{ scale: 0.7, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="relative"
                >
                    <motion.span
                        className="text-[120px] sm:text-[160px] font-black leading-none block"
                        style={{
                            background: "var(--brand-gradient)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                        initial={{ opacity: 0, rotate: -10 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        404
                    </motion.span>

                    <motion.div
                        className="absolute -top-8 -right-12 text-6xl font-black opacity-10"
                        style={{ color: "var(--muted-foreground)" }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 0.1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        !
                    </motion.div>
                </motion.div>

                <motion.h1
                    className="text-2xl sm:text-3xl font-black mt-6"
                    style={{
                        background: "linear-gradient(90deg, var(--foreground) 30%, var(--primary) 90%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Page Not Found
                </motion.h1>

                <motion.p
                    className="text-sm font-medium mt-4 max-w-md"
                    style={{ color: "var(--muted-foreground)" }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    The page you’re looking for doesn’t exist or has been moved.
                    Double-check the URL or head back to your dashboard.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-3 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.04, x: 3 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
                            style={{
                                background: "var(--brand-gradient)",
                                color: "var(--primary-foreground)",
                            }}
                        >
                            <Home className="w-4 h-4" />
                            Go to Dashboard
                        </motion.button>
                    </Link>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => window.history.back()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all"
                        style={{
                            background: "var(--glass-bg)",
                            border: "1px solid var(--glass-border)",
                            color: "var(--foreground)",
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </motion.button>
                </motion.div>

                <motion.div
                    className="mt-8 flex items-center gap-2 text-xs"
                    style={{ color: "var(--muted-foreground)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <Search className="w-3 h-3" />
                    <span>Tip: Use the sidebar navigation to find what you need.</span>
                </motion.div>
            </div>
        </motion.div>
    );
}
