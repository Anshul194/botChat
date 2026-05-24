"use client";

export default function SmartInboxLoading() {
    return (
        <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-[#1d6ef5] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-neutral-400 font-medium animate-pulse">Loading Smart Inbox...</p>
            </div>
        </div>
    );
}
