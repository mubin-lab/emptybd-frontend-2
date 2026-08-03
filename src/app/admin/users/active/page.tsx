"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Activity, ArrowLeft, RefreshCw, Radio } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ActiveUser {
  _id: any;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  lastActive: string | null;
  isOnline: boolean;
}

export default function ActiveUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<ActiveUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ActiveUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search parameters
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch online & active users status
  const fetchActiveUsers = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/activity/admin/online-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to load active users data");
      const data = await res.json();
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load active users list.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and automatic refresh interval (every 10 seconds)
  useEffect(() => {
    fetchActiveUsers();

    // Polling enabled with 10s interval for real-time updates while managing API load
    const interval = setInterval(() => {
      fetchActiveUsers(true); // Quiet background refresh
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...users];

    // Apply Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.name?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset page on query change
  }, [users, search]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Helper for human-readable time elapsed
  const getRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Columns Configuration
  const columns: Column<ActiveUser>[] = [
    {
      key: "name",
      label: "User",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-primary font-bold text-sm relative">
            {u.name?.charAt(0).toUpperCase()}
            {u.isOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-gray-900 animate-pulse" />
            )}
          </div>
          <div>
            <span className="font-semibold text-white block hover:text-primary transition-colors cursor-pointer">
              {u.name}
            </span>
            <span className="text-[10px] text-gray-500 font-mono block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "isOnline",
      label: "Connection Status",
      render: (u) => (
        <div className="flex items-center gap-2">
          {u.isOnline ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <Radio size={10} /> Online
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/10 text-gray-400 border border-gray-800">
              Offline
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lastActive",
      label: "Last Active Time",
      render: (u) => (
        <div className="space-y-0.5">
          <span className="text-sm text-gray-200 font-medium">{getRelativeTime(u.lastActive)}</span>
          {u.lastActive && (
            <span className="text-[10px] text-gray-500 font-mono block">
              {new Date(u.lastActive).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      label: "System Role",
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
            u.role === "superAdmin"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : u.role === "admin"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : u.role === "modaretor"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : u.role === "user"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gray-700/20 text-gray-400 border border-gray-700/30"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Details",
      render: (u) => (
        <Button
          size="sm"
          onClick={() => {
            // Find user details by email is supported in activities search
            router.push(`/admin/users/${u._id}/activity?email=${u.email}`);
          }}
          className="h-8 bg-gray-800 hover:bg-gray-700 text-white font-parkinsans text-xs border border-gray-700"
        >
          View in Manager
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/users">
            <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white p-2.5 rounded-full">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white flex items-center gap-2">
              <Activity className="text-purple-500" /> Active Users Track
            </h1>
            <p className="text-sm text-gray-400 font-parkinsans mt-1">
              Real-time monitoring of currently online users and chronological user activity logs.
            </p>
          </div>
        </div>

        <Button
          onClick={() => fetchActiveUsers(true)}
          disabled={isRefreshing}
          className="bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white flex items-center gap-2 font-parkinsans"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Table view */}
      <AdminTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        searchPlaceholder="Search active users by name, email..."
        searchValue={search}
        onSearchChange={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredUsers.length}
      />
    </div>
  );
}
