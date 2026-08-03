"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Define an interface for the BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if the user has already dismissed the banner
    const isDismissed = localStorage.getItem("pwa_banner_dismissed");
    if (isDismissed === "true") {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI to notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If the app is successfully installed, hide the banner
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };
    
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Whether accepted or dismissed, hide the banner and clear the prompt
    setIsVisible(false);
    setDeferredPrompt(null);
    
    if (outcome === "dismissed") {
      // Optionally save dismissal if they decline the native prompt
      localStorage.setItem("pwa_banner_dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa_banner_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-28 lg:top-16 left-0 w-full bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-xl z-50 transition-all duration-300 animate-slide-down">
      <div className="max-w-[1440px] w-[95%] mx-auto flex items-center justify-between py-2.5 sm:py-3 gap-4 relative">
        
        {/* Left Side: Icon + Text */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="flex shrink-0">
            <img 
              src="/company/favicon1.png" 
              alt="App Icon" 
              className="h-9 w-9 rounded-sm object-cover p-1"
            />
          </div>
          <p className="text-sm  font-medium font-bengali leading-relaxed text-slate-200 truncate sm:whitespace-normal">
            Install from Play Store
          </p>
        </div>

        {/* Right Side: Install Button */}
        <div className="shrink-0">
          <button 
            onClick={handleInstallClick}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-xs shadow-lg shadow-blue-600/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <span className=""><Download size={14} /></span>
            Install App
          </button>
        </div>

        {/* Close Button */}
        {/* <button 
          onClick={handleDismiss}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all border border-slate-800/50"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button> */}

      </div>
    </div>
  );
}
