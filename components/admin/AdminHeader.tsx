"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Calendar, ExternalLink, Menu } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => {
    const href = "/" + pathSegments.slice(0, idx + 1).join("/");
    // Capitalize and format text (e.g. e-commerce-products -> E-Commerce Products)
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const isLast = idx === pathSegments.length - 1;
    return { label, href, isLast };
  });

  const currentDate = new Date().toLocaleDateString("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="h-16 border-b border-gray-900 bg-gray-950/60 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (Mobile Only) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 -ml-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs lg:text-sm font-parkinsans hidden sm:flex">
          <Link
            href="/admin"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Admin
          </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
            {crumb.isLast ? (
              <span className="text-primary font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
        </div>
      </div>

      {/* Date & Quick Actions */}
      <div className="flex items-center gap-4 text-xs lg:text-sm font-parkinsans">
        {/* Live Date */}
        <div className="hidden sm:flex items-center gap-2 text-gray-400 border-r border-gray-800 pr-4">
          <Calendar className="h-4 w-4 text-primary" />
          <span>{currentDate}</span>
        </div>

        {/* Back to Shop */}
        <Link
          href="/"
          className="flex items-center gap-1 text-secondary hover:text-white transition-colors bg-secondary/10 px-3 py-1.5 rounded border border-secondary/20 hover:border-secondary/50 font-medium"
        >
          <span>View Site</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
