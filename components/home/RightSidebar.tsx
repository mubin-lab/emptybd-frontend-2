import React from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck, Mail, Users, AppWindow, ShoppingCart, Utensils, Zap, Repeat } from "lucide-react";

export default function RightSidebar() {
  const menuPages = [
    { id: 1, title: "Digital Exchange", icon: Repeat, link: "/digital-exchange", color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 2, title: "E-Shop", icon: ShoppingCart, link: "/e-commerce-products", color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: 3, title: "Meal Booking", icon: Utensils, link: "/meal", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 4, title: "Premium Packages", icon: Zap, link: "/packages", color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="space-y-4">
      {/* Menu Pages Card */}
      <div className="bg-[#0f172a]/80 border border-gray-800 rounded-2xl p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-primary/10">
        <h3 className="text-sm font-bold text-white font-parkinsans mb-4 flex items-center gap-2">
          <AppWindow size={16} className="text-primary" />
          Explore EmptyBD
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {menuPages.map((page) => (
            <Link href={page.link} key={page.id} className="flex flex-col items-center justify-center p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-300 group">
              <div className={`p-3 rounded-full ${page.bg} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <page.icon size={20} className={page.color} />
              </div>
              <span className="text-[11px] font-semibold text-gray-300 group-hover:text-white text-center">
                {page.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Links Card */}
      <div className="bg-[#0f172a]/80 border border-gray-800 rounded-2xl p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-primary/10">
        <h3 className="text-sm font-bold text-white font-parkinsans mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-primary" />
          Quick Links
        </h3>
        
        <div className="flex flex-col gap-3">
          <Link href="/about-us" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg">
            <Users size={14} className="text-gray-500" /> About Us
          </Link>
          <Link href="/privacy-policy" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg">
            <ShieldCheck size={14} className="text-gray-500" /> Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg">
            <BookOpen size={14} className="text-gray-500" /> Terms of Service
          </Link>
          <Link href="/contact-us" className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-3 p-2 hover:bg-gray-800/50 rounded-lg">
            <Mail size={14} className="text-gray-500" /> Contact Us
          </Link>
        </div>
        
        <div className="mt-5 pt-4 border-t border-gray-800/60">
          <p className="text-[10px] text-gray-600 text-center font-medium">
            &copy; {new Date().getFullYear()} EmptyBD Social Network
          </p>
        </div>
      </div>
    </div>
  );
}
