"use client";

import { useEffect, useState } from "react";

export default function NavigationOverlay() {
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const onStart = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      setLabel(detail?.href || "Loading...");
      setLoading(true);
    };
    const onDone = () => {
      setLoading(false);
      setLabel(null);
    };

    window.addEventListener("nav:start", onStart as EventListener);
    window.addEventListener("nav:done", onDone as EventListener);
    return () => {
      window.removeEventListener("nav:start", onStart as EventListener);
      window.removeEventListener("nav:done", onDone as EventListener);
    };
  }, []);

  if (!loading) return null;

  return (
    <div style={{ zIndex: 9999 }} className="fixed left-4 bottom-4 flex items-center gap-3 bg-card/90 border border-border/30 px-4 py-2 rounded-full shadow-lg">
      <div className="w-3 h-3 rounded-full animate-pulse bg-primary" />
      <div className="text-sm font-medium">Navigating{label ? ` — ${label.replace(/.*\//, '')}` : ""}</div>
    </div>
  );
}
