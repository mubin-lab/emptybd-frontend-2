// components/Footer.tsx
import Link from "next/link";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6 mt-5">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-xs lg:text-sm">&copy; {new Date().getFullYear()} EmptyBD. All rights reserved.</p>
        <div className="flex flex-wrap gap-3 md:gap-4 mt-2 md:mt-0 justify-center">
          <Link href="/about-us" className="text-gray-400 hover:text-white text-xs lg:text-sm">
            About Us
          </Link>
          <Link href="/contact-us" className="text-gray-400 hover:text-white text-xs lg:text-sm">
            Contact Us
          </Link>
          <Link href="/privacy-policy" className="text-gray-400 hover:text-white text-xs lg:text-sm">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-gray-400 hover:text-white text-xs lg:text-sm">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
