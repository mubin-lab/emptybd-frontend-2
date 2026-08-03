"use client";
import BackendImage from "@/components/shared/BackendImage";

import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
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
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiArrowBack, BiEdit, BiTrash, BiImage, BiShoppingBag, BiVideo } from "react-icons/bi";
import { BsDoorOpenFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cartStore";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { Star, ShieldCheck } from "lucide-react";
import ReportModal from "@/components/shared/ReportModal";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  video_url?: string;
  category: string;
  brand?: string;
  sku?: string;
  status?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags?: string[];
  create_date?: string;
  update_date?: string;
  owner?: {
    owner_id: string;
    owner_name: string;
    owner_email: string;
    owner_img?: string;
    isVerified?: boolean;
  };
  rating?: number;
  reviewsCount?: number;
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const fetchBookmarkStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookmarkStatus();
  }, [id, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark products", { position: "top-right" });
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id, itemType: "product" })
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/${id}`
        );
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!user?.email) return;

    setDeleting(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Product deleted successfully");
      router.push("/e-commerce-products");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete product");
      setDeleting(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const addToCart = useCartStore.getState().addToCart;
    addToCart({
      productId: product._id,
      name: product.name || 'Unnamed Product',
      price: product.price,
      image: product.image || product.images?.[0] || '',
      sellerId: product.owner?.owner_id || '',
      sellerEmail: product.owner?.owner_email || '',
      stock: product.stock
    });
    toast.success("🛒 Added to cart!", { position: "bottom-right" });
  };

  const handleBuyNow = () => {
    toast.error("You can not buy now, because your information is not correct. Please wait and contact with support.", { position: "top-right", duration: 5000 });
    // handleAddToCart();
    // router.push("/cart");
  };

  const handleChatWithSeller = async () => {
    if (!user) {
      toast.error("Please login to chat with the seller", { position: "top-right" });
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/conversation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ recipientEmail: product?.owner?.owner_email })
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/messages?conversationId=${data._id}`);
      } else {
        const errData = await res.json();
        toast.error(errData.message || "Failed to start chat session", { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to chat service");
    }
  };


  // Check if user is the owner
  const isOwner =
    product?.owner?.owner_id === user?._id ||
    product?.owner?.owner_email === user?.email;

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

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-4 md:py-6">
      {/* Structured Data for SEO / Google Ads Compliance */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : ["https://emptybd.com/company/logo.png"]),
            "description": product.description || `Buy ${product.name} at EmptyBD.`,
            "sku": product.sku || product._id,
            "brand": {
              "@type": "Brand",
              "name": product.brand || "Unknown"
            },
            "offers": {
              "@type": "Offer",
              "url": `https://emptybd.com/e-commerce-products/${product._id}`,
              "priceCurrency": "BDT",
              "price": product.price,
              "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": product.owner?.owner_name || "EmptyBD Seller"
              }
            }
          })
        }}
      />

      {/* Back Button */}
      <Link prefetch={false}
        href="/e-commerce-products"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:mb-6 text-sm md:text-base"
      >
        <BiArrowBack className="text-lg" />
        Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Product Images & Video Gallery */}
        <div className="space-y-3 order-1">
          {/* Main Display - Image or Video */}
          <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-lg">
            {(() => {
              const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);
              if (allImages.length === 0 && !product.video_url) {
                return (
                  <div className="w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[500px] bg-gray-800 flex flex-col items-center justify-center">
                    <BiImage size={48} className="text-gray-600 mb-2 md:w-16 md:h-16" />
                    <span className="text-gray-500 font-medium text-sm md:text-base">No Image Available</span>
                  </div>
                );
              }

              // Show video if selected, otherwise show image
              const showVideo = selectedImageIndex === -1 && product.video_url;
              
              if (showVideo) {
                return (
                  <div className="relative">
                    <video
                      src={product.video_url}
                      controls
                      className="w-full h-auto max-h-[500px] object-contain bg-black"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <BiVideo /> Video
                    </span>
                  </div>
                );
              }

              const currentImage = allImages[selectedImageIndex] || allImages[0];
              return (
                <div className="relative group">
                  <BackendImage
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-auto max-h-[500px] object-contain cursor-pointer group-hover:scale-[1.02] transition-transform duration-500 bg-gray-800"
                   />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {selectedImageIndex + 1} / {allImages.length}
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Thumbnails Grid */}
          {(() => {
            const allImages = product.images?.length ? product.images : (product.image ? [product.image] : []);
            const hasMedia = allImages.length > 0 || product.video_url;
            if (!hasMedia) return null;

            return (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Video Thumbnail */}
                {product.video_url && (
                  <button
                    onClick={() => setSelectedImageIndex(-1)}
                    className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === -1 
                        ? 'border-blue-500 ring-2 ring-blue-500/30' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-800 flex flex-col items-center justify-center">
                      <BiVideo size={24} className="text-purple-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Video</span>
                    </div>
                  </button>
                )}

                {/* Image Thumbnails */}
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-500/30' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <BackendImage
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover"
                     />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Product Info */}
        <div className="space-y-4 md:space-y-6 order-2">
          {/* Header */}
          <div className="border-b border-gray-700 pb-3 md:pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.status && (
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    product.status === "active"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {product.status}
                </span>
              )}
              {product.category && (
                <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                  {product.category}
                </span>
              )}
            </div>

            <div className="flex justify-between items-start gap-4">
              <h1 className="text-2xl sm:text-2xl lg:text-3xl font-medium text-white font-hind leading-tight">
                {product.name || 'Unnamed Product'}
              </h1>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ReportModal itemId={product._id} itemType="product" />
                <button
                  onClick={handleToggleBookmark}
                  className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-gray-800 rounded-full cursor-pointer flex-shrink-0"
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark Product"}
                >
                  {isBookmarked ? (
                    <BsBookmarkFill size={20} className="text-amber-500" />
                  ) : (
                    <BsBookmark size={20} />
                  )}
                </button>
              </div>
            </div>

            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-1.5 mt-2 text-amber-400">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      className={i < Math.round(product.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-600"}
                    />
                  ))}
                </div>
                <span className="text-white text-xs lg:text-sm font-semibold ml-1">{(product.rating || 0).toFixed(1)}</span>
                <span className="text-gray-400 text-xs">({product.reviewsCount || 0} reviews)</span>
              </div>
            )}

            {product.brand ? (
              <p className="text-gray-405 mt-1.5 text-sm md:text-base">Brand: {product.brand}</p>
            ) : null}

          </div>

          {/* Price & Stock */}
          <div className="flex justify-between sm:flex-row sm:items-center sm:justify-between bg-gray-800/50 p-3 md:p-4 rounded-lg gap-2 sm:gap-0">
            <div>
              <span className="text-2xl md:text-3xl font-bold text-white font-orbitron">
                {typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}৳
              </span>
            </div>
            <div className="text-sm text-left sm:text-right">
              <span
                className={`font-medium ${
                  typeof product.stock === 'number' && product.stock > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {typeof product.stock === 'number' && product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              <p className="text-gray-400 mt-0.5 text-xs md:text-sm">
                {typeof product.stock === 'number' ? product.stock : 0} units available
              </p>
            </div>
          </div>

          {/* Buy Now & Add to Cart Buttons - For non-owners */}
          {user && !isOwner && typeof product.stock === 'number' && product.stock > 0 && ( 
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-gray-850 hover:bg-gray-850/80 text-white font-semibold py-2.5 rounded-xl border border-gray-700 transition cursor-pointer"
              >
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                className="flex-1 bg-black text-white rounded-sm lg:rounded-md font-semibold py-2.5 transition cursor-not-allowed opacity-60"
              >
                <BiShoppingBag className="text-lg mr-1.5" />
                Buy Now
              </Button>
            </div>
          )}

          {/* Login to Buy - For unauthenticated users */}
          {!user && typeof product.stock === 'number' && product.stock > 0 && (
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mb-4">
                    <BiShoppingBag className="text-lg" />
                    Buy Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm p-4">
                  <DialogHeader>
                    <BsDoorOpenFill className="w-fit mx-auto" size={30} />
                    <DialogTitle className="text-base lg:text-lg text-center">
                      Please login to place an order
                    </DialogTitle>
                  </DialogHeader>
                  <DialogFooter className="grid grid-cols-2 gap-3">
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button>
                      <Link prefetch={false} href="/login">Login</Link>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Out of Stock Message */}
          {typeof product.stock === 'number' && product.stock === 0 && (
            <div className="bg-red-900/30 p-3 md:p-4 rounded-lg text-center">
              <p className="text-red-400 text-sm md:text-base font-medium">
                This product is currently out of stock
              </p>
            </div>
          )}

          {/* Description */}
          {product.description ? (
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Description
              </h3>
              <p className="text-gray-300 font-hind leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {product.description}
              </p>
            </div>
          ) : null}

          {/* Details */}
          {(product.sku || product.weight || product.dimensions?.length || product.dimensions?.width || product.dimensions?.height) ? (
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Product Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {product.sku ? (
                  <div>
                    <span className="text-gray-400 text-sm block">SKU (Stock Keeping Unit)</span>
                    <p className="text-white font-medium">{product.sku}</p>
                  </div>
                ) : null}
                {typeof product.weight === 'number' && product.weight > 0 ? (
                  <div>
                    <span className="text-gray-400 text-sm block">Weight</span>
                    <p className="text-white font-medium">{product.weight} kg</p>
                  </div>
                ) : null}
                {(product.dimensions?.length || product.dimensions?.width || product.dimensions?.height) ? (
                  <div>
                    <span className="text-gray-400 text-sm block">Dimensions</span>
                    <p className="text-white font-medium">
                      {product.dimensions?.length ? `${product.dimensions.length} × ` : ''}
                      {product.dimensions?.width ? `${product.dimensions.width} × ` : ''}
                      {product.dimensions?.height ? `${product.dimensions.height}` : ''} cm
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-[10px] md:text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Owner Info */}
          {product.owner && (
            <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
              <h3 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Sold by
              </h3>
              <Link prefetch={false} href={`/user/${product.owner.owner_email}`} className="flex items-center gap-3 hover:opacity-90 group cursor-pointer">
                {product.owner.owner_img ? (
                  <BackendImage
                    src={product.owner.owner_img}
                    alt={product.owner.owner_name}
                    className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-gray-700 group-hover:border-blue-500 transition-all duration-300"
                   />
                ) : (
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 font-medium text-base md:text-lg border-2 border-transparent group-hover:border-blue-500 transition-all duration-300">
                    {product.owner.owner_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm md:text-base truncate group-hover:text-blue-400 transition-colors duration-200">
                      {product.owner.owner_name || 'Unknown Seller'}
                    </p>
                    {product.owner.isVerified && (
                      <span title="Verified Seller">
                        <ShieldCheck className="text-emerald-500 w-4 h-4 flex-shrink-0" />
                      </span>
                    )}
                  </div>
                  {/* <p className="text-gray-400 text-xs md:text-sm truncate">
                    {product.owner.owner_email}
                  </p> */}
                </div>
              </Link>
              {user && !isOwner && (
                <Button
                  onClick={handleChatWithSeller}
                  className="w-full mt-3 bg-black text-white font-semibold py-2 rounded-sm lg:rounded-md transition cursor-pointer flex items-center justify-center gap-1.5 hover:bg-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Seller
                </Button>
              )}
            </div>
          )}

          {/* Owner Actions */}
          {user &&
            isOwner ? (
              <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Product Management
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Link prefetch={false} href={`/e-commerce-products/edit/${product._id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-sm">
                      <BiEdit className="mr-1.5 md:mr-2" />
                      Edit Product
                    </Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex-1 text-sm">
                        <BiTrash className="mr-1.5 md:mr-2" />
                        Delete Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-6">
                      <DialogHeader>
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-900/50 flex items-center justify-center mb-4">
                          <BiTrash className="text-red-500" size={24} />
                        </div>
                        <DialogTitle className="text-center text-lg">
                          Delete Product?
                        </DialogTitle>
                        <p className="text-gray-400 text-sm text-center mt-2">
                          Are you sure you want to delete <strong className="text-white">{`"${product.name}"`}</strong>?<br />
                          This action cannot be undone.
                        </p>
                      </DialogHeader>
                      <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleting}
                        >
                          {deleting ? <SpinnerCustom /> : "Yes, Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg">
                <p className="text-gray-400 text-xs md:text-sm">
                  <span className="text-yellow-500">⚠</span> Only the product owner can edit or delete this product.
                </p>
              </div>
            )}

        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="mt-8 border-t border-gray-800 pt-8">
        <ProductReviewsSection productId={product._id} isOwner={isOwner} />
      </div>
      
      <PageHelpPanel pageKey="productDetails" />
    </div>
  );
}

