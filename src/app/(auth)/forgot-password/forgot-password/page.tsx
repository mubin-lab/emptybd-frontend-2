/* eslint-disable react-hooks/rules-of-hooks */
"use client";
// src/pages/page.jsx
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

const page = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/forgot-password`,
        { email },
      );
      setMessage(res.data.message);

      setTimeout(() => {
        router.push(
          `/forgot-password/reset-password?email=${encodeURIComponent(email)}`,
        );
      }, 1500);
    } catch (err) {
      setError("Something went wrong");
    //   setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/20 p-8 rounded-lg shadow-lg w-full max-w-md">
      {/* <img
              className="w-[35%] mx-auto"
              src="/betopia_logo_black.png"
              alt="betopia_logo_black"
            /> */}
      <h2 className="text-2xl font-medium text-center mb-6">Forgot Password</h2>

      {message && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your.email@example.com"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-700"}`}
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>

      <p className="text-center mt-4 ">
        Remember your password?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-gray-400 hover:underline"
        >
          Login
        </button>
      </p>
    </div>
  );
};

export default page;
