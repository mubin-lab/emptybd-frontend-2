import React, { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { BiCopy, BiDownload, BiShareAlt, BiCheck, BiX } from "react-icons/bi";
import { NewsExportCard } from "./NewsExportCard";

type NewsItem = {
  reactions: string[];
  news_img?: string;
  publish?: string | Date;
  news_description: React.ReactNode;
  author: {
    author_img: string;
    author_name: string;
    author_plan?: string;
    author_role?: string;
  };
  _id: string;
};

interface ShareBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsItem | null;
}

export default function ShareBottomSheet({
  isOpen,
  onClose,
  news,
}: ShareBottomSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Transition mount check
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  if (!isOpen && !shouldRender) return null;
  if (!news) return null;

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}/news/${news._id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    toast.success("Post link copied to clipboard!");
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1500);
  };

  const handleSaveImage = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Generating your high-quality postcard...");

    try {
      if (cardRef.current) {
        // Query all images inside the postcard template
        const images = Array.from(cardRef.current.querySelectorAll("img"));
        
        // Wait for all images to load/decode completely (or fail gracefully)
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        // A small delay buffer (300ms) for browser layout parsing
        await new Promise((resolve) => setTimeout(resolve, 300));

        // html-to-image conversion options
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
          },
        });

        // Trigger automatic browser download
        const link = document.createElement("a");
        link.download = `emptybd_news_${news._id}.png`;
        link.href = dataUrl;
        link.click();

        toast.success("News postcard saved successfully!", { id: toastId });
        onClose();
        
        // Temporary fix: Hard reload to clear html-to-image/browser cache
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error("Card reference not initialized");
      }
    } catch (error) {
      console.error("Save image error:", error);
      toast.error("Failed to generate and download card. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleSystemShare = async () => {
    const postUrl = `${window.location.origin}/news/${news._id}`;
    const authorName = news.author.author_name;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `News by ${authorName} | EmptyBD`,
          text: `Check out this verified post by ${authorName} on EmptyBD!`,
          url: postUrl,
        });
        onClose();
      } catch (error) {
        console.error("Native share failed:", error);
      }
    } else {
      // Fallback
      handleCopyLink();
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet Container */}
      <div
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-gray-950 border-t border-gray-900 rounded-t-3xl p-6 z-50 shadow-2xl transition-all duration-300 ease-out transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onTransitionEnd={() => {
          if (!isOpen) setShouldRender(false);
        }}
      >
        {/* Top Handle */}
        <div className="w-12 h-1 bg-gray-800 rounded-full mx-auto mb-5 cursor-pointer" onClick={onClose} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-900/60">
          <div>
            <h3 className="text-base font-bold text-white font-parkinsans">
              Share Post
            </h3>
            <p className="text-[11px] text-gray-400 font-parkinsans">
              Choose how you want to share this news
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-900 rounded-full text-gray-400 hover:text-white transition-colors duration-200"
          >
            <BiX size={20} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Save Card */}
          <button
            onClick={handleSaveImage}
            disabled={isSaving}
            className="w-full flex items-center justify-between p-4 bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800/80 hover:border-gray-800 rounded-2xl transition-all duration-200 group text-left cursor-pointer disabled:opacity-55"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 border border-emerald-500/20 transition-all duration-200">
                <BiDownload size={20} className={isSaving ? "animate-bounce" : ""} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-parkinsans">
                  {isSaving ? "Generating Postcard..." : "Save as Image"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Download a premium, high-quality postcard
                </p>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-white transition-colors duration-200">&rarr;</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-between p-4 bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800/80 hover:border-gray-800 rounded-2xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 border border-blue-500/20 transition-all duration-200">
                {copied ? <BiCheck size={20} className="text-green-400" /> : <BiCopy size={20} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-parkinsans">
                  {copied ? "Link Copied!" : "Copy Post Link"}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Copy direct post link to your clipboard
                </p>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-white transition-colors duration-200">&rarr;</span>
          </button>

          {/* Native System Share (if supported) */}
          <button
            onClick={handleSystemShare}
            className="w-full flex items-center justify-between p-4 bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800/80 hover:border-gray-800 rounded-2xl transition-all duration-200 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 border border-purple-500/20 transition-all duration-200">
                <BiShareAlt size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white font-parkinsans">
                  Share via System
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Open your device's native share drawer
                </p>
              </div>
            </div>
            <span className="text-gray-500 group-hover:text-white transition-colors duration-200">&rarr;</span>
          </button>
        </div>

        {/* Hidden Card Template Off-Screen */}
        <div style={{ position: "fixed", left: "-9999px", top: "-9999px" }}>
          <NewsExportCard key={news._id} ref={cardRef} news={news} />
        </div>
      </div>
    </>
  );
}
