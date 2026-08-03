"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Package,
  Gavel,
  Newspaper,
  HeadphonesIcon,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Bookmark,
} from "lucide-react";

const sidebarItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/my-orders",
    label: "My Orders & Bids",
    icon: ShoppingBag,
  },
  {
    href: "/dashboard/bookmarks",
    label: "Saved Bookmarks",
    icon: Bookmark,
  },
  {
    href: "/dashboard/my-products",
    label: "My Products",
    icon: Package,
  },
  {
    href: "/dashboard/my-published-bids",
    label: "My Published Bid",
    icon: Gavel,
  },
  {
    href: "/dashboard/my-posts",
    label: "My Post/News",
    icon: Newspaper,
  }, 
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const { user } = useAuthStore();
  
  const isSeller = user?.bid_account === "seller" || user?.product_account === "seller";

  const renderItem = (item: any, isMobile: boolean) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const isRestricted = item.href === "/dashboard/my-products" || item.href === "/dashboard/my-published-bids";

    const content = isMobile ? (
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-md transition-colors flex-shrink-0 cursor-pointer",
          isActive
            ? "bg-blue-600 text-white"
            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
        )}
      >
        <Icon size={18} />
      </div>
    ) : (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors w-full text-left cursor-pointer",
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </div>
    );

    if (isRestricted && !isSeller) {
      return (
        <Dialog key={item.href}>
          <DialogTrigger asChild>
            {content}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-6 bg-gray-950 border border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">Seller Access Required</DialogTitle>
            </DialogHeader>
            <p className="text-gray-400 text-sm mt-2">
              You need to be a verified seller to access <strong>{item.label}</strong>. Would you like to submit a request to become a seller?
            </p>
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <DialogClose asChild>
                <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition font-semibold">
                  Cancel
                </button>
              </DialogClose>
              <DialogClose asChild>
                <Link href="/bid/bid-seller-request">
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-blue-700 transition font-semibold w-full sm:w-auto">
                    Request for Seller
                  </button>
                </Link>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        {content}
      </Link>
    );
  };

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      {/* Mobile/Tablet - Collapsible Sidebar */}
      <div className="lg:hidden">
        {!isMobileExpanded ? (
          // Minimized view - Icon bar with expand button
          <div className="flex items-center gap-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
              {sidebarItems.map((item) => renderItem(item, true))}
            </div>
            <button
              onClick={() => setIsMobileExpanded(true)}
              className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex-shrink-0"
              aria-label="Expand sidebar"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        ) : (
          // Expanded view - Full sidebar with labels and collapse button
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button
                onClick={() => setIsMobileExpanded(false)}
                className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronUp size={18} />
              </button>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => renderItem(item, false))}
            </nav>
            <div className="pt-2 border-t border-gray-700">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <span>← Back to Profile</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-lg font-semibold text-white"
          >
            <LayoutDashboard size={24} />
            <span>Seller Dashboard</span>
          </Link>
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => renderItem(item, false))}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <span>← Back to Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
