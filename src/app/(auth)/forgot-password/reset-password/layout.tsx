import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Reset Password | EmptyBD",
  description: "EmptyBD এর Reset Password পেজে স্বাগতম।",
  keywords: ["Reset Password","EmptyBD"],
  openGraph: {
    title: "Reset Password | EmptyBD",
    description: "EmptyBD এর Reset Password পেজে স্বাগতম।",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
