"use client";
import BackendImage from "@/components/shared/BackendImage";

// NewsForm.tsx
import { SpinnerCustom } from "@/components/loading/Spinner";
import Unauthorized from "@/components/NotFound.tsx/Unauthorized";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useEffect } from "react";
import { BiCloudUpload } from "react-icons/bi";
import { toast } from "sonner";
import RichTextEditor from "@/components/shared/RichTextEditor";

type Author = {
  author_name: string;
  author_img: string;
  author_id: string;
  author_email: string;
  author_plan: string;
  author_selling_status: string;
  author_role: string;
};

type NewsFormData = {
  news_img: string;
  news_title: string;
  news_description: string;
  read_time: number;
  author: Author;
  category: string;
  status: string;
  rating: number;
  reactions: Array<unknown>;
  tags?: string[];
  earnings?: number;
  publish?: string;
  isHome: boolean;
};

export default function NewsForm() {
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const { user, fetchUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  // Dynamic char limit from admin settings (default 140)
  const [charLimit, setCharLimit] = useState(140);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.newsCharLimit) setCharLimit(Number(data.newsCharLimit));
      })
      .catch(() => {
        // silently keep default
      });
  }, []);

  // Auth check
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  const [formData, setFormData] = useState<NewsFormData>({
    news_img: "",
    news_title: "",
    news_description: "",
    read_time: 0,
    author: {
      author_name: user?.name || "",
      author_img: user?.img || "",
      author_id: user?._id || "",
      author_email: user?.email || "",
      author_plan: user?.plan || "",
      author_selling_status: user?.selling_status || "",
      author_role: user?.role || "",
    },
    category: "",
    status: "pending",
    rating: 0,
    reactions: [],
    earnings: 0,
    publish: new Date().toISOString(),
    isHome: false,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        author: {
          ...prev.author,
          author_name: user.name,
          author_img: user.img || "",
          author_id: user._id,
          author_email: user.email,
          author_plan: user.plan,
          author_selling_status: user.selling_status,
          author_role: user.role,
        },
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("author.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        author: { ...prev.author, [key]: value },
      }));
    } else if (name === "tags") {
      setFormData((prev) => ({ ...prev, tags: value.split(",") }));
    } else if (name === "read_time" || name === "rating") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRichTextChange = (value: string) => {
    setFormData((prev) => ({ ...prev, news_description: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await imageUpload(file);
      setFormData((prev) => ({ ...prev, news_img: imageUrl }));
      setPreviewImg(imageUrl);
    } catch (err) {
      console.error("Image upload failed", err);
      toast.error("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (user) {
      try {
        const token = localStorage.getItem("auth_token");

        await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        toast.success(`🎉 Nice! News create successfully!`, {
          position: "top-right",
        });
        router.push("/");
      } catch (error) {
        console.error(error);
        toast.error(`Error submitting news!`, {
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const descLength = formData.news_description.length;
  const hasImage = !!formData.news_img;
  const isDescValid = descLength >= charLimit;
  const canSubmit = isDescValid && !loading && !uploading;

  // Counter colour
  const counterColor =
    descLength >= charLimit
      ? "text-green-400"
      : descLength >= charLimit * 0.7
      ? "text-yellow-400"
      : "text-red-400";

  if (!user)
    return (
      <Unauthorized description="You are not authorized to view this page" />
    );

  return (
    <>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-red-900/30 rounded-xl p-6 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-bold text-red-500 mb-3 font-hind">
              সতর্কীকরণ
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm font-hind">
              দয়া করে কোনো ফেইক, কপি করা, বা AI দিয়ে তৈরি পোস্ট করবেন না। নিজের ফোনে তোলা ছাড়া অন্য কোনো ছবি শেয়ার করবেন না। যদি করেন, তাহলে পোস্ট অ্যাপ্রুভ করা হবে না।
            </p>
            <div className="flex justify-end">
              <Button onClick={() => setShowWarning(false)} className="bg-red-600 hover:bg-red-700 text-white px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    <form
      onSubmit={handleSubmit}
      className="max-w-3xl w-[95%] mx-auto shadow-md rounded-lg space-y-3 md:space-y-4 bg-gray-900/50 p-4 md:p-6 border border-gray-700 mt-3"
    >
      <h3 className="text-lg lg:text-xl font-medium mb-2 flex items-center gap-2">
        Create News <BiCloudUpload />
      </h3>

      <div>
        {/* Label row: title left, live counter right */}
        <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
          <label className="block text-sm font-medium text-gray-300">
            News Description
          </label>
          <span className={`text-xs font-mono font-semibold ${counterColor}`}>
            {descLength} / {charLimit} অক্ষর
            {!isDescValid && descLength > 0 && (
              <span className="text-gray-500 ml-1">
                (আরও {charLimit - descLength}টি দরকার)
              </span>
            )}
          </span>
        </div>

        <RichTextEditor
          value={formData.news_description}
          onChange={handleRichTextChange}
          placeholder={`আপনার নিউজ এখানে লিখুন। কমপক্ষে ${charLimit}টি অক্ষর প্রয়োজন।`}
          className={
            descLength > 0 && !isDescValid
              ? "!border-red-700"
              : descLength >= charLimit
              ? "!border-green-700"
              : "!border-gray-800"
          }
        />

        {descLength > 0 && !isDescValid && (
          <p className="text-xs text-red-400 mt-1">
            পোস্ট করতে আরও {charLimit - descLength}টি অক্ষর লিখতে হবে।
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          নিউজের ছবি আপলোড করুন{" "}
          <span className="text-gray-400 text-xs">(ঐচ্ছিক)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          className={`underline text-gray-300 bg-gray-900 p-2 w-full rounded-sm border-[1px] text-xs lg:text-base transition-colors ${
            hasImage ? "border-green-700" : "border-gray-600"
          }`}
          onChange={handleImageUpload}
        />
        {uploading && (
          <p className="text-xs text-yellow-400 mt-1">ছবি আপলোড হচ্ছে…</p>
        )}
        {previewImg && (
          <BackendImage
            src={previewImg}
            alt="Preview"
            className="mt-4 w-24 h-24 rounded-sm object-cover border border-green-800"
          />
        )}
      </div>

      <Button
        disabled={!canSubmit}
        type="submit"
        className={`w-full py-3 rounded-lg transition-all ${
          canSubmit
            ? "bg-black text-white hover:bg-gray-900"
            : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-60"
        }`}
      >
        {loading ? <SpinnerCustom /> : uploading ? "আপলোড হচ্ছে…" : "পোস্ট করুন"}
      </Button>

      {/* Summary hint below button */}
      {!canSubmit && !loading && !uploading && (
        <p className="text-xs text-center text-gray-500 -mt-1">
          {!isDescValid
            ? `পোস্ট করতে আরও ${charLimit - descLength}টি অক্ষর লিখতে হবে।`
            : ""}
        </p>
      )}
    </form>
    </>
  );
}
