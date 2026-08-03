"use client";

import React, { useEffect, useState } from "react";
import { Check, ShieldCheck, Gem, AlertTriangle } from "lucide-react"; 
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import PlanBadge from "@/components/shared/PlanBadge";

interface Package {
  _id: string;
  title: string;
  price: number;
  features: string[];
  type: string;
}

export default function PackagesPage() {
  const { user, fetchUser } = useAuthStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages`);
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        }
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleBuyClick = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsConfirmOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !user) return;
    
    const userAmount = Number(user.amount) || 0;
    if (userAmount < selectedPackage.price) {
      toast.error(`Insufficient balance! You need ৳${selectedPackage.price} but have ৳${userAmount}. Please deposit more funds.`);
      setIsConfirmOpen(false);
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ packageId: selectedPackage._id }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to purchase package");
      }
      
      toast.success("Package purchase requested successfully! Pending admin approval.");
      await fetchUser(); // Refresh user data to update balance
      setIsConfirmOpen(false);
    } catch (err: any) {
      toast.error(err.message || "An error occurred during purchase");
    } finally {
      setActionLoading(false);
      setSelectedPackage(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          Upgrade Your Account
        </h1>
        {/* <p className="text-lg text-gray-400">
          Get exclusive features, special badges, and premium support by upgrading your plan.
        </p> */}
        
        {/* {user && (
          <div className="mt-6 inline-flex items-center gap-3 bg-gray-900/80 border border-gray-800 px-5 py-2.5 rounded-full shadow-lg">
            <span className="text-gray-400 text-sm font-medium">Your Balance:</span>
            <span className="text-white font-bold text-lg font-mono">৳ {Number(user.amount || 0).toFixed(2)}</span>
          </div>
        )} */}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {packages.map((pkg) => {
          const isOwner = pkg.type === "owner" || pkg.type === "ownership";
          const isPremium = pkg.type === "premium";
          
          return (
            <div 
              key={pkg._id} 
              className={`relative flex flex-col rounded-3xl p-6 lg:p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                isOwner 
                  ? "bg-gradient-to-b from-amber-900/40 to-gray-950 border border-amber-700/50 shadow-amber-900/20" 
                  : isPremium 
                    ? "bg-gradient-to-b from-blue-900/40 to-gray-950 border border-blue-700/50 shadow-blue-900/20"
                    : "bg-gray-900 border border-gray-800"
              }`}
            >
              {isOwner && (
                <div className="absolute -top-4 inset-x-0 flex justify-center">
                  <span className="bg-amber-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-lg shadow-amber-900/50">
                    Ultimate
                  </span>
                </div>
              )}
              
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h3 className={`text-2xl font-bold flex items-center gap-2 ${isOwner ? 'text-amber-400' : isPremium ? 'text-blue-400' : 'text-white'}`}>
                    {pkg.title}
                    {isOwner && <PlanBadge plan={"owner"} />}
                    {isPremium && <PlanBadge plan={"premium"} />}
                  </h3>
                  <div className="mt-4 flex items-baseline text-white">
                    <span className="text-4xl font-extrabold tracking-tight">৳{pkg.price}</span>
                    <span className="ml-1 text-xl font-medium text-gray-500">/lifetime</span>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Check className={`h-5 w-5 ${isOwner ? 'text-amber-500' : isPremium ? 'text-blue-500' : 'text-primary'}`} />
                      </div>
                      <p className="ml-3 text-xs lg:text-base text-gray-300">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => handleBuyClick(pkg)}
                disabled={user?.plan === pkg.type}
                className={`w-full py-3 lg:py-6 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  user?.plan === pkg.type
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : isOwner
                      ? "bg-amber-600 hover:bg-amber-700 text-white hover:shadow-amber-900/50"
                      : isPremium
                        ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-900/50"
                        : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {user?.plan === pkg.type ? "Current Plan" : "Get Started"}
              </Button>
            </div>
          );
        })}

        {packages.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No packages available at the moment.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-gray-950 border border-gray-800 text-white font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              Confirm Purchase
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 text-gray-300 space-y-4">
            <p>
              Are you sure you want to request the <strong>{selectedPackage?.title}</strong> package?
            </p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Package Price:</span>
                <span className="font-mono text-white font-semibold">৳{selectedPackage?.price}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Your Current Balance:</span>
                <span className="font-mono text-white font-semibold">৳{user?.amount || 0}</span>
              </div>
              <div className="h-px bg-gray-800 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Balance After Purchase:</span>
                <span className={`font-mono font-bold ${
                  ((Number(user?.amount) || 0) - (selectedPackage?.price || 0)) < 0 ? "text-red-500" : "text-green-500"
                }`}>
                  ৳{((Number(user?.amount) || 0) - (selectedPackage?.price || 0)).toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Your amount will be deducted immediately. If the admin rejects your request, the exact amount will be refunded to your balance.
            </p>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={actionLoading} className="border-gray-800 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={actionLoading} className="bg-primary hover:bg-primary/90 text-white">
              {actionLoading ? "Processing..." : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
