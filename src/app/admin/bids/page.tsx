"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Gavel, Eye, Check, X, ShieldAlert, Award, Clock } from "lucide-react";
import Link from "next/link";
import Countdown from "@/components/short-component/Countdown";

interface BidUser {
  bidder_name: string;
  bidder_email: string;
  bidd_price: number;
}

interface AuctionBid {
  _id: string;
  product: {
    title: string;
    description: string;
    image_url: string;
  };
  seller?: {
    seller_name: string;
    email?: string;
  };
  start_bid: number;
  bidding_price: number;
  end_bid_time: string;
  status: string;
  winner?: {
    bidder_name: string;
    bidder_email: string;
    winning_price: number;
  };
  user_bidded?: BidUser[];
}

export default function AdminBidsPage() {
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [filteredBids, setFilteredBids] = useState<AuctionBid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table parameters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Actions states
  const [selectedBid, setSelectedBid] = useState<AuctionBid | null>(null);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBidsList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid`);
      if (!res.ok) throw new Error("Failed to fetch bids list");
      const data = await res.json();
      setBids(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading bids database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBidsList();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...bids];

    // Search by product title or seller email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.product?.title?.toLowerCase().includes(query) ||
          b.seller?.seller_name?.toLowerCase().includes(query) ||
          b.seller?.email?.toLowerCase().includes(query)
      );
    }

    // Apply Filter values
    if (activeFilters.status) {
      result = result.filter((b) => b.status === activeFilters.status);
    }

    setFilteredBids(result);
    setCurrentPage(1);
  }, [bids, search, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredBids.length / pageSize);
  const paginatedBids = filteredBids.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Finalize handlers
  const handleFinalizeClick = (b: AuctionBid) => {
    setSelectedBid(b);
    setConfirmFinalizeOpen(true);
  };

  const executeFinalize = async () => {
    if (!selectedBid) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/finalize-bid/${selectedBid._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to finalize auction");
      }

      toast.success("Auction finalized successfully. Winner has been notified.");
      fetchBidsList();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Finalize failed.");
    } finally {
      setActionLoading(false);
      setConfirmFinalizeOpen(false);
      setSelectedBid(null);
    }
  };

  // Delete handler (Mock support)
  const handleDeleteClick = (b: AuctionBid) => {
    setSelectedBid(b);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteBid = () => {
    if (!selectedBid) return;
    setActionLoading(true);
    // Optimistic UI deletion
    setTimeout(() => {
      setBids((prev) => prev.filter((b) => b._id !== selectedBid._id));
      toast.success("Auction deleted from registry successfully (Simulated).");
      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedBid(null);
    }, 500);
  };

  // Columns Definitions
  const columns: Column<AuctionBid>[] = [
    {
      key: "product",
      label: "Auction Item",
      render: (b) => (
        <div className="flex items-center gap-2.5">
          {b.product?.image_url ? (
            <BackendImage
              src={b.product.image_url}
              alt={b.product.title}
              className="h-10 w-10 object-cover rounded border border-gray-800 bg-gray-900"
             />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
              <Gavel size={16} />
            </div>
          )}
          <div>
            <span className="font-semibold text-white block truncate max-w-xs">{b.product?.title}</span>
            <span className="text-[10px] text-gray-500 font-mono block">{b._id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "bidding_price",
      label: "Current Price",
      render: (b) => <span className="font-bold text-white font-orbitron">৳{(b.bidding_price || 0).toLocaleString()}</span>,
    },
    {
      key: "start_bid",
      label: "Start Bid",
      render: (b) => <span className="text-gray-400 font-orbitron">৳{(b.start_bid || 0).toLocaleString()}</span>,
    },
    {
      key: "end_bid_time",
      label: "Countdown / Timer",
      render: (b) => {
        const isEnded = new Date(b.end_bid_time).getTime() <= Date.now() || b.status === "completed";
        return isEnded ? (
          <span className="text-red-500 font-medium text-xs border border-red-950 px-2 py-0.5 rounded bg-red-950/20">Auction Ended</span>
        ) : (
          <Countdown
            endTime={b.end_bid_time}
            onEnd={() => fetchBidsList()}
            className="text-xs font-semibold text-green-400"
          />
        );
      },
    },
    {
      key: "seller",
      label: "Seller",
      render: (b) => (
        b.seller ? (
          <div>
            <span className="text-gray-300 block text-xs font-semibold">{b.seller.seller_name}</span>
            <span className="text-[10px] text-gray-500 block">{b.seller.email}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs italic">Unknown</span>
        )
      ),
    },
    {
      key: "status",
      label: "State",
      render: (b) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
            b.status === "completed"
              ? "bg-green-600/20 text-green-400 border-green-600/30"
              : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
          }`}
        >
          {b.status || "active"}
        </span>
      ),
    },
    {
      key: "winner",
      label: "Winner Payout",
      render: (b) =>
        b.winner ? (
          <div>
            <span className="text-green-400 font-semibold text-xs flex items-center gap-1">
              <Award size={12} /> {b.winner.bidder_name}
            </span>
            <span className="text-[10px] text-gray-500 block font-orbitron">৳{b.winner.winning_price}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs italic">TBD</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (b) => {
        const isTimeEnded = new Date(b.end_bid_time).getTime() <= Date.now();
        const canFinalize = isTimeEnded && b.status !== "completed" && b.user_bidded && b.user_bidded.length > 0;
        return (
          <div className="flex gap-2">
            <Link href={`/bid/all-selling-product/${b._id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800 px-2.5 gap-1.5"
              >
                <Eye size={13} />
                View
              </Button>
            </Link>
            {canFinalize && (
              <Button
                size="sm"
                onClick={() => handleFinalizeClick(b)}
                className="h-8 bg-green-600 hover:bg-green-700 text-white px-2.5 gap-1.5"
              >
                <Check size={13} />
                Finalize
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteClick(b)}
              className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2.5 gap-1.5"
            >
              <X size={13} />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "States",
      options: [
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Bids & Live Auctions
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Oversee bidding post escrows, timers, and finalize auction winners.
          </p>
        </div>
        <Link href="/bid/create-bid">
          <Button className="bg-primary hover:bg-primary/95 text-white gap-2 font-parkinsans h-10 px-4">
            <Gavel size={16} />
            Create Auction Post
          </Button>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        data={paginatedBids}
        isLoading={isLoading}
        searchPlaceholder="Search auctions by product title, seller name..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredBids.length}
      />

      {/* Confirm Finalize Modal */}
      <AdminConfirmModal
        isOpen={confirmFinalizeOpen}
        onClose={() => setConfirmFinalizeOpen(false)}
        onConfirm={executeFinalize}
        isLoading={actionLoading}
        title="Manually Finalize Auction?"
        description="Are you sure you want to finalize this auction on behalf of the seller? The highest bidder will be assigned as the winner, funds will be released to the seller, and all losing bidders will be refunded."
        confirmText="Yes, Finalize Winner"
        type="success"
      />

      {/* Confirm Delete Modal */}
      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDeleteBid}
        isLoading={actionLoading}
        title="Delete Bidding Post?"
        description={`Are you sure you want to delete the auction post "${selectedBid?.product?.title}"? Escrowed funds will remain locked in user balances and will need manual adjustment.`}
        confirmText="Yes, Delete Post"
        type="danger"
      />
    </div>
  );
}
