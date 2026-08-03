import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms Of Service | EmptyBD",
  description: "EmptyBD এর Terms Of Service পেজে স্বাগতম।",
  keywords: ["Terms Of Service","EmptyBD"],
  openGraph: {
    title: "Terms Of Service | EmptyBD",
    description: "EmptyBD এর Terms Of Service পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
