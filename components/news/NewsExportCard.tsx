import React, { forwardRef } from "react";
import { BiLike, BiTime } from "react-icons/bi";

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

interface NewsExportCardProps {
  news: NewsItem;
}

export const NewsExportCard = forwardRef<HTMLDivElement, NewsExportCardProps>(
  ({ news }, ref) => {
    // Format publish date
    const formattedDate = news.publish
      ? new Date(news.publish).toLocaleString("en-BD", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "N/A";

    // Proxy helper for remote images to avoid CORS problems in canvas conversion
    const getProxyUrl = (url?: string) => {
      if (!url) return "";
      // If it is a relative local URL, do not proxy it to avoid self-fetch deadlock on single-threaded dev server
      if (url.startsWith("/") || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        return url;
      }
      return `/api/proxy-image?url=${encodeURIComponent(url)}&cb=${Date.now()}`;
    };

    return (

      <div
        ref={ref}
        className="w-[600px] bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 border border-gray-800/80 p-8 rounded-3xl text-white flex flex-col justify-between gap-6 font-parkinsans"
       
      >
        {/* Brand Banner Header */}
        <div className="flex items-center justify-between border-b border-gray-900/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-orbitron font-bold text-3xl text-white">
              EmptyBD
            </span>
          </div>
          <span className="text-sm tracking-wider font-semibold text-gray-400 ">
            www.emptybd.com
          </span>
        </div>

        {/* Author details */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getProxyUrl(news.author.author_img)}
              alt={news.author.author_name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-secondary/30"
              crossOrigin="anonymous"
            />
            <div>
              <h5 className="text-base font-bold text-white flex items-center gap-1.5">
                {news.author.author_name}
                {news.author.author_plan === "premium" && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 13 13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="blue">
                        <stop offset="0%" stop-color="#4dabf7" />
                        <stop offset="60%" stop-color="#006aff" />
                        <stop offset="100%" stop-color="#0050cc" />
                      </radialGradient>
                    </defs>
                    <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue)" />
                    <path
                      d="M4 6.6 L5.8 8.4 L9 5.2"
                      stroke="white"
                      stroke-width="1.35"
                      fill="none"
                    />
                  </svg>
                )}
                {news.author.author_plan === "owner" && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 13 13"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="gold">
                        <stop offset="0%" stop-color="#ffdd80" />
                        <stop offset="60%" stop-color="#ffb516" />
                        <stop offset="100%" stop-color="#e89f00" />
                      </radialGradient>
                    </defs>
                    <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold)" />
                    <path
                      d="M4 6.6 L5.8 8.4 L9 5.2"
                      stroke="white"
                      stroke-width="1.35"
                      fill="none"
                    />
                  </svg>
                )}
              </h5>
              <p className="text-xs text-gray-400 font-medium">
                <span>{formattedDate}</span>
                {/* {news.author.author_role || "Verified Member"} */}
              </p>
            </div>
          </div>
          {/* <div className="text-right text-[11px] text-gray-400 font-mono flex items-center gap-1">
            <BiTime size={14} className="text-secondary" />
            <span>{formattedDate}</span>
          </div> */}
        </div>

        {/* Featured Image if available */}
        {news.news_img && (
          <div className="relative overflow-hidden rounded-2xl border border-gray-900/60 w-full">
            <img
              src={getProxyUrl(news.news_img)}
              alt="news featured"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Description / Body text */}
        <div className="flex-1">
          <p className="text-[15px] leading-relaxed text-gray-100 font-hind break-words whitespace-pre-line">
            {news.news_description}
          </p>
        </div>

        {/* Footer info & reactions metadata */}
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between text-sm text-gray-400">
          <span className="font-semibold text-gray-100 flex items-center gap-1.5">
            <BiLike size={16} /> {news.reactions.length} Impressed
          </span>
          <span className="px-3 py-1 min-w-fit rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-orbitron font-semibold">
            Earn: {(news.reactions.length * 1.3).toFixed(2)}৳
          </span>
          {/* <span className="text-[10px] text-gray-500 font-medium font-mono">
            ID: {news._id}
          </span> */}
        </div>
      </div>
    );
  }
);

NewsExportCard.displayName = "NewsExportCard";
