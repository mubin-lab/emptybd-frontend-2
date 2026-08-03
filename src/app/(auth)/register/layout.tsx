import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নতুন অ্যাকাউন্ট তৈরি করুন",
  description: "EmptyBD-তে নতুন অ্যাকাউন্ট তৈরি করে নিলাম এবং ই-কমার্স এর সুবিধা উপভোগ করুন।",
  keywords: ["নিবন্ধন","অ্যাকাউন্ট তৈরি","সাইন আপ"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "নতুন অ্যাকাউন্ট তৈরি করুন",
    description: "EmptyBD-তে নতুন অ্যাকাউন্ট তৈরি করে নিলাম এবং ই-কমার্স এর সুবিধা উপভোগ করুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
