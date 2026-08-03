/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/TandingBids.tsx
"use client";
import React from "react";
import { ChevronRight } from "lucide-react";

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
import { CardLoading } from "../loading/CardLoading";

interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imageUrl?: string;
}

interface HorizontalCardScrollProps {
  items: CardItem[];
  title?: string; // optional section title
}

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
    seller_id: string;
    seller_img: string;
    seller_name: string;
    seller_email: string;
  };
}

export default function BidListPage() {
  const [bids, setBids] = useState<BidForAll[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, fetchUser } = useAuthStore();

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

  // Auth check
  // useEffect(() => {
  //   if (!user) {
  //     fetchUser();
  //   }
  // }, [user, fetchUser]);

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
    return <CardLoading />;
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto rounded-md lg:mt-12">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-3 md:px-6 lg:px-8 ">
        <h2 className="text-xl md:text-3xl font-medium font-averia-gruesa-libre">
          Tanding Bidds
        </h2>
        <Link
          href="/bid/all-selling-product"
          className="text-xs lg:text-sm text-gray-400 underline "
        >
          See all
        </Link>
      </div>

      {/* Scrollable Container */}
      <div className="relative ">
        {/* Cards Wrapper - horizontal scroll */}
        <div
          className="
            flex overflow-x-auto gap-3 md:gap-6 pb-4 scrollbar-hide
            snap-x snap-mandatory 
          "
          style={{ scrollSnapType: "x mandatory" }}
        >
          {bids.map((bid) => (
            <BidCard key={bid._id} bid={bid} user={user} />
          ))}
          {/* Invisible last bid to give breathing space */}
          <div className="shrink-0 w-4 md:w-8 lg:w-12" aria-hidden="true" />
        </div>

        {/* Right Arrow Indicator (shows there's more to scroll) */}
        <div className="absolute right-2 top-1/2  -translate-y-1/2 pointer-events-none animate-pulse">
          <div className=" ">
            <ChevronRight className="h-5 w-5 text-gray-100 " />
          </div>
        </div>
      </div>
    </div>
  );
}

const BidCard = ({ bid, user }: { bid: BidForAll; user: any }) => {
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  useEffect(() => {
    socket.emit("joinBidRoom", bid._id);
    console.log("Card joined room:", bid._id);

    return () => {
      socket.emit("leaveBidRoom", bid._id);
      console.log("Left room:", bid._id);
    };
  }, [bid._id]);

  return (
    <Link
      href={`/bid/all-selling-product/${bid._id}`}
      key={bid._id}
      className="
                shrink-0 w-[44%] sm:w-[31%] md:w-[23%] lg:w-[18%] xl:w-[15%] 2xl:w-[12%]
                snap-start
                bg-black/40  rounded-sm shadow-md overflow-hidden
                transition-transform hover:scale-[1.02] duration-300 
              "
    >
      {/* Card Image (optional) */}
      <div className="relative w-full aspect-5/3 overflow-hidden rounded-t-lg bg-black/20">
        {bid.product.media_type ? <> {bid.product.media_type === "image" ? (
          // Image case
          <img
            src={bid.product.media_url}
            alt={bid.product.title || "Product image"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : bid.product.media_type === "video" ? (
          // Video case
          <video
            src={bid.product.media_url}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={bid.product.media_url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            No media available
          </div>
        )}</> : <img
          src={bid.product.image_url}
          alt={bid.product.title || "Product image"}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />}


        <div className="absolute top-[3%] right-[2%]">
          <BidStatus endTime={bid?.end_bid_time || ""} />
        </div>

        <p className="animate-pulse text-xl lg:text-base font-semibold text-end absolute bottom-[0%] left-[2%] z-10 font-averia-gruesa-libre">
          <span className="font-orbitron">৳</span> {bid.bidding_price}
        </p>

        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-2">
        <h3 className="text-sm lg:text-2xl line-clamp-1 font-normal mt-2 font-parkinsans">
          {bid.product.title} ..
        </h3>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-xs lg:text-sm text-gray-400 flex items-center">
                Bided:{" "}
                {[...bid.user_bidded]
                  .reverse()
                  .slice(0, 1)
                  .map((entry, index) => (
                    <img
                      key={index}
                      src={entry?.bidder_img}
                      alt={entry?.bidder_name}
                      className="rounded-full h-4 w-4 ml-2"
                    />
                  ))}
                <span className="font-normal ml-1 line-clamp-1 font-parkinsans text-xs lg:text-sm">
                  {bid.user_bidded?.at(-1)?.bidder_name}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end mt-2">
          <Countdown
            className="text-green-600"
            endTime={bid.end_bid_time}
            onEnd={() => setIsEnded(true)}
          />
        </div>
      </div>
    </Link>
  );
};
