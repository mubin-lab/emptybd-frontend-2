"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { getClientTrackingData } from "@/lib/tracking";

export default function ActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const currentPathRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    // Generate session ID if not exists
    if (!sessionStorage.getItem("bidder_session_id")) {
      const newSessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("bidder_session_id", newSessionId);
      sessionIdRef.current = newSessionId;
    } else {
      sessionIdRef.current = sessionStorage.getItem("bidder_session_id") as string;
    }

    // Synchronize tracking configurations from settings once on mount
    const syncTrackingConfig = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          const isTrackingOn = data.trackUserActivity !== undefined ? Boolean(data.trackUserActivity) : true;
          localStorage.setItem("trackUserActivity", isTrackingOn ? "true" : "false");
        }
      } catch (err) {
        console.error("Failed to sync activity tracking config:", err);
      }
    };
    syncTrackingConfig();
  }, []);

  // Standard async log for route changes
  const logActivity = useCallback(async (actionType: string, page: string, durationMs: number) => {
    // Check if tracking is disabled in local storage
    if (typeof window !== "undefined" && localStorage.getItem("trackUserActivity") === "false") return;

    // Don't log if no user and not on auth pages (or choose to log anonymous)
    if (!user?.email && !page.includes("login") && !page.includes("register")) return;

    try {
      const payload = {
        activities: [
          {
            userEmail: user?.email || "anonymous",
            sessionId: sessionIdRef.current,
            actionType,
            page,
            durationMs,
            timestamp: new Date().toISOString(),
            clientPlatform: getClientTrackingData().clientPlatform
          }
        ]
      };

      await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/activity/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // Fail silently for tracking
    }
  }, [user]);

  useEffect(() => {
    // The full URL path
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // If we are coming from a previous path, log the time spent there
    if (currentPathRef.current && currentPathRef.current !== url) {
      logActivity("page_view", currentPathRef.current, Date.now() - startTimeRef.current);
    }

    // Update current tracking state
    currentPathRef.current = url;
    startTimeRef.current = Date.now();

    // Handle user closing the tab or leaving the site
    const handleBeforeUnload = () => {
      if (currentPathRef.current) {
        logActivitySync("page_view", currentPathRef.current, Date.now() - startTimeRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname, searchParams, logActivity]); // Included logActivity



  // Synchronous log for beforeunload using sendBeacon
  const logActivitySync = (actionType: string, page: string, durationMs: number) => {
    // Check if tracking is disabled in local storage
    if (typeof window !== "undefined" && localStorage.getItem("trackUserActivity") === "false") return;

    if (!user?.email) return;

    try {
      const payload = {
        activities: [
          {
            userEmail: user?.email || "anonymous",
            sessionId: sessionIdRef.current,
            actionType,
            page,
            durationMs,
            timestamp: new Date().toISOString(),
            clientPlatform: getClientTrackingData().clientPlatform
          }
        ]
      };

      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(`${process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:5005"}/activity/track`, blob);
    } catch (e) {
      // Ignore
    }
  };

  // Render nothing, purely logical component
  return null;
}
