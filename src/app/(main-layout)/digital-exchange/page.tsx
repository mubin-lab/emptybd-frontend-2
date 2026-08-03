"use client";
import BackendImage from "@/components/shared/BackendImage";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Tag, Star, LayoutGrid, Coins } from "lucide-react";
import { toast } from "sonner";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { useTracking } from "@/lib/hooks/useTracking";

const subCategories = [
  { name: "All", image: null },
  { name: "Football", image: "/exchange-card/football.png" },
  { name: "Cricket", image: "/exchange-card/cricket.png" },
  { name: "Baseball", image: "/exchange-card/baseball.png" },
  { name: "Basketball", image: "/exchange-card/basketball.png" },
  { name: "Volleyball", image: "/exchange-card/volleyball.png" },
  { name: "Tennis", image: "/exchange-card/tennis.png" },
  { name: "Badminton", image: "/exchange-card/badmintion.png" },
  { name: "Table Tennis", image: "/exchange-card/table-tennis.png" },
  { name: "Rugby", image: "/exchange-card/rugby.png" },
  { name: "Golf", image: "/exchange-card/golf.png" },
];

export default function DigitalExchange() {
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [subCategoryFilter, setSubCategoryFilter] = useState("All");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const { trackFeatureVisit } = useTracking();

  useEffect(() => {
    trackFeatureVisit("exchange");
  }, [trackFeatureVisit]);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards?status=Active&isListed=true`);
        if (res.ok) {
          const data = await res.json();
          // Randomly shuffle the cards
          const shuffledAssets = [...data.assets].sort(() => Math.random() - 0.5);
          setCards(shuffledAssets);
        } else {
          toast.error("Failed to load marketplace data");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "All" || card.category === categoryFilter;
    const matchesSubCategory = subCategoryFilter === "All" || card.subCategory === subCategoryFilter;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  return (
    <div className="min-h-screen font-parkinsans px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 mt-4">
          <h1 className="text-2xl md:text-4xl font-orbitron font-bold text-white tracking-tight">
            Digital <span className="text-primary">Exchange</span>
          </h1>

          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-gray-900 border text-xs md:text-sm lg:text-base border-gray-800 rounded-sm lg:rounded-xl py-2 px-1 lg:px-4 lg:py-3 text-white focus:outline-none focus:border-primary outline-none transition-colors"
            >
              <option value="All">All Categories</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Big-Time">Big-Time</option>
            </select>
          </div>
        </div>

        {/* Subcategories Horizontal Scroll */}
        <div className="mb-0 lg:mb-8 w-full">
          <div className="flex gap-0 md:gap-6 overflow-x-auto pb-6 pt-2 px-2 -mx-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x">
            {subCategories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => setSubCategoryFilter(cat.name)}
                className={`flex-shrink-0 snap-start cursor-pointer group flex flex-col items-center gap-1 ${
                  subCategoryFilter === cat.name ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                } transition-all duration-300 w-[72px] md:w-[88px]`}
              >
                <div className={`w-14 h-14 md:w-20 md:h-20 rounded-md lg:rounded-2xl overflow-hidden border-2 transition-all duration-300 relative bg-gray-900 ${
                  subCategoryFilter === cat.name 
                    ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] scale-110 -translate-y-1' 
                    : 'border-gray-800 group-hover:border-gray-600 group-hover:-translate-y-1'
                }`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-md lg:rounded-2xl" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <LayoutGrid className={`w-6 h-6 md:w-8 md:h-8 ${subCategoryFilter === cat.name ? 'text-primary' : 'text-gray-500 group-hover:text-gray-400'}`} />
                    </div>
                  )}
                  {subCategoryFilter === cat.name && (
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                  )}
                </div>
                <span className={`text-[9px] md:text-xs text-center uppercase tracking-wider ${
                  subCategoryFilter === cat.name ? 'text-primary font-semibold' : 'text-gray-100 font-medium group-hover:text-gray-300'
                }`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search collectibles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs md:text-sm lg:text-base pl-12 pr-4 py-2 lg:py-3 bg-gray-900 border border-gray-800 rounded-sm lg:rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse bg-gray-900/50 aspect-[400/560] lg:rounded-xl border border-gray-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
            {filteredCards.map((card) => (
              <div
                key={card._id}
                onClick={() => {
                  if (activeCardId === card._id) {
                    router.push(`/digital-exchange/${card._id}`);
                  } else {
                    setActiveCardId(card._id);
                  }
                }}
                className="relative aspect-[400/560] bg-gray-950 border border-gray-800 rounded-sm lg:rounded-xl overflow-hidden cursor-pointer group hover:border-primary/50 transition-colors"
              >
                {/* Default Image View */}
                <BackendImage showShine src={card.image}
                  alt={card.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${activeCardId === card._id ? 'scale-105' : 'group-hover:scale-105'}`}
                 />

                {/* Information Overlay */}
                <div
                  className={`absolute inset-0 bg-black/60 backdrop-blur-[3px] p-2 lg:p-3 sm:p-4 flex flex-col justify-between transition-opacity duration-300 ${activeCardId === card._id ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                >
                  <div>
                    <h3 className="text-white font-orbitron font-bold text-xs sm:text-sm leading-tight mb-1 line-clamp-1">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-yellow-400 mb-2">
                      <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                      <span>{card.category === "Low" && '1.0'}</span>
                      <span>{card.category === "Medium" && '2.0'}</span>
                      <span>{card.category === "High" && '3.0'}</span>
                      <span>{card.category === "Big-Time" && '4.0'}</span>
                      <span>{card.category === "Common" && '5.0'}</span>
                      <span>{card.category === "Uncommon" && '6.0'}</span>
                      <span>{card.category === "Rare" && '7.0'}</span>
                      <span>{card.category === "Epic" && '8.0'}</span>
                      <span>{card.category === "Legendary" && '9.0'}</span>
                      <span>{card.category === "Mythic" && '10.0'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {card.sellerAvatar ? (
                        <BackendImage showShine src={card.sellerAvatar} alt="seller" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-gray-700"  />
                      ) : (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                          <span className="text-[8px] text-gray-400">S</span>
                        </div>
                      )}
                      <span className="text-[9px] sm:text-xs text-gray-300 line-clamp-1 font-medium">
                        {card.sellerName || "EmptyBD Asset"}
                      </span>
                    </div>
                  </div>

                  <div>
                    {/* <p className="text-[8px] sm:text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Price</p> */}
                    <div className="text-[11px] sm:text-sm font-mono font-bold leading-none">
                      Price: <span className="text-green-400"> {card.currentPrice}</span> ৳
                    </div>
                    <div className="mt-3 text-[8px] sm:text-[9px] text-gray-300 px-2 py-1 rounded text-center font-normal uppercase tracking-wider">
                      Tap to Buy
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredCards.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center py-24 px-6 text-center bg-gray-950/60 border border-gray-900 rounded-3xl backdrop-blur-md mt-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="w-24 h-24 mb-6 rounded-full bg-gray-900 flex items-center justify-center border border-gray-800 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative">
              <Coins className="text-gray-500 text-4xl group-hover:text-emerald-400 group-hover:-translate-y-2 transition-all duration-500" />
            </div>
            
            <h3 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre text-white mb-2">No Collectibles Found</h3>
            <p className="text-gray-400 font-parkinsans text-sm lg:text-base max-w-md mx-auto leading-relaxed">
              We couldn't find any digital assets matching your criteria. Try adjusting your filters or search query to discover rare items!
            </p>
          </div>
        )}

      </div>
      
      <PageHelpPanel pageKey="exchange" />
    </div>
  );
}

