"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Gift, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import LinkifyText from "@/components/shared/LinkifyText";

export default function TasksSlider() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ['activeTasks'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/active`);
      if (!res.ok) throw new Error("Failed to fetch active tasks");
      const data = await res.json();
      return data.tasks || [];
    },
    staleTime: Infinity,
  });

  const { data: appliedTasksArray = [] } = useQuery({
    queryKey: ['appliedTasks', user?.email],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return [];
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch user applications");
      const data = await res.json();
      return data.applications.map((app: any) => app.taskId);
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const appliedTasks = new Set(appliedTasksArray);

  const handleApply = async (taskId: string) => {
    if (!user) {
      toast.error("Please login to apply for this task.");
      return;
    }
    
    setIsSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId }),
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        queryClient.setQueryData(['appliedTasks', user?.email], (old: string[] = []) => [...old, taskId]);
      } else {
        toast.error(data.message || "Failed to apply");
      }
    } catch (err) {
      toast.error("Error occurred while applying");
    } finally {
      setIsSubmitting(false);
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



  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="w-full max-w-[750px] mx-auto my-4 lg:my-8 pl-3 lg:pl-6 relative overflow-hidden group">
      
      <div className="flex justify-between items-center mb-3 lg:mb-6">
        <h3 className="text-xl md:text-2xl font-extrabold font-parkinsans flex items-center gap-2 text-white">
          <Gift className="text-amber-400" />
          Special <span className="text-amber-400">Tasks & Gifts</span>
        </h3>
        <div className="flex gap-2 pr-2">
          <button onClick={scrollLeft} className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all z-10">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollRight} className="p-2 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all z-10">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 lg:gap-4 pb-4 snap-x snap-mandatory scrollbar-hide relative z-10"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tasks.map((task: any) => (
          <div key={task._id} className="min-w-[300px] md:min-w-[420px] bg-gray-900/80 border border-gray-800 rounded-2xl p-3 lg:p-5 snap-start flex flex-col justify-between">
            <div>
              {/* Author Info */}
              <div className="flex items-center gap-3 mb-2 lg:mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden relative">
                  <Image src={"/favicon1.png"} alt="EmptyBD" fill className="object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{task.author?.name || "EmptyBD"}</h4>
                  <p className="text-[10px] text-gray-400">Official Task</p>
                </div>
              </div>
              
              {/* Task Image */}
              {task.image && (
                <div className="w-full h-40 lg:h-60 rounded-xl overflow-hidden relative mb-4 border border-gray-800">
                  <Image src={task.image} alt="Task Image" fill className="object-cover" />
                </div>
              )}
              
              {/* Task Description */}
              <LinkifyText text={task.text} className={`text-gray-300 text-sm  mb-1 whitespace-pre-wrap ${task.image ? " line-clamp-3" : ""}`} />
              
              {/* Gift Badge */}
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-semibold mb-2">
                <Gift size={14} />
                Gift: {task.gift}
              </div>
              <p className="text-[10px] lg:text-sm text-gray-400 italic">টাস্ক সম্পূর্ণ না করে Apply for Gift বাটনে ক্লিক করলে আপনার অ্যাকাউন্ট থেকে টাকা কেটে নেওয়া হবে। অনুগ্রহ করে প্রথমে টাস্কটি সম্পূর্ণ করুন, তারপর Apply for Gift বাটনে ক্লিক করুন।</p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button 
                onClick={()=>router.push('https://omg10.com/4/11370716')}
                  // onClick={() => handleApply(task._id)}
                  // disabled={appliedTasks.has(task._id) || isSubmitting}
                  className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
                    appliedTasks.has(task._id) 
                    ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                >
                  {appliedTasks.has(task._id) ? (
                    <><CheckCircle size={16} /> Applied</>
                  ) : (
                    "Apply for Gift"
                  )}
                </button>
                <button 
                onClick={()=>router.push('https://omg10.com/4/11370716')}
                  // onClick={() => router.push(`/tasks/${task._id}`)}
                  className="flex items-center justify-center text-xs lg:text-sm px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700 transition-colors"
                >
                  View
                  {/* <MessageCircle size={18} /> */}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
