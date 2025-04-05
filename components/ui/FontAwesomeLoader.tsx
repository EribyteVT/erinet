"use client";
import { useEffect } from "react";


export function FontAwesomeLoader() {
    useEffect(() => {
      const existingLink = document.querySelector('link[href*="fontawesome"]');
  
      if (!existingLink) {
        // If not loaded, add it to the document
        const link = document.createElement("link");
  
        link.rel = "stylesheet";
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";
        link.integrity =
          "sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==";
        link.crossOrigin = "anonymous";
  
        document.head.appendChild(link);
  
        console.log("Font Awesome stylesheet added to document");
      } else {
        console.log("Font Awesome is already loaded");
      }
    }, []);
  
    return null;
  }