"use client";

import { SpinnerCustom } from "@/components/loading/Spinner";
import TimeAgo from "@/components/short-component/TimeAgo";
import { useAuthStore } from "@/lib/store/authStore";
import Empty from "@/components/NotFound.tsx/Empty";
import React, { useEffect, useState } from "react";
import { BiMoney, BiMoneyWithdraw, BiBell, BiInfoCircle } from "react-icons/bi";
import PageHelpPanel from "@/components/shared/PageHelpPanel";

interface Notification {
  _id?: string;
  title?: string;
  status?: "pending" | "completed";
  msg_body?: string;
  msg_type?: "deposit" | "withdraw" | "broadcast" | "direct" | string;
  createdAt?: string;
}

export default function Page() {
  const [notification, setNotification] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Fetch all notifications
  const fetchNotifications = async () => {
    if (!user?.email) return;

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/notification/${user.email}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotification(data.reverse()); // Show latest first
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.email]);

  // Auto mark seen after 1.5 seconds on page mount if there are pending notifications
  useEffect(() => {
    if (!notification.length) return;

    const hasPending = notification.some((item) => item.status === "pending");
    if (!hasPending) return;

    const timer = setTimeout(async () => {
      try {
        const token = localStorage.getItem("auth_token");

        await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/notification/mark-seen`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Immediate local UI update
        setNotification((prev) =>
          prev.map((item) =>
            item.status === "pending" ? { ...item, status: "completed" } : item
          )
        );
      } catch (error) {
        console.error("Auto mark seen failed:", error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [notification]);

  const getNotificationStyles = (item: Notification) => {
    const type = item.msg_type || "info";
    switch (type) {
      case "deposit":
        return {
          borderClass: "border-l-4 border-emerald-500",
          bgClass: item.status === "pending" ? "bg-emerald-950/20" : "bg-gray-950/60",
          icon: <BiMoney className="text-emerald-400 text-lg md:text-xl" />,
        };
      case "withdraw":
        return {
          borderClass: "border-l-4 border-rose-500",
          bgClass: item.status === "pending" ? "bg-rose-950/20" : "bg-gray-950/60",
          icon: <BiMoneyWithdraw className="text-rose-400 text-lg md:text-xl" />,
        };
      case "broadcast":
        return {
          borderClass: "border-l-4 border-blue-500",
          bgClass: item.status === "pending" ? "bg-blue-950/20" : "bg-gray-950/60",
          icon: <BiBell className="text-blue-400 text-lg md:text-xl animate-pulse" />,
        };
      case "direct":
      default:
        return {
          borderClass: "border-l-4 border-purple-500",
          bgClass: item.status === "pending" ? "bg-purple-950/20" : "bg-gray-950/60",
          icon: <BiInfoCircle className="text-purple-400 text-lg md:text-xl" />,
        };
    }
  };

  if (loading) {
    return <SpinnerCustom />;
  }

  return (
    <div className="max-w-2xl w-[95%] mx-auto py-6 md:py-10">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-900">
        <h3 className="text-xl md:text-2xl font-bold text-white font-orbitron flex items-center gap-2">
          <BiBell className="text-secondary" />
          Notifications
        </h3>
        {notification.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-950 border border-gray-900 text-gray-400 font-mono">
            Total: {notification.length}
          </span>
        )}
      </div>
      
      {notification.length === 0 ? (
        <Empty description="Ohh! No notification history available for you." />
      ) : (
        <div className="space-y-2 lg:space-y-4">
          {notification.map((item, index) => {
            const styles = getNotificationStyles(item);
            return (
              <div
                key={item._id || index}
                className={`relative p-2 lg:p-5 rounded-2xl flex items-start gap-4 border border-gray-900/60 transition-all duration-300 hover:scale-101 ${styles.borderClass} ${styles.bgClass} shadow-md`}
              >
                {/* Visual Unread Badge */}
                {item.status === "pending" && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500"></span>
                  </span>
                )}

                {/* Left Type Icon */}
                <div className="p-2.5 rounded-xl bg-black/40 flex-shrink-0 border border-gray-900">
                  {styles.icon}
                </div>

                {/* Message & Time */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base text-gray-300 font-hind break-words leading-relaxed">
                    {item.msg_body}
                  </p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0 flex items-center justify-end font-parkinsans font-medium">
                    {item.createdAt && (
                      <TimeAgo
                        date={item.createdAt}
                        className="text-[10px] md:text-xs text-gray-500 mr-1"
                      />
                    )}
                    ago
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <PageHelpPanel pageKey="notifications" />
    </div>
  );
}
