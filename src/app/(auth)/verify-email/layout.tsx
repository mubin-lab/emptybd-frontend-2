import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Verify Email | EmptyBD",
  description: "EmptyBD এর Verify Email পেজে স্বাগতম।",
  keywords: ["Verify Email","EmptyBD"],
  openGraph: {
    title: "Verify Email | EmptyBD",
    description: "EmptyBD এর Verify Email পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
