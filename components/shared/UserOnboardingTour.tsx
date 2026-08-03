"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import { useAuthStore } from "@/lib/store/authStore";
import { usePathname, useRouter } from "next/navigation";

export default function UserOnboardingTour() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    const hasCompletedOnboarding = localStorage.getItem("emptybdOnboardingCompleted");
    
    // Make sure we only start if they haven't completed it, AND they are on the home page 
    // so the + News button is visible for the final step.
    if (!hasCompletedOnboarding && pathname === "/") {
      
      // Delay slightly to ensure UI is fully rendered (especially the dynamic + News button)
      const timer = setTimeout(() => {
        const isMobile = window.innerWidth < 768;

        const driverObj = driver({
          showProgress: true,
          animate: true,
          allowClose: false,
          overlayColor: "rgba(0, 0, 0, 0.75)",
          nextBtnText: "Next",
          prevBtnText: "Previous",
          doneBtnText: "Finish",
          onDestroyStarted: () => {
            // Save state immediately if user force closes or finishes
            if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
              localStorage.setItem("emptybdOnboardingCompleted", "true");
              driverObj.destroy();
            }
          },
          steps: [
            // {
            //   element: isMobile ? "#tour-home-mobile" : "#tour-home",
            //   popover: {
            //     title: "🏠 হোম",
            //     description: "এটি আপনার হোম পেজ। এখানে EmptyBD-এর নতুন আপডেট, পোস্ট, ট্রেন্ডিং নিলাম, গুরুত্বপূর্ণ তথ্য এবং বিভিন্ন কার্যক্রম দেখতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: isMobile ? "#tour-with-video-mobile" : "#tour-with-video",
            //   popover: {
            //     title: "🎬 রিলস",
            //     description: "এখানে ছোট ছোট ভিডিও দেখতে পারবেন। আপনি ভিডিওতে লাইক, কমেন্ট এবং শেয়ারও করতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: isMobile ? "#tour-digital-exchange-mobile" : "#tour-digital-exchange",
            //   popover: {
            //     title: "🔄 এক্সচেঞ্জ",
            //     description: "এই সেকশন থেকে বিভিন্ন আইটেম একে অপরের সাথে এক্সচেঞ্জ করতে পারবেন এবং নতুন অফার দেখতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: isMobile ? "#tour-bid-mobile" : "#tour-bid",
            //   popover: {
            //     title: "🏷️ নিলাম",
            //     description: "এখানে চলমান সকল নিলাম দেখতে পারবেন। আপনি যেকোনো নিলামে অংশগ্রহণ করতে পারবেন এবং নিজের পছন্দের পণ্যের জন্য নিলাম করতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: isMobile ? "#tour-e-commerce-products-mobile" : "#tour-e-commerce-products",
            //   popover: {
            //     title: "🛒 ই-শপ",
            //     description: "এখানে সরাসরি বিভিন্ন পণ্য কিনতে পারবেন এবং নতুন প্রোডাক্ট ব্রাউজ করতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: isMobile ? "#tour-profile-mobile" : "#tour-profile",
            //   popover: {
            //     title: "👤 প্রোফাইল",
            //     description: "এখানে আপনার ব্যক্তিগত তথ্য, অর্ডার, সেটিংস, অ্যাকাউন্ট এবং অন্যান্য অপশনগুলো পরিচালনা করতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            {
              element: "#tour-messenger",
              popover: {
                title: "💬 মেসেঞ্জার",
                description: "এখানে অন্যান্য ব্যবহারকারীদের সাথে সরাসরি চ্যাট করতে পারবেন। নতুন মেসেজ এলে এখানেই দেখতে পারবেন।",
                side: "bottom",
                align: isMobile ? "center" : "start"
              }
            },
            // {
            //   element: "#tour-notification",
            //   popover: {
            //     title: "🔔 নোটিফিকেশন",
            //     description: "আপনার অ্যাকাউন্ট সম্পর্কিত সকল গুরুত্বপূর্ণ নোটিফিকেশন এখানে পাবেন, যেমন নিলাম আপডেট, অর্ডার, অ্যাডমিন নোটিশ এবং অন্যান্য তথ্য।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start"
            //   }
            // },
            // {
            //   element: "#tour-wallet",
            //   popover: {
            //     title: "💰 ওয়ালেট ব্যালেন্স",
            //     description: "এখানে আপনার বর্তমান ওয়ালেট ব্যালেন্স দেখতে পারবেন। ভবিষ্যতে ডিপোজিট, উত্তোলন এবং লেনদেনও এখান থেকে পরিচালনা করতে পারবেন।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "end"
            //   }
            // },
            // {
            //   element: "#tour-news-button",
            //   popover: {
            //     title: "📰 নিউজ পোস্ট করুন",
            //     description: "এই বাটনে ক্লিক করে আপনি নিজের নিউজ বা পোস্ট প্রকাশ করতে পারবেন। আপনার পোস্ট অন্যান্য ব্যবহারকারীরা দেখতে, লাইক করতে এবং মন্তব্য করতে পারবে।",
            //     side: "bottom",
            //     align: isMobile ? "center" : "start",
            //     onNextClick: () => {
            //       localStorage.setItem("emptybdOnboardingCompleted", "true");
            //       driverObj.destroy();
            //     }
            //   }
            // }
          ]
        });

        // Add some premium custom CSS globally for the driver UI just for our app
        const style = document.createElement('style');
        style.id = 'driver-custom-styles';
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
        if (!document.getElementById('driver-custom-styles')) {
          document.head.appendChild(style);
        }

        driverObj.drive();
      }, 1000); // Wait 1 second for layout to stabilize
      
      return () => clearTimeout(timer);
    }
  }, [mounted, user, pathname, router]);

  return null; // This component doesn't render any visible DOM itself
}
