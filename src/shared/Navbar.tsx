"use client";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { GoHome } from "react-icons/go";
import { socket } from "@/lib/socket";
import { toast } from "sonner";

interface Notification {
  status: string;
  [key: string]: any;
}
import { BiDice6, BiMessageSquareDetail } from "react-icons/bi";
import { MdOutlineNotificationImportant, MdOutlineNotificationsActive, MdOutlineShoppingCartCheckout } from "react-icons/md";
import { GoPerson } from "react-icons/go";
import { RiFolderHistoryLine } from "react-icons/ri";
import { IoNotifications } from "react-icons/io5";
import { Video, VideoIcon, Clapperboard, MessageCircle, Menu, Utensils, User } from "lucide-react";
import { FaExchangeAlt } from "react-icons/fa";
import router from "next/router";

export default function Navbar() {
  const [notification, setNotification] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Fetch all notification
  useEffect(() => {
    if (!user?.email) return; // 🚨 Important

    const fetchNotification = async () => {
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
          },
        );

        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();

        // 🔹 Filter only pending notifications
        const pendingOnly = data.filter(
          (item: Notification) => item.status === "pending",
        );

        setNotification(pendingOnly.reverse()); // Show latest first
      } catch (err) {
        console.error("Notification fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [user?.email]);

  // Fetch initial unread message count
  /*
  useEffect(() => {
    if (!user?.email) return;
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/unread`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadMessageCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch unread messages count:", err);
      }
    };
    fetchUnreadCount();
  }, [user?.email]);
  */

  // Connect socket and listen for outbid events & new messages
  useEffect(() => {
    if (!user?.email) return;

    if (!socket.connected) {
      socket.connect();
    }

    const token = localStorage.getItem("auth_token");
    if (token) {
      socket.emit("joinUserRoom", { token });
      console.log("Joined outbid socket notifications room with auth token");
    }

    const handleOutbidAlert = (data: { bidId: string; productTitle: string; newBidPrice: number }) => {
      toast.warning(`⚠️ Outbid! Someone placed a higher bid of ৳${data.newBidPrice} on "${data.productTitle}".`, {
        position: "top-right",
        duration: 8000,
        action: {
          label: "View Bid",
          onClick: () => {
            window.location.href = `/bid/all-selling-product`;
          },
        },
      });
    };

    /*
    const handleNewMessageNavbar = (msg: any) => {
      if (msg.recipientEmail === user.email) {
        setUnreadMessageCount((prev) => prev + 1);
        if (window.location.pathname !== "/messages") {
          toast.info(`💬 Message from ${msg.senderEmail.split("@")[0]}: "${msg.message.substring(0, 30)}${msg.message.length > 30 ? '...' : ''}"`, {
            position: "bottom-left",
            duration: 6000,
            action: {
              label: "Open Inbox",
              onClick: () => {
                window.location.href = `/messages?conversationId=${msg.conversationId}`;
              }
            }
          });
        }
      }
    };
    */

    /*
    const handleMessagesRead = () => {
      // Re-fetch accurate count from backend when messages are read in any tab
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/chat/unread`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUnreadMessageCount(data.unreadCount || 0))
      .catch(err => console.error("Failed to refetch unread count:", err));
    };
    */

    socket.on("outbid_alert", handleOutbidAlert);
    // socket.on("new_message", handleNewMessageNavbar);
    // socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("outbid_alert", handleOutbidAlert);
      // socket.off("new_message", handleNewMessageNavbar);
      // socket.off("messages_read", handleMessagesRead);
    };
  }, [user?.email]);

  const handleNotificationClick = () => {
    if (!notification.length) return;

    const hasPending = notification.some((item) => item.status === "pending");
    if (!hasPending) return;

    setTimeout(async () => {
      try {
        const token = localStorage.getItem("auth_token");

        // 🔹 Backend call to mark as seen
        await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/notification/mark-seen`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 🔹 Refetch notifications from backend
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/notification/${user?.email}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();

        // 🔹 Filter only pending (if needed) and reverse
        const pendingOnly = data.filter(
          (item: Notification) => item.status === "pending",
        );
        setNotification(pendingOnly.reverse());
      } catch (err) {
        console.error("Mark & fetch notifications failed:", err);
      }
    }, 4500);
  };

  const activeTab =
    pathname === "/"
      ? "home"
      : pathname === "/reels"
        ? "with-video"
        : pathname === "/digital-exchange"
          ? "digital-exchange"
        : pathname === "/notification"
          ? "notification"
          : pathname === "/messages"
            ? "messages"
            : pathname === "/news/create-news"
              ? "create-news"
              : pathname === "/mess"
                ? "meal"
                : pathname.startsWith("/e-commerce-products")
                  ? "e-commerce-products"
                  : pathname === "/menu"
                    ? "menu"
                    : pathname === "/profile"
                      ? "profile"
                      : "no";

  const navItems = [
    { id: "home", label: "Home", href: "/", icon: GoHome },
    // { id: "with-video", label: "Reels", href: "/reels", icon: Clapperboard },
    { id: "digital-exchange", label: "Exchange", href: "/digital-exchange", icon: FaExchangeAlt },
    { id: "meal", label: "Meal", href: "/mess", icon: Utensils },
    { id: "profile", label: "Profile", href: "/profile", icon: User },
    // { id: "e-commerce-products", label: "e-Shop", href: "/e-commerce-products", icon: MdOutlineShoppingCartCheckout },
    { id: "menu", label: "Menu", href: "/menu", icon: Menu },
  ];

  return (
    <div className="py-3 lg:py-4 bg-black/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-gray-900">
      <div className="px-3 max-w-[1440px] mx-auto w-[95%] flex items-center justify-between">
        {/* logo */}
        <Link href="/" className="font-orbitron text-xl font-bold text-white">
          EmptyBD
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <DesktopNavLink
              key={item.id}
              id={`tour-${item.id}`}
              href={item.href}
              active={activeTab === item.id}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>

        <div className="flex items-center ">
          {/* {user && (
            <div className="relative cursor-pointer">
              <NavIcon
                id="tour-messenger"
                active={activeTab === "messages"}
                href="/messages"
              >
                {unreadMessageCount > 0 && (
                  <div className="absolute -top-1.5 -right-1 bg-red-500 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center z-20 animate-pulse border border-black shadow-[0_0_8px_rgba(59,130,246,0.8)]">
                    {unreadMessageCount}
                  </div>
                )}
                <MessageCircle
                  size={22}
                  className={`transition-colors duration-200 ${
                    activeTab === "messages"
                      ? "text-secondary"
                      : "text-gray-300 hover:text-white"
                  }`}
                />
              </NavIcon>
            </div>
          )} */}

          {loading ? (
            ""
          ) : (
            <div className="relative cursor-pointer" onClick={handleNotificationClick}>
              <NavIcon
                id="tour-notification"
                active={activeTab === "notification"}
                href="/notification"
              >
                {notification.length > 0 && (
                  <div className="absolute -top-1.5 -right-1 bg-red-500 text-[10px] text-white font-bold w-4 h-4 rounded-full flex items-center justify-center z-20 animate-pulse">
                    {notification.length}
                  </div>
                )}
                <MdOutlineNotificationsActive
                  size={22}
                  className={`transition-colors duration-200 ${
                    activeTab === "notification"
                      ? "text-secondary"
                      : "text-gray-300 hover:text-white"
                  }`}
                />
              </NavIcon>
            </div>
          )}

          {/* join navigation */}
          {user ? (
            <Button
            onClick={()=>router.push('/packages')}
              id="tour-wallet"
              variant="outline"
              className="text-white font-bold border-gray-800 hover:border-secondary hover:text-secondary text-sm md:text-base px-4 py-1.5 transition-all duration-300"
            >
              {user?.amount}
              <span className="font-orbitron ml-1">৳</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {/* <Link href="/login">
                <Button
                  id="tour-guest-login"
                  variant="outline"
                  className="text-white font-bold border-gray-800 hover:border-secondary hover:text-secondary text-xs md:text-base px-4 py-1.5 transition-all duration-300"
                >
                  লগইন
                </Button>
              </Link> */}
              <Link href="/register">
                <Button
                  id="tour-guest-register"
                  variant="outline"
                  className="text-white font-bold border-gray-800 hover:border-secondary hover:text-secondary text-xs md:text-base px-4 py-1.5 transition-all duration-300"
                >
                অ্যাকাউন্ট তৈরি করুন
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div className="md:hidden max-w-[1440px] mx-auto w-[100%] flex items-center justify-between mt-3 px-3 pt-2 border-t border-gray-900/50">
        <NavIcon id="tour-home-mobile" active={activeTab === "home"} href="/">
          <GoHome
            size={20}
            className={
              activeTab === "home" ? "text-secondary" : "text-gray-200"
            }
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "home" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Home
          </span>
        </NavIcon>

        {/* <NavIcon id="tour-with-video-mobile" active={activeTab === "with-video"} href="/reels">
          <Clapperboard
            size={20}
            className={
              activeTab === "with-video" ? "text-secondary" : "text-gray-200"
            }
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "with-video" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Reels
          </span>
        </NavIcon> */}

        <NavIcon id="tour-digital-exchange-mobile" active={activeTab === "digital-exchange"} href="/digital-exchange">
          <FaExchangeAlt
            size={20}
            className={
              activeTab === "digital-exchange" ? "text-secondary" : "text-gray-200"
            }
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "digital-exchange" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Exchange
          </span>
        </NavIcon>

        <NavIcon id="tour-meal-mobile" active={activeTab === "meal"} href="/mess">
          <Utensils
            size={20}
            className={activeTab === "meal" ? "text-secondary" : "text-gray-200"}
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "meal" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Meal
          </span>
        </NavIcon>

        <NavIcon id="tour-profile-mobile" active={activeTab === "profile"} href="/profile">
          <User
            size={20}
            className={activeTab === "profile" ? "text-secondary" : "text-gray-200"}
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "profile" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Profile
          </span>
        </NavIcon>

        {/* <NavIcon id="tour-e-commerce-products-mobile" active={activeTab === "e-commerce-products"} href="/e-commerce-products">
          <MdOutlineShoppingCartCheckout
            size={20}
            className={
              activeTab === "e-commerce-products" ? "text-secondary" : "text-gray-200"
            }
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "e-commerce-products" ? "text-secondary" : "text-gray-400"
            }`}
          >
            e-Shop
          </span>
        </NavIcon> */}

        <NavIcon id="tour-menu-mobile" active={activeTab === "menu"} href="/menu">
          <Menu
            size={20}
            className={
              activeTab === "menu" ? "text-secondary" : "text-gray-200"
            }
          />
          <span
            className={`text-[10px] font-medium font-parkinsans ${
              activeTab === "menu" ? "text-secondary" : "text-gray-400"
            }`}
          >
            Menu
          </span>
        </NavIcon>
      </div>
    </div>
  );
}

// Desktop nav link with premium hover micro-animations and smooth active lines
function DesktopNavLink({
  id,
  href,
  active,
  label,
  icon: Icon,
}: {
  id?: string;
  href: string;
  active: boolean;
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (active) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link id={id} href={href} onClick={handleClick} className="relative group py-2 px-1 flex items-center gap-2">
      <Icon
        size={18}
        className={`transition-all duration-300 group-hover:scale-110 ${
          active ? "text-secondary" : "text-gray-400 group-hover:text-white"
        }`}
      />
      <span
        className={`text-sm font-medium font-parkinsans transition-colors duration-300 ${
          active ? "text-secondary font-semibold" : "text-gray-400 group-hover:text-white"
        }`}
      >
        {label}
      </span>
      {/* Active Underline Glow */}
      <span
        className={`absolute bottom-0 left-0 h-[2px] bg-secondary transition-all duration-300 ${
          active ? "w-full shadow-[0_0_8px_#3b82f6]" : "w-0 group-hover:w-full"
        }`}
      />
    </Link>
  );
}

// Reusable Nav Icon Component
function NavIcon({
  id,
  children,
  active,
  href,
}: {
  id?: string;
  children: React.ReactNode;
  active: boolean;
  href: string;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (active) {
      if (href === "/messages" && window.location.search.includes("conversationId")) {
        return; // Allow natural navigation back to /messages base
      }
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link href={href} onClick={handleClick} className="flex-1 max-w-[80px] flex justify-center">
      <div id={id} className={`transition-all duration-200 ${active ? "scale-105" : "scale-100 hover:scale-105"} flex items-center flex-col space-y-1 px-2 py-1 rounded-lg`}>
        {children}
      </div>
    </Link>
  );
}

