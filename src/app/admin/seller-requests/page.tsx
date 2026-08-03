"use client";
import BackendImage from "@/components/shared/BackendImage";


import React, { useEffect, useState } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShieldCheck, UserX, Eye, User, MapPin, Phone } from "lucide-react";

interface SellerRequestUser {
  img: string | Blob | undefined;
  _id: string;
  name: string;
  email: string;
  phone_number?: string;
  address?: string;
  selfie?: string;
  nid_img?: string[];
  bid_account: string;
  product_account: string;
}

export default function SellerRequestsPage() {
  const [users, setUsers] = useState<SellerRequestUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected User for Dialogs
  const [selectedUser, setSelectedUser] = useState<SellerRequestUser | null>(null);
  
  // Dialog Open States
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users list");
      const data = await res.json();
      
      const pendingUsers = Array.isArray(data) 
        ? data.filter(u => u.bid_account === "pending" || u.product_account === "pending")
        : [];
        
      setUsers(pendingUsers);
    } catch (e) {
      console.error(e);
      toast.error("Error loading seller requests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleViewDetails = (user: SellerRequestUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleActionClick = (user: SellerRequestUser, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    if (action === 'approve') setConfirmApproveOpen(true);
    if (action === 'reject') setConfirmRejectOpen(true);
  };

  const executeStatusUpdate = async (status: "seller" | "buyer") => {
    if (!selectedUser) return;
    setActionLoading(true);
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${selectedUser._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bid_account: status,
            product_account: status
          }),
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Application ${status === "seller" ? "approved" : "rejected"} successfully.`);
      
      // Update local state to remove user from pending list
      setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
      
      // Trigger sidebar update
      window.dispatchEvent(new Event("refresh-pending-counts"));
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to update application status.`);
    } finally {
      setActionLoading(false);
      setConfirmApproveOpen(false);
      setConfirmRejectOpen(false);
      setIsViewOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: Column<SellerRequestUser>[] = [
    {
      key: "name",
      label: "Applicant Info",
      render: (u) => (
        <div className="flex items-center gap-3">
          <BackendImage 
            src={u.selfie || "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-vector-illustration_561158-3383.jpg"} 
            alt="Selfie" 
            className="w-10 h-10 rounded-full object-cover border border-gray-700"
           />
          <div>
            <span className="font-semibold text-white block">{u.name}</span>
            <span className="text-[11px] text-gray-500 block">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "phone_number",
      label: "Contact",
      render: (u) => (
        <span className="text-sm text-gray-300">{u.phone_number || "N/A"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: () => (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Pending Review
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(u)}
            className="h-8 border-primary/50 text-primary hover:bg-primary/10 px-3 gap-1.5"
          >
            <Eye size={14} />
            Review
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-orbitron tracking-wide text-white">
            Seller Applications
          </h1>
          <p className="text-sm text-gray-400 font-parkinsans mt-1">
            Review user KYC documents and verify identities for marketplace seller access.
          </p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search applicants..."
        searchValue={""}
        onSearchChange={() => {}}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        pageSize={100}
        totalRecords={users.length}
      />

      {/* Review Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-4xl bg-gray-950 border border-gray-800 text-white p-0 overflow-hidden font-parkinsans">
          <DialogHeader className="p-6 border-b border-gray-800 bg-gray-900/50">
            <DialogTitle className="text-xl font-bold font-orbitron flex items-center gap-2">
              <ShieldCheck className="text-primary" />
              Application Review
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Profile Information */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start gap-4 mb-5 pb-5 border-b border-gray-800">
                    <BackendImage 
                      src={selectedUser?.img} 
                      alt="Selfie" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
                     />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{selectedUser.name}</h3>
                      <p className="text-sm text-gray-400 flex items-center gap-1.5"><User size={14}/> {selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Phone Number</span>
                      <p className="text-sm text-gray-200 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400"/> {selectedUser?.phone_number || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Full Address</span>
                      <p className="text-sm text-gray-200 flex items-start gap-2 leading-relaxed">
                        <MapPin size={14} className="text-gray-400 mt-1 shrink-0"/> {selectedUser?.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Panel */}
                <div className="w-full md:w-64 space-y-3">
                  <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4">
                    <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider mb-1 block">Action Required</span>
                    <p className="text-xs text-blue-200/70">Please verify the provided National ID documents against the user's selfie and information before approving.</p>
                  </div>

                  <Button 
                    onClick={() => handleActionClick(selectedUser, 'approve')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl"
                  >
                    <ShieldCheck className="mr-2 h-5 w-5" /> Approve Seller
                  </Button>

                  <Button 
                    onClick={() => handleActionClick(selectedUser, 'reject')}
                    className="w-full bg-gray-900 hover:bg-red-900/30 border border-gray-800 hover:border-red-900/50 text-red-400 hover:text-red-400 font-bold py-6 rounded-xl transition-all"
                  >
                    <UserX className="mr-2 h-5 w-5" /> Reject Application
                  </Button>
                </div>
              </div>

              {/* Document Review section */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 border-b border-gray-800 pb-2">Identity Documents (NID)</h4>
                
                {selectedUser.nid_img && selectedUser.nid_img.length >= 2 ? (
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <div className="p-3 bg-gray-900/80 border-b border-gray-800">
                        <span className="text-xs font-bold text-gray-300">Front Side</span>
                      </div>
                      <BackendImage src={selectedUser?.nid_img[0]} alt="NID Front" className="w-full h-auto"  />
                    </div>
                    
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <div className="p-3 bg-gray-900/80 border-b border-gray-800">
                        <span className="text-xs font-bold text-gray-300">Back Side</span>
                      </div>
                      <BackendImage src={selectedUser?.nid_img[1]} alt="NID Back" className="w-full h-auto"  />
                    </div>


                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <div className="p-3 bg-gray-900/80 border-b border-gray-800">
                        <span className="text-xs font-bold text-gray-300">Selfie</span>
                      </div>
                      <BackendImage src={selectedUser?.selfie} alt="Selfie" className="w-full h-auto"  />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-900 border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm">
                    No identity documents were attached to this application.
                  </div>
                )}
              </div>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modals */}
      <AdminConfirmModal
        isOpen={confirmApproveOpen}
        onClose={() => setConfirmApproveOpen(false)}
        onConfirm={() => executeStatusUpdate('seller')}
        isLoading={actionLoading}
        title="Approve Seller Application?"
        description="This will instantly grant the user access to list and sell digital assets in the marketplace and post auctions."
        confirmText="Yes, Approve Access"
        type="warning"
      />

      <AdminConfirmModal
        isOpen={confirmRejectOpen}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={() => executeStatusUpdate('buyer')}
        isLoading={actionLoading}
        title="Reject Application?"
        description="This will revert the user's status back to buyer. They will need to submit a new application if they wish to try again."
        confirmText="Yes, Reject Application"
        type="danger"
      />
    </div>
  );
}
