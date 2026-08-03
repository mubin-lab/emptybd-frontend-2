"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Building2, Users, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function AdminMessesPage() {
  const [loading, setLoading] = useState(true);
  const [messes, setMesses] = useState<any[]>([]);

  useEffect(() => {
    fetchMesses();
  }, []);

  const fetchMesses = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setMesses(data);
      } else {
        toast.error(data.message || "Failed to load messes");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans flex items-center gap-2">
            <Building2 className="text-primary" />
            Smart Mess Management (Master View)
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            As a Super Admin, you have master access to oversee and manage all active messes in the platform.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-xl">
          {messes.length} Messes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {messes.length === 0 ? (
          <div className="col-span-full bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center text-gray-500">
            No active messes found in the system.
          </div>
        ) : (
          messes.map((mess) => (
            <div key={mess._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-primary/50 transition-colors flex flex-col">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1 truncate">{mess.name}</h2>
                <p className="text-xs font-mono text-gray-500 bg-gray-950 inline-block px-2 py-0.5 rounded">
                  {mess.messId}
                </p>
              </div>

              <div className="space-y-2 mb-6 text-sm text-gray-400 flex-1">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span>{mess.memberCount} Active Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Created: {new Date(mess.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              <Link href={`/mess/${mess._id}/dashboard`} target="_blank">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white gap-2">
                  <ExternalLink size={16} /> Enter Mess Dashboard
                </Button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
