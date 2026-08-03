import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "খবর ও আপডেট",
  description: "EmptyBD এবং বাজারের সর্বশেষ খবর, আপডেট এবং ট্রেন্ড সম্পর্কে জানুন।",
  keywords: ["খবর","আপডেট","মার্কেট নিউজ"],
  openGraph: {
    title: "খবর ও আপডেট",
    description: "EmptyBD এবং বাজারের সর্বশেষ খবর, আপডেট এবং ট্রেন্ড সম্পর্কে জানুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
