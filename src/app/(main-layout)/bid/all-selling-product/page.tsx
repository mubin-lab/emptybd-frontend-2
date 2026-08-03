"use client";
import BackendImage from "@/components/shared/BackendImage";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import Countdown from "@/components/short-component/Countdown";
import { BidStatus } from "@/components/short-component/BidStatus";
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
import { useAuthStore } from "@/lib/store/authStore";
import { io, Socket } from "socket.io-client";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { FaGavel } from "react-icons/fa";
import { BiCloudUpload } from "react-icons/bi";
import { BsDoorOpenFill } from "react-icons/bs";
import { toast } from "sonner";
import AdsCard, { AdType } from "@/components/shared/AdsCard";
import React from "react";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { useTracking } from "@/lib/hooks/useTracking";


const SOCKET_URL = `${process.env.NEXT_PUBLIC_NODE_API_URL}`;

// Single socket instance
const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface BidForAll {
  _id: string;
  product: {
    image_url: string | Blob | undefined;
    title: string;
    media_url: string;
    media_type: string;
    base_price: number;
  };
  bidding_price: number;
  start_bid: number;
  end_bid_time: string;
  user_bidded: Array<{
    bidder_name: string;
    bidder_email: string;
    bidder_img: string;
    bidd_price: number;
    bidd_time: string | Date;
  }>;
  seller?: {
    seller_plan: string;
    seller_id: string;
    seller_img: string;
    seller_name: string;
    seller_email: string;
  };
}

