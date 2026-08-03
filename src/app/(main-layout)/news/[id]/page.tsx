"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { toast } from "sonner";
import Empty from "@/components/NotFound.tsx/Empty";
import TimeAgo from "@/components/short-component/TimeAgo";
import ShareBottomSheet from "@/components/news/ShareBottomSheet";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { IoMdShareAlt } from "react-icons/io";
import { BsArrowLeft, BsDoorOpenFill, BsBookmark, BsBookmarkFill } from "react-icons/bs";

type NewsItem = {
  reactions: string[];
  news_img?: string;
  publish?: string | Date;
  news_description: React.ReactNode;
  author: {
    author_img: string;
    author_name: string;
    author_plan?: string;
    author_role?: string;
    author_email?: string;
  };
  _id: string;
};

export default function NewsDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuthStore();

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeShareNews, setActiveShareNews] = useState<NewsItem | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    const fetchBookmarkStatus = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/check/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsBookmarked(data.bookmarked);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBookmarkStatus();
  }, [id, user]);

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark articles", { position: "top-right" });
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/bookmarks/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: id, itemType: "news" })
      });
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.bookmarked);
        toast.success(data.message, { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchNewsDetail = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/news/${id}`);
        if (!res.ok) throw new Error("Failed to fetch news details");
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error("Error fetching news details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  const handleReaction = async () => {
    if (!user?.email || !news) return;

    const token = localStorage.getItem("auth_token");

    // Optimistic UI update
    setNews((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        reactions: prev.reactions.includes(user.email)
          ? prev.reactions.filter((e) => e !== user.email)
          : [...prev.reactions, user.email],
      };
    });

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/${news._id}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userEmail: user.email }),
        }
      );
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  if (loading) {
    return <SpinnerCustom />;
  }

  if (!news) {
    return (
      <div className="max-w-2xl w-[95%] mx-auto py-10 text-center">
        <Empty description="The news article you are looking for could not be found." />
        <Button onClick={() => router.push("/")} className="mt-4 bg-black text-white rounded-sm lg:rounded-md font-semibold">
          Go Back Home
        </Button>
      </div>
    );
  }

  const hasReacted = user?.email && news.reactions.includes(user.email);

  return (
    <div className="max-w-2xl w-[95%] mx-auto py-6 md:py-10">
      {/* Back navigation button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-2 group cursor-pointer transition-colors duration-200"
      >
        <BsArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" size={18} />
        <span>Back</span>
      </button>

      {/* Styled news card details */}
      <div className="p-3 rounded-2xl shadow-xl bg-gray-950/70 border border-gray-900 backdrop-blur-md">
        {/* Author information header */}
        <div className="flex items-center justify-between gap-3">
          <Link prefetch={false} href={`/user/${news.author.author_email}`} className="flex items-center gap-3 flex-1 hover:opacity-90 group">
            <BackendImage
              src={news.author.author_img}
              alt={news.author.author_name}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-800 group-hover:ring-secondary/50 transition-all duration-300"
            />
            <div className="flex-1">
              <h5 className="text-sm lg:text-base font-semibold font-parkinsans flex items-center gap-1.5 text-white group-hover:text-secondary transition-colors duration-200">
                {news.author.author_name}{" "}
                {news.author.author_plan === "premium" && (
                  <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="blue">
                        <stop offset="0%" stop-color="#4dabf7" />
                        <stop offset="60%" stop-color="#006aff" />
                        <stop offset="100%" stop-color="#0050cc" />
                      </radialGradient>
                    </defs>
                    <circle cx="6.5" cy="6.5" r="6.2" fill="url(#blue)" />
                    <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" stroke-width="1.35" fill="none" />
                  </svg>
                )}
                {news.author.author_plan === "owner" && (
                  <svg width="14" height="14" viewBox="0 0 13 13" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="gold">
                        <stop offset="0%" stop-color="#ffdd80" />
                        <stop offset="60%" stop-color="#ffb516" />
                        <stop offset="100%" stop-color="#e89f00" />
                      </radialGradient>
                    </defs>
                    <circle cx="6.5" cy="6.5" r="6.2" fill="url(#gold)" />
                    <path d="M4 6.6 L5.8 8.4 L9 5.2" stroke="white" stroke-width="1.35" fill="none" />
                  </svg>
                )}
              </h5>
              <div className="flex items-center gap-1 mt-0.5 text-[11px] font-medium font-parkinsans text-gray-400">
                {news?.publish && (
                  <TimeAgo date={news.publish} className="text-[11px] text-gray-400 font-medium" />
                )}{" "}
                ago
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleBookmark}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-gray-900 rounded-full cursor-pointer"
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Article"}
            >
              {isBookmarked ? (
                <BsBookmarkFill size={17} className="text-amber-500" />
              ) : (
                <BsBookmark size={17} />
              )}
            </button>
            <button
              onClick={() => {
                setActiveShareNews(news);
                setIsShareOpen(true);
              }}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1.5 hover:bg-gray-900 rounded-full cursor-pointer"
            >
              <IoMdShareAlt size={20} />
            </button>
          </div>
        </div>

        {/* Featured image and article body content */}
        <div>
          {news.news_img && (
            <Dialog>
              <DialogTrigger asChild>
                <div className="overflow-hidden rounded-lg border border-gray-900 my-3 cursor-pointer group">
                  <BackendImage
                    src={news.news_img}
                    alt="banner"
                    className="max-w-[100%] w-full min-h-48 max-h-70 mx-auto object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-2 bg-black/90 border border-gray-900 shadow-2xl rounded-xl flex items-center justify-center">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-base lg:text-lg hidden">
                    Image Preview
                  </DialogTitle>
                  <BackendImage
                    src={news.news_img}
                    alt="banner"
                    className="w-full max-h-[80vh] object-contain rounded-lg mx-auto"
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}

          <div
            className="text-[13px] lg:text-base font-medium font-hind mt-4 text-gray-300 leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 break-words"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(typeof news.news_description === "string" ? news.news_description.replace(/&nbsp;/g, " ") : "") }}
          />
        </div>

        {/* Reaction items & earnings badge */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-900 mt-6">
          {user?.email ? (
            <button
              onClick={() => !hasReacted && handleReaction()}
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
              <span>{news.reactions.length} Like</span>
            </button>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <button className="text-xs lg:text-sm text-gray-400 hover:text-white hover:scale-105 active:scale-95 font-medium flex items-center gap-1.5 cursor-pointer transition-all duration-200">
                  <AiOutlineLike size={20} />
                  <span>{news.reactions.length} Like</span>
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
            <span>{(news.reactions.length * 1.4).toFixed(2)}</span>
            <span className="text-[11px] font-normal">৳</span>
          </div>
        </div>
      </div>

      {/* Discussion Board */}
      <DiscussionBoard newsId={id} user={user} />

      {/* Share Bottom Sheet component */}
      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        news={activeShareNews}
      />
    </div>
  );
}

interface Comment {
  _id: string;
  newsId: string;
  userId: string;
  userName: string;
  userImg: string | null;
  userEmail: string;
  content: string;
  likes: string[];
  replies: Reply[];
  createdAt: string | Date;
}

interface Reply {
  replyId: string;
  userId: string;
  userName: string;
  userImg: string | null;
  userEmail: string;
  content: string;
  createdAt: string | Date;
}

function DiscussionBoard({ newsId, user }: { newsId: string, user: any }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [activeReplyBoxId, setActiveReplyBoxId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/comments/${newsId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [newsId]);

  const handleLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like comments", { position: "top-right" });
      return;
    }
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/comments/${commentId}/like`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("Comment deleted", { position: "top-right" });
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to write a comment", { position: "top-right" });
      return;
    }
    if (!commentText.trim()) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/comments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newsId, content: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        fetchComments();
        toast.success("Comment posted", { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReply = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to reply", { position: "top-right" });
      return;
    }
    const replyText = replyTextMap[commentId] || "";
    if (!replyText.trim()) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/comments/${commentId}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        setReplyTextMap(prev => ({ ...prev, [commentId]: "" }));
        setActiveReplyBoxId(null);
        fetchComments();
        toast.success("Reply posted", { position: "top-right" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-base font-bold text-white font-parkinsans border-b border-gray-900 pb-2 flex items-center gap-2">
        <span>Discussion ({comments.length})</span>
      </h3>

      {/* Post Comment Input */}
      {user ? (
        <form onSubmit={handlePostComment} className="flex gap-3">
          <BackendImage
            src={user.img || "/default-avatar.png"}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover mt-1"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Join the discussion..."
              rows={2}
              className="w-full bg-gray-900 border border-gray-800 rounded-sm lg:rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" className="bg-black text-white rounded-sm lg:rounded-md text-xs font-semibold px-4 py-1.5">
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-gray-900/40 border border-gray-900 p-4 rounded-xl text-center text-xs text-gray-400">
          Please <Link prefetch={false} href="/login" className="text-secondary font-semibold hover:underline">login</Link> to participate in the discussion.
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const hasLiked = user?.email && comment.likes?.includes(user.email);
          return (
            <div key={comment._id} className="bg-gray-900/20 border border-gray-900/60 p-2 lg:p-4 rounded-xl space-y-1 lg:space-y-3">
              {/* Commenter info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BackendImage
                    src={comment.userImg || "/default-avatar.png"}
                    alt={comment.userName}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="flex items-start gap-2">
                    <h5 className="text-xs font-bold text-gray-200">{comment.userName}</h5>
                    <p className="text-[10px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {/* Delete button for owner/admin */}
                {user && (comment.userId === user.id || user.role === "admin" || user.role === "superAdmin") && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-xs text-gray-300 leading-relaxed pl-9.5">{comment.content}</p>

              {/* Actions row: Like, Reply */}
              <div className="flex items-center gap-4 pl-9.5 text-[11px] font-bold text-gray-400">
                <button
                  onClick={() => handleLike(comment._id)}
                  className={`flex items-center gap-1 hover:text-white transition-colors ${hasLiked ? "text-secondary" : ""}`}
                >
                  <span className="text-sm">♥</span>
                  <span>{comment.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => setActiveReplyBoxId(activeReplyBoxId === comment._id ? null : comment._id)}
                  className="hover:text-white transition-colors"
                >
                  Reply
                </button>
              </div>

              {/* Conditional Reply input box */}
              {activeReplyBoxId === comment._id && (
                <div className="pl-9.5 pt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyTextMap[comment._id] || ""}
                    onChange={(e) => setReplyTextMap(prev => ({ ...prev, [comment._id]: e.target.value }))}
                    placeholder="Write a reply..."
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-sm lg:rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-secondary"
                  />
                  <Button
                    onClick={() => handlePostReply(comment._id)}
                    className="text-white text-[11px] font-bold px-4 py-1.5 lg:rounded-lg shrink-0"
                  >
                    Reply
                  </Button>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9.5 space-y-3 pt-2 border-t border-gray-900/40 mt-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.replyId} className="flex gap-2">
                      <BackendImage
                        src={reply.userImg || "/default-avatar.png"}
                        alt={reply.userName}
                        className="w-5.5 h-5.5 rounded-full object-cover animate-in fade-in"
                      />
                      <div className="flex-1 bg-gray-900/30 p-2 rounded-lg border border-gray-900/50">
                        <div className="flex justify-between items-center">
                          <h6 className="text-[10px] font-bold text-gray-300">{reply.userName}</h6>
                          <span className="text-[8px] text-gray-500">
                            {new Date(reply.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const parseMarkdown = (text: string) => {
  if (!text) return "";
  
  // If the text already contains HTML tags (like from Quill editor), return it as-is
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  // Otherwise, it's old plain text / basic markdown
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^\s*# (.*?)$/gm, "<h1 class='text-xl font-bold text-white mt-3 mb-2 font-parkinsans'>$1</h1>");
  html = html.replace(/^\s*## (.*?)$/gm, "<h2 class='text-lg font-bold text-white mt-2 mb-1 font-parkinsans'>$1</h2>");
  html = html.replace(/^\s*&gt; (.*?)$/gm, "<blockquote class='border-l-4 border-gray-600 pl-3 italic my-2 text-gray-400'>$1</blockquote>");
  html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='list-disc ml-4 my-1'>$1</li>");
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-gray-950 p-2.5 rounded-lg border border-gray-800 font-mono text-xs my-2 overflow-x-auto text-gray-300'>$1</pre>");
  
  // Convert newlines to <br> to preserve line breaks for old text
  html = html.replace(/\n/g, "<br/>");

  return html;
};
