"use client";

import { useToast as useToastOriginal } from "./toast";

// Compatibility wrapper to match shadcn/ui toast API
export function useToast() {
  const originalToast = useToastOriginal();

  return {
    toast: ({ title, description, variant }: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      const type = variant === "destructive" ? "error" : "success";
      originalToast.toast({ title, description, type });
    },
    dismiss: originalToast.dismiss,
  };
}

export { useToast as toast };
