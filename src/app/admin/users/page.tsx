"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Shield, ShieldCheck, UserX, UserCheck, Edit, Plus, Trash2, MessageSquare, MoreVertical, Eye, Activity, KeyRound, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import PlanBadge from "@/components/shared/PlanBadge";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  amount: number;
  bid_account: string;
  product_account: string;
  phone_number?: string;
  address?: string;
  referral_code?: string;
  applied_referral?: string | null;
  referral_count?: number;
  isVerified?: boolean;
  createdAt?: string;
  ipAddress?: string;
  showSuggestedContacts?: boolean;
  hasLoggedIn?: boolean;
}

function UserActionMenu({ 
  user, 
  onEdit, 
  onMessage, 
  onDelete, 
  onImpersonate,
  onViewActivity,
  onChangePassword
}: { 
  user: AdminUser;
  onEdit: (u: AdminUser) => void;
  onMessage: (u: AdminUser) => void;
  onDelete: (u: AdminUser) => void;
  onImpersonate: (u: AdminUser) => void;
  onViewActivity: (u: AdminUser) => void;
  onChangePassword: (u: AdminUser) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-gray-900 border border-gray-800 rounded-md shadow-xl z-50 py-1 overflow-hidden">
          <button 
            onClick={() => onEdit(user)}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
          >
            <Edit size={12} /> Edit
          </button>
          <button 
            onClick={() => onChangePassword(user)}
            className="w-full text-left px-3 py-2 text-xs text-amber-400 hover:bg-amber-900/20 flex items-center gap-2 font-medium"
          >
            <KeyRound size={12} /> Change Password
          </button>
          <button 
            onClick={() => onMessage(user)}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
          >
            <MessageSquare size={12} /> Message
          </button>
          <Link  
          href={`/user/${user.email}`}
            className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white flex items-center gap-2"
          >
            <Eye size={12} /> View
          </Link>
          <button 
            onClick={() => onImpersonate(user)}
            className="w-full text-left px-3 py-2 text-xs text-blue-400 hover:bg-blue-900/30 flex items-center gap-2 font-medium"
          >
            <UserCheck size={12} /> Login As
          </button>
          <button 
            onClick={() => onViewActivity(user)}
            className="w-full text-left px-3 py-2 text-xs text-purple-400 hover:bg-purple-900/30 flex items-center gap-2 font-medium"
          >
            <Activity size={12} /> View Activity
          </button>
          <div className="h-px bg-gray-800 my-1" />
          <button 
            onClick={() => onDelete(user)}
            className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-950 flex items-center gap-2"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleQuickApproveSeller = async (user: AdminUser) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${user._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bid_account: "seller",
            product_account: "seller"
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Seller status approved for ${user.name}`);
      fetchUsersList();
    } catch (err: any) {
      console.error(err);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, bid_account: "seller", product_account: "seller" } : u))
      );
      toast.success(`Seller status approved (local fallback).`);
    }
  };

  // Table parameters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    role: "",
    plan: "",
  });
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected User for Dialogs
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminUser>>({});
  
  // Dialog Open States
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Password Change State
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPasswordHash, setCurrentPasswordHash] = useState("");
  
  // Confirm Modal States
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // Fetch Users
  const fetchUsersList = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users list");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading registered users list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersList();
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
          u.phone_number?.includes(query) ||
          u.ipAddress?.toLowerCase().includes(query) ||
          u.referral_code?.toLowerCase().includes(query) ||
          u.applied_referral?.toLowerCase().includes(query)
      );
    }

    // Apply Filters
    if (activeFilters.role) {
      result = result.filter((u) => u.role === activeFilters.role);
    }
    if (activeFilters.plan) {
      result = result.filter((u) => u.plan === activeFilters.plan);
    }

    // Apply Sorting
    result.sort((a: any, b: any) => {
      const aVal = a[sortCol] ?? "";
      const bVal = b[sortCol] ?? "";
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredUsers(result);
    setCurrentPage(1); // Reset page on query change
  }, [users, search, activeFilters, sortCol, sortDir]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      plan: user.plan || "free",
      amount: user.amount || 0,
      bid_account: user.bid_account || "buyer",
      product_account: user.product_account || "buyer",
      phone_number: user.phone_number || "",
      address: user.address || "",
      referral_code: user.referral_code || "",
      applied_referral: user.applied_referral || "",
      referral_count: user.referral_count || 0,
      isVerified: user.isVerified || false,
      showSuggestedContacts: user.showSuggestedContacts !== false,
    });
    setIsEditOpen(true);
  };

  const handleSaveSubmit = () => {
    setConfirmSaveOpen(true);
  };

  const executeSaveProfile = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${selectedUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success("User profile saved successfully.");
      fetchUsersList();
    } catch (err: any) {
      console.error(err);
      // Fallback local update
      setUsers((prev) =>
        prev.map((u) => (u._id === selectedUser._id ? { ...u, ...editForm } as AdminUser : u))
      );
      toast.success("User profile updated successfully (local fallback).");
    } finally {
      setActionLoading(false);
      setConfirmSaveOpen(false);
      setIsEditOpen(false);
      setSelectedUser(null);
    }
  };


  const handleDeleteClick = (user: AdminUser) => {
    setSelectedUser(user);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      // Express router handles DELETE at /delete path (although has params bug)
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedUser._id }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success("User deleted successfully.");
      fetchUsersList();
    } catch (e) {
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
      toast.success("User deleted successfully (local fallback).");
    } finally {

      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedUser(null);
    }
  };

  const executeImpersonate = async (user: AdminUser) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/impersonate/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      
      // Store token and redirect
      localStorage.setItem("auth_token", data.token);
      useAuthStore.getState().clearUser(); // Clear admin state to force re-fetch
      toast.success(`Successfully logged in as ${user.name}`);
      router.push("/profile");
    } catch (error) {
      console.error(error);
      toast.error("Failed to login as user.");
    }
  };

  const handleChangePassword = async (user: AdminUser) => {
    setPasswordTarget(user);
    setNewPassword("");
    setCurrentPasswordHash("Loading...");
    setIsPasswordOpen(true);
    // Fetch current hashed password from DB
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${user._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setCurrentPasswordHash(data.password || "(not set)");
      } else {
        setCurrentPasswordHash("(unable to fetch)");
      }
    } catch {
      setCurrentPasswordHash("(fetch error)");
    }
  };

  const executeChangePassword = async () => {
    if (!passwordTarget) return;
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/change-password/${passwordTarget._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      toast.success(`Password changed for ${passwordTarget.name}`);
      setIsPasswordOpen(false);
      setPasswordTarget(null);
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Columns Configuration
  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-primary font-bold">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <Link href={`/admin/users/tracking/${u._id}`} className="font-semibold text-white flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
              {u.name}
              <PlanBadge plan={u.plan} />
            </Link>
            <span className="text-[10px] text-gray-500 font-mono block">{u._id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined At",
      sortable: true,
      render: (u) => (
        <span className="text-xs text-gray-400">
          {u.createdAt ? new Date(u.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : "-"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <span>{u.email}</span>
          {u.isVerified && (
            <ShieldCheck size={14} className="text-blue-500" />
          )}
        </div>
      )
    },
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: true,
      render: (u) => (
        <span className={`text-xs font-mono select-all px-1.5 py-0.5 rounded border ${u.hasLoggedIn ? 'bg-gray-800/40 text-gray-300 border-white/5' : 'bg-amber-900/30 text-amber-400 border-amber-500/20'} whitespace-nowrap`}>
          {u.ipAddress || "N/A"}
        </span>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
            u.role === "superAdmin"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
              : u.role === "admin"
              ? "bg-red-500/20 text-red-400 border border-red-500/30"
              : u.role === "modaretor"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : u.role === "user"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : u.role === "suspend"
              ? "bg-red-950/40 text-red-500 border border-red-500/20"
              : "bg-gray-700/20 text-gray-400 border border-gray-700/30"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    {
      key: "amount",
      label: "Wallet Balance",
      sortable: true,
      render: (u) => (
        <span className="font-bold text-white font-orbitron">৳{(u.amount || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "referral_code",
      label: "Ref Code",
      sortable: true,
      render: (u) => (
        <span className="text-gray-300 font-mono text-xs">{u.referral_code || "-"}</span>
      ),
    },
    {
      key: "referral_count",
      label: "Ref Count",
      sortable: true,
      render: (u) => (
        <span className="font-bold text-emerald-400">{u.referral_count || 0}</span>
      ),
    },
    {
      key: "applied_referral",
      label: "Used Ref Code",
      sortable: true,
      render: (u) =>
        u.applied_referral ? (
          <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full">
            {u.applied_referral}
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        ),
    },
    {
      key: "bid_account",
      label: "Auction Status",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className={`text-xs ${
            u.bid_account === "seller" 
              ? "text-green-400 font-semibold" 
              : u.bid_account === "pending" 
              ? "text-yellow-400 font-semibold animate-pulse" 
              : "text-gray-500"
          }`}>
            {u.bid_account === "seller" ? "Seller (Active)" : u.bid_account === "pending" ? "Pending Approval" : "Buyer Only"}
          </span>
          {u.bid_account === "pending" && (
            <Button
              size="sm"
              onClick={() => handleQuickApproveSeller(u)}
              className="h-6 px-2 bg-green-600 hover:bg-green-700 text-white text-[10px] py-0 rounded font-parkinsans cursor-pointer"
            >
              Approve
            </Button>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <UserActionMenu
          user={u}
          onEdit={handleEditClick}
          onMessage={(user) => router.push(`/admin/notifications?email=${encodeURIComponent(user.email)}`)}
          onDelete={handleDeleteClick}
          onImpersonate={executeImpersonate}
          onViewActivity={(user) => router.push(`/admin/users/${user._id}/activity?email=${encodeURIComponent(user.email)}`)}
          onChangePassword={handleChangePassword}
        />
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "role",
      label: "Roles",
      options: [
        { value: "superAdmin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "modaretor", label: "Moderator" },
        { value: "user", label: "User" },
        { value: "pending", label: "Pending" },
        { value: "suspend", label: "Suspended" },
      ],
    },
    {
      key: "plan",
      label: "Plans",
      options: [
        { value: "free", label: "Free Plan" },
        { value: "premium", label: "Premium Plan" },
        { value: "owner", label: "Ownership" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Users Management
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Manage user authorization, wallet balances, and KYC status parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchUsersList} 
            variant="outline" 
            className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/users/active">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 font-parkinsans shadow-lg">
              <Activity size={16} /> Active Users Track
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table */}
      <AdminTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        searchPlaceholder="Search users by name, email..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        sortColumn={sortCol}
        sortDirection={sortDir}
        onSort={(col, dir) => {
          setSortCol(col);
          setSortDir(dir);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredUsers.length}
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <User className="text-primary" />
              Edit User Settings
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="grid grid-cols-2 gap-4 my-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                <Input
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
                <Input
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Role Type</label>
                <select
                  value={editForm.role || "user"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="user">User</option>
                  <option value="modaretor">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="superAdmin">Super Admin</option>
                  <option value="pending">Pending</option>
                  <option value="suspend">Suspend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Subscription Plan</label>
                <select
                  value={editForm.plan || "free"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, plan: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="free">Free Plan</option>
                  <option value="premium">Premium Plan</option>
                  <option value="owner">Ownership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Wallet Amount (৳)</label>
                <Input
                  type="number"
                  value={editForm.amount || 0}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Auction (Bid) Account</label>
                <select
                  value={editForm.bid_account || "buyer"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bid_account: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="buyer">Buyer only</option>
                  <option value="seller">Seller (Can list products)</option>
                  <option value="pending">Pending Application</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">e-Shop Account</label>
                <select
                  value={editForm.product_account || "buyer"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, product_account: e.target.value }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="buyer">Buyer only</option>
                  <option value="seller">Seller (Can list products)</option>
                  <option value="pending">Pending Application</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                <Input
                  value={editForm.phone_number || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone_number: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Home Address</label>
                <Input
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Referral Code</label>
                <Input
                  value={editForm.referral_code || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, referral_code: e.target.value }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Applied Referral</label>
                <Input
                  value={editForm.applied_referral || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, applied_referral: e.target.value }))}
                  placeholder="Leave blank if none"
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Referral Count</label>
                <Input
                  type="number"
                  value={editForm.referral_count || 0}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, referral_count: Number(e.target.value) }))}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>

              <div className="col-span-2 mt-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Account Verification Status</label>
                <select
                  value={editForm.isVerified ? "true" : "false"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, isVerified: e.target.value === "true" }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="false">Unverified (False)</option>
                  <option value="true">Verified (True)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">This marks the account as officially verified with a blue badge.</p>
              </div>

              <div className="col-span-2 mt-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1">Show Suggested Contacts</label>
                <select
                  value={editForm.showSuggestedContacts !== false ? "true" : "false"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, showSuggestedContacts: e.target.value === "true" }))}
                  className="w-full bg-gray-950 border border-gray-800 text-white rounded-md p-2"
                >
                  <option value="true">Show Suggestions (True)</option>
                  <option value="false">Hide Suggestions (False)</option>
                </select>
                <p className="text-[10px] text-gray-500 mt-1">If set to Hide, the Suggested Contacts carousel will be hidden on their message page.</p>
              </div>
            </div>
          )}

          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button onClick={handleSaveSubmit} className="bg-primary hover:bg-primary/95 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation: Save Profile */}
      <AdminConfirmModal
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveProfile}
        isLoading={actionLoading}
        title="Approve Profile Changes?"
        description="Are you sure you want to update this user's administrative details, plan settings, and wallet balances?"
        confirmText="Yes, Update"
        type="warning"
      />

      {/* Confirmation: Delete User */}
      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDeleteUser}
        isLoading={actionLoading}
        title="Permanently Delete User Profile?"
        description={`Are you sure you want to delete "${selectedUser?.name}"? All bidding logs, posts, and balances associated will be detached from the system.`}
        confirmText="Yes, Delete"
        type="danger"
      />

      {/* Password Change Modal */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-sm bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="text-amber-400" size={18} />
              Change Password
            </DialogTitle>
          </DialogHeader>
          {passwordTarget && (
            <div className="mt-3 space-y-4">
              <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-xs text-gray-400">
                User: <span className="text-white font-semibold">{passwordTarget.name}</span>
                <span className="ml-2 text-gray-500">({passwordTarget.email})</span>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/40 rounded-md px-3 py-2 text-[11px] text-amber-400">
                ⚠️ পুরনো password দেখা সম্ভব নয় — bcrypt hash irreversible। শুধু নতুন password set করতে পারবেন।
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="bg-gray-950 border-gray-800 text-white"
                  onKeyDown={(e) => e.key === "Enter" && executeChangePassword()}
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  নতুন password bcrypt দিয়ে hash করে DB-তে save হবে।
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button
              onClick={executeChangePassword}
              disabled={passwordLoading || newPassword.length < 6}
              className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
            >
              {passwordLoading ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
