"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";
import { 
  Bookmark, 
  Trash2, 
  ExternalLink,
  Newspaper,
  ShoppingBag,
  Gavel,
  Calendar,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";

interface BookmarkedItem {
  _id: string;
  itemId: string;
  itemType: "news" | "product" | "bid";
  createdAt: string;
  item: {
    _id: string;
    news_title?: string;
    news_img?: string;
    news_description?: string;
    title?: string;
    news_img_base64?: string;
    price?: number;
    bidding_price?: number;
    product?: {
      title?: string;
      image?: string;
    };
    author?: {
      author_name?: string;
    };
    seller?: {
      seller_name?: string;
    };
  };
}

export default function SavedBookmarksPage() {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (itemId: string, itemType: string) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, itemType })
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.itemId !== itemId));
        toast.success("Bookmark removed successfully");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove bookmark");
    }
  };

  if (loading) {
    return <SpinnerCustom />;
  }

  if (bookmarks.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white font-orbitron flex items-center gap-2">
          <Bookmark className="text-blue-500" size={24} />
          Saved Bookmarks
        </h2>
        <Empty description="No saved bookmarks found. Save articles, products or bids to see them here!" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <h2 className="text-xl font-bold text-white font-orbitron flex items-center gap-2">
        <Bookmark className="text-blue-500" size={24} />
        Saved Bookmarks ({bookmarks.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bookmarks.map((bookmark) => {
          const { item, itemType, itemId } = bookmark;
          
          // Compute details based on type
          let title = "Untitled Item";
          let imageUrl = "/placeholder-image.png";
          let subtitle = "";
          let priceInfo = null;
          let linkUrl = "";

          if (itemType === "news") {
            title = item.news_title || item.news_description?.slice(0, 50) || "News Article";
            imageUrl = item.news_img || "/placeholder-news.jpg";
            subtitle = `By ${item.author?.author_name || "Author"}`;
            linkUrl = `/news/${itemId}`;
          } else if (itemType === "product") {
            title = item.title || "Marketplace Product";
            imageUrl = item.news_img || "/placeholder-product.jpg";
            subtitle = `Price: ৳${item.price || 0}`;
            priceInfo = item.price;
            linkUrl = `/e-commerce-products/${itemId}`;
          } else if (itemType === "bid") {
            title = item.product?.title || item.title || "Live Auction";
            imageUrl = item.product?.image || "/placeholder-bid.jpg";
            subtitle = `Highest Bid: ৳${item.bidding_price || 0}`;
            priceInfo = item.bidding_price;
            linkUrl = `/bid/all-selling-product/${itemId}`;
          }

          return (
            <div 
              key={bookmark._id} 
              className="group bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 hover:bg-gray-900/60 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="flex gap-4 p-4">
                {/* Thumbnail Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-950 border border-gray-800/80 flex-shrink-0 relative">
                  <BackendImage 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                   />
                  {/* Badge for Type */}
                  <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    itemType === "news" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                    itemType === "product" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                    "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  }`}>
                    {itemType === "bid" ? "auction" : itemType}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 font-parkinsans space-y-1">
                  <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {title}
                  </h4>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    {itemType === "news" && <Newspaper size={12} className="text-blue-400" />}
                    {itemType === "product" && <ShoppingBag size={12} className="text-emerald-400" />}
                    {itemType === "bid" && <Gavel size={12} className="text-purple-400" />}
                    <span className="truncate">{subtitle}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    Saved {new Date(bookmark.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex border-t border-gray-800 bg-gray-950/40 p-2 justify-between items-center px-4">
                <button
                  onClick={() => handleRemoveBookmark(itemId, itemType)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors p-1"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>

                <Link prefetch={false} 
                  href={linkUrl}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors p-1"
                >
                  <span>View Details</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
