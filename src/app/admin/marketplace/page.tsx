"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Plus, Check, X, Eye, Trash, Edit, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/authStore";
import { imageUpload } from "@/src/app/api/img-up/routes";
import BackendImage from "@/components/shared/BackendImage";
import Link from "next/link";

// Reusable Tabs styling since we don't have standard shadcn ui component file
const TabsListStyles = "flex space-x-1 rounded-xl bg-gray-900/50 p-1 mb-6 border border-gray-800 w-fit";
const TabsTriggerStyles = "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow text-gray-400 hover:text-white";

export default function AdminMarketplace() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("cards");

  // State
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [priceRequests, setPriceRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Low",
    subCategory: "Player",
    value: "",
    description: "",
    image: "",
    file: null as File | null,
    pricingAccess: "onlyAdminAccess",
    status: "Active",
    priority: ""
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [cardsRes, txRes, reqsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/transactions`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/price-requests`, { headers })
      ]);

      if (cardsRes.ok) setCards((await cardsRes.json()).assets);
      if (txRes.ok) setTransactions((await txRes.json()).transactions);
      if (reqsRes.ok) setPriceRequests((await reqsRes.json()).requests);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch marketplace data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string, file });
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (card: any) => {
    setFormData({
      title: card.title || "",
      category: card.category || "Low",
      subCategory: card.subCategory || "Player",
      value: card.currentPrice || card.value || "",
      description: card.description || "",
      image: card.image || "",
      file: null,
      pricingAccess: card.pricingAccess || "onlyAdminAccess",
      status: card.status || "Active",
      priority: ""
    });
    setEditingCardId(card._id);
    setIsEditing(true);
  };

  const handleCreateOrUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;

      if (formData.file) {
        const uploadedUrl = await imageUpload(formData.file);
        if (!uploadedUrl) {
          toast.error("Image upload to IMGBB failed.");
          setIsSubmitting(false);
          return;
        }
        imageUrl = uploadedUrl;
      }

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards/${editingCardId}`
        : `${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards`;

      const payload = { ...formData, image: imageUrl };
      // @ts-ignore
      delete payload.file;

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`Card ${isEditing ? 'updated' : 'created'} successfully`);
        setIsCreating(false);
        setIsEditing(false);
        setEditingCardId(null);
        setFormData({ title: "", category: "Low", subCategory: "Player", value: "", description: "", image: "", file: null, pricingAccess: "onlyAdminAccess", status: "Active", priority: "" });
        fetchAllData();
      } else {
        const data = await res.json();
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} card`);
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/cards/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Card deleted");
        fetchAllData();
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Error");
    }
  };

  const handlePriceRequest = async (id: string, status: string) => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/api/marketplace/price-request/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminResponse: "Reviewed by Admin" })
      });
      if (res.ok) {
        toast.success(`Request ${status}`);
        fetchAllData();
      } else {
        toast.error("Failed to update request");
      }
    } catch (err) {
      toast.error("Error");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-400 font-parkinsans">
        <RefreshCw className="animate-spin mx-auto mb-4" />
        Loading marketplace data...
      </div>
    );
  }

  return (
    <div className="p-8 font-parkinsans max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">Digital Exchange</h1>
          <p className="text-gray-400 mt-1">Manage Collectible Cards, Transactions, and Pricing</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition-all"
        >
          <Plus size={20} />
          Create Card
        </button>
      </div>

      {(isCreating || isEditing) && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
              <h2 className="text-xl font-bold font-orbitron">{isEditing ? "Edit Collectible Card" : "Create New Collectible Card"}</h2>
              <button onClick={() => { setIsCreating(false); setIsEditing(false); setEditingCardId(null); setFormData({ title: "", category: "Low", subCategory: "Player", value: "", description: "", image: "", file: null, pricingAccess: "onlyAdminAccess", status: "Active", priority: "" }); }} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateOrUpdateCard} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Category (Tier)</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Big-Time</option>
                    <option>Common</option>
                    <option>Uncommon</option>
                    <option>Rare</option>
                    <option>Epic</option>
                    <option>Legendary</option>
                    <option>Mythic</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Sub-Category</label>
                  <select value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white">
                    <option>Player</option>
                    <option>Toy</option>
                    <option>Online Game</option>
                    <option>Sports</option>
                    <option>Person</option>
                    <option>Device</option>
                    <option>Tech</option>
                    <option>Art</option>
                    <option>Fashion</option>
                    <option>Vehicle</option>
                    <option>Real Estate</option>
                    <option>Virtual Asset</option>
                    <option>Music</option>
                    <option>Movie</option>
                    <option>Collectible</option>
                    <option>Crypto</option>
                    <option>Football</option>
                    <option>Baseball</option>
                    <option>Cricket</option>
                    <option>Volleyball</option>
                    <option>Basketball</option>
                    <option>Tennis</option>
                    <option>Badminton</option>
                    <option>Table Tennis</option>
                    <option>Rugby</option>
                    <option>Ice Hockey</option>
                    <option>Golf</option>
                    <option>American Football</option>
                    <option>Formula 1 / Motorsports</option>
                    <option>Boxing</option>
                    <option>Swimming</option>
                    <option>Athletics / Track and Field</option>
                    <option>Cycling</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">{isEditing ? "Current Price (৳)" : "Initial Value (৳)"}</label>
                  <input required type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-gray-400">Pricing Access</label>
                  <select value={formData.pricingAccess} onChange={e => setFormData({ ...formData, pricingAccess: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white">
                    <option value="onlyAdminAccess">Only Admin Access (Requires Approval)</option>
                    <option value="bothAccess">Both Access (Free Resale)</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-gray-400">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:border-primary outline-none text-white min-h-[100px]" />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm text-gray-400">Card Image (Upload)</label>
                  <input type={isEditing ? "file" : "file"} required={!isEditing} accept="image/*" onChange={handleImageUpload} className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                  {formData.image && <BackendImage src={formData.image} alt="Preview" className="h-32 object-cover rounded-lg mt-2 border border-gray-800" />}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  {isSubmitting ? <RefreshCw className="animate-spin w-5 h-5" /> : (isEditing ? "Save Changes" : "Create Card")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={TabsListStyles}>
          <TabsTrigger value="cards" className={TabsTriggerStyles}>All Cards</TabsTrigger>
          <TabsTrigger value="transactions" className={TabsTriggerStyles}>Transactions</TabsTrigger>
          <TabsTrigger value="requests" className={TabsTriggerStyles}>Price Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Image</th>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Current Price</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Pricing Access</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {cards.map((card) => (
                    <tr key={card._id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <BackendImage src={card.image} alt="" className="h-10 w-10 rounded-md object-cover border border-gray-800" />
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{card.title}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full text-xs">{card.category}</span>
                      </td>
                      <td className="px-6 py-4 text-green-400 font-mono">৳{card.currentPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs ${card.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">{card.pricingAccess === 'bothAccess' ? 'Both' : 'Admin Only'}</td>
                      <td className="px-6 py-4 flex items-center justify-end gap-3">
                        <Link href={`/digital-exchange/${card._id}`} className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-400/10 rounded">
                          <Eye size={16} />
                        </Link>
                        <button onClick={() => openEditModal(card)} className="text-blue-400 hover:text-blue-300 p-1.5 hover:bg-blue-400/10 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteCard(card._id)} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-400/10 rounded">
                          <Trash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cards.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No cards found. Create one to get started.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Asset</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{tx.asset?.title || 'Unknown Asset'}</td>
                      <td className="px-6 py-4 text-green-400 font-mono">৳{tx.amount}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No transactions yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-900/50 border-b border-gray-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Asset</th>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Requested Price</th>
                    <th className="px-6 py-4 font-medium">Message</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {priceRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4 text-white font-medium">{req.asset?.title}</td>
                      <td className="px-6 py-4 text-gray-300">{req.user?.name}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-500 line-through mr-2">৳{req.currentPrice}</span>
                        <span className="text-green-400 font-mono">৳{req.requestedPrice}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={req.message}>{req.message}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${req.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        {req.status === 'Pending' && (
                          <>
                            <button onClick={() => handlePriceRequest(req._id, 'Approved')} className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded">
                              <Check size={16} />
                            </button>
                            <button onClick={() => handlePriceRequest(req._id, 'Rejected')} className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded">
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {priceRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No price requests found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
