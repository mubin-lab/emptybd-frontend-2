import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "লগইন - আপনার অ্যাকাউন্টে প্রবেশ করুন",
  description: "আপনার EmptyBD অ্যাকাউন্টে সাইন ইন করুন এবং নিলাম, শপিং এবং ওয়ালেট পরিচালনা শুরু করুন।",
  keywords: ["লগইন","সাইন ইন","অ্যাকাউন্ট","ব্যবহারকারী লগইন"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "লগইন - আপনার অ্যাকাউন্টে প্রবেশ করুন",
    description: "আপনার EmptyBD অ্যাকাউন্টে সাইন ইন করুন এবং নিলাম, শপিং এবং ওয়ালেট পরিচালনা শুরু করুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
