"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Clock, MonitorPlay, MousePointerClick, Calendar, Loader2, Heart, MessageSquare, ExternalLink, MonitorSmartphone, Globe } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface ActivityLog {
  _id: string;
  action_type: string;
  page: string;
  duration_ms: number;
  timestamp: string;
  clientPlatform?: string;
  details?: any;
}

interface ActivitySummary {
  totalTimeSpentMs: number;
  totalSessions: number;
  lastActive: string | null;
  topPages: { page: string; count: number }[];
}

export default function UserActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") || "";

  // Cast use(params) to bypass any Next.js 15 TS inference issues in client components
  const resolvedParams = use(params) as { id: string };
  const userId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/activity/admin/users/${encodeURIComponent(email)}?page=${page}&limit=20&actionType=${filterType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (!res.ok) throw new Error("Failed to fetch activity");
      const data = await res.json();
      setLogs(data.data);
      setSummary(data.summary);
      setTotalPages(data.pagination.pages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [email, page, filterType]);

  useEffect(() => {
    if (email) {
      fetchActivity();
    }
  }, [email, fetchActivity]);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2.5 bg-gray-900/80 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            <h1 className="text-3xl font-extrabold font-parkinsans text-white tracking-tight">Activity Timeline</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {email}
          </p>
        </div>
      </div>

      {loading && !summary ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-primary to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <MonitorPlay className="text-primary" size={18} /> Overview
              </h3>
              
              <div className="space-y-5">
                <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Time Spent</p>
                  <p className="text-2xl font-bold text-white font-orbitron drop-shadow-sm">
                    {formatDuration(summary?.totalTimeSpentMs || 0)}
                  </p>
                </div>
                
                <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-emerald-400 drop-shadow-sm">{summary?.totalSessions || 0}</p>
                </div>

                <div className="bg-gray-950/50 p-3 rounded-xl border border-gray-800/50">
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-1">Last Active</p>
                  <p className="text-sm font-medium text-gray-200">
                    {summary?.lastActive ? format(new Date(summary.lastActive), 'PPp') : "Never"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-gray-700 transition-colors">
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                <MousePointerClick className="text-purple-400" size={18} /> Top Pages
              </h3>
              <div className="space-y-2.5">
                {summary?.topPages?.map((tp, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-950/80 p-2.5 rounded-lg border border-gray-800/50 hover:bg-gray-800/50 transition-colors">
                    <span className="text-xs text-gray-300 font-medium truncate max-w-[140px]" title={tp.page}>
                      {tp.page.split('?')[0] || '/'}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 shadow-sm">
                      {tp.count} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="lg:col-span-3 bg-gray-900/50 border border-gray-800 rounded-2xl p-5 backdrop-blur-md flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="text-primary" size={18} /> Activity Log
              </h3>
              
              <select 
                className="bg-gray-950 border border-gray-800 text-sm text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All Activities</option>
                <option value="page_view">Page Views</option>
                <option value="like">Likes</option>
                <option value="comment">Comments</option>
                <option value="action">Other Actions</option>
              </select>
            </div>

            <div className="flex-1 relative mt-2">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                    <Calendar size={24} className="text-gray-600" />
                  </div>
                  <p className="text-sm font-medium">No activity found for this user.</p>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-800 before:via-gray-700 before:to-gray-900 opacity-90">
                  {logs.map((log, i) => {
                    
                    const isLike = log.action_type === 'like';
                    const isComment = log.action_type === 'comment';
                    const isPageView = log.action_type === 'page_view';

                    let Icon = MousePointerClick;
                    let iconColorClass = "text-purple-400 group-hover:text-purple-300";
                    let badgeClass = "bg-purple-500/10 text-purple-400";

                    if (isPageView) {
                      Icon = MonitorPlay;
                      iconColorClass = "text-blue-400 group-hover:text-blue-300";
                      badgeClass = "bg-blue-500/10 text-blue-400";
                    } else if (isLike) {
                      Icon = Heart;
                      iconColorClass = "text-pink-500 group-hover:text-pink-400";
                      badgeClass = "bg-pink-500/10 text-pink-400";
                    } else if (isComment) {
                      Icon = MessageSquare;
                      iconColorClass = "text-emerald-400 group-hover:text-emerald-300";
                      badgeClass = "bg-emerald-500/10 text-emerald-400";
                    }

                    return (
                      <div key={log._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-gray-900 bg-gray-950 shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-300 group-hover:scale-110 ${iconColorClass}`}>
                          <Icon size={16} className={isLike ? "fill-pink-500" : ""} />
                        </div>
                        
                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-gray-950/80 backdrop-blur-sm border border-gray-800/80 p-4 rounded-xl shadow-lg hover:shadow-xl hover:border-gray-700/80 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden group-hover:bg-gray-900/60">
                          
                          {/* Top Border Accent */}
                          <div className={`absolute top-0 left-0 w-full h-0.5 opacity-50 ${isLike ? 'bg-pink-500' : isComment ? 'bg-emerald-500' : 'bg-primary'}`}></div>

                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${badgeClass}`}>
                              {log.action_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono font-medium">
                              {format(new Date(log.timestamp), 'MMM d, yyyy - h:mm a')}
                            </span>
                          </div>

                          {/* Specific Content Rendering */}
                          {(isLike || isComment) && log.details ? (
                            <div className="mb-3">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                                {isLike ? "Liked:" : "Commented:"}
                              </p>
                              <p className="text-sm text-gray-200 font-medium italic border-l-2 border-gray-600 pl-3 py-1">
                                "{log.details.title || log.details.text || "Content"}"
                              </p>
                            </div>
                          ) : (
                            <p className="text-[13px] text-gray-300 break-words font-medium mb-2 leading-relaxed">
                              <span className="text-gray-500 mr-2">Path:</span>
                              {log.page}
                            </p>
                          )}
                          
                          {/* Footer: Duration and Link */}
                          <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-800/60">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                              {log.duration_ms > 0 ? (
                                <>
                                  <Clock size={12} className="text-gray-400" />
                                  <span className="text-gray-300">{formatDuration(log.duration_ms)}</span> spent
                                </>
                              ) : (
                                <span className="text-gray-600 truncate max-w-[120px]">{log.page.split('?')[0]}</span>
                              )}
                              
                              {/* Platform Indicator */}
                              <div className="flex items-center gap-1 ml-3 pl-3 border-l border-gray-800">
                                {log.clientPlatform === "PWA App" ? (
                                  <>
                                    <MonitorSmartphone size={10} className="text-purple-400" />
                                    <span className="text-purple-400/80">PWA</span>
                                  </>
                                ) : (
                                  <>
                                    <Globe size={10} className="text-blue-400" />
                                    <span className="text-blue-400/80">Web</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {(isLike || isComment) && (
                              <Link 
                                href={log.page} 
                                target="_blank"
                                className={`flex items-center gap-1 text-[11px] font-bold transition-colors ${isLike ? 'text-pink-400 hover:text-pink-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                              >
                                View Content <ExternalLink size={10} />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-800">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
