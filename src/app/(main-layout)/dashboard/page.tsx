"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Gavel,
  Award,
  TrendingUp,
  DollarSign,
  Lock,
  Wallet,
  ArrowRight,
  User,
  ShoppingBag,
  Newspaper,
  ThumbsUp,
  BarChart2,
  Activity,
} from "lucide-react";
import Link from "next/link";
import AdminOnboardingStats from "@/components/dashboard/AdminOnboardingStats";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

interface BiddingStats {
  wonCount: number;
  totalSpent: number;
  activeCount: number;
  totalBidsCount: number;
}

interface NewsPost {
  _id: string;
  news_description: string;
  publish: string;
  reactions: string[];
  status?: string;
}

// ─── Mini Bar Chart (pure SVG) ─────────────────────────────────────────────
function MiniBarChart({
  data,
  color = "#6366f1",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data, 1);
  const barW = 100 / (data.length * 2 - 1);
  return (
    <svg viewBox="0 0 100 40" className="w-full h-12" preserveAspectRatio="none">
      {data.map((v, i) => {
        const h = (v / max) * 36;
        const x = i * barW * 2;
        return (
          <rect
            key={i}
            x={x}
            y={40 - h}
            width={barW}
            height={h}
            rx="2"
            fill={color}
            opacity={0.7 + (i / data.length) * 0.3}
          />
        );
      })}
    </svg>
  );
}

