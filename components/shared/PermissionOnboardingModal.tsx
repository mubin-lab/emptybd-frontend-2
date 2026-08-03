"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Bell, X, Check, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";

export default function PermissionOnboardingModal() {
  // Temporarily disabled as per request
  return null;
  
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"location" | "push" | "done">("location");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if we should show the modal
    const checkPermissions = async () => {
      let locationNeeded = true;
      let pushNeeded = true;

      // Check Location 3-hour cooldown
      const lastPrompt = localStorage.getItem("location_prompt_time");
      if (lastPrompt) {
        const timeSince = Date.now() - parseInt(lastPrompt);
        if (timeSince < 3 * 60 * 60 * 1000) {
          locationNeeded = false;
        }
      }

      // Check if Location already granted
      if (locationNeeded && navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: "geolocation" });
          if (perm.state === "granted") {
            // Already granted, silently update
            locationNeeded = false;
            silentUpdateLocation();
          } else if (perm.state === "denied") {
            locationNeeded = false; // Native denied, don't bother
          }
        } catch (e) {
          // ignore error
        }
      }

      // Check Push Notifications
      if ("Notification" in window) {
        if (Notification.permission === "granted" || Notification.permission === "denied") {
          pushNeeded = false;
        }
      } else {
        pushNeeded = false; // Not supported
      }

      if (locationNeeded) {
        setStep("location");
        setIsOpen(true);
      } else if (pushNeeded) {
        setStep("push");
        setIsOpen(true);
      }
    };

    if (user) {
      checkPermissions();
    }
  }, [user]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const silentUpdateLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          
          await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/user/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              latitude: lat,
              longitude: lon,
              address: geoData.display_name,
              fullLocationData: geoData
            }),
          });
        } catch (error) {
          console.error("Silent location update failed", error);
        }
      },
      () => {}
    );
  };

  const handleLocationAllow = () => {
    setIsProcessing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const geoData = await geoRes.json();
          
          await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/user/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              latitude: lat,
              longitude: lon,
              address: geoData.display_name,
              fullLocationData: geoData
            }),
          });
          toast.success("Location updated successfully!");
        } catch (error) {
          console.error(error);
          toast.error("Could not determine full address, but coordinates saved.");
        } finally {
          setIsProcessing(false);
          advanceStep();
        }
      },
      (err) => {
        toast.error("Location permission denied.");
        localStorage.setItem("location_prompt_time", Date.now().toString());
        setIsProcessing(false);
        advanceStep();
      }
    );
  };

  const handleLocationSkip = () => {
    localStorage.setItem("location_prompt_time", Date.now().toString());
    advanceStep();
  };

  const handlePushAllow = async () => {
    if (!("Notification" in window)) {
      advanceStep();
      return;
    }
    
    setIsProcessing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!VAPID_KEY) throw new Error("VAPID missing");
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });

        await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify(subscription),
        });
        toast.success("Push notifications enabled!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not enable notifications.");
    } finally {
      setIsProcessing(false);
      advanceStep();
    }
  };

  const handlePushSkip = () => {
    advanceStep();
  };

  const advanceStep = () => {
    if (step === "location") {
      // Check if we need to do push
      if ("Notification" in window && Notification.permission === "default") {
        setStep("push");
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 relative">
          <button 
            onClick={() => {
              if (step === "location") handleLocationSkip();
              else handlePushSkip();
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              {step === "location" ? (
                <MapPin size={32} className="text-primary" />
              ) : (
                <Bell size={32} className="text-primary" />
              )}
            </div>
          </div>

          <div className="text-center space-y-3 mb-8">
            <h2 className="text-xl font-bold text-white">
              {step === "location" ? "Share Your Location" : "Enable Notifications"}
            </h2>
            <p className="text-sm text-gray-400">
              {step === "location" 
                ? "Allow us to access your precise GPS location to enhance your login security and tailor local auction listings to your area." 
                : "Stay in the loop! Get instant alerts when you receive a message or someone outbids you."}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={step === "location" ? handleLocationAllow : handlePushAllow}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : (
                <>
                  <Check size={18} />
                  Allow {step === "location" ? "Location" : "Notifications"}
                </>
              )}
            </button>
            <button
              onClick={step === "location" ? handleLocationSkip : handlePushSkip}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-transparent hover:bg-gray-800 text-gray-400 rounded-lg font-medium transition-colors"
            >
              Not Right Now
            </button>
          </div>
          
          <div className="mt-6 flex justify-center gap-2">
            <div className={`h-1.5 w-8 rounded-full ${step === "location" ? "bg-primary" : "bg-gray-700"}`} />
            <div className={`h-1.5 w-8 rounded-full ${step === "push" ? "bg-primary" : "bg-gray-700"}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
