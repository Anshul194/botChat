"use client";

import { useEffect, useState } from "react";
import GA4Injector from "./GA4Injector";

export default function RedirectWithTracking({
    destination,
    ga4Pixels
}: {
    destination: string;
    ga4Pixels?: any[];
}) {
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        // If there are pixels, we wait 500ms for them to fire
        // If there are no pixels, we could redirect immediately, but this component
        // is only mounted when we have pixels (or for consistency).
        const timer = setTimeout(() => {
            setRedirecting(true);
            window.location.href = destination;
        }, 500);

        return () => clearTimeout(timer);
    }, [destination]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <GA4Injector ga4Pixels={ga4Pixels} />
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">
                {redirecting ? "Redirecting..." : "Taking you there..."}
            </p>
        </div>
    );
}
