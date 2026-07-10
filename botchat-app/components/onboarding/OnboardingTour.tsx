"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    createContext,
    useContext,
} from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, SkipForward, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTour } from "./useTour";
import tourSteps, { TourStep, TourPlacement } from "./tourSteps";

const SHIMMER_STYLE = `
@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Context — allows any child to call startTour()
// ─────────────────────────────────────────────────────────────────────────────
interface TourContextValue {
    startTour: () => void;
    isOpen: boolean;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTourContext() {
    const ctx = useContext(TourContext);
    if (!ctx) throw new Error("useTourContext must be used inside <OnboardingTourProvider>");
    return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const PADDING = 12; // spotlight ring padding

interface Rect {
    top: number;
    left: number;
    width: number;
    height: number;
}

function getTargetRect(selector: string): Rect | null {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function computeTooltipPos(
    rect: Rect | null,
    placement: TourPlacement,
    tooltipW: number,
    tooltipH: number,
    vpW: number,
    vpH: number
): { top: number; left: number } {
    if (!rect) {
        // center of screen
        return { top: vpH / 2 - tooltipH / 2, left: vpW / 2 - tooltipW / 2 };
    }

    const gap = 18;
    let top = 0;
    let left = 0;

    switch (placement) {
        case "top":
            top = rect.top - tooltipH - gap;
            left = rect.left + rect.width / 2 - tooltipW / 2;
            break;
        case "bottom":
            top = rect.top + rect.height + gap;
            left = rect.left + rect.width / 2 - tooltipW / 2;
            break;
        case "left":
            top = rect.top + rect.height / 2 - tooltipH / 2;
            left = rect.left - tooltipW - gap;
            break;
        case "right":
            top = rect.top + rect.height / 2 - tooltipH / 2;
            left = rect.left + rect.width + gap;
            break;
        case "center":
        default:
            top = vpH / 2 - tooltipH / 2;
            left = vpW / 2 - tooltipW / 2;
            break;
    }

    // Clamp within viewport
    left = Math.max(16, Math.min(left, vpW - tooltipW - 16));
    top = Math.max(16, Math.min(top, vpH - tooltipH - 16));

    return { top, left };
}

// ─────────────────────────────────────────────────────────────────────────────
// Spotlight mask (SVG cutout)
// ─────────────────────────────────────────────────────────────────────────────
function SpotlightMask({ rect }: { rect: Rect | null }) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
    const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

    if (!rect) {
        return (
            <div className="fixed inset-0 z-[9990] pointer-events-none"
                style={{ background: "rgba(0,0,0,0.65)" }} />
        );
    }

    const x = rect.left - PADDING;
    const y = rect.top - PADDING;
    const w = rect.width + PADDING * 2;
    const h = rect.height + PADDING * 2;
    const r = 12;

    return (
        <svg
            className="fixed inset-0 z-[9990] pointer-events-none"
            width={vw}
            height={vh}
            viewBox={`0 0 ${vw} ${vh}`}
            style={{ position: "fixed", top: 0, left: 0 }}
        >
            <defs>
                <mask id="tour-spotlight-mask">
                    <rect width={vw} height={vh} fill="white" />
                    <rect x={x} y={y} width={w} height={h} rx={r} ry={r} fill="black" />
                </mask>
            </defs>
            <rect
                width={vw}
                height={vh}
                fill="rgba(0,0,0,0.68)"
                mask="url(#tour-spotlight-mask)"
            />
            {/* Glow ring around target */}
            <rect
                x={x - 2}
                y={y - 2}
                width={w + 4}
                height={h + 4}
                rx={r + 2}
                ry={r + 2}
                fill="none"
                stroke="var(--primary, #6C5CE7)"
                strokeWidth="2"
                strokeDasharray="6 3"
                opacity="0.8"
            >
                <animate attributeName="stroke-dashoffset" from="0" to="-18" dur="1.5s" repeatCount="indefinite" />
            </rect>
        </svg>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step progress dots
// ─────────────────────────────────────────────────────────────────────────────
function StepDots({
    total,
    current,
    onDotClick,
}: {
    total: number;
    current: number;
    onDotClick: (i: number) => void;
}) {
    // Show max 10 dots, rest as ellipsis
    const maxDots = 10;
    const dots = total <= maxDots ? Array.from({ length: total }, (_, i) => i)
        : [
            ...Array.from({ length: Math.min(current + 1, maxDots - 1) }, (_, i) => i),
        ].slice(0, maxDots);

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(total, maxDots) }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onDotClick(i)}
                    aria-label={`Go to step ${i + 1}`}
                    className={cn(
                        "rounded-full transition-all duration-300 focus:outline-none",
                        i === current
                            ? "w-5 h-2 bg-[var(--primary,#6C5CE7)]"
                            : i < current
                                ? "w-2 h-2 bg-[var(--primary,#6C5CE7)] opacity-50"
                                : "w-2 h-2 bg-white/20 hover:bg-white/40"
                    )}
                />
            ))}
            {total > maxDots && (
                <span className="text-[10px] text-white/40 ml-1">+{total - maxDots}</span>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Arrow indicator pointing to the target
// ─────────────────────────────────────────────────────────────────────────────
function Arrow({ placement }: { placement: TourPlacement }) {
    const base = "absolute w-3 h-3 rotate-45";
    const bg = "bg-[#1a1a2e] dark:bg-[#0d0d1a] border border-white/10";

    const map: Record<TourPlacement, string> = {
        top: `${base} ${bg} -bottom-1.5 left-1/2 -translate-x-1/2`,
        bottom: `${base} ${bg} -top-1.5 left-1/2 -translate-x-1/2`,
        left: `${base} ${bg} -right-1.5 top-1/2 -translate-y-1/2`,
        right: `${base} ${bg} -left-1.5 top-1/2 -translate-y-1/2`,
        center: "hidden",
    };

    return <div className={map[placement]} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Tooltip Card
// ─────────────────────────────────────────────────────────────────────────────

const TOOLTIP_W = 380;
const TOOLTIP_H_EST = 340;

interface TooltipCardProps {
    step: TourStep;
    stepIndex: number;
    totalSteps: number;
    onNext: () => void;
    onPrev: () => void;
    onSkip: () => void;
    onFinish: () => void;
    onDotClick: (i: number) => void;
    targetRect: Rect | null;
}

function TooltipCard({
    step,
    stepIndex,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    onFinish,
    onDotClick,
    targetRect,
}: TooltipCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: -9999, left: -9999 });
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === totalSteps - 1;

    useEffect(() => {
        if (!cardRef.current) return;
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        const { height } = cardRef.current.getBoundingClientRect();
        const computed = computeTooltipPos(targetRect, step.placement, TOOLTIP_W, height || TOOLTIP_H_EST, vpW, vpH);
        setPos(computed);
    }, [targetRect, step.placement, stepIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "Enter") {
                isLast ? onFinish() : onNext();
            } else if (e.key === "ArrowLeft") {
                onPrev();
            } else if (e.key === "Escape") {
                onSkip();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isLast, onFinish, onNext, onPrev, onSkip]);

    return (
        <motion.div
            ref={cardRef}
            key={step.id}
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -8 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed z-[9999] rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] border border-border bg-card text-card-foreground overflow-hidden"
            style={{
                top: pos.top,
                left: pos.left,
                width: TOOLTIP_W,
                pointerEvents: "auto",
            }}
        >
            <style>{SHIMMER_STYLE}</style>

            {/* Top animated accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl z-20"
                style={{ background: "linear-gradient(90deg, #6C5CE7, #00d2ff, #ec4899, #6C5CE7)", backgroundSize: "200% 100%", pointerEvents: "none" }}
            >
                <div style={{ animation: "shimmer 3s linear infinite", width: "100%", height: "100%", background: "inherit", backgroundSize: "inherit" }} />
            </div>

            <Arrow placement={step.placement} />

            {/* Explanatory Video/Image Header */}
            {(step.youtubeId || step.mediaUrl) && (
                <div className="relative w-full aspect-video bg-muted border-b border-border overflow-hidden">
                    {step.youtubeId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${step.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${step.youtubeId}`}
                            className="w-full h-full border-0 pointer-events-none"
                            allow="autoplay; encrypted-media"
                            title={step.title}
                        />
                    ) : (
                        <img src={step.mediaUrl} alt={step.title} className="w-full h-full object-cover" />
                    )}
                </div>
            )}

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black text-white flex-shrink-0"
                            style={{ background: "var(--primary)", boxShadow: "0 4px 15px rgba(108,92,231,0.4)" }}
                        >
                            {stepIndex + 1}
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-0.5">
                                Step {stepIndex + 1} of {totalSteps}
                            </p>
                            <h3 className="text-[15px] font-black tracking-tight text-foreground leading-tight">
                                {step.title}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onSkip}
                        aria-label="Skip tour"
                        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Description - Practical Guidance */}
                <div className="text-[13px] text-muted-foreground leading-relaxed font-medium mb-5">
                    {step.description}
                </div>

                {/* Progress dots */}
                <div className="mb-4">
                    <StepDots total={totalSteps} current={stepIndex} onDotClick={onDotClick} />
                </div>

                {/* Separator */}
                <div className="h-px bg-border mb-4" />

                {/* Actions */}
                <div className="flex items-center justify-between gap-2">
                    <button
                        onClick={onSkip}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <SkipForward className="w-3 h-3" />
                        Skip tour
                    </button>

                    <div className="flex items-center gap-2">
                        {!isFirst && (
                            <button
                                onClick={onPrev}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-transparent hover:border-border"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                Previous
                            </button>
                        )}
                        {isLast ? (
                            <button
                                onClick={onFinish}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-black text-white transition-all hover:opacity-90 active:scale-95"
                                style={{ background: "var(--primary,#6C5CE7)", boxShadow: "0 4px 14px rgba(108,92,231,0.4)" }}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Finish
                            </button>
                        ) : (
                            <button
                                onClick={onNext}
                                className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-[12px] font-black text-white transition-all hover:opacity-90 active:scale-95"
                                style={{ background: "var(--primary,#6C5CE7)", boxShadow: "0 4px 14px rgba(108,92,231,0.4)" }}
                            >
                                Next
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider — wraps the dashboard layout; exposes startTour to children
// ─────────────────────────────────────────────────────────────────────────────
export function OnboardingTourProvider({ children }: { children: React.ReactNode }) {
    const tour = useTour();

    return (
        <TourContext.Provider value={{ startTour: tour.startTour, isOpen: tour.isOpen }}>
            {children}
            <TourOverlayWithTour tour={tour} />
        </TourContext.Provider>
    );
}

/** Inner component that has access to the same tour instance from the provider */
function TourOverlayWithTour({ tour }: { tour: ReturnType<typeof useTour> }) {
    const [targetRect, setTargetRect] = useState<Rect | null>(null);
    const [mounted, setMounted] = useState(false);

    const { isOpen, currentStep, nextStep, prevStep, skipTour, completeTour, goToStep } = tour;
    const step = tourSteps[currentStep];
    const totalSteps = tourSteps.length;
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => setMounted(true), []);

    /**
     * Auto-adapt: if a step's route requires a plan the user doesn't have,
     * the dashboard guard redirects them away. In that case we skip the step
     * instead of getting stuck, so the tour always keeps flowing.
     */
    useEffect(() => {
        if (!isOpen || !step?.route) return;
        const t = setTimeout(() => {
            if (pathname && step.route && !pathname.startsWith(step.route)) {
                nextStep(totalSteps);
            }
        }, 2800);
        return () => clearTimeout(t);
    }, [isOpen, currentStep, pathname, step, nextStep, totalSteps]);

    const measureTarget = useCallback(() => {
        if (!step) return;

        let attempts = 0;
        const maxAttempts = 20; // Try for 2 seconds (100ms intervals)

        const tryMeasure = () => {
            const rect = getTargetRect(step.target);
            if (rect) {
                setTargetRect(rect);
                if (step.scrollToTarget) {
                    const el = document.querySelector(step.target);
                    el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => setTargetRect(getTargetRect(step.target)), 400); // re-measure after scroll
                }
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryMeasure, 100);
            } else {
                // Give up and center
                setTargetRect(null);
            }
        };

        tryMeasure();
    }, [step]);

    useEffect(() => {
        if (!isOpen || !mounted || !step) return;

        if (step.route) {
            router.push(step.route);
        }

        // We only trigger measureTarget once here, and let the polling handle the route transition delay
        measureTarget();
    }, [isOpen, currentStep, mounted, step, router, measureTarget]);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener("resize", measureTarget);
        return () => window.removeEventListener("resize", measureTarget);
    }, [isOpen, measureTarget]);

    if (!mounted || !isOpen || !step) return null;

    return createPortal(
        <AnimatePresence mode="wait">
            <motion.div
                key="tour-root"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0"
                style={{ pointerEvents: "none", zIndex: 9989 }}
            >
                {/* Click blocker */}
                <div
                    className="fixed inset-0"
                    style={{ pointerEvents: "all", zIndex: 9990 }}
                    onClick={(e) => e.stopPropagation()}
                />

                <SpotlightMask rect={targetRect} />

                <AnimatePresence mode="wait">
                    <TooltipCard
                        key={step.id}
                        step={step}
                        stepIndex={currentStep}
                        totalSteps={totalSteps}
                        targetRect={targetRect}
                        onNext={() => nextStep(totalSteps)}
                        onPrev={prevStep}
                        onSkip={skipTour}
                        onFinish={completeTour}
                        onDotClick={goToStep}
                    />
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}

export default OnboardingTourProvider;

