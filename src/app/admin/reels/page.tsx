"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Video, Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ReelItem {
  _id: string;
  videoId?: string;
  url: string;
  title: string;
  description: string;
  order: number;
  status: string;
  createdAt: string;
}

export default function AdminReelsPage() {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [filteredReels, setFilteredReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table parameters
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Actions states
  const [selectedReel, setSelectedReel] = useState<ReelItem | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
    order: 1,
    status: "active"
  });
  
  // Delete Modal State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all reels
  const fetchAllReels = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reels/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch reels");
      const data = await res.json();
      setReels(Array.isArray(data.data) ? data.data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading reels data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReels();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...reels];

    // Search by URL or Caption
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.url?.toLowerCase().includes(query) ||
          r.title?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
      );
    }

    // Sort by order ascending
    result.sort((a, b) => a.order - b.order);

    setFilteredReels(result);
    setCurrentPage(1);
  }, [reels, search]);

  // Pagination
  const totalPages = Math.ceil(filteredReels.length / pageSize);
  const paginatedReels = filteredReels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // --- HANDLERS ---
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedReel(null);
    const nextOrder = reels.length > 0 ? Math.max(...reels.map(r => r.order)) + 1 : 1;
    setFormData({
      url: "",
      title: "",
      description: "",
      order: nextOrder,
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (item: ReelItem) => {
    setIsEditing(true);
    setSelectedReel(item);
    setFormData({
      url: item.url || "",
      title: item.title || "",
      description: item.description || "",
      order: item.order || 1,
      status: item.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.url.trim()) {
      toast.error("Reel URL is required.");
      return;
    }
    if (!formData.url.includes("youtube.com") && !formData.url.includes("youtu.be")) {
      toast.error("Please enter a valid YouTube Shorts or Video URL.");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    const method = isEditing ? "PUT" : "POST";
    const endpoint = isEditing 
      ? `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reels/${selectedReel?._id}` 
      : `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reels`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save reel");

      toast.success(isEditing ? "Reel updated successfully!" : "Reel added successfully!");
      fetchAllReels();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save reel.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (item: ReelItem) => {
    setSelectedReel(item);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedReel) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/reels/${selectedReel._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete reel");

      toast.success("Reel deleted successfully!");
      fetchAllReels();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete reel.");
    } finally {
      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedReel(null);
    }
  };

  // Columns Definitions
  const columns: Column<ReelItem>[] = [
    {
      key: "order",
      label: "Order",
      render: (r) => (
        <span className="font-mono text-gray-300 font-semibold bg-gray-800 px-2 py-1 rounded">{r.order}</span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (r) => (
        <span className="text-sm font-medium text-gray-200 line-clamp-1 max-w-[150px]">{r.title || "-"}</span>
      ),
    },
    {
      key: "url",
      label: "Reel URL",
      render: (r) => (
        <Link href={r.url} target="_blank" className="text-primary hover:underline text-sm truncate max-w-[200px] flex items-center gap-1">
          {r.url.substring(0, 30)}... <ExternalLink size={12} />
        </Link>
      ),
    },
    {
      key: "videoId",
      label: "Video ID",
      render: (r) => (
        <span className="text-xs font-mono text-gray-400 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">{r.videoId || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md border ${
          r.status === "active" 
            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
            : "border-gray-500/30 text-gray-400 bg-gray-500/10"
        }`}>
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleEditClick(r)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-2.5 gap-1.5"
          >
            <Pencil size={13} />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(r)}
            className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2.5 gap-1.5"
          >
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white flex items-center gap-2">
            <Video className="text-primary" /> Reels Management
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Manage public YouTube Shorts for the Reels tab.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} className="bg-primary hover:bg-primary-hover text-white flex items-center gap-2">
          <Plus size={16} /> Add New Reel
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={paginatedReels}
        isLoading={isLoading}
        searchPlaceholder="Search by URL or Title..."
        searchValue={search}
        onSearchChange={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredReels.length}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing ? <Pencil className="text-blue-500" /> : <Video className="text-primary" />}
              {isEditing ? "Edit Reel" : "Add New Reel"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">YouTube URL <span className="text-red-500">*</span></label>
              <Input
                type="text"
                placeholder="https://www.youtube.com/shorts/..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white"
              />
              <p className="text-[10px] text-gray-500 mt-1">Must be a valid YouTube Shorts or Video URL.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Title (Optional)</label>
              <Input
                type="text"
                placeholder="Awesome short..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">Description (Optional)</label>
              <Input
                type="text"
                placeholder="Details about this short..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Display Order</label>
                <Input
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="bg-gray-950 border-gray-800 text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-md p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-secondary"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-gray-800" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary-hover text-white" disabled={actionLoading}>
              {actionLoading ? "Saving..." : (isEditing ? "Save Changes" : "Add Reel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        isLoading={actionLoading}
        title="Confirm Reel Deletion"
        description="Are you sure you want to delete this reel? This action cannot be undone."
        confirmText="Yes, Delete Reel"
        type="danger"
      />
    </div>
  );
}
