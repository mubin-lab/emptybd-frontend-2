"use client";
import BackendImage from "@/components/shared/BackendImage";

 
import TandingBids from "@/components/home/TandingBids";
import { ProfileLoading } from "@/components/loading/ProfileLoading"; 
import { useAuthStore } from "@/lib/store/authStore"; 
import Link from "next/link";
import { useEffect } from "react"; 
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { BsDoorOpenFill } from "react-icons/bs";
import AllNews from "./news/AllNews";
import TasksSlider from "./news/TasksSlider";
import { Plus } from "lucide-react";
import TutorialModals from "@/components/home/TutorialModals";
import { FaPlayCircle } from "react-icons/fa";
import { useState } from "react";
import PageHelpPanel from "@/components/shared/PageHelpPanel";
import FamousNews from "@/components/home/FamousNews";
import AdsCard from "@/components/shared/AdsCard";
import PlanBadge from "@/components/shared/PlanBadge";
import LeftSidebar from "@/components/home/LeftSidebar";
import RightSidebar from "@/components/home/RightSidebar";

export default function Home() {
  const { user, fetchUser, loading } = useAuthStore();
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  // Auth check
  // useEffect(() => {
  //   if (!user) {
  //     fetchUser();
  //   }
  // }, [user, fetchUser]);

  // Tutorial Auto-Open Logic
  useEffect(() => {
    if (!loading && !user) {
      const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
      if (!hasSeenTutorial) {
        setIsTutorialOpen(false);
      }
    }
  }, [loading, user]);

  const handleTutorialFirstClose = () => {
    localStorage.setItem("hasSeenTutorial", "true");
  };

  const adData = {
    id: "ad-123",
    media_url:
      "https://i5.walmartimages.com/seo/Gardner-Bender-HST-093W-Polyolefin-Heat-Shrink-Tubes-Thin-Wall-White_ceed60f3-0b11-42e9-bce9-9a5f2d893925_1.e98370e2ea655bc94d8010f2287c1b5c.jpeg",
    media_type: "img",
    media_link: "https://sponsor.com/offer",
    sponsor_by: "TATA",
  };

  if (loading) return <ProfileLoading />;
  return (
    <div>
      <div className="max-w-[1440px] w-[95%] mx-auto flex items-center justify-between pb-3 mb-3 lg:mb-6 border-b border-gray-600 gap-5 mt-4">
        {user && (
          <Link prefetch={false} href="/profile" className="flex items-center gap-3 flex-1 cursor-pointer">
            <BackendImage src={user.img} alt={user.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-secondary/40"  />
            <div>
              <h5 className="text-sm lg:text-base font-semibold flex gap-2 font-parkinsans text-white leading-tight">
                {user.name} 
                
                {user.plan === "free" ?<button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = '/packages';
                  }}
                  className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-900/40 transition-colors animate-bounce ml-2"
                  title="Upgrade Account"
                >
                  {/* <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> */}
                  <span>Upgrade</span>
                </button> :<PlanBadge plan={user.plan} /> }
                
              </h5>
              {/* <h5 className="text-[10px] lg:text-sm mt-0.5 text-gray-400 font-medium leading-tight">
                {user?.phone_number}
              </h5> */}
              <div className="flex items-center gap-1.5" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (user?._id) {
                  navigator.clipboard.writeText(user._id);
                  const { toast } = require("sonner");
                  toast.success("User ID copied to clipboard!");
                }
              }}>
                <span className="text-[10px] lg:text-xs text-gray-400 font-mono mt-1">
                 {user?._id}
                </span>
                <button
                  type="button"
                  title="Copy User ID"
                  className=" text-gray-400 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>
              {/* <div className="mt-1 flex items-center">
                {user.role === "user" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    Verified User
                  </span>
                )}
                {user.role === "pending" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    Pending
                  </span>
                )}
                {user.role === "admin" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                    Admin
                  </span>
                )}
                {user.role === "modaretor" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
                    Moderator
                  </span>
                )}
              </div> */}
            </div>
          </Link>
        )}
        <div className={`flex items-center gap-3 ${!user ? "ml-auto" : ""}`}>
          {/* {!user && (
            <button
              id="tour-guest-tutorial"
              onClick={() => setIsTutorialOpen(true)}
              className="text-xs lg:text-sm font-semibold text-blue-400 hover:text-blue-300 font-parkinsans flex items-center gap-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-sm lg:rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FaPlayCircle size={16} />
              <span className="hidden sm:inline">How to Get Started</span>
              <span className="sm:hidden">Tutorial</span>
            </button>
          )} */}
          
          {user ? (
            <Link prefetch={false}
              id="tour-news-button"
              href="/news/create-news"
              className="text-xs lg:text-sm font-semibold text-white font-parkinsans flex items-center gap-2 bg-transparent border border-gray-700 px-3 py-2 rounded-sm lg:rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Plus size={18} />
              News
            </Link>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <div className="text-xs lg:text-sm font-semibold text-white font-parkinsans flex items-center gap-2 bg-black hover:opacity-95 px-3 py-2 rounded-sm lg:rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5">
                  <Plus size={18} />
                  News
                </div>
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
        </div>
      </div>

      {/* <TutorialModals 
        isOpen={isTutorialOpen} 
        setIsOpen={setIsTutorialOpen} 
        onFirstClose={handleTutorialFirstClose} 
      /> */}

      {/* 3-Column Layout Container */}
      <div className="max-w-[1440px] mx-auto w-full px-2 lg:px-4 flex items-start gap-4 lg:gap-6 mt-4 lg:mt-6">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 sticky top-28 h-max">
          <LeftSidebar />
        </div>

        {/* Center Main Content */}
        <div className="flex-1 w-full max-w-[750px] mx-auto overflow-hidden">
          <TasksSlider />
          <AllNews limitMode={true} />
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-[280px] shrink-0 sticky top-28 h-max">
          <RightSidebar />
        </div>

      </div>

      <PageHelpPanel pageKey="home" />
    </div>
  );
}
