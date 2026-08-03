"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { BarChart3, TrendingUp, Users, Target } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

export default function AdminOnboardingStats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin" || user?.role === "owner" || user?.role === "superAdmin") {
      axios.get(`${API_URL}/onboarding/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error("Failed to load onboarding stats", err))
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="animate-pulse bg-gray-900 rounded-2xl h-64 border border-gray-800"></div>;
  }

  if (!stats) return null;

  return (
    <div className="bg-gray-950/60 border border-gray-900 rounded-2xl p-6 shadow-xl backdrop-blur-md w-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white font-parkinsans flex items-center gap-2">
          <BarChart3 className="text-secondary" />
          Onboarding Analytics
        </h3>
        <span className="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full font-semibold border border-secondary/20">
          Last 30 Days
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Users size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Total Users Tracked</span>
          </div>
          <span className="text-3xl font-bold text-white font-orbitron">{stats.totalUsers || 0}</span>
        </div>
        
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Target size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Avg Completion</span>
          </div>
          <span className="text-3xl font-bold text-emerald-400 font-orbitron">{stats.averageCompletionPercentage || 0}%</span>
        </div>
        
        <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <TrendingUp size={16} /> <span className="text-xs uppercase font-bold tracking-wider">Most Visited Feature</span>
          </div>
          <span className="text-xl font-bold text-blue-400 uppercase">{stats.mostVisitedFeature || "N/A"}</span>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 font-parkinsans">Conversion Drop-off</h4>
        <div className="space-y-3">
          {stats.dropOffRates?.map((item: any) => (
            <div key={item.step} className="flex items-center gap-4">
              <span className="text-xs text-gray-300 w-32 truncate">{item.step}</span>
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-400 font-mono w-10 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
