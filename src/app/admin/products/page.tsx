"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import AdminTable, { Column, FilterOption } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Trash2, Edit, ShoppingBag, Eye, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  category: string;
  status?: string;
  brand?: string;
  owner?: {
    owner_name: string;
    owner_email: string;
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table parameters
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    category: "",
    status: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Actions states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Categories list collected dynamically
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProductsList = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product`);
      if (!res.ok) throw new Error("Failed to load products list");
      const data = await res.json();
      const productList = Array.isArray(data) ? data : [];
      setProducts(productList);

      // Collect unique categories
      const uniqueCats = Array.from(new Set(productList.map((p: any) => p.category).filter(Boolean))) as string[];
      setCategories(uniqueCats);
    } catch (e) {
      console.error(e);
      toast.error("Error loading products catalogue.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...products];

    // Search by Name or Owner Email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.owner?.owner_email?.toLowerCase().includes(query)
      );
    }

    // Apply Filters
    if (activeFilters.category) {
      result = result.filter((p) => p.category === activeFilters.category);
    }
    if (activeFilters.status) {
      result = result.filter((p) => p.status === activeFilters.status);
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, search, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Delete handlers
  const handleDeleteClick = (p: Product) => {
    setSelectedProduct(p);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteProduct = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/delete/${selectedProduct._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Product "${selectedProduct.name}" deleted successfully.`);
      fetchProductsList();
    } catch (e) {
      console.error(e);
      // Fallback local update
      setProducts((prev) => prev.filter((p) => p._id !== selectedProduct._id));
      toast.info("Offline Fallback: Product deleted locally.");
    } finally {
      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedProduct(null);
    }
  };

  // Columns Definitions
  const columns: Column<Product>[] = [
    {
      key: "image",
      label: "Image",
      render: (p) => {
        const imgUrl = p.images?.[0] || p.image;
        return imgUrl ? (
          <BackendImage
            src={imgUrl}
            alt={p.name}
            className="h-10 w-10 object-cover rounded border border-gray-800 bg-gray-900"
           />
        ) : (
          <div className="h-10 w-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500">
            <ImageIcon size={16} />
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Product Name",
      render: (p) => (
        <div>
          <span className="font-semibold text-white block truncate max-w-xs">{p.name}</span>
          <span className="text-[10px] text-gray-500 font-mono block">{p._id}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (p) => <span className="font-bold text-white font-orbitron">৳{p.price.toFixed(2)}</span>,
    },
    {
      key: "stock",
      label: "Stock",
      render: (p) => (
        <span className={`font-semibold ${p.stock > 0 ? "text-green-400" : "text-red-400"}`}>
          {p.stock} units
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => <span className="capitalize text-gray-300 font-medium">{p.category}</span>,
    },
    {
      key: "owner",
      label: "Seller",
      render: (p) => (
        p.owner ? (
          <div>
            <span className="text-gray-300 block text-xs font-semibold">{p.owner.owner_name}</span>
            <span className="text-[10px] text-gray-500 block">{p.owner.owner_email}</span>
          </div>
        ) : (
          <span className="text-gray-500 text-xs italic">Unknown Seller</span>
        )
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
            p.status === "active"
              ? "bg-green-600/20 text-green-400 border border-green-600/30"
              : "bg-red-600/20 text-red-400 border border-red-600/30"
          }`}
        >
          {p.status || "active"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <Link href={`/e-commerce-products/${p._id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800 px-2 gap-1"
            >
              <Eye size={13} />
              View
            </Button>
          </Link>
          <Link href={`/e-commerce-products/edit/${p._id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-gray-700 text-gray-300 hover:bg-gray-800 px-2 gap-1"
            >
              <Edit size={13} />
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(p)}
            className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2 gap-1"
          >
            <Trash2 size={13} />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "Categories",
      options: categories.map((cat) => ({ value: cat, label: cat.toUpperCase() })),
    },
    {
      key: "status",
      label: "Statuses",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            e-Shop Products Catalogue
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Browse and manage retail items and inventory parameters.
          </p>
        </div>
        <Link href="/e-commerce-products/create">
          <Button className="bg-primary hover:bg-primary/95 text-white gap-2 font-parkinsans h-10 px-4">
            <ShoppingBag size={16} />
            Create Product
          </Button>
        </Link>
      </div>

      <AdminTable
        columns={columns}
        data={paginatedProducts}
        isLoading={isLoading}
        searchPlaceholder="Search products by title, category, brand..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredProducts.length}
      />

      {/* Confirm Delete modal */}
      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDeleteProduct}
        isLoading={actionLoading}
        title="Delete E-Commerce Product?"
        description={`Are you sure you want to delete product "${selectedProduct?.name}"? Buyers will no longer be able to purchase this item or view it in the catalogue.`}
        confirmText="Yes, Delete Product"
        type="danger"
      />
    </div>
  );
}
