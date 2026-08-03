"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Search, Headset, CheckCircle2, Clock, MessageSquare, Send, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Message = {
  sender: string;
  message: string;
  timestamp: string;
};

type Ticket = {
  _id: string;
  user_email: string;
  user_name: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  messages: Message[];
  created_at: string;
  updated_at: string;
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/support/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        
        // Update selected ticket if it's currently open
        if (selectedTicket) {
          const updated = data.find((t: Ticket) => t._id === selectedTicket._id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSendingReply(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/support/admin/${selectedTicket._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (res.ok) {
        setReplyMessage("");
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to send reply", error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;

    try {
      setStatusUpdating(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/support/admin/${selectedTicket._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "in-progress": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "resolved": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "closed": return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto text-white flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold font-orbitron flex items-center gap-2">
            <Headset className="text-primary" /> Support Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage and respond to user support tickets</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by email or title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-md py-2 pl-9 pr-3 text-sm text-white focus:border-primary outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-md py-2 px-3 text-sm text-white focus:border-primary outline-none"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <div className={`w-full lg:w-1/3 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-800 font-semibold text-gray-300">
            Tickets ({filteredTickets.length})
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-500" /></div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center p-10 text-gray-500 text-sm">No tickets found</div>
            ) : (
              filteredTickets.map((ticket) => (
                <div 
                  key={ticket._id} 
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTicket?._id === ticket._id 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-gray-950 border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm truncate pr-2" title={ticket.title}>{ticket.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(ticket.status)} capitalize whitespace-nowrap`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{ticket.user_email}</p>
                  <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500">
                    <span className={`capitalize ${getPriorityColor(ticket.priority)}`}>{ticket.priority} Priority</span>
                    <span>{format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Details & Chat */}
        <div className={`w-full lg:w-2/3 bg-gray-900 border border-gray-800 rounded-lg flex flex-col overflow-hidden ${!selectedTicket ? 'hidden lg:flex lg:items-center lg:justify-center' : 'flex'}`}>
          {!selectedTicket ? (
            <div className="text-center text-gray-500 flex flex-col items-center">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Select a ticket to view details and respond</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800 bg-gray-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="lg:hidden text-gray-400 mb-2 flex items-center text-sm"
                  >
                    ← Back to list
                  </button>
                  <h2 className="text-lg font-semibold text-white">{selectedTicket.title}</h2>
                  <div className="text-sm text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                    <span>From: <span className="text-gray-300">{selectedTicket.user_email}</span></span>
                    <span className="capitalize text-gray-500">• {selectedTicket.category}</span>
                    <span className={`capitalize ${getPriorityColor(selectedTicket.priority)}`}>• {selectedTicket.priority}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={statusUpdating}
                    className={`text-sm px-3 py-1.5 rounded-md border outline-none ${getStatusColor(selectedTicket.status)} ${statusUpdating ? 'opacity-50' : ''}`}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0f1115]">
                {/* Original Description */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-gray-800 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-200">
                    <p className="whitespace-pre-wrap">{selectedTicket.description}</p>
                    <span className="text-[10px] text-gray-400 block mt-2">
                      {selectedTicket.user_name} • {format(new Date(selectedTicket.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>

                {/* Follow-up Messages */}
                {selectedTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === "Admin";
                  return (
                    <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                        isAdmin 
                          ? 'bg-primary/20 text-white rounded-tr-sm border border-primary/30' 
                          : 'bg-gray-800 text-gray-200 rounded-tl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                        <span className={`text-[10px] block mt-2 ${isAdmin ? 'text-primary/70' : 'text-gray-400'}`}>
                          {isAdmin ? 'Admin' : selectedTicket.user_name} • {format(new Date(msg.timestamp), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {selectedTicket.status !== "closed" ? (
                <div className="p-4 border-t border-gray-800 bg-gray-950">
                  <div className="flex items-end gap-3">
                    <textarea 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm text-white focus:border-primary outline-none resize-none h-[80px]"
                    />
                    <Button 
                      onClick={handleSendReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className="h-10 px-4 shrink-0"
                    >
                      {sendingReply ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-800 bg-gray-950 text-center text-sm text-gray-500">
                  This ticket is closed. To reply, change the status to Open or In Progress.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
