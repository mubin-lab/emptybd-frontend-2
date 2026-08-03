"use client";

import { useEffect, useState, Fragment } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Download, TrendingUp, Wallet, Utensils, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";

export default function MessReportsPage() {
  const params = useParams();
  const messId = params.messId as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [selectedDailyDate, setSelectedDailyDate] = useState(() => {
    return new Date().toLocaleString("en-CA", { timeZone: "Asia/Dhaka", year: 'numeric', month: '2-digit', day: '2-digit' });
  });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [messId, selectedMonth, selectedYear]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      // Fetch members, meals, expenses, shopping, payments for the specific month
      const [memRes, mealsRes, expRes, payRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/meals?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/expenses?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/payments?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const members = await memRes.json();
      const meals = await mealsRes.json();
      const { expenses, shopping } = await expRes.json();
      const payments = await payRes.json();

      const membersArray = Array.isArray(members) ? members : [];
      const mealsArray = Array.isArray(meals) ? meals : [];
      const expensesArray = Array.isArray(expenses) ? expenses : [];
      const shoppingArray = Array.isArray(shopping) ? shopping : [];
      const paymentsArray = Array.isArray(payments) ? payments : [];

      // Calculate totals
      const totalMeals = mealsArray.reduce((sum: number, m: any) => sum + (m.total || 0), 0);
      const totalShopping = shoppingArray.reduce((sum: number, s: any) => sum + (s.price || 0), 0);
      const totalOtherExpense = expensesArray.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
      const totalExpense = totalShopping + totalOtherExpense;
      
      const mealRate = totalMeals > 0 ? (totalShopping / totalMeals) : 0;
      
      // Calculate active members count and per member share
      const activeMembersCount = membersArray.length;
      const perMemberOtherExpense = activeMembersCount > 0 ? (totalOtherExpense / activeMembersCount) : 0;

      // Calculate member specific data
      const memberStats = membersArray.map((member: any) => {
        const memberMeals = mealsArray.filter((m: any) => m.userId === member.userId).reduce((sum: number, m: any) => sum + (m.total || 0), 0);
        const memberPaid = paymentsArray.filter((p: any) => p.userId === member.userId).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        const mealCost = memberMeals * mealRate;
        const otherExpenseShare = perMemberOtherExpense;
        const totalCost = mealCost + otherExpenseShare;
        
        const balance = memberPaid - totalCost; // Positive = advance, Negative = due

        return {
          ...member,
          totalMeals: memberMeals,
          mealCost,
          otherExpenseShare,
          totalCost,
          totalPaid: memberPaid,
          balance
        };
      });
      
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dailyDates = Array.from({ length: daysInMonth }, (_, i) => {
        const d = new Date(selectedYear, selectedMonth - 1, i + 1);
        return d.toISOString().split("T")[0]; // YYYY-MM-DD
      });

      setReport({
        totalMeals,
        totalExpense,
        totalShopping,
        totalOtherExpense,
        perMemberOtherExpense: parseFloat(perMemberOtherExpense.toFixed(2)),
        mealRate: parseFloat(mealRate.toFixed(2)),
        memberStats,
        dailyDates,
        mealsArray
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const myMemberData = report?.memberStats?.find((m: any) => m.userId === user?._id);
  const isManager = user?.role === 'superAdmin' || myMemberData?.role === 'manager' || myMemberData?.role === 'owner';

  const generateDailyReportText = () => {
    if (!report) return "";
    
    // Convert to bangla numerals
    const toBn = (num: number | string) => num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
    
    // Parse date for title (e.g. 10 tarikher)
    const d = new Date(selectedDailyDate);
    const dayBn = toBn(d.getDate());
    
    let text = `${dayBn} তারিখের মিলের হিসাব --\n`;
    
    // Filter today's meals
    const todaysMeals = report.mealsArray.filter((m: any) => m.date === selectedDailyDate);
    
    // Find max name length for alignment
    const maxNameLength = Math.max(...report.memberStats.map((m: any) => m.name.length));
    
    report.memberStats.forEach((member: any) => {
      const meal = todaysMeals.find((m: any) => m.userId === member.userId);
      const b = meal ? meal.breakfast : 0;
      const l = meal ? meal.lunch : 0;
      const din = meal ? meal.dinner : 0;
      
      const paddedName = member.name.padEnd(maxNameLength, ' ');
      text += `${paddedName} -- ${toBn(b)} + ${toBn(l)} + ${toBn(din)}\n`;
    });
    
    return text;
  };

  const handleCopyDailyReport = async () => {
    const text = generateDailyReportText();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("কপি করা হয়েছে!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("কপি করতে সমস্যা হয়েছে।");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans">
          মান্থলি রিপোর্ট
        </h1>
        <p className="text-sm text-gray-400 mt-1">
            এই মাসের আর্থিক এবং মিলের বিস্তারিত হিসাব।
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
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
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary w-full sm:w-auto print:hidden"
          />
          <Button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-500 text-white print:hidden h-10 px-4 shrink-0"
          >
            <Download size={18} className="mr-2" /> প্রিন্ট
          </Button>
        </div>
      </div>

      {/* Global Month Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-full text-primary">
            <Utensils size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">মোট মিল</p>
            <p className="text-lg font-bold text-white">{report.totalMeals}</p>
          </div>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-rose-500/10 p-2.5 rounded-full text-rose-500">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">বাজার খরচ</p>
            <p className="text-lg font-bold text-white">৳{report.totalShopping}</p>
          </div>
        </div>
        
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-blue-500/10 p-2.5 rounded-full text-blue-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">মিল রেট</p>
            <p className="text-lg font-bold text-white">৳{report.mealRate}</p>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-orange-500/10 p-2.5 rounded-full text-orange-500">
            <Wallet size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">অন্যান্য খরচ</p>
            <p className="text-lg font-bold text-white">৳{report.totalOtherExpense}</p>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2.5 rounded-full text-indigo-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400">মাথাপিছু অন্যান্য</p>
            <p className="text-lg font-bold text-white">৳{report.perMemberOtherExpense}</p>
          </div>
        </div>
      </div>

      {/* Manager Daily Report Section */}
      {isManager && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden mt-8 print:hidden">
          <div className="p-5 border-b border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">দৈনিক মিল রিপোর্ট</h2>
              <p className="text-sm text-gray-400 mt-1">যেকোনো দিনের মিলের হিসাব কপি করে শেয়ার করুন।</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input 
                type="date" 
                value={selectedDailyDate}
                onChange={(e) => setSelectedDailyDate(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary w-full sm:w-auto"
              />
              <Button 
                onClick={handleCopyDailyReport} 
                className="bg-gray-800 hover:bg-gray-700 text-white shrink-0"
              >
                {isCopied ? <Check size={18} className="mr-2 text-emerald-400" /> : <Copy size={18} className="mr-2" />}
                {isCopied ? "কপি হয়েছে" : "কপি করুন"}
              </Button>
            </div>
          </div>
          <div className="p-5 bg-gray-900/50">
            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
              {generateDailyReportText()}
            </pre>
          </div>
        </div>
      )}

      {/* Member Breakdown Table */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">সদস্যের নাম</th>
                <th className="px-6 py-4 font-semibold">মিল সংখ্যা</th>
                <th className="px-6 py-4 font-semibold">মিল খরচ</th>
                <th className="px-6 py-4 font-semibold">অন্যান্য খরচ</th>
                <th className="px-6 py-4 font-semibold">মোট খরচ</th>
                <th className="px-6 py-4 font-semibold">জমা</th>
                <th className="px-6 py-4 font-semibold text-right">ব্যালেন্স</th>
              </tr>
            </thead>
            <tbody>
              {report.memberStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    এই মাসে কোনো ডাটা পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                report.memberStats.map((m: any) => (
                  <tr key={m.userId} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{m.userId === user?._id ? `${m.name} (আপনি)` : m.name}</td>
                    <td className="px-6 py-4">{m.totalMeals}</td>
                    <td className="px-6 py-4">৳{m.mealCost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-orange-400">৳{m.otherExpenseShare.toFixed(2)}</td>
                    <td className="px-6 py-4 font-semibold text-blue-400">৳{m.totalCost.toFixed(2)}</td>
                    <td className="px-6 py-4">৳{m.totalPaid}</td>
                    <td className="px-6 py-4 text-right">
                      {m.balance < 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 font-semibold text-xs border border-rose-500/20">
                          বকেয়া: ৳{Math.abs(m.balance).toFixed(2)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                          জমা: ৳{m.balance.toFixed(2)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Meal Matrix (Excel-like Chart) */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">দৈনিক মিল চার্ট</h2>
          <p className="text-sm text-gray-400 mt-1">প্রত্যেক সদস্যের প্রতিদিনের মোট মিলের বিস্তারিত হিসাব।</p>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-center text-xs text-gray-300 border-collapse">
            <thead className="bg-gray-900 border-b border-gray-800 text-gray-400">
              <tr>
                <th rowSpan={2} className="px-3 py-3 font-semibold text-center border-r border-gray-800 sticky left-0 bg-gray-900 z-20">
                  তারিখ
                </th>
                {report.memberStats.length === 0 ? (
                  <th className="px-3 py-3 font-semibold text-center">মেম্বার নেই</th>
                ) : (
                  report.memberStats.map((m: any) => (
                    <th key={m.userId} colSpan={3} className="px-2 py-2 font-semibold text-center border-r border-gray-800">
                      {m.userId === user?._id ? `${m.name} (আপনি)` : m.name}
                    </th>
                  ))
                )}
              </tr>
              {report.memberStats.length > 0 && (
                <tr>
                  {report.memberStats.map((m: any) => (
                    <Fragment key={`sub_${m.userId}`}>
                      <th className="px-2 py-1.5 font-medium border-r border-gray-800 border-t border-gray-800 bg-gray-900/50">সকাল</th>
                      <th className="px-2 py-1.5 font-medium border-r border-gray-800 border-t border-gray-800 bg-gray-900/50">দুপুর</th>
                      <th className="px-2 py-1.5 font-medium border-r border-gray-800 border-t border-gray-800 bg-gray-900/50">রাত</th>
                    </Fragment>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {report.dailyDates.length === 0 ? (
                <tr>
                  <td colSpan={report.memberStats.length * 3 + 1} className="px-6 py-8 text-center text-gray-500">
                    কোনো ডাটা পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                report.dailyDates.map((date: string) => {
                  const dayStr = new Date(date).getDate().toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
                  return (
                    <tr key={date} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="px-3 py-2 font-medium text-white text-center border-r border-gray-800 sticky left-0 bg-gray-950 z-10 whitespace-nowrap">
                        {dayStr}
                      </td>
                      {report.memberStats.map((m: any) => {
                        const mealRecord = report.mealsArray.find((meal: any) => meal.userId === m.userId && meal.date === date);
                        const b = mealRecord?.breakfast || 0;
                        const l = mealRecord?.lunch || 0;
                        const d = mealRecord?.dinner || 0;
                        
                        const toBn = (num: number | string) => num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

                        return (
                          <Fragment key={`${date}_${m.userId}`}>
                            <td className={`px-0 py-2 border-r border-gray-800 ${b > 0 ? 'bg-blue-500/5 text-blue-300' : 'text-gray-600'}`}>{b > 0 ? toBn(b) : '-'}</td>
                            <td className={`px-0 py-2 border-r border-gray-800 ${l > 0 ? 'bg-amber-500/5 text-amber-300' : 'text-gray-600'}`}>{l > 0 ? toBn(l) : '-'}</td>
                            <td className={`px-0 py-2 border-r border-gray-800 ${d > 0 ? 'bg-purple-500/5 text-purple-300' : 'text-gray-600'}`}>{d > 0 ? toBn(d) : '-'}</td>
                          </Fragment>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
