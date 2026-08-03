"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const VerifyEmailPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_NODE_API_URL}/auth/verify-email?token=${token}`,
        );
        const data = await res.json();

        if (!res.ok) {
          setStatus("error");
          setMessage(data.message || "Verification failed");
        } else {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Something went wrong");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-black/30 p-6 rounded-lg shadow-md text-center">
        {status === "loading" && (
          <p className="text-gray-600 text-lg">Verifying your email...</p>
        )}

        {status === "success" && (
          <>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              Email Verified 🎉
            </h2>
            <p className="text-gray-400 mb-4">{message}</p>
            <a
              href="/login"
              className="inline-block bg-black rounded-md text-white px-6 py-2 hover:bg-orange-600"
            >
              Go to Login
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-700">{message}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
