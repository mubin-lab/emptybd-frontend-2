"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuthStore } from "@/lib/store/authStore";
import { usePathname } from "next/navigation";

export default function GuestOnboardingTour() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // If user is logged in, clear the session storage so they can see the guest tour again next time they log out.
    if (user) {
      sessionStorage.removeItem("guestOnboardingCompleted");
      return;
    }

    // Only run for guests, and only on the Home page (where Tutorial button exists)
    if (!user && pathname === "/") {
      const hasCompletedGuestOnboarding = sessionStorage.getItem("guestOnboardingCompleted");
      
      if (!hasCompletedGuestOnboarding) {
        // Delay slightly to ensure UI is fully rendered
        const timer = setTimeout(() => {
          const isMobile = window.innerWidth < 768;

          const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            overlayColor: "rgba(0, 0, 0, 0.75)",
            nextBtnText: "পরবর্তী",
            prevBtnText: "পূর্ববর্তী",
            doneBtnText: "শেষ করুন (Finish)",
            onDestroyStarted: () => {
              // Save state immediately if user force closes or finishes
              if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
                sessionStorage.setItem("guestOnboardingCompleted", "true");
                driverObj.destroy();
              }
            },
            steps: [
              // {
              //   element: "#tour-guest-login",
              //   popover: {
              //     title: "🔐 লগইন",
              //     description: "আপনার যদি ইতোমধ্যে একটি EmptyBD অ্যাকাউন্ট থাকে, তাহলে Login বাটনে ক্লিক করুন।\n\nলগইন করার পর আপনি মেসেজ, নোটিফিকেশন, নিলাম, পোস্ট, কেনাকাটা এবং অন্যান্য সকল ফিচার ব্যবহার করতে পারবেন।",
              //     side: "bottom",
              //     align: isMobile ? "center" : "start"
              //   }
              // },
              {
                element: "#tour-guest-register",
                popover: {
                  title: "📝 রেজিস্টার",
                  description: "যদি আপনার এখনও কোনো EmptyBD অ্যাকাউন্ট না থাকে, তাহলে Register বাটনে ক্লিক করে খুব সহজেই একটি নতুন অ্যাকাউন্ট তৈরি করতে পারবেন।\n\nরেজিস্ট্রেশন সম্পন্ন করার পর আপনি EmptyBD-এর সকল সুবিধা ব্যবহার করতে পারবেন।",
                  side: "bottom",
                  align: isMobile ? "center" : "start"
                }
              },
              // {
              //   element: "#tour-guest-tutorial",
              //   popover: {
              //     title: "🎥 টিউটোরিয়াল",
              //     description: "EmptyBD কীভাবে ব্যবহার করবেন, কীভাবে অ্যাকাউন্ট তৈরি করবেন এবং বিভিন্ন ফিচার কীভাবে কাজ করে তা জানতে এই টিউটোরিয়াল দেখে নিতে পারেন।\n\nনতুন ব্যবহারকারীদের জন্য এটি দেখার পরামর্শ দেওয়া হচ্ছে।",
              //     side: "bottom",
              //     align: isMobile ? "center" : "end",
              //     onNextClick: () => {
              //       sessionStorage.setItem("guestOnboardingCompleted", "true");
              //       driverObj.destroy();
              //     }
              //   }
              // }
            ]
          });

          // Ensure our premium custom CSS for driver UI is added
          const styleId = 'driver-custom-styles';
          if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
              .driver-popover {
                background-color: #111827 !important;
                color: white !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 16px !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                font-family: inherit !important;
                padding: 20px !important;
                max-width: 350px !important;
              }
              .driver-popover-title {
                font-size: 1.25rem !important;
                font-weight: 700 !important;
                color: #f3f4f6 !important;
                margin-bottom: 12px !important;
                font-family: 'Inter', sans-serif !important;
              }
              .driver-popover-description {
                font-size: 0.95rem !important;
                line-height: 1.6 !important;
                color: #9ca3af !important;
                white-space: pre-wrap !important;
                font-family: 'Inter', sans-serif !important;
              }
              .driver-popover-footer {
                margin-top: 20px !important;
              }
              .driver-popover-progress-text {
                color: #6b7280 !important;
              }
              .driver-popover-btn-next, .driver-popover-btn-prev {
                border-radius: 8px !important;
                font-weight: 600 !important;
                padding: 8px 16px !important;
                transition: all 0.2s !important;
                text-shadow: none !important;
              }
              .driver-popover-btn-next {
                background-color: #2563eb !important;
                color: white !important;
                border: none !important;
              }
              .driver-popover-btn-next:hover {
                background-color: #1d4ed8 !important;
              }
              .driver-popover-btn-prev {
                background-color: transparent !important;
                color: #9ca3af !important;
                border: 1px solid #374151 !important;
              }
              .driver-popover-btn-prev:hover {
                background-color: #1f2937 !important;
                color: white !important;
              }
            `;
            document.head.appendChild(style);
          }

          driverObj.drive();
        }, 1000); // Wait 1 second for layout to stabilize
        
        return () => clearTimeout(timer);
      }
    }
  }, [mounted, user, pathname]);

  return null;
}
