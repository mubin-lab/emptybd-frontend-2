"use client";

import React, { useState, useEffect } from "react";
import AdminConfirmModal from "@/components/admin/AdminConfirmModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { Settings, ShieldAlert, DollarSign, Truck, PhoneCall, Info } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    commissionRate: 5,
    shippingFee: 80,
    hotlineNumber: "01712586423",
    bkashMerchant: "01712586423",
    maintenanceMode: false,
    autoVerifyNewUsers: false,
    minWithdrawLimit: 500,
    trackUserActivity: true,
    newsCharLimit: 140,
  });

  const [form, setForm] = useState({ ...settings });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`);
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        const config = {
          commissionRate: Number(data.commissionRate) || 0,
          shippingFee: Number(data.shippingFee) || 0,
          hotlineNumber: String(data.hotlineNumber || "01712586423"),
          bkashMerchant: String(data.bkashMerchant || "01712586423"),
          maintenanceMode: Boolean(data.maintenanceMode),
          autoVerifyNewUsers: Boolean(data.autoVerifyNewUsers),
          minWithdrawLimit: Number(data.minWithdrawLimit) || 500,
          trackUserActivity: data.trackUserActivity !== undefined ? Boolean(data.trackUserActivity) : true,
          newsCharLimit: Number(data.newsCharLimit) || 140,
        };
        setSettings(config);
        setForm(config);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings from server.");
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmOpen(true);
  };

  const executeSaveSettings = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update configurations");
      }

      const data = await res.json();
      const updatedConfig = {
        commissionRate: Number(data.settings.commissionRate) || 0,
        shippingFee: Number(data.settings.shippingFee) || 0,
        hotlineNumber: String(data.settings.hotlineNumber || "01712586423"),
        bkashMerchant: String(data.settings.bkashMerchant || "01712586423"),
        maintenanceMode: Boolean(data.settings.maintenanceMode),
        autoVerifyNewUsers: Boolean(data.settings.autoVerifyNewUsers),
        minWithdrawLimit: Number(data.settings.minWithdrawLimit) || 500,
        trackUserActivity: data.settings.trackUserActivity !== undefined ? Boolean(data.settings.trackUserActivity) : true,
        newsCharLimit: Number(data.settings.newsCharLimit) || 140,
      };
      setSettings(updatedConfig);
      setForm(updatedConfig);
      toast.success("Platform configurations saved successfully.");
    } catch (error: any) {
      console.error("Save settings error:", error);
      toast.error(error.message || "Failed to save configuration adjustments.");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-averia-gruesa-libre tracking-wide text-white">
          Platform Settings
        </h1>
        <p className="text-sm text-gray-400 font-parkinsans mt-1">
          Configure fees, transaction charges, hotlines, and server deployment parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Financial Settings */}
        <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2 border-b border-gray-850 pb-2.5">
            <DollarSign className="text-primary h-5 w-5" />
            Financial Configurations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-parkinsans">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Platform Sales Commission (%)
              </label>
              <Input
                type="number"
                value={form.commissionRate}
                onChange={(e) => setForm((prev) => ({ ...prev, commissionRate: Number(e.target.value) }))}
                className="bg-gray-950 border-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Flat Shipping Fee (৳)
              </label>
              <Input
                type="number"
                value={form.shippingFee}
                onChange={(e) => setForm((prev) => ({ ...prev, shippingFee: Number(e.target.value) }))}
                className="bg-gray-950 border-gray-800 text-white"
                required
              />
            </div>
            <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  Minimum Withdraw Limit (৳)
                </label>
                <Input
                  type="number"
                  value={form.minWithdrawLimit}
                  onChange={(e) => setForm((prev) => ({ ...prev, minWithdrawLimit: Number(e.target.value) }))}
                  className="bg-gray-950 border-gray-800 text-white"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                  News Post Minimum Character Limit
                </label>
                <Input
                  type="number"
                  min={10}
                  max={100000}
                  value={form.newsCharLimit}
                  onChange={(e) => setForm((prev) => ({ ...prev, newsCharLimit: Number(e.target.value) }))}
                  className="bg-gray-950 border-gray-800 text-white"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Users must write at least this many characters before submitting a news post.</p>
              </div>
          </div>
        </Card>

        {/* Gateways Settings */}
        <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2 border-b border-gray-850 pb-2.5">
            <PhoneCall className="text-primary h-5 w-5" />
            Mobile Banking & Contact Gateways
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-parkinsans">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                bKash / Nagad Receive Wallet Number
              </label>
              <Input
                value={form.bkashMerchant}
                onChange={(e) => setForm((prev) => ({ ...prev, bkashMerchant: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">
                Support Hotline Phone
              </label>
              <Input
                value={form.hotlineNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, hotlineNumber: e.target.value }))}
                className="bg-gray-950 border-gray-800 text-white"
                required
              />
            </div>
          </div>
        </Card>

        {/* System Deployment */}
        <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2 border-b border-gray-850 pb-2.5">
            <ShieldAlert className="text-primary h-5 w-5" />
            Deployment & Maintenance Controls
          </h3>
          <div className="flex items-center justify-between text-sm font-parkinsans">
            <div>
              <span className="font-semibold text-white block">Maintenance Deployment Mode</span>
              <span className="text-xs text-gray-500 block">Blocks non-admin user requests if enabled.</span>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                form.maintenanceMode ? "bg-red-600" : "bg-gray-700"
              }`}
            >
              <div
                className={`bg-white h-5 w-5 rounded-full shadow-md transform transition-transform ${
                  form.maintenanceMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Registration Verification Settings */}
        <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2 border-b border-gray-850 pb-2.5">
            <ShieldAlert className="text-primary h-5 w-5" />
            Registration Verification Settings
          </h3>
          <div className="flex items-center justify-between text-sm font-parkinsans">
            <div>
              <span className="font-semibold text-white block">Auto Verify New Accounts</span>
              <span className="text-xs text-gray-500 block">If enabled, new users will bypass OTP verification and be automatically verified.</span>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, autoVerifyNewUsers: !prev.autoVerifyNewUsers }))}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                form.autoVerifyNewUsers ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <div
                className={`bg-white h-5 w-5 rounded-full shadow-md transform transition-transform ${
                  form.autoVerifyNewUsers ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* User Activity Tracking Settings */}
        <Card className="bg-gray-900 border-gray-800 p-5 space-y-4">
          <h3 className="text-base lg:text-lg font-bold font-parkinsans text-white flex items-center gap-2 border-b border-gray-850 pb-2.5">
            <Settings className="text-primary h-5 w-5" />
            User Activity Tracking Settings
          </h3>
          <div className="flex items-center justify-between text-sm font-parkinsans">
            <div>
              <span className="font-semibold text-white block">Track User Activity</span>
              <span className="text-xs text-gray-500 block">If enabled, pages visited and time spent by users will be logged. If disabled, all user tracking is disabled.</span>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, trackUserActivity: !prev.trackUserActivity }))}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                form.trackUserActivity ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <div
                className={`bg-white h-5 w-5 rounded-full shadow-md transform transition-transform ${
                  form.trackUserActivity ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white h-10 px-6 font-parkinsans"
          >
            Save Configurations
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeSaveSettings}
        isLoading={loading}
        title="Confirm Setting Adjustments?"
        description="Are you sure you want to update platform fees, gateway phone targets, or trigger maintenance mode changes?"
        confirmText="Yes, Save Settings"
        type="warning"
      />
    </div>
  );
}
