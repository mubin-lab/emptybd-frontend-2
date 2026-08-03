"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ProfileLoading } from "@/components/loading/ProfileLoading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      fetchUser().then(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          router.push("/login");
          return;
        }
        // Dashboard is now accessible to all users
      });
    }
  }, [user, loading, fetchUser, router]);

  if (loading || !user) {
    return <ProfileLoading />;
  }


  return (
    <div className="max-w-[1440px] w-[95%] mx-auto mt-3">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar - Hidden on mobile, shown as horizontal scroll on tablet, sidebar on desktop */}
        <div className="lg:w-64 flex-shrink-0">
          <DashboardSidebar />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
