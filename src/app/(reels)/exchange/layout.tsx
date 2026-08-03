import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "রিলস - শর্ট ভিডিও",
  description: "EmptyBD-এর শর্ট ভিডিও এবং রিলস উপভোগ করুন। বিনোদন এবং পণ্যের প্রোমোশন।",
  keywords: ["রিলস","শর্ট ভিডিও","ভিডিও"],
  openGraph: {
    title: "রিলস - শর্ট ভিডিও",
    description: "EmptyBD-এর শর্ট ভিডিও এবং রিলস উপভোগ করুন। বিনোদন এবং পণ্যের প্রোমোশন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
