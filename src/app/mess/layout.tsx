"use client";

import { ReactNode, useEffect } from "react";
import { Toaster } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import Link from "next/link";
import { LogOut, Home } from "lucide-react";
import PWAInstallBanner from "@/components/shared/PWAInstallBanner";

export default function MessModuleLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, fetchUser, loading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!loading && user?.role === "suspend") {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-4 py-12 text-white font-parkinsans relative overflow-hidden">
        {/* Background Mesh Neon Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-red-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-red-800/5 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-[95%] bg-gray-950/80 border border-red-500/20 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(239,68,68,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />

          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_12px_rgba(239,68,68,0.2)]">
            <svg
              className="w-8 h-8 text-red-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-3">
            অ্যাকাউন্ট সাসপেন্ডেড!
          </h2>

          <div className="text-gray-400 text-sm leading-relaxed mb-6">
            অ্যাডমিন আপনার অ্যাকাউন্টটি সাসপেন্ড করেছেন, তাই আপনি কোনো পেজে
            প্রবেশ করতে পারবেন না। অ্যাকাউন্টটি পুনরায় চালু করতে বা আপিল করতে
            আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন:
            <span className="block mt-1 font-bold text-green-400">
              +8801XXXXXXXXX
            </span>
          </div>

          <div className="space-y-3">
            <a
              href="https://wa.me/01XXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-sm lg:text-base flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-green-900/20 hover:scale-[1.01] active:scale-[0.99]"
            >
              WhatsApp -এ যোগাযোগ করুন
            </a>

            <Link
              href="/support"
              className="w-full block py-3 bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-950/20 hover:scale-[1.01] active:scale-[0.99] text-center"
            >
              Contact Support
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
              }}
              className="w-full text-sm lg:text-base py-3 bg-gray-900/50 hover:bg-gray-900 text-gray-400 hover:text-white border border-white/5 hover:border-white/10 rounded-2xl font-bold transition-all"
            >
              লগ-আউট করুন
            </button>
          </div>
        </div>
        <Toaster theme="dark" position="top-center" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col font-sans">
      {/* Mess Specific Top Navigation */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b lg:mb-12 border-gray-800 shadow-sm">
        <div className="max-w-[1440px] w-[95%] mx-auto py-4.5 flex items-center justify-between">
          <Link href="/mess" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white font-parkinsans">
              Smart <span className="text-primary">Mess</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm font-medium text-gray-300 hidden sm:block">
                {user.name}
              </span>
            )}
            <Link
              href="/"
              className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Main Website</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
      <PWAInstallBanner />
      <Toaster theme="dark" position="top-center" />
    </div>
  );
}
