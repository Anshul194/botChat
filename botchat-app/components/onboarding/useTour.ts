"use client";

import { useState, useEffect, useCallback } from "react";

const TOUR_COMPLETE_KEY = "botchat_tour_completed";
const TOUR_STEP_KEY = "botchat_tour_step";

export function useTour() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    /**
     * On mount: detect first-ever login. If the user has never completed the
     * tour, open it automatically after a short delay so the page can render.
     */
    useEffect(() => {
        if (typeof window === "undefined") return;

        const completed = localStorage.getItem(TOUR_COMPLETE_KEY);
        if (!completed) {
            // Restore step position if the user refreshed mid-tour
            const savedStep = parseInt(localStorage.getItem(TOUR_STEP_KEY) || "0", 10);
            setCurrentStep(isNaN(savedStep) ? 0 : savedStep);
            // Small delay so dashboard components are fully mounted
            const timer = setTimeout(() => setIsOpen(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    /** Persist step as user advances (so a refresh resumes where they left off) */
    useEffect(() => {
        if (isOpen && typeof window !== "undefined") {
            localStorage.setItem(TOUR_STEP_KEY, String(currentStep));
        }
    }, [currentStep, isOpen]);

    const startTour = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(TOUR_COMPLETE_KEY);
            localStorage.removeItem(TOUR_STEP_KEY);
        }
        setCurrentStep(0);
        setIsOpen(true);
    }, []);

    const completeTour = useCallback(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(TOUR_COMPLETE_KEY, "true");
            localStorage.removeItem(TOUR_STEP_KEY);
        }
        setIsOpen(false);
    }, []);

    const skipTour = useCallback(() => {
        completeTour();
    }, [completeTour]);

    const nextStep = useCallback(
        (totalSteps: number) => {
            if (currentStep < totalSteps - 1) {
                setCurrentStep((s) => s + 1);
            } else {
                completeTour();
            }
        },
        [currentStep, completeTour]
    );

    const prevStep = useCallback(() => {
        setCurrentStep((s) => Math.max(0, s - 1));
    }, []);

    const goToStep = useCallback((index: number) => {
        setCurrentStep(index);
    }, []);

    return {
        isOpen,
        currentStep,
        startTour,
        completeTour,
        skipTour,
        nextStep,
        prevStep,
        goToStep,
    };
}
