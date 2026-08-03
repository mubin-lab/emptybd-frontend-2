"use client";
import BackendImage from "@/components/shared/BackendImage";

/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/store/authStore";
import Image from "next/image";
import { imageUpload } from "@/src/app/api/img-up/routes";
import { Camera, Building2 } from "lucide-react";
import { UserPost } from "@/components/profile/UserPost";
import Link from "next/link";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { SiMoneygram } from "react-icons/si";
import { GrTransaction } from "react-icons/gr";
import { MdOutlineSupportAgent } from "react-icons/md";
import { TbLogout } from "react-icons/tb";
import { MdDashboard } from "react-icons/md";
import { toast } from "sonner";
import PushNotificationManager from "@/components/shared/PushNotificationManager";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImExit } from "react-icons/im";

import PageHelpPanel from "@/components/shared/PageHelpPanel";
import { ProfileLoading } from "@/components/loading/ProfileLoading";
import TransactionTracker from "@/components/profile/TransactionTracker";
import { Copy } from "lucide-react";
import GettingStartedChecklist from "@/components/dashboard/GettingStartedChecklist";
import AchievementsList from "@/components/profile/AchievementsList";
import PlanBadge from "@/components/shared/PlanBadge";

export default function ProfilePage() {
  const router = useRouter();
  const { user, fetchUser, setUser } = useAuthStore();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [hasOpenedReferralModal, setHasOpenedReferralModal] = useState(false);

  // Crop & Preview State
  const [showCropModal, setShowCropModal] = useState(false);
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      fetchUser().then(() => {
        if (!useAuthStore.getState().user) {
          router.push("/login");
        }
      });
    } else {
      setName(user.name || "");
      setBio(user.bio || "");
      setAddress(user.address || "");
      setFacebook(user.socials?.facebook || "");
      setTwitter(user.socials?.twitter || "");
      setLinkedin(user.socials?.linkedin || "");
      setGithub(user.socials?.github || "");
      setWebsite(user.socials?.website || "");
    }
  }, [user, fetchUser, router]);

  const handleCopyReferral = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success("Referral code copied to clipboard!");
    }
  };

  const processImageForCrop = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate crop dimensions for a centered 1:1 square
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw cropped image maintaining best quality
        ctx.drawImage(img, startX, startY, size, size, 0, 0, size, size);

        // Convert to blob/file
        canvas.toBlob((blob) => {
          if (!blob) return;
          const croppedFile = new File([blob], file.name, {
            type: file.type || "image/jpeg",
            lastModified: Date.now(),
          });
          setCroppedImageFile(croppedFile);
          setPreviewUrl(canvas.toDataURL(file.type || "image/jpeg"));
          setShowCropModal(true);
        }, file.type || "image/jpeg", 1.0); // Maximum quality
      };
    };
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      
      // Process image for automatic square cropping
      processImageForCrop(file);
      
      // Reset input to allow selecting the same file again if canceled
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const confirmAndUploadPhoto = async () => {
    if (!croppedImageFile) return;
    
    setShowCropModal(false);
    setIsUploadingPhoto(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      const imgUrl = await imageUpload(croppedImageFile);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ img: imgUrl }),
      });

      if (!res.ok) throw new Error("Failed to update profile photo");
      
      await fetchUser();
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      setCroppedImageFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token || !user) {
      router.push("/login");
      return;
    }

    const socials = { facebook, twitter, linkedin, github, website };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/profile`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, bio, address, socials }),
      },
    );

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      toast.success("Profile updated successfully!", { position: "top-right" });
    } else {
      toast.error("Failed to update profile details.", { position: "top-right" });
      if (res.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("location_prompt_time");
        useAuthStore.getState().clearUser();
        router.push("/login");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("location_prompt_time"); // Clear onboarding cooldown
    useAuthStore.getState().clearUser();
    toast.success(`${user?.name} You’ve been logged out.`, {
      position: "top-right",
    });
    router.push("/");
    router.refresh();
  };

  const handleApplyReferral = async () => {
    if (!referralCodeInput.trim()) {
      toast.error("Please enter a referral code.");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsApplyingReferral(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/apply-referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referralCode: referralCodeInput.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Referral code applied successfully!");
        await fetchUser(); 
      } else {
        toast.error(data.message || "Failed to apply referral code.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while applying referral code.");
    } finally {
      setIsApplyingReferral(false);
    }
  };

  const handleAdLoad = () => {
    const script = document.createElement("script");
    script.dataset.zone = "11370664";
    script.src = "https://al5sm.com/tag.min.js";
    script.async = true; // যেন পেজ লোডিং ব্লক না হয়
    // বডি বা পেজের শেষে স্ক্রিপ্টটি যুক্ত করা হচ্ছে
    const target = document.body || document.documentElement;
    target.appendChild(script);
    console.log("Ad script loaded!");
  };

  if (!user) return <ProfileLoading />;

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Area (Col span 4): Profile Card & Editing */}
        <div className="lg:col-span-4 bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-24 h-24 mx-auto">
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden ring-4 ring-secondary/20 shadow-md group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <BackendImage src={user.img} alt="user" className="w-full h-full object-cover"  />
                
                {/* Loading overlay */}
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Always visible camera icon badge */}
              {!isUploadingPhoto && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-950 rounded-full p-2 shadow-lg transition-transform hover:scale-110 z-20"
                  title="Update Profile Photo"
                >
                  <Camera size={14} />
                </button>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoChange} 
            />
            
            <div className="flex flex-col items-center text-center justify-center">
              <h5 className="text-lg font-bold flex gap-2 items-center  text-center font-parkinsans text-white leading-tight">
                {user.name} 
                {user.plan === "free" ? (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = '/packages';
                    }}
                    className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-900/40 transition-colors animate-bounce ml-2"
                    title="Upgrade Account"
                  >
                    <span>Upgrade</span>
                  </button>
                ) : (
                  <PlanBadge plan={user.plan} />
                )}
              </h5>
              <p className="text-xs font-medium text-gray-400 mt-1">
                {user.email}
              </p>
            </div>

            {/* Wallet Balance widget */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 mt-4 space-y-3 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-parkinsans">Withdrawable Balance</span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  ৳{Number(user.amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-parkinsans">Locked (Escrow)</span>
                <span className="text-sm font-extrabold text-amber-400 font-mono">
                  ৳{Number(user.escrow_locked || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Referral System Widget */}
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 mt-4 space-y-3 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-gray-850">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-parkinsans font-medium">My Referral Code</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white font-mono bg-gray-850 px-2 py-0.5 rounded border border-gray-800">
                    {user.referral_code || "N/A"}
                  </span>
                  <button 
                    onClick={handleCopyReferral}
                    className="p-1 bg-gray-800 hover:bg-gray-750 text-gray-400 hover:text-white rounded border border-gray-700 transition-colors"
                    title="Copy Code"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center ">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider font-parkinsans font-medium">Successful Referrals</span>
                <span className="text-sm font-extrabold text-primary font-mono flex items-center gap-1.5">
                  {user.referral_count || 0}
                  <button 
                    onClick={() => setShowReferralModal(true)} 
                    className="text-[10px] text-blue-400 hover:underline font-parkinsans font-normal cursor-pointer"
                  >
                    (Info)
                  </button>
                </span>
              </div>
              
              {!user.applied_referral ? (
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Apply a Referral Code</span>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code" 
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value)}
                      className="bg-gray-950 border-gray-800 text-xs h-8"
                    />
                    <Button 
                      // onClick={handleApplyReferral}
                      // disabled={isApplyingReferral || !referralCodeInput}
                      // onClick={handleAdLoad}
                      onClick={()=>router.push('https://omg10.com/4/11370716')}
                      className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-white whitespace-nowrap"
                    >
                      {isApplyingReferral ? "..." : "Apply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pt-1 flex justify-between items-center">
                  {/* <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Applied Referral</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {user.applied_referral}
                  </span> */}
                </div>
              )}
            </div>
          </div>

          {/* Push Notification Manager */}
          <div className="mt-4 mb-6">
            <PushNotificationManager />
          </div>

          {/* Profile Details Update Form (Only Shows Empty Fields) */}
          <div className="space-y-4 pt-5 border-t border-gray-900">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-parkinsans">
              Profile Settings
            </h4>
            
            {(() => {
              const isNameEmpty = !user.name;
              const isBioEmpty = !user.bio;
              const isAddressEmpty = !user.address;
              const isFacebookEmpty = !user.socials?.facebook;
              const isTwitterEmpty = !user.socials?.twitter;
              const isLinkedinEmpty = !user.socials?.linkedin;
              const isGithubEmpty = !user.socials?.github;
              const isWebsiteEmpty = !user.socials?.website;

              const hasAnyEmptySocial = 
                isFacebookEmpty || 
                isTwitterEmpty || 
                isLinkedinEmpty || 
                isGithubEmpty || 
                isWebsiteEmpty;

              const hasAnyEmptyField = 
                isNameEmpty || 
                isBioEmpty || 
                isAddressEmpty || 
                hasAnyEmptySocial;

              if (!hasAnyEmptyField) {
                return (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2 py-6">
                    <span className="text-2xl block">✨</span>
                    <h4 className="text-sm font-bold text-emerald-400 font-parkinsans">
                      Profile 100% Completed
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      All your profile and social settings are fully set up.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {isNameEmpty && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Display Name</label>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter display name"
                        className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-sm text-white focus:ring-secondary/50 focus:border-secondary"
                      />
                    </div>
                  )}

                  {isBioEmpty && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Bio / About</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe yourself..."
                        rows={3}
                        className="w-full bg-gray-900 border border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
                      />
                    </div>
                  )}

                  {isAddressEmpty && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Location</label>
                      <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="City, Country"
                        className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-sm text-white focus:ring-secondary/50 focus:border-secondary"
                      />
                    </div>
                  )}

                  {hasAnyEmptySocial && (
                    <div className="space-y-3 pt-2 border-t border-gray-900/60">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Social Links</label>
                      
                      <div className="space-y-2">
                        {isFacebookEmpty && (
                          <Input
                            type="text"
                            value={facebook}
                            onChange={(e) => setFacebook(e.target.value)}
                            placeholder="Facebook URL"
                            className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                          />
                        )}
                        {isTwitterEmpty && (
                          <Input
                            type="text"
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="Twitter URL"
                            className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                          />
                        )}
                        {isLinkedinEmpty && (
                          <Input
                            type="text"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="LinkedIn URL"
                            className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                          />
                        )}
                        {isGithubEmpty && (
                          <Input
                            type="text"
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            placeholder="GitHub URL"
                            className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                          />
                        )}
                        {isWebsiteEmpty && (
                          <Input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="Personal Website URL"
                            className="bg-gray-900 border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-xs text-white focus:ring-secondary/50 focus:border-secondary"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUpdate}
                    className="w-full bg-black text-white py-2.5 rounded-sm lg:rounded-md text-xs font-semibold hover:opacity-95 transition-all duration-300 cursor-pointer mt-2"
                  >
                    Save Changes
                  </Button>
                </div>
              );
            })()}
          </div>


          {/* Logout Action */}
          <div className="pt-5 border-t border-gray-900">
            <Dialog>
              <DialogTrigger asChild>
                <button  onClick={()=>router.push('https://omg10.com/4/11370716')} className="flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 font-semibold text-sm transition-colors duration-200 cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 px-4 py-2.5 rounded-xl w-full border border-rose-500/10">
                  <TbLogout size={18} />
                  <span>Logout Account</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm p-5 bg-gray-950 border border-gray-900 rounded-2xl">
                <div className="text-center">
                  <ImExit className="w-fit mx-auto text-rose-500 mb-3" size={36} />
                  <DialogHeader>
                    <DialogTitle className="text-base lg:text-lg text-center text-white font-parkinsans">
                      Do you want to log out now, {user?.name}?
                    </DialogTitle>
                  </DialogHeader>
                  <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                      Logout
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Area (Col span 8): Dashboard Charts, Actions, Metadata & Posts */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Tracker */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <TransactionTracker email={user.email} />
          </div>

          {/* Account Verification & Status Details Grid */}
          <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-parkinsans mb-4 pb-2 border-b border-gray-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Verification & Status Checks
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-parkinsans">
              {/* Bid Status */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">Bid Account Status</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  {user.bid_account === "buyer" ? (
                    <>Buyer <span className="text-[10px] text-gray-400 font-normal">(Bid only)</span></>
                  ) : (
                    <>Seller <span className="text-[10px] text-gray-400 font-normal">(Sell & Bid)</span></>
                  )}
                </span>
              </div>

              {/* e-Shop Status */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">e-Shop Account Status</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  {user.product_account === "buyer" ? (
                    <>Buyer <span className="text-[10px] text-gray-400 font-normal">(Buy only)</span></>
                  ) : (
                    <>Seller <span className="text-[10px] text-gray-400 font-normal">(Sell & Buy)</span></>
                  )}
                </span>
              </div>

              {/* Selling Rating */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">Seller Trust Score</span>
                <span className="text-white font-semibold font-mono">
                  {user.selling_status || "0"}/5 
                  <span className="text-[10px] text-gray-400 ml-1 font-normal font-parkinsans">
                    ({user.selling_status === "5" ? "Excellent" : user.selling_status === "4" ? "Very Good" : user.selling_status === "3" ? "Good" : user.selling_status === "2" ? "Average" : "Bad"})
                  </span>
                </span>
              </div>

              {/* Phone Number */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">Linked Phone</span>
                <span className="text-white font-semibold font-mono">
                  {user.phone_number || "Not Linked"}
                </span>
              </div>

              {/* Selfie Verification */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">Selfie Verification</span>
                {user.selfie ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Not Verified</span>
                )}
              </div>

              {/* NID Verification */}
              <div className="flex justify-between items-center py-2 border-b border-gray-900">
                <span className="text-gray-400 font-medium">NID Verification</span>
                {user.nid_img && user.nid_img.length > 0 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Not Verified</span>
                )}
              </div>

              {/* Address */}
              <div className="col-span-1 md:col-span-2 flex justify-between items-start py-2">
                <span className="text-gray-400 font-medium shrink-0 mr-4">Address</span>
                <span className="text-white font-semibold text-right leading-relaxed">
                  {user.address || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* User Posts/Blogs */}
          {/* <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-4 shadow-xl backdrop-blur-md">
            <UserPost email={user.email} />
          </div> */}
        </div>
      </div>

      {/* Referral Benefits Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent className="sm:max-w-md bg-background border border-gray-900 rounded-2xl p-3 lg:p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm md:text-lg font-medium text-center text-white font-bengali mb-2 leading-relaxed">
            আপনার বন্ধুদের ইনভাইট করুন এবং আকর্ষণীয় পুরস্কার জিতুন!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-gray-300 font-bengali"> 
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 lg:p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 pl-1 rounded-full text-xs lg:text-base bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0">
                  ১৫+
                </div>
                <p className="text-xs lg:text-base">
                  আপনার সফল রেফারেল <strong className="text-white">১৫ বা তার বেশি</strong> হলে, আপনি বিনামূল্যে <strong className="text-primary">প্রিমিয়াম প্ল্যান</strong> পাবেন!
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 pl-1 rounded-full text-xs lg:text-base bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">
                  ৩৫+
                </div>
                <p className="text-xs lg:text-base">
                  <strong className="text-white">৩৫ বা তার বেশি</strong> সফল রেফারেল অর্জন করলে আপনি বিনামূল্যে এক্সক্লুসিভ <strong className="text-secondary">ওনারশিপ প্ল্যান</strong> পাবেন!
                </p>
              </div>
            </div>
            
            <div className="text-xs text-center text-gray-500 mt-4 px-4 leading-relaxed">
              * আপনি যত বেশি মানুষকে আমন্ত্রণ জানাবেন, তত বেশি সুবিধা পাবেন। আজই আপনার রেফারেল কোড শেয়ার করা শুরু করুন!
            </div>
          </div>
          <DialogFooter className="mt-1 lg:mt-6 sm:justify-center">
            <Button 
              onClick={() => setShowReferralModal(false)}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-2 lg:py-2.5 rounded-sm lg:rounded-xl font-bengali"
            >
              ঠিক আছে, বুঝতে পেরেছি!
            </Button>
          </DialogFooter>
        </DialogContent>

      </Dialog>
      
      {/* Profile Photo Crop Preview Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="sm:max-w-md bg-gray-950 border border-gray-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-center text-white">
              Preview Profile Photo
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <p className="text-sm text-gray-400 text-center mb-2 leading-relaxed">
              Your photo has been automatically cropped to a perfect square.
            </p>
            {previewUrl && (
              <div className="relative w-40 h-40 rounded-2xl overflow-hidden ring-4 ring-secondary/20 shadow-xl">
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-row gap-3 w-full sm:justify-center mt-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCropModal(false)}
              className="flex-1 bg-transparent border-gray-800 text-gray-300 hover:bg-gray-900 hover:text-white rounded-xl h-11"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmAndUploadPhoto}
              className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl h-11"
            >
              Save Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <PageHelpPanel pageKey="profile" />
    </div>
  );
}

