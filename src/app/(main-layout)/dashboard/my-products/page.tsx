"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { BiEdit, BiTrash } from "react-icons/bi";
import { toast } from "sonner";
import { Package, ShoppingCart, Eye, ChevronDown, ChevronUp, Receipt, Printer } from "lucide-react";

// Simple Barcode Component - generates visual bars from text
function Barcode({ value, height = 60 }: { value: string; height?: number }) {
  // Generate bars pattern from the string
  const generateBars = (text: string) => {
    const bars = [];
    let x = 0;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      // Create varying widths based on character codes
      const width = ((charCode % 3) + 1) * 2;
      const gap = ((charCode % 2) + 1);
      bars.push({ x, width, filled: i % 2 === 0 });
      x += width + gap;
    }
    return bars;
  };

  const bars = generateBars(value);
  const totalWidth = bars.length > 0 ? bars[bars.length - 1].x + bars[bars.length - 1].width : 100;

  return (
    <div className="flex flex-col items-center">
      <svg width={Math.min(totalWidth, 280)} height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="barcode-svg">
        {bars.map((bar, i) => (
          <rect
            key={i}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height - 15}
            fill={bar.filled ? "#000" : "#fff"}
          />
        ))}
      </svg>
      <p className="text-xs font-mono barcode-text text-black">{value}</p>
    </div>
  );
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  category: string;
  brand?: string;
  status: string;
  create_date: string;
  orders?: Order[];
}

