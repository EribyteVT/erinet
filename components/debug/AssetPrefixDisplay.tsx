"use client";

import React, { useEffect, useState } from "react";

export default function AssetPrefixDisplay() {
  const [assetPrefix, setAssetPrefix] = useState<string>("");
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Get asset prefix from Next.js runtime config
    const prefix = (window as any).__NEXT_DATA__?.assetPrefix || "";
    setAssetPrefix(prefix);

    // Only show in development mode by default
    if (process.env.NODE_ENV !== "development") {
      setIsVisible(false);
    }

    // Check for debug query parameter to force display
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("debug") === "true") {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-md text-sm z-50 shadow-md">
      <div className="font-mono">
        <p>
          <strong>Asset Prefix:</strong>{" "}
          {assetPrefix ? assetPrefix : "(none/empty)"}
        </p>
        <p className="text-xs opacity-70 mt-1">ENV: {process.env.NODE_ENV}</p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-xs text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}
