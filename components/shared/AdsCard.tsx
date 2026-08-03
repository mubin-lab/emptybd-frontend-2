"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";

export type AdType = {
  _id: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  targetPage: string;
  insertionPosition: number;
  isActive: boolean;
  linkUrl?: string;
};

interface AdsCardProps {
  ad: AdType;
}

export default function AdsCard({ ad }: AdsCardProps) {
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) {
    return (
      <div className="w-full lg:max-w-[400px] mx-auto bg-gray-800 border border-gray-800 rounded-sm flex flex-col items-center justify-center p-4 my-4 shadow-sm">
        <p className="text-gray-400 text-sm font-parkinsans font-medium tracking-wide">
          Ads by emptyBD
        </p>
        <Button className="mt-2 px-7 py-1 " onClick={() => setIsClosed(false)}>View</Button>
      </div>
    );
  }

  const handleAdClick = () => {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="relative w-full lg:max-w-[400px] mx-auto my-4 group overflow-hidden rounded-sm bg-black border border-gray-800 shadow-md transition-all hover:shadow-lg">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsClosed(true);
        }}
        className="absolute top-0 right-0 z-10 hover:bg-black/80 text-gray-200 hover:text-white backdrop-blur-[1px] transition-all shadow-md opacity-100"
        aria-label="Close Ad"
      >
        <X size={18} />
      </button>

      <div 
        className={`w-full h-full ${ad.linkUrl ? 'cursor-pointer' : ''}`}
        onClick={handleAdClick}
      >

      {ad.mediaType === "video" ? (
        <video
          src={ad.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto max-h-[350px] object-cover"
        />
      ) : (
        <img
          src={ad.mediaUrl}
          alt="Advertisement"
          className="w-full h-auto max-h-[350px] object-cover"
        />
      )}
        <AdBadge />
      </div>
    </div>
  );
}

const AdBadge = () => (
  <div className="absolute bottom-1 left-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-gray-400 font-parkinsans pointer-events-none">
    Ad
  </div>
);
