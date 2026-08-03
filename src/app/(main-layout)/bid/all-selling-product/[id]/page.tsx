/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

import Countdown from "@/components/short-component/Countdown";
import { useAuthStore } from "@/lib/store/authStore";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SpinnerCustom } from "@/components/loading/Spinner";
import axios from "axios";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import ReportModal from "@/components/shared/ReportModal";
import { ShieldCheck } from "lucide-react";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:4000";

const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

type BidUser = {
  bidder_name: string;
  bidder_email: string;
  bidder_id?: string;
  bidder_img?: string;
  bidd_price: number | string;
  bidd_time: string | Date;
};
type Bid = {
  winner: any;
  status: string;
  _id: string;
  product: {
    _id: unknown;
    image_url?: string;
    title: string;
    description: string;
    media_url?: string;
    media_type: "image" | "video" | string;
  };
  seller?: {
    selling_status: string;
    seller_plan: string;
    seller_name: string;
    seller_img?: string;
    email?: string;
    isVerified?: boolean;
  };
  start_bid: number;
  bidding_price: number;
  end_bid_time: string;
  user_bidded: BidUser[];
};

export default function BidDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const { user, fetchUser } = useAuthStore();

  const handleChatWithSeller = async () => {
    if (!user) {
      toast.error("Please login to chat with the seller", { position: "top-right" });
      return;
    }
    if (!bid?.seller?.email) {
      toast.error("Seller email not found");
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientEmail: bid.seller.email })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/messages?conversationId=${data._id}`);
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to start chat session", { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to chat service");
    }
  };


  const [bid, setBid] = useState<Bid | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const fetchBookmarkStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookmarkStatus();
  }, [id, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark auctions", { position: "top-right" });
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id, itemType: "bid" })
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasFetched = useRef(false);
 

const handleFinalizeSuccess = (data: any) => {
  console.log("Finalized:", data);
  alert("Winner selected!");
};
// ...existing code...


  // Fetch user once on mount if missing
  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  // Fetch auction data
  useEffect(() => {
    if (!id || hasFetched.current) return;
    hasFetched.current = true;

    const fetchBid = async () => { 
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/${id}`,
        );
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setBid(data); 
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load auction");
      } finally {
        setLoading(false);
      }
    };

    fetchBid();
  }, [id]);

  // Socket connection
  useEffect(() => {
    if (!id) return;

    socket.emit("joinBidRoom", id);

    socket.on("bid_updated", (updatedBid: Bid) => {
      if (updatedBid?._id.toString() === id) {
        setBid(updatedBid);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err.message);
      toast.error("Real-time updates unavailable");
    });

    return () => {
      socket.emit("leaveBidRoom", id);
      socket.off("bid_updated");
      socket.off("connect_error");
    };
  }, [id]);

  // ────────────────────────────────────────────────
  //  Computed values — only recalculate when needed
  // ────────────────────────────────────────────────

  const userLastBid = bid?.user_bidded
    ?.filter((b) => b.bidder_id === user?._id)
    ?.sort(
      (a, b) =>
        new Date(b.bidd_time).getTime() - new Date(a.bidd_time).getTime(),
    )[0];

  const lastBidAmount = userLastBid ? Number(userLastBid.bidd_price) : 0;
  const currentPrice = bid?.bidding_price ?? 0;
  const minNextBid = currentPrice + 1;
  const neededForNextBid = minNextBid - lastBidAmount;

  const handlePlaceBid = async () => {
    if (!user) {
      setErrorMsg("Please login first");
      return;
    }

    const newBidAmount = Number(price);

    const requiredAmount = newBidAmount - lastBidAmount;

    if (requiredAmount <= 0) {
      setErrorMsg("Invalid bid amount");
      return;
    }

    if (newBidAmount < minNextBid) {
      setErrorMsg(`Bid must be at least ৳${minNextBid}`);
      return;
    }

    const extraNeeded = newBidAmount - lastBidAmount;

    if (extraNeeded <= 0) {
      setErrorMsg("Bid amount is not higher than your previous bid");
      return;
    }

    const balance = Number(user.amount || 0);

    if (balance < extraNeeded) {
      setErrorMsg(
        `You don't have enough balance! You need ৳${requiredAmount}, but only ৳${balance} is available.`,
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
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/update/${bid?._id}`,
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
              bidId: bid?._id,
            }),
          },
        );
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Bid update failed");
      }

      setPrice(0);
      toast.success(
        `🎉 Nice! You increased your bid by ৳ ${requiredAmount}. Your total bid is now ৳ ${newBidAmount}.`,
        {
          position: "top-right",
        },
      );

      fetchUser(); // refresh balance
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to place bid");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <SpinnerCustom />;
  if (errorMsg && !bid)
    return <div className="p-8 text-red-600 text-center">{errorMsg}</div>;
  if (!bid)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Auction not found
      </div>
    );

  return (
    <div className="w-11/12 max-w-2xl mx-auto pb-10">
      {bid.product.media_type && (
        <div className="relative w-full aspect-5/3 overflow-hidden -mt-2">
          {bid.product.media_type === "image" ? (
            // Image case
            <BackendImage
              src={bid.product.media_url}
              alt={bid.product.title}
              className="absolute inset-0 h-full mx-auto"
             />
          ) : bid.product.media_type === "video" ? (
            // Video case
            <video
              src={bid.product.media_url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full mx-auto rounded-xl"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No media available
            </div>
          )}

          <div className="absolute top-[3%] right-[2%] z-10">
            <BidStatus endTime={bid?.end_bid_time || ""} />
          </div>
        </div>
      )}

      {!bid.product.media_type && (
        <div className="relative w-full aspect-5/3 overflow-hidden -mt-2">
          <BackendImage
            src={bid.product.image_url}
            alt={bid.product.title}
            className="absolute inset-0 h-full mx-auto"
           />

          <div className="absolute top-[3%] right-[2%] z-10">
            <BidStatus endTime={bid?.end_bid_time || ""} />
          </div>
        </div>
      )}

      {/* Current price + countdown + your bid */}
      <div className="mt-1 flex items-end justify-between">
        <div>
          {user ? (
            <p className="text-xs lg:text-sm text-gray-300">
              Your last bid:{" "}
              <span className="text-green-400 font-medium">
                <span className="font-orbitron">৳</span>{" "}
                {lastBidAmount.toLocaleString()}
              </span>
            </p>
          ) : (
            <p className="text-xs lg:text-sm text-gray-500">Not logged in</p>
          )}
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold font-ob">
            <span className="font-orbitron">৳</span>{" "}
            {currentPrice.toLocaleString()}
          </p>
          <Countdown
            endTime={bid.end_bid_time}
            onEnd={() => setIsEnded(true)}
            className="text-lg font-medium text-green-400"
          />
        </div>
      </div>

      {isEnded ? (
        <>
        {bid?.winner ? (
          <div className="mt-6 text-center text-xl font-bold text-green-500">
            Winner: {bid.winner.bidder_name} with <span className="font-orbitron">৳</span>{bid.winner.winning_price}
          </div>
        ) : <div className="mt-6 text-center text-xl font-bold text-red-500">
          Auction Ended
        </div>}
        
        {(user?.email === bid?.seller?.email && bid?.status !== "completed") ? (
          <FinalizeBidButton bidId={bid?._id} token={`${localStorage.getItem("auth_token")}`} onSuccess={handleFinalizeSuccess} />
         ) :""} 
        </>
      ) : (
        <div className="mt-5 space-y-3">
          {errorMsg && (
            <p className="text-red-400 text-center text-[10px] lg:text-sm font-parkinsans">
              {errorMsg}
              {errorMsg.includes("login") && (
                <Link prefetch={false} href="/login" className="text-blue-400 underline ml-1.5">
                  Login
                </Link>
              )}
            </p>
          )}

          <Input
            type="number"
            min={minNextBid}
            step="1"
            placeholder={`Min bid: ৳${minNextBid}`}
            value={price || ""}
            onChange={(e) => setPrice(Number(e.target.value))}
            disabled={submitting || isEnded}
          />

          <p className="text-xs text-gray-500 text-center">
            You need at least{" "}
            <strong className="text-gray-300">
              <span className="font-orbitron">৳</span>{" "}
              {neededForNextBid.toLocaleString()}
            </strong>{" "}
            available balance to bid next.
          </p>

          <Button
            type="button"
            onClick={handlePlaceBid}
            disabled={submitting || price <= bid.bidding_price || !price}
            className={`w-full  rounded transition-colors ${
              submitting || price <= bid.bidding_price || !price
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-black hover:bg-gray-900 text-white"
            }`}
          >
            {submitting ? "Placing bid..." : "Place Bid"}
          </Button>
        </div>
      )}

      <div className="my-5">
        <div className="flex justify-between items-center gap-4">
          <label className="text-sm lg:text-base">Product Details:</label>
          <button
            onClick={handleToggleBookmark}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-gray-800 rounded-full cursor-pointer flex-shrink-0"
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Auction"}
          >
            {isBookmarked ? (
              <BsBookmarkFill size={18} className="text-amber-500" />
            ) : (
              <BsBookmark size={18} />
            )}
          </button>
        </div>
        <h2 className="text-lg lg:text-xl font-medium font-averia-gruesa-libre">
          {bid.product.title}
        </h2>
        <p className="text-xs lg:text-sm text-gray-400 font-hind mt-2">
          {bid.product.description}
        </p>
      </div>

      {/* Seller + base price */}
      {bid.seller && (
        <>
          <label className="text-sm lg:text-base">Selling By:</label>
          <Link prefetch={false} href={`/user/${bid.seller.email}`} className="flex items-center gap-3 text-white justify-between mt-2 hover:opacity-90 group cursor-pointer">
            <BackendImage
              src={bid.seller.seller_img}
              alt=""
              className="w-8 h-8 rounded-full border-2 border-white/40 group-hover:border-blue-500 transition-all duration-300"
             />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <p className="font-medium text-xs lg:text-sm group-hover:text-blue-400 transition-colors duration-200">
                  {bid.seller.seller_name}
                </p>
                {bid.seller.isVerified && (
                  <span title="Verified Seller">
                    <ShieldCheck className="text-emerald-500 w-4 h-4 ml-1" />
                  </span>
                )}
                {bid.seller?.seller_plan === "premium" && (
                  <svg
                    width="13"
                    height="13"
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
                {bid.seller?.seller_plan === "owner" && (
                  <svg
                    width="13"
                    height="13"
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
              </div>
              <div className="flex items-center gap-1">
                <p className="font-normal text-gray-500 text-xs lg:text-sm">
                  Seller rating: {bid.seller.selling_status}/5{" "}
                </p>
                <svg
                  width="20"
                  height="19"
                  viewBox="0 0 20 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 13.6562L5 16.625L6.25 11.2812L2.5 7.71875L7.5 7.125L10 2.375L12.5 7.125L17.5 7.71875L13.75 11.2812L15 16.625L10 13.6562Z"
                    fill="url(#paint0_linear_206_27486)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_206_27486"
                      x1="-5"
                      y1="9.5"
                      x2="9.23127"
                      y2="24.4803"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stop-color="#e95500" />
                      <stop offset="0.511423" stop-color="#ffbd31" />
                      <stop offset="1" stop-color="#e95500" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-1"></div>
          </Link>
          {user && user.email !== bid.seller.email && (
            <Button
              onClick={handleChatWithSeller}
              className="w-full mt-3 bg-black text-white font-semibold py-2 rounded-sm lg:rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 hover:bg-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat with Seller
            </Button>
          )}
        </>
      )}

      {/* Recent bids */}
      {bid.user_bidded?.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Recent Bids</h3>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-900/60">
                <tr>
                  <th className="px-4 py-3 text-left">Bidder</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[...bid.user_bidded]
                  .reverse() 
                  .map((entry, i) => (
                    <tr key={i} className="hover:bg-gray-900/40">
                      <td className="px-4 py-3 flex items-center gap-2">
                        <BackendImage
                          src={entry.bidder_img}
                          alt=""
                          className="w-6 h-6 rounded-full"
                         />
                        <span>
                          {entry.bidder_id === user?._id
                            ? "You"
                            : entry.bidder_name}
                        </span>
                        {i === 0 && <span className="text-yellow-400">👑</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-400">
                        <span className="font-orbitron">৳</span>{" "}
                        {Number(entry.bidd_price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// You can keep BidStatus component or inline it
function BidStatus({ endTime }: { endTime: string }) {
  // ... your existing countdown/status logic
  return null; // placeholder — implement as needed
}


 

const FinalizeBidButton = ({ bidId, token, onSuccess }: { bidId: string; token: string; onSuccess: (data: any) => void }) => {
  const [loading, setLoading] = useState(false);

  const handleFinalize = async () => {
    try {
      setLoading(true);
 
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/finalize-bid/${bidId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          } 
        },
      );

      alert("✅ Bid finalized successfully!");
      console.log(res);

      // parent কে notify
      if (onSuccess) onSuccess(res);

    } catch (err) {
      console.error(err);
      const errorMessage = (err as any).response?.data?.message || "Something went wrong";
      alert(errorMessage);
      console.log((err as any).response?.data?.message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFinalize}
      disabled={loading}
      className=" w-full mt-2"
    >
      {loading ? "Finalizing..." : "Finalize Bid"}
    </Button>
  );
};
 