"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Empty from '../NotFound.tsx/Empty'
import { SpinnerCustom } from "../loading/Spinner";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  brand?: string;
  status: string;
  create_date: string;
}

export default function UserEshopPostTable({ email }: { email: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/my-products`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        toast.error("Failed to load your products");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, [token]);

  const handleDelete = async (productId: string) => {
    if (!token) return;

    setDeleting(productId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/delete/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Product deleted successfully");
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <SpinnerCustom />;
  if (products.length === 0) return <Empty description="No e-shop products found." />;

  return (
    <div className="flex flex-col gap-2">
      {products.map((product) => (
        <div
          key={product._id}
          className="bg-gray-800/30 py-2 px-2 rounded-md w-full flex items-center gap-3"
        >
          {/* Product Image */}
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-[62px] h-[40px] border border-gray-600 rounded-sm object-cover"
            />
          ) : (
            <div className="w-[62px] h-[40px] border border-gray-600 rounded-sm bg-gray-700 flex items-center justify-center">
              <span className="text-[10px] text-gray-400">No Img</span>
            </div>
          )}

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/e-commerce-products/${product._id}`}>
              <h3 className="text-sm font-medium text-white truncate hover:text-blue-400 transition-colors">
                {product.name} 
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
             <span className="text-[9px] md:text-sm xl:text-base text-gray-400">{product.category}</span> <span>•</span> 
              <span className="font-orbitron text-white">{product.price.toFixed(2)}৳</span>
              <span>•</span>
              <span className={product.stock > 0 ? "text-green-400" : "text-red-400"}>
                Stock: {product.stock}
              </span>
            </div>
          </div>

          {/* Actions */}
          {/* <div className="flex items-center">
            <Link href={`/e-commerce-products/edit/${product._id}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <BiEdit className="text-gray-400 hover:text-white" />
              </Button>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={deleting === product._id}>
                  <BiTrash className="text-gray-400 hover:text-red-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm p-4">
                <DialogHeader>
                  <DialogTitle className="text-base text-center">
                    Delete Product?
                  </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-gray-400 text-center">
                  Are you sure you want to delete "{product.name}"?
                </p>
                <DialogFooter className="grid grid-cols-2 gap-3">
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                  >
                    {deleting === product._id ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div> */}
        </div>
      ))}
    </div>
  );
}
