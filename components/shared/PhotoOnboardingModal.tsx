"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import BackendImage from "./BackendImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PhotoOnboardingModal() {
  const { user, fetchUser } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only check once user is loaded
    if (!user) return;

    const hasSeen = localStorage.getItem("hasSeenPhotoOnboarding");
    if (!hasSeen) {
      // Small delay to ensure smooth loading over other elements
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    localStorage.setItem("hasSeenPhotoOnboarding", "true");
    setIsOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setIsUploading(true);
    const token = localStorage.getItem("auth_token");

    try {
      // 1. Upload to imgbb
      const imgUrl = await imageUpload(selectedImage);

      // 2. Patch user profile
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ img: imgUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      // 3. Sync global state
      await fetchUser();
      
      toast.success("Profile photo updated successfully!");
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md bg-gray-950/90 border border-gray-800 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden text-white">
        
        {/* Header styling */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 relative bg-gradient-to-br from-blue-900/10 to-indigo-900/10">
          <div className="absolute top-4 right-4">
            <button 
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <DialogTitle className="text-xl font-bold font-parkinsans text-center">
            Set Your Profile Photo
          </DialogTitle>
          <p className="text-sm text-gray-400 text-center mt-2 font-hind">
            Make your profile stand out so buyers and sellers can recognize you easily.
          </p>
        </div>

        <div className="p-6 flex flex-col items-center">
          
          {/* Avatar Preview */}
          <div className="relative group cursor-pointer mb-6" onClick={() => fileInputRef.current?.click()}>
            <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-800 relative bg-gray-900 shadow-xl transition-all duration-300 group-hover:ring-blue-500/50">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : user.img ? (
                <BackendImage src={user.img} alt="Current Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon size={32} className="mb-2 opacity-50" />
                  <span className="text-xs font-semibold uppercase tracking-wider">No Photo</span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="text-white mb-1" size={24} />
                <span className="text-white text-xs font-semibold">Change</span>
              </div>
            </div>
            
            {/* Upload indicator icon */}
            <div className="absolute bottom-0 right-0 bg-blue-600 z-10 rounded-full p-2 ring-4 ring-gray-950 shadow-lg">
              <Camera size={16} className="text-white" />
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-3 mt-2">
            <button
              onClick={selectedImage ? handleUpload : () => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_-4px_rgba(59,130,246,0.5)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : selectedImage ? (
                "Save Profile Photo"
              ) : (
                "Select a Photo"
              )}
            </button>
            
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition-all duration-300 active:scale-[0.98] border border-white/5 disabled:opacity-50"
            >
              Skip for Now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
