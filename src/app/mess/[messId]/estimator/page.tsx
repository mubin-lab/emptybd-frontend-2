"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShoppingCart, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";

const DEFAULT_RATIOS = {
  "চাল (Rice)": 0.25,
  "ডাল (Dal)": 0.05,
  "আলু (Potato)": 0.10,
  "পেঁয়াজ (Onion)": 0.05,
  "রসুন ও আদা (Garlic/Ginger)": 0.02,
  "তেল (Oil)": 0.05,
  "মুরগি (Chicken)": 0.20,
  "গরু (Beef)": 0.25,
  "মাছ (Fish)": 0.20,
  "ডিম (Egg, pcs)": 1,
  "সবজি (Vegetable)": 0.15,
  "কাঁচামরিচ (Green Chili)": 0.01,
  "মসলা (Spices)": 0.02,
  "লবণ (Salt)": 0.01
};

export default function BazaarEstimatorPage() {
  const params = useParams();
  const messId = params.messId as string;

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("member");
  const [tomorrowMeals, setTomorrowMeals] = useState(0);
  const [shoppingRatios, setShoppingRatios] = useState<any>(DEFAULT_RATIOS);
  const [isSavingRatios, setIsSavingRatios] = useState(false);

  useEffect(() => {
    fetchData();
  }, [messId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowMonth = tomorrow.getMonth() + 1;
      const tomorrowYear = tomorrow.getFullYear();
      const tomorrowStr = tomorrow.toISOString().split("T")[0];

      const [dashRes, mealsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/meals?month=${tomorrowMonth}&year=${tomorrowYear}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const mealsData = await mealsRes.json();

      setRole(dashData.role || 'member');
      
      if (dashData.mess?.shoppingRatios) {
         setShoppingRatios({ ...DEFAULT_RATIOS, ...dashData.mess.shoppingRatios });
      }

      if (Array.isArray(mealsData)) {
         const tmMeals = mealsData.filter((m: any) => m.date === tomorrowStr);
         const tmTotal = tmMeals.reduce((sum: number, m: any) => sum + (m.total || 0), 0);
         setTomorrowMeals(tmTotal);
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load estimator data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRatios = async () => {
    setIsSavingRatios(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shoppingRatios })
      });
      if (res.ok) {
        toast.success("Ratios saved successfully");
      } else {
        toast.error("Failed to save ratios");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSavingRatios(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-parkinsans">
            বাজার এস্টিমেটর
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            আগামীকালের সম্ভাব্য বাজার লিস্ট।
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-950/40 to-teal-900/20 border border-emerald-900/50 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <ShoppingCart size={150} />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <ShoppingCart size={24} /> বাজার এস্টিমেটর (আগামীকাল)
            </h2>
            <p className="text-sm text-gray-300 mb-6">
              আগামীকালের সম্ভাব্য মোট মিল: <span className="font-bold text-white text-xl bg-emerald-500/20 px-3 py-1 rounded-lg ml-2">{tomorrowMeals}</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.entries(shoppingRatios).map(([item, ratio]) => (
                <div key={item} className="bg-gray-950/80 border border-gray-800 rounded-xl p-4 shadow-lg hover:border-emerald-500/50 transition-colors">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">{item}</p>
                  <p className="text-2xl font-black text-white">
                    {((ratio as number) * tomorrowMeals).toFixed(2)} <span className="text-sm font-normal text-gray-500">{item.includes("pcs") ? "টি" : "kg"}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {(role === 'manager' || role === 'owner') && (
            <div className="md:w-80 bg-gray-950/80 border border-gray-800 rounded-xl p-6 shadow-xl h-fit">
              <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 border-b border-gray-800 pb-2">কাস্টম রেশিও (প্রতি মিল)</h3>
              <div className="space-y-3 mb-6">
                {Object.entries(shoppingRatios).map(([item, ratio]) => (
                  <div key={`input-${item}`} className="flex items-center justify-between gap-3">
                    <label className="text-xs text-gray-400 flex-1 truncate">{item}</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      value={ratio as number}
                      onChange={(e) => setShoppingRatios((prev: any) => ({ ...prev, [item]: parseFloat(e.target.value) || 0 }))}
                      className="w-20 bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500 text-center"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveRatios} disabled={isSavingRatios} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-6">
                {isSavingRatios ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />} রেশিও সেভ করুন
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
