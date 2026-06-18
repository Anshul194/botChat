"use client";

import { useEffect } from "react";

interface GA4Pixel {
    id: number;
    name: string;
    measurement_id: string;
}

interface GA4InjectorProps {
    ga4Pixels?: GA4Pixel[];
}

const GA4_PREFIX = "ga4-gtag-";

export default function GA4Injector({ ga4Pixels }: GA4InjectorProps) {
    useEffect(() => {
        if (!ga4Pixels || ga4Pixels.length === 0) return;

        const validIds = [
            ...new Set(
                ga4Pixels
                    .map((p) => p.measurement_id)
                    .filter((id) => /^G-[A-Z0-9]+$/i.test(id ?? ""))
            ),
        ] as string[];

        if (validIds.length === 0) return;

        if (typeof window === "undefined") return;

        const win = window as any;

        // Initialize dataLayer and gtag stub once
        win.dataLayer = win.dataLayer || [];
        if (!win.gtag) {
            win.gtag = function gtag(...args: any[]) {
                win.dataLayer.push(args);
            };
        }

        // Load gtag.js for the primary Measurement ID only (it supports multiple configs)
        const primaryId = validIds[0];
        const scriptId = GA4_PREFIX + primaryId;

        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
            script.async = true;
            document.head.appendChild(script);
        }

        // Standard gtag init
        win.gtag("js", new Date());

        // Primary ID: auto-fires page_view (Google-standard behavior, guaranteed to work)
        win.gtag("config", primaryId, { send_page_view: true });

        // Secondary IDs: no automatic page_view to avoid double-counting
        for (let i = 1; i < validIds.length; i++) {
            win.gtag("config", validIds[i], { send_page_view: false });
        }

        // Cleanup on unmount
        return () => {
            const scriptEl = document.getElementById(scriptId);
            if (scriptEl && scriptEl.parentNode) {
                scriptEl.parentNode.removeChild(scriptEl);
            }
        };
    }, [ga4Pixels]);

    return null;
}
