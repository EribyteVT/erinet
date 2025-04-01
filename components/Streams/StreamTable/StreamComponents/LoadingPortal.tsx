"use client";
import { Loader2 } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

export const LoadingPortal: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true); // Set mounted state to true after component mounts
  }, []);

  if (!isMounted) {
    return null; // Do not render anything until the component is mounted
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="text-slate-900 dark:text-slate-100 text-sm font-medium">
          {message}
        </span>
      </div>
    </div>,
    document.body
  );
};

export default LoadingPortal;
