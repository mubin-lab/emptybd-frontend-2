/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { SpinnerCustom } from "./loading/Spinner";
import { getClientTrackingData } from "@/lib/tracking";

type AuthFormProps = {
  type: "login" | "register";
};

const avatarList = [
  "/profile_img/1.jpg",
  "/profile_img/2.jpg",
  "/profile_img/3.jpg",
  "/profile_img/4.jpg",
  "/profile_img/5.jpg",
  "/profile_img/6.jpg",
  "/profile_img/7.jpg",
  "/profile_img/8.jpg",
  "/profile_img/9.jpg",
  "/profile_img/10.jpg",
  "/profile_img/11.jpg",
  "/profile_img/12.jpg",
  "/profile_img/13.jpg",
  "/profile_img/14.jpg",
  "/profile_img/15.jpg",
  "/profile_img/16.jpg",
  "/profile_img/17.jpg",
  "/profile_img/18.jpg",
  "/profile_img/19.jpg",
  "/profile_img/20.jpg",
  "/profile_img/21.jpg",
  "/profile_img/22.jpg",
  "/profile_img/23.jpg",
  "/profile_img/24.jpg",
  "/profile_img/25.jpg",
  "/profile_img/26.jpg",
  "/profile_img/27.jpg",
];

export default function AuthForm({ type }: AuthFormProps) {
  const [showAvatars, setShowAvatars] = useState(true);

  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    password: "",
    img: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "login") {
      const stored = sessionStorage.getItem("autoFillLogin");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setForm(prev => ({
            ...prev,
            phone_number: parsed.phone_number || "",
            password: parsed.password || ""
          }));
          if (parsed.message) {
            toast.info(parsed.message, {
              duration: 8000,
              position: "top-center"
            });
          }
          sessionStorage.removeItem("autoFillLogin");
        } catch (e) {
          console.error("Error parsing autoFillLogin data", e);
        }
      }
    }
  }, [type]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const val = e.target.value.replace(/\D/g, '');
    setForm({ ...form, phone_number: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (type === "login") {
        // Login Flow
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: `${form.phone_number}@gmail.com`, 
            password: form.password,
            ...getClientTrackingData()
          }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Something went wrong");
          return;
        }

        if (!data.token) {
          setError("No token received from server");
          return;
        }

        localStorage.setItem("auth_token", data.token);
        router.push("/");
        router.refresh();
      } else {
        // Register Flow (No automatic OTP, just register and redirect to pending admin approval)
        const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/register-phone`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            name: form.name,
            phone_number: form.phone_number,
            password: form.password,
            img: form.img,
          }),
          credentials: "include",
        });
        const data = await res.json();

        if (res.status === 409 || data.message === "User already exists" || data.message === "User with this phone number already exists") {
          sessionStorage.setItem("autoFillLogin", JSON.stringify({
            phone_number: form.phone_number,
            password: form.password,
            message: "An account with this phone number already exists. We've redirected you to the Login page with your credentials pre-filled. Simply click \"লগইন\" to access your account."
          }));
          toast.info("Account already exists. Redirecting to login...", {
            position: "top-center",
          });
          router.push("/login");
          return;
        }

        if (!res.ok) {
          setError(data.message || "Something went wrong");
          return;
        }
        
        if (data.isVerified) {
          toast.success("Registration successful! Logging you in...", {
            position: "top-right",
          });
          
          try {
            const loginRes = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                email: `${form.phone_number}@gmail.com`, 
                password: form.password,
                ...getClientTrackingData()
              }),
              credentials: "include",
            });
            const loginData = await loginRes.json();
            if (loginRes.ok && loginData.token) {
              localStorage.setItem("auth_token", loginData.token);
              router.push("/");
              router.refresh();
              return;
            }
          } catch (e) {
            console.error("Auto-login failed:", e);
            router.push("/login");
          }
        } else {
          toast.success("Registration pending! Please verify your OTP from the admin.", {
            position: "top-right",
          });
          
          // Cache registration details for auto-login after verification
          sessionStorage.setItem("pendingRegistration", JSON.stringify({
            phone_number: form.phone_number,
            password: form.password
          }));
          
          // Pass the phone number to the verify page via query params so they don't have to re-type it
          router.push(`/verify-admin-otp?phone=${form.phone_number}`);
        }
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/20 p-8 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center ">
        {type === "register" ? "অ্যাকাউন্ট তৈরি করুন" : "লগইন করুন"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {type === "register" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">নাম</label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">ফোন নম্বর</label>
          <Input
            type="tel"
            value={form.phone_number}
            onChange={handlePhoneChange}
            placeholder="017xxxxxxxx"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">পাসওয়ার্ড</label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !form.phone_number || !form.password}
        >
          {loading
            ? <SpinnerCustom />
            : type === "register"
              ? "তৈরি করুন"
              : "লগইন"}
        </Button>
      </form>

      <div className="mt-6  text-center text-sm">
        {type === "register" ? (
          <p className="text-gray-400">
            ইতোমধ্যে একটি অ্যাকাউন্ট আছে?{" "}
            <a href="/login" className="text-white hover:underline">
              লগইন
            </a>
          </p>
        ) : (
          <>
            <p className="mb-2 text-gray-400">
              অ্যাকাউন্ট নেই?{" "}
              <a href="/register" className="text-white hover:underline">
                অ্যাকাউন্ট তৈরি করুন
              </a>
            </p>
            {/* <a
              href="/forgot-password"
              className="text-white hover:underline"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </a> */}
            <a
              href="/auth/email-login"
              className="text-white hover:underline"
            >
              ইমেইল লগইন
            </a>
          </>
        )}
      </div>
    </div>
  );
}
