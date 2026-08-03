"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ShieldCheck, Activity, Users, ArrowLeft, History, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

export default function AssetDetails({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [asset, setAsset] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards/${unwrappedParams.id}`);
        const historyRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/ownership-history/${unwrappedParams.id}`);

        if (assetRes.ok) {
          const assetData = await assetRes.json();
          setAsset(assetData.asset);
        }
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData.history);
        }
      } catch (err) {
        toast.error("Failed to load asset details");
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
  }, [unwrappedParams.id]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-primary">Loading...</div>;
  if (!asset) return <div className="min-h-screen flex items-center justify-center text-red-500">Asset not found.</div>;

  return (
    <div className="min-h-screen font-parkinsans px-2 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        <Link prefetch={false} href="/digital-exchange" className="inline-flex items-center gap-2 text-sm lg:text-base text-gray-400 hover:text-primary transition-colors mb-2 lg:mb-6">
          <ArrowLeft size={18} /> Back to Exchange
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left Column: Image */}
          <div className="relative rounded-sm overflow-hidden group">
            <BackendImage showShine src={asset.image} alt={asset.title} className="w-full h-auto lg:h-fit object-cover" />
            {/* <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-700">
              <span className="text-sm font-bold text-white tracking-wider uppercase">{asset.category}</span>
            </div> */}
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <h1 className="text-2xl lg:text-5xl font-orbitron font-bold text-white mb-4">{asset.title}</h1>

            <div className="flex items-center gap-6 mb-8 border-b border-gray-800 pb-8">
              <div className="flex items-center gap-3">
                {asset.sellerAvatar ? (
                  <BackendImage showShine src={asset.sellerAvatar} alt="Seller" className="w-10 h-10 rounded-full border border-gray-700" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Owned By</p>
                  <p className="font-medium text-xs text-gray-200">{asset.sellerName || "System Inventory"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Ownerships</p>
                  <p className="font-medium text-xs text-gray-200">{asset.ownershipCount} Transfers</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Current Price</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-mono font-bold text-green-400">৳{asset.currentPrice}</span>
                <span className="text-gray-500 text-lg mb-1">BDT</span>
              </div>
              {user?.id !== asset.sellerId && user?.id !== asset.currentOwner ? (
                asset.isListed === false ? (
                  <div className="w-full bg-gray-800 text-gray-400 text-center text-sm font-bold py-4 rounded-xl">
                    This card has already been sold.
                  </div>
                ) : (
                  <Link prefetch={false} href={`/digital-exchange/purchase/${asset._id}`} className="block w-full bg-black text-black text-white text-center text-sm lg:text-lg font-bold py-2 lg:py-4 rounded-sm lg:rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                    Purchase Asset
                  </Link>
                )
              ) : (
                <div className="space-y-3">
                  <div className="w-full bg-gray-800 text-gray-400 text-center text-sm font-bold py-3 rounded-xl">
                    This card is already in your collection.
                  </div>
                  <Link prefetch={false} href="/profile/collection" className="block w-full border border-primary text-primary text-center text-sm font-bold py-3 rounded-xl hover:bg-primary/10 transition-all">
                    Manage in My Collection
                  </Link>
                </div>
              )}


              {/* Investment Trust Banner */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mt-6 flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-green-400 font-bold text-sm mb-1">High Investment Potential</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    By purchasing this digital asset, you secure full ownership rights. You can hold it in your portfolio as its value appreciates, and later resell it on the marketplace for a <strong>higher profit margin</strong>. Highly traded assets tend to increase in value rapidly!
                  </p>
                </div>
              </div>

            </div>

            <div>
              <h3 className="text-xl font-bold font-orbitron mb-4">Description</h3>
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{asset.description}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <h3 className="text-xl font-bold font-orbitron mb-6 flex items-center gap-2">
                <Activity size={24} className="text-primary" /> Security & Trust
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <ShieldCheck className="text-green-500 w-5 h-5" /> Verified Digital Asset
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <History className="text-blue-500 w-5 h-5" /> Permanent Ownership Tracking
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <ShieldCheck className="text-purple-500 w-5 h-5" /> Atomic Secure Transfer
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold font-orbitron mb-6">Ownership Ledger</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/80 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">From</th>
                    <th className="px-6 py-4 font-medium">To</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4 text-gray-400">{new Date(record.transferredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="px-6 py-4 text-gray-300 flex items-center gap-1">
                        <BackendImage
                          src={record.prevOwner?.img}
                          alt={record.prevOwner?.name || "Seller"}
                          className="w-6 h-6 rounded-full object-cover border border-gray-700 shadow-md"
                        /> {record.prevOwner?.name || "System"}</td>
                      <td className="px-6 py-4 font-medium text-white">{record.newOwnerDetails?.name}</td>
                      <td className="px-6 py-4 font-mono text-green-400">৳{record.salePrice}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No previous ownership history.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
