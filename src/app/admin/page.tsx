"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { toast } from "sonner";
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  DollarSign,
  ClipboardList,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MonitorSmartphone,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, description, trend, color }: StatCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 p-5 hover:border-gray-700 transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Glow Effect */}
      <div className={`absolute top-0 right-0 h-24 w-24 rounded-full filter blur-[40px] opacity-10 transition-opacity group-hover:opacity-20 ${color}`} />
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 font-parkinsans">{title}</span>
        <div className={`p-2.5 rounded-lg text-white ${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-2xl font-bold font-orbitron tracking-wide text-white">
          {value}
        </h3>
        <p className="text-xs text-gray-500 font-parkinsans mt-1 flex items-center gap-1.5">
          {trend && <span className="text-green-400 font-semibold font-mono flex items-center"><TrendingUp size={12} className="mr-0.5" />{trend}</span>}
          <span>{description}</span>
        </p>
      </div>
    </Card>
  );
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalBids: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    txData: [] as any[],
    depositStatusData: [] as any[],
    ordersData: [] as any[],
    platformData: [] as any[],
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const token = localStorage.getItem("auth_token");
      try {
        const [usersRes, productsRes, bidsRes, depositsRes, withdrawalsRes, ordersRes, loginHistoryRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product`),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/bid`),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/e-commerce-product/orders/all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/login-history/all`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const users = usersRes.ok ? await usersRes.json() : [];
        const products = productsRes.ok ? await productsRes.json() : [];
        const bids = bidsRes.ok ? await bidsRes.json() : [];
        const allDeposits = depositsRes.ok ? await depositsRes.json() : [];
        const allWithdrawals = withdrawalsRes.ok ? await withdrawalsRes.json() : [];
        const allOrders = ordersRes.ok ? await ordersRes.json() : [];
        const loginHistoryData = loginHistoryRes?.ok ? await loginHistoryRes.json() : { history: [] };
        const loginHistory = loginHistoryData?.history || [];

        // Calculations
        const approvedDeposits = allDeposits.filter((d: any) => d.status === "approved");
        const approvedWithdrawals = allWithdrawals.filter((w: any) => w.status === "approved");

        const totalDepAmount = approvedDeposits.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
        const totalWitAmount = approvedWithdrawals.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);
        
        // Revenue is order sums
        const totalRevenue = allOrders.reduce((acc: number, curr: any) => acc + (Number(curr.total_price) || 0), 0);

        const pendingDeps = allDeposits.filter((d: any) => d.status === "pending").length;
        const pendingWits = allWithdrawals.filter((w: any) => w.status === "pending").length;

        // Chart Calculations
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();
        
        const txData = last7Days.map(dateStr => ({
          date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: dateStr,
          deposits: 0,
          withdrawals: 0
        }));

        approvedDeposits.forEach((d: any) => {
          const dateStr = new Date(d.createdAt || Date.now()).toISOString().split('T')[0];
          const day = txData.find(t => t.fullDate === dateStr);
          if(day) day.deposits += (Number(d.amount) || 0);
        });

        approvedWithdrawals.forEach((w: any) => {
          const dateStr = new Date(w.createdAt || Date.now()).toISOString().split('T')[0];
          const day = txData.find(t => t.fullDate === dateStr);
          if(day) day.withdrawals += (Number(w.amount) || 0);
        });

        const rejectedDeps = allDeposits.filter((d: any) => d.status === "rejected").length;
        const depositStatusData = [
          { name: 'Approved', value: approvedDeposits.length },
          { name: 'Pending', value: pendingDeps },
          { name: 'Rejected', value: rejectedDeps },
        ];

        const ordersData = last7Days.map(dateStr => ({
          date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
          fullDate: dateStr,
          orders: 0,
          revenue: 0
        }));

        allOrders.forEach((o: any) => {
          const dateStr = new Date(o.createdAt || Date.now()).toISOString().split('T')[0];
          const day = ordersData.find(od => od.fullDate === dateStr);
          if (day) {
            day.orders += 1;
            day.revenue += (Number(o.total_price) || 0);
          }
        });

        const platformData = [
          { name: 'Products', value: products.length },
          { name: 'Auctions', value: bids.length }
        ];

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          totalBids: bids.length,
          totalDeposits: totalDepAmount,
          totalWithdrawals: totalWitAmount,
          totalOrders: allOrders.length,
          totalRevenue,
          pendingDeposits: pendingDeps,
          pendingWithdrawals: pendingWits,
          txData,
          depositStatusData,
          ordersData,
          platformData
        });

        // 3. Compile Recent Activities
        const activities: any[] = [];
        
        // Add users (newest registered at end or start, let's reverse to show newest first if sorted, or just slice and sort by date)
        users.slice(-5).forEach((u: any) => {
          activities.push({
            type: "user",
            message: `New user registered: ${u.name} (${u.email})`,
            date: new Date(u.createdAt || Date.now()),
          });
        });

        // Add deposits
        allDeposits.slice(0, 5).forEach((d: any) => {
          activities.push({
            type: "deposit",
            message: `${d.user_name} requested deposit of ৳${d.amount || "pending"} via ${d.paymentMethod}`,
            date: new Date(d.createdAt || Date.now()),
            status: d.status,
          });
        });

        // Add withdrawals
        allWithdrawals.slice(0, 5).forEach((w: any) => {
          activities.push({
            type: "withdraw",
            message: `${w.user_name} requested withdrawal of ৳${w.amount} to ${w.mobileNumber}`,
            date: new Date(w.createdAt || Date.now()),
            status: w.status,
          });
        });

        // Add logins
        if (loginHistory && Array.isArray(loginHistory)) {
          loginHistory.slice(0, 8).forEach((l: any) => {
            activities.push({
              type: "login",
              message: `${l.user?.name || 'User'} logged in via ${l.clientPlatform || 'Web Browser'}`,
              date: new Date(l.createdAt || Date.now()),
              platform: l.clientPlatform || "Web Browser",
            });
          });
        }

        // Sort activities by date descending
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentActivity(activities.slice(0, 8));

      } catch (err) {
        console.error(err);
        toast.error("Failed to load aggregate dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <SpinnerCustom />
        <span className="text-gray-400 text-sm font-parkinsans">Loading system analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Real-time analytics and financial escrows overview.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users size={20} />}
          description="Registered profiles"
          trend="+12%"
          color="bg-blue-600 shadow-blue-900/20"
        />
        <StatCard
          title="Total Deposits"
          value={`৳${stats.totalDeposits.toLocaleString()}`}
          icon={<ArrowDownLeft size={20} />}
          description="Approved wallet deposits"
          trend="+8%"
          color="bg-green-600 shadow-green-900/20"
        />
        <StatCard
          title="Total Withdrawals"
          value={`৳${stats.totalWithdrawals.toLocaleString()}`}
          icon={<ArrowUpRight size={20} />}
          description="Approved cash-outs"
          color="bg-red-600 shadow-red-900/20"
        />
        <StatCard
          title="Total Shop Revenue"
          value={`৳${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={20} />}
          description="Sales transaction volumes"
          trend="+15%"
          color="bg-purple-600 shadow-purple-900/20"
        />
        <StatCard
          title="Active Products"
          value={stats.totalProducts}
          icon={<ShoppingBag size={20} />}
          description="Available in e-shop"
          color="bg-indigo-600 shadow-indigo-900/20"
        />
        <StatCard
          title="Total Auctions"
          value={stats.totalBids}
          icon={<ClipboardList size={20} />}
          description="Bids and posts created"
          color="bg-orange-600 shadow-orange-900/20"
        />
        <StatCard
          title="Pending Deposits"
          value={stats.pendingDeposits}
          icon={<Clock size={20} />}
          description="Requests awaiting verification"
          color="bg-yellow-600 shadow-yellow-900/20"
        />
        <StatCard
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
          icon={<Clock size={20} />}
          description="Payouts awaiting processing"
          color="bg-pink-600 shadow-pink-900/20"
        />
      </div>

      {/* Charts section Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="bg-gray-900 border-gray-800 p-5 lg:col-span-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full filter blur-[60px] opacity-10 bg-green-500 transition-opacity group-hover:opacity-20" />
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white mb-4">
            Transaction Trends (Last 7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.txData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', backdropFilter: 'blur(10px)', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="deposits" name="Deposits" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorDeposits)" />
                <Area type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWithdrawals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full filter blur-[50px] opacity-10 bg-yellow-500 transition-opacity group-hover:opacity-20" />
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white mb-4 self-start">
            Deposit Requests Status
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.depositStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.depositStatusData.map((entry: any, index: number) => {
                    const colors = ['#22c55e', '#eab308', '#ef4444'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', backdropFilter: 'blur(10px)', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts section Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="bg-gray-900 border-gray-800 p-5 lg:col-span-2 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 h-40 w-40 rounded-full filter blur-[60px] opacity-10 bg-purple-500 transition-opacity group-hover:opacity-20" />
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white mb-4">
            Daily Revenue & Orders (Last 7 Days)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ordersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', backdropFilter: 'blur(10px)', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="orders" name="Orders Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Platform Data Donut */}
        <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col items-center shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full filter blur-[50px] opacity-10 bg-indigo-500 transition-opacity group-hover:opacity-20" />
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white mb-4 self-start">
            Platform Listings
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.platformData.map((entry: any, index: number) => {
                    const colors = ['#6366f1', '#f97316'];
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', backdropFilter: 'blur(10px)', borderColor: '#374151', color: '#fff', borderRadius: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Actions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions & Pending summary */}
        <Card className="bg-gray-900 border-gray-800 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white mb-4">
              Quick Administrative Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/admin/deposits">
                <Button className="w-full justify-start gap-2 bg-green-600/10 text-green-400 border border-green-600/20 hover:bg-green-600/20 h-11 text-xs sm:text-sm font-parkinsans">
                  <ArrowDownLeft size={16} />
                  Approve Deposits ({stats.pendingDeposits})
                </Button>
              </Link>
              <Link href="/admin/withdrawals">
                <Button className="w-full justify-start gap-2 bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 h-11 text-xs sm:text-sm font-parkinsans">
                  <ArrowUpRight size={16} />
                  Approve Withdrawals ({stats.pendingWithdrawals})
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button className="w-full justify-start gap-2 bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600/20 h-11 text-xs sm:text-sm font-parkinsans">
                  <Users size={16} />
                  Manage User Accounts
                </Button>
              </Link>
              <Link href="/admin/notifications">
                <Button className="w-full justify-start gap-2 bg-purple-600/10 text-purple-400 border border-purple-600/20 hover:bg-purple-600/20 h-11 text-xs sm:text-sm font-parkinsans">
                  <ShieldCheck size={16} />
                  Send Notifications / Alerts
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-4 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 font-parkinsans">
              Escrow Summary
            </h4>
            <div className="flex items-center justify-between text-sm font-parkinsans text-gray-300">
              <span>Total Platform Revenue:</span>
              <span className="font-bold text-white font-orbitron">৳{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="bg-gray-900 border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2">
            <span>Recent System Activity</span>
          </h3>
          <span className="text-xs text-gray-500">Live aggregated actions</span>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No recent actions recorded.</p>
        ) : (
          <div className="space-y-3.5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-850">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-3 text-xs md:text-sm font-parkinsans border-b border-gray-900 pb-2.5 last:border-b-0"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-full mt-0.5 flex-shrink-0 ${
                      activity.type === "deposit"
                        ? "bg-green-600/20 text-green-400"
                        : activity.type === "withdraw"
                        ? "bg-red-600/20 text-red-400"
                        : activity.type === "login"
                        ? "bg-purple-600/20 text-purple-400"
                        : "bg-blue-600/20 text-blue-400"
                    }`}
                  >
                    {activity.type === "deposit" ? (
                      <ArrowDownLeft size={12} />
                    ) : activity.type === "withdraw" ? (
                      <ArrowUpRight size={12} />
                    ) : activity.type === "login" ? (
                      activity.platform === "PWA App" ? <MonitorSmartphone size={12} /> : <Globe size={12} />
                    ) : (
                      <Users size={12} />
                    )}
                  </div>
                  <p className="text-gray-300 min-w-0 leading-tight">
                    {activity.message}
                  </p>
                </div>
                
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-gray-500 block">
                    {new Date(activity.date).toLocaleTimeString("en-BD", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {activity.status && (
                    <span
                      className={`inline-block text-[9px] px-1 py-0.2 rounded font-semibold mt-0.5 capitalize ${
                        activity.status === "approved"
                          ? "bg-green-600/20 text-green-400"
                          : activity.status === "rejected"
                          ? "bg-red-600/20 text-red-400"
                          : "bg-yellow-600/20 text-yellow-400"
                      }`}
                    >
                      {activity.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div> 
  );
}
