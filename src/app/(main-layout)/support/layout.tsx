import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "সহায়তা ডেস্ক - Help & Support | EmptyBD",
  description: "নিলাম, অর্ডার, এবং ওয়ালেট সম্পর্কিত যেকোনো সমস্যার জন্য আমাদের সহায়তা দলের সাথে যোগাযোগ করুন।",
  keywords: ["সহায়তা", "সাপোর্ট", "টিকিট", "কমিউনিকেশন"],
  openGraph: {
    title: "সহায়তা ডেস্ক - Help & Support",
    description: "নিলাম, অর্ডার, এবং ওয়ালেট সম্পর্কিত যেকোনো সমস্যার জন্য আমাদের সহায়তা দলের সাথে যোগাযোগ করুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
