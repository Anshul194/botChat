"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info" | "warning" | "loading";
  title?: string;
  message?: string;
}

export function StatusModal({
  isOpen,
  onClose,
  type = "success",
  title = "Success",
  message = "Action completed successfully.",
}: StatusModalProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
      case "error":
        return <XCircle className="w-16 h-16 text-rose-500" />;
      case "warning":
        return <AlertTriangle className="w-16 h-16 text-amber-500" />;
      case "info":
        return <Info className="w-16 h-16 text-blue-500" />;
      case "loading":
        return <Loader2 className="w-16 h-16 text-pink-500 animate-spin" />;
      default:
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
    }
  };

  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/10",
          text: "text-emerald-800 dark:text-emerald-400 font-bold",
          border: "border-emerald-200 dark:border-emerald-800/20",
          button: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800",
        };
      case "error":
        return {
          bg: "bg-rose-50 dark:bg-rose-900/10",
          text: "text-rose-800 dark:text-rose-400 font-bold",
          border: "border-rose-200 dark:border-rose-800/20",
          button: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800",
        };
      case "loading":
        return {
          bg: "bg-white dark:bg-[#1C1C24]",
          text: "text-slate-800 dark:text-white font-bold",
          border: "border-slate-100 dark:border-slate-800",
          button: "bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-50",
        };
      default:
        return {
          bg: "bg-white dark:bg-[#1C1C24]",
          text: "text-slate-800 dark:text-white font-bold",
          border: "border-slate-100 dark:border-slate-800",
          button: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
        };
    }
  };

  const theme = getTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
               "relative w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl z-10",
               "bg-white dark:bg-[#1C1C24] border border-slate-100 dark:border-slate-800"
            )}
          >
            {/* Close button */}
            {type !== "loading" && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Animation and feedback */}
            <div className="flex flex-col items-center p-8 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                   type: "spring", 
                   delay: 0.1, 
                   duration: 0.6, 
                   stiffness: 260, 
                   damping: 20 
                }}
                className="mb-6 relative"
              >
                {/* Background pulse for icon */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={cn("absolute inset-0 rounded-full blur-xl opacity-20", 
                    type === 'success' ? 'bg-emerald-500' : 
                    type === 'error' ? 'bg-rose-500' : 'bg-pink-500'
                  )}
                />
                <div className="relative">
                   {getIcon()}
                </div>
              </motion.div>

              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("text-2xl font-bold mb-2 tracking-tight", theme.text === 'font-bold' ? 'text-slate-900 dark:text-white' : theme.text)}
              >
                {title}
              </motion.h3>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-[240px]"
              >
                {message}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 w-full"
              >
                <button
                  onClick={onClose}
                  disabled={type === "loading"}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 group transition-all duration-300 shadow-xl",
                    theme.button,
                    "hover:shadow-lg active:scale-95 translate-y-0 hover:-translate-y-0.5"
                  )}
                >
                  {type === "loading" ? "Please wait..." : "Okay"}
                </button>
              </motion.div>
            </div>

            {/* Subtle bottom accent */}
            <div className={cn("h-1 w-full", 
              type === 'success' ? 'bg-emerald-500' : 
              type === 'error' ? 'bg-rose-500' : 'bg-pink-500'
            )} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
