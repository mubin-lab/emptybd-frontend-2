"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Utensils, 
  Wallet, 
  Users, 
  Settings, 
  FileText, 
  ChevronLeft,
  ShoppingCart,
  CalendarDays
} from "lucide-react";

export default function MessDashboardLayout({ 
  children
}: { 
  children: ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const messId = params.messId as string;

  const [role, setRole] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          router.push("/");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/my-mess`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Redirect to home if user has no mess, or if their mess ID doesn't match the URL 
          // (meaning they were kicked out or trying to access another mess)
          // Exception for superAdmin would need to be handled if they are bypassing, 
          // but getMyMess doesn't check superAdmin. So let's check the dashboard API instead for robust role-based access.
          
          const dashRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (!dashRes.ok) {
            toast.error("You don't have access to this mess.");
            router.push("/");
            return;
          }
          
          const dashData = await dashRes.json();
          setRole(dashData.role || 'member');
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Access check failed", error);
        router.push("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkMembership();
  }, [messId, router]);

  if (isChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Define sidebar links based on role later if needed, for now standard links
  const links = [
    { name: "ড্যাশবোর্ড", href: `/mess/${messId}/dashboard`, icon: LayoutDashboard },
    { name: "মিলস", href: `/mess/${messId}/meals`, icon: Utensils },
    { name: "খরচ", href: `/mess/${messId}/expenses`, icon: Wallet },
    { name: "বাজার এস্টিমেটর", href: `/mess/${messId}/estimator`, icon: ShoppingCart },
    { name: "বাজার শিডিউল", href: `/mess/${messId}/bazar-schedule`, icon: CalendarDays },
    { name: "সদস্য", href: `/mess/${messId}/members`, icon: Users },
    { name: "রিপোর্টস", href: `/mess/${messId}/reports`, icon: FileText },
  ];

  if (role === 'manager' || role === 'owner') {
    links.push({ name: "সেটিংস", href: `/mess/${messId}/settings`, icon: Settings });
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-6 flex flex-col md:flex-row gap-6 min-h-[70vh]">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <Link 
          href="/mess" 
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 px-3"
        >
          <ChevronLeft size={16} />
          ড্যাশবোর্ড থেকে বের হোন
        </Link>
        
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2 sticky top-24">
          <div className="mb-4 px-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">মেস মেনু</h2>
          </div>
          
          {links.map((link) => {
            const isActive = pathname.includes(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary font-semibold" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : ""} />
                {link.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-gray-900 border border-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 relative">
        {children}
      </main>
      
    </div>
  );
}
