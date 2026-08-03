import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diposit | EmptyBD",
  description: "EmptyBD এর Diposit পেজে স্বাগতম।",
  keywords: ["Diposit","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Diposit | EmptyBD",
    description: "EmptyBD এর Diposit পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
