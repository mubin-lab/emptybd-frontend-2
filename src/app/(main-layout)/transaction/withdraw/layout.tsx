import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Withdraw | EmptyBD",
  description: "EmptyBD এর Withdraw পেজে স্বাগতম।",
  keywords: ["Withdraw","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Withdraw | EmptyBD",
    description: "EmptyBD এর Withdraw পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
