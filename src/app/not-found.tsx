import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-6xl font-bold mb-4 font-orbitron">404</h1>
      <h2 className="text-2xl font-semibold mb-6 font-parkinsans">Page Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        We couldn't find the page you're looking for. It might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