// ─── Sparkline Chart (pure SVG) ─────────────────────────────────────────────
function SparkLine({
  data,
  color = "#10b981",
}: {
  data: number[];
  color?: string;
}) {
  const max = Math.max(...data, 1);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 40 - (v / max) * 36;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({
  value,
  max = 100,
  color = "#6366f1",
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  label: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / Math.max(max, 1)) * 100));
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="#1f2937" strokeWidth="10" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white font-mono">{Math.round(pct)}%</span>
        <span className="text-[9px] text-gray-400 uppercase font-bold">{label}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<BiddingStats | null>(null);
  const [myPosts, setMyPosts] = useState<NewsPost[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Fetch bidding stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/analytics/bidding-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) setStats(await res.json());
      } catch {
        // silent
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch user's news posts
  useEffect(() => {
    async function fetchPosts() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token || !user?.email) return;
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/news-data/by-email/${user.email}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data: NewsPost[] = await res.json();
          setMyPosts(data.sort((a, b) => new Date(b.publish).getTime() - new Date(a.publish).getTime()));
        }
      } catch {
        // silent
      } finally {
        setLoadingPosts(false);
      }
    }
    if (user?.email) fetchPosts();
  }, [user?.email]);

  // ── Derived post analytics ───────────────────────────────────────────────
  const totalPosts = myPosts.length;
  const totalLikes = myPosts.reduce((s, p) => s + (p.reactions?.length || 0), 0);
  const approvedPosts = myPosts.filter((p) => p.status === "approve").length;
  const pendingPosts = myPosts.filter((p) => (p.status || "pending") === "pending").length;

  // Last 7 posts likes (for sparkline)
  const last7Likes = myPosts.slice(0, 7).map((p) => p.reactions?.length || 0).reverse();

  // Posts per day last 7 days (for bar chart)
  const postsPerDay = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();
    return myPosts.filter((p) => new Date(p.publish).toDateString() === dateStr).length;
  });

  // Win rate
  const winRatePct =
    stats && stats.totalBidsCount > 0
      ? Math.min(100, Math.round((stats.wonCount / stats.totalBidsCount) * 100))
      : 0;

  const walletTotal = Number(user?.amount || 0) + Number(user?.escrow_locked || 0);

  if (loadingStats && loadingPosts) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/40 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-800/40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-pink-900/30 border border-indigo-500/20 p-6 md:p-8 backdrop-blur-md">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
            Welcome back, <span className="text-indigo-400">{user?.name}</span> 👋
          </h1>
          <p className="text-gray-300 text-sm md:text-base max-w-xl">
            Here&apos;s a live snapshot of your posts, bids, and wallet activity.
          </p>
        </div>
      </div>

      {/* ── Admin section ───────────────────────────────────────────────── */}
      <AdminOnboardingStats />

      {/* ── Post Analytics Cards ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Newspaper size={15} className="text-indigo-400" />
          My News Posts
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Posts */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-indigo-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Posts</span>
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                <Newspaper size={14} />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-white font-mono">{totalPosts}</h4>
            <p className="text-[10px] text-gray-500 mt-1">All time posts submitted</p>
          </div>

          {/* Total Likes */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-pink-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Likes</span>
              <div className="p-1.5 bg-pink-500/10 rounded-lg text-pink-400 group-hover:bg-pink-500/20 transition-colors">
                <ThumbsUp size={14} />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-white font-mono">{totalLikes}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Reactions across all posts</p>
          </div>

          {/* Approved */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Approved</span>
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Award size={14} />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-white font-mono">{approvedPosts}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Posts live & visible publicly</p>
          </div>

          {/* Pending */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending</span>
              <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Activity size={14} />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-white font-mono">{pendingPosts}</h4>
            <p className="text-[10px] text-gray-500 mt-1">Awaiting admin review</p>
          </div>
        </div>
      </section>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posts Activity Bar Chart */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 size={15} className="text-indigo-400" />
                Posts Activity
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Posts published — last 7 days</p>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              7d
            </span>
          </div>
          {postsPerDay.some((v) => v > 0) ? (
            <>
              <MiniBarChart data={postsPerDay} color="#6366f1" />
              <div className="flex justify-between mt-2">
                {["6d", "5d", "4d", "3d", "2d", "1d", "Today"].map((l) => (
                  <span key={l} className="text-[9px] text-gray-600">{l}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-16 text-gray-600 text-xs">
              No posts in last 7 days
            </div>
          )}
        </div>

        {/* Likes Sparkline */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ThumbsUp size={15} className="text-pink-400" />
                Likes Trend
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Likes on your last 7 posts</p>
            </div>
            <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full">
              {totalLikes} total
            </span>
          </div>
          {last7Likes.some((v) => v > 0) ? (
            <SparkLine data={last7Likes.length > 0 ? last7Likes : [0, 0, 0, 0, 0, 0, 0]} color="#ec4899" />
          ) : (
            <div className="flex items-center justify-center h-10 text-gray-600 text-xs">
              No likes yet
            </div>
          )}

          {/* Top post */}
          {myPosts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-[10px] text-gray-500 mb-1">🏆 Top liked post</p>
              <p className="text-xs text-gray-300 line-clamp-1">
                {myPosts.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))[0]?.news_description}
              </p>
              <span className="text-[10px] text-pink-400 font-mono">
                {myPosts[0]?.reactions?.length || 0} likes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Wallet & Escrow ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Wallet size={15} className="text-blue-400" />
          Wallet &amp; Escrow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-blue-500/40 transition-all group">
            <div className="absolute right-3 top-3 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
              <DollarSign size={44} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Withdrawable</p>
            <h3 className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span className="text-blue-400 text-base">৳</span>
              {Number(user?.amount || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2">Available for withdrawal</p>
          </div>

          <div className="relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-amber-500/40 transition-all group">
            <div className="absolute right-3 top-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
              <Lock size={44} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Locked Escrow</p>
            <h3 className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span className="text-amber-400 text-base">৳</span>
              {Number(user?.escrow_locked || 0).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2">Locked in active auctions</p>
          </div>

          <div className="relative overflow-hidden bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-purple-500/40 transition-all group">
            <div className="absolute right-3 top-3 text-purple-500/10 group-hover:text-purple-500/20 transition-colors">
              <TrendingUp size={44} />
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Assets</p>
            <h3 className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span className="text-purple-400 text-base">৳</span>
              {walletTotal.toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-500 mt-2">Withdrawable + Locked</p>
          </div>
        </div>
      </section>

      {/* ── Bidding Performance ──────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Gavel size={15} className="text-emerald-400" />
          Bidding Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut win rate */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3">
            <DonutChart value={winRatePct} max={100} color="#6366f1" label="Win Rate" />
            <p className="text-xs text-center text-gray-500">
              <span className="text-white font-semibold font-mono">{stats?.wonCount || 0}</span> wins out of{" "}
              <span className="text-white font-semibold font-mono">{stats?.totalBidsCount || 0}</span> bids
            </p>
          </div>

          {/* Bid stats grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[
              { label: "Active Bids", value: stats?.activeCount || 0, icon: <Gavel size={15} />, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Auctions Won", value: stats?.wonCount || 0, icon: <Award size={15} />, color: "text-emerald-400", bg: "bg-emerald-500/10" },
              { label: "Total Bids", value: stats?.totalBidsCount || 0, icon: <TrendingUp size={15} />, color: "text-purple-400", bg: "bg-purple-500/10" },
              {
                label: "Total Spent",
                value: `৳${Number(stats?.totalSpent || 0).toLocaleString()}`,
                icon: <DollarSign size={15} />,
                color: "text-rose-400",
                bg: "bg-rose-500/10",
              },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:bg-gray-900/70 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</span>
                  <div className={`p-1.5 ${s.bg} rounded-lg ${s.color}`}>{s.icon}</div>
                </div>
                <h4 className="text-2xl font-extrabold text-white font-mono">{s.value}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Navigation ─────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ArrowRight size={15} className="text-gray-400" />
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: "/dashboard/my-orders", label: "My Orders & Bids", icon: <ShoppingBag size={18} />, color: "text-blue-400", bg: "bg-blue-500/10", hoverBorder: "hover:border-blue-500/30" },
            { href: "/dashboard/my-published-bids", label: "My Published Bids", icon: <Gavel size={18} />, color: "text-purple-400", bg: "bg-purple-500/10", hoverBorder: "hover:border-purple-500/30" },
            { href: "/dashboard/my-posts", label: "My News Posts", icon: <Newspaper size={18} />, color: "text-indigo-400", bg: "bg-indigo-500/10", hoverBorder: "hover:border-indigo-500/30" },
            { href: "/transaction-history", label: "Transaction History", icon: <DollarSign size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/10", hoverBorder: "hover:border-emerald-500/30" },
            { href: "/profile", label: "Profile Settings", icon: <User size={18} />, color: "text-amber-400", bg: "bg-amber-500/10", hoverBorder: "hover:border-amber-500/30" },
          ].map((item) => (
            <Link prefetch={false}
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between p-4 rounded-xl bg-gray-900/50 border border-gray-800 ${item.hoverBorder} hover:bg-gray-900/70 transition-all group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>{item.icon}</div>
                <span className="text-sm text-gray-200 font-medium">{item.label}</span>
              </div>
              <ArrowRight size={15} className={`text-gray-600 group-hover:${item.color} group-hover:translate-x-1 transition-all`} />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent Posts Preview ─────────────────────────────────────────── */}
      {myPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Newspaper size={15} className="text-indigo-400" />
              Recent Posts
            </h2>
            <Link prefetch={false} href="/dashboard/my-posts" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {myPosts.slice(0, 3).map((post) => {
              const statusColors: Record<string, string> = {
                approve: "bg-emerald-900/40 text-emerald-400 border-emerald-800",
                pending: "bg-amber-900/40 text-amber-400 border-amber-800",
                draft: "bg-gray-800 text-gray-400 border-gray-700",
              };
              const s = post.status || "pending";
              return (
                <div key={post._id} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 line-clamp-2">{post.news_description}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(post.publish).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${statusColors[s] || statusColors.pending}`}>
                      {s}
                    </span>
                    <span className="text-[10px] text-pink-400 font-mono flex items-center gap-1">
                      <ThumbsUp size={9} /> {post.reactions?.length || 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <PageHelpPanel pageKey="dashboard" />
    </div>
  );
}
