"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Settings, ShieldCheck, X } from "lucide-react";
import Empty from "@/components/NotFound.tsx/Empty";
import Link from "next/link";

export default function MyCollectionPage() {
  const { user, fetchUser } = useAuthStore();
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [isListed, setIsListed] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCollection = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/my-assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      } else {
        toast.error("Failed to load collection.");
      }
    } catch (error) {
      toast.error("Error loading collection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) fetchUser();
    fetchCollection();
  }, [user]);

  const openSettings = (asset: any) => {
    setSelectedAsset(asset);
    setIsListed(asset.isListed || false);
    setNewPrice(asset.currentPrice?.toString() || "");
  };

  const closeSettings = () => {
    setSelectedAsset(null);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setIsUpdating(true);
    const token = localStorage.getItem("auth_token");
    try {
      const payload: any = { isListed };
      if (selectedAsset.pricingAccess === "bothAccess") {
        payload.price = Number(newPrice);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/my-assets/${selectedAsset._id}/listing`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success(`Asset is now ${isListed ? "Listed for Sale" : "Stored in Collection"}`);
        closeSettings();
        fetchCollection();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update asset.");
      }
    } catch (err) {
      toast.error("Error connecting to the server.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-primary">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-[95%] mx-auto py-8 md:py-12 font-parkinsans text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">My Collection</h1>
        <p className="text-gray-400 mt-2">Manage your privately owned digital assets and their marketplace availability.</p>
      </div>

      {assets.length === 0 ? (
        <Empty description="You don't own any digital assets yet. Visit the Digital Exchange to purchase some!" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <div key={asset._id} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden flex flex-col hover:border-gray-700 transition-colors">
              <Link prefetch={false} href={`/digital-exchange/${asset._id}`} className="relative bg-gray-900 overflow-hidden">
                <BackendImage src={asset.image} alt={asset.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${asset.isListed ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-800/80 text-gray-300 border border-gray-600/50 backdrop-blur-md"}`}>
                    {asset.isListed ? "Listed" : "Stored"}
                  </span>
                </div>
              </Link>

              <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-orbitron font-bold text-sm md:text-base lg:text-lg mb-1 truncate">{asset.title}</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] md:text-xs text-gray-500 uppercase">Value</span>
                  <span className="text-green-400 font-mono font-bold">৳{asset.currentPrice}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] md:text-xs text-gray-500">
                    Owned Since: {new Date(asset.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => openSettings(asset)}
                    className="p-1.5 text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 rounded transition-colors"
                  >
                    <Settings size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Listing Settings Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 backdrop-blur-sm">
          <div className="bg-background border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
              <h2 className="text-lg font-bold font-orbitron">Asset Settings</h2>
              <button onClick={closeSettings} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdateListing} className="p-6 space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <BackendImage src={selectedAsset.image} alt={selectedAsset.title} className="w-16 h-16 rounded-lg object-cover border border-gray-700" />
                <div>
                  <h4 className="font-bold text-white">{selectedAsset.title}</h4>
                  <p className="text-xs text-gray-400 mt-1">Status: {selectedAsset.status}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Marketplace Availability</label>
                  <select
                    value={isListed ? "true" : "false"}
                    onChange={(e) => setIsListed(e.target.value === "true")}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="false">Stored (Private Collection)</option>
                    <option value="true">Listed for Sale (Public Marketplace)</option>
                  </select>
                  <p className="text-[10px] text-gray-500 mt-2">
                    {isListed
                      ? "This card will be visible in the Digital Exchange and can be purchased by other users."
                      : "This card is kept safely in your collection. No one else can buy it."}
                  </p>
                </div>

                {isListed && (
                  <div className="pt-4 border-t border-gray-800">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Selling Price (৳)</label>
                    {selectedAsset.pricingAccess === "bothAccess" ? (
                      <input
                        required
                        type="number"
                        min="0"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary font-mono"
                      />
                    ) : (
                      <div className="space-y-2">
                        <input
                          disabled
                          type="number"
                          value={selectedAsset.currentPrice}
                          className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 font-mono cursor-not-allowed opacity-50"
                        />
                        <div className="flex items-start gap-2 text-[10px] text-amber-500 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                          <ShieldCheck size={14} className="flex-shrink-0 mt-0.5" />
                          <p>This asset has "Admin Only" pricing access. You cannot manually change its market price when relisting. Your selling price is locked to ৳{selectedAsset.currentPrice}.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-black text-white font-bold py-2 sm:py-2 lg:py-3 text-sm lg:text-base rounded-sm lg:rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
