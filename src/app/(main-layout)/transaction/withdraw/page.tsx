"use client";

import { SpinnerCustom } from "@/components/loading/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { toast } from "sonner";
import { BiMoneyWithdraw, BiCreditCard, BiPhone } from "react-icons/bi";

const paymentMethods = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" }, 
];

export default function WithdrawPage() {
  const router = useRouter();
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [minWithdrawLimit, setMinWithdrawLimit] = useState(250);
  const { user, fetchUser } = useAuthStore();

  // Auto-refresh once on page mount to ensure updated balance/settings
  useEffect(() => {
    const hasReloaded = sessionStorage.getItem("withdraw_page_reloaded");
    if (!hasReloaded) {
      sessionStorage.setItem("withdraw_page_reloaded", "true");
      window.location.reload();
    }

    return () => {
      sessionStorage.removeItem("withdraw_page_reloaded");
    };
  }, []);

  const amountNum = Number(amount);
  const userBalance = Number(user?.amount) || 0;

  let validationError = "";
  if (amount !== "") {
    if (isNaN(amountNum) || amountNum <= 0) {
      validationError = "অনুগ্রহ করে সঠিক সংখ্যা লিখুন";
    } else if (amountNum < minWithdrawLimit) {
      validationError = `সর্বনিম্ন উইথড্র ৳${minWithdrawLimit}`;
    } else if (amountNum > minWithdrawLimit) {
      validationError = `সর্বোচ্চ উইথড্র ৳${minWithdrawLimit}`;
    } else if (amountNum > userBalance) {
      validationError = `পর্যাপ্ত ব্যালেন্স নেই। আপনার সর্বোচ্চ উইথড্র ৳${userBalance}`;
    }
  }

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.minWithdrawLimit) {
            setMinWithdrawLimit(Number(data.minWithdrawLimit));
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, [user, fetchUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    // Validation
    if (!mobileNumber.trim()) {
      toast.error("Mobile number is required");
      setLoading(false);
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      setLoading(false);
      return;
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount (greater than 0)");
      setLoading(false);
      return;
    }

    if (amountNum < minWithdrawLimit) {
      toast.error(`Minimum and maximum withdrawal limit is ৳${minWithdrawLimit}.`);
      setLoading(false);
      return;
    }

    if (amountNum > minWithdrawLimit) {
      toast.error(`You cannot request a withdrawal higher than ৳${minWithdrawLimit}.`);
      setLoading(false);
      return;
    }

    if (amountNum > userBalance) {
      toast.error(`Insufficient balance. Your available balance is ৳${userBalance}`);
      setLoading(false);
      return;
    }

    if (!user?.email) {
      toast.error("User not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        toast.error("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }

      if (user) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/withdraw`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              mobileNumber: mobileNumber.trim(),
              amount: amountNum,
              paymentMethod,
              user_email: user.email,
            }),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Request failed");
        }

        toast.success("Withdrawal request submitted successfully!", {
          position: "top-right",
        });

        // Redirect to transaction history
        router.push("/transaction/history");
      }

      setMobileNumber("");
      setAmount("");
      setPaymentMethod("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.", {
        position: "top-right",
      });
      console.error("Withdraw error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-2xl md:text-3xl font-bold font-orbitron text-white">Withdraw Funds</h1>
        <p className="text-sm text-gray-400 font-parkinsans mt-1">Submit a withdrawal request to transfer your earnings to bKash, Nagad, or Rocket</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Balance & Guidelines (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600/90 to-indigo-700/90 rounded-2xl p-5 md:p-6 text-white shadow-xl border border-blue-500/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <BiMoneyWithdraw className="text-2xl" />
              </div>
              <div>
                <p className="text-xs text-blue-100 font-parkinsans">Your Available Balance</p>
                <p className="text-2xl md:text-3xl font-bold font-mono tracking-wide mt-0.5">৳{userBalance}</p>
              </div>
            </div>
          </div>

          {/* Guideline Card */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 shadow-lg backdrop-blur-md">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs font-parkinsans mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Withdrawal Rules
            </h4>
            <ul className="space-y-3 font-parkinsans text-sm text-gray-300">
              <li className="flex justify-between items-center py-1 border-b border-gray-900">
                <span className="text-gray-400">Processing Time</span>
                <span className="font-semibold text-white">Within 24 Hours</span>
              </li>
              <li className="flex justify-between items-center py-1 border-b border-gray-900">
                <span className="text-gray-400">Transaction Fee</span>
                <span className="font-semibold text-emerald-400">৳0 (Free)</span>
              </li>
              <li className="flex gap-2 text-xs text-gray-400 mt-2">
                <span>⚠️ Note: Please make sure the receiver mobile number is correct. Incorrect details can lead to transaction failure.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form (col-span-7) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 shadow-xl rounded-2xl space-y-6 bg-gray-950/60 p-6 md:p-8 border border-gray-900 backdrop-blur-md"
        >
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-white font-parkinsans border-b border-gray-900 pb-3">
            <BiMoneyWithdraw className="text-2xl text-secondary" />
            Withdraw Request
          </h3>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-parkinsans">
              Withdrawal Details
            </h4>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 font-parkinsans">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="input w-full bg-gray-900 border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-secondary/50 focus:border-secondary font-mono"
                  disabled={loading}
                  required
                />
                <BiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 font-parkinsans">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input w-full appearance-none bg-gray-900 border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-secondary/50 focus:border-secondary font-parkinsans cursor-pointer"
                  disabled={loading}
                  required
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
                <BiCreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 font-parkinsans">
                Amount (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter withdrawal amount"
                min="1"
                className={`input w-full bg-gray-900 border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-secondary/50 focus:border-secondary font-mono ${
                  validationError ? "border-rose-500/80 focus:ring-rose-500/30" : ""
                }`}
                disabled={loading}
                required
              />
              {validationError && (
                <p className="text-xs text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                  <span>⚠️</span> {validationError}
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading || !!validationError || !amount || !mobileNumber || !paymentMethod}
              className={`w-full text-white py-3 font-semibold text-sm md:text-base transition-all duration-300 shadow-md transform ${
                loading || !!validationError || !amount || !mobileNumber || !paymentMethod
                  ? "bg-gray-800 text-gray-500 rounded-xl cursor-not-allowed border border-gray-700 shadow-none scale-100"
                  : "bg-black text-white rounded-sm lg:rounded-md hover:opacity-95 cursor-pointer active:scale-98"
              }`}
            >
              {loading ? <SpinnerCustom /> : "Submit Withdraw Request"}
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center font-parkinsans">
            Your withdrawal request will be reviewed by our team shortly.
          </p>
        </form>
      </div>
    </div>
  );
}
