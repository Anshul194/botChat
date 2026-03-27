"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { StatusModal } from "@/components/ui/StatusModal";

type ModalType = "success" | "error" | "info" | "warning" | "loading";

interface ModalContextType {
  showModal: (type: ModalType, title: string, message: string) => void;
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

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalState({ isOpen: true, type, title, message });
  };

  const hideModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <StatusModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
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
