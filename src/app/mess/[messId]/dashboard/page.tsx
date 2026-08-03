"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, TrendingUp, Users, Utensils, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MessDashboardOverview() {
  const params = useParams();
  const messId = params.messId as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [messId]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const json = await res.json();
      
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.message || "Failed to load dashboard data");
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
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans">
            {data.mess.name}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            মেস আইডি: <span className="text-gray-300 font-mono bg-gray-800 px-2 py-0.5 rounded">{data.mess.messId}</span>
          </p>
        </div>
        <div className="bg-gray-800 border border-gray-700 px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <span className="text-gray-400">আপনার ভূমিকা:</span>
          <span className="text-primary font-bold capitalize">{data.role === 'owner' ? 'মালিক' : data.role === 'manager' ? 'ম্যানেজার' : 'মেম্বার'}</span>
        </div>
      </div>

      {/* Stats Grid - Global */}
      <h2 className="text-lg font-bold text-white mt-8 mb-4 border-b border-gray-800 pb-2">মাসিক সার্বিক হিসাব</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Utensils size={80} className="text-primary" />
          </div>
          <span className="text-gray-400 text-sm font-medium">মোট মিল</span>
          <span className="text-2xl font-bold text-white">{data.stats.totalMeals}</span>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} className="text-blue-500" />
          </div>
          <span className="text-gray-400 text-sm font-medium">মিল রেট</span>
          <span className="text-2xl font-bold text-white">৳{data.stats.mealRate}</span>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} className="text-rose-500" />
          </div>
          <span className="text-gray-400 text-sm font-medium">বাজার খরচ</span>
          <span className="text-2xl font-bold text-white">৳{data.stats.totalShopping}</span>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={80} className="text-orange-500" />
          </div>
          <span className="text-gray-400 text-sm font-medium">অন্যান্য খরচ</span>
          <span className="text-2xl font-bold text-white">৳{data.stats.totalOtherExpense}</span>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={80} className="text-emerald-500" />
          </div>
          <span className="text-gray-400 text-sm font-medium">মাথাপিছু অন্যান্য</span>
          <span className="text-2xl font-bold text-white">৳{data.stats.perMemberOtherExpense}</span>
        </div>
      </div>

      {/* Stats Grid - Personal */}
      <h2 className="text-lg font-bold text-white mt-8 mb-4 border-b border-gray-800 pb-2">আপনার ব্যক্তিগত রিপোর্ট</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">আপনার মিল</span>
          <span className="text-2xl font-bold text-emerald-400">{data.userStats.totalMeals}</span>
        </div>
        
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">আপনার মিল খরচ</span>
          <span className="text-2xl font-bold text-blue-400">৳{data.userStats.mealCost}</span>
        </div>

        <div className="bg-orange-950/20 border border-orange-900/40 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">অন্যান্য খরচ অংশ</span>
          <span className="text-2xl font-bold text-orange-400">৳{data.userStats.otherExpenseShare}</span>
        </div>
        
        <div className="bg-purple-950/20 border border-purple-900/40 rounded-2xl p-5 flex flex-col gap-2">
          <span className="text-gray-400 text-sm font-medium">আপনার মোট জমা</span>
          <span className="text-2xl font-bold text-purple-400">৳{data.userStats.totalPaid}</span>
        </div>
        
        <div className={`border rounded-2xl p-5 flex flex-col gap-2 ${
          data.userStats.status === 'due' 
            ? 'bg-rose-950/20 border-rose-900/40' 
            : 'bg-emerald-950/20 border-emerald-900/40'
        }`}>
          <span className="text-gray-400 text-sm font-medium flex items-center justify-between">
            {data.userStats.status === 'due' ? 'আপনার বকেয়া' : 'আপনার অতিরিক্ত জমা'}
            <AlertCircle size={14} className={data.userStats.status === 'due' ? 'text-rose-500' : 'text-emerald-500'} />
          </span>
          <span className={`text-2xl font-bold ${data.userStats.status === 'due' ? 'text-rose-400' : 'text-emerald-400'}`}>
            ৳{Math.abs(data.userStats.balance)}
          </span>
        </div>

      </div>

      {/* Analytics Overview */}
      {data.stats?.dailyData && data.stats.dailyData.length > 0 && (
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">অ্যানালিটিক্স (Analytics)</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Trends */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">দৈনিক খরচ (বাজার বনাম অন্যান্য)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.stats.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorShopping" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickFormatter={(val: string) => val.split('-')[2]} />
                    <YAxis stroke="#4b5563" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '0.5rem', color: '#fff' }}
                      itemStyle={{ fontSize: '14px' }}
                    />
                    <Legend />
                    <Area type="monotone" name="বাজার খরচ" dataKey="shopping" stroke="#f43f5e" fillOpacity={1} fill="url(#colorShopping)" />
                    <Area type="monotone" name="অন্যান্য খরচ" dataKey="expenses" stroke="#f97316" fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Meal Trends */}
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">দৈনিক মিল খাওয়ার হার</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.stats.dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickFormatter={(val: string) => val.split('-')[2]} />
                    <YAxis stroke="#4b5563" fontSize={12} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', borderRadius: '0.5rem', color: '#fff' }}
                      itemStyle={{ fontSize: '14px' }}
                      cursor={{ fill: '#1f2937' }}
                    />
                    <Legend />
                    <Bar name="মোট মিল" dataKey="meals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
