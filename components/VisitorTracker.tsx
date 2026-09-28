"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    let sid = sessionStorage.getItem("visitor_session_id");
    if (!sid) {
      sid = "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
      sessionStorage.setItem("visitor_session_id", sid);
    }
    const isFirst = !sessionStorage.getItem("has_visited");

    const payload = {
      sessionId: sid,
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
    })
      .then((res) => {
        if (!res.ok) console.warn("[track] failed:", res.status);
      })
      .catch((e) => console.warn("[track] error:", e));

    sessionStorage.setItem("has_visited", "true");
  }, [pathname]);

  return null;
}