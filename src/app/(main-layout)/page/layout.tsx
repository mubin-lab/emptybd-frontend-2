import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page | EmptyBD",
  description: "EmptyBD এর Page পেজে স্বাগতম।",
  keywords: ["Page","EmptyBD"],
  openGraph: {
    title: "Page | EmptyBD",
    description: "EmptyBD এর Page পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
