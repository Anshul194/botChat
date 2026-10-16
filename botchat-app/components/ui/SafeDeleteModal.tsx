"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Pause, CheckCircle2, X, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SafeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemName: string;
  itemType?: string;
  isActive: boolean;
  onPause: () => Promise<void>;
  onDelete: () => Promise<void>;
  onRefresh?: () => Promise<boolean>;
}

type ModalStage = "active_warning" | "paused_ready" | "confirm_delete";

export function SafeDeleteModal({
  isOpen,
  onClose,
  title,
  itemName,
  itemType = "Automation",
  isActive,
  onPause,
  onDelete,
  onRefresh,
}: SafeDeleteModalProps) {
  const [stage, setStage] = useState<ModalStage>(isActive ? "active_warning" : "confirm_delete");
  const [isPausing, setIsPausing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Sync stage whenever modal opens or isActive changes
  useEffect(() => {
    if (isOpen) {
      setStage(isActive ? "active_warning" : "confirm_delete");
      setErrorMessage(null);
      setIsPausing(false);
      setIsDeleting(false);

      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      const timer = setTimeout(() => modalRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    } else {
      previouslyFocusedRef.current?.focus();
    }
  }, [isOpen, isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isPausing && !isDeleting) {
      onClose();
    }
  };

  const handlePause = async () => {
    if (isPausing || isDeleting) return;
    setIsPausing(true);
    setErrorMessage(null);

    try {
      await onPause();

      // If a refresh hook is provided, check authoritative state
      if (onRefresh) {
        const stillActive = await onRefresh();
        if (stillActive) {
          throw new Error("Automation state remains active after pause request. Please try again.");
        }
      }

      setStage("paused_ready");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to pause automation. Please retry.";
      setErrorMessage(msg);
    } finally {
      setIsPausing(false);
    }
  };

  const handleDelete = async () => {
    if (isPausing || isDeleting) return;
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await onDelete();
      onClose();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || "Failed to delete automation.";

      // Scenario D: State changed elsewhere and backend rejected with 409
      if (status === 409 || msg.toLowerCase().includes("active") || msg.toLowerCase().includes("pause")) {
        setStage("active_warning");
        setErrorMessage("State updated: this resource is currently active on the server. Please pause it before deleting.");
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isPausing && !isDeleting) onClose();
          }}
          className="absolute inset-0 bg-[var(--background-overlay)] backdrop-blur-sm cursor-pointer"
        />

        {/* Modal content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          role="alertdialog"
          aria-modal="true"
          aria-label={title || "Delete Confirmation"}
          ref={modalRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="relative w-full max-w-md bg-[var(--card)] rounded-2xl overflow-hidden shadow-2xl z-10 border border-[var(--border)]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isPausing || isDeleting}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 text-center">
            {/* Stage: Active Warning */}
            {stage === "active_warning" && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
                  style={{
                    background: "color-mix(in srgb, var(--warning) 12%, transparent)",
                    color: "var(--warning)",
                    border: "1px solid color-mix(in srgb, var(--warning) 28%, transparent)",
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center mx-auto mb-5 relative"
                >
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-[24px] blur-xl opacity-25 bg-[var(--warning)]"
                  />
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">
                  Automation Is Running
                </h3>

                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  <span className="font-semibold text-[var(--foreground)]">&ldquo;{itemName}&rdquo;</span> is currently active and processing messages. To prevent orphaned jobs or sending unexpected replies, you must pause it before deleting.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isPausing || isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePause}
                    disabled={isPausing || isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPausing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Pausing...</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Pause {itemType}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Stage: Paused and Ready for Final Delete */}
            {stage === "paused_ready" && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
                  style={{
                    background: "color-mix(in srgb, var(--emerald-500, #10b981) 12%, transparent)",
                    color: "var(--emerald-500, #10b981)",
                    border: "1px solid color-mix(in srgb, var(--emerald-500, #10b981) 28%, transparent)",
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center mx-auto mb-5 relative bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">
                  Automation Paused
                </h3>

                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  <span className="font-semibold text-[var(--foreground)]">&ldquo;{itemName}&rdquo;</span> is now stopped. Confirm below to delete it permanently.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Keep Paused
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[var(--destructive)] hover:brightness-90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Confirm Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Stage: Direct Confirm Delete (Already Inactive/Paused) */}
            {stage === "confirm_delete" && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
                  style={{
                    background: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                    color: "var(--destructive)",
                    border: "1px solid color-mix(in srgb, var(--destructive) 28%, transparent)",
                  }}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] flex items-center justify-center mx-auto mb-5 relative"
                >
                  <Trash2 className="w-8 h-8 sm:w-10 sm:h-10" />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-[24px] blur-xl opacity-20 bg-[var(--destructive)]"
                  />
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">
                  {title || `Delete ${itemType}?`}
                </h3>

                <p className="text-[var(--muted-foreground)] text-xs sm:text-sm font-medium leading-relaxed mb-4">
                  Are you sure you want to permanently delete <span className="font-semibold text-[var(--foreground)]">&ldquo;{itemName}&rdquo;</span>? This action cannot be undone.
                </p>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs text-left flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{errorMessage}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-wider hover:brightness-95 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-3 sm:py-3.5 rounded-xl bg-[var(--destructive)] hover:brightness-90 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Accent border strip at bottom */}
          <div
            className={cn(
              "h-1.5 w-full transition-colors",
              stage === "active_warning" && "bg-amber-500",
              stage === "paused_ready" && "bg-emerald-500",
              stage === "confirm_delete" && "bg-[var(--destructive)]"
            )}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
