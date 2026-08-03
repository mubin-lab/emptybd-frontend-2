"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpinnerCustom } from "@/components/loading/Spinner";
import Empty from "@/components/NotFound.tsx/Empty";
import { toast } from "sonner";
import { HeadphonesIcon, MessageCircle, Plus, Send, Clock, CheckCircle } from "lucide-react";

interface SupportTicket {
  _id: string;
  title: string;
  description: string;
  category: "general" | "technical" | "billing" | "account" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  messages: {
    sender: string;
    message: string;
    timestamp: string;
  }[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SupportTicket["category"]>("general");
  const [priority, setPriority] = useState<SupportTicket["priority"]>("medium");

  const { user } = useAuthStore();
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/support/my-tickets`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      // Don't show error toast - just show empty state
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/support/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to create ticket");

      const newTicket = await res.json();
      setTickets([newTicket, ...tickets]);
      toast.success("Support ticket created successfully");
      setIsCreateOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("general");
      setPriority("medium");
    } catch (err) {
      console.error("Error creating ticket:", err);
      toast.error("Failed to create support ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTicket || !newMessage.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/support/${selectedTicket._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: newMessage,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to send message");

      const updatedTicket = await res.json();
      setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-500/20 text-green-400";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400";
      case "resolved":
        return "bg-purple-500/20 text-purple-400";
      case "closed":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400";
      case "high":
        return "bg-orange-500/20 text-orange-400";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400";
      case "low":
        return "bg-green-500/20 text-green-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) return <SpinnerCustom />;

  return (
    <div className="max-w-[1440px] w-[95%] mx-auto py-8">
      {/* Wrapper to align with dashboard or stand alone */}
      <div className="bg-gray-950/40 border border-gray-900 rounded-3xl p-6 lg:p-8 backdrop-blur-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-3xl font-bold text-white flex items-center gap-2 font-parkinsans">
              <HeadphonesIcon className="w-6 h-6 lg:w-8 lg:h-8 text-primary" />
              Support Desk
            </h1>
            <p className="text-sm text-gray-400 mt-1.5 font-hind">
              Create support tickets and get help from our team
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 px-4 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Plus size={16} className="mr-1" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg p-5 bg-gray-950 border border-gray-900 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-white font-parkinsans text-lg">Create Support Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4 mt-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of your issue"
                    required
                    className="bg-gray-900/60 border-gray-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed explanation of your issue..."
                    required
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-900/60 border border-gray-800 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Category</label>
                    <Select value={category} onValueChange={(v: string) => setCategory(v as SupportTicket["category"])}>
                      <SelectTrigger className="bg-gray-900/60 border-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-950 border-gray-800 text-white">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1 block">Priority</label>
                    <Select value={priority} onValueChange={(v: string) => setPriority(v as SupportTicket["priority"])}>
                      <SelectTrigger className="bg-gray-900/60 border-gray-800 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-950 border-gray-800 text-white">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-white/5 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="border-gray-800 text-gray-450 hover:bg-gray-900"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !title.trim() || !description.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    {submitting ? "Creating..." : "Create Ticket"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/10 border border-gray-900/30 rounded-2xl"> 
            <Empty description="No support tickets yet. Create a new ticket if you need assistance!" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="bg-gray-900/20 border border-gray-900/50 rounded-2xl p-5 hover:bg-gray-900/40 transition-colors cursor-pointer group flex items-center justify-between"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setIsChatOpen(true);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-white text-base font-parkinsans group-hover:text-primary transition-colors">{ticket.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getStatusBadgeClass(
                        ticket.status
                      )}`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getPriorityBadgeClass(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 font-hind line-clamp-1 mb-3">
                    {ticket.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className="capitalize">{ticket.category}</span>
                    {ticket.messages.length > 0 && (
                      <span className="flex items-center gap-1.5 text-blue-400">
                        <MessageCircle size={12} />
                        {ticket.messages.length} messages
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-4 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded-xl"
                >
                  View Desk
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-4 bg-gray-950 border border-gray-900 rounded-2xl">
          <DialogHeader className="pb-3 border-b border-white/5">
            <DialogTitle className="flex items-center gap-2 text-white font-parkinsans">
              <MessageCircle size={20} className="text-primary" />
              {selectedTicket?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="flex flex-col flex-1 min-h-0 pt-3">
              {/* Ticket Info */}
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-350 font-hind leading-relaxed">{selectedTicket.description}</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 chat-scroll min-h-[250px] max-h-[350px]">
                {selectedTicket.messages.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reply messages yet</p>
                  </div>
                ) : (
                  selectedTicket.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.sender === user?.email ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          msg.sender === user?.email
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-gray-900 border border-gray-800 text-white rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                        <p className="text-[10px] opacity-60 mt-1 font-mono text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-white/5">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply message..."
                    className="flex-1 bg-gray-900 border-gray-800 text-white"
                  />
                  <Button
                    type="submit"
                    disabled={submitting || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              )}
              
              {(selectedTicket.status === "closed" || selectedTicket.status === "resolved") && (
                <div className="flex items-center justify-center gap-2 py-3 bg-gray-900/40 rounded-xl text-gray-500 border border-white/5 mt-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  <span className="text-sm">This ticket is {selectedTicket.status.replace("_", " ")}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
