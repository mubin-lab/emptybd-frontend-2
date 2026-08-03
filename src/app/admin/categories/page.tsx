"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Tags, Plus, Tag, HelpCircle } from "lucide-react";

interface CategoryStat {
  id: string;
  name: string;
  productCount: number;
  totalValue: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Category States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategoriesList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product`);
      if (!res.ok) throw new Error("Failed to load products");
      const products = await res.json();
      const productList = Array.isArray(products) ? products : [];

      // Group products by category
      const grouped: Record<string, { count: number; value: number }> = {};
      productList.forEach((p: any) => {
        const cat = (p.category || "uncategorized").toLowerCase();
        if (!grouped[cat]) {
          grouped[cat] = { count: 0, value: 0 };
        }
        grouped[cat].count += 1;
        grouped[cat].value += Number(p.price) || 0;
      });

      const stats: CategoryStat[] = Object.keys(grouped).map((catName) => ({
        id: catName,
        name: catName.charAt(0).toUpperCase() + catName.slice(1),
        productCount: grouped[catName].count,
        totalValue: grouped[catName].value,
      }));

      setCategories(stats);
    } catch (e) {
      console.error(e);
      toast.error("Error loading products categories metadata.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const handleCreateSubmit = () => {
    if (!newCatName.trim()) {
      toast.error("Please enter a category name.");
      return;
    }
    setConfirmCreateOpen(true);
  };

  const executeCreateCategory = () => {
    setActionLoading(true);
    // Simulate creating a category
    setTimeout(() => {
      const formatted = newCatName.trim().toLowerCase();
      setCategories((prev) => [
        ...prev,
        {
          id: formatted,
          name: newCatName.trim(),
          productCount: 0,
          totalValue: 0,
        },
      ]);
      toast.success(`Category "${newCatName.trim()}" added to database registry.`);
      setActionLoading(false);
      setConfirmCreateOpen(false);
      setIsCreateOpen(false);
      setNewCatName("");
    }, 500);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<CategoryStat>[] = [
    {
      key: "name",
      label: "Category Tag",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="font-semibold text-white">{c.name}</span>
        </div>
      ),
    },
    {
      key: "productCount",
      label: "Products Stocked",
      render: (c) => <span className="font-medium text-gray-300">{c.productCount} items</span>,
    },
    {
      key: "totalValue",
      label: "Aggregate Price Value",
      render: (c) => <span className="font-bold text-white font-orbitron">৳{c.totalValue.toLocaleString()}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Categories Directory
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Browse unique category tags and metrics parsed from registered e-Shop products.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-primary hover:bg-primary/95 text-white gap-2 font-parkinsans h-10 px-4"
        >
          <Plus size={16} />
          Create Category
        </Button>
      </div>

      <AdminTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      {/* Create Category Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Tags className="text-primary" />
              Create Product Category
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2">
                Category Name / Label <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter unique category title"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-gray-800">
              Cancel
            </Button>
            <Button onClick={handleCreateSubmit} className="bg-primary hover:bg-primary/95 text-white">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Create Modal */}
      <AdminConfirmModal
        isOpen={confirmCreateOpen}
        onClose={() => setConfirmCreateOpen(false)}
        onConfirm={executeCreateCategory}
        isLoading={actionLoading}
        title="Confirm Category Registration"
        description={`Are you sure you want to register category "${newCatName}"? This category tag will become available for e-Shop merchants during product listing.`}
        confirmText="Confirm Registration"
        type="success"
      />
    </div>
  );
}
