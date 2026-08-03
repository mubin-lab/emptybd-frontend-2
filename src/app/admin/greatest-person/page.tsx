"use client";
import React, { useEffect, useState } from "react";
import { Check, X, Pencil, Trash2, Eye, RefreshCw, Plus } from "lucide-react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";
import BackendImage from "@/components/shared/BackendImage";

interface GreatestPerson {
  _id: string;
  img?: string[];
  title?: { English?: string; bangla?: string };
  description?: { English?: string; bangla?: string };
  location?: { English?: string; bangla?: string };
  isactive?: boolean;
  like?: number;
  share?: number;
  comment?: any[];
  createdAt?: string;
}

export default function GreatestPersonAdminPage() {
  const [people, setPeople] = useState<GreatestPerson[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<GreatestPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Table parameters
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Actions states
  const [selectedPerson, setSelectedPerson] = useState<GreatestPerson | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch all people
  const fetchAllPeople = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/greatest-person`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setPeople(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading greatest person data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPeople();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...people];
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.English?.toLowerCase().includes(query) ||
          p.title?.bangla?.toLowerCase().includes(query)
      );
    }
    setFilteredPeople(result);
  }, [people, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Pagination
  const totalPages = Math.ceil(filteredPeople.length / pageSize);
  const paginatedPeople = filteredPeople.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // --- DELETE HANDLER ---
  const handleDeleteClick = (person: GreatestPerson) => {
    setSelectedPerson(person);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedPerson) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/greatest-person/${selectedPerson._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to delete person");
      toast.success("Person deleted successfully!");
      fetchAllPeople();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete person.");
    } finally {
      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedPerson(null);
    }
  };

  // --- INLINE STATUS CHANGE ---
  const handleStatusChange = async (person: GreatestPerson, newStatus: boolean) => {
    setPeople((prev) =>
      prev.map((p) => (p._id === person._id ? { ...p, isactive: newStatus } : p))
    );
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/greatest-person/${person._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isactive: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Status update failed");
      toast.success(`Status updated to ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
      setPeople((prev) =>
        prev.map((p) => (p._id === person._id ? { ...p, isactive: person.isactive } : p))
      );
    }
  };

  const columns: Column<GreatestPerson>[] = [
    {
      key: "img",
      label: "Image",
      render: (p) => (
        p.img && p.img.length > 0 ? (
          <BackendImage src={p.img[0]} alt="person" className="h-10 w-16 object-cover rounded border border-gray-800" />
        ) : (
          <span className="text-xs text-gray-500 italic">No image</span>
        )
      ),
    },
    {
      key: "title",
      label: "Name (English / Bangla)",
      render: (p) => (
        <div>
          <span className="font-semibold text-white block">{p.title?.English || "N/A"}</span>
          <span className="text-xs text-gray-400 block">{p.title?.bangla || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (p) => (
        <span className="text-sm text-gray-300">{p.location?.English || "N/A"}</span>
      ),
    },
    {
      key: "stats",
      label: "Engagement",
      render: (p) => (
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          <span>Likes: {p.like || 0}</span>
          <span>Shares: {p.share || 0}</span>
          <span>Comments: {p.comment?.length || 0}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => {
        const isActive = p.isactive;
        return (
          <button
            onClick={() => handleStatusChange(p, !isActive)}
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
              isActive 
                ? "bg-green-900/40 text-green-400 border-green-500/50 hover:bg-green-900/60" 
                : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </button>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(p)}
            className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2.5 gap-1.5"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-wide text-white">
            Greatest Person Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your greatest person records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchAllPeople} 
            variant="outline" 
            className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/admin/greatest-person/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} className="mr-2" />
              Create New
            </Button>
          </Link>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={paginatedPeople}
        isLoading={isLoading}
        searchPlaceholder="Search by name..."
        searchValue={search}
        onSearchChange={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredPeople.length}
      />

      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        isLoading={actionLoading}
        title="Confirm Deletion"
        description={`Are you sure you want to delete ${selectedPerson?.title?.English}? This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
      />
    </div>
  );
}
