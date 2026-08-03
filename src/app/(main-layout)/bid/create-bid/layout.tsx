import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "নিলাম এবং নিলাম",
  description: "EmptyBD-তে পণ্য নিলামে অংশ নিন এবং সেরা দামে পণ্য জিতুন।",
  keywords: ["নিলাম","নিলাম","পণ্য নিলাম","নিলাম"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "নিলাম এবং নিলাম",
    description: "EmptyBD-তে পণ্য নিলামে অংশ নিন এবং সেরা দামে পণ্য জিতুন।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
