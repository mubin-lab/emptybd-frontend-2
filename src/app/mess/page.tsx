"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "sonner";
import { Loader2, Search, PlusCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function MessLandingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      toast.error("Please login to access Smart Mess Management");
      router.push("/login");
      return;
    }

    checkMyMess();
  }, [user, authLoading, router]);

  const checkMyMess = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/my-mess`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.hasMess) {
        // Redirect to their mess dashboard
        router.push(`/mess/${data.messId}/dashboard`);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mess data");
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to search messes");
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoinRequest = async (messIdStr: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messIdStr}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Join request sent successfully!");
      } else {
        toast.error(data.message || "Failed to send join request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send request");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white font-parkinsans mb-4">
          স্মার্ট <span className="text-primary">মেস ম্যানেজমেন্ট</span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          আপনার ব্যাচেলর মেস পরিচালনা করুন খুব সহজেই। প্রতিদিনের মিল, বাজারের খরচ এবং মাস শেষের হিসাব রাখুন ঝামেলাহীনভাবে।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
        {/* Create Mess Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-lg hover:border-primary/50 transition-colors">
          <div className="bg-primary/10 p-4 rounded-full text-primary mb-4 md:mb-6">
            <Building2 size={40} className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">নতুন মেস তৈরি করুন</h2>
          <p className="text-gray-400 mb-6 md:mb-8 text-sm">
            নতুন একটি মেস খুলুন, ম্যানেজার হোন এবং আপনার মেম্বারদের ইনভাইট করুন।
          </p>
          <Link href="/mess/create" className="w-full">
            <Button className="w-full h-12 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 text-black rounded-xl flex items-center justify-center gap-2">
              <PlusCircle size={20} />
              নতুন মেস খুলুন
            </Button>
          </Link>
        </div>

        {/* Search Mess Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg hover:border-blue-500/50 transition-colors flex flex-col justify-center">
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <div className="bg-blue-500/10 p-4 rounded-full text-blue-400 mb-4">
              <Search size={40} className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">বিদ্যমান মেসে যুক্ত হোন</h2>
            <p className="text-gray-400 text-sm">
              মেস আইডি বা নাম দিয়ে সার্চ করে জয়েন রিকোয়েস্ট পাঠান।
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মেস আইডি বা নাম লিখুন..."
              className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 sm:py-2 text-white focus:outline-none focus:border-blue-500 w-full"
            />
            <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 sm:h-auto px-6 w-full sm:w-auto">
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : "সার্চ করুন"}
            </Button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-w-5xl mx-auto mt-8 md:mt-12">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">সার্চ রেজাল্ট</h3>
          <div className="grid gap-3 md:gap-4">
            {searchResults.map((mess: any) => (
              <div key={mess._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="w-full">
                  <h4 className="text-base md:text-lg font-bold text-white flex flex-wrap items-center gap-2">
                    {mess.name}
                    <span className="text-[10px] md:text-xs font-normal px-2 py-0.5 bg-gray-800 text-gray-300 rounded-full mt-1 sm:mt-0">
                      {mess.messId}
                    </span>
                  </h4>
                  <div className="text-xs md:text-sm text-gray-400 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>সদস্য: {mess.currentMembersCount}/{mess.maxMembers}</span>
                    <span>ম্যানেজার: {mess.managerName}</span>
                  </div>
                </div>
                <Button 
                  onClick={() => handleJoinRequest(mess._id)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto whitespace-nowrap"
                >
                  জয়েন রিকোয়েস্ট পাঠান
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
