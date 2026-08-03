"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Check, X, ShieldAlert } from "lucide-react";
import AdminTable, { Column } from "@/components/admin/AdminTable";

interface Package {
  _id: string;
  title: string;
  price: number;
  features: string[];
  type: string;
}

interface PackageRequest {
  _id: string;
  user_email: string;
  user_name: string;
  user_img: string;
  package_id: string;
  package_title: string;
  package_type: string;
  price_paid: number;
  status: string;
  createdAt: string;
}

export default function AdminPackagesPage() {
  const [activeTab, setActiveTab] = useState<"packages" | "requests">("packages");
  
  // Data States
  const [packages, setPackages] = useState<Package[]>([]);
  const [requests, setRequests] = useState<PackageRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Package Modal States
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgType, setPkgType] = useState("premium");
  const [pkgFeatures, setPkgFeatures] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      if (activeTab === "packages") {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages`);
        if (res.ok) setPackages(await res.json());
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setRequests(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Handle Package Submission (Create/Edit)
  const handlePackageSubmit = async () => {
    if (!pkgTitle || !pkgPrice || !pkgType) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    
    const featureArray = pkgFeatures.split("\n").filter(f => f.trim() !== "");
    const payload = {
      title: pkgTitle,
      price: Number(pkgPrice),
      type: pkgType,
      features: featureArray
    };

    try {
      const url = editingPackage 
        ? `${process.env.NEXT_PUBLIC_NODE_API_URL}/packages/${editingPackage._id}` 
        : `${process.env.NEXT_PUBLIC_NODE_API_URL}/packages`;
        
      const method = editingPackage ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save package");
      
      toast.success(`Package ${editingPackage ? "updated" : "created"} successfully`);
      setIsPackageModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save package");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Package Deletion
  const handleDeletePackage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete package");
      toast.success("Package deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete package");
    }
  };

  // Handle Request Status Update
  const handleRequestStatus = async (id: string, status: "approved" | "rejected") => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/packages/requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Request ${status} successfully`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update request");
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setPkgTitle(pkg.title);
    setPkgPrice(pkg.price.toString());
    setPkgType(pkg.type);
    setPkgFeatures(pkg.features.join("\n"));
    setIsPackageModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPackage(null);
    setPkgTitle("");
    setPkgPrice("");
    setPkgType("premium");
    setPkgFeatures("");
    setIsPackageModalOpen(true);
  };

  // Columns for Packages
  const packageColumns: Column<Package>[] = [
    { key: "title", label: "Title", render: (p) => <span className="font-semibold text-white">{p.title}</span> },
    { key: "price", label: "Price", render: (p) => <span className="text-emerald-400 font-mono">৳{p.price}</span> },
    { key: "type", label: "Type", render: (p) => <span className="uppercase text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">{p.type}</span> },
    { key: "features", label: "Features", render: (p) => <span className="text-gray-400 text-xs">{p.features.length} features</span> },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEditModal(p)} className="bg-blue-600 hover:bg-blue-700 h-8 px-2.5">
            <Pencil size={14} />
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleDeletePackage(p._id)} className="h-8 px-2.5">
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  // Columns for Requests
  const requestColumns: Column<PackageRequest>[] = [
    { 
      key: "user", 
      label: "User", 
      render: (r) => (
        <div>
          <div className="font-semibold text-white">{r.user_name || "Unknown"}</div>
          <div className="text-xs text-gray-400">{r.user_email}</div>
        </div>
      ) 
    },
    { 
      key: "package", 
      label: "Requested Package", 
      render: (r) => (
        <div>
          <div className="text-blue-400">{r.package_title}</div>
          <div className="text-xs text-gray-500 uppercase">{r.package_type}</div>
        </div>
      ) 
    },
    { 
      key: "price_paid", 
      label: "Amount Paid", 
      render: (r) => <span className="text-emerald-400 font-mono font-bold">৳{r.price_paid}</span> 
    },
    { 
      key: "status", 
      label: "Status", 
      render: (r) => (
        <span className={`px-2.5 py-1 text-xs rounded-full font-semibold capitalize ${
          r.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
          r.status === 'approved' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
          'bg-red-500/10 text-red-500 border border-red-500/20'
        }`}>
          {r.status}
        </span>
      ) 
    },
    { 
      key: "date", 
      label: "Date", 
      render: (r) => <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span> 
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => r.status === "pending" ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => handleRequestStatus(r._id, "approved")} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 h-8 px-2.5 flex items-center gap-1">
            <Check size={14} /> Approve
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleRequestStatus(r._id, "rejected")} disabled={actionLoading} className="bg-red-950 text-red-400 hover:bg-red-900 h-8 px-2.5 flex items-center gap-1">
            <X size={14} /> Reject
          </Button>
        </div>
      ) : (
        <span className="text-xs text-gray-600 italic">No actions</span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Packages Management
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Manage subscription plans and user upgrade requests.
          </p>
        </div>
        {activeTab === "packages" && (
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <Plus size={16} /> Add Package
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab("packages")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "packages" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Manage Packages
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === "requests" ? "border-primary text-white" : "border-transparent text-gray-500 hover:text-gray-300"
          }`}
        >
          Package Requests
          {requests.filter(r => r.status === "pending").length > 0 && activeTab === "packages" && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {activeTab === "packages" ? (
          <AdminTable
            columns={packageColumns}
            data={packages}
            isLoading={isLoading}
            searchPlaceholder="Search packages..."
            searchValue=""
            onSearchChange={() => {}}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            pageSize={100}
            totalRecords={packages.length}
          />
        ) : (
          <AdminTable
            columns={requestColumns}
            data={requests}
            isLoading={isLoading}
            searchPlaceholder="Search requests..."
            searchValue=""
            onSearchChange={() => {}}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            pageSize={100}
            totalRecords={requests.length}
          />
        )}
      </div>

      {/* Package Create/Edit Modal */}
      <Dialog open={isPackageModalOpen} onOpenChange={setIsPackageModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-white font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="text-primary" />
              {editingPackage ? "Edit Package" : "Create New Package"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Package Title</label>
              <Input 
                value={pkgTitle} 
                onChange={e => setPkgTitle(e.target.value)} 
                placeholder="e.g., Ultimate Ownership" 
                className="bg-gray-950 border-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Price (৳)</label>
                <Input 
                  type="number" 
                  value={pkgPrice} 
                  onChange={e => setPkgPrice(e.target.value)} 
                  placeholder="0.00" 
                  className="bg-gray-950 border-gray-800"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Package Type</label>
                <select 
                  value={pkgType} 
                  onChange={e => setPkgType(e.target.value)}
                  className="w-full h-10 bg-gray-950 border border-gray-800 rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="premium">Premium</option>
                  <option value="owner">Owner / Ownership</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Features (One per line)</label>
              <textarea 
                value={pkgFeatures} 
                onChange={e => setPkgFeatures(e.target.value)}
                placeholder="Access to all premium features&#10;Verified Badge&#10;24/7 Support"
                className="w-full h-32 bg-gray-950 border border-gray-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPackageModalOpen(false)} className="border-gray-800" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handlePackageSubmit} className="bg-primary hover:bg-primary/90 text-white" disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
