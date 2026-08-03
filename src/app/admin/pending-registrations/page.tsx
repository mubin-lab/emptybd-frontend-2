"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldAlert, Send, Trash2, RefreshCw } from "lucide-react";

interface PendingUser {
  _id: string;
  name: string;
  email: string;
  phone_number: string;
  createdAt: string;
  adminOtp?: string;
}

export default function PendingRegistrationsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Search and Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load pending registrations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // Filter and pagination
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone_number?.includes(search)
  );

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // OTP Handling
  const handleOpenOtp = (user: PendingUser) => {
    setSelectedUser(user);
    // Auto generate 4 digit OTP for convenience
    setOtpInput(Math.floor(1000 + Math.random() * 9000).toString());
    setIsOtpModalOpen(true);
  };

  const handleSendOtp = async () => {
    if (!selectedUser || !otpInput) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/pending/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedUser._id, otp: otpInput }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`OTP ${otpInput} sent successfully! (Saved to database)`);
      setIsOtpModalOpen(false);
      fetchPendingUsers();
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Handling
  const handleOpenReject = (user: PendingUser) => {
    setSelectedUser(user);
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/pending/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("User registration rejected and deleted.");
      setIsRejectModalOpen(false);
      fetchPendingUsers();
    } catch (err) {
      toast.error("Failed to reject user.");
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column<PendingUser>[] = [
    {
      key: "name",
      label: "Name",
      render: (u) => <span className="font-semibold text-white">{u.name}</span>,
    },
    {
      key: "phone_number",
      label: "Phone / Email",
      render: (u) => (
        <div>
          <span className="block font-medium">{u.phone_number}</span>
          <span className="text-xs text-gray-400">{u.email}</span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Registered At",
      render: (u) => (
        <span className="text-xs text-gray-400">
          {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      key: "adminOtp",
      label: "OTP Status",
      render: (u) => (
        <span className={`text-xs px-2 py-1 rounded font-medium ${u.adminOtp ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
          {u.adminOtp ? `Sent: ${u.adminOtp}` : "Waiting"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleOpenOtp(u)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 text-xs"
          >
            <Send size={12} /> Send OTP
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenReject(u)}
            className="h-8 bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 text-xs"
          >
            <Trash2 size={12} /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white flex items-center gap-3">
            <ShieldAlert className="text-yellow-500" />
            Pending Registrations
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Manually verify new user registrations by generating and sending them an OTP.
          </p>
        </div>
        <Button 
          onClick={fetchPendingUsers} 
          variant="outline" 
          className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        searchPlaceholder="Search by name or phone..."
        searchValue={search}
        onSearchChange={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredUsers.length}
      />

      {/* Send OTP Modal */}
      <Dialog open={isOtpModalOpen} onOpenChange={setIsOtpModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Send Verification OTP</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <p className="text-sm text-gray-400 mb-4">
              Generate a 4-digit OTP for <strong>{selectedUser?.name}</strong>. Provide this code to the user manually so they can verify their account.
            </p>
            <label className="block text-xs font-semibold text-gray-400 mb-1">4-Digit OTP</label>
            <Input
              type="text"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="bg-gray-950 border-gray-800 text-white text-xl tracking-[10px] text-center font-bold"
              maxLength={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOtpModalOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button onClick={handleSendOtp} disabled={actionLoading || otpInput.length < 4} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save & Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <AdminConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleReject}
        isLoading={actionLoading}
        title="Reject Registration?"
        description={`Are you sure you want to reject and delete the registration request for "${selectedUser?.name}"?`}
        confirmText="Yes, Reject"
        type="danger"
      />
    </div>
  );
}
