import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Bided | EmptyBD",
  description: "EmptyBD এর My Bided পেজে স্বাগতম।",
  keywords: ["My Bided","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "My Bided | EmptyBD",
    description: "EmptyBD এর My Bided পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
