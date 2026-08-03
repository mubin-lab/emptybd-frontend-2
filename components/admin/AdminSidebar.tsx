"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingBag,
  Gavel,
  ClipboardList,
  Tags,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Store,
  Megaphone,
  Headset,
  X,
  ShieldAlert,
  Building2,
  Video,
  Gem,
  PackageCheck,
  Gift,
  CheckCircle
} from "lucide-react";

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [pendingDepositsCount, setPendingDepositsCount] = useState(0);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);
  const [pendingSellerRequestsCount, setPendingSellerRequestsCount] = useState(0);

  const fetchPendingCounts = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    try {
      const [depRes, witRes, userRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/diposit/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/payment/all`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      if (depRes.ok) {
        const deps = await depRes.json();
        setPendingDepositsCount(deps.filter((d: any) => d.status === "pending").length);
      }
      if (witRes.ok) {
        const wits = await witRes.json();
        setPendingWithdrawalsCount(wits.filter((w: any) => w.status === "pending").length);
      }
      if (userRes.ok) {
        const users = await userRes.json();
        setPendingSellerRequestsCount(users.filter((u: any) => u.bid_account === "pending" || u.product_account === "pending").length);
      }
    } catch (err) {
      console.error("Sidebar pending fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchPendingCounts();
    // Polling enabled with 10s interval for real-time updates while managing API load
    const interval = setInterval(fetchPendingCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Listen to custom tab refresh event triggers
  useEffect(() => {
    const handleRefresh = () => {
      fetchPendingCounts();
    };
    window.addEventListener("refresh-pending-counts", handleRefresh);
    return () => window.removeEventListener("refresh-pending-counts", handleRefresh);
  }, []);

  interface MenuItem {
    label: string;
    href: string;
    icon: React.ComponentType<any>;
    badge?: number;
  }

  const menuItems: MenuItem[] = [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Pending Approvals",
      href: "/admin/pending-registrations",
      icon: ShieldAlert,
    },
    {
      label: "Deposits",
      href: "/admin/deposits",
      icon: ArrowDownLeft,
      badge: pendingDepositsCount > 0 ? pendingDepositsCount : undefined,
    },
    {
      label: "News",
      href: "/admin/news",
      icon: Megaphone,
    },
    {
      label: "Greatest Person",
      href: "/admin/greatest-person",
      icon: Users,
    },
    {
      label: "Reels Management",
      href: "/admin/reels",
      icon: Video,
    },
    {
      label: "Withdrawals",
      href: "/admin/withdrawals",
      icon: ArrowUpRight,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined,
    },
    {
      label: "Seller Requests",
      href: "/admin/seller-requests",
      icon: ClipboardList,
      badge: pendingSellerRequestsCount > 0 ? pendingSellerRequestsCount : undefined,
    },
    {
      label: "e-Shop Products",
      href: "/admin/products",
      icon: ShoppingBag,
    },
    {
      label: "Auctions & Bids",
      href: "/admin/bids",
      icon: Gavel,
    },
    {
      label: "Orders List",
      href: "/admin/orders",
      icon: ClipboardList,
    },
    {
      label: "Categories",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      label: "System Alerts",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      label: "Support Tickets",
      href: "/admin/support",
      icon: Headset,
    },
    {
      label: "Manage Packages",
      href: "/admin/packages",
      icon: PackageCheck,
    },
    {
      label: "Gift Tasks",
      href: "/admin/tasks",
      icon: Gift,
    },
    {
      label: "Task Applications",
      href: "/admin/task-applications",
      icon: CheckCircle,
    },
    {
      label: "Marketplace",
      href: "/admin/marketplace",
      icon: Store,
    },
    {
      label: "Card Generator",
      href: "/admin/card-generator",
      icon: Tags,
    },
    {
      label: "Ads Management",
      href: "/admin/ads",
      icon: Megaphone,
    },
    {
      label: "Smart Messes",
      href: "/admin/messes",
      icon: Building2,
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("location_prompt_time"); // Clear onboarding cooldown
    clearUser();
    toast.success("Successfully logged out of Admin Portal.");
    router.push("/");
  };

  return (
    <aside
      className={`bg-gray-950 border-r border-gray-900 transition-all duration-300 flex flex-col z-40 fixed lg:sticky top-0 h-screen 
      ${isCollapsed ? "lg:w-16" : "lg:w-64"} 
      ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-900">
        <Link href="/" className="flex items-center gap-2 overflow-hidden" onClick={onMobileClose}>
          {/* <Store className="h-6 w-6 text-primary flex-shrink-0" /> */}
          {(!isCollapsed || isMobileOpen) && (
            <span className="font-orbitron font-bold text-white text-lg tracking-wider whitespace-nowrap">
              EmptyBD <span className="text-[10px] text-primary block -mt-1 font-parkinsans uppercase font-normal">Admin Panel</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-900 hidden lg:block"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-900 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-900">
        {menuItems.filter((item) => {
          if (item.href === "/admin/card-generator" && user?.role !== "superAdmin") {
            return false;
          }
          return true;
        }).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-parkinsans transition-colors group relative ${
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-gray-400 hover:text-white hover:bg-gray-900/50"
              }`}
            >
              <div className="relative flex-shrink-0">
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-white"}`} />
                {isCollapsed && !isMobileOpen && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse border border-gray-950" />
                )}
              </div>
              {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
              {(!isCollapsed || isMobileOpen) && item.badge !== undefined && (
                <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              
              {/* Tooltip on Collapsed */}
              {isCollapsed && !isMobileOpen && (
                <div className="absolute left-16 bg-gray-900 text-white border border-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-parkinsans whitespace-nowrap z-50 shadow-md">
                  {item.label}
                  {item.badge !== undefined && ` (${item.badge} pending)`}
                </div>
              )}
            </Link>
          );
        })}
      </nav>


      {/* Admin Footer info */}
      <div className="p-3 border-t border-gray-900 flex flex-col gap-2 bg-gray-950/60">
        {(!isCollapsed || isMobileOpen) && user && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <img
              src={user.img || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-vector-illustration_561158-3383.jpg"}
              alt="Admin Profile"
              className="h-9 w-9 rounded-full border border-gray-800 object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white font-parkinsans truncate">
                {user.name}
              </p>
              <p className="text-[10px] text-gray-500 font-mono truncate">
                Super Admin
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium font-parkinsans text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer group relative w-full text-left`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-300" />
          {(!isCollapsed || isMobileOpen) && <span>Logout</span>}
          {isCollapsed && !isMobileOpen && (
            <div className="absolute left-16 bg-red-950 text-red-200 border border-red-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-parkinsans whitespace-nowrap z-50 shadow-md">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
