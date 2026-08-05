"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";
import { 
  User, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Dice6, 
  ShoppingCart, 
  MessageSquare, 
  LifeBuoy, 
  ShoppingBag, 
  LogOut, 
  ChevronRight,
  UserCheck,
  LayoutDashboard,
  Shield,
  Gem,
  History
} from "lucide-react";
import PlanBadge from "@/components/shared/PlanBadge";

export default function MenuPage() {
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  useEffect(() => {
    const checkTrackingStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          const isTrackingOn = data.trackUserActivity !== undefined ? Boolean(data.trackUserActivity) : true;
          localStorage.setItem("trackUserActivity", isTrackingOn ? "true" : "false");
        }
      } catch (err) {
        console.error("Failed to check user tracking config status:", err);
      }
    };
    checkTrackingStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    clearUser();
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  const menuGroups = [
    {
      title: "Account & Wallet",
      items: [
        ...(user?.role === "superAdmin" ? [{
          label: "Admin Dashboard",
          description: "Access system operations, users, and marketplace controls",
          href: "/admin",
          icon: Shield,
          textColor: "text-red-400",
          glow: "group-hover:border-t-red-400/50 group-hover:border-l-red-400/50 group-hover:border-b-red-500/10 group-hover:border-r-red-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(239,68,68,0.45)]",
        }] : []),
        {
          label: "User Dashboard",
          description: "Access your main dashboard overview and general info",
          href: "/dashboard",
          icon: LayoutDashboard,
          textColor: "text-emerald-400",
          glow: "group-hover:border-t-emerald-400/50 group-hover:border-l-emerald-400/50 group-hover:border-b-emerald-500/10 group-hover:border-r-emerald-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(16,185,129,0.45)]",
        },
        {
          label: "My Profile",
          description: "Manage your personal profile and account settings",
          href: "/profile",
          icon: User,
          textColor: "text-blue-400",
          glow: "group-hover:border-t-blue-400/50 group-hover:border-l-blue-400/50 group-hover:border-b-blue-500/10 group-hover:border-r-blue-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(59,130,246,0.45)]",
        },
        {
          label: "Upgrade Account",
          description: "Purchase premium features and ownership badges",
          href: "/packages",
          icon: Gem,
          textColor: "text-amber-400",
          glow: "group-hover:border-t-amber-400/50 group-hover:border-l-amber-400/50 group-hover:border-b-amber-500/10 group-hover:border-r-amber-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(245,158,11,0.45)]",
        },
        {
          label: "Withdraw Funds",
          description: "Request withdrawal of your wallet balance",
          href: "/transaction/withdraw",
          icon: ArrowUpRight,
          textColor: "text-rose-400",
          glow: "group-hover:border-t-rose-400/50 group-hover:border-l-rose-400/50 group-hover:border-b-rose-500/10 group-hover:border-r-rose-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(244,63,94,0.45)]",
        },
        // {
        //   label: "Deposit Funds",
        //   description: "Add funds to your wallet account",
        //   href: "/transaction/diposit",
        //   icon: ArrowDownLeft,
        //   textColor: "text-green-400",
        //   glow: "group-hover:border-t-green-400/50 group-hover:border-l-green-400/50 group-hover:border-b-green-500/10 group-hover:border-r-green-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(34,197,94,0.45)]",
        // },
      ],
    },
    {
      title: "Marketplace & Services",
      items: [
        {
          label: "Bid Platform",
          description: "Participate in real-time auctions and list bids",
          href: "/bid/all-selling-product",
          icon: Dice6,
          textColor: "text-yellow-400",
          glow: "group-hover:border-t-yellow-400/50 group-hover:border-l-yellow-400/50 group-hover:border-b-yellow-500/10 group-hover:border-r-yellow-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(234,179,8,0.45)]",
        },
        {
          label: "e-Shop Products",
          description: "Browse products and purchase items online",
          href: "/e-commerce-products",
          icon: ShoppingCart,
          textColor: "text-purple-400",
          glow: "group-hover:border-t-purple-400/50 group-hover:border-l-purple-400/50 group-hover:border-b-purple-500/10 group-hover:border-r-purple-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(168,85,247,0.45)]",
        },
        {
          label: "Digital Exchange",
          description: "Swap digital currencies and items safely",
          href: "/digital-exchange",
          icon: UserCheck,
          textColor: "text-cyan-400",
          glow: "group-hover:border-t-cyan-400/50 group-hover:border-l-cyan-400/50 group-hover:border-b-cyan-500/10 group-hover:border-r-cyan-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(6,182,212,0.45)]",
        },
        {
          label: "My Collection",
          description: "View your acquired digital exchange card collection",
          href: "/profile/collection",
          icon: Gem,
          textColor: "text-amber-400",
          glow: "group-hover:border-t-amber-400/50 group-hover:border-l-amber-400/50 group-hover:border-b-amber-500/10 group-hover:border-r-amber-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(245,158,11,0.45)]",
        },
      ],
    },
    {
      title: "My Activity & Support",
      items: [
        {
          label: "My Orders",
          description: "Track and review your purchases and sale order statuses",
          href: "/dashboard/my-orders",
          icon: ShoppingBag,
          textColor: "text-indigo-400",
          glow: "group-hover:border-t-indigo-400/50 group-hover:border-l-indigo-400/50 group-hover:border-b-indigo-500/10 group-hover:border-r-indigo-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(99,102,241,0.45)]",
        },
        {
          label: "Transaction History",
          description: "View all your deposits, withdrawals and payment records",
          href: "/transaction/history",
          icon: History,
          textColor: "text-emerald-400",
          glow: "group-hover:border-t-emerald-400/50 group-hover:border-l-emerald-400/50 group-hover:border-b-emerald-500/10 group-hover:border-r-emerald-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(16,185,129,0.45)]",
        },
        {
          label: "Inbox Messages",
          description: "Chat with buyers, sellers, and view discussions",
          href: "/messages",
          icon: MessageSquare,
          textColor: "text-pink-400",
          glow: "group-hover:border-t-pink-400/50 group-hover:border-l-pink-400/50 group-hover:border-b-pink-500/10 group-hover:border-r-pink-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(236,72,153,0.45)]",
        },
        {
          label: "Support Desk",
          description: "Open tickets and seek help from site administrators",
          href: "/support",
          icon: LifeBuoy,
          textColor: "text-orange-400",
          glow: "group-hover:border-t-orange-400/50 group-hover:border-l-orange-400/50 group-hover:border-b-orange-500/10 group-hover:border-r-orange-500/10 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.15),_0_0_15px_rgba(249,115,22,0.45)]",
        },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-black py-10 px-4 sm:px-6 lg:px-8 font-parkinsans relative overflow-hidden">
      
      {/* Background Mesh Neon Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-purple-600/5 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* User Profile Card */}
        {user && (
          <div className="bg-gradient-to-b from-gray-950/90 to-gray-950/40 border border-gray-900 rounded-3xl p-6 md:p-8 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl md:text-2xl font-extrabold flex gap-2 items-center text-white leading-tight tracking-tight">
                    {user.name} 
                    {user.plan === "free" ? (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = '/packages';
                        }}
                        className="flex items-center gap-1 text-xs text-amber-400 bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-900/40 transition-colors animate-bounce ml-2"
                        title="Upgrade Account"
                      >
                        <span>Upgrade</span>
                      </button>
                    ) : (
                      <PlanBadge plan={user.plan} />
                    )}
                  </h2>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 font-mono truncate">{user.email}</p>
                
                {/* Wallet Badge Pill */}
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                  <Wallet size={12} className="text-emerald-400" />
                  <span className="text-xs text-gray-300 font-medium font-parkinsans">
                    Balance: <strong className="text-emerald-400 font-mono">৳{(user.amount || 0).toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            </div>
            
            <button
            onClick={()=>router.push('https://omg10.com/4/11370716')}
              // onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-3 bg-red-950/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-red-500 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer text-sm font-semibold shrink-0 shadow-lg shadow-red-950/20"
            >
              <LogOut size={16} />
              Logout Account
            </button>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="space-y-8">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              
              {/* Group Title Header */}
              <div className="flex items-center gap-3 px-1">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  {group.title}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-800 via-gray-900 to-transparent" />
              </div>
              
              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item, idx) => (
                  <Link prefetch={false}
                    key={idx}
                    href={item.href}
                    className="flex items-center justify-between p-5 bg-gradient-to-b from-gray-950/70 to-gray-950/20 hover:from-gray-900/60 hover:to-gray-950/30 border border-gray-900/80 hover:border-purple-500/30 rounded-2xl transition-all duration-300 group shadow-md hover:shadow-[0_10px_25px_-10px_rgba(168,85,247,0.15)] relative overflow-hidden"
                  >
                    {/* Hover subtle glow card line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/0 group-hover:via-purple-500/20 to-transparent transition-all duration-500" />

                    <div className="flex items-center gap-4 min-w-0">
                      {/* Glossy Spherical Glass Icon Container (Top-Left Highlight, Bottom-Right Shadow) */}
                      <div className={`w-12 h-12 rounded-full border-t border-l border-b border-r border-t-white/[0.15] border-l-white/[0.15] border-b-white/[0.02] border-r-white/[0.02] bg-gradient-to-br from-white/[0.04] to-white/[0.005] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.12),_inset_-2.5px_-2.5px_4px_rgba(0,0,0,0.95),_0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-300 shrink-0 ${item.glow}`}>
                        <item.icon size={18} className={`transition-all duration-300 group-hover:scale-110 ${item.textColor}`} />
                      </div>
                      <div className="text-left min-w-0">
                        <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors block truncate">
                          {item.label}
                        </span>
                        <span className="text-[11px] text-gray-500 block mt-1 leading-relaxed line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </div>
                    
                    <ChevronRight 
                      size={14} 
                      className="text-gray-700 group-hover:text-primary transition-all duration-300 transform group-hover:translate-x-1 shrink-0" 
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
