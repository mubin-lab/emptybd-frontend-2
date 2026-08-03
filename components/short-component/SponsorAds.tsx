/* eslint-disable @next/next/no-img-element */
// components/Ads.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface AdBannerProps {
  media_url: string;
  media_type: "image" | "video";
  media_link?: string;
  sponsor_by: string;
  id: string | number;
}

export default function Ads({
  media_url,
  media_type,
  media_link,
  sponsor_by,
  id,
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800/50 py-3 px-4 mt-10 text-center text-sm text-gray-400 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
        This ad from {sponsor_by || "EmptyBD"}
      </div>
    );
  }

  const handleClose = () => setIsVisible(false);

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="relative max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xs shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 z-20 p-1 bg-black/50 rounded-tr-xs hover:bg-black/70 text-white transition-all duration-200 shadow-md"
          aria-label="Close advertisement"
        >
          <X size={15} />
        </button>

        {/* Media container - ন্যাচারাল অ্যাসপেক্ট রেশিও */}
        <div className="relative w-full bg-black/5">
          {media_type === "video" ? (
            <video
              src={media_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-auto   object-contain mx-auto" // ← পুরোটা দেখাবে, লম্বা হলে লম্বা
              controls={false}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <img
              src={media_url}
              alt="Advertisement from sponsor"
              className="w-full h-auto   object-contain mx-auto" // ← পুরো ইমেজ দেখাবে
              loading="lazy"
            />
          )}

          {/* Optional clickable overlay */}
          {media_link && (
            <a
              href={media_link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10"
              aria-label="Visit sponsor website"
            />
          )}
        </div>

        {/* Sponsor label - bottom left */}
        <div className="absolute bottom-1 left-1 px-2.5 py-1 bg-black/65 text-white text-[10px] lg:text-sm font-medium rounded-sm shadow-sm">
          Ad • {sponsor_by || "EmptyBD"}
        </div>
      </div>
    </div>
  );
}
