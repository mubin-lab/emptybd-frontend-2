"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Application {
  _id: string;
  taskId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  appliedAt: string;
  taskInfo: {
    text: string;
    gift: string;
  };
}

export default function TaskApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/admin/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/tasks/admin/applications/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Application ${status} successfully`);
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update status error", err);
      toast.error("An error occurred");
    } finally {
      setActionLoading(null);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Task Applications</h1>
          <p className="text-gray-400 mt-2">Review and manage user task applications to distribute gifts.</p>
        </div>
        <Button 
          onClick={fetchApplications} 
          variant="outline" 
          className="border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User Info</th>
                <th className="px-6 py-4 font-medium">Task</th>
                <th className="px-6 py-4 font-medium">Gift Applied For</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {applications.map((app) => (
                <tr key={app._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-semibold">{app.userName}</p>
                      <p className="text-gray-500 text-xs">{app.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm line-clamp-2 max-w-[250px]">{app.taskInfo?.text}</p>
                  </td>
                  <td className="px-6 py-4 text-primary font-medium text-sm">
                    {app.taskInfo?.gift}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      app.status === "approved" ? "bg-green-500/20 text-green-400" 
                      : app.status === "rejected" ? "bg-red-500/20 text-red-400"
                      : "bg-amber-500/20 text-amber-400"
                    }`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === "pending" ? (
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleUpdateStatus(app._id, "approved")}
                          disabled={actionLoading === app._id}
                          className="bg-green-600 hover:bg-green-500 text-white h-8 text-xs"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(app._id, "rejected")}
                          disabled={actionLoading === app._id}
                          className="bg-red-600 hover:bg-red-500 text-white h-8 text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm italic">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No applications found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
