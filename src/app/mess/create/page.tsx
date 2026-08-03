"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function CreateMessPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    maxMembers: 10,
    rules: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.maxMembers) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Mess created successfully!");
        router.push(`/mess/${data.mess._id}/dashboard`);
      } else {
        toast.error(data.message || "Failed to create mess");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-[95%] py-8">
      <div className="mb-6">
        <Link href="/mess" className="text-gray-400 hover:text-white flex items-center gap-2 w-fit transition-colors">
          <ArrowLeft size={18} />
          মেস হাবে ফিরে যান
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-parkinsans mb-2">
          নতুন <span className="text-primary">মেস</span> তৈরি করুন
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          নতুন একটি মেস খুলুন, ম্যানেজার হোন এবং আপনার মেম্বারদের ইনভাইট করুন।
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">মেসের নাম <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="যেমন: সুপার বয়েজ হোস্টেল"
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">সর্বোচ্চ সদস্য <span className="text-red-500">*</span></label>
              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                min={2}
                max={50}
                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">লোকেশন / ঠিকানা <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="মেসের সম্পূর্ণ ঠিকানা"
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">বিবরণ (অপশনাল)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="আপনার মেস সম্পর্কে কিছু লিখুন..."
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">নিয়মাবলী (অপশনাল)</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="যেমন: ধূমপান নিষেধ, রাত ১২টায় গেট বন্ধ"
              rows={3}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-800">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-black rounded-xl"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "মেস তৈরি করুন"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
