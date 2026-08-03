"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "sonner";
import { SpinnerCustom } from "./loading/Spinner";
import { getClientTrackingData } from "@/lib/tracking";

export default function EmailLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: form.email, 
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
      toast.success("Login successful!");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/20 p-8 rounded-xl shadow-md w-full max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Email Login
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@gmail.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
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
          disabled={loading || !form.email || !form.password}
        >
          {loading ? <SpinnerCustom /> : "Login"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="mb-2">
          Prefer using phone number?{" "}
          <a href="/login" className="text-gray-400 hover:underline">
            Login with Phone
          </a>
        </p>
      </div>
    </div>
  );
}