type Review = {
  _id: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerImg?: string;
  rating: number;
  comment: string;
  createdAt: string;
};

function ProductReviewsSection({ productId, isOwner }: { productId: string; isOwner: boolean }) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to submit a review");
      return;
    }
    if (newRating < 1 || newRating > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    
    setSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating: newRating, comment: newComment })
      });
      if (res.ok) {
        toast.success("Review submitted successfully");
        setNewComment("");
        setNewRating(5);
        fetchReviews();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-white font-parkinsans">Product Reviews</h2>

      {/* Write a Review - Only for logged in users who don't own the product */}
      {user && !isOwner && (
        <form onSubmit={handleSubmitReview} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Write a Customer Review</h3>
          
          {/* Star selector */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  className="text-amber-400 hover:scale-110 transition cursor-pointer"
                >
                  <Star
                    size={24}
                    className={star <= newRating ? "fill-amber-400 text-amber-400" : "text-gray-600"}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-gray-300 ml-2">{newRating} of 5 stars</span>
            </div>
          </div>

          {/* Comment input */}
          <div className="space-y-2">
            <label className="block text-sm text-gray-400">Comment</label>
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What did you think of the product? Share your experience..."
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 resize-none font-hind"
            />
          </div>

          <Button type="submit"
           disabled
          //  disabled={submitting}
           className="w-full sm:w-auto bg-black text-white rounded-sm lg:rounded-md hover:bg-gray-900">
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-6">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center bg-gray-900/20 border border-gray-800/40 rounded-xl py-8 text-gray-500 font-hind">
            No reviews yet. {!isOwner ? "Be the first to write a review!" : ""}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review._id} className="bg-gray-900/30 border border-gray-800/50 rounded-xl p-4 space-y-3 font-hind flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {review.buyerImg ? (
                        <BackendImage
                          src={review.buyerImg}
                          alt={review.buyerName}
                          className="h-8 w-8 rounded-full object-cover border border-gray-700"
                         />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-medium text-sm">
                          {review.buyerName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-semibold truncate max-w-[150px]">{review.buyerName}</p>
                        <p className="text-gray-500 text-[10px] truncate max-w-[150px]">{review.buyerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{review.comment}</p>
                </div>
                <div className="text-right pt-2 border-t border-gray-800/40">
                  <span className="text-[10px] text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


