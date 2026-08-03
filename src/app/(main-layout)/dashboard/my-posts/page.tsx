"use client";
import BackendImage from "@/components/shared/BackendImage";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import { toast } from "sonner";
import { Newspaper, Eye } from "lucide-react";

interface NewsPost {
  _id: string | { $oid: string };
  news_title: string;
  news_description: string;
  news_img?: string;
  category?: string;
  author: {
    author_email: string;
    author_name: string;
    author_img?: string;
    author_id?: string;
    author_plan?: string;
    author_selling_status?: string;
    author_role?: string;
  };
  read_time?: number;
  views?: number;
  reactions?: string[];
  earnings?: number;
  status: "pending" | "published" | "draft" | "archived" | "approve";
  rating?: number;
  publish: string;
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const fetchMyPosts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/by-email/${user?.email}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500/20 text-green-400";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "draft":
        return "bg-blue-500/20 text-blue-400";
      case "archived":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPostId = (post: NewsPost): string => {
    if (typeof post._id === "string") return post._id;
    return post._id.$oid;
  };

  if (loading) return <SpinnerCustom />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6" />
            My Posts/News
          </h1>
          <p className="text-sm text-gray-400 mt-1 line-clamp-1">
            View your submitted news articles and blog posts
          </p>
        </div>
        <Link prefetch={false} href="/news/create-news" className="ml-auto">
          <Button>+ Create Post</Button>
        </Link>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/50 rounded-lg">
          <Empty description="No posts found. Start by creating a new article!" />
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {posts.map((post) => (
              <div key={getPostId(post)} className="bg-gray-900/50 rounded-lg p-4 space-y-3">
                {/* Header with image and title */}
                <div className="flex items-start gap-3">
                  {post.news_img ? (
                    <BackendImage
                      src={post.news_img}
                      alt={post.news_title}
                      className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Newspaper size={24} className="text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white line-clamp-2">{post.news_title || "Untitled"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.publish).toLocaleDateString()}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                        post.status
                      )}`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Content preview */}
                <p className="text-sm text-gray-400 line-clamp-2">
                  {post.news_description?.substring(0, 100) || "No description"}...
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-2 border-t border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-400">Category</p>
                    <p className="text-sm text-white truncate">{post.category || "N/A"}</p>
                  </div>
                  <div className="text-center border-l border-gray-700">
                    <p className="text-xs text-gray-400">Views</p>
                    <p className="text-sm text-white">{post.views || 0}</p>
                  </div>
                  <div className="text-center border-l border-gray-700">
                    <p className="text-xs text-gray-400">Reactions</p>
                    <p className="text-sm text-white">{post.reactions?.length || 0}</p>
                  </div>
                </div>

                {/* Actions — View only for approved posts */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-700">
                  {post.status === "approve" ? (
                    <Link prefetch={false} href={`/news/${getPostId(post)}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs">
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-600 italic">Under review</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-gray-900/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-gray-400">Title</TableHead>
                  <TableHead className="text-gray-400">Category</TableHead>
                  <TableHead className="text-gray-400">Views</TableHead>
                  <TableHead className="text-gray-400">Likes</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={getPostId(post)} className="border-gray-700">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {post.news_img ? (
                          <BackendImage
                            src={post.news_img}
                            alt={post.news_title}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-700 flex items-center justify-center">
                            <Newspaper size={20} className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white line-clamp-1">
                            {post.news_title || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {post.news_description?.substring(0, 60) || "No description"}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {post.category || "Uncategorized"}
                    </TableCell>
                    <TableCell className="text-white">{post.views || 0}</TableCell>
                    <TableCell className="text-white">{post.reactions?.length || 0}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          post.status
                        )}`}
                      >
                        {post.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(post.publish).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        {post.status === "approve" ? (
                          <Link prefetch={false} href={`/news/${getPostId(post)}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                              title="View Post"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-600 italic pr-2">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
