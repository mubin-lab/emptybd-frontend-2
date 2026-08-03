"use client";
import BackendImage from "@/components/shared/BackendImage";
import React, { useEffect, useState } from "react";
import { Check, X, Pencil, Trash2, Eye, RefreshCw, Home } from "lucide-react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import RichTextEditor from "@/components/shared/RichTextEditor";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";

interface NewsAuthor {
  author_name: string;
  author_email: string;
  author_img: string;
}

interface NewsItem {
  _id: string;
  news_description: string;
  news_img: string;
  status: string;
  author: NewsAuthor;
  publish: string;
  reactions?: string[];
  isHome?: boolean;
}

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Table parameters
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Actions states
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editImg, setEditImg] = useState("");
  const [editStatus, setEditStatus] = useState("approve");
  const [editIsHome, setEditIsHome] = useState(false);
  
  // Selection state for batch actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Tab filter state
  const [activeTab, setActiveTab] = useState<"all" | "approve" | "pending" | "draft">("all");

  // Batch delete handler
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/delete-multiple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: Array.from(selectedIds) }),
        }
      );
      if (!res.ok) throw new Error("Batch delete failed");
      toast.success(`${selectedIds.size} news items deleted`);
      fetchAllNews();
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected news.");
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch all news
  const fetchAllNews = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      // The backend route is router.get("/", getAllData); under /news-data
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Error loading news data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = [...news];

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((n) => (n.status || "pending") === activeTab);
    }

    // Search by Description, Author Name or Email
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (n) =>
          n.news_description?.toLowerCase().includes(query) ||
          n.author?.author_name?.toLowerCase().includes(query) ||
          n.author?.author_email?.toLowerCase().includes(query)
      );
    }

    setFilteredNews(result);
  }, [news, search, activeTab]);

  // Reset page only when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / pageSize);
  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleEditClick = (item: NewsItem) => {
    setSelectedNews(item);
    setEditDescription(item.news_description || "");
    setEditImg(item.news_img || "");
    setEditStatus(item.status || "approve");
    setEditIsHome(item.isHome || false);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedNews) return;
    if (!editDescription.trim()) {
      toast.error("News description cannot be empty.");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/admin/${selectedNews._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            news_description: editDescription,
            news_img: editImg,
            status: editStatus,
            isHome: editIsHome,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update news");

      toast.success("News updated successfully!");
      fetchAllNews();
      setIsEditOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to update news.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteClick = (item: NewsItem) => {
    setSelectedNews(item);
    setConfirmDeleteOpen(true);
  };

  const executeDelete = async () => {
    if (!selectedNews) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/delete/${selectedNews._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete news");

      toast.success("News deleted successfully!");
      fetchAllNews();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete news.");
    } finally {
      setActionLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedNews(null);
    }
  };

  // --- INLINE STATUS CHANGE ---
  const handleStatusChange = async (item: NewsItem, newStatus: string) => {
    setNews((prev) =>
      prev.map((n) => (n._id === item._id ? { ...n, status: newStatus } : n))
    );
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/admin/${item._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Status update failed");
      toast.success(`Status → ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
      setNews((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, status: item.status } : n))
      );
    }
  };

  // Columns Definitions
  const columns: Column<NewsItem>[] = [
    {
      key: "select",
      label: "",
      render: (n) => (
        <input
          type="checkbox"
          checked={selectedIds.has(n._id)}
          onChange={(e) => {
            const newSet = new Set(selectedIds);
            if (e.target.checked) {
              newSet.add(n._id);
            } else {
              newSet.delete(n._id);
            }
            setSelectedIds(newSet);
          }}
          className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded"
        />
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (n) => (
        <div className="flex items-center gap-3">
          {n.author?.author_img ? (
            <BackendImage src={n.author.author_img} alt="author" className="w-8 h-8 rounded-full object-cover"  />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">?</div>
          )}
          <div>
            <span className="font-semibold text-white block">{n.author?.author_name || "Unknown"}</span>
            <span className="text-xs text-gray-400 block">{n.author?.author_email || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "news_description",
      label: "Content Snippet",
      render: (n) => (
        <div className="max-w-[300px] relative group cursor-pointer">
          <p className="text-sm text-gray-300 line-clamp-2">
            {n.news_description}
          </p>
          <span className="inline-block mt-1 text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
            {n.news_description?.trim().split(/\s+/).filter(Boolean).length || 0} words
          </span>
          {n.news_description && (
            <div className="absolute z-50 left-0 bottom-full mb-2 hidden group-hover:block w-max max-w-[350px] bg-gray-900 text-gray-200 text-xs p-3 rounded-lg shadow-2xl border border-gray-700 whitespace-normal pointer-events-none">
              {n.news_description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "news_img",
      label: "Image",
      render: (n) => (
        n.news_img ? (
          <BackendImage src={n.news_img} alt="news" className="h-10 w-16 object-cover rounded border border-gray-800"  />
        ) : (
          <span className="text-xs text-gray-500 italic">No image</span>
        )
      ),
    },
    {
      key: "publish",
      label: "Published Date",
      render: (n) => (
        <span className="text-xs text-gray-500">
          {new Date(n.publish).toLocaleString("en-BD", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "reactions",
      label: "Reactions",
      render: (n) => (
        <span className="font-mono text-gray-300 font-semibold">{n.reactions?.length || 0}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (n) => {
        const cur = n.status || "pending";
        return (
          <div className="flex items-center gap-2">
            {(["approve", "draft"] as const).map((val) => {
              const isActive = cur === val;
              const styles: Record<string, string> = {
                approve: isActive
                  ? "bg-green-600 border-green-500 text-white"
                  : "border-gray-700 text-gray-500 hover:border-green-600 hover:text-green-400",
                draft: isActive
                  ? "bg-gray-700 border-gray-500 text-white"
                  : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300",
              };
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (cur !== val) handleStatusChange(n, val);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold capitalize transition-all ${
                    styles[val]
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full border-2 flex-shrink-0 ${
                      isActive
                        ? "bg-white border-white"
                        : "bg-transparent border-current"
                    }`}
                  />
                  {val}
                </button>
              );
            })}
            {n.isHome && (
              <span className="ml-1 px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center">
                <Home size={13} />
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (n) => (
        <div className="flex gap-2">
          <Link href={`/news/${n._id}`} target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="h-8 border-gray-800 text-gray-400 hover:text-white px-2.5 gap-1.5"
            >
              <Eye size={13} />
              
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => handleEditClick(n)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white px-2.5 gap-1.5"
          >
            <Pencil size={13} />
            
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(n)}
            className="h-8 bg-red-950 text-red-400 hover:bg-red-900/40 px-2.5 gap-1.5"
          >
            <Trash2 size={13} />
            
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            News Management
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            View, edit, and delete user news posts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={fetchAllNews} 
            variant="outline" 
            className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              className="bg-red-900 hover:bg-red-800 text-white"
            >
              Delete Selected ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      {(() => {
        const tabs = [
          { key: "all",     label: "All",     count: news.length },
          { key: "approve", label: "Approved", count: news.filter((n) => (n.status || "pending") === "approve").length },
          { key: "pending", label: "Pending",  count: news.filter((n) => (n.status || "pending") === "pending").length },
          { key: "draft",   label: "Draft",    count: news.filter((n) => n.status === "draft").length },
        ] as const;
        const tabColors: Record<string, string> = {
          all:     "border-white text-white",
          approve: "border-green-500 text-green-400",
          pending: "border-yellow-500 text-yellow-400",
          draft:   "border-gray-500 text-gray-400",
        };
        const badgeColors: Record<string, string> = {
          all:     "bg-gray-700 text-gray-300",
          approve: "bg-green-900/60 text-green-400",
          pending: "bg-yellow-900/60 text-yellow-400",
          draft:   "bg-gray-800 text-gray-400",
        };
        return (
          <div className="flex gap-1 border-b border-gray-800">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? `${tabColors[tab.key]} border-b-2 -mb-px`
                      : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? badgeColors[tab.key] : "bg-gray-800 text-gray-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })()}

      <AdminTable
        columns={columns}
        data={paginatedNews}
        isLoading={isLoading}
        searchPlaceholder="Search by description, author name or email..."
        searchValue={search}
        onSearchChange={setSearch}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalRecords={filteredNews.length}
      />

      {/* Edit News Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-900 border border-gray-800 text-white p-6 font-parkinsans">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Pencil className="text-blue-500" />
              Edit News Post
            </DialogTitle>
          </DialogHeader>

          {selectedNews && (
            <div className="space-y-4 my-4">
              <div className="bg-gray-950 p-4 rounded-lg border border-gray-850 space-y-2 text-xs md:text-sm text-gray-300">
                <p><strong>Author:</strong> {selectedNews.author?.author_name} ({selectedNews.author?.author_email})</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  News Image URL (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="https://..."
                  value={editImg}
                  onChange={(e) => setEditImg(e.target.value)}
                  className="bg-gray-950 border-gray-800 text-white"
                />
                {editImg && (
                  <div className="mt-2">
                    <BackendImage src={editImg} alt="preview" className="h-24 w-auto rounded border border-gray-800 object-cover"  />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">
                  News Content <span className="text-red-500">*</span>
                </label>
                <RichTextEditor
                  value={editDescription}
                  onChange={(val) => setEditDescription(val)}
                  placeholder="Enter news description"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2">
                    News Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-primary transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="approve">Approve</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="editIsHome"
                    checked={editIsHome}
                    onChange={(e) => setEditIsHome(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-700 bg-gray-950 text-primary focus:ring-primary accent-primary cursor-pointer"
                  />
                  <label htmlFor="editIsHome" className="text-sm font-semibold text-gray-300 cursor-pointer select-none">
                    Show on Home Page (isHome)
                  </label>
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)} className="border-gray-800" disabled={actionLoading}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={actionLoading}>
              {actionLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Modal */}
      <AdminConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={executeDelete}
        isLoading={actionLoading}
        title="Confirm News Deletion"
        description={`Are you sure you want to delete this news post by ${selectedNews?.author?.author_name}? This action cannot be undone.`}
        confirmText="Yes, Delete Post"
        type="danger"
      />
    </div>
  );
}
