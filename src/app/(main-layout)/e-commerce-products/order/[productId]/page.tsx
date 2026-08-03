"use client";
import BackendImage from "@/components/shared/BackendImage";


import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { BiArrowBack, BiPackage, BiMap, BiPhone, BiUser } from "react-icons/bi";
import { toast } from "sonner";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  category: string;
  brand?: string;
  owner?: {
    owner_id: string;
    owner_name: string;
    owner_email: string;
    owner_img?: string;
  };
};

type OrderFormData = {
  quantity: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
};

const bangladeshDistricts = [
  "Bagerhat", "Bandarban", "Barguna", "Barisal", "Bhola", "Bogura", "Brahmanbaria",
  "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka", "Dinajpur",
  "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj", "Jamalpur",
  "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat", "Madaripur", "Magura", "Manikganj",
  "Meherpur", "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon", "Narail", "Narayanganj",
  "Narsingdi", "Natore", "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh",
  "Patuakhali", "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira",
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail", "Thakurgaon"
];

export default function PlaceOrderPage() {
  const { productId } = useParams();
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    quantity: 1,
    shippingAddress: {
      fullName: user?.name || "",
      phone: user?.phone_number || "",
      address: "",
      city: "",
      district: "",
      postalCode: "",
      country: "Bangladesh",
    },
    notes: "",
  });

  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Update form when user loads
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          fullName: user.name || "",
          phone: user.phone_number || "",
        },
      }));
    }
  }, [user]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/${productId}`
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("shippingAddress.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [key]: value,
        },
      }));
    } else if (name === "quantity") {
      const qty = parseInt(value) || 1;
      setFormData((prev) => ({ ...prev, quantity: Math.max(1, qty) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to place an order");
      return;
    }

    if (!product) {
      toast.error("Product not found");
      return;
    }

    // Validation
    if (!formData.shippingAddress.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.shippingAddress.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!formData.shippingAddress.address.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!formData.shippingAddress.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!formData.shippingAddress.district) {
      toast.error("District is required");
      return;
    }

    if (formData.quantity > product.stock) {
      toast.error(`Only ${product.stock} units available in stock`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("auth_token");

      const orderData = {
        quantity: formData.quantity,
        totalPrice: product.price * formData.quantity,
        address: formData.shippingAddress.address,
        city: formData.shippingAddress.city,
        district: formData.shippingAddress.district,
        postalCode: formData.shippingAddress.postalCode,
        phone: formData.shippingAddress.phone,
        fullName: formData.shippingAddress.fullName,
        country: formData.shippingAddress.country,
        notes: formData.notes,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/purchase/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to place order");
      }
 

      toast.success("Order placed successfully!");
      router.push(`/e-commerce-products`);
    } catch (error: any) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1440px] w-[95%] mx-auto py-12 text-center">
        <h2 className="text-xl font-medium text-white font-parkinsans">
          Product not found
        </h2>
        <Link prefetch={false}
          href="/e-commerce-products"
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          Back to products
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[1440px] w-[95%] mx-auto py-6">
        <Link prefetch={false}
          href={`/e-commerce-products/${productId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <BiArrowBack />
          Back to product
        </Link>
        <Unauthorized description="Please login to place an order" />
      </div>
    );
  }

  // Prevent buying own product
  const isOwner = product.owner?.owner_id === user?._id;
  if (isOwner) {
    return (
      <div className="max-w-[1440px] w-[95%] mx-auto py-6">
        <Link prefetch={false}
          href={`/e-commerce-products/${productId}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <BiArrowBack />
          Back to product
        </Link>
        <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
          <h2 className="text-xl font-medium text-white font-parkinsans mb-2">
            Cannot Order Your Own Product
          </h2>
          <p className="text-gray-400">
            You cannot place an order for a product that you are selling.
          </p>
        </div>
      </div>
    );
  }

  const totalPrice = (product.price * formData.quantity + 80);

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-4 md:py-6">
      {/* Back Button */}
      <Link prefetch={false}
        href={`/e-commerce-products/${productId}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:mb-6 text-sm md:text-base"
      >
        <BiArrowBack className="text-lg" />
        Back to product
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900/50 rounded-lg p-4 md:p-6 border border-gray-700 space-y-4 md:space-y-6"
          >
            <h2 className="text-lg md:text-xl font-medium text-white font-parkinsans flex items-center gap-2">
              <BiPackage className="text-xl" />
              Place Your Order
            </h2>

            {/* Product Summary */}
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <div className="flex gap-3 md:gap-4">
                {(product.images?.[0] || product.image) ? (
                  <BackendImage
                    src={product.images?.[0] || product.image}
                    alt={product.name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover border border-gray-600"
                   />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Image</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-medium text-white font-parkinsans truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 mt-0.5">
                    {product.category}
                    {product.brand && ` • ${product.brand}`}
                  </p>
                  <p className="text-base md:text-lg font-bold text-white font-orbitron mt-1">
                    {product.price.toFixed(2)}৳
                  </p>
                  <p className="text-xs text-gray-400">
                    Stock: {product.stock} available
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-xs md:text-sm font-medium mb-2 text-gray-300">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min={1}
                  max={product.stock}
                  className="input max-w-40"
                  required
                />
                <span className="text-gray-400 text-sm">
                  × {product.price.toFixed(2)}<span className="font-orbitron">৳</span> = {" "}
                  <span className="text-white font-bold">{(product.price * formData.quantity).toFixed(2)}<span className="font-orbitron">৳</span></span>
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t border-gray-700 pt-4 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-base font-medium text-gray-400 uppercase tracking-wide flex items-center gap-2">
                <BiMap />
                Shipping Address
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300 ">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BiUser className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    name="shippingAddress.fullName"
                    value={formData.shippingAddress.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input pl-0"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BiPhone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="tel"
                    name="shippingAddress.phone"
                    value={formData.shippingAddress.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shippingAddress.address"
                  value={formData.shippingAddress.address}
                  onChange={handleChange}
                  placeholder="House, Road, Area, etc."
                  className="input"
                  rows={2}
                  required
                />
              </div>

              {/* City & District Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleChange}
                    placeholder="City name"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="shippingAddress.district"
                    value={formData.shippingAddress.district}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">Select district</option>
                    {bangladeshDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Postal Code & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.postalCode"
                    value={formData.shippingAddress.postalCode}
                    onChange={handleChange}
                    placeholder="XXXX"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                    Country
                  </label>
                  <input
                    type="text"
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleChange}
                    className="input bg-gray-800"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="border-t border-gray-700 pt-4">
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Order Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special instructions for the seller..."
                className="input"
                rows={2}
              />
            </div>

            {/* Submit Button - Mobile only */}
            <div className="lg:hidden pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-lg font-medium"
              >
                {submitting ? <SpinnerCustom /> : `Place Order - ${totalPrice.toFixed(2)}৳`}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary - Sticky on Desktop */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-lg p-4 md:p-6 border border-gray-700 lg:sticky lg:top-4">
            <h3 className="text-sm md:text-base font-medium text-white font-parkinsans mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Product Price</span>
                <span>{product.price.toFixed(2)}<span className="font-orbitron">৳</span></span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Quantity</span>
                <span>× {formData.quantity}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{(product.price * formData.quantity).toFixed(2)}<span className="font-orbitron">৳</span></span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-green-400">80<span className="font-orbitron">৳</span></span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-white font-bold text-base md:text-lg">
                  <span>Total</span>
                  <span className="font-orbitron">{totalPrice.toFixed(2)}<span className="font-orbitron">৳</span></span>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            {product.owner && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Sold by</p>
                <div className="flex items-center gap-2">
                  {product.owner.owner_img ? (
                    <BackendImage
                      src={product.owner.owner_img}
                      alt={product.owner.owner_name}
                      className="w-8 h-8 rounded-full object-cover"
                     />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                      {product.owner.owner_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="text-sm text-white">{product.owner.owner_name}</span>
                </div>
              </div>
            )}

            {/* Submit Button - Desktop only */}
            <div className="hidden lg:block mt-6">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-black text-white py-3 rounded-lg font-medium"
              >
                {submitting ? <SpinnerCustom /> : `Place Order - ${totalPrice.toFixed(2)}৳`}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              By placing this order, you agree to our terms and conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
