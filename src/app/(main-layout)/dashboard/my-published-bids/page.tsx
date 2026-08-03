"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import { BiEdit, BiTrash, BiDetail } from "react-icons/bi";
import { toast } from "sonner";
import { Gavel, Eye, Users } from "lucide-react";

interface BidPost {
  _id: string | { $oid: string };
  product: {
    title: string;
    image_url: string;
    video_url: string | null;
    base_price: number;
    description?: string;
  };
  seller?: {
    seller_id: string;
    email: string;
    seller_img?: string;
    seller_name: string;
    seller_plan?: string;
    selling_status?: string;
  };
  start_bid: number;
  bidding_price: number;
  start_bid_time: string;
  end_bid_time: string;
  currency: string;
  user_bidded: string[];
  status: "draft" | "active" | "ended";
  created_at: string;
  updated_at: string;
  create_date?: { $date: string };
  update_date?: { $date: string };
}

export default function MyPublishedBidsPage() {
  const [bids, setBids] = useState<BidPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { user } = useAuthStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/by-email/${user?.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch bids");
      const data = await res.json();
      setBids(data);
    } catch (err) {
      console.error("Error fetching bids:", err);
      toast.error("Failed to load your bids");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bidId: string) => {
    if (!token) return;

    setDeleting(bidId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/bid/delete/${bidId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Bid deleted successfully");
      setBids(bids.filter((b) => b._id !== bidId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete bid");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "ended":
        return "bg-red-500/20 text-red-400";
      case "draft":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getBidId = (bid: BidPost): string => {
    if (typeof bid._id === "string") return bid._id;
    return bid._id.$oid;
  };

  const isBidActive = (endTime: string) => {
    return new Date(endTime) > new Date();
  };

  if (loading) return <SpinnerCustom />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
            <Gavel className="w-6 h-6" />
            My Published Bids
          </h1>
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
            Manage your auction listings and track bidding activity
          </p>
        </div>
        <Link prefetch={false}
          href="/bid/create-bid" 
        className="ml-auto"
        >
          <Button>
 + Create Bid
          </Button>
        </Link>
      </div>

      {/* Bids - Mobile Cards */}
      {bids.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">  
        <Empty description="No bids found. Start by creating a new bid listing!" />
                </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {bids.map((bid) => (
              <div key={getBidId(bid)} className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                {/* Header with image and title */}
                <div className="flex items-start gap-3">
                  {bid.product.image_url ? (
                    <BackendImage
                      src={bid.product.image_url}
                      alt={bid.product.title}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                     />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Gavel size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white line-clamp-2">{bid.product.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        bid.status
                      )}`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>

                {/* Price info */}
                <div className="grid grid-cols-2 gap-3 py-2 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Base Price</p>
                    <p className="text-white font-orbitron">{bid.product.base_price.toFixed(2)}৳</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Bid</p>
                    <p className="text-green-400 font-orbitron font-semibold">
                      {bid.bidding_price.toFixed(2)}৳
                    </p>
                  </div>
                </div>

                {/* Bidders and end time */}
                <div className="flex items-center justify-between py-2 border-t border-gray-700">
                  <div className="flex items-center gap-1 text-gray-300">
                    <Users size={14} />
                    <span className="text-sm">{bid.user_bidded.length} bidders</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm ${
                        isBidActive(bid.end_bid_time) ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isBidActive(bid.end_bid_time) ? "Active" : "Ended"}
                    </span>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.end_bid_time).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
                  <Link prefetch={false} href={`/bid/all-selling-product/${getBidId(bid)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <Eye size={14} className="mr-1" /> View
                    </Button>
                  </Link>
                  {/* <Link prefetch={false} href={`/bid/edit/${getBidId(bid)}`}>
                    <Button size="sm" variant="outline" className="h-8 text-xs">
                      <BiEdit size={14} className="mr-1" /> Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(getBidId(bid))}
                    disabled={deleting === getBidId(bid)}
                    className="h-8 text-xs"
                  >
                    <BiTrash size={14} />
                  </Button> */}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-gray-900/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Product</TableHead>
                  <TableHead className="text-gray-400">Base Price</TableHead>
                  <TableHead className="text-gray-400">Current Bid</TableHead>
                  <TableHead className="text-gray-400">Bidders</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">End Time</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.map((bid) => (
                  <TableRow key={getBidId(bid)} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {bid.product.image_url ? (
                          <BackendImage
                            src={bid.product.image_url}
                            alt={bid.product.title}
                            className="w-12 h-12 rounded-md object-cover"
                           />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center">
                            <Gavel size={20} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white line-clamp-1">
                            {bid.product.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(bid.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-orbitron">
                      {bid.product.base_price.toFixed(2)}৳
                    </TableCell>
                    <TableCell className="text-green-400 font-orbitron font-semibold">
                      {bid.bidding_price.toFixed(2)}৳
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users size={14} />
                        <span>{bid.user_bidded.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          bid.status
                        )}`}
                      >
                        {bid.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm ${
                          isBidActive(bid.end_bid_time)
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {isBidActive(bid.end_bid_time) ? "Active" : "Ended"}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(bid.end_bid_time).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link prefetch={false} href={`/bid/all-selling-product/${getBidId(bid)}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            title="View Bid"
                          >
                            <Eye size={16} />
                          </Button>
                        </Link>
                        {/* <Link prefetch={false} href={`/bid/edit/${getBidId(bid)}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                            title="Edit"
                          >
                            <BiEdit size={16} />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(getBidId(bid))}
                          disabled={deleting === getBidId(bid)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                          title="Delete"
                        >
                          <BiTrash size={16} />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
