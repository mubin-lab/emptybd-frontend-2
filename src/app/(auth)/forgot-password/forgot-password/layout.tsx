import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Forgot Password | EmptyBD",
  description: "EmptyBD এর Forgot Password পেজে স্বাগতম।",
  keywords: ["Forgot Password","EmptyBD"],
  openGraph: {
    title: "Forgot Password | EmptyBD",
    description: "EmptyBD এর Forgot Password পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
