import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "ডিজিটাল এক্সচেঞ্জ",
  description: "EmptyBD ডিজিটাল এক্সচেঞ্জ এর মাধ্যমে ডিজিটাল পণ্য এবং সেবা বিনিময় করুন।",
  keywords: ["ডিজিটাল এক্সচেঞ্জ","ডিজিটাল পণ্য","বিনিময়"],
  openGraph: {
    title: "ডিজিটাল এক্সচেঞ্জ",
    description: "EmptyBD ডিজিটাল এক্সচেঞ্জ এর মাধ্যমে ডিজিটাল পণ্য এবং সেবা বিনিময় করুন।",
  },
};

export default function DigitalExchangeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