interface Order {
  order_id: string;
  buyer_id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_number?: string;
  buyer_address: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
  unit_price: number;
  order_status: "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  ordered_at: string;
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [invoiceProduct, setInvoiceProduct] = useState<Product | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);

  const { user } = useAuthStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/my-products`,
        {
          headers: {
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

  const handleToggleOrders = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const handleShowInvoice = (order: Order, product: Product) => {
    setInvoiceOrder(order);
    setInvoiceProduct(product);
    setShowInvoice(true);
  };

  const handlePrintInvoice = () => {
    // Add print-specific class to body
    document.body.classList.add('printing-invoice');
    window.print();
    // Remove class after print
    setTimeout(() => {
      document.body.classList.remove('printing-invoice');
    }, 100);
  };

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
      setProducts(products.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400";
      case "inactive":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) return <SpinnerCustom />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-2 items-center gap-2 justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            My Products
          </h1>
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
            Manage your e-commerce products and view orders
          </p>
        </div>
        <Link prefetch={false} href="/e-commerce-products/create" className="ml-auto">
          <Button>+ Add Product</Button>
        </Link>
      </div>

      {/* Products - Mobile Cards */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">  
        <Empty description="No products found. Start by adding a new product!" />
                </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                {/* Header with image and title */}
                <div className="flex items-start gap-3">
                  {(product.images?.[0] || product.image) ? (
                    <BackendImage
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                     />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Package size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white line-clamp-2">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(product.create_date).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>

                {/* Price & Stock info */}
                <div className="grid grid-cols-3 gap-3 py-2 border-t border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-sm text-white">{product.category}</p>
                  </div>
                  <div className="text-center border-l border-gray-700">
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-sm text-white font-orbitron">{product.price.toFixed(2)}৳</p>
                  </div>
                  <div className="text-center border-l border-gray-700">
                    <p className="text-xs text-gray-400">Stock</p>
                    <p className={`text-sm ${product.stock > 0 ? "text-green-400" : "text-red-400"}`}>
                      {product.stock}
                    </p>
                  </div>
                </div>

                {/* Orders Toggle & Actions */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleOrders(product._id)}
                      className={`h-8 px-2 flex items-center gap-1 ${
                        (product.orders?.length || 0) > 0 
                          ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10' 
                          : 'text-gray-500'
                      }`}
                      disabled={!product.orders || product.orders.length === 0}
                    >
                      <ShoppingCart size={16} />
                      <span className="text-xs">{product.orders?.length || 0} Orders</span>
                      {(product.orders?.length || 0) > 0 && (
                        expandedProductId === product._id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      )}
                    </Button>
                    <div className="flex items-center gap-1">
                      <Link prefetch={false} href={`/e-commerce-products/${product._id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <Link prefetch={false} href={`/e-commerce-products/edit/${product._id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <BiEdit size={16} />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(product._id)}
                        disabled={deleting === product._id}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <BiTrash size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Orders Section */}
                  {expandedProductId === product._id && product.orders && product.orders.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Orders ({product.orders.length})
                      </p>
                      {product.orders.map((order) => (
                        <div key={order.order_id} className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400">
                              #{order.order_id.slice(-8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.order_status === "completed" || order.order_status === "delivered"
                                  ? "bg-green-500/20 text-green-400"
                                  : order.order_status === "cancelled"
                                  ? "bg-red-500/20 text-red-400"
                                  : order.order_status === "shipped"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between"><p className="text-sm text-white">{order.buyer_name}</p><p className="text-xs md:text-base text-white">{order?.buyer_number}</p></div>
                          
                          <p className="text-xs text-gray-500">{order.buyer_address}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-gray-700/50">
                            <span className="text-xs text-gray-400">Qty: {order.quantity}</span>
                            <span className="text-sm text-white font-orbitron font-semibold">
                              {order.total_price.toFixed(2)}৳
                            </span>
                          </div>
                          <div className="flex justify-end pt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleShowInvoice(order, product)}
                              className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            >
                              <Receipt size={14} className="mr-1" />
                              <span className="text-xs">Invoice</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Price</TableHead>
                  <TableHead className="text-gray-400">Stock</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <>
                    <TableRow 
                      key={product._id} 
                      className={`border-gray-700 ${expandedProductId === product._id ? 'bg-gray-800/50' : ''}`}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {(product.images?.[0] || product.image) ? (
                            <BackendImage
                              src={product.images?.[0] || product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-md object-cover"
                             />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center">
                              <Package size={20} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white line-clamp-1">{product.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(product.create_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{product.category}</TableCell>
                      <TableCell className="text-white font-orbitron">
                        {product.price.toFixed(2)}৳
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-sm ${
                            product.stock > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleOrders(product._id)}
                            className={`h-8 px-2 flex items-center gap-1 ${
                              (product.orders?.length || 0) > 0 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10' 
                                : 'text-gray-500'
                            }`}
                            title={`${product.orders?.length || 0} Orders`}
                            disabled={!product.orders || product.orders.length === 0}
                          >
                            <ShoppingCart size={16} />
                            <span className="text-xs">{product.orders?.length || 0}</span>
                            {(product.orders?.length || 0) > 0 && (
                              expandedProductId === product._id ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )
                            )}
                          </Button>
                          <Link prefetch={false} href={`/e-commerce-products/${product._id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                              title="View Product"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                          <Link prefetch={false} href={`/e-commerce-products/edit/${product._id}`}>
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
                            onClick={() => handleDelete(product._id)}
                            disabled={deleting === product._id}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                            title="Delete"
                          >
                            <BiTrash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Orders Row */}
                    {expandedProductId === product._id && (
                      <TableRow className="border-gray-700 bg-gray-800/30">
                        <TableCell colSpan={6} className="p-0">
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <ShoppingCart size={18} className="text-blue-400" />
                              <h3 className="font-semibold text-white">
                                Orders for {product.name}
                              </h3>
                              <span className="text-sm text-gray-400">
                                ({product.orders?.length || 0} orders)
                              </span>
                            </div>
                            
                            {(!product.orders || product.orders.length === 0) ? (
                              <div className="text-center py-6 text-gray-400">
                                <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No orders yet for this product</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="border-gray-700 hover:bg-transparent bg-gray-800/50">
                                      <TableHead className="text-gray-400 text-xs">Order ID</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Buyer</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Address</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Qty</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Unit Price</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Total</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Status</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Date</TableHead>
                                      <TableHead className="text-gray-400 text-xs">Invoice</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {product.orders.map((order) => (
                                      <TableRow 
                                        key={order.order_id} 
                                        className="border-gray-700/50 hover:bg-gray-700/30"
                                      >
                                        <TableCell className="text-xs font-mono text-gray-300">
                                          #{order.order_id.slice(-8)}
                                        </TableCell>
                                        <TableCell>
                                          <p className="text-sm text-white">{order.buyer_name}</p>
                                          <p className="text-xs text-gray-500">{order.buyer_email}</p>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-400 max-w-[150px] truncate">
                                          {order.buyer_address}
                                        </TableCell>
                                        <TableCell className="text-sm text-white">
                                          {order.quantity}
                                        </TableCell>
                                        <TableCell className="text-sm text-white font-orbitron">
                                          {order.unit_price.toFixed(2)}৳
                                        </TableCell>
                                        <TableCell className="text-sm text-white font-orbitron font-semibold">
                                          {order.total_price.toFixed(2)}৳
                                        </TableCell>
                                        <TableCell>
                                          <span
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                              order.order_status === "completed" || order.order_status === "delivered"
                                                ? "bg-green-500/20 text-green-400"
                                                : order.order_status === "cancelled"
                                                ? "bg-red-500/20 text-red-400"
                                                : order.order_status === "shipped"
                                                ? "bg-blue-500/20 text-blue-400"
                                                : "bg-yellow-500/20 text-yellow-400"
                                            }`}
                                          >
                                            {order.order_status}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-gray-400">
                                          {new Date(order.ordered_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleShowInvoice(order, product)}
                                            className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                            title="View Invoice"
                                          >
                                            <Receipt size={16} />
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white invoice-dialog">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2"> 
            </DialogTitle>
          </DialogHeader>
          {invoiceOrder && invoiceProduct && (
            <>
              {/* Screen View - Dark Theme */}
              <div className="space-y-4 print:hidden" id="invoice-content">
                {/* Invoice Header */}
                <div className="text-center pb-4 border-b border-gray-700">
                  <div className="font-orbitron text-xl font-semibold">EmptyBD</div>
                  <p className="text-xs text-gray-400">Order #{invoiceOrder.order_id.slice(-8)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(invoiceOrder.ordered_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Product ID - Unique Identifier */}
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Product ID</p>
                  <p className="text-sm font-mono text-blue-400">{invoiceProduct._id}</p>
                </div>

                {/* Barcode */}
                <div className="bg-white rounded-lg p-2 flex justify-center">
                  <Barcode value={invoiceProduct._id} height={50} />
                </div>

                {/* Product Details */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Product Details</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Product Name</span>
                    <span className="text-sm text-white text-right">{invoiceProduct.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Category</span>
                    <span className="text-sm text-white">{invoiceProduct.category}</span>
                  </div>
                </div>

                {/* Buyer Details */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Buyer Details</p>
                  <div className="space-y-1">
                    <p className="text-sm text-white">{invoiceOrder.buyer_name}</p>
                    <p className="text-xs text-gray-400">{invoiceOrder.buyer_email}</p>
                    {invoiceOrder.buyer_number && (
                      <p className="text-xs text-gray-400">{invoiceOrder.buyer_number}</p>
                    )}
                    <p className="text-xs text-gray-500">{invoiceOrder.buyer_address}</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Order Summary</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Quantity</span>
                    <span className="text-sm text-white">{invoiceOrder.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Unit Price</span>
                    <span className="text-sm text-white font-orbitron">{invoiceOrder.unit_price.toFixed(2)}৳</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-700">
                    <span className="text-sm font-medium text-white">Total Amount</span>
                    <span className="text-lg font-semibold text-white font-orbitron">
                      {invoiceOrder.total_price.toFixed(2)}৳
                    </span>
                  </div>
                </div>

                {/* Status */}
                {/* <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoiceOrder.order_status === "completed" || invoiceOrder.order_status === "delivered"
                        ? "bg-green-500/20 text-green-400"
                        : invoiceOrder.order_status === "cancelled"
                        ? "bg-red-500/20 text-red-400"
                        : invoiceOrder.order_status === "shipped"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {invoiceOrder.order_status}
                  </span>
                </div> */}

                {/* Print Button */}
                <div className="">
                  <Button
                    onClick={handlePrintInvoice}
                    className="w-full bg-black hover:bg-gray-900 text-white rounded-sm lg:rounded-md"
                  >
                    <Printer size={16} className="mr-2" />
                    Print Invoice
                  </Button>
                </div>
              </div>

              {/* Print View - White Paper */}
              <div className="hidden print:block print-invoice">
                <div className="print-header">
                  <h1 className="print-title">EmptyBD</h1>
                  <p className="print-subtitle">Order #{invoiceOrder.order_id.slice(-8)}</p>
                  <p className="print-date">{new Date(invoiceOrder.ordered_at).toLocaleDateString()}</p>
                </div>

                {/* Barcode Section */}
                <div className="print-barcode-section">
                  <p className="print-label">Product ID / Scanner Code</p>
                  <div className="print-barcode">
                    <Barcode value={invoiceProduct._id} height={45} />
                  </div>
                </div>

                {/* Product Info */}
                <div className="print-section">
                  <p className="print-section-title">Product Information</p>
                  <div className="print-row">
                    <span className="print-label">Product ID:</span>
                    <span className="print-value font-mono">{invoiceProduct._id}</span>
                  </div>
                  <div className="print-row">
                    <span className="print-label">Product Name:</span>
                    <span className="print-value">{invoiceProduct.name}</span>
                  </div>
                  <div className="print-row">
                    <span className="print-label">Category:</span>
                    <span className="print-value">{invoiceProduct.category}</span>
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="print-section">
                  <p className="print-section-title">Buyer Information</p>
                  <div className="print-row">
                    <span className="print-label">Name:</span>
                    <span className="print-value">{invoiceOrder.buyer_name}</span>
                  </div>
                  <div className="print-row">
                    <span className="print-label">Email:</span>
                    <span className="print-value">{invoiceOrder.buyer_email}</span>
                  </div>
                  {invoiceOrder.buyer_number && (
                    <div className="print-row">
                      <span className="print-label">Phone:</span>
                      <span className="print-value">{invoiceOrder.buyer_number}</span>
                    </div>
                  )}
                  <div className="print-row">
                    <span className="print-label">Address:</span>
                    <span className="print-value">{invoiceOrder.buyer_address}</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="print-section">
                  <p className="print-section-title">Order Summary</p>
                  <div className="print-row">
                    <span className="print-label">Quantity:</span>
                    <span className="print-value">{invoiceOrder.quantity}</span>
                  </div>
                  <div className="print-row">
                    <span className="print-label">Unit Price:</span>
                    <span className="print-value">{invoiceOrder.unit_price.toFixed(2)}৳</span>
                  </div>
                  <div className="print-total-row">
                    <span className="print-total-label">Total Amount:</span>
                    <span className="print-total-value">{invoiceOrder.total_price.toFixed(2)}৳</span>
                  </div>
                </div>


                {/* Footer */}
                <div className="print-footer">
                  <p>Thank you for your business!</p>
                  <p className="print-company">Bidder Platform</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          /* Set page to auto size */
          @page {
            size: auto;
            margin: 0;
          }
          
          /* Hide everything except the invoice */
          body * {
            visibility: hidden !important;
          }
          
          /* Show only the print invoice content */
          .print-invoice,
          .print-invoice * {
            visibility: visible !important;
          }
          
          /* Position the invoice properly - fit to one page */
          .print-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-height: 100vh !important;
            background: white !important;
            color: black !important;
            padding: 10px 20px !important;
            margin: 0 !important;
            margin-top: -450px !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          
          /* Ensure white background */
          body, html {
            background: white !important;
            height: auto !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Hide dialog overlay and wrapper elements */
          [data-state="open"] > [data-radix-dialog-overlay],
          [role="dialog"] > [data-radix-dialog-overlay] {
            display: none !important;
          }
          
          /* Hide the dialog close button and header */
          button[aria-label="Close"],
          .print\\:hidden {
            display: none !important;
          }
          
          /* Barcode styling for print */
          .barcode-svg rect[fill="#000"] {
            fill: #000 !important;
          }
          .barcode-svg rect[fill="#fff"] {
            fill: #fff !important;
          }
          .barcode-text {
            color: #000 !important;
          }
        }
        
        /* Print invoice styles */
        .print-invoice {
          font-family: 'Courier New', monospace;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .print-header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        
        .print-title {
          font-size: 20px;
          font-weight: bold;
          margin: 0;
          letter-spacing: 2px;
        }
        
        .print-subtitle {
          font-size: 11px;
          margin: 3px 0;
          color: #333;
        }
        
        .print-date {
          font-size: 10px;
          color: #666;
        }
        
        .print-barcode-section {
          text-align: center;
          margin: 12px 0;
          padding: 10px;
          border: 1px dashed #ccc;
        }
        
        .print-barcode {
          margin-top: 5px;
        }
        
        .print-section {
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          page-break-inside: avoid;
        }
        
        .print-section-title {
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
          color: #000;
        }
        
        .print-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          font-size: 11px;
        }
        
        .print-label {
          color: #555;
        }
        
        .print-value {
          color: #000;
          text-align: right;
        }
        
        .print-total-row {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #000;
          font-size: 13px;
          font-weight: bold;
        }
        
        .print-total-label {
          color: #000;
        }
        
        .print-total-value {
          color: #000;
          font-size: 14px;
        }
        
        .print-status-section {
          background: #f5f5f5;
          padding: 8px;
          border: 1px solid #ddd;
          page-break-inside: avoid;
        }
        
        .print-status {
          font-weight: bold;
          text-transform: uppercase;
          padding: 2px 8px;
          border: 1px solid #000;
          font-size: 10px;
        }
        
        .print-footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px solid #000;
          font-size: 10px;
          color: #666;
          page-break-inside: avoid;
        }
        
        .print-company {
          font-weight: bold;
          font-size: 12px;
          color: #000;
          margin-top: 3px;
        }
      `}</style>
    </div>
  );
}
