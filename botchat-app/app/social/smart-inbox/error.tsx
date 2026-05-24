"use client";

import { useEffect } from "react";

export default function SmartInboxError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Smart Inbox Error:", error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-80px)] w-full flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold text-red-500">Something went wrong!</h2>
            <p className="text-sm text-neutral-400 max-w-md text-center">
                {error.message || "Failed to load Smart Inbox. Please check your network connection or try again."}
            </p>
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-[#1d6ef5] text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 active:scale-95 transition-all"
            >
                Try again
            </button>
        </div>
    );
}
