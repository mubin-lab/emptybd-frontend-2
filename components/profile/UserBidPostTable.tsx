/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";
import Countdown from "../short-component/Countdown";
import Empty from "../NotFound.tsx/Empty";
import { SpinnerCustom } from "../loading/Spinner";

interface Bid {
  end_bid_time: string;
  _id: string;
  seller: {
    seller_id: string;
    email: string;
    seller_img?: string;
  };
  product: {
    title: string;
    media_url: string;
    base_price: number;
    description: string;
  };
  bidding_price: number;
  user_bidded: Bidder[];
}

interface Bidder {
  bidder_name: string | null;
  bidder_email: string;
  bidd_price: number;
}

export default function UserBidPostTable({ email }: { email: string }) {
  const [bid, setBid] = useState<Bid[]>([]);

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    const getBidsByEmail = async (email: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/by-email/${email}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.json();
    };

    const fetchBid = async () => {
      const data = await getBidsByEmail(email);
      setBid(data);
      setLoading(false);
    };

    fetchBid();
  }, [email, token]);
  console.log(bid, email);

  if (loading) return <SpinnerCustom />;
  if (bid.length === 0) return <Empty description="Ohh! No Data availabe for you."/>;
  return (
    <div className="flex items-center flex-col">
      {bid.reverse().map((item: any, idx: React.Key | null | undefined) => (
        <Link
          href={`/bid/all-selling-product/${item._id}`}
          className="bg-black/30 py-2 px-2 my-1 rounded-md w-full flex items-center gap-3"
          key={idx}
        >
          {item.product.media_type === "image" ? (
            <img
              src={item.product.media_url}
              alt={item.product.title}
              className="w-[62px] h-[40px] border rounded-sm"
            />
          ) : (
            <video
              src={item.product.media_url}
              autoPlay
              loop
              muted
              playsInline
              className="w-[62px] h-[40px] border rounded-sm"
            >
              <source src={item.product.media_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          <div className="w-[48%]">
            <h5 className="text-sm lg:text-xl font-medium font-parkinsans line-clamp-1">
              {item.product.title}
            </h5>
            <p className="text-xs lg:text-sm font-medium font-parkinsans text-gray-400 items-center">
              Total bided user: {item.user_bidded.length}
            </p>
          </div>
          <div>
            <p className="text-base lg:text-xl font-medium font-averia-gruesa-libre">
              <span className="font-orbitron">৳</span> {item.bidding_price}
            </p>
            <Countdown
              endTime={item.end_bid_time}
              className="text-green-400 text-xs lg:text-sm font-medium"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
