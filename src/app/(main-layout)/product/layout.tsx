import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Product | EmptyBD",
  description: "EmptyBD এর Product পেজে স্বাগতম।",
  keywords: ["Product","EmptyBD"],
  openGraph: {
    title: "Product | EmptyBD",
    description: "EmptyBD এর Product পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
