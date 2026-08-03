import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | EmptyBD",
  description: "EmptyBD এর Profile পেজে স্বাগতম।",
  keywords: ["Profile","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Profile | EmptyBD",
    description: "EmptyBD এর Profile পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
