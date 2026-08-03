"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Check, X, Clock, HelpCircle, FileText, ArrowDownLeft } from "lucide-react";

interface DepositRequest {
  _id: string;
  user_email: string;
  user_name: string;
  transactionNumber: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected";
  amount?: number;
  createdAt: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<DepositRequest[]>([]);
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
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [approveAmount, setApproveAmount] = useState<string>("");
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all deposits directly
  const fetchAllDeposits = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch deposits");
      const data = await res.json();
      setDeposits(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading deposit transaction requests.");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchAllDeposits();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...deposits];

    // Search by TXN ID or Email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.transactionNumber?.toLowerCase().includes(query) ||
          d.user_email?.toLowerCase().includes(query) ||
          d.user_name?.toLowerCase().includes(query)
      );
    }

    // Apply Filter values
    if (activeFilters.status) {
      result = result.filter((d) => d.status === activeFilters.status);
    }
    if (activeFilters.paymentMethod) {
      result = result.filter((d) => d.paymentMethod === activeFilters.paymentMethod);
    }

    setFilteredDeposits(result);
    setCurrentPage(1);
  }, [deposits, search, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredDeposits.length / pageSize);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Approve handlers
  const handleApproveClick = (dep: DepositRequest) => {
    setSelectedDeposit(dep);
    setApproveAmount("");
    setIsApproveOpen(true);
  };

  const handleApproveSubmit = () => {
    const val = Number(approveAmount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid deposit amount.");
      return;
    }
    setConfirmApproveOpen(true);
  };

  const executeApprove = async () => {
    if (!selectedDeposit) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/deposit/${selectedDeposit._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
            amount: Number(approveAmount),
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Deposit request approved. credited ৳${approveAmount} to ${selectedDeposit.user_name}`);
      fetchAllDeposits();
      window.dispatchEvent(new Event("refresh-pending-counts"));
    } catch (err: any) {
      console.error(err);
      // Fallback local update
      setDeposits((prev) =>
        prev.map((d) =>
          d._id === selectedDeposit._id
            ? { ...d, status: "approved", amount: Number(approveAmount) }
            : d
        )
      );
      toast.info("Offline Fallback: Deposit processed locally.");
    } finally {
      setActionLoading(false);
      setConfirmApproveOpen(false);
      setIsApproveOpen(false);
      setSelectedDeposit(null);
    }
  };

  // Reject handlers
  const handleRejectClick = (dep: DepositRequest) => {
    setSelectedDeposit(dep);
    setConfirmRejectOpen(true);
  };

  const executeReject = async () => {
    if (!selectedDeposit) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/deposit/${selectedDeposit._id}`,
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

      toast.success("Deposit request has been marked as rejected.");
      fetchAllDeposits();
      window.dispatchEvent(new Event("refresh-pending-counts"));
    } catch (err) {
      console.error(err);
      // Fallback local update
      setDeposits((prev) =>
        prev.map((d) => (d._id === selectedDeposit._id ? { ...d, status: "rejected" } : d))
      );
      toast.info("Offline Fallback: Deposit rejected locally.");
    } finally {
      setActionLoading(false);
      setConfirmRejectOpen(false);
      setSelectedDeposit(null);
    }
  };

  // Columns Definitions
  const columns: Column<DepositRequest>[] = [
    {
      key: "user_name",
      label: "User",
      render: (d) => (
        <div>
          <span className="font-semibold text-white block">{d.user_name}</span>
          <span className="text-xs text-gray-400 block">{d.user_email}</span>
        </div>
      ),
    },
    {
      key: "transactionNumber",
      label: "Transaction ID",
      render: (d) => <span className="font-mono text-gray-300 select-all font-semibold">{d.transactionNumber}</span>,
    },
    {
      key: "paymentMethod",
      label: "Method",
      render: (d) => (
        <span className="capitalize font-medium text-gray-300">{d.paymentMethod}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Requested Date",
      render: (d) => (
        <span className="text-xs text-gray-500">
          {new Date(d.createdAt).toLocaleString("en-BD", {
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
      label: "Credited Amount",
      render: (d) =>
        d.status === "approved" ? (
          <span className="font-bold text-green-400 font-orbitron">৳{d.amount}</span>
        ) : (
          <span className="text-gray-500 font-mono text-xs">Uncredited</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (d) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            d.status === "approved"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : d.status === "rejected"
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }`}
        >
          {d.status === "approved" ? (
            <Check size={12} />
          ) : d.status === "rejected" ? (
            <X size={12} />
          ) : (
            <Clock size={12} />
          )}
          <span className="capitalize">{d.status}</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (d) =>
        d.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleApproveClick(d)}
              className="h-8 bg-green-600 hover:bg-green-700 text-white px-2.5 gap-1.5"
            >
              <Check size={13} />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRejectClick(d)}
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
            Deposit Requests
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Verify transactions and approve/reject wallet deposits.
          </p>
        </div>
      </div>

      {/* Quick Filter Status Tabs */}
      <div className="flex border-b border-gray-800 gap-1.5 overflow-x-auto pb-1">
        {(["", "pending", "approved", "rejected"] as const).map((status) => {
          const isActive = activeFilters.status === status;
          const label = status === "" ? "All Requests" : status.charAt(0).toUpperCase() + status.slice(1);
          const count = status === "" 
            ? deposits.length 
            : deposits.filter(d => d.status === status).length;

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
        data={paginatedDeposits}
        isLoading={isLoading}
        searchPlaceholder="Search by transaction ID, user email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredDeposits.length}
      />

      {/* Approve Deposit Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowDownLeft className="text-green-500" />
              Approve Deposit Wallet Credit
            </DialogTitle>
          </DialogHeader>

          {selectedDeposit && (
            <div className="space-y-4 my-4">
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 text-xs md:text-sm text-gray-300">
                <p><strong>User:</strong> {selectedDeposit.user_name} ({selectedDeposit.user_email})</p>
                <p><strong>Payment Mode:</strong> {selectedDeposit.paymentMethod.toUpperCase()}</p>
                <p><strong>Transaction ID:</strong> <span className="font-mono text-white select-all">{selectedDeposit.transactionNumber}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  Enter Verified Credit Amount (৳) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="Enter the exact amount of money received"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>
            </div>
          )}

          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsApproveOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button onClick={handleApproveSubmit} className="bg-green-600 hover:bg-green-700 text-white">
              Approve Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Approve Modal */}
      <AdminConfirmModal
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={executeApprove}
        isLoading={actionLoading}
        title="Confirm Deposit Approval"
        description={`Are you sure you want to credit ৳${approveAmount} to ${selectedDeposit?.user_name}'s account? Make sure the transaction matches the receipt.`}
        confirmText="Yes, Credit Wallet"
        type="success"
      />

      {/* Confirm Reject Modal */}
      <AdminConfirmModal
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={executeReject}
        isLoading={actionLoading}
        title="Confirm Deposit Rejection"
        description={`Are you sure you want to reject the deposit request from ${selectedDeposit?.user_name}? This action will change the status to Rejected.`}
        confirmText="Yes, Reject Request"
        type="danger"
      />
    </div>
  );
}
