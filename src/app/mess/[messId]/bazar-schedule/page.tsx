"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, User, BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";

export default function BazarSchedulePage() {
  const params = useParams();
  const messId = params.messId as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [role, setRole] = useState("member");
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [assignDate, setAssignDate] = useState("");
  const [assignUser, setAssignUser] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [pokingId, setPokingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [messId, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const [dashRes, membersRes, scheduleRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/bazar-schedule?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const membersData = await membersRes.json();
      const scheduleData = await scheduleRes.json();

      setRole(dashData.role || 'member');
      setMembers(Array.isArray(membersData) ? membersData : []);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bazar schedule data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDate || !assignUser) {
      toast.error("Please select both date and member");
      return;
    }
    
    setIsAssigning(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/bazar-schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: assignDate, targetUserId: assignUser })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Schedule assigned successfully!");
        setAssignDate("");
        setAssignUser("");
        fetchData();
      } else {
        toast.error(data.message || "Failed to assign schedule");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsAssigning(false);
    }
  };

  const handlePoke = async (date: string) => {
    setPokingId(date);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/bazar-schedule/poke`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Poke notification sent successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to send poke notification");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setPokingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isManager = role === 'manager' || role === 'owner';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans">
            বাজার শিডিউল
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            কোন দিন কে বাজার করবে তার তালিকা।
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="month" 
            value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
            onChange={(e) => {
              const d = new Date(e.target.value);
              if (!isNaN(d.getTime())) {
                setSelectedYear(d.getFullYear());
                setSelectedMonth(d.getMonth() + 1);
              }
            }}
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CalendarIcon className="text-primary" size={20} /> এই মাসের শিডিউল
            </h2>
            
            {schedules.length === 0 ? (
              <div className="text-center text-gray-500 py-8 border border-dashed border-gray-800 rounded-xl">
                এই মাসে এখনও কোনো বাজার শিডিউল নির্ধারণ করা হয়নি।
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900 border border-gray-800 p-4 rounded-xl gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg border border-primary/20">
                        {new Date(schedule.date).getDate()} {new Date(schedule.date).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div>
                        <span className="text-white font-medium block text-lg">{schedule.userId === user?._id ? `${schedule.userName} (You)` : schedule.userName}</span>
                        <span className="text-xs text-gray-500">
                          Assigned on {new Date(schedule.updatedAt || schedule.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {isManager && schedule.userId !== user?._id && (
                      <Button 
                        onClick={() => handlePoke(schedule.date)} 
                        disabled={pokingId === schedule.date}
                        size="sm"
                        variant="outline"
                        className="bg-gray-950 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-400"
                      >
                        {pokingId === schedule.date ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BellRing className="w-4 h-4 mr-2" />} 
                        অ্যালার্ট দিন (Poke)
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ASSIGN FORM (Manager/Owner Only) */}
        {isManager && (
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4">নতুন শিডিউল যোগ করুন</h2>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">তারিখ</label>
                <input 
                  type="date" 
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">মেম্বার নির্বাচন করুন</label>
                <select 
                  value={assignUser}
                  onChange={(e) => setAssignUser(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                >
                  <option value="" disabled>সিলেক্ট করুন</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>{m.name}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={isAssigning} className="w-full bg-primary text-black font-bold hover:bg-primary/90 mt-2">
                {isAssigning ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "অ্যাসাইন করুন"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
