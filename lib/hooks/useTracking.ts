"use client";

import { useCallback } from "react";
// import axios from "axios";
import { useAuthStore } from "../store/authStore";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export const useTracking = () => {
  const { user } = useAuthStore();

  const trackFeatureVisit = useCallback((featureName: string) => {
    // Tracking API commented out to reduce API hits
    /*
    if (!user) return; // Only track for logged in users
    
    // Non-blocking fire and forget
    axios.post(
      `${API_URL}/onboarding/analytics/feature-visit`,
      { featureName },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    ).catch(err => console.debug("Tracking failed", err));
    */
  }, [user]);

  const trackOnboardingStep = useCallback((stepId: string, action: "view" | "complete" | "skip", timeSpentSeconds?: number) => {
    // Tracking API commented out to reduce API hits
    /*
    if (!user) return;

    axios.post(
      `${API_URL}/onboarding/analytics/onboarding`,
      { stepId, action, timeSpentSeconds },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    ).catch(err => console.debug("Tracking failed", err));
    */
  }, [user]);

  return { trackFeatureVisit, trackOnboardingStep };
};
