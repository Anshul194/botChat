"use client";

import { useEffect, useState } from "react";
import GA4Injector from "./GA4Injector";

const DEFAULT_DELAY = 800;
const DELAY_MS = (() => {
    if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GA4_REDIRECT_DELAY) {
        const parsed = parseInt(process.env.NEXT_PUBLIC_GA4_REDIRECT_DELAY, 10);
        if (!isNaN(parsed) && parsed >= 100 && parsed <= 10000) return parsed;
    }
    return DEFAULT_DELAY;
})();

export default function RedirectWithTracking({
    destination,
    ga4Pixels
}: {
    destination: string;
    ga4Pixels?: any[];
}) {
    const [redirecting, setRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!destination || destination.trim() === "") {
            setError("No destination URL provided.");
            return;
        }

        let url: URL;
        try {
            url = new URL(destination);
        } catch {
            setError("Invalid destination URL.");
            return;
        }

        const timer = setTimeout(() => {
            setRedirecting(true);
            window.location.href = url.toString();
        }, DELAY_MS);

        return () => clearTimeout(timer);
    }, [destination]);

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--muted)]/50 flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
                <p className="text-[var(--muted-foreground)] font-medium mb-2">Unable to redirect</p>
                <p className="text-[var(--muted-foreground)]/70 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--muted)]/50 flex flex-col items-center justify-center p-4">
            <GA4Injector ga4Pixels={ga4Pixels} />
            <div className="w-12 h-12 rounded-full border-4 border-[var(--border)] border-t-blue-500 animate-spin mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">
                {redirecting ? "Redirecting..." : "Taking you there..."}
            </p>
        </div>
    );
}
