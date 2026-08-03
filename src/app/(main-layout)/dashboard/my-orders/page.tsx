"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { toast } from "sonner";
import {
  ShoppingBag,
  Gavel,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Calendar,
  User,
  DollarSign,
  Store,
} from "lucide-react";
import { BiArrowBack } from "react-icons/bi";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

interface Order {
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  order_status: string;
  ordered_at: { $date: string } | string;
  seller_id: string;
  seller_name: string;
}

interface Bid {
  _id?: string;
  bid_id?: string;
  bid_name?: string;
  name?: string;
  title?: string;
  amount?: number;
  current_price?: number;
  bid_amount?: number;
  status?: string;
  bid_status?: string;
  created_at?: { $date: string } | string;
  createdAt?: { $date: string } | string;
  product?: {
    name?: string;
    title?: string;
    image?: string;
  };
  [key: string]: unknown;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  img?: string;
  orders: Order[];
}

function formatDate(dateValue: { $date: string } | string | undefined): string {
  if (!dateValue) return "N/A";
  const dateStr = typeof dateValue === "object" ? dateValue.$date : dateValue;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

function getStatusBadge(status: string) {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower === "completed" || statusLower === "delivered") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
        <CheckCircle size={12} />
        {status}
      </span>
    );
  }
  if (statusLower === "inprogress" || statusLower === "processing" || statusLower === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
        <Clock size={12} />
        {status}
      </span>
    );
  }
  if (statusLower === "cancelled" || statusLower === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
        <XCircle size={12} />
        {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
      <Clock size={12} />
      {status || "Pending"}
    </span>
  );
}

export default function MyOrdersPage() {
  const { user, fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "bids">("orders");
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    setLoading(false);
  }, [user, fetchUser]);

  // Fetch bids from API
  useEffect(() => {
    if (!user) return;

    const fetchMyBids = async () => {
      setLoadingBids(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/user/my-bids`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch bids");
        const data = await res.json();
        setBids(data);
      } catch (err) {
        console.error("Error fetching bids:", err);
        toast.error("Failed to load bids");
      } finally {
        setLoadingBids(false);
      }
    };

    fetchMyBids();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  if (!user) {
    return <Unauthorized description="Please login to view your orders and bids" />;
  }

  const orders: Order[] = user.orders || [];

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto md:py-6">
      {/* Header */}
      {/* <div className="flex items-center gap-3 mb-6">
        <Link prefetch={false}
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
        >
          <BiArrowBack className="text-lg" />
        <span className="text-sm">Back to Dashboard</span>
        </Link>
      </div> */}

      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-white font-parkinsans flex items-center gap-2">
          <ShoppingBag className="text-blue-400" />
          My Orders & Bids
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your product orders and auction bids
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Package size={16} />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "bids"
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          <Gavel size={16} />
          My Bids ({loadingBids ? "..." : bids.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Empty
              title="No Orders Yet"
              description="You haven't placed any orders yet. Browse our products and make your first purchase!"
              icon={<ShoppingBag size={48} className="text-gray-600" />}
            >
              <Link prefetch={false} href="/e-commerce-products">
                <Button className="mt-4 bg-black text-white rounded-sm lg:rounded-md hover:bg-gray-900">
                  Browse Products
                </Button>
              </Link>
            </Empty>
          ) : (
            <div className="grid gap-4">
              {orders.map((order, index) => (
                <div
                  key={`${order.product_id}-${index}`}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 md:p-5 hover:border-gray-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Order Icon */}
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="text-blue-400" size={24} />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-white font-medium line-clamp-2">
                            {order.product_name}
                          </h3>
                          <p className="text-gray-500 text-xs mt-1">
                            Order #{order.product_id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        {getStatusBadge(order.order_status)}
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <DollarSign size={12} />
                            Total Price
                          </p>
                          <p className="text-white font-medium mt-0.5">
                            ৳{order.total_price?.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Package size={12} />
                            Quantity
                          </p>
                          <p className="text-white font-medium mt-0.5">
                            {order.quantity}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Store size={12} />
                            Seller
                          </p>
                          <p className="text-white font-medium mt-0.5 truncate">
                            {order.seller_name || "Unknown"}
                          </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-2.5">
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <Calendar size={12} />
                            Ordered At
                          </p>
                          <p className="text-white font-medium mt-0.5 text-xs">
                            {formatDate(order.ordered_at)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link prefetch={false} href={`/e-commerce-products/${order.product_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View Product
                            <ChevronRight size={14} className="ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bids Tab */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          {loadingBids ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <SpinnerCustom />
            </div>
          ) : bids.length === 0 ? (
            <Empty
              title="No Bids Yet"
              description="You haven't placed any bids on auctions yet. Browse active bids and start bidding!"
              icon={<Gavel size={48} className="text-gray-600" />}
            >
              <Link prefetch={false} href="/bid">
                <Button className="mt-4 bg-black text-white rounded-sm lg:rounded-md hover:bg-gray-900">
                  Browse Auctions
                </Button>
              </Link>
            </Empty>
          ) : (
            <div className="grid gap-4">
              {bids.map((bid, index) => {
                // Get bid name from various possible fields
                const bidName = bid.product?.name || bid.product?.title || bid.name || bid.title || bid.bid_name || `Bid #${index + 1}`;
                // Get bid ID
                const bidId = bid._id || bid.bid_id || "";
                // Get bid amount
                const bidAmount = bid.amount || bid.bid_amount || bid.current_price || 0;
                // Get bid status
                const bidStatus = bid.status || bid.bid_status || "pending";
                // Get bid date
                const bidDate = bid.created_at || bid.createdAt;

                return (
                  <div
                    key={bidId || index}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 md:p-5 hover:border-gray-600 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Bid Icon or Product Image */}
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {bid.product?.image ? (
                          <BackendImage
                            src={bid.product.image}
                            alt={bidName}
                            className="w-full h-full object-cover"
                           />
                        ) : (
                          <Gavel className="text-purple-400" size={24} />
                        )}
                      </div>

                      {/* Bid Details */}
                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Header */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-white font-medium line-clamp-2">
                              {bidName}
                            </h3>
                            <p className="text-gray-500 text-xs mt-1">
                              Bid ID: {bidId ? bidId.slice(-8).toUpperCase() : "N/A"}
                            </p>
                          </div>
                          {getStatusBadge(bidStatus)}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                          {bidAmount > 0 && (
                            <div className="bg-gray-800/50 rounded-lg p-2.5">
                              <p className="text-gray-500 text-xs flex items-center gap-1">
                                <DollarSign size={12} />
                                Your Bid
                              </p>
                              <p className="text-white font-medium mt-0.5">
                                ৳{bidAmount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          <div className="bg-gray-800/50 rounded-lg p-2.5">
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                              <Calendar size={12} />
                              Bid Date
                            </p>
                            <p className="text-white font-medium mt-0.5 text-xs">
                              {formatDate(bidDate)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        {bidId && (
                          <div className="flex gap-2 pt-2">
                            <Link prefetch={false} href={`/bid/all-selling-product/${bidId}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                View Bid Details
                                <ChevronRight size={14} className="ml-1" />
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      <PageHelpPanel pageKey="orders" />
    </div>
  );
}
