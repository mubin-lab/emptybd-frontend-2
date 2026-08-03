"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { SpinnerCustom } from "@/components/loading/Spinner";
import { BiArrowBack } from "react-icons/bi";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setPhone(val);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setOtp(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/verify-admin-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone,
          otp: otp
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid OTP or account not found.");
        return;
      }

      // Automatically log in the user if registration credentials are in sessionStorage
      const cachedData = sessionStorage.getItem("pendingRegistration");
      if (cachedData) {
        const { password } = JSON.parse(cachedData);
        try {
          const { getClientTrackingData } = await import("@/lib/tracking");
          const loginRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: `${phone}@gmail.com`, 
              password: password,
              ...getClientTrackingData()
            }),
            credentials: "include",
          });

          const loginData = await loginRes.json();
          if (loginRes.ok && loginData.token) {
            localStorage.setItem("auth_token", loginData.token);
            sessionStorage.removeItem("pendingRegistration");
            toast.success(data.alreadyVerified ? "Account already verified! Logging you in..." : "Account verified successfully! Logging you in...", {
              position: "top-right",
            });
            router.push("/");
            router.refresh();
            return; // Stop execution here since we are redirecting
          }
        } catch (e) {
          console.error("Auto-login failed:", e);
        }
      }

      // Fallback if no cached credentials or auto-login failed
      toast.success(data.alreadyVerified ? "Account already verified! Please log in." : "Account verified successfully! You can now log in.", {
        position: "top-right",
      });
      router.push("/login");

    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full  mx-auto">
      <div className="mb-4">
        <button
          onClick={() => router.push("/login")}
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors"
        >
          <BiArrowBack /> Back to Login
        </button>
      </div>

      <div className="bg-black/20 p-8 rounded-xl shadow-md border border-gray-800">
        <div className=" mb-6">
          <p className="text-gray-400 text-sm">১০ মিনিটের মধ্যে আপনার ফোনে একটি ৪ সংখ্যার কোড (OTP) পাঠানো হবে। অনুগ্রহ করে কোডটি এখানে লিখুন:
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="hidden">
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <Input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="017xxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-center hidden">
              Admin OTP
            </label>
            <Input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter OTP"
              className="text-center tracking-[5px] text-lg font-medium rounded-sm"
              maxLength={4}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || otp.length < 4 || !phone}
          >
            {loading ? <SpinnerCustom /> : "Verify Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyAdminOTPPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-center p-10"><SpinnerCustom /></div>}>
        <VerifyOTPForm />
      </Suspense>
    </div>
  );
}
