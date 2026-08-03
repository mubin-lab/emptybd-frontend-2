/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import BackendImage from "@/components/shared/BackendImage";


import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/lib/store/authStore";
import { imageUpload } from "@/src/app/api/img-up/routes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiCloudUpload } from "react-icons/bi";
import { toast } from "sonner";
interface SellerRequestFormData {
  address: string;
  phoneNumber: string;
  profileImage: string;
  nidFront: string;
  nidBack: string;
}

export default function page() {
  const { user, fetchUser, loading } = useAuthStore();
  const router = useRouter();
  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);
  const [formData, setFormData] = useState<SellerRequestFormData>({
    address: "",
    phoneNumber: "",
    profileImage: "",
    nidFront: "",
    nidBack: "",
  });

  const [previews, setPreviews] = useState({
    profileImage: "",
    nidFront: "",
    nidBack: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingStates, setUploadingStates] = useState({
    profileImage: false,
    nidFront: false,
    nidBack: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof typeof previews,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingStates((prev) => ({ ...prev, [fieldName]: true }));

      // Preview set kora
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({
          ...prev,
          [fieldName]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);

      // Image upload kora
      const imageUrl = await imageUpload(file);
      setFormData((prev) => ({ ...prev, [fieldName]: imageUrl }));
    } catch (err) {
      console.error(`${fieldName} upload failed`, err);
      alert("Image upload failed. Please try again.");
      // Preview clear kora if upload fail hoy
      setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
    } finally {
      setUploadingStates((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleRemoveImage = (fieldName: keyof typeof previews) => {
    setFormData((prev) => ({ ...prev, [fieldName]: "" }));
    setPreviews((prev) => ({ ...prev, [fieldName]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("auth_token");
    e.preventDefault();
    setIsSubmitting(true);
    console.log(formData);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/request/bid/seller/${user?._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Success:", data);
        toast.success(`Seller request submitted successfully!`, {
          position: "top-right",
        });
        // router.push("/")
        window.location.reload();
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to submit seller request. Please try again.`, {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if(loading) return <SpinnerCustom />; // Show loading spinner while fetching user data
  if (!user)
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );

  if (user?.bid_account === "pending" || user?.product_account === "seller")
    return (
      <div className="h-60 flex items-center justify-center flex-col">
        <h1 className="text-xl lg:text-4xl font-bold text-white my-4 text-center font-hind ">
          {" "}
          You are already request for seller
          {/* আপনি ইতোমধ্যে সেলার হওয়ার জন্য আবেদন করেছেন। */}
        </h1>
        <p className="text-xs md:text-sm xl:text-lg font-normal font-hind text-center px-3 mb-4">যদি আপনি যোগ্য হন এবং আপনার সব ডকুমেন্ট ঠিক থাকে, তাহলে আপনি নিলাম অথবা ই-কমার্স পদ্ধতিতে আপনার পণ্য বিক্রি করতে পারবেন।</p>
        <Link prefetch={false} href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-[1440px] w-[95%] mx-auto">
        <h1 className="text-2xl lg:text-4xl font-bold text-white mb-4 text-center font-parkinsans">
          Become a Seller
        </h1>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Avatar Section */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative w-28 h-28 mb-4">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-800">
                {previews.profileImage ? (
                  <BackendImage
                    src={previews.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                   />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {uploadingStates.profileImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <span className="px-4 py-2 text-sm lg:text-base bg-black rounded-md flex items-center gap-2">
                <BiCloudUpload />
                {uploadingStates.profileImage
                  ? "Uploading..."
                  : "Upload your selfie"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "profileImage")}
                disabled={uploadingStates.profileImage}
                className="hidden"
              />
            </label>
          </div>

          {/* Address Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Address *</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="Enter your complete address"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className="input"
              placeholder="+880 1XXX-XXXXXX"
            />
          </div>

          {/* NID Upload Section */}
          <div className="space-y-4">
            <h3 className="text-xl lg:text-2xl font-semibold text-white">
              National ID Card *
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* NID Front */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  NID Front Side
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-0 hover:border-green-400 transition-colors">
                  {previews.nidFront ? (
                    <div className="relative">
                      <BackendImage
                        src={previews.nidFront}
                        alt="NID Front"
                        className="w-full h-40 object-cover rounded"
                       />
                      {uploadingStates.nidFront && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      {!uploadingStates.nidFront && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("nidFront")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-40">
                      <svg
                        className="w-7 h-7 text-primary mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-white text-xs lg:text-sm">
                        {uploadingStates.nidFront
                          ? "Uploading..."
                          : "Upload Front Side"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "nidFront")}
                        disabled={uploadingStates.nidFront}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* NID Back */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  NID Back Side
                </label>
                <div className="border-2 border-dashed border-white/30 rounded-lg p-0 hover:border-blue-400 transition-colors">
                  {previews.nidBack ? (
                    <div className="relative">
                      <BackendImage
                        src={previews.nidBack}
                        alt="NID Back"
                        className="w-full h-40 object-cover rounded"
                       />
                      {uploadingStates.nidBack && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      {!uploadingStates.nidBack && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage("nidBack")}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-40">
                      <svg
                        className="w-7 h-7 text-secondary mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-white text-xs lg:text-sm">
                        {uploadingStates.nidBack
                          ? "Uploading..."
                          : "Upload Back Side"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "nidBack")}
                        disabled={uploadingStates.nidBack}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              Object.values(uploadingStates).some((state) => state)
            }
            className="w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? "Submitting..." : "Submit Seller Request"}
          </Button>
        </form>
      </div>
    </div>
  );
}
