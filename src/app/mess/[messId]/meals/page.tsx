"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Settings, Plane, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";

export default function MessMealsPage() {
  const params = useParams();
  const messId = params.messId as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [role, setRole] = useState<string>("member");
  const [defaultMeals, setDefaultMeals] = useState({ breakfast: 0.5, lunch: 1, dinner: 1 });
  const [mealMenu, setMealMenu] = useState({ breakfast: "", lunch: "", dinner: "" });
  
  // Date selection (Default to tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [selectedDate, setSelectedDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(tomorrow.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(tomorrow.getFullYear());

  // Meal input state (checkboxes boolean representation + guest meals)
  const [mealInput, setMealInput] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    guestBreakfast: 0,
    guestLunch: 0,
    guestDinner: 0,
    targetUserId: ""
  });

  // Preferences Modal State
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefInput, setPrefInput] = useState({
    defaultBreakfast: 0,
    defaultLunch: 0,
    defaultDinner: 0,
    vacationStart: "",
    vacationEnd: ""
  });
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, [messId, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      // Fetch Dashboard for role, Members, and Meals
      const [dashRes, membersRes, mealsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/meals?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const membersData = await membersRes.json();
      const mealsData = await mealsRes.json();

      setRole(dashData.role || 'member');
      if (dashData.mess?.defaultMeals) {
        setDefaultMeals(dashData.mess.defaultMeals);
      }
      if (dashData.mess?.mealMenu) {
        setMealMenu(dashData.mess.mealMenu);
      }
      setMembers(Array.isArray(membersData) ? membersData : []);
      setMeals(Array.isArray(mealsData) ? mealsData : []);
      
      // Default to current user for targetUserId
      if (user) {
        setMealInput(prev => ({ ...prev, targetUserId: user._id }));
        const myData = Array.isArray(membersData) ? membersData.find(m => m.userId === user._id) : null;
        if (myData) {
           setPrefInput({
             defaultBreakfast: myData.defaultMeals?.breakfast || 0,
             defaultLunch: myData.defaultMeals?.lunch || 0,
             defaultDinner: myData.defaultMeals?.dinner || 0,
             vacationStart: myData.vacations?.[0]?.startDate || "",
             vacationEnd: myData.vacations?.[0]?.endDate || ""
           });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load meal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meals.length > 0 || user) {
      const target = mealInput.targetUserId || user?._id;
      const myMeal = meals.find(m => m.date === selectedDate && m.userId === target);
      if (myMeal) {
        setMealInput(prev => ({
          ...prev,
          breakfast: myMeal.breakfast > 0,
          lunch: myMeal.lunch > 0,
          dinner: myMeal.dinner > 0,
          guestBreakfast: myMeal.guestBreakfast || 0,
          guestLunch: myMeal.guestLunch || 0,
          guestDinner: myMeal.guestDinner || 0,
          targetUserId: target
        }));
        setShowGuestForm((myMeal.guestBreakfast || 0) > 0 || (myMeal.guestLunch || 0) > 0 || (myMeal.guestDinner || 0) > 0);
      } else {
        setMealInput(prev => ({ 
          ...prev, 
          breakfast: false, lunch: false, dinner: false,
          guestBreakfast: 0, guestLunch: 0, guestDinner: 0,
          targetUserId: target
        }));
        setShowGuestForm(false);
      }
    }
  }, [selectedDate, meals, mealInput.targetUserId, user]);

  const handleMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/meals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          date: selectedDate,
          targetUserId: mealInput.targetUserId,
          breakfast: mealInput.breakfast ? defaultMeals.breakfast : 0,
          lunch: mealInput.lunch ? defaultMeals.lunch : 0,
          dinner: mealInput.dinner ? defaultMeals.dinner : 0,
          guestBreakfast: mealInput.guestBreakfast,
          guestLunch: mealInput.guestLunch,
          guestDinner: mealInput.guestDinner
        })
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Meal updated successfully!");
        fetchData(); // Refresh data
      } else {
        toast.error(data.message || "Failed to update meal");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPref(true);
    try {
      const token = localStorage.getItem("auth_token");
      const vacations = prefInput.vacationStart && prefInput.vacationEnd 
        ? [{ startDate: prefInput.vacationStart, endDate: prefInput.vacationEnd }]
        : [];
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members/me/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          defaultMeals: {
            breakfast: prefInput.defaultBreakfast,
            lunch: prefInput.defaultLunch,
            dinner: prefInput.defaultDinner
          },
          vacations
        })
      });
      
      if (res.ok) {
        toast.success("Preferences saved successfully!");
        setShowPreferences(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save preferences");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSavingPref(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter meals for the selected date to show current status
  const todayMeals = meals.filter(m => m.date === selectedDate);

  const isManager = role === 'manager' || role === 'owner';
  
  // Calculate if the selected date is editable for a normal member
  // Generate YYYY-MM-DD for today in local timezone
  const todayDateObj = new Date();
  const offset = todayDateObj.getTimezoneOffset();
  const localTodayObj = new Date(todayDateObj.getTime() - (offset * 60 * 1000));
  const todayStr = localTodayObj.toISOString().split("T")[0];
  
  const isEditable = isManager || (selectedDate > todayStr);

  // Generate Calendar Days
  const getDaysInMonth = (month: number, year: number) => new Date(year, month, 0).getDate();
  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const myMeal = meals.find(m => m.date === dateStr && m.userId === mealInput.targetUserId);
    return { day, dateStr, total: myMeal ? myMeal.total : '-' };
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans">
            মিলস ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            আপনার দৈনন্দিন মিল এবং গেস্ট মিল এডিট করুন।
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowPreferences(true)}
          className="border-gray-700 text-gray-300 hover:text-white"
        >
          <Settings size={18} className="mr-2" /> আমার প্রিফারেন্স
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Enter Meal Form */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">মিল যোগ/আপডেট করুন</h2>
            <p className="text-sm text-primary font-medium mt-1">
              বর্তমান আপডেটের তারিখ: {new Date(selectedDate).toLocaleDateString('en-GB')}
            </p>
          </div>
          <form onSubmit={handleMealSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">তারিখ</label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  const d = new Date(e.target.value);
                  setSelectedMonth(d.getMonth() + 1);
                  setSelectedYear(d.getFullYear());
                }}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none"
              />
            </div>

            {(role === 'manager' || role === 'owner') && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">মেম্বার নির্বাচন করুন</label>
                <select 
                  value={mealInput.targetUserId}
                  onChange={(e) => setMealInput(prev => ({ ...prev, targetUserId: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-primary focus:outline-none"
                >
                  {members.map((m: any) => (
                    <option key={m.userId} value={m.userId}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-2">
              <label className="text-sm font-medium text-gray-400 mb-3 block">মিল নির্বাচন</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                  <input 
                    type="checkbox" 
                    checked={mealInput.breakfast} 
                    onChange={(e) => setMealInput(prev => ({ ...prev, breakfast: e.target.checked }))}
                    disabled={!isEditable}
                    className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">সকাল ({defaultMeals.breakfast})</span>
                    {mealMenu.breakfast && <span className="text-xs text-emerald-400 mt-1">{mealMenu.breakfast}</span>}
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                  <input 
                    type="checkbox" 
                    checked={mealInput.lunch} 
                    onChange={(e) => setMealInput(prev => ({ ...prev, lunch: e.target.checked }))}
                    disabled={!isEditable}
                    className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">দুপুর ({defaultMeals.lunch})</span>
                    {mealMenu.lunch && <span className="text-xs text-emerald-400 mt-1">{mealMenu.lunch}</span>}
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                  <input 
                    type="checkbox" 
                    checked={mealInput.dinner} 
                    onChange={(e) => setMealInput(prev => ({ ...prev, dinner: e.target.checked }))}
                    disabled={!isEditable}
                    className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">রাত ({defaultMeals.dinner})</span>
                    {mealMenu.dinner && <span className="text-xs text-emerald-400 mt-1">{mealMenu.dinner}</span>}
                  </div>
                </label>
              </div>
            </div>

            {/* Guest Meals Section */}
            {!isManager && (
              <div className="pt-2 border-t border-gray-800 mt-4">
                <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-400 mb-3">
                  <input 
                    type="checkbox" 
                    checked={showGuestForm} 
                    onChange={e => setShowGuestForm(e.target.checked)} 
                    disabled={!isEditable}
                    className={`w-4 h-4 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <Users size={16}/> গেস্ট মিল যোগ করবেন?
                </label>
                
                {showGuestForm && (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                      <input type="checkbox" checked={mealInput.guestBreakfast > 0} onChange={e => setMealInput(p => ({...p, guestBreakfast: e.target.checked ? defaultMeals.breakfast : 0}))} disabled={!isEditable} className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      <span className="text-white text-sm font-medium">সকাল ({defaultMeals.breakfast})</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                      <input type="checkbox" checked={mealInput.guestLunch > 0} onChange={e => setMealInput(p => ({...p, guestLunch: e.target.checked ? defaultMeals.lunch : 0}))} disabled={!isEditable} className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      <span className="text-white text-sm font-medium">দুপুর ({defaultMeals.lunch})</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer bg-gray-900 px-4 py-3 rounded-lg border border-gray-700 hover:border-gray-500 w-full sm:w-auto">
                      <input type="checkbox" checked={mealInput.guestDinner > 0} onChange={e => setMealInput(p => ({...p, guestDinner: e.target.checked ? defaultMeals.dinner : 0}))} disabled={!isEditable} className={`w-4 h-4 mt-0.5 accent-primary ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`} />
                      <span className="text-white text-sm font-medium">রাত ({defaultMeals.dinner})</span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {isManager && (
              <div className="pt-2 border-t border-gray-800 mt-4">
                <label className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2"><Users size={16}/> গেস্ট মিল (ম্যানেজার কন্ট্রোল)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">সকাল</label>
                    <input type="number" min="0" value={mealInput.guestBreakfast} onChange={e => setMealInput(p => ({...p, guestBreakfast: parseFloat(e.target.value) || 0}))} disabled={!isEditable} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">দুপুর</label>
                    <input type="number" min="0" value={mealInput.guestLunch} onChange={e => setMealInput(p => ({...p, guestLunch: parseFloat(e.target.value) || 0}))} disabled={!isEditable} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">রাত</label>
                    <input type="number" min="0" value={mealInput.guestDinner} onChange={e => setMealInput(p => ({...p, guestDinner: parseFloat(e.target.value) || 0}))} disabled={!isEditable} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none disabled:opacity-50" />
                  </div>
                </div>
              </div>
            )}

            <Button  
              type="submit" 
              disabled={isSubmitting || !isEditable}
              className={`w-full mt-4 bg-primary text-black font-semibold hover:bg-primary/90 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "সেভ করুন"}
            </Button>
            
            {!isEditable && (
              <p className="text-xs text-rose-500 text-center font-medium mt-2">
                আপনি শুধুমাত্র আগামীকালের বা ভবিষ্যতের মিল আপডেট করতে পারবেন।
              </p>
            )}
          </form>
        </div>

        {/* Selected Date Summary */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            {selectedDate} তারিখের মিলসমূহ
          </h2>
          {todayMeals.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              এই তারিখের জন্য কোনো মিল রেকর্ড করা হয়নি।
            </div>
          ) : (
            <div className="space-y-3">
              {todayMeals.map((m: any, idx) => (
                <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-white font-bold text-sm sm:text-base">{m.userId === user?._id ? `${m.userName} (You)` : m.userName}</span>
                    {(m.guestBreakfast > 0 || m.guestLunch > 0 || m.guestDinner > 0) && (
                      <div className="text-xs text-orange-400 flex items-center gap-1.5 font-medium">
                        <Users size={12} />
                        গেস্ট: সকাল {m.guestBreakfast}, দুপুর {m.guestLunch}, রাত {m.guestDinner}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm bg-gray-950 px-3 py-2 rounded-lg border border-gray-800 w-fit">
                    <span className={m.breakfast > 0 ? "text-emerald-400 font-medium" : "text-gray-600"}>সকাল: {m.breakfast}</span>
                    <span className={m.lunch > 0 ? "text-emerald-400 font-medium" : "text-gray-600"}>দুপুর: {m.lunch}</span>
                    <span className={m.dinner > 0 ? "text-emerald-400 font-medium" : "text-gray-600"}>রাত: {m.dinner}</span>
                    <div className="w-px h-4 bg-gray-700 mx-1 hidden sm:block"></div>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">মোট: {m.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="text-primary" size={20} /> ক্যালেন্ডার ভিউ ({new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })})
          </h2>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary"></div> সিলেক্টেড</span>
            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> আজকে</span>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {emptyDays.map(empty => (
            <div key={`empty-${empty}`} className="p-3"></div>
          ))}
          {calendarDays.map(day => {
             const isSelected = selectedDate === day.dateStr;
             const isToday = day.dateStr === todayStr;
             const isPast = day.dateStr < todayStr;
             const isLocked = !isManager && day.dateStr <= todayStr;

             return (
               <button
                 key={day.day}
                 onClick={() => {
                   setSelectedDate(day.dateStr);
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                 }}
                 title={isLocked ? "Locked" : "Click to edit"}
                 className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-200 group relative ${
                   isSelected 
                     ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(34,197,94,0.2)] scale-105 z-10' 
                     : isToday
                     ? 'bg-blue-500/10 border-blue-500 hover:bg-blue-500/20'
                     : 'bg-gray-900 border-gray-800 hover:border-gray-600 hover:bg-gray-800'
                 }`}
               >
                 <span className={`text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 ${
                    isSelected ? 'text-primary' : isToday ? 'text-blue-400' : 'text-gray-400'
                 }`}>{day.day}</span>
                 <span className={`text-xs sm:text-lg font-black transition-transform group-hover:scale-110 ${
                   day.total === '-' ? 'text-gray-600' : (day.total > 0 ? 'text-white' : 'text-rose-400')
                 }`}>
                   {day.total}
                 </span>
                 {isLocked && (
                   <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 flex h-2 w-2 sm:h-3 sm:w-3">
                     <span className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-rose-500/50"></span>
                   </span>
                 )}
               </button>
             );
          })}
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="text-primary" /> আমার প্রিফারেন্স
              </h2>
              <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="pref-form" onSubmit={handlePreferencesSubmit} className="space-y-6">
                
                {/* Default Routine */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CalendarIcon size={16} /> ডিফল্ট রুটিন
                  </h3>
                  <p className="text-xs text-gray-400">প্রতিদিন আপনার অ্যাকাউন্টে অটোমেটিক্যালি এই মিলগুলো যুক্ত হবে।</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">সকাল</label>
                      <input type="number" min="0" step="0.5" value={prefInput.defaultBreakfast} onChange={e => setPrefInput(p => ({...p, defaultBreakfast: parseFloat(e.target.value) || 0}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">দুপুর</label>
                      <input type="number" min="0" step="0.5" value={prefInput.defaultLunch} onChange={e => setPrefInput(p => ({...p, defaultLunch: parseFloat(e.target.value) || 0}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">রাত</label>
                      <input type="number" min="0" step="0.5" value={prefInput.defaultDinner} onChange={e => setPrefInput(p => ({...p, defaultDinner: parseFloat(e.target.value) || 0}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-primary focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* Vacation Mode */}
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <h3 className="text-sm font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                    <Plane size={16} /> ভ্যাকেশন মোড
                  </h3>
                  <p className="text-xs text-gray-400">এই নির্দিষ্ট দিনগুলোতে আপনার সব মিল স্বয়ংক্রিয়ভাবে ০ থাকবে।</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">শুরুর তারিখ</label>
                      <input type="date" value={prefInput.vacationStart} onChange={e => setPrefInput(p => ({...p, vacationStart: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">শেষ তারিখ</label>
                      <input type="date" value={prefInput.vacationEnd} min={prefInput.vacationStart} onChange={e => setPrefInput(p => ({...p, vacationEnd: e.target.value}))} className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white focus:border-orange-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setShowPreferences(false)} className="border-gray-700 text-gray-300">
                বাতিল
              </Button>
              <Button type="submit" form="pref-form" disabled={isSavingPref} className="bg-primary text-black hover:bg-primary/90">
                {isSavingPref ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                সেভ করুন
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
