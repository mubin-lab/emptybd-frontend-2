"use client";

import { useUserProgress } from "@/lib/hooks/useOnboarding";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";

export default function GettingStartedChecklist() {
  const { data: progress, isLoading } = useUserProgress();

  if (isLoading || !progress) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-5 w-full bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const checklistItems = [
    { id: "registered", label: "Register Account", completed: progress.registered, link: null },
    { id: "verified", label: "Verify Account", completed: progress.verified, link: "/profile" },
    { id: "profilePhotoUploaded", label: "Upload Profile Photo", completed: progress.profilePhotoUploaded, link: "/profile" },
    { id: "profileCompleted", label: "Complete Profile", completed: progress.profileCompleted, link: "/profile" },
    { id: "pushEnabled", label: "Enable Push Notifications", completed: progress.pushEnabled, link: "/profile" }, // Usually in settings
    { id: "firstNewsPost", label: "Make Your First News Post", completed: progress.firstNewsPost, link: "/news/create-news" },
    { id: "firstBid", label: "Place Your First Bid", completed: progress.firstBid, link: "/bid" },
    { id: "firstExchange", label: "Explore Exchange", completed: progress.firstExchange, link: "/digital-exchange" },
    { id: "firstMessage", label: "Send Your First Message", completed: progress.firstMessage, link: "/messages" },
    { id: "firstReferral", label: "Invite Your First Friend", completed: progress.firstReferral, link: "/profile" }
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const percentage = Math.round((completedCount / checklistItems.length) * 100);

  // If 100% completed, we can either hide it or show a congratulatory state.
  // We'll show a collapsable summary for now if completed.

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl relative overflow-hidden group transition-all duration-300">
      {percentage === 100 && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
      )}
      
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-white font-parkinsans">Getting Started</h3>
        <span className="text-sm font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">
          {percentage}% Complete
        </span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-6">
        <div 
          className="bg-secondary h-2.5 rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="space-y-3">
        {checklistItems.map((item) => (
          <div key={item.id} className="flex items-center gap-3 group/item">
            {item.completed ? (
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            ) : (
              <Circle className="text-gray-600 group-hover/item:text-gray-400 transition-colors flex-shrink-0" size={20} />
            )}
            
            <div className="flex-1">
              <span className={`text-sm transition-colors ${item.completed ? "text-gray-500 line-through" : "text-gray-300"}`}>
                {item.label}
              </span>
            </div>

            {!item.completed && item.link && (
              <Link 
                href={item.link}
                className="text-xs font-semibold text-secondary hover:text-white bg-secondary/10 hover:bg-secondary/20 px-3 py-1 rounded-md transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100"
              >
                Go
              </Link>
            )}
          </div>
        ))}
      </div>
      
      {percentage === 100 && (
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
            <CheckCircle size={18} /> You're all set! Enjoy EmptyBD.
          </p>
        </div>
      )}
    </div>
  );
}
