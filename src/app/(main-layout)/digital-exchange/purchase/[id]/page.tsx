"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { socket } from "@/lib/socket";

export default function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [resalePrice, setResalePrice] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const assetRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards/${unwrappedParams.id}`);

        if (assetRes.ok) {
          const data = await assetRes.json();
          setAsset(data.asset);
        }
      } catch (err) {
        toast.error("Error loading purchase details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    // Listen for real-time purchase updates
    const handleAssetPurchased = (data: { assetId: string }) => {
      if (data.assetId === unwrappedParams.id) {
        setAsset((prev: any) => prev ? { ...prev, isListed: false } : prev);
      }
    };

    socket.on("asset_purchased", handleAssetPurchased);
    return () => {
      socket.off("asset_purchased", handleAssetPurchased);
    };
  }, [unwrappedParams.id, router]);

  const handlePurchase = async () => {
    if (!hasEnoughFunds) {
      toast.error("Insufficient balance. Please make a deposit to continue.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
      return;
    }

    const token = localStorage.getItem("auth_token");
    setIsPurchasing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          assetId: asset._id,
          resalePrice: resalePrice || asset.currentPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Purchase Successful!");
        router.push("/profile/collection");
      } else {
        toast.error(data.message || "Purchase failed");
      }
    } catch (err) {
      toast.error("Transaction Error");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary"><Loader2 className="animate-spin w-8 h-8" /></div>;
  if (!asset) return <div className="min-h-screen flex items-center justify-center text-red-500">Asset not found</div>;

  const isOwner = user?.id === asset.sellerId || user?.id === asset.currentOwner;

  if (isOwner) {
    return (
      <div className="min-h-screen font-parkinsans flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">You Own This Asset</h2>
          <p className="text-gray-400 mb-6">You cannot purchase an item that is already in your private collection.</p>
          <Link prefetch={false} href="/profile/collection" className="block w-full bg-primary text-black font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors">
            Manage in My Collection
          </Link>
          <Link prefetch={false} href={`/digital-exchange/${asset._id}`} className="block w-full text-gray-500 hover:text-white font-bold py-3 mt-2 transition-colors">
            Back to Details
          </Link>
        </div>
      </div>
    );
  }

  if (asset.isListed === false) {
    return (
      <div className="min-h-screen font-parkinsans flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2 font-orbitron">Asset Unavailable</h2>
          <p className="text-gray-400 mb-6">This card has already been sold to another buyer.</p>
          <Link prefetch={false} href="/digital-exchange" className="block w-full bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors">
            Back to Exchange
          </Link>
          <Link prefetch={false} href={`/digital-exchange/${asset._id}`} className="block w-full text-gray-500 hover:text-white font-bold py-3 mt-2 transition-colors">
            View Details
          </Link>
        </div>
      </div>
    );
  }

  const currentBalance = Number(user?.amount || 0);
  const hasEnoughFunds = currentBalance >= asset.currentPrice;

  return (
    <div className="min-h-screen font-parkinsans px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link prefetch={false} href={`/digital-exchange/${asset._id}`} className="text-sm lg:text-base inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft size={20} /> Back to Details
        </Link>

        <div className=" border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-800 flex items-center gap-4 bg-gray-900/50">
            <div className="bg-primary/20 p-3 rounded-full border border-primary/30">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold font-orbitron text-white">Confirm Purchase</h1>
              <p className="text-xs lg:text-sm text-gray-400">Review your transaction details carefully before proceeding.</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Asset Summary */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Asset Summary</h3>
              <div className="flex gap-4 items-center">
                <BackendImage showShine src={asset.image} alt={asset.title} className="w-20 h-20 rounded-xl object-cover border border-gray-700"  />
                <div>
                  <p className="font-bold text-white text-lg">{asset.title}</p>
                  <p className="text-sm text-gray-400 uppercase">{asset.category}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-800">
                <span className="text-gray-400">Purchase Price</span>
                <span className="font-mono text-xl text-green-400 font-bold">৳{asset.currentPrice}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Payment Details</h3>
              <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-gray-400"><Wallet size={16}/> Available Balance</span>
                  <span className="font-mono text-lg text-white">৳{currentBalance}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                  <span className="text-gray-400">Remaining After</span>
                  <span className={`font-mono text-lg ${hasEnoughFunds ? 'text-green-400' : 'text-red-500'}`}>
                    ৳{(currentBalance - asset.currentPrice).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Resale Price Control */}
              <div className="space-y-2 mt-6">
                <label className="text-sm text-gray-400">Set Initial Resale Price (Optional)</label>
                {asset.pricingAccess === "bothAccess" ? (
                  <input 
                    type="number" 
                    placeholder={asset.currentPrice.toString()}
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  />
                ) : (
                  <div className="bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 text-sm">
                    Only Admin can access this asset's price. You can request a price change later.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-gray-800 bg-gray-900/50">
            {!hasEnoughFunds ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3 mb-4">
                <AlertTriangle className="text-red-500 w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-bold">Insufficient Funds</p>
                  <p className="text-red-400/80 text-sm">You need ৳{asset.currentPrice - currentBalance} more to complete this purchase.</p>
                  {/* <Link prefetch={false} href="/transaction/diposit" className="text-white underline text-sm mt-2 inline-block hover:text-primary">Deposit Funds</Link> */}
                </div>
              </div>
            ) : null}

            <button 
              onClick={handlePurchase}
              disabled={isPurchasing}
              className={`block w-full bg-black text-black text-white text-center text-sm lg:text-lg font-bold py-2 lg:py-4 rounded-sm lg:rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]`}
            >
              {isPurchasing ? <Loader2 className="animate-spin w-6 h-6 mx-auto" /> : "Confirm Transaction"}
            </button>
            <p className="text-center text-gray-500 text-xs mt-4">
              By confirming, you agree to the Digital Exchange terms and conditions. This transaction is immutable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
