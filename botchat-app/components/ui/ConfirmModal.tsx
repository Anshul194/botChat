"use client";

import React from "react";
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-white dark:bg-[#1C1C24] rounded-[32px] overflow-hidden shadow-2xl z-10 border border-neutral-100 dark:border-neutral-800"
          >
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              {/* Icon Section */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, duration: 0.6 }}
                className={cn(
                  "w-20 h-20 rounded-[24px] flex items-center justify-center mx-auto mb-6 relative",
                  type === "danger" ? "bg-rose-50 dark:bg-rose-900/10 text-rose-500 border border-rose-100 dark:border-rose-900/20" : 
                  "bg-amber-50 dark:bg-amber-900/10 text-amber-500 border border-amber-100 dark:border-amber-900/20"
                )}
              >
                {type === "danger" ? <Trash2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                
                {/* Background pulse */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={cn("absolute inset-0 rounded-[24px] blur-xl opacity-20", 
                    type === 'danger' ? 'bg-rose-500' : 'bg-amber-500'
                  )}
                />
              </motion.div>

              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 uppercase tracking-tight">
                {title}
              </h3>
              
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed mb-8">
                {message}
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 dark:hover:bg-neutral-750 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 hover:-translate-y-0.5",
                    type === "danger" ? "bg-rose-600 shadow-rose-600/20 hover:bg-rose-700" : "bg-amber-600 shadow-amber-600/20 hover:bg-amber-700"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* Subtle bottom accent */}
            <div className={cn("h-1.5 w-full", 
              type === 'danger' ? 'bg-rose-600' : 'bg-amber-600'
            )} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
