"use client";
import BackendImage from "@/components/shared/BackendImage";


import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useCartStore } from "@/lib/store/cartStore";
import { 
  Store, 
  User, 
  MapPin, 
  Globe, 
  ShoppingBag, 
  Phone, 
  Mail, 
  Star, 
  MessageSquare,
  ChevronDown,
  Filter,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import Link from "next/link";

interface SellerProfile {
  user: {
    _id: string;
    name: string;
    img: string;
    createdAt: string;
    role: string;
    plan: string;
    selling_status: string;
    bid_account: string;
    product_account: string;
    address?: string;
    bio?: string;
    socials?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  stats: {
    postsCount: number;
    productsCount: number;
    bidsCount: number;
  };
  products: Array<{
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    image?: string;
    images?: string[];
  }>;
}

export default function SellerStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const rawEmail = params?.email;
  const sellerEmail = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;
  const decodedEmail = sellerEmail ? decodeURIComponent(sellerEmail) : "";

  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!decodedEmail) return;

    const fetchSellerStore = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/public/${encodeURIComponent(decodedEmail)}`
        );
        if (!res.ok) throw new Error("Storefront not found");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load storefront details");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerStore();
  }, [decodedEmail]);

  const handleAddToCart = (product: any) => {
    if (!product) return;
    const addToCart = useCartStore.getState().addToCart;
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.image || product.images?.[0] || "",
      sellerId: profile?.user._id || "",
      sellerEmail: decodedEmail,
      stock: product.stock
    });
    toast.success(`🛒 Added "${product.name}" to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl w-[95%] mx-auto py-12 text-center">
        <Empty description="Seller storefront not found." />
        <Button onClick={() => router.push("/e-commerce-products")} className="mt-4">
          Browse Products
        </Button>
      </div>
    );
  }

  // Extract unique categories from seller products
  const categories = ["All", ...new Set(profile.products.map(p => p.category || "Uncategorized"))];

  // Filter products by selected category
  const filteredProducts = selectedCategory === "All"
    ? profile.products
    : profile.products.filter(p => (p.category || "Uncategorized") === selectedCategory);

  const faqs = [
    {
      q: "What payment methods are supported?",
      a: "We accept payments using your EmptyBD account wallet balance directly during checkout."
    },
    {
      q: "How does shipping work?",
      a: "All items are packed and shipped within 3-5 business days. A flat 100 Tk shipping fee is calculated per checkout."
    },
    {
      q: "Do you offer returns or refunds?",
      a: "We ensure all items match descriptions perfectly. For issues, contact us directly using the Chat with Seller option."
    }
  ];

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10 space-y-8">
      {/* Store Banner & Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 border border-gray-800 p-6 md:p-10 shadow-xl backdrop-blur-md">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start z-10 relative">
          {/* Avatar image */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-4 border-gray-850 shadow-md shrink-0 bg-gray-950">
            <BackendImage src={profile.user.img || "/default-avatar.png"} alt={profile.user.name} className="w-full h-full object-cover"  />
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3 font-parkinsans">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Store className="text-blue-400" size={24} />
                {profile.user.name}&apos;s Storefront
              </h1>
              {profile.user.plan === "premium" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25">Premium Shop</span>
              )}
              {profile.user.plan === "owner" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">Owner Shop</span>
              )}
            </div>

            <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
              {profile.user.bio || "Welcome to my storefront! Browse through our catalog and enjoy instant, secure checkout using your wallet balance."}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-semibold text-gray-400 pt-2">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500" /> {profile.user.address || "Global Seller"}</span>
              <span className="flex items-center gap-1.5"><Mail size={14} className="text-blue-500" /> {decodedEmail}</span>
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" /> 
                Trust: {profile.user.selling_status || "0"}/5
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Catalog on Left, Shop FAQ/Stats on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Products Catalog (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-900">
            <h2 className="text-lg font-bold text-white font-orbitron flex items-center gap-2">
              <ShoppingBag size={20} className="text-blue-400" />
              Products Catalog
            </h2>

            {/* Category Filter Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-1">
              <Filter size={14} className="text-gray-500 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-parkinsans transition-all flex-shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white"
                      : "bg-gray-950/60 border border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <Empty description="No products available in this category." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod._id}
                  className="group bg-gray-950/50 border border-gray-900 hover:border-blue-500/20 hover:bg-gray-950 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] bg-gray-900 border-b border-gray-900 overflow-hidden relative">
                    <BackendImage 
                      src={prod.image || prod.images?.[0] || "/placeholder-product.jpg"} 
                      alt={prod.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                     />
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur text-gray-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {prod.category}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4 font-parkinsans">
                    <div>
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">Stock: {prod.stock} units available</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-base font-extrabold text-white font-mono">৳{prod.price.toLocaleString()}</span>
                      
                      <div className="flex gap-1.5">
                        <Link prefetch={false} href={`/e-commerce-products/${prod._id}`}>
                          <Button size="sm" variant="outline" className="border-gray-800 text-gray-400 text-xs px-2.5">
                            Details
                          </Button>
                        </Link>
                        <Button 
                          size="sm"
                          onClick={() => handleAddToCart(prod)}
                          disabled={prod.stock <= 0}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 cursor-pointer"
                        >
                          Add +
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Store FAQs & Info Sidebar (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shop Quick Stats */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-parkinsans pb-2 border-b border-gray-900 flex items-center gap-1.5">
              <CheckCircle size={15} className="text-blue-400" />
              Shop Overview
            </h3>

            <div className="grid grid-cols-2 gap-4 font-parkinsans">
              <div className="bg-gray-900/40 p-3.5 border border-gray-900 rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Products</span>
                <span className="text-lg font-black text-white font-mono">{profile.stats.productsCount}</span>
              </div>
              <div className="bg-gray-900/40 p-3.5 border border-gray-900 rounded-xl">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase">Active Bids</span>
                <span className="text-lg font-black text-white font-mono">{profile.stats.bidsCount}</span>
              </div>
            </div>
          </div>

          {/* Shop FAQs Accordion */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-parkinsans pb-2 border-b border-gray-900 flex items-center gap-1.5">
              <HelpCircle size={15} className="text-blue-400" />
              Store Policy FAQs
            </h3>

            <div className="space-y-2.5 font-parkinsans">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-gray-900 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-3.5 text-xs text-left font-bold text-white bg-gray-900/10 hover:bg-gray-900/20 transition-all"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${openFaqIndex === index ? "rotate-185" : ""}`} />
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-3.5 bg-gray-950 border-t border-gray-900 text-xs text-gray-400 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
