import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification | EmptyBD",
  description: "EmptyBD এর Notification পেজে স্বাগতম।",
  keywords: ["Notification","EmptyBD"],
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Notification | EmptyBD",
    description: "EmptyBD এর Notification পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
