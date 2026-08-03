"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import Empty from "@/components/NotFound.tsx/Empty";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { BiHistory, BiMoney, BiMoneyWithdraw, BiCheckCircle, BiXCircle, BiTime } from "react-icons/bi";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

interface Deposit {
  _id: string;
  transactionNumber: string;
  paymentMethod: string;
  user_email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  type: "deposit";
  amount?: number;
}

interface Withdraw {
  _id: string;
  mobileNumber: string;
  amount: number;
  paymentMethod: string;
  user_email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  type: "withdraw";
}

type Transaction = Deposit | Withdraw;

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <BiCheckCircle className="text-green-400 text-lg" />;
    case "rejected":
      return <BiXCircle className="text-red-400 text-lg" />;
    case "pending":
    default:
      return <BiTime className="text-yellow-400 text-lg" />;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pending":
    default:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }
};

function TransactionChart({ transactions }: { transactions: Transaction[] }) {
  const approvedTx = transactions.filter(t => t.status === "approved");

  if (approvedTx.length < 2) {
    return (
      <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-6 text-center text-gray-500 text-xs font-medium mb-8">
        Not enough approved transactions to display trends (minimum 2 needed).
      </div>
    );
  }

  // Slice last 8 approved transactions to keep the chart clean, oldest to newest
  const chartData = [...approvedTx].slice(0, 8).reverse();

  // Find max value for scaling
  const maxVal = Math.max(...chartData.map(t => Number(t.amount || 0)), 1000);
  
  const width = 500;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;

  const points = chartData.map((tx, idx) => {
    const x = paddingX + (idx / (chartData.length - 1)) * (width - 2 * paddingX);
    const amount = Number(tx.amount || 0);
    const y = height - paddingY - (amount / maxVal) * (height - 2 * paddingY);
    return { x, y, tx };
  });

  // Create SVG path string
  let linePath = "";
  let areaPath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <div className="bg-gray-950/40 border border-gray-900 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 font-parkinsans">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Financial Flows Trend (Last {chartData.length} Approved Transactions)
        </h4>
        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 font-parkinsans">
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-emerald-400 inline-block"></span> Deposits</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-rose-500 inline-block"></span> Withdrawals</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto scrollbar-hide">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[450px] overflow-visible">
          {/* Y Axis Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1f2937"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  fill="#9ca3af"
                  fontSize="8"
                  className="font-mono text-right"
                  textAnchor="end"
                >
                  ৳{val}
                </text>
              </g>
            );
          })}

          {/* Fill Area gradient under line */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under the path */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points / Circles */}
          {points.map((pt, idx) => {
            const isDeposit = pt.tx.type === "deposit";
            const color = isDeposit ? "#10b981" : "#f43f5e";
            return (
              <g key={idx} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill={color}
                  stroke="#030712"
                  strokeWidth="1.5"
                  className="transition-all duration-200 hover:r-6"
                />
                {/* Tooltip on Hover */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <rect
                    x={pt.x - 55}
                    y={pt.y - 38}
                    width="110"
                    height="30"
                    rx="6"
                    fill="#111827"
                    stroke="#374151"
                    strokeWidth="1"
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 25}
                    fill="#fff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isDeposit ? "+" : "-"} ৳{pt.tx.amount}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y - 14}
                    fill="#9ca3af"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {pt.tx.paymentMethod.toUpperCase()}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function TransactionHistoryPage() {
  const { user, fetchUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "deposit" | "withdraw">("all");

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.email) return;

      const token = localStorage.getItem("auth_token");

      try {
        const [depositsRes, withdrawsRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/deposit/${user.email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/withdraw/${user.email}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

        const deposits = depositsRes.ok ? await depositsRes.json() : [];
        const withdraws = withdrawsRes.ok ? await withdrawsRes.json() : [];

        // Add type to each transaction
        const depositsWithType: Deposit[] = (Array.isArray(deposits) ? deposits : []).map(
          (d: Deposit) => ({ ...d, type: "deposit" })
        );
        const withdrawsWithType: Withdraw[] = (Array.isArray(withdraws) ? withdraws : []).map(
          (w: Withdraw) => ({ ...w, type: "withdraw" })
        );

        // Combine and sort by date (newest first)
        const allTransactions: Transaction[] = [...depositsWithType, ...withdrawsWithType].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setTransactions(allTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchTransactions();
    }
  }, [user]);

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  if (!user) {
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );
  }

  if (loading) return <SpinnerCustom />;

  if (transactions.length === 0) {
    return (
      <div className="max-w-3xl w-[95%] mx-auto py-4 md:py-6">
        <h3 className="text-lg md:text-xl font-medium mb-4 flex items-center gap-2 text-white font-parkinsans">
          <BiHistory className="text-xl" />
          Transaction History
        </h3>
        {/* Wallet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Withdrawable Balance</p>
            <p className="text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-emerald-400 text-sm font-medium">৳</span>
              {Number(user.amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Locked in Escrow</p>
            <p className="text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-amber-400 text-sm font-medium">৳</span>
              {Number(user.escrow_locked || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Total Account Value</p>
            <p className="text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
              <span className="text-purple-400 text-sm font-medium">৳</span>
              {(Number(user.amount || 0) + Number(user.escrow_locked || 0)).toLocaleString()}
            </p>
          </div>
        </div>
        <Empty description="Ohh! No transaction history available for you." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-[95%] mx-auto py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-900">
        <h3 className="text-xl md:text-2xl font-bold text-white font-orbitron flex items-center gap-2">
          <BiHistory className="text-secondary" />
          Transaction History
        </h3>
        {filteredTransactions.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-950 border border-gray-900 text-gray-400 font-mono">
            Total: {filteredTransactions.length}
          </span>
        )}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-3 gap-1 lg:gap-4 mb-8">
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm lg:rounded-2xl p-2 lg:p-5 hover:border-emerald-500/30 transition-all duration-300">
          <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Withdrawable Balance</p>
          <p className="text-base lg:text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
            <span className="text-emerald-400 text-sm font-medium">৳</span>
            {Number(user.amount || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm lg:rounded-2xl p-2 lg:p-5 hover:border-amber-500/30 transition-all duration-300">
          <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Locked in Escrow</p>
          <p className="text-base lg:text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
            <span className="text-amber-400 text-sm font-medium">৳</span>
            {Number(user.escrow_locked || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-900/40 border border-gray-800 rounded-sm lg:rounded-2xl p-2 lg:p-5 hover:border-purple-500/30 transition-all duration-300">
          <p className="text-[8px] lg:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 font-parkinsans">Total Account Value</p>
          <p className="text-base lg:text-xl md:text-2xl font-black text-white font-mono flex items-baseline gap-1">
            <span className="text-purple-400 text-sm font-medium">৳</span>
            {(Number(user.amount || 0) + Number(user.escrow_locked || 0)).toLocaleString()}
          </p>
        </div>
      </div>

      {/* SVG Chart */}
      <TransactionChart transactions={transactions} />

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-6 bg-gray-950/40 p-1.5 rounded-xl border border-gray-900 w-fit">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-300 cursor-pointer ${
            filter === "all"
              ? "bg-black text-white rounded-sm lg:rounded-md shadow-md"
              : "rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/60"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("deposit")}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            filter === "deposit"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
              : "text-gray-400 hover:text-white hover:bg-gray-900/60"
          }`}
        >
          <BiMoney size={16} />
          Deposits
        </button>
        <button
          onClick={() => setFilter("withdraw")}
          className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
            filter === "withdraw"
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
              : "text-gray-400 hover:text-white hover:bg-gray-900/60"
          }`}
        >
          <BiMoneyWithdraw size={16} />
          Withdrawals
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction._id}
            className="bg-gray-950/60 hover:bg-gray-950 border border-gray-900 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:scale-101 shadow-md"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className={`p-3 rounded-xl border flex-shrink-0 ${
                  transaction.type === "deposit"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {transaction.type === "deposit" ? (
                  <BiMoney className="text-base md:text-xl" />
                ) : (
                  <BiMoneyWithdraw className="text-base md:text-xl" />
                )}
              </div>

              {/* Details */}
              <div className="font-parkinsans">
                <p className="text-sm md:text-base font-semibold text-white">
                  {transaction.type === "deposit" ? "Deposit" : "Withdrawal"} via{" "}
                  {transaction.paymentMethod.charAt(0).toUpperCase() +
                    transaction.paymentMethod.slice(1)}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  {transaction.type === "deposit"
                    ? `TXN: ${transaction.transactionNumber}`
                    : `Number: ${transaction.mobileNumber}`}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-medium">
                  {new Date(transaction.createdAt).toLocaleString("en-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* Amount & Status */}
            <div className="text-right flex flex-col items-end gap-2">
              {transaction.type === "withdraw" ? (
                <p className="text-sm md:text-base font-bold text-rose-500 font-mono">
                  - ৳{transaction.amount}
                </p>
              ) : (
                transaction.amount !== undefined ? (
                  <p className="text-sm md:text-base font-bold text-emerald-500 font-mono">
                    + ৳{transaction.amount}
                  </p>
                ) : (
                  <p className="text-[10px] md:text-xs font-semibold text-amber-500 italic">
                    Verification Pending
                  </p>
                )
              )}
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(
                  transaction.status
                )}`}
              >
                {getStatusIcon(transaction.status)}
                <span className="capitalize">{transaction.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Empty description={`No ${filter} transactions found.`} />
      )}
      
      <PageHelpPanel pageKey="transactions" />
    </div>
  );
}

