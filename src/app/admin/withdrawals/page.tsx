"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Check, X, Clock, ArrowUpRight } from "lucide-react";

interface WithdrawRequest {
  _id: string;
  user_email: string;
  user_name: string;
  mobileNumber: string;
  paymentMethod: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<WithdrawRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table parameters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: "",
    paymentMethod: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Actions states
  const [selectedWithdraw, setSelectedWithdraw] = useState<WithdrawRequest | null>(null);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all withdrawals directly
  const fetchAllWithdrawals = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading withdrawal transaction requests.");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAllWithdrawals();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...withdrawals];

    // Search by Phone or Email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.mobileNumber?.toLowerCase().includes(query) ||
          w.user_email?.toLowerCase().includes(query) ||
          w.user_name?.toLowerCase().includes(query)
      );
    }

    // Apply Filter values
    if (activeFilters.status) {
      result = result.filter((w) => w.status === activeFilters.status);
    }
    if (activeFilters.paymentMethod) {
      result = result.filter((w) => w.paymentMethod === activeFilters.paymentMethod);
    }

    setFilteredWithdrawals(result);
    setCurrentPage(1);
  }, [withdrawals, search, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / pageSize);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Approve handlers
  const handleApproveClick = (w: WithdrawRequest) => {
    setSelectedWithdraw(w);
    setConfirmApproveOpen(true);
  };

  const executeApprove = async () => {
    if (!selectedWithdraw) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/withdraw/${selectedWithdraw._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Withdrawal of ৳${selectedWithdraw.amount} approved for ${selectedWithdraw.user_name}`);
      fetchAllWithdrawals();
      window.dispatchEvent(new Event("refresh-pending-counts"));
    } catch (err) {
      console.error(err);
      // Fallback local update
      setWithdrawals((prev) =>
        prev.map((w) => (w._id === selectedWithdraw._id ? { ...w, status: "approved" } : w))
      );
      toast.info("Offline Fallback: Withdrawal approved locally.");
    } finally {
      setActionLoading(false);
      setConfirmApproveOpen(false);
      setSelectedWithdraw(null);
    }
  };

  // Reject handlers
  const handleRejectClick = (w: WithdrawRequest) => {
    setSelectedWithdraw(w);
    setConfirmRejectOpen(true);
  };

  const executeReject = async () => {
    if (!selectedWithdraw) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/withdraw/${selectedWithdraw._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
          }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Withdrawal request processed.`);
      fetchAllWithdrawals();
      window.dispatchEvent(new Event("refresh-pending-counts"));
    } catch (err) {
      console.error(err);
      // Fallback local update
      setWithdrawals((prev) =>
        prev.map((w) => (w._id === selectedWithdraw._id ? { ...w, status: "rejected" } : w))
      );
      toast.info("Offline Fallback: Withdrawal rejected locally.");
    } finally {
      setActionLoading(false);
      setConfirmRejectOpen(false);
      setSelectedWithdraw(null);
    }
  };

  // Columns Definitions
  const columns: Column<WithdrawRequest>[] = [
    {
      key: "user_name",
      label: "User",
      render: (w) => (
        <div>
          <span className="font-semibold text-white block">{w.user_name}</span>
          <span className="text-xs text-gray-400 block">{w.user_email}</span>
        </div>
      ),
    },
    {
      key: "mobileNumber",
      label: "Mobile Number",
      render: (w) => <span className="font-mono text-gray-300 select-all font-semibold">{w.mobileNumber}</span>,
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (w) => (
        <span className="capitalize font-medium text-gray-300">{w.paymentMethod}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Requested Date",
      render: (w) => (
        <span className="text-xs text-gray-500">
          {new Date(w.createdAt).toLocaleString("en-BD", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Withdraw Amount",
      render: (w) => (
        <span className="font-bold text-white font-orbitron">৳{w.amount.toLocaleString()}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (w) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            w.status === "approved"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : w.status === "rejected"
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }`}
        >
          {w.status === "approved" ? (
            <Check size={12} />
          ) : w.status === "rejected" ? (
            <X size={12} />
          ) : (
            <Clock size={12} />
          )}
          <span className="capitalize">{w.status}</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (w) =>
        w.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveClick(w)}
              className="h-8 bg-green-600 hover:bg-green-700 text-white px-2.5 gap-1.5"
            >
              <Check size={13} />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectClick(w)}
              className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2.5 gap-1.5"
            >
              <X size={13} />
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-xs text-gray-500 italic">No action required</span>
        ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "Statuses",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      key: "paymentMethod",
      label: "Methods",
      options: [
        { value: "bkash", label: "bKash" },
        { value: "nagad", label: "Nagad" },
        { value: "rocket", label: "Rocket" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Withdraw Requests
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Verify and approve/reject wallet withdrawal cash-outs.
          </p>
        </div>
      </div>

      {/* Quick Filter Status Tabs */}
      <div className="flex border-b border-gray-800 gap-1.5 overflow-x-auto pb-1">
        {(["", "pending", "approved", "rejected"] as const).map((status) => {
          const isActive = activeFilters.status === status;
          const label = status === "" ? "All Requests" : status.charAt(0).toUpperCase() + status.slice(1);
          const count = status === "" 
            ? withdrawals.length 
            : withdrawals.filter(w => w.status === status).length;

          return (
            <button
              key={status}
              onClick={() => setActiveFilters(prev => ({ ...prev, status }))}
              className={`px-4 py-2 text-xs md:text-sm font-medium font-parkinsans border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap -mb-[2px] cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-white hover:border-gray-850"
              }`}
            >
              <span>{label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive 
                  ? "bg-primary/20 text-primary" 
                  : "bg-gray-900 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>


      <AdminTable
        columns={columns}
        data={paginatedWithdrawals}
        isLoading={isLoading}
        searchPlaceholder="Search by mobile number, user email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredWithdrawals.length}
      />

      {/* Confirm Approve Modal */}
      <AdminConfirmModal
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={executeApprove}
        isLoading={actionLoading}
        title="Confirm Payout Approval"
        description={`Are you sure you want to mark the withdrawal of ৳${selectedWithdraw?.amount} to mobile number ${selectedWithdraw?.mobileNumber} as Approved? Make sure you have processed the cash-out.`}
        confirmText="Yes, Approve Payout"
        type="success"
      />

      {/* Confirm Reject Modal */}
      <AdminConfirmModal
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={executeReject}
        isLoading={actionLoading}
        title="Confirm Payout Rejection"
        description={`Are you sure you want to reject the withdrawal request of ৳${selectedWithdraw?.amount} from ${selectedWithdraw?.user_name}? Rejection should refund the amount back to the user.`}
        confirmText="Yes, Reject Request"
        type="danger"
      />
    </div>
  );
}
