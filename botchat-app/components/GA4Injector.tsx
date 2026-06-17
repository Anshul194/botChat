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

/**
 * GA4Injector
 *
 * Dynamically loads Google Tag (gtag.js) for each assigned GA4 Measurement ID.
 * - Deduplicates: each Measurement ID is only loaded once per page lifecycle.
 * - Safe: validates G-XXXXXXXXXX format before injection.
 * - Non-blocking: uses async script loading.
 * - Multi-tenant safe: works across Bio Links, VCards, and Short Links.
 */
export default function GA4Injector({ ga4Pixels }: GA4InjectorProps) {
    useEffect(() => {
        if (!ga4Pixels || ga4Pixels.length === 0) return;

        // Validate and de-duplicate Measurement IDs
        const validIds = [
            ...new Set(
                ga4Pixels
                    .map((p) => p.measurement_id)
                    .filter((id) => /^G-[A-Z0-9]+$/i.test(id ?? ""))
            ),
        ];

        if (validIds.length === 0) return;

        // Initialize window.dataLayer and gtag if not already present
        if (typeof window !== "undefined") {
            (window as any).dataLayer = (window as any).dataLayer || [];
            if (!(window as any).gtag) {
                (window as any).gtag = function (...args: any[]) {
                    (window as any).dataLayer.push(args);
                };
            }
            (window as any).gtag("js", new Date());
        }

        // Load gtag.js script for the first Measurement ID (it supports multiple configs)
        const primaryId = validIds[0];
        const scriptId = `ga4-gtag-${primaryId}`;

        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
            script.async = true;
            document.head.appendChild(script);
        }

        // Configure each Measurement ID
        validIds.forEach((measurementId) => {
            if (typeof (window as any).gtag === "function") {
                (window as any).gtag("config", measurementId, {
                    send_page_view: true,
                });
            }
        });
    }, [ga4Pixels]);

    // Nothing rendered — this is a side-effect-only component
    return null;
}
