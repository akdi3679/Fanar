"use client";

import { useEffect } from "react";

export function VisitorTracker() {
  useEffect(() => {
    const sessionId = sessionStorage.getItem("visitor_session_id");
    if (!sessionId) {
      const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("visitor_session_id", newSessionId);
    }

    const startTime = Date.now();
    let scrollDepth = 0;

    const trackScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollDepth = Math.round((scrollTop / docHeight) * 100);
    };

    window.addEventListener("scroll", trackScroll);

    const trackPageView = async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionStorage.getItem("visitor_session_id"),
            page: window.location.pathname,
            referrer: document.referrer,
            timeOnPage: 0,
            scrollDepth,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            screenColorDepth: window.screen.colorDepth,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isFirstVisit: !sessionStorage.getItem("has_visited_before"),
          }),
        });
        
        if (!sessionStorage.getItem("has_visited_before")) {
          sessionStorage.setItem("has_visited_before", "true");
        }
      } catch (error) {
        console.error("Failed to track page view:", error);
      }
    };

    trackPageView();

    const trackTimeOnPage = async () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionStorage.getItem("visitor_session_id"),
            page: window.location.pathname,
            timeOnPage,
            scrollDepth,
          }),
        });
      } catch (error) {
        console.error("Failed to track time on page:", error);
      }
    };

    window.addEventListener("beforeunload", trackTimeOnPage);

    return () => {
      window.removeEventListener("scroll", trackScroll);
      window.removeEventListener("beforeunload", trackTimeOnPage);
    };
  }, []);

  return null;
}