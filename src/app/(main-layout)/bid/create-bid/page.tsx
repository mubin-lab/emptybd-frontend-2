"use client";
import BackendImage from "@/components/shared/BackendImage";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { videoUpload } from "@/src/app/api/video-up/routes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreateBidPage() {
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    media_url: "",
    media_type: "image",
    base_price: 0,
    description: "",

    start_bid: 0,
    bidding_price: 0,

    start_bid_time: "",
    end_bid_time: "",
    currency: "BDT",
    user_bidded: [],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const { user, fetchUser } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState(null);
  const router = useRouter();

  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  console.log(user);

const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Only image files are allowed");
    return;
  }

  setSelectedImage(file);

  const localUrl = URL.createObjectURL(file);
  setImagePreview(localUrl);
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


  const uploadSelectedFile = async (): Promise<{
    image_url?: string;
    video_url?: string;
  }> => {
    let image_url = "";
    let video_url = "";

    if (selectedImage) {
      image_url = await imageUpload(selectedImage);
    }

    if (selectedVideo) {
      video_url = await videoUpload(selectedVideo);
    }

    return {
      image_url,
      video_url,
    };
  };

  //    const handleMediaSelect = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  // ) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const isVideo = file.type.startsWith("video/");
  //   const isImage = file.type.startsWith("image/");

  //   if (!isVideo && !isImage) {
  //     toast.error("Only image or video files are allowed");
  //     return;
  //   }

  //   // ❌ video size check (50MB)
  //   if (isVideo && file.size > 50 * 1024 * 1024) {
  //     toast.error("Video size must be under 50MB");
  //     return;
  //   }

  //   setSelectedFile(file);
  //   setPreviewType(isVideo ? "video" : "image");

  //   // 🔥 local preview (no cloud upload)
  //   const localUrl = URL.createObjectURL(file);
  //   setPreviewUrl(localUrl);
  // };

  // const uploadSelectedFile = async (): Promise<{ url: string; type: "image" | "video"; }> => {
  //   if (!selectedFile) throw new Error("No file selected");

  //   const isVideo = selectedFile.type.startsWith("video/");

  //   let url = "";

  //   if (isVideo) {
  //     url = await videoUpload(selectedFile);
  //   } else {
  //     url = await imageUpload(selectedFile);
  //   }

  //   return {
  //     url,
  //     type: isVideo ? "video" : "image",
  //   };
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMsg("Please login first");
      return;
    }

    setLoading(true); // 🔥 start loading

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        alert("Unauthorized! Please login again.");
        return;
      }

      // 🔥 upload here (NOT on select)
      const { image_url, video_url } = await uploadSelectedFile();

      const payload = {
        seller: {
          seller_id: user._id,
          email: user.email,
          seller_img: user.img,
          seller_name: user.name,
          seller_plan: user.plan,
          selling_status: user.selling_status,
        },
        product: {
          title: form.title,
          image_url: image_url || null,
          video_url: video_url || null,
          base_price: Number(form.base_price),
          description: form.description,
        },
        start_bid: Number(form.base_price),
        bidding_price: 0,
        start_bid_time: new Date(),
        end_bid_time: form.end_bid_time,
        currency: "",
        user_bidded: [],
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Bid creation failed");
      }

      // 📧 Send email
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Your bid has been created!",
          text: `Hi ${user.name}, your bid "${form.title}" has been successfully created.`,
        }),
      });

      if (!emailRes.ok) {
        throw new Error("Email sending failed");
      }
      toast.success(`🎉 Nice!  Bid created successfully!`, {
        position: "top-right",
      });
      router.push("/"); // ✅ redirect after success
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false); // ✅ stop loading (success বা error যাই হোক)
    }
  };

  const getLocalDateTimeMin = () => {
    const now = new Date();

    // ⏰ minimum 9 minutes gap
    now.setMinutes(now.getMinutes() + 9);

    // 🌍 local time fix (important)
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    return now.toISOString().slice(0, 16);
  };

  if (user?.bid_account !== "seller")
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto  ">
     
      <h3 className="text-lg lg:text-xl font-medium mb-2">Create New Bid</h3>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto shadow-md rounded-lg space-y-3 md:space-y-4 bg-gray-900/50 p-4 md:p-6 border border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-1 font-parkinsans">
            Short Title*
          </label>
          <input
            name="title"
            placeholder="Product Title"
            className="input"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 font-parkinsans">
            Image Upload
          </label>
          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            className="input"
            onChange={handleImageSelect}
          />  {imagePreview && (
            <BackendImage
              src={imagePreview}
              className="mt-4 w-[50%]   rounded object-cover"
             />
          )} 
        </div>


        <div>
          <label className="block text-sm font-medium mb-1 font-parkinsans">
             Video Upload
          </label> 

          {/* Video Upload */}
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="input"
            onChange={handleVideoSelect}
          />
 

<div className="flex items-center">
{videoPreview && (
            <video
              src={videoPreview}
              controls
              className="mt-4 w-[50%] max-w-md rounded"
            />
          )}
           
</div>
          
        </div>

        {/* <select name="media_type" className="input" onChange={handleChange}>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select> */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 font-parkinsans">
              Base Price (৳)*
            </label>
            <input
              name="base_price"
              type="number"
              placeholder="Base Price"
              className="input"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 font-parkinsans">
              End Bid Time*
            </label>
            <input
              name="end_bid_time"
              type="datetime-local"
              className="input cursor-pointer"
              min={getLocalDateTimeMin()}
              onKeyDown={(e) => e.preventDefault()}
              onPaste={(e) => e.preventDefault()}
              onChange={handleChange}
            />
          </div>
          {/* <input
            name="start_bid"
            type="number"
            placeholder="Start Bid"
            className="input"
            onChange={handleChange}
          /> */}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 font-parkinsans">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Product Description (optional)"
            className="input"
            onChange={handleChange}
          />
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <input
            name="bidding_price"
            type="number"
            placeholder="Current Bidding Price"
            className="input"
            onChange={handleChange}
          /> 
        </div> */}

        <div className="grid grid-cols-2 gap-4">
          {/* <input
            name="start_bid_time"
            type="datetime-local"
            className="input"
            onChange={handleChange}
          /> */}
          {/* minimum 10 minutes gap */}
        </div>

        {/* <select
          name="currency"
          className="input"
          onChange={handleChange}
        >
          <option value="BDT">BDT</option>
          <option value="USD">USD</option>
        </select> */}

        <Button
          disabled={loading}
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {loading ? <SpinnerCustom /> : "Create Bid"}
        </Button>
      </form>
    </div>
  );
}
