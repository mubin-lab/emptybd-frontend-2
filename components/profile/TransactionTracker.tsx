"use client";

import { useEffect, useState } from "react";
import { BiMoney, BiMoneyWithdraw, BiCheckCircle, BiTime, BiLoaderCircle } from "react-icons/bi";

interface PendingTx {
  _id: string;
  type: "deposit" | "withdraw";
  paymentMethod: string;
  amount?: number;
  transactionNumber?: string;
  mobileNumber?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function TransactionTracker({ email }: { email: string }) {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTx[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    if (!email) return;
    const token = localStorage.getItem("auth_token");
    try {
      const [depositsRes, withdrawsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/deposit/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/withdraw/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const deposits = depositsRes.ok ? await depositsRes.json() : [];
      const withdraws = withdrawsRes.ok ? await withdrawsRes.json() : [];

      const depositsWithType = (Array.isArray(deposits) ? deposits : [])
        .map((d: any) => ({ ...d, type: "deposit" }))
        .filter((d: any) => d.status === "pending");

      const withdrawsWithType = (Array.isArray(withdraws) ? withdraws : [])
        .map((w: any) => ({ ...w, type: "withdraw" }))
        .filter((w: any) => w.status === "pending");

      const combinedPending = [...depositsWithType, ...withdrawsWithType].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPendingTransactions(combinedPending);
    } catch (error) {
      console.error("Error fetching active pending transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    
    // Polling enabled with 10s interval for real-time updates while managing API load
    const interval = setInterval(fetchPendingRequests, 10000);
    return () => clearInterval(interval);
  }, [email]);

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 flex items-center justify-center gap-2">
        <BiLoaderCircle className="animate-spin text-primary text-xl" />
        <span className="text-sm text-gray-400">Loading pending requests status...</span>
      </div>
    );
  }

  if (pendingTransactions.length === 0) return <></>;

  return (
    <div className="space-y-4 mb-6">
      <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 font-parkinsans flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        </span>
        Active Requests Tracker
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingTransactions.map((tx) => {
          const isDeposit = tx.type === "deposit";
          const methodLabel = tx.paymentMethod.toUpperCase();

          return (
            <div
              key={tx._id}
              className="bg-gray-950/80 border border-gray-800 hover:border-gray-700 transition-all rounded-xl p-5 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isDeposit ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {isDeposit ? <BiMoney size={20} /> : <BiMoneyWithdraw size={20} />}
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm md:text-base capitalize">
                      {tx.type} Request
                    </h5>
                    <p className="text-xs text-gray-400">
                      via {methodLabel} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs md:text-sm font-bold text-white block">
                    {isDeposit ? "Pending Verify" : `৳${tx.amount}`}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {isDeposit ? `TXN: ${tx.transactionNumber}` : `To: ${tx.mobileNumber}`}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Visual */}
              <div className="pt-2 px-1">
                <div className="relative flex items-center justify-between w-full">
                  {/* Progress Line Bar */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-800 z-0">
                    <div className="h-full bg-gradient-to-r from-green-500 to-yellow-500 w-1/2"></div>
                  </div>

                  {/* Step 1: Submitted */}
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs border-2 border-gray-950">
                      ✓
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-green-400 mt-1">Submitted</span>
                  </div>

                  {/* Step 2: Verifying */}
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs border-2 border-gray-950 animate-pulse">
                      <BiTime className="text-gray-950 font-bold" />
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-yellow-400 mt-1">Verifying</span>
                  </div>

                  {/* Step 3: Finished */}
                  <div className="z-10 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center text-gray-500 text-xs">
                      3
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-500 mt-1">
                      {isDeposit ? "Credited" : "Disbursed"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center bg-gray-900/40 py-1.5 px-3 rounded-lg border border-gray-900">
                  <p className="text-[11px] text-gray-400">
                    {isDeposit
                      ? "Admin is checking your transaction ID. Balance will be updated on approval."
                      : "Withdrawal is being processed. Funds will be sent to your mobile wallet shortly."}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
