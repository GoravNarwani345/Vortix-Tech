"use client";

import { useEffect } from "react";

// Replace with your real Clarity Project ID from https://clarity.microsoft.com
const CLARITY_PROJECT_ID = "YOUR_CLARITY_PROJECT_ID";

export default function MicrosoftClarity() {
  useEffect(() => {
    // Only load Clarity if user has accepted analytics cookies
    try {
      const consent = localStorage.getItem("vortix_cookie_consent");
      if (consent) {
        const parsed = JSON.parse(consent);
        if (!parsed.analytics) return;
      } else {
        return; // No consent given yet
      }
    } catch {
      return;
    }

    // Don't load if placeholder ID
    if (CLARITY_PROJECT_ID === "YOUR_CLARITY_PROJECT_ID") return;

    // Load Clarity script
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
    `;
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
