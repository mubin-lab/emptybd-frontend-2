import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ই-শপ - অনলাইনে পণ্য কিনুন",
  description: "EmptyBD থেকে হাজার হাজার পণ্য কিনুন। ইলেকট্রনিক্স, পোশাক, গৃহস্থালি এবং আরও অনেক কিছু। নিরাপদ পেমেন্ট এবং দ্রুত ডেলিভারি।",
  keywords: ["ই-শপ","অনলাইন শপিং","পণ্য কেনা","ইলেকট্রনিক্স","পোশাক","বাংলাদেশ শপিং"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "ই-শপ - অনলাইনে পণ্য কিনুন",
    description: "EmptyBD থেকে হাজার হাজার পণ্য কিনুন। ইলেকট্রনিক্স, পোশাক, গৃহস্থালি এবং আরও অনেক কিছু। নিরাপদ পেমেন্ট এবং দ্রুত ডেলিভারি।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
