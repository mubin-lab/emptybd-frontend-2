"use client";
import BackendImage from "@/components/shared/BackendImage";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TimeAgo from "@/components/short-component/TimeAgo";
import { useAuthStore } from "@/lib/store/authStore";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BsDoorOpenFill } from "react-icons/bs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { IoMdShareAlt } from "react-icons/io";
import { BiCloudUpload } from "react-icons/bi";
import { SpinnerCustom } from "@/components/loading/Spinner";
import ShareBottomSheet from "@/components/news/ShareBottomSheet";
import AdsCard, { AdType } from "@/components/shared/AdsCard";
import { Plus, Newspaper, ChevronRight } from "lucide-react";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { useTracking } from "@/lib/hooks/useTracking";
import { useRouter } from "next/navigation";
import PlanBadge from "@/components/shared/PlanBadge";

import { useQuery, useQueryClient } from "@tanstack/react-query";

// Module-level cache to persist data until reload
let cachedAllNews: NewsItem[] | null = null;
let lastFetchedPage: number = 0;
let cachedHasMore: boolean = true;
type NewsItem = {
  reactions: string[];
  news_img?: string;
  publish?: string | Date;
  news_description: string;
  author: {
    author_img: string;
    author_name: string;
    author_plan?: string;
    author_role?: string;
    author_email?: string;
  };
  _id: string;
};