export default function BidListPage() {
  const [bids, setBids] = useState<BidForAll[]>([]);
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUser } = useAuthStore();
  const { trackFeatureVisit } = useTracking();

  useEffect(() => {
    trackFeatureVisit("bid_page");
  }, [trackFeatureVisit]);

  // Fetch all bids
  useEffect(() => {
    const fetchBids = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid`);
        if (!res.ok) throw new Error("Failed to fetch bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error("Bids fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, []);

  // Fetch Ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/active?page=bids`);
        if (res.ok) setAds(await res.json());
      } catch (err) {
        console.error("Ads fetch error:", err);
      }
    };
    fetchAds();
  }, []);

  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Socket: connection + global real-time listener
  useEffect(() => {
    // Connection debug
    socket.on("connect", () => {
      console.log("Socket connected to backend:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // Real-time bid update listener (global)
    socket.on("bid_updated", (updatedBid: BidForAll) => {
      console.log(
        "REAL-TIME BID UPDATE RECEIVED:",
        updatedBid._id,
        updatedBid.bidding_price,
      );

      setBids((prev) =>
        prev.map((b) =>
          b._id === updatedBid._id
            ? {
                ...b,
                bidding_price: updatedBid.bidding_price,
                user_bidded: updatedBid.user_bidded || b.user_bidded,
              }
            : b,
        ),
      );
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("bid_updated");
    };
  }, []);

  useEffect(() => {
    if (bids.length > 0) {
      bids.forEach((bid) => {
        socket.emit("joinBidRoom", bid._id);
        console.log("Joined room for real-time:", bid._id);
      });
    }
  }, [bids]);

  if (loading) {
    return <SpinnerCustom />;
  }

  return (
    <div className="max-w-[1440px] w-11/12 mx-auto py-8 space-y-8">
      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6 sm:p-8 lg:p-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-secondary text-sm font-semibold uppercase tracking-wider">
            <FaGavel className="animate-pulse" />
            <span>Live Action</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-averia-gruesa-libre tracking-tight text-white bg-clip-text">
            Live Auction Market
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl font-parkinsans">
            Bid on premium products in real-time. Join ongoing auctions or create your own listing to start selling.
          </p>
        </div>

        <div className="relative z-10 flex-shrink-0">
          {user ? (
            user.bid_account === "seller" ? (
              <Link prefetch={false}
                href="/bid/create-bid"
                className="inline-flex items-center justify-center gap-2 bg-black text-white font-parkinsans font-semibold py-3 px-6 rounded-sm lg:rounded-md transition-all duration-300 hover:scale-[1.02]"
              >
                <BiCloudUpload size={20} />
                Create New Bid
              </Link>
            ) : (
              <Link prefetch={false}
                href="/bid/bid-seller-request"
                className="inline-flex items-center justify-center gap-2 bg-black text-white font-parkinsans font-semibold py-3 px-6 rounded-sm lg:rounded-md transition-all duration-300 hover:scale-[1.02]"
              >
                <BiCloudUpload size={20} />
                Create New Bid
              </Link>
            )
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 bg-black text-white font-parkinsans font-semibold py-3 px-6 rounded-sm lg:rounded-md transition-all duration-300 hover:scale-[1.02]">
                  <BiCloudUpload size={20} />
                  Create New Bid
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm p-6 bg-black/90 border border-white/10 backdrop-blur-xl rounded-3xl">
                <DialogHeader className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                    <BsDoorOpenFill className="text-secondary" size={24} />
                  </div>
                  <DialogTitle className="text-lg lg:text-xl font-averia-gruesa-libre text-white">
                    Sign In Required
                  </DialogTitle>
                  <p className="text-gray-400 text-sm text-center font-parkinsans mt-1">
                    You must be logged in to create a new bid listing.
                  </p>
                </DialogHeader>
                <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
                  <DialogClose asChild>
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-xl font-parkinsans">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button className="bg-black hover:opacity-90 text-white rounded-sm lg:rounded-md font-parkinsans">
                    <Link prefetch={false} href="/login" className="w-full h-full flex items-center justify-center">Login</Link>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Bid Cards Grid */}
      {bids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/20 border border-white/5 rounded-3xl">
          <FaGavel className="text-gray-600 text-5xl mb-4 animate-bounce" />
          <h3 className="text-xl font-semibold font-averia-gruesa-libre text-white">No Live Auctions</h3>
          <p className="text-gray-500 font-parkinsans mt-1">Check back later or start your own auction!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid, index) => {
            const matchingAds = ads.filter(ad => (index + 1) === ad.insertionPosition);
            const adToDisplay = matchingAds.length > 0 ? matchingAds[0] : null;

            return (
              <React.Fragment key={bid._id}>
                <BidCard bid={bid} user={user} fetchUser={fetchUser} />
                {adToDisplay && (
                  <div className="col-span-1 flex items-center justify-center">
                    <AdsCard ad={adToDisplay} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <PageHelpPanel pageKey="bid" />
    </div>
  );
}

// Bid Card + Dialog
function BidCard({
  bid,
  user,
  fetchUser,
}: {
  bid: BidForAll;
  user: any;
  fetchUser: any;
}) {
  // Room join (per card)
  useEffect(() => {
    socket.emit("joinBidRoom", bid._id);
    console.log("Card joined room:", bid._id);

    return () => {
      socket.emit("leaveBidRoom", bid._id);
      console.log("Left room:", bid._id);
    };
  }, [bid._id]);

  const mediaUrl = bid.product.media_type ? bid.product.media_url : bid.product.image_url;

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 hover:border-secondary/20 transition-all duration-300 group hover:shadow-[0_0_30px_rgba(236,72,153,0.15)] hover:scale-[1.01] h-full">
      {/* Media Aspect Ratio Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-black/30 flex-shrink-0">
        {bid.product.media_type === "video" ? (
          <video
            src={mediaUrl as string}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          >
            <source src={mediaUrl as string} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : mediaUrl ? (
          <BackendImage
            src={mediaUrl as string}
            alt={bid.product.title || "Product image"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
           />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-parkinsans">
            No media available
          </div>
        )}

        {/* Absolute floating overlays */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <BidStatus endTime={bid?.end_bid_time || ""} />
        </div>

        {/* Gradient Bottom Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Card Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <h2 className="text-xl font-bold font-averia-gruesa-libre line-clamp-2 text-white group-hover:text-secondary transition-colors duration-300">
            {bid.product.title}
          </h2>

          {/* Seller / Creator */}
          {bid.seller && (
            <div className="flex items-center gap-2">
              <Link prefetch={false}
                href={`/user/${bid.seller.seller_email}`}
                className="flex items-center gap-2 hover:opacity-90 group/seller cursor-pointer w-fit"
              >
                <BackendImage
                  src={bid.seller.seller_img}
                  alt={bid.seller?.seller_name}
                  className="w-8 h-8 rounded-full ring-2 ring-white/10 group-hover/seller:ring-secondary/50 transition-all duration-300 object-cover"
                 />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-300 group-hover/seller:text-secondary transition-colors duration-200">
                      {bid.seller?.seller_name}
                    </span>
                    {bid.seller?.seller_plan === "premium" && (
                      <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 p-0.5 rounded-full ring-1 ring-blue-500/30" title="Premium Seller">
                        <svg width="10" height="10" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6.5" cy="6.5" r="6.2" fill="#3b82f6" />
                          <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    {bid.seller?.seller_plan === "owner" && (
                      <span className="inline-flex items-center justify-center bg-yellow-500/10 text-yellow-400 p-0.5 rounded-full ring-1 ring-yellow-500/30" title="Owner Seller">
                        <svg width="10" height="10" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="6.5" cy="6.5" r="6.2" fill="#eab308" />
                          <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-parkinsans">Seller</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Pricing Dashboard */}
        <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-2xl bg-white/5 border border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-parkinsans">Base Bid</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-orbitron text-xs text-gray-400">৳</span>
              <span className="font-orbitron font-semibold text-gray-200 text-sm">{bid.start_bid?.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex flex-col border-l border-white/10 pl-4">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-parkinsans">Current Bid</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="font-orbitron text-xs text-green-400">৳</span>
              <span className="font-orbitron font-bold text-green-400 text-base">{bid.bidding_price?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bid Status Tracker & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-gray-400 font-parkinsans">
                {bid.user_bidded?.at(-1)?.bidder_name ? (
                  <>
                    Last bid: <span className="text-gray-300 font-medium">{user?.name === bid.user_bidded?.at(-1)?.bidder_name ? "You" : bid.user_bidded?.at(-1)?.bidder_name}</span>
                  </>
                ) : (
                  "No bids yet"
                )}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 font-orbitron">
              <Countdown
                endTime={bid.end_bid_time}
                className="text-green-400 text-xs font-semibold tracking-wider"
              />
            </div>
          </div>

          <BidDetailDialog bid={bid} user={user} fetchUser={fetchUser} />
        </div>
      </div>
    </div>
  );
}

// Dialog Component
function BidDetailDialog({
  bid,
  user,
  fetchUser,
}: {
  bid: BidForAll;
  user: any;
  fetchUser: any;
}) {
  const [price, setPrice] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const userLastBid = bid.user_bidded
    ?.filter((b: any) => b.bidder_id === user?._id || b.bidder_email === user?.email)
    ?.sort(
      (a: any, b: any) =>
        new Date(b.bidd_time).getTime() - new Date(a.bidd_time).getTime(),
    )[0];

  const lastBidAmount = userLastBid ? Number(userLastBid.bidd_price) : 0;

  const handlePlaceBid = async () => {
    if (!user) {
      setErrorMsg("Please login first");
      return;
    }

    const newBidAmount = Number(price);

    if (newBidAmount <= bid.bidding_price) {
      setErrorMsg(`Bid must be higher than ৳${bid.bidding_price}`);
      return;
    }

    // 🔹 Find user's last bid on this product
    const previousBid = bid.user_bidded
      ?.filter((b: any) => b.bidder_id === user._id || b.bidder_email === user.email)
      ?.sort(
        (a: any, b: any) =>
          new Date(b.bidd_time).getTime() - new Date(a.bidd_time).getTime(),
      )[0];

    const lastBidAmount = previousBid ? Number(previousBid.bidd_price) : 0;

    // 🔥 Only extra amount needed
    const requiredAmount = newBidAmount - lastBidAmount;

    if (requiredAmount <= 0) {
      setErrorMsg("Invalid bid amount");
      return;
    }

    const userBalance = Number(user.amount || 0);

    // 🔥 Difference balance check
    if (userBalance < requiredAmount) {
      setErrorMsg(
        `You don't have enough balance! You need ৳${requiredAmount}, but only ৳${userBalance} is available.`,
      );
      toast.error(`Insufficient balance! Need ৳${requiredAmount}`, {
        position: "top-right",
      });
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/update/${bid._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({
            bidding_price: newBidAmount,
          }),
        },
      );

      if (res.ok) {
        await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/users/my-bid`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
            body: JSON.stringify({
              userId: user._id,
              bidId: bid._id,
            }),
          },
        );
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Bid failed");
      }

      setPrice(0);
      toast.success(
        `🎉 Nice! You increased your bid by ৳${requiredAmount}. Your total bid is now ৳${newBidAmount}.`,
        { position: "top-right" },
      );
      fetchUser();
    } catch (err: any) {
      console.error("Bid placement error:", err);
      setErrorMsg(err.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const mediaUrl = bid.product.media_type ? bid.product.media_url : bid.product.image_url;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="px-6 py-2 bg-black hover:opacity-90 text-white rounded-sm lg:rounded-md font-parkinsans font-semibold border-0 cursor-pointer transition-all duration-300">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg lg:max-w-2xl bg-[#0d0d12]/95 border border-white/10 backdrop-blur-2xl rounded-3xl lg:p-6 text-white max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <DialogHeader>
          <DialogTitle className="text-xl lg:text-3xl font-bold font-averia-gruesa-libre text-white mt-1">
            {bid.product?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 lg:space-y-6">
          {/* Media Player Container */}
          <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-black/40 border border-white/5">
            {bid.product.media_type === "video" ? (
              <video
                src={mediaUrl as string}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src={mediaUrl as string} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : mediaUrl ? (
              <BackendImage
                src={mediaUrl as string}
                alt={bid.product.title || "Product image"}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
               />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                No media available
              </div>
            )}

            {/* Glowing top overlay for Live status */}
            <div className="absolute top-3 right-3 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <BidStatus endTime={bid?.end_bid_time || ""} />
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Seller / Pricing Dashboard */}
          <div className="flex items-center justify-between gap-2 p-2 lg:p-5 rounded-4xl bg-white/5 border border-white/5">
            {bid.seller && (
              <div className="flex items-center gap-3">
                <Link prefetch={false}
                  href={`/user/${bid.seller.seller_email}`}
                  className="flex items-center gap-3 hover:opacity-90 group/seller cursor-pointer"
                >
                  <BackendImage
                    src={bid.seller.seller_img}
                    alt={bid.seller?.seller_name}
                    className="w-10 h-10 rounded-full ring-2 ring-white/10 group-hover/seller:ring-secondary/50 transition-all duration-300 object-cover"
                   />
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="text-base font-semibold text-gray-200 group-hover/seller:text-secondary transition-colors duration-200 line-clamp-1">
                        {bid.seller?.seller_name} 
                      </span>
                      {bid.seller?.seller_plan === "premium" && (
                        <span className="inline-flex items-center justify-center bg-blue-500/10 text-blue-400 p-0.5 rounded-full ring-1 ring-blue-500/30" title="Premium Seller">
                          <svg width="10" height="10" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.5" cy="6.5" r="6.2" fill="#3b82f6" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                      {bid.seller?.seller_plan === "owner" && (
                        <span className="inline-flex items-center justify-center bg-yellow-500/10 text-yellow-400 p-0.5 rounded-full ring-1 ring-yellow-500/30" title="Owner Seller">
                          <svg width="10" height="10" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="6.5" cy="6.5" r="6.2" fill="#eab308" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 font-parkinsans">Creator</span>
                  </div>
                </Link>
              </div>
            )}

            <div className="flex items-center lg:gap-6 divide-x divide-white/10">
              <div className="flex flex-col pr-1">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-parkinsans">Base price</span>
                <span className="font-orbitron font-semibold text-gray-300 text-xs lg:text-sm mt-0.5">৳{bid.start_bid?.toLocaleString()}</span>
              </div>
              <div className="flex flex-col pl-1 lg:pl-6">
                <span className="text-[8px] lg:text-[10px] text-gray-500 uppercase tracking-wider font-semibold font-parkinsans">Current Bid</span>
                <span className="font-orbitron font-bold text-green-400 text-xs lg:text-xl mt-0.5">৳{bid.bidding_price?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* User Specific Last Bid Stats */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            {user ? (
              <div className="text-xs sm:text-sm text-gray-400 font-parkinsans">
                Your last bid: <span className="font-orbitron text-green-400 font-semibold">৳ {lastBidAmount.toLocaleString()}</span>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-gray-500 font-parkinsans">
                You are not logged in.
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-400 font-parkinsans">Time remaining:</span>
              <Countdown
                className="text-green-400 text-xs sm:text-sm font-semibold font-orbitron tracking-wide"
                endTime={bid.end_bid_time}
                onEnd={() => setIsEnded(true)}
              />
            </div>
          </div>

          {/* Bidding Actions */}
          {isEnded ? (
            <div className="py-1 text-center text-red-500 font-bold text-md lg:text-lg bg-red-500/10 border border-red-500/20 rounded-lg font-averia-gruesa-libre animate-pulse">
              This Auction Has Ended
            </div>
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm text-center font-parkinsans">
                  {errorMsg}{" "}
                  {errorMsg === "Please login first" && (
                    <Link prefetch={false} className="text-secondary underline hover:opacity-85" href="/login">
                      Login now
                    </Link>
                  )}
                </div>
              )}

              <div className="relative">
                <Input
                  ref={inputRef}
                  type="number"
                  min={bid.bidding_price + 1}
                  step="1"
                  placeholder={`Enter more than ৳${bid.bidding_price}`}
                  className="w-full bg-white/5 border-white/10 text-white rounded-xl py-3 px-4 focus:ring-secondary/50 focus:border-secondary/50 placeholder-gray-600 font-orbitron"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={submitting}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }, 300);
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-orbitron text-gray-500 text-sm">BDT</span>
              </div>

              <p className="text-[11px] text-center text-gray-500 font-parkinsans">
                To place a bid, you must have at least{" "}
                <span className="font-orbitron text-gray-400 font-medium">
                  ৳ {(Number(bid.bidding_price || 0) - Number(lastBidAmount || 0) + 1).toLocaleString()}
                </span>{" "}
                available in your account.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  onClick={handlePlaceBid}
                  disabled={submitting || price <= bid.bidding_price || !price}
                  className={`w-full py-3 transition-all duration-300 font-parkinsans font-semibold ${
                    submitting || price <= bid.bidding_price || !price
                      ? "bg-gray-800 text-gray-500 rounded-xl border border-white/5 cursor-not-allowed"
                      : "bg-black text-white rounded-sm lg:rounded-md hover:opacity-90"
                  }`}
                >
                  {submitting ? "Placing bid..." : "Place Bid"}
                </Button>

                <DialogClose asChild>
                  <Button variant="outline" className="w-full py-3 border-white/10 text-white hover:bg-white/5 rounded-xl font-parkinsans">
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </div>
          )}

          {/* Recent Bid History */}
          {bid.user_bidded?.length > 0 ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300 font-parkinsans">
                  Recent Bid Placements
                </h3>
                {bid.user_bidded.length > 4 && (
                  <Link prefetch={false}
                    href={`/bid/all-selling-product/${bid._id}`}
                    className="text-xs text-secondary hover:underline"
                  >
                    View All {bid.user_bidded.length} Bids
                  </Link>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <table className="min-w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-white/10 text-gray-400 font-parkinsans font-semibold">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Bidder
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-parkinsans">
                    {[...bid.user_bidded]
                      .reverse()
                      .slice(0, 2)
                      .map((entry, index) => (
                        <tr
                          key={index}
                          className="hover:bg-white/5 transition-colors duration-150"
                        >
                          <td className="px-4 py-2.5 font-medium flex items-center gap-2">
                            <BackendImage
                              src={entry?.bidder_img}
                              alt={entry?.bidder_name}
                              className="rounded-full h-6 w-6 border border-white/10 object-cover"
                             />
                            <span className="truncate">
                              {user?.name === entry.bidder_name
                                ? "You"
                                : `${entry.bidder_name}`}
                            </span>
                            {index === 0 && (
                              <span
                                className="text-yellow-400 text-sm"
                                title="Highest / Latest Bid"
                              >
                                👑
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium text-green-400 font-orbitron">
                            ৳ {Number(entry.bidd_price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-sm font-semibold text-gray-500 bg-white/5 border border-white/5 rounded-2xl font-parkinsans">
              No bids placed yet
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Link prefetch={false}
              href={`/bid/all-selling-product/${bid._id}`}
              className="inline-flex items-center gap-1 text-secondary text-xs sm:text-sm font-semibold font-parkinsans hover:underline"
            >
              Full Details
              <span className="text-sm" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

