"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import TimeAgo from "@/components/short-component/TimeAgo";
import Countdown from "@/components/short-component/Countdown";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaRegNewspaper,
  FaShoppingBag,
  FaGavel,
  FaStar,
} from "react-icons/fa";
import { BsArrowLeft, BsShieldCheck } from "react-icons/bs";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { IoMdShareAlt } from "react-icons/io";
import { BsDoorOpenFill } from "react-icons/bs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ShareBottomSheet from "@/components/news/ShareBottomSheet";
import PageHelpPanel from "@/components/shared/PageHelpPanel";


type PublicUser = {
  _id: string;
  name: string;
  img?: string;
  createdAt?: string | Date;
  role?: string;
  plan?: string;
  selling_status?: string;
  bid_account?: string;
  product_account?: string;
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

type NewsItem = {
  _id: string;
  news_description: string;
  news_img?: string;
  publish?: string | Date;
  reactions: string[];
};

type EProduct = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  category: string;
  status: string;
};

type BidItem = {
  _id: string;
  product: {
    title: string;
    media_url: string;
    media_type: string;
    base_price: number;
    image_url?: string;
  };
  bidding_price: number;
  start_bid: number;
  end_bid_time: string;
  user_bidded: any[];
};

type ProfileResponse = {
  user: PublicUser;
  stats: {
    postsCount: number;
    productsCount: number;
    bidsCount: number;
  };
  posts: NewsItem[];
  products: EProduct[];
  bids: BidItem[];
};

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const email = rawId ? decodeURIComponent(rawId) : "";

  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"news" | "products" | "bids">("news");
  const [activeShareNews, setActiveShareNews] = useState<any | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Set the default tab dynamically based on where user has active items
  useEffect(() => {
    if (profile) {
      if (profile.stats.postsCount > 0) {
        setActiveTab("news");
      } else if (profile.stats.productsCount > 0) {
        setActiveTab("products");
      } else if (profile.stats.bidsCount > 0) {
        setActiveTab("bids");
      }
    }
  }, [profile]);

  const handleReaction = async (newsId: string) => {
    if (!currentUser?.email) return;

    const token = localStorage.getItem("auth_token");

    // Optimistic update
    setProfile((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        posts: prev.posts.map((item) =>
          item._id === newsId
            ? {
              ...item,
              reactions: item.reactions.includes(currentUser.email)
                ? item.reactions.filter((e) => e !== currentUser.email)
                : [...item.reactions, currentUser.email],
            }
            : item
        ),
      };
    });

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/${newsId}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userEmail: currentUser.email }),
        }
      );
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };


  useEffect(() => {
    if (!email) return;

    const fetchPublicProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/public/${encodeURIComponent(email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch public profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error loading public profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [email]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-4 bg-background">
        <SpinnerCustom />
        {/* <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border-t-2 border-r-2 border-primary animate-spin"></div>
          <div className="absolute w-14 h-14 rounded-full border-b-2 border-l-2 border-secondary animate-spin-reverse"></div>
        </div>
        <p className="text-gray-400 text-sm font-parkinsans tracking-wide animate-pulse mt-4">Loading public portfolio...</p> */}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl w-[95%] mx-auto py-16 text-center">
        <div className="bg-black/30 border border-white/5 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <Empty description="The user profile you are looking for could not be found or does not exist." />
          <Button onClick={() => router.push("/")} className="mt-8 bg-black text-white font-semibold rounded-sm lg:rounded-md px-6 py-2.5 hover:opacity-95 transition-all">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const { user, stats, posts, products, bids } = profile;

  // Format date safely
  const formattedJoinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "Unknown Date";

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 md:py-10 text-white font-parkinsans">
      {/* Back navigation button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-6 group cursor-pointer transition-all duration-200"
      >
        <BsArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200 text-primary" size={18} />
        <span>Back</span>
      </button>

      {/* Main Container Wrapper */}
      <div className="space-y-8">

        {/* Full-width Profile Header Banner & Card Section */}
        <div className="bg-gray-950/80 border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl relative">
          
          {/* Cover Photo Glow Background Banner */}
          <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-950 via-[#021324] to-slate-950 relative overflow-hidden border-b border-white/5">
            {/* Ambient Lighting Orbs */}
            <div className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[100px] animate-pulse" />
            <div className="absolute top-[-50px] right-[15%] w-[300px] h-[300px] rounded-full bg-purple-500/10 blur-[90px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8))] pointer-events-none" />
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>

          {/* Profile details alignment overlay */}
          <div className="px-6 md:px-8 pb-8 pt-0 relative z-10">
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between -mt-20 md:-mt-24 gap-6 w-full">

              {/* Left Side: Glowing Avatar + Name Info */}
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full lg:w-auto">
                {/* Glowing Avatar Frame */}
                <div className="relative w-36 h-36 md:w-40 md:h-40 rounded-full p-[3px] bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(147,51,234,0.3)] transform hover:scale-[1.02] transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-slate-950">
                    {user.img ? (
                      <BackendImage src={user.img} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-5xl font-extrabold font-parkinsans">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Info and Badges */}
                <div className="space-y-3 pb-1">
                  <div className="flex items-center gap-2 md:gap-3 justify-center md:justify-start flex-wrap">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-parkinsans text-white tracking-tight leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                      {user.name}
                    </h1>
                    <div className="flex justify-center items-center gap-1.5">
                      {user.plan === "premium" && (
                        <span title="Premium Verification Status">
                          <svg width="20" height="20" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(0,106,255,0.8)]">
                            <defs>
                              <radialGradient id="blue-verify-glow">
                                <stop offset="0%" stopColor="#4dabf7" />
                                <stop offset="60%" stopColor="#006aff" />
                                <stop offset="100%" stopColor="#0050cc" />
                              </radialGradient>
                            </defs>
                            <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue-verify-glow)" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                          </svg>
                        </span>
                      )}
                      {user.plan === "owner" && (
                        <span title="Ownership Verified">
                          <svg width="20" height="20" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_8px_rgba(255,181,22,0.8)]">
                            <defs>
                              <radialGradient id="gold-verify-glow">
                                <stop offset="0%" stopColor="#ffdd80" />
                                <stop offset="60%" stopColor="#ffb516" />
                                <stop offset="100%" stopColor="#e89f00" />
                              </radialGradient>
                            </defs>
                            <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold-verify-glow)" />
                            <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plan & Role badging */}
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    {user.plan === "free" && (
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-white/5 border border-white/10 text-gray-400">
                        STANDARD MEMBER
                      </span>
                    )}
                    {user.plan === "premium" && (
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10">
                        PREMIUM USER
                      </span>
                    )}
                    {user.plan === "owner" && (
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10">
                        PLATFORM OWNER
                      </span>
                    )}
                    {user.role === "admin" && (
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-rose-500/10 border border-rose-500/30 text-rose-450">
                        ADMINISTRATOR
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium font-parkinsans md:ml-1 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
                      <FaCalendarAlt size={11} className="text-purple-400" />
                      <span>Joined {formattedJoinDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Trust Score + Actions */}
              <div className="flex flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {user.selling_status && user.selling_status !== "0" && (
                    <div className="flex items-center gap-2.5 bg-slate-900/80 border border-blue-500/20 px-4 py-2 rounded-2xl shadow-lg backdrop-blur-md">
                      <span className="text-xs text-gray-400 font-medium">Trust Score:</span>
                      <div className="flex items-center gap-1.5 text-yellow-400">
                        <span className="font-extrabold text-sm font-orbitron">{user.selling_status}.0</span>
                        <div className="flex text-yellow-400 text-[10px]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} className={i < Number(user.selling_status) ? "fill-current" : "text-gray-800"} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Action Button */}
                  {/* {currentUser?.email && currentUser.email !== email && (
                    <Link prefetch={false}
                      href={`/messages?email=${encodeURIComponent(email)}`}
                      className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <span>Send Message</span>
                    </Link>
                  )} */}
                </div>

                {/* Social icons */}
                {user.socials && Object.values(user.socials).some((link) => link) && (
                  <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    {user.socials.facebook && (
                      <a
                        href={user.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-white/5 text-gray-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-955/20 transition-all duration-300 cursor-pointer"
                      >
                        <FaFacebook size={14} />
                      </a>
                    )}
                    {user.socials.twitter && (
                      <a
                        href={user.socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-white/5 text-gray-400 hover:text-white hover:border-sky-400/50 hover:bg-sky-955/20 transition-all duration-300 cursor-pointer"
                      >
                        <FaTwitter size={14} />
                      </a>
                    )}
                    {user.socials.linkedin && (
                      <a
                        href={user.socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-white/5 text-gray-400 hover:text-white hover:border-blue-600/50 hover:bg-blue-955/30 transition-all duration-300 cursor-pointer"
                      >
                        <FaLinkedin size={14} />
                      </a>
                    )}
                    {user.socials.github && (
                      <a
                        href={user.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-white/5 text-gray-400 hover:text-white hover:border-gray-500/50 hover:bg-gray-900/20 transition-all duration-300 cursor-pointer"
                      >
                        <FaGithub size={14} />
                      </a>
                    )}
                    {user.socials.website && (
                      <a
                        href={user.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-white/5 text-gray-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-955/20 transition-all duration-300 cursor-pointer"
                      >
                        <FaGlobe size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* User Bio and Location */}
        {user.bio || user.address ? (
          <div className="bg-gray-950/40 border border-gray-900 rounded-3xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            {user.bio && (
              <div className="flex-1 space-y-2">
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-parkinsans">Bio & Info</h2>
                <p className="text-sm text-gray-300 leading-relaxed font-hind whitespace-pre-line font-medium max-w-4xl">
                  {user.bio}
                </p>
              </div>
            )}

            {/* Location and verifications card */}
            <div className="flex flex-wrap gap-4 text-xs shrink-0 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              {user.address && (
                <div className="bg-slate-900/30 border border-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                  <FaMapMarkerAlt className="text-pink-500" />
                  <div className="text-[10px] sm:text-xs">
                    <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Location</span>
                    <span className="text-white font-semibold">{user.address}</span>
                  </div>
                </div>
              )}
              <div className="bg-slate-900/30 border border-white/5 px-4 py-2.5 rounded-2xl flex items-center gap-2.5">
                <BsShieldCheck className="text-emerald-400" />
                <div className="text-[10px] sm:text-xs">
                  <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider">Verification</span>
                  <span className="text-emerald-400 font-bold">VERIFIED PROFILE</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Custom Stats Panel Dashboard Grid */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-gradient-to-br from-blue-600/10 to-indigo-650/5 border border-blue-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/10 rounded-full blur-lg pointer-events-none group-hover:scale-150 transition-all duration-500" />
            <FaRegNewspaper size={18} className="text-blue-400 mb-2" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">News Posts</span>
            <span className="text-2xl font-extrabold text-white mt-1 font-orbitron">{stats.postsCount}</span>
          </div>

          <div className="bg-gradient-to-br from-purple-600/10 to-pink-650/5 border border-purple-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-purple-500/10 rounded-full blur-lg pointer-events-none group-hover:scale-150 transition-all duration-500" />
            <FaShoppingBag size={18} className="text-purple-400 mb-2" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Shop Products</span>
            <span className="text-2xl font-extrabold text-white mt-1 font-orbitron">{stats.productsCount}</span>
          </div>

          <div className="bg-gradient-to-br from-orange-600/10 to-amber-650/5 border border-orange-500/10 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/10 rounded-full blur-lg pointer-events-none group-hover:scale-150 transition-all duration-500" />
            <FaGavel size={18} className="text-orange-400 mb-2" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Bids</span>
            <span className="text-2xl font-extrabold text-white mt-1 font-orbitron">{stats.bidsCount}</span>
          </div>
        </div>

        {/* Dynamic Tabbed Navigation */}
        <div className="flex justify-center w-full mt-4">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2.5 p-1.5 bg-slate-900/55 backdrop-blur-xl border border-white/5 rounded-3xl w-full sm:w-auto shadow-inner">
            <button
              onClick={() => setActiveTab("news")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-bold font-parkinsans tracking-wide transition-all duration-300 cursor-pointer ${activeTab === "news"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <FaRegNewspaper size={13} />
              <span>News Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-bold font-parkinsans tracking-wide transition-all duration-300 cursor-pointer ${activeTab === "products"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <FaShoppingBag size={13} />
              <span>Products</span>
            </button>

            <button
              onClick={() => setActiveTab("bids")}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] sm:text-xs font-bold font-parkinsans tracking-wide transition-all duration-300 cursor-pointer ${activeTab === "bids"
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
            >
              <FaGavel size={13} />
              <span>Auctions</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display Area */}
        <div className="w-full">

          {/* Tab 1: News Feed (Social Stream) */}
          {activeTab === "news" && (
            <div className="max-w-2xl w-full mx-auto space-y-3">
              {posts.length === 0 ? (
                <div className="bg-black/30 border border-white/5 p-8 rounded-3xl backdrop-blur-md text-center py-12">
                  <Empty description="No news posts by this author." />
                </div>
              ) : (
                posts.map((post) => {
                  const hasReacted = currentUser?.email && post.reactions.includes(currentUser.email);

                  return (
                    <div
                      key={post._id}
                      className="p-3 rounded-2xl shadow-lg hover:shadow-2xl/15 bg-gray-950/70 border border-gray-900 backdrop-blur-md transition-all duration-300"
                    >
                      {/* Post Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-950 ring-2 ring-gray-800 flex items-center justify-center text-white text-lg font-bold">
                            {user.img ? (
                              <BackendImage src={user.img} alt={user.name} className="h-full w-full object-cover"  />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm lg:text-base font-semibold font-parkinsans flex items-center gap-1.5 text-white">
                              {user.name}
                              {user.plan === "premium" && (
                                <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <radialGradient id="blue-glow">
                                      <stop offset="0%" stopColor="#4dabf7" />
                                      <stop offset="60%" stopColor="#006aff" />
                                      <stop offset="100%" stopColor="#0050cc" />
                                    </radialGradient>
                                  </defs>
                                  <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue-glow)" />
                                  <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                                </svg>
                              )}
                              {(user.plan === "owner" || user.role === "admin") && (
                                <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <radialGradient id="gold-glow">
                                      <stop offset="0%" stopColor="#ffdd80" />
                                      <stop offset="60%" stopColor="#ffb516" />
                                      <stop offset="100%" stopColor="#e89f00" />
                                    </radialGradient>
                                  </defs>
                                  <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold-glow)" />
                                  <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" strokeWidth="1.35" fill="none" />
                                </svg>
                              )}
                            </h5>
                            <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium font-parkinsans text-gray-400">
                              {post.publish && <TimeAgo date={post.publish} className="text-[11px] text-gray-400 font-medium" />}
                              <span>ago</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveShareNews({
                              ...post,
                              author: {
                                author_name: user.name,
                                author_img: user.img || "",
                                author_email: email,
                                author_plan: user.plan
                              }
                            });
                            setIsShareOpen(true);
                          }}
                          className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-gray-900 rounded-full cursor-pointer"
                        >
                          <IoMdShareAlt size={20} />
                        </button>
                      </div>

                      {/* Post Body */}
                      <div>
                        <Link prefetch={false} href={`/news/${post._id}`} className="block group">
                          <p className="text-xs lg:text-sm font-medium font-hind mt-3 text-gray-300 leading-relaxed hover:text-white transition-colors duration-200 cursor-pointer">
                            {post.news_description}
                          </p>
                        </Link>

                        {post.news_img && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <div className="overflow-hidden rounded-lg border border-gray-900 my-3 cursor-pointer group">
                                <BackendImage
                                  src={post.news_img}
                                  alt="banner"
                                  className="max-w-[100%] w-full max-h-80 mx-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                 />
                              </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md p-2 bg-black/90 border border-gray-900 shadow-2xl rounded-xl flex items-center justify-center">
                              <DialogHeader className="w-full">
                                <DialogTitle className="text-base lg:text-lg hidden">Image Preview</DialogTitle>
                                <BackendImage
                                  src={post.news_img}
                                  alt="banner"
                                  className="w-full max-h-[80vh] object-contain rounded-lg mx-auto"
                                 />
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {/* Post Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-900 mt-4">
                        {currentUser?.email ? (
                          <button
                            onClick={() => !hasReacted && handleReaction(post._id)}
                            className={`text-xs lg:text-sm font-medium flex items-center gap-1.5 transition-all duration-200 select-none ${hasReacted
                                ? "text-secondary cursor-default"
                                : "text-gray-400 hover:text-white hover:scale-105 active:scale-95 cursor-pointer"
                              }`}
                          >
                            {hasReacted ? (
                              <AiFillLike size={20} className="text-secondary" />
                            ) : (
                              <AiOutlineLike size={20} />
                            )}
                            <span>{post.reactions?.length || 0} Impressed</span>
                          </button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="text-xs lg:text-sm text-gray-400 hover:text-white hover:scale-105 active:scale-95 font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200">
                                <AiOutlineLike size={20} />
                                <span>{post.reactions?.length || 0} Impressed</span>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm p-5 bg-gray-950 border border-gray-900 rounded-xl">
                              <DialogHeader>
                                <BsDoorOpenFill className="w-fit mx-auto text-primary" size={36} />
                                <DialogTitle className="text-base lg:text-lg text-center text-white font-parkinsans">
                                  Please login to your account.
                                </DialogTitle>
                              </DialogHeader>
                              <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
                                <DialogClose asChild>
                                  <Button variant="outline" className="border-gray-800 text-gray-400 hover:text-white">Cancel</Button>
                                </DialogClose>
                                <Button className="bg-black text-white rounded-sm lg:rounded-md hover:opacity-90">
                                  <Link prefetch={false} href="/login" className="w-full">Login</Link>
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-orbitron bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="text-[10px] text-gray-400 font-parkinsans font-normal">Earn:</span>
                          <span>{((post.reactions?.length || 0) * 1.3).toFixed(2)}</span>
                          <span className="text-[11px] font-normal">৳</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Products Catalog Grid */}
          {activeTab === "products" && (
            <div className="w-full">
              {products.length === 0 ? (
                <div className="bg-black/30 border border-white/5 p-8 rounded-3xl backdrop-blur-md text-center py-12 max-w-2xl mx-auto">
                  <Empty description="No listed items found." />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                  {products.map((product) => {
                    const firstImage = product.image;

                    return (
                      <div
                        key={product._id}
                        className="bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-800/30 flex flex-col justify-between"
                      >
                        <Link prefetch={false} href={`/e-commerce-products/${product._id}`} className="block flex-1">
                          <div className="relative overflow-hidden aspect-square w-full bg-gray-950 flex items-center justify-center border-b border-gray-800/20">
                            {firstImage ? (
                              <BackendImage
                                src={firstImage}
                                alt={product.name}
                                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                               />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No Image</span>
                              </div>
                            )}

                            {/* Category Badge overlay */}
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-extrabold uppercase bg-black/60 text-purple-400 border border-purple-500/20 backdrop-blur-sm">
                              {product.category}
                            </span>
                          </div>

                          <div className="p-3 space-y-1.5">
                            <h3 className="text-xs font-semibold font-parkinsans text-white line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
                              {product.name}
                            </h3>
                          </div>
                        </Link>

                        <div className="p-3 pt-0 border-t border-white/5 mt-2">
                          <div className="flex items-center justify-between gap-1.5 pt-2 text-[10px] sm:text-xs">
                            <span className="font-extrabold text-white font-orbitron text-sm">
                              {product.price.toLocaleString()}৳
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[9px] ${product.stock > 0
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                }`}
                            >
                              {product.stock > 0 ? `${product.stock} In Stock` : "Sold"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Live Auctions Grid */}
          {activeTab === "bids" && (
            <div className="w-full">
              {bids.length === 0 ? (
                <div className="bg-black/30 border border-white/5 p-8 rounded-3xl backdrop-blur-md text-center py-12 max-w-2xl mx-auto">
                  <Empty description="No auctions available." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                  {bids.map((bid) => {
                    const mediaUrl = bid.product.media_url || bid.product.image_url;

                    return (
                      <div
                        key={bid._id}
                        className="bg-black/30 border border-white/5 rounded-3xl p-4 backdrop-blur-xl flex flex-col justify-between group shadow-xl hover:border-secondary/20 hover:shadow-secondary/5 transition-all duration-300"
                      >
                        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                          {bid.product.media_type === "video" ? (
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                              loop
                              autoPlay
                            />
                          ) : (
                            <BackendImage
                              src={mediaUrl}
                              alt={bid.product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                             />
                          )}

                          {/* Countdown clock badge floating top-right */}
                          <div className="absolute top-3 right-3 z-10 bg-black/60 border border-white/10 px-2.5 py-1 rounded-xl backdrop-blur-md flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                            <Countdown
                              endTime={bid.end_bid_time}
                              className="text-[10px] font-bold text-white font-orbitron"
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-secondary transition-colors font-parkinsans">
                              {bid.product.title}
                            </h4>
                            <div className="flex justify-between items-center mt-2.5 text-xs">
                              <span className="text-gray-400">Base Price:</span>
                              <span className="text-gray-300 font-medium font-orbitron">{bid.start_bid?.toLocaleString()}৳</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-3.5">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Current Bid</span>
                              <span className="text-green-400 font-extrabold font-orbitron text-base leading-tight">
                                {bid.bidding_price.toLocaleString()}৳
                              </span>
                            </div>

                            <Link prefetch={false} href={`/bid/all-selling-product/${bid._id}`} className="shrink-0">
                              <button className="bg-black text-white font-bold text-xs px-4 py-2 rounded-sm lg:rounded-md hover:bg-gray-900 transition-all cursor-pointer">
                                Bid Now
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Global Share Sheet Wrapper */}
        <ShareBottomSheet
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          news={activeShareNews}
        />
        
        <PageHelpPanel pageKey="userProfile" />
      </div>
    </div>
  );
}


