/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { BiCloudUpload } from "react-icons/bi";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { BsDoorOpenFill } from "react-icons/bs";
import { toast } from "sonner";
import AdsCard, { AdType } from "@/components/shared/AdsCard";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  category: string;
  brand?: string;
  sku?: string;
  status?: string;
  create_date?: string;
  update_date?: string;
  owner?: {
    owner_id: string;
    owner_name: string;
    owner_email: string;
    owner_img?: string;
  };
  rating?: number;
  reviewsCount?: number;
};


export default function AllProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<AdType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const [seed] = useState(() => Math.floor(Math.random() * 1000000));

  const { user } = useAuthStore();
  const isFetchingRef = useRef(false);

  const fetchProducts = async (pageNumber: number) => {
    if (!hasMore || isFetchingRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      setError(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product?page=${pageNumber}&limit=25&seed=${seed}`
      );

      if (!res.ok) throw new Error("Failed to fetch products");

      const data: Product[] = await res.json();

      if (data.length < 25) {
        setHasMore(false);
      }

      if (data.length > 0) {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const newItems = data.filter((item) => !existingIds.has(item._id));
          
          if (newItems.length === 0 && data.length > 0) {
            setTimeout(() => setHasMore(false), 0);
          }
          
          return [...prev, ...newItems];
        });
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      toast.error("Failed to fetch products");
      setError(true);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Fetch Ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/active?page=ecommerce`);
        if (res.ok) setAds(await res.json());
      } catch (err) {
        console.error("Ads fetch error:", err);
      }
    };
    fetchAds();
  }, []);

  // Infinite scroll with scroll event
  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleScroll = () => {
      if (throttleTimeout) return;
      
      throttleTimeout = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 250
        ) {
          if (!loading && hasMore && !isFetchingRef.current && !error) {
            setPage((prev) => prev + 1);
          }
        }
        throttleTimeout = null;
      }, 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [loading, hasMore]);

  // Show loading only for first page
  if (allProducts.length === 0 && loading) {
    return (
      <div className="max-w-[1440px] w-[95%] mx-auto">
        <div className="columns-2 sm:columns-4 lg:columns-8 gap-2 lg:gap-4 mt-6 space-y-2 lg:space-y-4">
          {Array.from({ length: 16 }).map((_, index) => (
            <ProductSkeleton key={index} index={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto">
      {/* Product Cards Masonry Feed */}
      <div className="columns-2 sm:columns-4 lg:columns-8 gap-2 lg:gap-4 mt-6 space-y-2 lg:space-y-4">
        {allProducts.map((product, index) => {
          const matchingAds = ads.filter(ad => (index + 1) === ad.insertionPosition);
          const adToDisplay = matchingAds.length > 0 ? matchingAds[0] : null;

          return (
            <React.Fragment key={product._id}>
              <div className="break-inside-avoid">
                <ProductCard product={product} />
              </div>
              {adToDisplay && (
                <div className="break-inside-avoid my-4">
                  <AdsCard ad={adToDisplay} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {hasMore && !error && (
        <div className="flex justify-center py-6">
          <SpinnerCustom />
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <p className="text-red-400 font-parkinsans">Failed to load more products.</p>
          <Button 
            onClick={() => fetchProducts(page)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Retry
          </Button>
        </div>
      )}

      {/* {!hasMore && allProducts.length > 0 && user && (
        <Link
          href="/e-commerce-products/create"
          className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md w-fit mx-auto mt-6"
        >
          <BiCloudUpload />
          Post Product
        </Link>
      )} */}

      {!hasMore && allProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 font-parkinsans mb-4">No products available</p>
          {user ? (
            <Link
              href="/e-commerce-products/create"
              className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md w-fit mx-auto"
            >
              <BiCloudUpload />
              Post Product
            </Link>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <div className="text-[13px] lg:text-base text-white font-parkinsans flex items-center gap-2 bg-black p-2 rounded-md w-fit mx-auto cursor-pointer">
                  <BiCloudUpload />
                  Post Product
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm p-4">
                <DialogHeader>
                  <BsDoorOpenFill className="w-fit mx-auto" size={30} />
                  <DialogTitle className="text-base lg:text-lg">
                    Please login your account.
                  </DialogTitle>
                </DialogHeader>
                <DialogFooter className="grid grid-cols-2 gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button>
                    <Link href="/login">Login</Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}

const ProductSkeleton = ({ index }: { index: number }) => {
  // Masonry skeleton height classes
  const heights = ["aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-[2/3]"];
  const aspectClass = heights[index % heights.length];

  return (
    <div className="bg-gray-900/50 rounded-md lg:rounded-xl border border-gray-800/80 overflow-hidden animate-pulse break-inside-avoid">
      <div className={`${aspectClass} w-full bg-gray-800/40`} />
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="h-3.5 bg-gray-800/60 rounded w-1/2" />
        <div className="h-3.5 bg-gray-800/60 rounded w-1/4" />
      </div>
    </div>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  // Get first image from images array or fall back to single image
  const firstImage = product.images?.[0] || product.image;
  
  return (
    <div className="bg-gray-900 rounded-md lg:rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group break-inside-avoid border border-gray-800/30">
      <Link href={`/e-commerce-products/${product._id}`} className="block">
        <div className="relative overflow-hidden rounded-md lg:rounded-xl w-full bg-gray-950 flex items-center justify-center">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-auto object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full aspect-square bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          
          {/* Status Badge */}
          {product.status && (
            <span
              className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-medium backdrop-blur-sm ${
                product.status === "active"
                  ? "bg-green-500/90 text-white"
                  : "bg-red-500/90 text-white"
              }`}
            >
              {product.status}
            </span>
          )}
        </div>
        {/* Product Info Row - Name (left) + Price (right) */}
        <div className="p-3"> 
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs lg:text-sm font-medium font-parkinsans text-white truncate hover:text-blue-400 transition-colors flex-1">
              {product.name}
            </h3>
            <span className="text-xs lg:text-sm font-bold text-white font-orbitron whitespace-nowrap">
              {product.price?.toFixed(0)}৳
            </span>
          </div> 
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-400 font-medium font-orbitron">
              <span>★ {product.rating.toFixed(1)}</span>
              <span className="text-gray-500 font-normal">({product.reviewsCount || 0})</span>
            </div>
          )}
        </div>

      </Link>
    </div>
  );
};
