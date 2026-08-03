"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { imageUpload } from "@/src/app/api/img-up/routes";
import Image from "next/image";

interface Task {
  _id: string;
  text: string;
  image: string;
  gift: string;
  status: string;
  index: number;
  createdAt: string;
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Form states
  const [text, setText] = useState("");
  const [gift, setGift] = useState("");
  const [status, setStatus] = useState("active");
  const [index, setIndex] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditMode(false);
    setSelectedTaskId(null);
    setText("");
    setGift("");
    setImageUrl("");
    setStatus("active");
    setIndex("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setIsEditMode(true);
    setSelectedTaskId(task._id);
    setText(task.text);
    setGift(task.gift);
    setImageUrl(task.image);
    setStatus(task.status);
    setIndex(task.index ?? "");
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await imageUpload(file);
      setImageUrl(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!text || !gift) {
      toast.error("Text and gift are required");
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem("auth_token");
    const payload = { text, gift, image: imageUrl, status, index: index === "" ? 999 : Number(index) };

    try {
      let res;
      if (isEditMode && selectedTaskId) {
        res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/${selectedTaskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(isEditMode ? "Task updated successfully" : "Task created successfully");
        setIsModalOpen(false);
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.message || "Action failed");
      }
    } catch (err) {
      console.error("Submit error", err);
      toast.error("An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Task deleted successfully");
        fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (err) {
      console.error("Delete error", err);
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Manage Gift Tasks</h1>
          <p className="text-gray-400 mt-2">Create and manage tasks for users to complete.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
          <Plus size={18} /> Add Task
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Image</th>
                <th className="px-6 py-4 font-medium">Task Text</th>
                <th className="px-6 py-4 font-medium">Gift/Reward</th>
                <th className="px-6 py-4 font-medium">Index</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    {task.image ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                        <Image src={task.image} alt="Task" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-gray-500">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm line-clamp-2 whitespace-pre-wrap">{task.text}</p>
                  </td>
                  <td className="px-6 py-4 text-primary font-medium text-sm">
                    {task.gift}
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium text-sm">
                    {task.index ?? "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-700 text-gray-300"
                    }`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleOpenEdit(task)} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 rounded-md transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(task._id)} className="text-red-400 hover:text-red-300 p-1 bg-red-500/10 rounded-md transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No tasks found. Click 'Add Task' to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-gray-950 border border-gray-900 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {isEditMode ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Task Image (Optional)</label>
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-700">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    <button 
                      onClick={() => setImageUrl("")}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-700 hover:border-primary flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-colors"
                  >
                    {isUploading ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Plus size={24} />}
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <p className="text-xs text-gray-500 max-w-[200px]">
                  Upload an engaging image for this task to attract users. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Task Description <span className="text-red-500">*</span></label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="What do users need to do?"
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Gift/Reward Description <span className="text-red-500">*</span></label>
              <Input
                value={gift}
                onChange={(e) => setGift(e.target.value)}
                placeholder="e.g. 50 Taka, Premium Badge..."
                className="bg-gray-900 border-gray-800 text-white focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Order Index (Optional)</label>
              <Input
                type="number"
                value={index}
                onChange={(e) => setIndex(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="e.g. 1 (Smaller index shows first)"
                className="bg-gray-900 border-gray-800 text-white focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-primary focus:ring-primary bg-gray-900 border-gray-700"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={status === "inactive"}
                    onChange={(e) => setStatus(e.target.value)}
                    className="text-primary focus:ring-primary bg-gray-900 border-gray-700"
                  />
                  <span className="text-sm text-gray-300">Inactive</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-gray-800 text-gray-300">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={actionLoading || isUploading} className="bg-primary hover:bg-primary/90 text-white">
              {actionLoading ? "Saving..." : "Save Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
