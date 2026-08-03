"use client";
import BackendImage from "@/components/shared/BackendImage";

import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { videoUpload } from "@/src/app/api/video-up/routes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import { BiArrowBack, BiCloudUpload, BiX, BiVideo } from "react-icons/bi";
import { toast } from "sonner";

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images: string[];
  video_url?: string;
  category: string;
  brand: string;
  sku: string;
  status: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags: string[];
};

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
  };
};

const categories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
  "Beauty",
  "Health",
  "Automotive",
  "Other",
];

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, fetchUser } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

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
        const data: Product = await res.json();
        setProduct(data);
        setPreviewImages(data.images || (data.image ? [data.image] : []));
        setVideoPreview(data.video_url || null);
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

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    image: "",
    images: [],
    video_url: undefined,
    category: "",
    brand: "",
    sku: "",
    status: "active",
    weight: undefined,
    dimensions: {
      length: undefined,
      width: undefined,
      height: undefined,
    },
    tags: [],
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        image: product.image || "",
        images: product.images || (product.image ? [product.image] : []),
        video_url: product.video_url,
        category: product.category || "",
        brand: product.brand || "",
        sku: product.sku || "",
        status: product.status || "active",
        weight: product.weight,
        dimensions: {
          length: product.dimensions?.length,
          width: product.dimensions?.width,
          height: product.dimensions?.height,
        },
        tags: product.tags || [],
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("dimensions.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [key]: value ? Number(value) : undefined,
        },
      }));
    } else if (name === "price" || name === "stock" || name === "weight") {
      setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }));
    } else if (name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: value.split(",").map((tag) => tag.trim()).filter(Boolean),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const imageUrl = await imageUpload(file);
        uploadedUrls.push(imageUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
        image: prev.image || uploadedUrls[0],
      }));
      setPreviewImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : "",
      };
    });
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video size must be under 50MB");
      return;
    }

    setSelectedVideo(file);
    const localUrl = URL.createObjectURL(file);
    setVideoPreview(localUrl);
  };

  const handleVideoUpload = async () => {
    if (!selectedVideo) return;

    setUploadingVideo(true);
    try {
      const videoUrl = await videoUpload(selectedVideo);
      setFormData((prev) => ({ ...prev, video_url: videoUrl }));
      toast.success("Video uploaded successfully");
    } catch (err) {
      console.error("Video upload failed", err);
      toast.error("Video upload failed!");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleRemoveVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
    setFormData((prev) => ({ ...prev, video_url: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      setSaving(false);
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Product description is required");
      setSaving(false);
      return;
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0");
      setSaving(false);
      return;
    }
    if (formData.stock < 0) {
      toast.error("Stock cannot be negative");
      setSaving(false);
      return;
    }

    // Upload video if selected but not uploaded yet
    let videoUrlToSubmit = formData.video_url;
    if (selectedVideo && !formData.video_url) {
      try {
        toast.info("Uploading video...", { duration: 2000 });
        videoUrlToSubmit = await videoUpload(selectedVideo);
        setFormData((prev) => ({ ...prev, video_url: videoUrlToSubmit }));
      } catch (err) {
        console.error("Video upload failed", err);
        toast.error("Video upload failed! Product will be updated without video.");
      }
    }

    const finalFormData = {
      ...formData,
      video_url: videoUrlToSubmit,
    };

    if (user) {
      try {
        const token = localStorage.getItem("auth_token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/update/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(finalFormData),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to update product");
        }

        toast.success("Product updated successfully!");
        router.push(`/e-commerce-products/${id}`);
      } catch (error) {
        console.error(error);
        toast.error("Error updating product!");
      } finally {
        setSaving(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );
  }

  // Check if user is the owner - ONLY owner can edit
  const isOwner =
    product?.owner?.owner_id === user?._id ||
    product?.owner?.owner_email === user?.email;

  // Not the owner - show unauthorized
  if (!isOwner) {
    return (
      <div className="max-w-[1440px] w-[95%] mx-auto py-12">
        <Link prefetch={false}
          href={`/e-commerce-products/${id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <BiArrowBack />
          Back to product
        </Link>
        <Unauthorized description="You are not authorized to edit this product. Only the product owner can make changes." />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-4 md:py-6">
      {/* Back Button */}
      <Link prefetch={false}
        href={`/e-commerce-products/${id}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 md:mb-6 text-sm md:text-base"
      >
        <BiArrowBack className="text-lg" />
        Back to product
      </Link>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto shadow-md rounded-lg space-y-3 md:space-y-4 bg-gray-900/50 p-4 md:p-6 border border-gray-700"
      >
        <h3 className="text-base md:text-lg lg:text-xl font-medium mb-3 md:mb-4 flex items-center gap-2 text-white font-parkinsans">
          <BiCloudUpload className="text-lg md:text-xl" />
          Edit Product
        </h3>

        {/* Basic Information */}
        <div className="space-y-3 md:space-y-4">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Basic Information
          </h4>

          {/* Product Name */}
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Enter product description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Pricing & Stock
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Price (৳) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                placeholder="0.00"
                value={formData.price === 0 ? 0 : formData.price || ""}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                placeholder="0"
                value={formData.stock === 0 ? 0 : formData.stock || ""}
                onChange={handleChange}
                className="input"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Product Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                placeholder="Enter brand name"
                value={formData.brand}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* SKU */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                name="sku"
                placeholder="e.g., PROD-001"
                value={formData.sku}
                onChange={handleChange}
                className="input"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Physical Attributes */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Physical Attributes (Optional)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {/* Weight */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                placeholder="0.00"
                value={formData.weight || ""}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs md:text-sm font-medium mb-2 text-gray-300">
              Dimensions (cm)
            </label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <div>
                <input
                  type="number"
                  name="dimensions.length"
                  placeholder="Length"
                  value={formData.dimensions?.length || ""}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="dimensions.width"
                  placeholder="Width"
                  value={formData.dimensions?.width || ""}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <input
                  type="number"
                  name="dimensions.height"
                  placeholder="Height"
                  value={formData.dimensions?.height || ""}
                  onChange={handleChange}
                  className="input"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images Upload - Multiple */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Product Images <span className="text-red-500">*</span>
          </h4>

          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
              Add More Images (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-gray-300 bg-gray-800 p-2 w-full rounded border border-gray-600 text-xs md:text-sm"
              onChange={handleImageUpload}
            />

            {uploading && (
              <p className="text-xs md:text-sm text-gray-400 mt-2 flex items-center gap-2">
                <SpinnerCustom />
                Uploading images...
              </p>
            )}

            {/* Multiple Images Preview Grid */}
            {previewImages.length > 0 && (
              <div className="mt-3 md:mt-4">
                <p className="text-xs text-gray-400 mb-2">
                  {previewImages.length} image(s) - First image is main
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <BackendImage
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 md:h-24 rounded-lg object-cover border border-gray-600"
                       />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <BiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Upload - Optional, Single Video Only */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Product Video <span className="text-gray-500">(Optional)</span>
          </h4>

          <div>
            {formData.video_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <BiVideo />
                    Video uploaded
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    <BiX className="mr-1" />
                    Remove
                  </Button>
                </div>
                <video
                  src={formData.video_url}
                  controls
                  className="w-full max-w-md rounded-lg border border-gray-600"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : selectedVideo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleVideoUpload}
                    disabled={uploadingVideo}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploadingVideo ? (
                      <>
                        <SpinnerCustom />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <BiCloudUpload className="mr-1" />
                        Upload Video
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveVideo}
                  >
                    <BiX className="mr-1" />
                    Cancel
                  </Button>
                </div>
                {videoPreview && (
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-w-md rounded-lg border border-gray-600"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : (
              <>
                <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
                  Upload Video (Max 1 video, 50MB limit)
                </label>
                <input
                  type="file"
                  accept="video/*"
                  className="text-gray-300 bg-gray-800 p-2 w-full rounded border border-gray-600 text-xs md:text-sm"
                  onChange={handleVideoSelect}
                />
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-700">
          <h4 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wide">
            Tags (Optional)
          </h4>

          <div>
            <label className="block text-xs md:text-sm font-medium mb-1 text-gray-300">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="e.g., featured, new, sale"
              value={formData.tags.join(", ")}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 md:pt-4">
          <Link prefetch={false} href={`/e-commerce-products/${id}`} className="flex-1">
            <Button type="button" variant="outline" className="w-full text-sm">
              Cancel
            </Button>
          </Link>
          <Button
            disabled={saving || uploading}
            type="submit"
            className="flex-1 bg-black text-white py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base"
          >
            {saving ? <SpinnerCustom /> : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
