"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { VideoOff, Volume2, VolumeX, Play, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface Reel {
  _id: string;
  videoId: string;
  url: string;
  title: string;
  description: string;
  order: number;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const existingScript = document.getElementById("yt-iframe-api");

    const onAPIReady = () => {
      resolve();
    };

    const oldReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (oldReady) oldReady();
      onAPIReady();
    };

    if (existingScript) {
      if (window.YT && window.YT.Player) {
        resolve();
      }
      return;
    }

    const tag = document.createElement("script");
    tag.id = "yt-iframe-api";
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });

  return apiPromise;
}

export default function SocialReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Temporary session storage for viewing history
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("reels_seen_ids");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Helper function to fetch a batch of reels
  const fetchReelsBatch = useCallback(async (excludeList: string[], isInitial = false) => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const excludeQuery = excludeList.join(",");
      const url = `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reels?limit=10&exclude=${excludeQuery}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch reels");
      const data = await res.json();
      const newReels = data.data || [];

      if (newReels.length > 0) {
        setReels((prev) => {
          const prevIds = new Set(prev.map((r) => r._id));
          const filteredNew = newReels.filter((r: Reel) => !prevIds.has(r._id));
          return [...prev, ...filteredNew];
        });
      }
    } catch (err) {
      console.error("Reel batch fetch error:", err);
      toast.error("Failed to load reels");
    } finally {
      setIsFetching(false);
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [isFetching]);

  // Initial Fetch on mount
  useEffect(() => {
    // Preconnect to YouTube domains to speed up DNS/TCP handshakes
    const domains = ["https://www.youtube.com", "https://s.ytimg.com", "https://i.ytimg.com"];
    const linkTags: HTMLLinkElement[] = [];
    domains.forEach(domain => {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = domain;
      document.head.appendChild(link);
      linkTags.push(link);
    });

    fetchReelsBatch(seenIds, true);
  }, []);

  // Continuous pagination: Fetch next batch when activeIndex is within 3 items of the end
  useEffect(() => {
    if (reels.length === 0) return;
    if (reels.length - activeIndex <= 3 && !isFetching) {
      fetchReelsBatch(seenIds);
    }
  }, [activeIndex, reels.length, seenIds, fetchReelsBatch, isFetching]);

  // Track active reel in seenIds and session storage
  useEffect(() => {
    if (reels.length > 0 && reels[activeIndex]) {
      const activeId = reels[activeIndex]._id;
      setSeenIds((prev) => {
        if (prev.includes(activeId)) return prev;
        const updated = [...prev, activeId];
        if (typeof window !== "undefined") {
          sessionStorage.setItem("reels_seen_ids", JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [activeIndex, reels]);

  // Set up IntersectionObserver to detect active reel (70% visibility)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || reels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute("data-reel-index");
            if (indexAttr !== null) {
              const idx = parseInt(indexAttr, 10);
              setActiveIndex(idx);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    const items = container.querySelectorAll("[data-reel-index]");
    items.forEach((item) => observer.observe(item));

    return () => {
      items.forEach((item) => observer.unobserve(item));
      observer.disconnect();
    };
  }, [reels]);

  if (loading && reels.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <SpinnerCustom />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-center animate-fade-in">
          <VideoOff size={64} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-medium mb-2">No Shorts Available</h2>
          <p className="text-gray-400 mb-6">
            There are no YouTube Shorts to display at the moment.
          </p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black w-full h-screen overflow-hidden">
      {/* Feed Container */}
      <div
        ref={containerRef}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {reels.map((reel, index) => (
          <div
            key={reel._id}
            data-reel-index={index}
            className="h-screen w-full snap-start snap-always"
            style={{ scrollSnapAlign: "start" }}
          >
            <YouTubeShortItem
              reel={reel}
              isActive={index === activeIndex}
              isNear={index >= activeIndex && index <= activeIndex + 2}
              isImmediateNext={index === activeIndex + 1}
              isMuted={globalMuted}
              toggleMute={(e) => {
                e.stopPropagation();
                setGlobalMuted((prev) => !prev);
              }}
            />
          </div>
        ))}
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 left-3 z-50 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full text-white text-xs hover:bg-black/70 transition-colors flex items-center gap-1 border border-white/10 shadow-xl"
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
    </div>
  );
}

interface ItemProps {
  reel: Reel;
  isActive: boolean;
  isNear: boolean;
  isImmediateNext: boolean;
  isMuted: boolean;
  toggleMute: (e: React.MouseEvent) => void;
}

function YouTubeShortItem({ reel, isActive, isNear, isImmediateNext, isMuted, toggleMute }: ItemProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const isReadyRef = useRef<boolean>(false);

  const [mountPlayer, setMountPlayer] = useState(isActive);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Fallback state for High-Quality YouTube Thumbnails
  const [thumbUrl, setThumbUrl] = useState(`https://img.youtube.com/vi/${reel.videoId}/maxresdefault.jpg`);

  const handleThumbError = () => {
    setThumbUrl(`https://img.youtube.com/vi/${reel.videoId}/hqdefault.jpg`);
  };

  // 1. Debounced Player preloading control
  useEffect(() => {
    if (isActive) {
      // Debounce mounting the active player by 200ms to allow smooth scroll snap settlement
      const timer = setTimeout(() => {
        setMountPlayer(true);
      }, 200);
      return () => clearTimeout(timer);
    }

    if (isImmediateNext) {
      // Preload next player after 400ms delay to buffer in the background
      const timer = setTimeout(() => {
        setMountPlayer(true);
      }, 400);
      return () => clearTimeout(timer);
    }

    // Unmount player immediately for all other items
    setMountPlayer(false);
  }, [isActive, isImmediateNext]);

  // 2. Player Instance Creation/Disposal (based on mountPlayer)
  useEffect(() => {
    if (!mountPlayer || !playerContainerRef.current) {
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT player:", e);
        }
        playerInstanceRef.current = null;
        isReadyRef.current = false;
        setIsReady(false);
        setPlayerState(null);
      }
      return;
    }

    let isDestroyed = false;

    loadYouTubeIframeAPI().then(() => {
      if (isDestroyed || !playerContainerRef.current || playerInstanceRef.current) return;

      try {
        playerInstanceRef.current = new window.YT.Player(playerContainerRef.current, {
          videoId: reel.videoId,
          playerVars: {
            autoplay: isActive ? 1 : 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            loop: 1,
            playlist: reel.videoId,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              if (isDestroyed) return;
              isReadyRef.current = true;
              setIsReady(true);

              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
              }

              if (isActive) {
                event.target.playVideo();
              }
            },
            onStateChange: (event: any) => {
              if (isDestroyed) return;
              setPlayerState(event.data);

              if (event.data === 0) { // ENDED
                event.target.playVideo();
              }
            },
            onError: (event: any) => {
              console.error("YouTube Player error:", event.data);
              setHasError(true);
            },
          },
        });
      } catch (err) {
        console.error("Player initialization error:", err);
        setHasError(true);
      }
    });

    return () => {
      isDestroyed = true;
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT player in cleanup:", e);
        }
        playerInstanceRef.current = null;
        isReadyRef.current = false;
        setIsReady(false);
        setPlayerState(null);
      }
    };
  }, [mountPlayer, reel.videoId]);

  // 3. Play/Pause Action Syncing
  useEffect(() => {
    if (!isReadyRef.current || !playerInstanceRef.current) return;

    const player = playerInstanceRef.current;
    try {
      if (isActive) {
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
        
        // Skip redundant seek if player is already at the beginning to avoid dumping pre-buffered chunks
        const currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
        if (currentTime > 0.1) {
          player.seekTo(0, true);
        }
        
        player.playVideo();
      } else {
        player.pauseVideo();
        player.mute();
      }
    } catch (e) {
      console.error("Error syncing active status:", e);
    }
  }, [isActive]);

  // 4. Volume State Syncing
  useEffect(() => {
    if (!isReadyRef.current || !playerInstanceRef.current || !isActive) return;

    const player = playerInstanceRef.current;
    try {
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
    } catch (e) {
      console.error("Error syncing mute status:", e);
    }
  }, [isMuted, isActive]);

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isReadyRef.current || !playerInstanceRef.current) return;

    const player = playerInstanceRef.current;
    try {
      if (playerState === 1) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    } catch (e) {
      console.error("Error toggling play state:", e);
    }
  };

  if (hasError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <h3 className="text-lg font-bold mb-1">This video is currently unavailable</h3>
        <p className="text-xs text-gray-500">It might be private, deleted, or embed-restricted.</p>
      </div>
    );
  }

  const isVideoPlaying = playerState === 1;
  const isVideoBuffering = playerState === 3;
  const showPlayButton = isReady && !isVideoPlaying && !isVideoBuffering;

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-[450px] mx-auto relative flex items-center justify-center bg-black overflow-hidden group animate-fade-in">
        
        {/* H-Q Image Cover Thumbnail layer (extremely lightweight, instant load) */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={thumbUrl}
            onError={handleThumbError}
            alt={reel.title || "Reel Thumbnail"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* YouTube Player Layer (only mounts when active or staggered preload ready) */}
        {mountPlayer && (
          <div 
            className={`w-full h-full border-0 absolute inset-0 pointer-events-none overflow-hidden transition-all duration-300 ${
              isReady ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <div ref={playerContainerRef} className="w-full h-full" />
          </div>
        )}

        {/* Top & Bottom Black Overlays to hide YT title and logo without side cropping */}
        <div className="absolute top-0 left-0 right-0 h-[8vh] bg-black z-25 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[8vh] bg-black z-25 pointer-events-none" />

        {/* Loading Spinner for initialization / buffering */}
        {((mountPlayer && !isReady) || isVideoBuffering) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 backdrop-blur-[2px]">
            <SpinnerCustom />
          </div>
        )}

        {/* Clickable transparent overlay to catch play/pause toggles */}
        <div
          className="absolute inset-0 z-15 cursor-pointer flex items-center justify-center"
          onClick={handlePlayToggle}
        >
          {showPlayButton && (
            <div className="bg-black/50 p-4 rounded-full text-white backdrop-blur-sm transition-all hover:scale-110 active:scale-95 duration-150">
              <Play size={44} fill="currentColor" className="ml-1" />
            </div>
          )}
        </div>

        {/* Global Mute/Unmute toggle button */}
        <button
          onClick={toggleMute}
          className="absolute bottom-28 right-4 z-20 bg-black/50 p-3 rounded-full text-white backdrop-blur-sm hover:bg-black/70 active:scale-90 transition-all shadow-lg border border-white/10"
        >
          {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>
      </div>
    </div>
  );
}
