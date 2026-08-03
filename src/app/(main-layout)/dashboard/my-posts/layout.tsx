import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ড্যাশবোর্ড - আপনার প্রোফাইল ও কার্যক্রম",
  description: "আপনার EmptyBD ড্যাশবোর্ড থেকে অর্ডার, নিলাম, ওয়ালেট এবং অন্যান্য কার্যক্রম পরিচালনা করুন।",
  keywords: ["ড্যাশবোর্ড","প্রোফাইল","আমার কার্যক্রম"],
  openGraph: {
    title: "ড্যাশবোর্ড - আপনার প্রোফাইল ও কার্যক্রম",
    description: "আপনার EmptyBD ড্যাশবোর্ড থেকে অর্ডার, নিলাম, ওয়ালেট এবং অন্যান্য কার্যক্রম পরিচালনা করুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