export default function AllNews({ limitMode = false }: { limitMode?: boolean }) {
  const [allNews, setAllNews] = useState<NewsItem[]>(cachedAllNews || []);
  const [page, setPage] = useState(lastFetchedPage > 0 ? lastFetchedPage : 1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(cachedHasMore);
  const [activeShareNews, setActiveShareNews] = useState<NewsItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { trackFeatureVisit } = useTracking();

  const { data: exchangeCards = [] } = useQuery({
    queryKey: ['exchangeCards'],
    queryFn: async () => {
      if (limitMode) return [];
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards?status=Active&isListed=true&limit=15`);
      if (!res.ok) throw new Error("Failed to fetch exchange cards");
      const data = await res.json();
      return data.assets || [];
    },
    staleTime: Infinity,
  });

  const { data: bids = [] } = useQuery({
    queryKey: ['allBids'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid?limit=15`);
      if (!res.ok) throw new Error("Failed to fetch bids");
      const data = await res.json();
      return data || [];
    },
    staleTime: Infinity,
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['ads', 'news'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/active?page=news`);
      if (!res.ok) throw new Error("Failed to fetch ads");
      return await res.json();
    },
    staleTime: Infinity,
  });

  // Handled by React Query above

  useEffect(() => {
    trackFeatureVisit("news_feed");
  }, [trackFeatureVisit]);

  const { data: newsPageData, isFetching: isFetchingNews } = useQuery({
    queryKey: ['newsPage', page],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/limit?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return await res.json();
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    // Only process if we have data, we haven't already processed this page, and there's more to fetch
    if (newsPageData && hasMore && page > lastFetchedPage) {
      if (newsPageData.length === 0) {
        setHasMore(false);
        cachedHasMore = false;
        lastFetchedPage = page;
        setLoading(false);
        return;
      }

      setAllNews((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newItems = newsPageData.filter((item: any) => !existingIds.has(item._id));
        
        if (newItems.length > 0) {
          // Shuffle to break serial order
          for (let i = newItems.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
          }
          
          const updatedNews = [...prev, ...newItems];
          cachedAllNews = updatedNews; // Update cache
          return updatedNews;
        }
        return prev;
      });
      
      lastFetchedPage = page; // Update max fetched page
      setLoading(false);
    }
  }, [newsPageData, page, hasMore]);

  // Sync loading state with query
  useEffect(() => {
    if (isFetchingNews && page > lastFetchedPage) {
      setLoading(true);
    } else if (!isFetchingNews) {
      setLoading(false);
    }
  }, [isFetchingNews, page]);

  // Handled by React Query above

  // Infinite scroll with scroll event
  useEffect(() => {
    if (limitMode) return;

    let throttleTimeout: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 250
        ) {
          if (!loading && !isFetchingNews && hasMore) {
            setPage((prev) => prev + 1);
          }
        }
        throttleTimeout = null;
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, limitMode, isFetchingNews]);

  const handleReaction = async (newsId: string) => {
    if (!user?.email) return;

    const token = localStorage.getItem("auth_token");

    // Optimistic update (toggle like / unlike)
    setAllNews((prev) => {
      const newNews = prev.map((item) =>
        item._id === newsId
          ? {
            ...item,
            reactions: item.reactions.includes(user.email!)
              ? item.reactions.filter((e) => e !== user.email)
              : [...item.reactions, user.email!],
          }
          : item
      );
      cachedAllNews = newNews; // Keep cache in sync
      return newNews;
    });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/${newsId}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userEmail: user.email }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        console.error("Reaction API error:", err);
        const { toast } = await import("sonner");
        toast.error(err.message || "Like failed");
        // Rollback optimistic update
        setAllNews((prev) => {
          const rolledBack = prev.map((item) =>
            item._id === newsId
              ? {
                  ...item,
                  reactions: item.reactions.includes(user.email!)
                    ? item.reactions.filter((e) => e !== user.email)
                    : [...item.reactions, user.email!],
                }
              : item
          );
          cachedAllNews = rolledBack; // Keep cache in sync
          return rolledBack;
        });
      }
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  // Slice news for limitMode to prevent home page from being huge if cache has many pages
  const displayedNews = limitMode ? allNews.slice(0, 10) : allNews;

  // Show loading only for first page
  if (displayedNews.length === 0 && loading) {
    return (
      <SpinnerCustom />
    );
  }

  return (
    <div className="max-w-[1440px] w-full mx-auto flex flex-col items-center">
      <div className="w-full flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-4">
        {displayedNews.map((item, index) => {
          const matchingAds = ads.filter((ad: AdType) => (index + 1) === ad.insertionPosition);
          const adToDisplay = matchingAds.length > 0 ? matchingAds[0] : null;
          const showExchangeSlider = (index + 1) % 16 === 0;
          const showTrendingBids = (index + 1) % 6 === 0 && (index + 1) % 16 !== 0;

          return (
            <React.Fragment key={item._id}>
              <div className="col-span-1 h-full">
                <NewsCard
                  news={item}
                  user={user}
                  handleReaction={handleReaction}
                  onShare={() => {
                    setActiveShareNews(item);
                    setIsShareOpen(true);
                  }}
                />
              </div>
              {adToDisplay && <div className="col-span-full w-full"><AdsCard ad={adToDisplay} /></div>}
              {showExchangeSlider && <div className="col-span-full w-full"><ExchangeSlider cards={exchangeCards} /></div>}
              {showTrendingBids && <div className="col-span-full w-full"><TrendingBidsSlider bids={bids} /></div>}
            </React.Fragment>
          );
        })}
      </div>

      {limitMode ? (
        <div className="w-full flex justify-center my-4">
          <Link href="/news" prefetch={false} className="px-6 py-3 bg-gray-900 border border-gray-800 text-gray-300 hover:text-white rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg">
            See more news <ChevronRight size={18} />
          </Link>
        </div>
      ) : (
        <>
          {(!hasMore && displayedNews.length === 0) && (
            <div className="w-full flex flex-col items-center justify-center py-20 px-6 text-center bg-gray-950/60 border border-gray-900 rounded-3xl backdrop-blur-md mt-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="w-20 h-20 mb-6 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <Newspaper className="text-gray-500 text-3xl group-hover:text-primary group-hover:scale-110 transition-all duration-500" />
              </div>
              
              <h3 className="text-2xl font-bold font-averia-gruesa-libre text-white mb-2">No News Yet</h3>
              <p className="text-gray-400 font-parkinsans text-sm lg:text-base max-w-md mx-auto mb-8 leading-relaxed">
                There are no news updates at the moment. Be the first to share an update or an important story!
              </p>
            </div>
          )}

          {(!hasMore || displayedNews.length > 0) && user && (
            <Link
              href="/news/create-news"
              prefetch={false}
              className="text-[13px] lg:text-base text-black font-bold font-parkinsans flex items-center gap-2 bg-primary hover:bg-primary/90 transition-colors p-3 rounded-full w-fit mx-auto mt-6 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
            >
              <Plus size={20} />
              Create News Post
            </Link>
          )}
        </>
      )}

      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        news={activeShareNews}
      />

      <PageHelpPanel pageKey="news" />
    </div>
  );
}

// Custom horizontal scroll list of 10 random collectibles
const ExchangeSlider = ({ cards }: { cards: any[] }) => {
  const router = useRouter();
  const [shuffled, setShuffled] = useState<any[]>([]);

  useEffect(() => {
    if (cards.length > 0) {
      setShuffled([...cards].sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [cards]);

  if (shuffled.length === 0) return null;

  return (
    <div className="w-full my-6 bg-gray-950/40 p-5 border border-gray-900 rounded-3xl backdrop-blur-md relative overflow-hidden group">
      {/* Dynamic light effects background */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs md:text-sm font-bold font-orbitron text-white flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Featured <span className="text-primary">Collectibles</span>
        </h3>
        <Link href="/digital-exchange" prefetch={false} className="text-[11px] text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
          Explore all <ChevronRight size={12} className="mt-0.5" />
        </Link>
      </div>

      {/* Horizontal Scroll wrapper */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {shuffled.map((card) => (
            <div
              key={card._id}
              onClick={() => router.push(`/digital-exchange/${card._id}`)}
              className="shrink-0 w-[42%] sm:w-[30%] md:w-[23%] lg:w-[18%] snap-start bg-gray-950 border border-gray-900 hover:border-primary/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 relative aspect-[400/560] group/item shadow-lg"
            >
              <BackendImage 
                showShine 
                src={card.image} 
                alt={card.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" 
              />
              
              {/* Bottom bar overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col justify-end min-h-[50%]">
                <span className="text-[10px] md:text-xs font-bold font-orbitron text-white truncate">{card.title}</span>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-medium font-mono mt-1">
                  Price: <strong className="text-emerald-400 font-bold">{card.currentPrice} ৳</strong>
                </span>
              </div>
            </div>
          ))}
          {/* Breathing space block */}
          <div className="shrink-0 w-4 md:w-8" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

// Custom horizontal scroll list of trending bids
const TrendingBidsSlider = ({ bids }: { bids: any[] }) => {
  const router = useRouter();
  const [shuffled, setShuffled] = useState<any[]>([]);

  useEffect(() => {
    if (bids.length > 0) {
      setShuffled([...bids].sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [bids]);

  if (shuffled.length === 0) return null;

  return (
    <div className="w-full my-6 bg-gray-950/40 p-5 border border-gray-900 rounded-3xl backdrop-blur-md relative overflow-hidden group">
      {/* Dynamic light effects background */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-xs md:text-sm font-bold font-orbitron text-white flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Trending <span className="text-emerald-400">Bids</span>
        </h3>
        <Link href="/bid/all-selling-product" prefetch={false} className="text-[11px] text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
          Explore all <ChevronRight size={12} className="mt-0.5" />
        </Link>
      </div>

      {/* Horizontal Scroll wrapper */}
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide snap-x snap-mandatory scroll-smooth">
          {shuffled.map((bid) => (
            <div
              key={bid._id}
              onClick={() => router.push(`/bid/all-selling-product/${bid._id}`)}
              className="shrink-0 w-[42%] sm:w-[30%] md:w-[23%] lg:w-[18%] snap-start bg-gray-950 border border-gray-900 hover:border-emerald-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 relative aspect-[400/560] group/item shadow-lg"
            >
              {bid.product.media_url ? (
                <BackendImage 
                  showShine 
                  src={bid.product.media_url} 
                  alt={bid.product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" 
                />
              ) : (
                <BackendImage 
                  showShine 
                  src={bid.product.image_url} 
                  alt={bid.product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105" 
                />
              )}
              
              {/* Bottom bar overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent flex flex-col justify-end min-h-[50%]">
                <span className="text-[10px] md:text-xs font-bold font-orbitron text-white truncate">{bid.product.title}</span>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-medium font-mono mt-1">
                  Current Bid: <strong className="text-emerald-400 font-bold">৳{bid.bidding_price}</strong>
                </span>
              </div>
            </div>
          ))}
          {/* Breathing space block */}
          <div className="shrink-0 w-4 md:w-8" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

const NewsCard = ({
  news,
  user,
  handleReaction,
  onShare,
}: {
  news: NewsItem;
  user: any;
  handleReaction: (id: string) => void;
  onShare: () => void;
}) => {
  const hasReacted = user?.email && news.reactions.includes(user.email);
  const router = useRouter();

  return (
    <div className="p-3 h-full flex flex-col rounded-2xl shadow-lg hover:shadow-2xl/15 bg-gray-950/70 border border-gray-900 backdrop-blur-md transition-all duration-300">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/user/${news.author.author_email}`} prefetch={false} className="flex items-center gap-3 flex-1 hover:opacity-90 group">
          <BackendImage
            src={news.author.author_img}
            alt={news.author.author_name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-800 group-hover:ring-secondary/50 transition-all duration-300"
          />
          <div className="flex-1">
            <h5 className="text-xs lg:text-sm font-semibold font-parkinsans flex items-center gap-1.5 text-white group-hover:text-secondary transition-colors duration-200">
              {news.author.author_name}{" "}
              <PlanBadge plan={news.author.author_plan} />
              {/* {news.author.author_plan === "premium" && (
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
              )} */}
            </h5>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] font-medium font-parkinsans text-gray-400">
              {news?.publish && (
                <TimeAgo
                  date={news.publish}
                  className="text-[9px] text-gray-400 font-medium"
                />
              )}{" "}
              ago
            </div>
          </div>
        </Link>
        <button
          onClick={onShare}
          className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-gray-900 rounded-full cursor-pointer"
        >
          <IoMdShareAlt size={20} />
        </button>
      </div>

      <div>
        <Link href={`/news/${news._id}`} prefetch={false} className="block group">
          <div 
            className="text-xs line-clamp-4 font-medium font-hind mt-3 text-gray-300 leading-relaxed hover:text-white transition-colors duration-200 cursor-pointer prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 break-words"
            dangerouslySetInnerHTML={{ __html: typeof news.news_description === "string" ? news.news_description.replace(/&nbsp;/g, " ") : String(news.news_description) }}
          />
            <span className="text-xs -mt-1 font-medium">Read More</span>

          {news.news_img && (
            <div className="overflow-hidden rounded-lg border border-gray-900 my-3 cursor-pointer group">
              <BackendImage
                src={news.news_img}
                alt="banner"
                className="max-w-[100%] w-full max-h-60 mx-auto object-cover transition-transform duration-500 group-hover:scale-102"
              />
            </div>
          )}
        </Link>
      </div>


      <div className="flex items-center justify-between pt-3 border-t border-gray-900 mt-4">
        {user?.email ? (
          <button
            // onClick={() => !hasReacted && handleReaction(news._id)}
            onClick={()=>router.push(`/news/${news._id}`)}
            className={`text-xs lg:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 select-none ${hasReacted
              ? "text-secondary cursor-default"
              : "text-gray-400 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
              }`}
          >
            {hasReacted ? (
              <AiFillLike size={20} className="text-secondary" />
            ) : (
              <AiOutlineLike size={20} />
            )}
            <span>{news.reactions.length} Like</span>
          </button>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-xs lg:text-sm text-gray-400 hover:text-white hover:scale-105 active:scale-95 font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200">
                <AiOutlineLike size={20} />
                <span>{news.reactions.length} Like</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm p-5 bg-gray-950 border border-gray-900 rounded-xl">
              <DialogHeader>
                <BsDoorOpenFill className="w-fit mx-auto text-primary" size={36} />
                <DialogTitle className="text-base lg:text-lg text-center text-white font-parkinsans">
                  Please login to your account.
                </DialogTitle>
              </DialogHeader>
              <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
                <DialogClose asChild>
                  <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white">Cancel</Button>
                </DialogClose>
                <Button className="bg-black text-white rounded-sm lg:rounded-md hover:opacity-90">
                  <Link href="/login" prefetch={false} className="w-full">Login</Link>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Link href={`/news/${news._id}`} prefetch={false} className="block group">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-orbitron bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="text-[10px] text-gray-400 font-parkinsans font-normal">Earn:</span>
            <span>{(news.reactions.length * 1.4).toFixed(2)}</span>
            <span className="text-[11px] font-normal">৳</span>
          </div>
        </Link>
      </div>
    </div>
  );
};