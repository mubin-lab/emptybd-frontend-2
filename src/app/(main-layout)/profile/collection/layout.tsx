import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Collection | EmptyBD",
  description: "EmptyBD এর Collection পেজে স্বাগতম।",
  keywords: ["Collection","EmptyBD"],
  openGraph: {
    title: "Collection | EmptyBD",
    description: "EmptyBD এর Collection পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
