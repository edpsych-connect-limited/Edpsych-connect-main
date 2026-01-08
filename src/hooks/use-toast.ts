import { useState } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export const useToast = () => {
  const toast = (props: ToastProps) => {
    // Basic implementation that logs to console
    // In production, this should connect to a ToastProvider
    console.log("Toast notification:", props);
  };

  return { toast };
};
