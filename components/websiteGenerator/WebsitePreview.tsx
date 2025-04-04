import React, { useEffect, useRef } from "react";

interface WebsitePreviewProps {
  html: string;
  css: string;
  js: string;
}

export default function WebsitePreview({ html, css, js }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Create a combined HTML document with inline CSS and JS
    const combinedContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html
            .replace(/<link.*?>/g, "")
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g, "")}
          <script>${js}</script>
        </body>
      </html>
    `;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(combinedContent);
      iframeDoc.close();
    }
  }, [html, css, js]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      title="Website Preview"
    ></iframe>
  );
}
