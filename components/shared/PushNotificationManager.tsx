"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error("Service Worker registration check failed:", err);
    }
  };

  const handleSubscribe = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return toast.error("You must be logged in to enable notifications.");
    if (!VAPID_PUBLIC_KEY) return toast.error("VAPID Key not configured.");

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setLoading(false);
        return toast.error("Notification permission denied.");
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/push/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success("Push notifications enabled!");
      } else {
        throw new Error("Failed to save subscription on server");
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/push/unsubscribe`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      toast.success("Push notifications disabled.");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable notifications.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">Push Notifications</h3>
          <p className="text-sm text-gray-400">Not supported by your browser.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 flex justify-between items-center">
      <div>
        <h3 className="text-white font-medium">Push Notifications</h3>
        <p className="text-sm text-gray-400">
          Receive updates when your browser is closed.
        </p>
      </div>
      {isSubscribed ? (
        <div className="flex gap-2">
          <button 
            onClick={handleUnsubscribe}
            disabled={loading}
            className="h-8 px-3 rounded-md text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 font-bold disabled:opacity-50"
          >
            {loading ? "Disabling..." : "Disable"}
          </button>
          {/* <button 
            onClick={() => {
              if (Notification.permission === "granted") {
                new Notification("Native Test", { body: "This is a native Windows notification test!" });
              } else {
                toast.error("Permission not granted");
              }
            }}
            className="h-8 px-3 rounded-md text-xs bg-gray-800 hover:bg-gray-700 text-white font-bold"
          >
            Test Popup
          </button> */}
        </div>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="h-8 px-3 rounded-md text-xs bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Please wait..." : "Enable"}
        </button>
      )}
    </div>
  );
}
