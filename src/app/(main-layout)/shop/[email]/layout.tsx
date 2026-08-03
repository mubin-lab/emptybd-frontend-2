import { Metadata } from 'next';

type Props = {
  params: Promise<{ email: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { email: emailParam } = await params;
    const email = decodeURIComponent(emailParam);
    const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/public/${encodeURIComponent(email)}`);
    
    if (!res.ok) {
      return {
        title: 'স্টোরফ্রন্ট পাওয়া যায়নি | EmptyBD',
      };
    }

    const { user } = await res.json();
    
    return {
      title: `${user.name} এর স্টোরফ্রন্ট | EmptyBD`,
      description: user.bio ? user.bio.substring(0, 160) : `EmptyBD-তে ${user.name} এর স্টোরফ্রন্ট দেখুন - বাংলাদেশের শীর্ষস্থানীয় অনলাইন নিলাম এবং ই-কমার্স প্ল্যাটফর্ম।`,
      openGraph: {
        title: `${user.name} এর স্টোরফ্রন্ট | EmptyBD`,
        description: user.bio ? user.bio.substring(0, 160) : `EmptyBD-তে ${user.name} এর স্টোরফ্রন্ট দেখুন।`,
        images: user.img ? [{ url: user.img }] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'স্টোরফ্রন্ট | EmptyBD',
    };
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
