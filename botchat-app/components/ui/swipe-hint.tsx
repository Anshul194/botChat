"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeHintProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  storageKey?: string;
  direction?: "horizontal" | "vertical";
  align?: "left" | "right" | "center";
  className?: string;
}

export function SwipeHint({
  containerRef,
  storageKey,
  direction = "horizontal",
  align = "right",
  className,
}: SwipeHintProps) {
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const key = storageKey || `swipe-hint-${Math.random().toString(36).slice(2, 8)}`;

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored === "dismissed") {
      setDismissed(true);
      setVisible(false);
    }
  }, [key]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || dismissed) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleInteraction = () => {
      setVisible(false);
      localStorage.setItem(key, "dismissed");
      setDismissed(true);
    };

    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleInteraction, 300);
    };

    const onTouchStart = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleInteraction, 500);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });

    const autoHide = setTimeout(handleInteraction, 6000);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("touchstart", onTouchStart);
      clearTimeout(timeout);
      clearTimeout(autoHide);
    };
  }, [containerRef, dismissed, key]);

  if (dismissed) return null;

  const isRight = align === "right";
  const isLeft = align === "left";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: isRight ? 12 : isLeft ? -12 : 0, y: 4 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: isRight ? 12 : isLeft ? -12 : 0 }}
          className={cn(
            "pointer-events-none flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
            direction === "horizontal" ? "flex-row" : "flex-col",
            className
          )}
          style={{ color: "var(--muted-foreground)" }}
        >
          {isLeft && <ChevronLeft className="w-3 h-3" />}
          <span className="animate-pulse">Swipe for more</span>
          {isRight && <ChevronRight className="w-3 h-3" />}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
