"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function MessExpensesPage() {
  const params = useParams();
  const messId = params.messId as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("member");
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [shopping, setShopping] = useState<any[]>([]);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Form states
  const [expenseType, setExpenseType] = useState("shopping"); // 'shopping' or 'other'
  const [formData, setFormData] = useState({
    itemName: "",
    quantity: "1 kg",
    price: "",
    type: "market",
    amount: "",
    date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    fetchData();
  }, [messId, selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const [dashRes, expRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/expenses?month=${selectedMonth}&year=${selectedYear}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const expData = await expRes.json();

      setRole(dashData.role || 'member');
      setExpenses(Array.isArray(expData.expenses) ? expData.expenses : []);
      setShopping(Array.isArray(expData.shopping) ? expData.shopping : []);
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load expenses data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const payload = expenseType === "shopping" ? {
        type: "shopping",
        itemName: formData.itemName,
        quantity: formData.quantity,
        price: formData.price,
        date: formData.date
      } : {
        type: formData.type,
        amount: formData.amount,
        date: formData.date
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success("Added successfully!");
        setFormData(prev => ({ ...prev, itemName: "", price: "", amount: "" })); // Reset some fields
        fetchData();
      } else {
        toast.error(data.message || "Failed to add expense");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, type: 'shopping' | 'expenses') => {
    if (!confirm(`Are you sure you want to delete this record?`)) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Deleted successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalShopping = shopping.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOther = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
  const grandTotal = totalShopping + totalOther;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-2 gap-4">
        <h1 className="text-2xl font-bold text-white font-parkinsans">
          খরচ এবং বাজার
        </h1>
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

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">মোট বাজার খরচ</p>
          <p className="text-xl font-bold text-emerald-400">৳{totalShopping}</p>
        </div>
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
          <p className="text-sm text-gray-400">অন্যান্য খরচ</p>
          <p className="text-xl font-bold text-rose-400">৳{totalOther}</p>
        </div>
        <div className="bg-gray-950 border border-primary/30 rounded-xl p-4">
          <p className="text-sm text-gray-400">সর্বমোট খরচ</p>
          <p className="text-xl font-bold text-primary">৳{grandTotal}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* ADD EXPENSE FORM (Manager/Owner Only) */}
        {(role === 'manager' || role === 'owner') && (
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 h-fit">
            <h2 className="text-lg font-bold text-white mb-4">নতুন হিসাব যোগ করুন</h2>
            
            <div className="flex gap-2 mb-4 bg-gray-900 p-1 rounded-xl">
              <button 
                onClick={() => setExpenseType('shopping')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${expenseType === 'shopping' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
              >
                দৈনিক বাজার
              </button>
              <button 
                onClick={() => setExpenseType('other')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${expenseType === 'other' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
              >
                অন্যান্য খরচ
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">তারিখ</label>
                <input 
                  type="date" 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>

              {expenseType === 'shopping' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">পণ্যের নাম</label>
                    <input 
                      type="text" 
                      name="itemName"
                      placeholder="e.g. Rice, Fish, Vegetables"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">পরিমাণ</label>
                      <input 
                        type="text" 
                        name="quantity"
                        placeholder="e.g. 5 kg"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">মোট দাম (৳)</label>
                      <input 
                        type="number" 
                        name="price"
                        placeholder="0"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">খরচের ধরণ</label>
                    <select 
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                      required
                    >
                      <option value="market">বাজার</option>
                      <option value="gas">গ্যাস বিল</option>
                      <option value="electricity">বিদ্যুৎ বিল</option>
                      <option value="internet">ইন্টারনেট বিল</option>
                      <option value="cook_salary">খালার বেতন (Cook)</option>
                      <option value="others">অন্যান্য</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">টাকার পরিমাণ (৳)</label>
                    <input 
                      type="number" 
                      name="amount"
                      placeholder="0"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary text-black font-semibold hover:bg-primary/90"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "সেভ করুন"}
              </Button>
            </form>
          </div>
        )}

        {/* LISTINGS */}
        <div className={`space-y-6 ${role === 'member' ? 'md:col-span-2' : ''}`}>
          
          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">বাজারের তালিকা</h2>
            {shopping.length === 0 ? (
              <p className="text-gray-500 text-sm">কোনো বাজারের হিসাব পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-2">
                {shopping.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-white font-medium">{item.itemName} <span className="text-xs text-gray-400">({item.quantity})</span></p>
                      <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('en-GB')} • যুক্ত করেছেন: {item.addedBy}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-emerald-400 font-bold">৳{item.price}</p>
                      {(role === 'manager' || role === 'owner') && (
                        <button onClick={() => handleDelete(item._id, 'shopping')} className="text-gray-500 hover:text-rose-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">অন্যান্য খরচ</h2>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-sm">অন্য কোনো খরচ পাওয়া যায়নি।</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(item => (
                  <div key={item._id} className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-white font-medium capitalize">{item.type.replace('_', ' ')}</p>
                      <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('en-GB')} • যুক্ত করেছেন: {item.addedBy}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-rose-400 font-bold">৳{item.amount}</p>
                      {(role === 'manager' || role === 'owner') && (
                        <button onClick={() => handleDelete(item._id, 'expenses')} className="text-gray-500 hover:text-rose-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
