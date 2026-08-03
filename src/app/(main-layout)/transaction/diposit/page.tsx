"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { toast } from "sonner";
import { BiMoney, BiCreditCard, BiPhone, BiCopy, BiCheck } from "react-icons/bi";

const paymentMethods = [
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" }, 
];

export default function DepositPage() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receiverNumber, setReceiverNumber] = useState("01712586423");

  useEffect(() => {
    const fetchReceiverNumber = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        if (data.bkashMerchant) {
          setReceiverNumber(data.bkashMerchant);
        }
      } catch (error) {
        console.error("Error fetching receiver number:", error);
      }
    };
    fetchReceiverNumber();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(receiverNumber);
    setCopied(true);
    toast.success("Phone number copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  const [formData, setFormData] = useState({
    transactionNumber: "",
    paymentMethod: "",
  });

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.transactionNumber.trim()) {
      toast.error("Transaction number is required");
      setLoading(false);
      return;
    }

    if (!formData.paymentMethod) {
      toast.error("Please select a payment method");
      setLoading(false);
      return;
    }

    if (!user?.email) {
      toast.error("User email not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/deposit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionNumber: formData.transactionNumber,
            paymentMethod: formData.paymentMethod,
            user_email: user.email,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit deposit request");
      }

      const data = await res.json();

      toast.success("Deposit request submitted successfully!", {
        position: "top-right",
      });

      setFormData({
        transactionNumber: "",
        paymentMethod: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Error submitting deposit request!", {
        position: "top-right",
      });
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
        <h1 className="text-2xl md:text-3xl font-bold font-orbitron text-white">Deposit Wallet</h1>
        <p className="text-sm text-gray-400 font-parkinsans mt-1">Add funds to your EmptyBD account to bid or purchase items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Number & Info (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Phone Number Banner */}
          <div className="bg-gradient-to-r from-emerald-600/90 to-teal-700/90 rounded-2xl p-5 md:p-6 text-white shadow-xl flex items-center justify-between border border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <BiPhone className="text-2xl" />
              </div>
              <div>
                <p className="text-xs text-emerald-100 font-parkinsans">Send money to this number</p>
                <p className="text-xl md:text-2xl font-bold font-mono tracking-wide mt-0.5">{receiverNumber}</p>
              </div>
            </div>
            <button
              onClick={handleCopy}
              type="button"
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl p-3 transition-all text-xs font-semibold flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              {copied ? <BiCheck className="text-lg" /> : <BiCopy className="text-lg" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Instruction Steps */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 shadow-lg backdrop-blur-md">
            <h4 className="font-semibold text-white uppercase tracking-wider text-xs font-parkinsans mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              How to Deposit
            </h4>
            <ol className="space-y-3 font-parkinsans text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-secondary font-bold font-mono">1.</span>
                <span>Send money to the admin number shown above using Cash-Out or Send Money.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary font-bold font-mono">2.</span>
                <span>Once successful, copy the <span className="text-emerald-400 font-semibold font-mono">Transaction ID (TXN ID)</span> from your SMS/App.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary font-bold font-mono">3.</span>
                <span>Select your payment method and enter the Transaction ID in the deposit form.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-secondary font-bold font-mono">4.</span>
                <span>Submit the request and wait for admin approval (typically verified in 10-30 mins).</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Right Side: Form (col-span-7) */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 shadow-xl rounded-2xl space-y-6 bg-gray-950/60 p-6 md:p-8 border border-gray-900 backdrop-blur-md"
        >
          <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2 text-white font-parkinsans border-b border-gray-900 pb-3">
            <BiMoney className="text-2xl text-secondary" />
            Deposit Request
          </h3>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-parkinsans">
              Transaction Details
            </h4>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 font-parkinsans">
                Transaction Number / ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="transactionNumber"
                placeholder="Enter your transaction ID (e.g. A1B2C3D4)"
                value={formData.transactionNumber}
                onChange={handleChange}
                className="input w-full bg-gray-900 border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-secondary/50 focus:border-secondary font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300 font-parkinsans">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input w-full appearance-none bg-gray-900 border-gray-800 rounded-xl px-4 py-3 text-sm focus:ring-secondary/50 focus:border-secondary font-parkinsans cursor-pointer"
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
              <p className="text-xs text-gray-400 font-parkinsans bg-gray-900/50 p-2.5 rounded-lg border border-gray-900">
                Email: <span className="text-white font-medium">{user?.email}</span> (automatically linked)
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              disabled={loading}
              type="submit"
              className="w-full bg-black hover:opacity-95 text-white py-3 rounded-sm lg:rounded-md font-semibold text-sm md:text-base transition-all duration-300 transform active:scale-98 shadow-md"
            >
              {loading ? <SpinnerCustom /> : "Submit Deposit Request"}
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center font-parkinsans">
            Your deposit request will be reviewed by our team shortly.
          </p>
        </form>
      </div>
    </div>
  );
}
