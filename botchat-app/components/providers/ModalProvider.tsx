"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { StatusModal } from "@/components/ui/StatusModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type ModalType = "success" | "error" | "info" | "warning" | "loading";

interface ModalContextType {
  showModal: (type: ModalType, title: string, message: string) => void;
  showConfirm: (options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning";
    onConfirm: () => void;
  }) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning";
    onConfirm?: () => void;
  }>({
    isOpen: false,
  });

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const showConfirm = (options: {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning";
    onConfirm: () => void;
  }) => {
    setConfirmState({
      isOpen: true,
      ...options
    });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, showConfirm, hideModal }}>
      {children}
      <StatusModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={hideModal}
        onConfirm={confirmState.onConfirm || (() => {})}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
