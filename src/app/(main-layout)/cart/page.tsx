"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useAuthStore } from "@/lib/store/authStore";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  Phone,
  Wallet,
  ArrowRight,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Empty from "@/components/NotFound.tsx/Empty";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

export default function CartPage() {
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCartStore();

  const [address, setAddress] = useState(user?.address || "");
  const [phone, setPhone] = useState(user?.phone_number || "");
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "cod">("cod");

  const subtotal = getTotalPrice();
  const shippingFee = items.length > 0 ? 100 : 0; // Flat 100 Tk
  const grandTotal = subtotal + shippingFee;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to proceed to checkout", { position: "top-right" });
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!address.trim()) {
      toast.error("Shipping address is required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Contact phone number is required");
      return;
    }

    if (paymentMethod === "wallet") {
      const balance = Number(user.amount || 0);
      if (balance < grandTotal) {
        toast.error(`Insufficient balance! Total required: ৳${grandTotal}, your balance: ৳${balance}`);
        return;
      }
    }

    setCheckingOut(true);
    const token = localStorage.getItem("auth_token");

    try {
      const checkoutPayload = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        address,
        phone,
        paymentMethod
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(checkoutPayload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Checkout successful! Your order has been placed.");
        clearCart();
        fetchUser(); // Refresh user wallet balance
        router.push("/dashboard/my-orders");
      } else {
        throw new Error(data.message || "Checkout failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl w-[95%] mx-auto py-12 text-center space-y-6">
        <h2 className="text-xl font-bold text-white font-orbitron flex items-center justify-center gap-2">
          <ShoppingBag size={24} className="text-blue-500" />
          Shopping Cart
        </h2>
        <Empty description="Your shopping cart is currently empty." />
        <Link prefetch={false} href="/e-commerce-products">
          <Button className="mt-4 bg-black text-white rounded-sm lg:rounded-md font-semibold">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-[95%] mx-auto py-6 md:py-10">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-900">
        <h2 className="text-xl md:text-2xl font-bold text-white font-orbitron flex items-center gap-2">
          <ShoppingBag className="text-blue-500" size={24} />
          Shopping Cart
        </h2>
        <Link prefetch={false} href="/e-commerce-products" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
          <ChevronLeft size={14} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Cart items list (Col span 7) */}
        <div className="lg:col-span-7 space-y-4">
          {items.map((item) => (
            <div 
              key={item.productId}
              className="bg-gray-950/60 border border-gray-900 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-md"
            >
              <div className="flex gap-3 items-center min-w-0">
                <BackendImage 
                  src={item.image || "/placeholder-product.jpg"} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-gray-800 bg-gray-900 flex-shrink-0"
                 />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate font-parkinsans">{item.name}</h4>
                  <p className="text-xs text-gray-400 font-parkinsans mt-0.5">৳{item.price.toLocaleString()} each</p>
                  <p className="text-[10px] text-gray-500 font-parkinsans mt-1">Stock: {item.stock}</p>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center border border-gray-800 rounded-lg p-0.5 bg-gray-950/80">
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="px-2.5 text-xs font-bold text-white font-mono">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="text-rose-500/80 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Remove from Cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Shipping & Checkout Invoice Summary (Col span 5) */}
        <div className="lg:col-span-5 bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-parkinsans pb-2 border-b border-gray-900">
            Order Summary
          </h3>

          <form onSubmit={handleCheckout} className="space-y-4">
            {/* Delivery address */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-parkinsans">
                <MapPin size={12} className="text-blue-500" />
                Shipping Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete shipping delivery address..."
                rows={2}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
                required
              />
            </div>

            {/* Contact phone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-parkinsans">
                <Phone size={12} className="text-blue-500" />
                Contact Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
                className="bg-gray-900 border-gray-800 rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                required
              />
            </div>

            {/* Pricing details */}
            <div className="pt-4 border-t border-gray-900 space-y-2.5 text-sm font-parkinsans">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span className="font-mono">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping Fee</span>
                <span className="font-mono">৳{shippingFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-white font-bold pt-2 border-t border-gray-900">
                <span>Grand Total</span>
                <span className="text-emerald-400 font-mono text-base">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-2 pb-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 font-parkinsans">
                <Wallet size={12} className="text-blue-500" />
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("cod")}
                  className={`cursor-pointer text-left rounded-xl border p-3 flex flex-col gap-1 items-start transition-all disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === "cod" ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-gray-900/50 hover:border-gray-700"}`}
                >
                  <span className="text-sm font-semibold text-white">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-400">Pay when you receive</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod("wallet")}
                  disabled={true}
                  className={`cursor-pointer text-left rounded-xl border p-3 flex flex-col gap-1 items-start transition-all disabled:opacity-50 disabled:cursor-not-allowed ${paymentMethod === "wallet" ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-gray-900/50 hover:border-gray-700"}`}
                >
                  <span className="text-sm font-semibold text-white">Wallet</span>
                  <span className="text-[10px] text-gray-400">Pay using your balance</span>
                </button>
              </div>
            </div>

            {/* Account balance indicator */}
            {user && (
              <div className="bg-gray-900/60 rounded-xl p-3 flex justify-between items-center text-xs font-parkinsans">
                <span className="text-gray-400 flex items-center gap-1">
                  <Wallet size={14} className="text-blue-500" />
                  Your Balance:
                </span>
                <span className={`font-bold font-mono ${Number(user.amount || 0) < grandTotal ? "text-rose-500" : "text-emerald-400"}`}>
                  ৳{Number(user.amount || 0).toLocaleString()}
                </span>
              </div>
            )}

            <Button
              disabled={checkingOut || items.length === 0}
              type="submit"
              className="w-full bg-black text-white py-3 rounded-sm lg:rounded-md text-sm font-semibold hover:opacity-95 shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {checkingOut ? (
                "Processing Order..."
              ) : (
                <>
                  <span>{paymentMethod === "cod" ? "Place Order (COD)" : "Checkout using Wallet"}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
      <PageHelpPanel pageKey="cart" />
    </div>
  );
}
