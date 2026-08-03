"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { videoUpload } from "@/src/app/api/video-up/routes";
import { AdType } from "@/components/shared/AdsCard";
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [formData, setFormData] = useState<Partial<AdType> & { file: File | null; linkUrl?: string }>({
    mediaType: "image",
    mediaUrl: "",
    targetPage: "news",
    insertionPosition: 3,
    isActive: true,
    linkUrl: "",
    file: null,
  });

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads`);
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (error) {
      console.error("Failed to fetch ads", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let url = formData.mediaUrl;
      
      if (formData.file) {
        if (formData.mediaType === "image") {
          url = await imageUpload(formData.file);
        } else {
          url = await videoUpload(formData.file);
        }
      }

      if (!url) {
        alert("Media URL is required. Please upload a file.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        mediaType: formData.mediaType,
        mediaUrl: url,
        targetPage: formData.targetPage,
        insertionPosition: Number(formData.insertionPosition),
        isActive: formData.isActive,
        linkUrl: formData.linkUrl,
        title: "Admin Uploaded Ad",
      };

      const endpoint = formData._id 
        ? `${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/${formData._id}` 
        : `${process.env.NEXT_PUBLIC_NODE_API_URL}/ads`;
      
      const method = formData._id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsFormOpen(false);
        setFormData({
          mediaType: "image",
          mediaUrl: "",
          targetPage: "news",
          insertionPosition: 3,
          isActive: true,
          linkUrl: "",
          file: null,
        });
        fetchAds();
      } else {
        alert("Failed to save ad");
      }
    } catch (error) {
      console.error("Submit error", error);
      alert("Error submitting ad");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchAds();
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const toggleActive = async (ad: AdType) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/ads/${ad._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !ad.isActive }),
      });
      if (res.ok) fetchAds();
    } catch (error) {
      console.error("Toggle active error", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-orbitron">Ads Management</h1>
        <Button onClick={() => {
          setFormData({
            mediaType: "image",
            mediaUrl: "",
            targetPage: "news",
            insertionPosition: 3,
            isActive: true,
            linkUrl: "",
            file: null,
          });
          setIsFormOpen(!isFormOpen);
        }}>
          <Plus size={16} className="mr-2" /> Add New Ad
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8 space-y-4">
          <h2 className="text-xl font-semibold mb-4">{formData._id ? "Edit Ad" : "Create New Ad"}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-400">Media Type</label>
              <select 
                name="mediaType" 
                value={formData.mediaType} 
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Target Page</label>
              <select 
                name="targetPage" 
                value={formData.targetPage} 
                onChange={handleInputChange}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white"
              >
                <option value="news">Homepage News</option>
                <option value="bids">Bids Page</option>
                <option value="ecommerce">E-Commerce Page</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Insertion Position (e.g., after every X items)</label>
              <input 
                type="number" 
                name="insertionPosition" 
                value={formData.insertionPosition} 
                onChange={handleInputChange}
                min={1}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Link URL (Optional)</label>
              <input 
                type="url" 
                name="linkUrl" 
                value={formData.linkUrl || ""} 
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full bg-black border border-gray-700 rounded p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Upload Media (File)</label>
              <input 
                type="file" 
                accept={formData.mediaType === "image" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                className="w-full bg-black border border-gray-700 rounded p-1.5 text-white"
                required={!formData.mediaUrl}
              />
            </div>

            <div className="flex items-center mt-6">
              <input 
                type="checkbox" 
                id="isActive" 
                name="isActive" 
                checked={formData.isActive} 
                onChange={handleInputChange}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="isActive" className="text-sm">Is Active</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              {formData._id ? "Update Ad" : "Save Ad"}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-500" /></div>
      ) : ads.length === 0 ? (
        <div className="text-center p-10 bg-gray-900/50 rounded-lg border border-gray-800 text-gray-500">
          No ads found. Create your first ad.
        </div>
      ) : (
        <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-800">
          <table className="w-full text-left">
            <thead className="bg-black/50 text-gray-400 text-sm">
              <tr>
                <th className="p-4">Media</th>
                <th className="p-4">Page</th>
                <th className="p-4">Position</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ads.map((ad) => (
                <tr key={ad._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="p-4">
                    {ad.mediaType === "video" ? (
                      <video src={ad.mediaUrl} className="w-16 h-10 object-cover rounded bg-black" muted />
                    ) : (
                      <BackendImage src={ad.mediaUrl} className="w-16 h-10 object-cover rounded bg-black" alt="Ad"  />
                    )}
                  </td>
                  <td className="p-4 capitalize">{ad.targetPage}</td>
                  <td className="p-4">Every {ad.insertionPosition} items</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleActive(ad)}
                      className={`px-2 py-1 rounded text-xs font-semibold ${ad.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
                    >
                      {ad.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setFormData({ ...ad, file: null });
                        setIsFormOpen(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(ad._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
