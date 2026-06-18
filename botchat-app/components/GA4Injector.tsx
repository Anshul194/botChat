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
const G_CLIENT_ID_KEY = "ga4_client_id_";

function generateClientId(): string {
    const random = () => Math.floor(Math.random() * 2147483648).toString(16);
    return `${random()}-${random()}`;
}

function getOrCreateClientId(measurementId: string): string {
    const storageKey = G_CLIENT_ID_KEY + measurementId;
    let cid: string | null = null;
    try {
        cid = sessionStorage.getItem(storageKey);
    } catch {}
    if (!cid) {
        cid = generateClientId();
        try {
            sessionStorage.setItem(storageKey, cid);
        } catch {}
    }
    return cid;
}

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

        const isBrowser = typeof window !== "undefined";
        if (!isBrowser) return;

        const win = window as any;

        // Initialize dataLayer and gtag stub once
        win.dataLayer = win.dataLayer || [];
        if (!win.gtag) {
            win.gtag = function gtag(...args: any[]) {
                win.dataLayer.push(args);
            };
        }

        const primaryId = validIds[0];
        const scriptId = GA4_PREFIX + primaryId;

        // Only inject the <script> tag for the primary Measurement ID
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${primaryId}`;
            script.async = true;
            document.head.appendChild(script);
        }

        // Send the standard "js" timestamp signal
        win.gtag("js", new Date());

        // Configure ALL Measurement IDs with send_page_view: false.
        // We send a single manual page_view event afterward so it counts
        // only once across all properties.
        validIds.forEach((measurementId) => {
            const clientId = getOrCreateClientId(measurementId);
            win.gtag("config", measurementId, {
                send_page_view: false,
                client_id: clientId,
            });
        });

        // Fire a single page_view event that gtag.js will broadcast
        // to every configured Measurement ID.
        win.gtag("event", "page_view", {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
        });

        // Cleanup on unmount or when IDs change
        return () => {
            const scriptEl = document.getElementById(scriptId);
            if (scriptEl && scriptEl.parentNode) {
                scriptEl.parentNode.removeChild(scriptEl);
            }
            // Note: gtag dataLayer entries are intentionally NOT removed,
            // as attempting to unwind them would break the analytics flow.
        };
    }, [ga4Pixels]);

    return null;
}
