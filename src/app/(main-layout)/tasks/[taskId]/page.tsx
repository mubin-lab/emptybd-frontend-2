"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Gift, CheckCircle, Send, ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import LinkifyText from "@/components/shared/LinkifyText";
import PlanBadge from "@/components/shared/PlanBadge";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  useEffect(() => {
    if (user && taskId) {
      checkApplicationStatus();
    }
  }, [user, taskId]);

  const fetchTaskDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/${taskId}`);
      if (res.ok) {
        const data = await res.json();
        setTask(data.task);
      } else {
        toast.error("Task not found");
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to fetch task details", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/my-applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const applied = data.applications.some((app: any) => app.taskId === taskId);
        setHasApplied(applied);
      }
    } catch (err) {
      console.error("Failed to check application status", err);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply for this task.");
      return;
    }
    
    setIsApplying(true);
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
        setHasApplied(true);
      } else {
        toast.error(data.message || "Failed to apply");
      }
    } catch (err) {
      toast.error("Error occurred while applying");
    } finally {
      setIsApplying(false);
    }
  };

  const handleAddComment = async () => {
    if (!user) {
      toast.error("Please login to comment.");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/${taskId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText }),
      });
      
      if (res.ok) {
        toast.success("Comment added!");
        setCommentText("");
        fetchTaskDetails(); // refresh to show new comment
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to comment");
      }
    } catch (err) {
      toast.error("Error occurred while commenting");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/${taskId}/comment/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        toast.success("Comment deleted");
        fetchTaskDetails(); // refresh comments
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete comment");
      }
    } catch (err) {
      toast.error("Error occurred while deleting comment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto w-full px-3 py-8 lg:py-12">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Details Section */}
        <div className="overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 lg:gap-4 mb-2 lg:mb-6">
              <div className="w-11 h-11 rounded-full bg-gray-800 border border-gray-700 overflow-hidden relative">
                <Image src={"/favicon1.png"} alt="EmptyBD" fill className="object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm lg:text-lg">{task.author?.name || "EmptyBD"}</h2>
                <p className="text-xs lg:text-sm text-gray-400">Official Task</p>
              </div>
            </div>
            
            {task.image && (
              <div className="w-full rounded-2xl overflow-hidden mb-6 border border-gray-800 shadow-lg">
                <Image 
                  src={task.image} 
                  alt="Task Image" 
                  width={1000} 
                  height={1000} 
                  className="w-full h-auto object-contain" 
                />
              </div>
            )}
            
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-sm font-medium mb-6 shadow-lg">
              <Gift size={18} />
              {/* Gift:  */}
              এই টাস্কটি সঠিকভাবে সম্পন্ন করলে পাবেন {' '}
              {task.gift}
            </div>

            <LinkifyText 
              text={task.text} 
              className="text-gray-300 text-sm md:text-lg leading-relaxed mb-6 whitespace-pre-wrap" 
            />

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-3 lg:mb-8">
              <p className="text-xs md:text-sm text-red-400/90 italic text-center">
                টাস্ক সম্পূর্ণ না করে Apply for Gift বাটনে ক্লিক করলে আপনার অ্যাকাউন্ট থেকে টাকা কেটে নেওয়া হবে। অনুগ্রহ করে প্রথমে টাস্কটি সম্পূর্ণ করুন, তারপর Apply for Gift বাটনে ক্লিক করুন।
              </p>
            </div>
            
            <button 
              onClick={handleApply}
              disabled={hasApplied || isApplying}
              className={`w-full flex justify-center items-center gap-2 py-2 lg:py-4 rounded-xl text-sm lg:text-lg font-bold transition-all ${
                hasApplied 
                ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed" 
                : "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
              }`}
            >
              {hasApplied ? (
                <><CheckCircle size={22} /> You have already applied</>
              ) : (
                "Apply for Gift"
              )}
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-3 lg:p-8 flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-6 text-white">
            <MessageCircle className="text-primary" />
            <h3 className="text-xl font-bold">Comments ({task.comments?.length || 0})</h3>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mb-3">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment: any) => (
                <div key={comment._id} className="relative bg-gray-800/60 border border-gray-700/50 rounded-xl p-2 lg:p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
                      {comment.userImage ? (
                        <Image src={comment.userImage} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-800 font-bold">
                          {comment.userName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-400 text-xs lg:text-sm block">{comment.userName}</span>
                        {/* {(comment.userRole === "admin" || comment.userRole === "superAdmin") ? (
                          <PlanBadge plan="owner" />
                        ) : comment.userPlan && comment.userPlan !== "free" ? (
                        ) : null} */}
                        <PlanBadge plan={comment.userPlan} />
                      </div>
                      <span className="text-[9px] text-gray-500 block">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {/* Delete Button for Admin */}
                  {(user?.role === "admin" || user?.role === "superAdmin") && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete Comment"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <p className="text-gray-300 text-sm ml-11">{comment.text}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-60">
                <MessageCircle size={48} className="mb-4" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
          
          <div className="mt-auto relative">
            <textarea 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 pr-16 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
            />
            <button 
              onClick={handleAddComment}
              disabled={isSubmitting || !commentText.trim()}
              className="absolute bottom-4 right-4 p-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
