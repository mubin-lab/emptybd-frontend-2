"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchUser, loading } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Proactively fetch user profile if store is not populated
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    // Access control check: If user is logged in but is NOT a superAdmin, report intrusion & log out
    if (user && user.role !== "superAdmin") {
      const handleIntrusion = async () => {
        try {
          const token = localStorage.getItem("auth_token");
          // 1. Send intrusion log to backend
          await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/notification/report-intrusion`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error("Failed to report intrusion:", err);
        } finally {
          // 2. Perform logout and clear storage
          localStorage.removeItem("auth_token");
          useAuthStore.getState().clearUser();

          // 3. Visual user notifications
          toast.error("Access Denied: Super Admin Role Required. Session Terminated.", {
            position: "top-right",
            duration: 6000,
          });

          // 4. Force route refresh to Login
          router.push("/login");
          router.refresh();
        }
      };

      handleIntrusion();
    }
  }, [user, router]);

  // Loading state while resolving auth
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-950 text-white font-parkinsans gap-3">
        <SpinnerCustom />
        <span className="text-gray-400 text-sm">Authenticating Admin Session...</span>
      </div>
    );
  }

  // Intrusion logout view
  if (!user || user.role !== "superAdmin") {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-950 p-4 text-white font-parkinsans">
        <div className="max-w-md w-full text-center space-y-5 bg-gray-900 border border-gray-800 p-8 rounded-lg shadow-xl flex flex-col items-center justify-center">
          <SpinnerCustom />
          <h3 className="text-lg font-bold text-red-500 font-parkinsans">Security Alert: Access Denied</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Unauthorized intrusion attempt detected. Logging out and redirecting your session to safety...
          </p>
        </div>
      </div>
    );
  }

  // Authorized Admin Workspace
  return (
    <div className="min-h-screen flex bg-gray-950 text-white relative">
      {/* Sidebar Navigation */}
      <AdminSidebar 
        isMobileOpen={isMobileMenuOpen} 
        onMobileClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header navbar */}
        <AdminHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Dashboard Content area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
