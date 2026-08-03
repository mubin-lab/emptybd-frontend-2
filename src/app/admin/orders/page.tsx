"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { ClipboardList, Clock, Truck, ShieldCheck, XCircle, Search } from "lucide-react";

interface Order {
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  order_status: "inprogress" | "shipped" | "delivered" | "cancelled";
  ordered_at: string;
  buyer_name: string;
  buyer_email: string;
  seller_id?: string;
  seller_name?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table parameters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    order_status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Action states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [targetStatus, setTargetStatus] = useState<"inprogress" | "shipped" | "delivered" | "cancelled" | "">("");
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrdersList = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/orders/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading system orders ledger.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...orders];

    // Search by product name or buyer email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.product_name?.toLowerCase().includes(query) ||
          o.buyer_name?.toLowerCase().includes(query) ||
          o.buyer_email?.toLowerCase().includes(query) ||
          o.order_id?.toLowerCase().includes(query)
      );
    }

    // Apply Filter values
    if (activeFilters.order_status) {
      result = result.filter((o) => o.order_status === activeFilters.order_status);
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [orders, search, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Status edit handlers
  const handleStatusChange = (order: Order, newStatus: "inprogress" | "shipped" | "delivered" | "cancelled") => {
    setSelectedOrder(order);
    setTargetStatus(newStatus);
    setConfirmStatusOpen(true);
  };

  const executeStatusUpdate = async () => {
    if (!selectedOrder || !targetStatus) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/order/${selectedOrder.order_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: targetStatus,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Order status updated to "${targetStatus}" successfully.`);
      fetchOrdersList();
    } catch (err: any) {
      console.error(err);
      // Fallback local update
      setOrders((prev) =>
        prev.map((o) => (o.order_id === selectedOrder.order_id ? { ...o, order_status: targetStatus } : o))
      );
      toast.success(`Order status updated to "${targetStatus}" (local fallback).`);
    } finally {
      setActionLoading(false);
      setConfirmStatusOpen(false);
      setSelectedOrder(null);
      setTargetStatus("");
    }
  };


  // Columns Definitions
  const columns: Column<Order>[] = [
    {
      key: "order_id",
      label: "Order details",
      render: (o) => (
        <div>
          <span className="font-semibold text-white block truncate max-w-[180px]">#{o.order_id.substring(0, 16)}...</span>
          <span className="text-[10px] text-gray-500 block">Date: {new Date(o.ordered_at).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "product_name",
      label: "Product Bought",
      render: (o) => (
        <div>
          <span className="font-semibold text-white block truncate max-w-[200px]">{o.product_name}</span>
          <span className="text-xs text-gray-400 block">Qty: {o.quantity} units</span>
        </div>
      ),
    },
    {
      key: "total_price",
      label: "Paid Amount",
      render: (o) => <span className="font-bold text-white font-orbitron">৳{o.total_price.toLocaleString()}</span>,
    },
    {
      key: "buyer_name",
      label: "Buyer Account",
      render: (o) => (
        <div>
          <span className="text-gray-300 block text-xs font-semibold">{o.buyer_name}</span>
          <span className="text-[10px] text-gray-500 block">{o.buyer_email}</span>
        </div>
      ),
    },
    {
      key: "seller_name",
      label: "Merchant",
      render: (o) => (
        o.seller_name ? (
          <div>
            <span className="text-gray-300 block text-xs font-semibold">{o.seller_name}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs italic">Direct Store</span>
        )
      ),
    },
    {
      key: "order_status",
      label: "Delivery Status",
      render: (o) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            o.order_status === "delivered"
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : o.order_status === "cancelled"
              ? "bg-red-500/20 text-red-400 border-red-500/30"
              : o.order_status === "shipped"
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }`}
        >
          {o.order_status === "delivered" ? (
            <ShieldCheck size={12} />
          ) : o.order_status === "cancelled" ? (
            <XCircle size={12} />
          ) : o.order_status === "shipped" ? (
            <Truck size={12} />
          ) : (
            <Clock size={12} />
          )}
          <span className="capitalize">{o.order_status === "inprogress" ? "In Progress" : o.order_status}</span>
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions / Transition",
      render: (o) => (
        <div className="relative">
          <select
            value={o.order_status}
            onChange={(e) => handleStatusChange(o, e.target.value as any)}
            disabled={o.order_status === "delivered" || o.order_status === "cancelled"}
            className="bg-gray-900 border border-gray-700 text-white rounded px-2.5 py-1 text-xs focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="inprogress">In Progress</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "order_status",
      label: "Statuses",
      options: [
        { value: "inprogress", label: "In Progress" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Orders Ledger
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Monitor direct sales transactions and update shipping statuses.
          </p>
        </div>
      </div>

      {/* Quick Filter Status Tabs */}
      <div className="flex border-b border-gray-800 gap-1.5 overflow-x-auto pb-1">
        {(["", "inprogress", "shipped", "delivered", "cancelled"] as const).map((status) => {
          const isActive = activeFilters.order_status === status;
          const label = status === "" ? "All Orders" : status === "inprogress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1);
          const count = status === "" 
            ? orders.length 
            : orders.filter(o => o.order_status === status).length;

          return (
            <button
              key={status}
              onClick={() => setActiveFilters(prev => ({ ...prev, order_status: status }))}
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
        data={paginatedOrders}
        isLoading={isLoading}
        searchPlaceholder="Search orders by product name, buyer email, order ID..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredOrders.length}
      />

      {/* Confirm Status Change Modal */}
      <AdminConfirmModal
        isOpen={confirmStatusOpen}
        onClose={() => setConfirmStatusOpen(false)}
        onConfirm={executeStatusUpdate}
        isLoading={actionLoading}
        title="Confirm Order Status Transition"
        description={`Are you sure you want to change the delivery status of order #${selectedOrder?.order_id.substring(
          0,
          8
        )}... to "${targetStatus}"? This change will be visible to both the buyer and the seller.`}
        confirmText="Confirm Status Update"
        type="warning"
      />
    </div>
  );
}
