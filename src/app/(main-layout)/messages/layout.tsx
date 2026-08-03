import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "মেসেজ",
  description: "বিক্রেতা এবং ক্রেতাদের সাথে সরাসরি যোগাযোগ করুন।",
  keywords: ["মেসেজ","চ্যাট","যোগাযোগ"],
  openGraph: {
    title: "মেসেজ",
    description: "বিক্রেতা এবং ক্রেতাদের সাথে সরাসরি যোগাযোগ করুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
