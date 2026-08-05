"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning";
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
}: ConfirmModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedRef.current = document.activeElement as HTMLElement;
            const timer = setTimeout(() => modalRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        } else {
            previouslyFocusedRef.current?.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
            aria-label={title}
            ref={modalRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="relative w-full max-w-sm bg-[var(--card)] rounded-2xl overflow-hidden shadow-2xl z-10 border border-[var(--border)]"
        >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors z-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              {/* Icon Section */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1, duration: 0.6 }}
                  style={type === "danger"
                    ? { background: "color-mix(in srgb, var(--destructive) 12%, transparent)", color: "var(--destructive)", border: "1px solid color-mix(in srgb, var(--destructive) 28%, transparent)" }
                    : { background: "color-mix(in srgb, var(--warning) 12%, transparent)", color: "var(--warning)", border: "1px solid color-mix(in srgb, var(--warning) 28%, transparent)" }
                  }
                  className="w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 relative"
                >
                  {type === "danger" ? <Trash2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                
                {/* Background pulse */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={cn("absolute inset-0 rounded-[24px] blur-xl opacity-20", 
                    type === 'danger' ? 'bg-[var(--destructive)]' : 'bg-[var(--warning)]'
                  )}
                />
              </motion.div>

              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2 uppercase tracking-tight">
                {title}
              </h3>
              
              <p className="text-[var(--muted-foreground)] text-sm font-medium leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)] font-bold text-xs uppercase tracking-widest hover:brightness-95 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    type === "danger" ? "bg-[var(--destructive)] hover:brightness-90" : "bg-[var(--warning)] hover:brightness-90"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Subtle bottom accent */}
            <div className={cn("h-1.5 w-full", 
              type === 'danger' ? 'bg-[var(--destructive)]' : 'bg-[var(--warning)]'
            )} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
