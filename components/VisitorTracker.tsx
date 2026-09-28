"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  // Ensure a session id exists
  useEffect(() => {
    if (typeof window === "undefined") return;
    let sid = sessionStorage.getItem("visitor_session_id");
    if (!sid) {
      sid = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem("visitor_session_id", sid);
    }
  }, []);

  // Track on every pathname change (initial load + client-side navigation)
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;
    const sessionId = sessionStorage.getItem("visitor_session_id") || "anonymous";
    const isFirst = !sessionStorage.getItem("has_visited");

    const payload = {
      sessionId,
      page: pathname,
      referrer: document.referrer || null,
      timeOnPage: 0,
      scrollDepth: 0,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      screenColorDepth: window.screen.colorDepth,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isFirstVisit: isFirst,
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    sessionStorage.setItem("has_visited", "true");
  }, [pathname]);

  return null;
}