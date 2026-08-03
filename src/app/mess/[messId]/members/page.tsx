"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserCheck, UserX, Crown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/store/authStore";

export default function MessMembersPage() {
  const params = useParams();
  const messId = params.messId as string;
  const user = useAuthStore(s => s.user);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("member");
  
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUserId, setPaymentUserId] = useState("");
  const [paymentData, setPaymentData] = useState({
    amount: "",
    paymentMethod: "Cash",
    date: new Date().toISOString().split("T")[0],
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [messId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const [dashRes, memRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const dashData = await dashRes.json();
      const memData = await memRes.json();

      setRole(dashData.role || 'member');
      setMembers(Array.isArray(memData) ? memData : []);

      // Fetch join requests if manager/owner
      if (dashData.role === 'manager' || dashData.role === 'owner') {
        const [reqRes, payRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/requests`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/payments`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const reqData = await reqRes.json();
        const payData = await payRes.json();
        setRequests(Array.isArray(reqData) ? reqData : []);
        setPayments(Array.isArray(payData) ? payData : []);
      }
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to load member data");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Request ${action}ed`);
        fetchData();
      } else {
        toast.error(data.message || "Failed to process request");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateManager = async (newManagerId: string) => {
    if (!confirm("Are you sure you want to assign this user as the Monthly Manager?")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members/assign-manager`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newManagerId })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Manager updated successfully!");
        fetchData();
      } else {
        toast.error(data.message || "Failed to update manager");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleRemoveMember = async (targetUserId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the mess? Their historical data will be preserved.`)) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/members/${targetUserId}/remove`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Member removed successfully.");
        fetchData();
      } else {
        toast.error(data.message || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to delete this payment record? This will affect the member's balance.")) return;
    
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/payments/${paymentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Payment deleted successfully!");
        fetchData(); // Refresh the lists
      } else {
        toast.error(data.message || "Failed to delete payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/mess/${messId}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: paymentUserId, ...paymentData })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        setPaymentData({ amount: "", paymentMethod: "Cash", date: new Date().toISOString().split("T")[0], notes: "" });
      } else {
        toast.error(data.message || "Failed to add payment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-8 relative">
      <div className="border-b border-gray-800 pb-2">
        <h1 className="text-2xl font-bold text-white font-parkinsans">মেম্বার ও ম্যানেজমেন্ট</h1>
      </div>

      {/* JOIN REQUESTS */}
      {(role === 'manager' || role === 'owner') && requests.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">পেন্ডিং জয়েন রিকোয়েস্ট ({requests.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {requests.map(req => (
              <div key={req._id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-white font-bold">{req.userName}</p>
                  <p className="text-sm text-gray-400">{req.userEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">রিকোয়েস্ট তারিখ: {new Date(req.requestedAt).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    size="sm" 
                    onClick={() => handleRequest(req._id, 'accept')}
                    className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <UserCheck size={16} className="mr-1" /> গ্রহণ করুন
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRequest(req._id, 'reject')}
                    className="flex-1 sm:flex-none border-gray-700 text-gray-400 hover:text-rose-400"
                  >
                    <UserX size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBERS LIST */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">অ্যাক্টিভ মেম্বার ({members.length})</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <div key={member._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 relative group">
              {member.role === 'owner' && (
                <div className="absolute top-3 right-3 text-amber-500" title="ম্যানেজার">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded">
                    <Crown size={12} />
                    ম্যানেজার
                  </span>
                </div>
              )}

              <div className="pr-20">
                <p className="text-white font-bold text-lg leading-tight">{member.userId === user?._id ? `${member.name} (আপনি)` : member.name}</p>
                <p className="text-sm text-gray-400 mt-1">{member.phone || "কোনো নম্বর নেই"}</p>
              </div>

              {(role === 'manager' || role === 'owner') && (
                <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-800">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setPaymentUserId(member.userId);
                      setShowPaymentModal(true);
                    }}
                    className="w-full border-gray-700 text-gray-300 hover:text-white"
                  >
                    <Wallet size={16} className="mr-2" /> পেমেন্ট গ্রহণ করুন
                  </Button>
                  
                  {member.role !== 'manager' && member.role !== 'owner' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateManager(member.userId)}
                      className="w-full border-gray-700 text-primary hover:bg-primary/10 hover:border-primary/50"
                    >
                      মান্থলি ম্যানেজার বানান
                    </Button>
                  )}
                  
                  {member.role !== 'owner' && member.userId !== user?._id && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveMember(member.userId, member.name)}
                      className="w-full border-rose-900/50 text-rose-500 hover:bg-rose-950 hover:border-rose-700 mt-2"
                    >
                      <UserX size={16} className="mr-2" /> মেম্বার রিমুভ করুন
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RECENT PAYMENTS LIST (Manager Only) */}
      {(role === 'manager' || role === 'owner') && payments.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">সাম্প্রতিক পেমেন্ট</h2>
          <div className="space-y-2">
            {payments.map(payment => {
              return (
                <div key={payment._id} className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
                  <div>
                    <p className="text-white font-medium">{payment.memberName || "Unknown Member"} <span className="text-xs text-emerald-500 font-bold ml-2">৳{payment.amount}</span></p>
                    <p className="text-xs text-gray-500">{new Date(payment.date).toLocaleDateString('en-GB')} • {payment.paymentMethod} • Received by {payment.receiverName || "System"}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleDeletePayment(payment._id)}
                    className="text-gray-500 hover:text-rose-500 hover:bg-transparent"
                  >
                    Delete
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (SIMPLE INLINE) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-white mb-4">Record Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Amount (৳)</label>
                <input 
                  type="number" 
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Date</label>
                <input 
                  type="date" 
                  value={paymentData.date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Method</label>
                <select 
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-gray-700 text-gray-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-black font-semibold hover:bg-primary/90"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Payment"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
