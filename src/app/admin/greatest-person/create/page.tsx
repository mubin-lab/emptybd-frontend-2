"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";
import BackendImage from "@/components/shared/BackendImage";

export default function CreateGreatestPersonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  
  const [descEn, setDescEn] = useState("");
  const [descBn, setDescBn] = useState("");
  
  const [locEn, setLocEn] = useState("");
  const [locBn, setLocBn] = useState("");
  
  const [isActive, setIsActive] = useState(true);

  // Additional Fields
  const [publishDate, setPublishDate] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) {
      toast.error("English Title is required.");
      return;
    }

    setLoading(true);
    const payload = {
      img: images,
      title: { English: titleEn, bangla: titleBn },
      description: { English: descEn, bangla: descBn },
      location: { English: locEn, bangla: locBn },
      isactive: isActive,
      like: likeCount,
      share: shareCount,
      createdAt: publishDate || new Date().toISOString(),
      comment: []
    };

    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/greatest-person`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to create person");
      
      toast.success("Greatest Person created successfully!");
      router.push("/admin/greatest-person");
    } catch (err) {
      console.error(err);
      toast.error("Error creating person");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/greatest-person">
            <Button variant="outline" className="border-gray-800 text-gray-300 hover:text-white bg-gray-900">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create Greatest Person</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-gray-900/50 p-6 md:p-8 rounded-xl border border-gray-800">
        
        {/* Images Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Images</h3>
          <div className="flex gap-2">
            <Input 
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Enter Image URL"
              className="bg-gray-950 border-gray-800 text-white flex-1"
            />
            <Button type="button" onClick={handleAddImage} variant="secondary" className="bg-gray-800 hover:bg-gray-700 text-white">Add</Button>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-4">
              {images.map((url, i) => (
                <div key={i} className="relative group rounded border border-gray-800 overflow-hidden bg-gray-950 p-1">
                  <BackendImage src={url} alt={`img-${i}`} className="h-24 w-auto object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Name / Title</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">English <span className="text-red-500">*</span></label>
              <Input required value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bangla</label>
              <Input value={titleBn} onChange={(e) => setTitleBn(e.target.value)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">English Location</label>
              <Input value={locEn} onChange={(e) => setLocEn(e.target.value)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Bangla Location</label>
              <Input value={locBn} onChange={(e) => setLocBn(e.target.value)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Description (Rich Text)</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                English Description
              </label>
              <div className="bg-gray-950 rounded-lg p-2 border border-gray-800 min-h-[300px]">
                <RichTextEditor value={descEn} onChange={setDescEn} placeholder="Write english description here..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Bangla Description
              </label>
              <div className="bg-gray-950 rounded-lg p-2 border border-gray-800 min-h-[300px]">
                <RichTextEditor value={descBn} onChange={setDescBn} placeholder="Write bangla description here..." />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metadata Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Publish Date (createdAt)</label>
              <Input type="datetime-local" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} className="bg-gray-950 border-gray-800 text-white" />
              <p className="text-xs text-gray-500">Leave empty to use current time</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Likes (Initial Value)</label>
              <Input type="number" min="0" value={likeCount} onChange={(e) => setLikeCount(parseInt(e.target.value) || 0)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Shares (Initial Value)</label>
              <Input type="number" min="0" value={shareCount} onChange={(e) => setShareCount(parseInt(e.target.value) || 0)} className="bg-gray-950 border-gray-800 text-white" />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-950 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-white font-semibold cursor-pointer">
              Is Active (Publish Immediately)
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-gray-800 flex justify-end">
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-auto text-lg">
            {loading ? "Saving..." : "Save Person"}
            <Save className="ml-2" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
}
