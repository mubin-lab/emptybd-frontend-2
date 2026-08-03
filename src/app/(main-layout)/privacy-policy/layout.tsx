import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EmptyBD",
  description: "EmptyBD এর Privacy Policy পেজে স্বাগতম।",
  keywords: ["Privacy Policy","EmptyBD"],
  openGraph: {
    title: "Privacy Policy | EmptyBD",
    description: "EmptyBD এর Privacy Policy পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
