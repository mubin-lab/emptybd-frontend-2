"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Settings2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MessSettingsPage() {
  const params = useParams();
  const messId = params.messId as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [role, setRole] = useState("member");
  
  const [formData, setFormData] = useState({
    name: "",
    maxMembers: 10,
    rules: "",
    defaultMeals: {
      breakfast: 0.5,
      lunch: 1,
      dinner: 1
    },
    mealMenu: {
      breakfast: "",
      lunch: "",
      dinner: ""
    }
  });

  useEffect(() => {
    fetchData();
  }, [messId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      const data = await res.json();

      setRole(data.role);
      
      if (data.role !== 'manager' && data.role !== 'owner') {
        toast.error("You don't have permission to view settings.");
        router.push(`/mess/${messId}/dashboard`);
        return;
      }

      setFormData({
        name: data.mess.name || "",
        maxMembers: data.mess.maxMembers || 10,
        rules: data.mess.rules || "",
        defaultMeals: data.mess.defaultMeals || {
          breakfast: 0.5,
          lunch: 1,
          dinner: 1
        },
        mealMenu: data.mess.mealMenu || {
          breakfast: "",
          lunch: "",
          dinner: ""
        }
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    setFormData(prev => ({ 
      ...prev, 
      defaultMeals: {
        ...prev.defaultMeals,
        [e.target.name]: val
      }
    }));
  };

  const handleMenuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      mealMenu: {
        ...prev.mealMenu,
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("সেটিংস সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMess = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই মেসটি ডিলিট করতে চান? এই অ্যাকশনটি আর ফেরানো যাবে না এবং সকল মেম্বার ও হিসাব মুছে যাবে!")) return;
    
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("মেসটি সফলভাবে ডিলিট করা হয়েছে!");
        router.push("/mess");
      } else {
        toast.error(data.message || "মেস ডিলিট করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      console.error(err);
      toast.error("মেস ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-gray-800 pb-2 flex items-center gap-2">
        <Settings2 className="text-gray-400" />
        <h1 className="text-2xl font-bold text-white font-parkinsans">মেস সেটিংস</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-gray-950 border border-gray-800 rounded-2xl p-6">
        
        {/* General Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">সাধারণ তথ্য</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">মেসের নাম</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">সর্বোচ্চ সদস্য সংখ্যা</label>
            <input 
              type="number" 
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">নিয়মাবলী (অপশনাল)</label>
            <textarea 
              name="rules"
              rows={3}
              value={formData.rules}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Default Meal Values Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">ডিফল্ট মিল ভ্যালু</h2>
          <p className="text-sm text-gray-400 mb-2">
            মেম্বাররা যখন মিলের চেকবক্সে টিক দেবে, তখন এই ভ্যালুটি যোগ হবে।
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">সকালের মিল ভ্যালু</label>
              <input 
                type="number" 
                name="breakfast"
                step="0.1"
                min="0"
                value={formData.defaultMeals.breakfast}
                onChange={handleMealChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">দুপুরের মিল ভ্যালু</label>
              <input 
                type="number" 
                name="lunch"
                step="0.1"
                min="0"
                value={formData.defaultMeals.lunch}
                onChange={handleMealChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">রাতের মিল ভ্যালু</label>
              <input 
                type="number" 
                name="dinner"
                step="0.1"
                min="0"
                value={formData.defaultMeals.dinner}
                onChange={handleMealChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Meal Menu Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-gray-800 pb-2">দৈনিক মিল মেনু</h2>
          <p className="text-sm text-gray-400 mb-2">
            মেম্বাররা মিল সিলেক্ট করার সময় কী মেনু দেখতে পাবে তা সেট করুন।
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">সকালের মেনু</label>
              <input 
                type="text" 
                name="breakfast"
                placeholder="e.g. Paratha, Egg"
                value={formData.mealMenu.breakfast}
                onChange={handleMenuChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">দুপুরের মেনু</label>
              <input 
                type="text" 
                name="lunch"
                placeholder="e.g. Rice, Chicken"
                value={formData.mealMenu.lunch}
                onChange={handleMenuChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">রাতের মেনু</label>
              <input 
                type="text" 
                name="dinner"
                placeholder="e.g. Rice, Fish"
                value={formData.mealMenu.dinner}
                onChange={handleMenuChange}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-primary text-black font-semibold hover:bg-primary/90 mt-4"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Save size={18} className="mr-2" /> সেভ করুন</>}
        </Button>

      </form>

      {/* Danger Zone */}
      {role === "owner" && (
        <div className="mt-12 bg-red-950/20 border border-red-900/50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-500 border-b border-red-900/30 pb-2 mb-4">ডেঞ্জার জোন</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-white font-medium">মেস ডিলিট করুন</h3>
              <p className="text-sm text-gray-400 mt-1">
                একবার মেস ডিলিট করলে সকল মেম্বার, মিলের হিসাব, এবং খরচের ডাটা চিরতরে মুছে যাবে। এটি আর ফেরানো যাবে না।
              </p>
            </div>
            <Button
              onClick={handleDeleteMess}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white shrink-0 whitespace-nowrap"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
              মেস ডিলিট করুন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
