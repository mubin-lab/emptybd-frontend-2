"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { User, LogIn, MapPin, CalendarDays, Bookmark, Activity, Users } from "lucide-react";
import BackendImage from "@/components/shared/BackendImage";
import PlanBadge from "@/components/shared/PlanBadge";

export default function LeftSidebar() {
  const { user } = useAuthStore();

  return (
    <div className="bg-[#0f172a]/80 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl sticky top-24 transition-all duration-300 hover:shadow-primary/10">
      {user ? (
        <div className="flex flex-col">
          {/* Cover Photo / Gradient Banner */}
          <div className="h-24 w-full bg-gradient-to-r from-primary/80 via-purple-500/80 to-blue-500/80 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="px-5 pb-5 relative">
            {/* Avatar - overlaps banner */}
            <div className="absolute -top-12 left-5">
              <div className="w-20 h-20 rounded-full border-4 border-[#0f172a] bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg">
                {user.img ? (
                  <BackendImage
                    src={user.img}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={36} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mt-10 mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-extrabold text-white font-parkinsans tracking-tight">
                  {user.name || "User"}
                </h3>
                <PlanBadge plan={user.plan || "free"} className="text-[10px] px-2 py-0.5" />
              </div>
              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
            </div>

            {/* Mini Bio or Info */}
            <div className="flex flex-col gap-2 text-xs text-gray-400 mb-5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-gray-500" />
                <span>Active Member</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-500" />
                <span>Joined recently</span>
              </div>
            </div>

            {/* Dynamic User Info */}
            <div className="flex flex-col gap-3 py-4 border-t border-b border-gray-800/60 mb-5">
              {user.phone_number && (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-800 rounded-md">
                    <MapPin size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-semibold text-white">{user.phone_number}</p>
                  </div>
                </div>
              )}
              
              {(user.address || user.adderss) && (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-800 rounded-md">
                    <Activity size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Address</p>
                    <p className="text-sm font-semibold text-white truncate max-w-[200px]" title={user.address || user.adderss}>
                      {user.address || user.adderss}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gray-800 rounded-md">
                  <Users size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Referrals</p>
                  <p className="text-sm font-semibold text-white">{user.referral_count || 0}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-xl text-sm font-bold text-center transition-all duration-300"
              >
                View Full Profile
              </Link>
              <Link
                href="/dashboard/bookmarks"
                className="w-full py-2.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Bookmark size={16} /> Saved Items
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-5 shadow-inner border border-gray-800">
            <User size={32} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-parkinsans">
            Welcome to EmptyBD
          </h3>
          <p className="text-xs text-gray-400 mb-6 leading-relaxed">
            Join our vibrant community to share your thoughts, discover trending content, and connect with creators.
          </p>
          <Link
            href="/login"
            className="w-full py-3 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex justify-center items-center gap-2 transform hover:-translate-y-0.5"
          >
            <LogIn size={18} /> Login or Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}
