"use client";
import BackendImage from "@/components/shared/BackendImage";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { BiPackage, BiVolumeMute, BiVolumeFull } from "react-icons/bi";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";

import { CardReel, ExchangeAsset } from "@/components/shared/CardReel";

export default function ExchangeReelsPage() {
  const [assets, setAssets] = useState<ExchangeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch listed digital exchange assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards?status=Active&isListed=true`
        );
        if (!res.ok) throw new Error("Failed to fetch assets");
        const data = await res.json();
        const shuffledAssets = (data.assets || []).sort(() => Math.random() - 0.5);
        setAssets(shuffledAssets);
      } catch (err) {
        console.error("Asset fetch error:", err);
        toast.error("Failed to fetch exchange assets");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  // Handle scroll to update active index
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / windowHeight);
    setActiveIndex(newIndex);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      audioRef.current.play().catch((err) => {
        console.log("Audio autoplay prevented:", err);
      });
    }
  }, [isMuted]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <SpinnerCustom />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-center">
          <BiPackage size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-medium mb-2">No Cards Available</h2>
          <p className="text-gray-400 mb-6">
            There are no listed cards in the Digital Exchange right now.
          </p>
          <Link href="/digital-exchange">
            <Button variant="outline">Back to Exchange</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background Audio - Royalty Free Placeholder */}
      <audio
        ref={audioRef}
        loop
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />

      {/* Mute Toggle */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors border border-white/10"
      >
        {isMuted ? <BiVolumeMute size={20} /> : <BiVolumeFull size={20} />}
      </button>

      {/* Feed Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {assets.map((asset, index) => (
          <CardReel
            key={asset._id}
            asset={asset}
            index={index}
            total={assets.length}
          />
        ))}
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 left-3 z-50 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full text-white text-xs hover:bg-black/70 transition-colors flex items-center gap-1 border border-white/10"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Link>

      {activeIndex < assets.length - 1 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 animate-bounce pointer-events-none">
          <svg
            className="w-6 h-6 text-white/70"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

