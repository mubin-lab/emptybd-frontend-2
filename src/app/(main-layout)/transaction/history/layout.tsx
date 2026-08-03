import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "History | EmptyBD",
  description: "EmptyBD এর History পেজে স্বাগতম।",
  keywords: ["History","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "History | EmptyBD",
    description: "EmptyBD এর History পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
