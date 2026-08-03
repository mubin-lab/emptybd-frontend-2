import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cart | EmptyBD",
  description: "EmptyBD এর Cart পেজে স্বাগতম।",
  keywords: ["Cart","EmptyBD"],
  openGraph: {
    title: "Cart | EmptyBD",
    description: "EmptyBD এর Cart পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
